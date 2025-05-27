from langgraph.graph import StateGraph
from typing import TypedDict
from firebase_admin import db
import uuid
import google.generativeai as genai
import os

# Configure Gemini API
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
model = genai.GenerativeModel('gemini-2.0-flash')

# Define shared state
class TaskState(TypedDict):
    disaster_id: str
    disaster_data: dict
    generated_task: dict

# Tool: Fetch disaster data
def fetch_disaster_data(state: TaskState) -> TaskState:
    ref = db.reference('disasters')
    data = ref.child(state['disaster_id']).get()
    if not data:
        raise ValueError("Disaster data not found")
    return {"disaster_data": data, "disaster_id": state['disaster_id']}

# Tool: Generate task from disaster data using Gemini
def generate_task(state: TaskState) -> TaskState:
    data = state['disaster_data']
    urgency = data.get("urgency_level", "minimal")
    situation = data.get("situation", "")
    people = data.get("people_count", "")
    emergency_type = data.get("emergency_type", "")
    latitude = data.get("latitude", "")
    longitude = data.get("longitude", "")

    if urgency == "urgent":
        roles = ["vol", "fr"]
    elif urgency == "medium":
        roles = ["fr"]
    else:
        roles = ["vol"]

    # Prompt the AI to choose appropriate aid based on the context
    prompt = f"""
    A disaster has occurred with the following details. Based on this information, generate a short emergency response task. 
    The task should be direct (1–2 sentences), focused on saving lives or delivering aid, and should suggest the most relevant types of aid.

    Emergency Type: {emergency_type}
    Urgency: {urgency}
    Coordinates: Latitude {latitude}, Longitude {longitude}
    People Affected: {people}
    Situation: {situation}

    Example output: "Rescue {people} people affected by {emergency_type} at coordinates ({latitude}, {longitude}). Provide immediate shelter and water."
    """

    try:
        response = model.generate_content(prompt)
        ai_generated_description = response.text.strip()

        if not ai_generated_description:
            raise ValueError("Empty response from Gemini")

        task_id = str(uuid.uuid4())
        task = {
            "task_id": task_id,
            "description": ai_generated_description,
            "status": "pending",
            "complete_by": "",
            "roles": roles,
            "emergency_type": emergency_type,
            "urgency_level": urgency,
            "latitude": latitude,
            "longitude": longitude,
            "people_count": people
        }

        return {"generated_task": task, **state}

    except Exception:
        # Fallback with coordinates
        fallback_description = (
            f"Rescue {people} people affected by {emergency_type} at coordinates "
            f"({latitude}, {longitude}). Situation: {situation}"
        )
        task_id = str(uuid.uuid4())
        task = {
            "task_id": task_id,
            "description": fallback_description,
            "status": "pending",
            "complete_by": "",
            "roles": roles,
            "emergency_type": emergency_type,
            "urgency_level": urgency,
            "latitude": latitude,
            "longitude": longitude,
            "people_count": people
        }

        return {"generated_task": task, **state}


# Tool: Save task to Firebase
def save_task(state: TaskState) -> TaskState:
    ref = db.reference(f"tasks/{state['disaster_id']}")
    ref.child(state['generated_task']['task_id']).set(state['generated_task'])
    return state

# Function to create and return the LangGraph
def create_generate_disaster_task_graph():
    graph = StateGraph(TaskState)
    graph.add_node("fetch", fetch_disaster_data)
    graph.add_node("generate", generate_task)
    graph.add_node("save", save_task)

    graph.set_entry_point("fetch")
    graph.add_edge("fetch", "generate")
    graph.add_edge("generate", "save")
    graph.set_finish_point("save")

    return graph.compile()
