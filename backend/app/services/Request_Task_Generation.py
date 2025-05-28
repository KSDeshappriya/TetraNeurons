from langgraph.graph import StateGraph
from typing import TypedDict
from firebase_admin import db, firestore
import uuid
import google.generativeai as genai
import os
import math
import time

# Configure Gemini API
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
model = genai.GenerativeModel('gemini-2.0-flash')

# Define shared state
class EmergencyRequestState(TypedDict):
    disaster_id: str
    user_id: str
    help: str
    urgency_type: str
    latitude: str
    longitude: str
    emergency_type: str
    nearby_resources: list
    generated_task: dict
    user_request_data: dict

# Tool: Fetch disaster emergency type
def fetch_disaster_type(state: EmergencyRequestState) -> EmergencyRequestState:
    ref = db.reference('disasters')
    data = ref.child(state['disaster_id']).get()
    if not data:
        raise ValueError("Disaster data not found")
    
    emergency_type = data.get("emergency_type", "general emergency")
    return {**state, "emergency_type": emergency_type}

# Tool: Fetch nearby resources from Firestore
def fetch_nearby_resources(state: EmergencyRequestState) -> EmergencyRequestState:
    dbb = firestore.client()
    
    try:
        # Get all resources for this disaster
        resources_ref = dbb.collection("resources").document(state['disaster_id']).collection("items")
        resources = resources_ref.stream()
        
        nearby_resources = []
        user_lat = float(state['latitude'])
        user_lon = float(state['longitude'])
        
        for resource in resources:
            resource_data = resource.to_dict()
            if resource_data.get('latitude') and resource_data.get('longitude'):
                resource_lat = float(resource_data['latitude'])
                resource_lon = float(resource_data['longitude'])
                
                # Calculate distance (simple euclidean distance for nearby check)
                distance = math.sqrt((user_lat - resource_lat)**2 + (user_lon - resource_lon)**2)
                
                # Add distance info to resource data
                resource_data['distance'] = distance
                resource_data['resource_id'] = resource.id
                nearby_resources.append(resource_data)
        
        # Sort by distance and take closest ones
        nearby_resources.sort(key=lambda x: x.get('distance', float('inf')))
        
        return {**state, "nearby_resources": nearby_resources[:5]}  # Top 5 closest
        
    except Exception as e:
        print(f"Error fetching resources: {e}")
        return {**state, "nearby_resources": []}

# Tool: Generate task using AI
def generate_emergency_task(state: EmergencyRequestState) -> EmergencyRequestState:
    help_needed = state['help']
    urgency = state['urgency_type']
    emergency_type = state['emergency_type']
    latitude = state['latitude']
    longitude = state['longitude']
    nearby_resources = state['nearby_resources']
    
    # Convert urgency type
    if urgency == "moderate":
        urgency = "medium"
    
    # Determine roles based on urgency
    if urgency == "high":
        roles = ["vol", "fr"]
    elif urgency == "medium":
        roles = ["fr"]
    else:
        roles = ["vol"]
    
    # Prepare resource information for AI
    resource_info = ""
    if nearby_resources:
        resource_info = "Nearby available resources:\n"
        for resource in nearby_resources[:3]:  # Top 3 closest
            resource_info += f"- {resource.get('name', 'Unknown')}: {resource.get('type', 'general')} at ({resource.get('latitude')}, {resource.get('longitude')})\n"
            resource_info += f"  Description: {resource.get('description', 'No description')}\n"
            resource_info += f"  Contact: {resource.get('contact', 'No contact')}\n"
            resource_info += f"  Status: {resource.get('status', 'unknown')}\n\n"
    
    prompt = f"""
        An emergency request has been received that requires first responder and volunteer action. Generate a short, direct task (maximum 2 sentences) for emergency responders and volunteers to address this situation.

        Emergency Type: {emergency_type}
        Help Needed: {help_needed}
        Urgency: {urgency}
        Location: ({latitude}, {longitude})

        {resource_info}

        Generate a task that tells responders/volunteers what action to take to help this person. If there are suitable nearby resources, include instructions to utilize or coordinate with them.
        Focus on what the responders should DO, not what the person in need should do.

        Example: "Deploy rescue team to assist person needing medical help at coordinates (6.9271, 79.8612). Coordinate with nearby Downtown Medical Center for immediate transport."
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
            "help_needed": help_needed,
            "user_id": state['user_id']
        }
        
        return {**state, "generated_task": task}
        
    except Exception as e:
        print(f"Error generating task: {e}")
        # Fallback task
        fallback_description = f"Assist person needing {help_needed} at location ({latitude}, {longitude})."
        if nearby_resources:
            closest_resource = nearby_resources[0]
            fallback_description += f" Direct to {closest_resource.get('name', 'nearby resource')} for assistance."
        
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
            "help_needed": help_needed,
            "user_id": state['user_id']
        }
        
        return {**state, "generated_task": task}

# Tool: Save task to Firebase Realtime Database
def save_task_to_db(state: EmergencyRequestState) -> EmergencyRequestState:
    ref = db.reference(f"tasks/{state['disaster_id']}")
    ref.child(state['generated_task']['task_id']).set(state['generated_task'])
    return state

# Tool: Save user request to Firebase Realtime Database
def save_user_request(state: EmergencyRequestState) -> EmergencyRequestState:
    user_request_data = {
        "disaster_id": state['disaster_id'],
        "help": state['help'],
        "urgency_type": state['urgency_type'],
        "latitude": state['latitude'],
        "longitude": state['longitude'],
        "emergency_type": state['emergency_type'],
        "task_id": state['generated_task']['task_id'],
        "status": "submitted",
        "feedback": None,
        "timestamp": int(time.time() * 1000)
    }
    
    # Save to /userrequest/{user_id}/
    ref = db.reference(f"userrequest/{state['user_id']}")
    ref.set(user_request_data)
    
    return {**state, "user_request_data": user_request_data}

# Function to create and return the LangGraph
def create_emergency_request_graph():
    graph = StateGraph(EmergencyRequestState)
    
    graph.add_node("fetch_disaster", fetch_disaster_type)
    graph.add_node("fetch_resources", fetch_nearby_resources)
    graph.add_node("generate_task", generate_emergency_task)
    graph.add_node("save_task", save_task_to_db)
    graph.add_node("save_request", save_user_request)
    
    graph.set_entry_point("fetch_disaster")
    graph.add_edge("fetch_disaster", "fetch_resources")
    graph.add_edge("fetch_resources", "generate_task")
    graph.add_edge("generate_task", "save_task")
    graph.add_edge("save_task", "save_request")
    graph.set_finish_point("save_request")
    
    return graph.compile()

# Function to process emergency request
async def process_emergency_request(disaster_id: str, user_id: str, help: str, urgency_type: str, latitude: str, longitude: str):
    graph = create_emergency_request_graph()
    
    initial_state = EmergencyRequestState(
        disaster_id=disaster_id,
        user_id=user_id,
        help=help,
        urgency_type=urgency_type,
        latitude=latitude,
        longitude=longitude,
        emergency_type="",
        nearby_resources=[],
        generated_task={},
        user_request_data={}
    )
    
    result = await graph.ainvoke(initial_state)
    return result