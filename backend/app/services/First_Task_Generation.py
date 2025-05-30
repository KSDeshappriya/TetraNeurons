from langgraph.graph import StateGraph
from typing import TypedDict
from firebase_admin import db
import uuid
import google.generativeai as genai
import os
import json

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

# Tool: Generate task from disaster data using Gemini with AI-driven role assignment
def generate_task(state: TaskState) -> TaskState:
    data = state['disaster_data']
    urgency = data.get("urgency_level", "minimal")
    situation = data.get("situation", "")
    people = data.get("people_count", "")
    emergency_type = data.get("emergency_type", "")
    latitude = data.get("latitude", "")
    longitude = data.get("longitude", "")

    # Enhanced prompt for AI-driven role assignment and task generation
    prompt = f"""
    You are an emergency response coordinator AI. Analyze the following disaster situation and generate both an appropriate emergency response task AND determine which responder roles are needed.

    DISASTER DETAILS:
    Emergency Type: {emergency_type}
    Urgency Level: {urgency}
    Coordinates: Latitude {latitude}, Longitude {longitude}
    People Affected: {people}
    Situation Description: {situation}

    AVAILABLE RESPONDER ROLES - CHOOSE CAREFULLY:
    - "vol" (Volunteers ONLY): Community volunteers for basic needs, logistics, welfare checks, crowd management
    - "fr" (First Responders ONLY): Professional emergency responders, paramedics, firefighters, police, specialized rescue
    - "both" (BOTH Volunteers AND First Responders): For complex situations requiring both professional expertise AND community support

    CRITICAL ROLE ASSIGNMENT RULES:
    1. Use "both" when:
       - Mass casualty events (multiple deaths/serious injuries)
       - Large-scale disasters affecting many people severely
       - Complex emergencies requiring immediate professional response AND extensive community coordination
       - Situations needing ongoing rescue operations PLUS shelter/supply management
       - Major structural collapses, widespread fires, large-scale evacuations
       - Multiple simultaneous emergency needs across a wide area

    2. Use "fr" only when:
       - Medical emergencies, injuries, life-threatening situations
       - Technical rescues, fires, hazardous materials, structural safety
       - Security/police response needed
       - Specialized professional equipment/training required
       - Small-scale but high-risk situations

    3. Use "vol" only when:
       - Basic needs distribution: food, water, shelter setup
       - Welfare checks, social support, emotional assistance
       - Non-emergency logistics and coordination
       - Community organizing and information sharing
       - Simple cleanup or minor assistance

    4. INAPPROPRIATE SITUATIONS:
       - If situation description seems fake, test data, or inappropriate, assign "vol" with task focusing on "proper assessment and community guidance"

    COMPLEXITY INDICATORS FOR "both":
    - People count is high (50+ people or terms like "many", "hundreds", "community", "neighborhood")
    - Emergency type suggests widespread impact (earthquake, major flood, explosion, building collapse)
    - Urgency is high AND many people affected
    - Situation description mentions multiple simultaneous problems
    - Description includes words like "widespread", "major", "devastating", "mass", "multiple casualties"

    TASK: Generate a JSON response with the following structure:
    {{
        "description": "1-2 sentence direct emergency response task focused on saving lives and coordinating aid",
        "roles": "exactly one value: 'vol', 'fr', or 'both'",
        "reasoning": "Brief explanation of why this specific role assignment is needed for this emergency scale and complexity"
    }}

    TASK GENERATION RULES:
    - Focus on immediate life-saving actions and coordination
    - Be specific about what responders should do
    - Include location coordinates for deployment
    - Scale the response to match the disaster magnitude
    - For "both" assignments, mention coordination between volunteer and professional responders
    - For mass casualty/complex situations, emphasize triage, evacuation, and multi-team coordination

    REMEMBER: You must choose exactly ONE role value: "vol", "fr", or "both" - not an array!

    Respond ONLY with valid JSON.
    """

    try:
        response = model.generate_content(prompt)
        ai_response = response.text.strip()
        
        # Clean up the response to extract JSON
        if ai_response.startswith('```json'):
            ai_response = ai_response.replace('```json', '').replace('```', '').strip()
        elif ai_response.startswith('```'):
            ai_response = ai_response.replace('```', '').strip()
        
        # Parse AI response
        ai_data = json.loads(ai_response)
        
        ai_generated_description = ai_data.get("description", "").strip()
        ai_selected_role = ai_data.get("roles", "vol")
        
        # Handle role assignment - convert "both" to array format for database storage
        if ai_selected_role == "both":
            valid_roles = ["vol", "fr"]
        elif ai_selected_role in ["vol", "fr"]:
            valid_roles = [ai_selected_role]
        else:
            valid_roles = ["vol"]  # Default fallback

        if not ai_generated_description:
            raise ValueError("Empty description from Gemini")

        task_id = str(uuid.uuid4())
        task = {
            "task_id": task_id,
            "description": ai_generated_description,
            "status": "pending",
            "complete_by": "",
            "roles": valid_roles,
            "emergency_type": emergency_type,
            "urgency_level": urgency,
            "latitude": latitude,
            "longitude": longitude,
            "people_count": people,
            "ai_reasoning": ai_data.get("reasoning", "AI-determined role assignment")
        }

        return {"generated_task": task, **state}

    except Exception as e:
        print(f"Error with AI task generation: {e}")
        # Enhanced fallback with basic AI-driven logic
        try:
            # Simplified prompt for fallback
            fallback_prompt = f"""
            Emergency Type: {emergency_type}
            Urgency: {urgency}
            People Affected: {people}
            Situation: {situation}
            
            Choose role based on complexity and scale. Respond with JSON only:
            {{
                "description": "Emergency response task for {people} people affected by {emergency_type} at ({latitude}, {longitude})",
                "roles": "choose exactly one: 'vol' for basic needs, 'fr' for professional response, 'both' for complex large-scale emergencies"
            }}
            """
            
            fallback_response = model.generate_content(fallback_prompt)
            fallback_text = fallback_response.text.strip().replace('```json', '').replace('```', '')
            fallback_data = json.loads(fallback_text)
            
            role_choice = fallback_data.get("roles", "vol")
            if role_choice == "both":
                roles = ["vol", "fr"]
            elif role_choice in ["vol", "fr"]:
                roles = [role_choice]
            else:
                roles = ["vol"]
            
            description = fallback_data.get("description", f"Respond to {emergency_type} affecting {people} people at coordinates ({latitude}, {longitude}).")
            
        except:
            # Final rule-based fallback with improved logic for "both" scenarios
            situation_lower = situation.lower()
            emergency_lower = emergency_type.lower()
            
            # Check for mass casualty or complex situations needing both
            mass_casualty_keywords = ['many dead', 'multiple casualties', 'mass casualties', 'hundreds', 'thousands', 'devastating', 'widespread']
            complex_emergency_keywords = ['major', 'large-scale', 'widespread', 'multiple buildings', 'entire neighborhood', 'community-wide']
            
            has_mass_casualties = any(keyword in situation_lower for keyword in mass_casualty_keywords)
            is_complex_emergency = any(keyword in situation_lower for keyword in complex_emergency_keywords) or any(keyword in emergency_lower for keyword in complex_emergency_keywords)
            
            # Try to parse people count for scale assessment
            people_count_high = False
            try:
                if people and str(people).isdigit() and int(people) > 50:
                    people_count_high = True
                elif any(word in str(people).lower() for word in ['many', 'hundreds', 'thousands', 'community', 'neighborhood']):
                    people_count_high = True
            except:
                pass
            
            # Professional response indicators
            needs_professional = urgency in ["urgent", "high"] or emergency_lower in ["fire", "medical", "collapse", "rescue", "explosion", "gas leak", "hazmat"]
            
            # Determine role assignment with improved logic
            if (has_mass_casualties or is_complex_emergency or people_count_high) and needs_professional:
                roles = ["vol", "fr"]  # Both needed for complex large-scale emergencies
                description = f"Coordinate multi-team response to {emergency_type} affecting {people} people at ({latitude}, {longitude}). Establish professional rescue operations and volunteer support systems simultaneously."
            elif needs_professional:
                roles = ["fr"]  # Professional response needed
                description = f"Deploy professional emergency response to {emergency_type} at ({latitude}, {longitude}) affecting {people} people."
            else:
                roles = ["vol"]  # Basic volunteer support
                description = f"Provide community support and assistance for {emergency_type} situation affecting {people} people at ({latitude}, {longitude})."
            
            # Add situation context if available
            if situation and len(situation) > 10:
                description += f" Situation: {situation[:100]}..."
        
        task_id = str(uuid.uuid4())
        task = {
            "task_id": task_id,
            "description": description,
            "status": "pending",
            "complete_by": "",
            "roles": roles,
            "emergency_type": emergency_type,
            "urgency_level": urgency,
            "latitude": latitude,
            "longitude": longitude,
            "people_count": people,
            "ai_reasoning": "Enhanced fallback assignment considering scale and complexity"
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