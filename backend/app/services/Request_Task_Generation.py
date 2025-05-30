from langgraph.graph import StateGraph
from typing import TypedDict
from firebase_admin import db, firestore
import uuid
import google.generativeai as genai
import os
import math
import time
import json

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

# Tool: Generate task using AI with intelligent role assignment
def generate_emergency_task(state: EmergencyRequestState) -> EmergencyRequestState:
    help_needed = state['help']
    urgency = state['urgency_type']
    emergency_type = state['emergency_type']
    latitude = state['latitude']
    longitude = state['longitude']
    nearby_resources = state['nearby_resources']
    
    # Convert urgency type for consistency
    if urgency == "moderate":
        urgency = "medium"
    
    # Prepare resource information for AI
    resource_info = ""
    if nearby_resources:
        resource_info = "Available nearby resources:\n"
        for resource in nearby_resources[:3]:  # Top 3 closest
            resource_info += f"- {resource.get('name', 'Unknown')}: {resource.get('type', 'general')} at ({resource.get('latitude')}, {resource.get('longitude')})\n"
            resource_info += f"  Description: {resource.get('description', 'No description')}\n"
            resource_info += f"  Contact: {resource.get('contact', 'No contact')}\n"
            resource_info += f"  Status: {resource.get('status', 'unknown')}\n"
    else:
        resource_info = "No nearby resources identified."
    
    # Enhanced AI prompt for intelligent role assignment
    prompt = f"""
    You are an emergency response coordinator AI. A citizen has submitted an emergency request that requires immediate response. Analyze the situation and determine both the appropriate response task AND which responder roles are needed.

    EMERGENCY REQUEST DETAILS:
    Emergency Type: {emergency_type}
    Help Needed: {help_needed}
    Urgency Level: {urgency}
    Location: ({latitude}, {longitude})
    
    {resource_info}

    AVAILABLE RESPONDER ROLES - CHOOSE CAREFULLY:
    - "vol" (Volunteers ONLY): Community volunteers for basic needs, logistics, welfare checks
    - "fr" (First Responders ONLY): Professional emergency responders for medical/rescue/safety
    - "both" (BOTH Volunteers AND First Responders): For complex situations requiring both professional expertise AND community support

    CRITICAL ROLE ASSIGNMENT RULES:
    1. Use "both" when:
       - Mass casualty events or multiple people affected severely
       - Complex disasters requiring professional response AND community coordination
       - Situations needing immediate professional help PLUS ongoing volunteer support
       - Large-scale evacuations or shelter operations
       - Multiple simultaneous emergency needs

    2. Use "fr" only when:
       - Medical emergencies, injuries, life-threatening situations
       - Technical rescues, fires, hazardous materials
       - Police/security needed
       - Professional expertise is primary requirement

    3. Use "vol" only when:
       - Basic needs: food, water, shelter, supplies
       - Welfare checks, social support
       - Non-emergency logistics and coordination
       - Simple community assistance

    4. INAPPROPRIATE REQUESTS:
       - If Help Needed request seems fake, inappropriate, or non-emergency joke, assign "vol" with task to "Assess situation appropriately and provide guidance on proper emergency procedures"

    TASK: Generate a JSON response with the following structure:
    {{
        "description": "1-2 sentence direct task telling responders what action to take (maximum 2 sentences)",
        "roles": "exactly one value: 'vol', 'fr', or 'both'",
        "reasoning": "Brief explanation of why this specific role assignment is needed",
        "resource_utilization": "How to use nearby resources if applicable, or 'none' if not needed"
    }}

    TASK GENERATION RULES:
    - Focus on what responders should DO, not what the person should do
    - Be specific and actionable
    - Include coordinate utilization for deployment
    - Reference nearby resources when they can assist
    - Prioritize life-saving actions
    - For inappropriate requests, create professional guidance task

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
        
        # Handle role assignment - convert "both" to array format
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
            "help_needed": help_needed,
            "user_id": state['user_id'],
            "ai_reasoning": ai_data.get("reasoning", "AI-determined role assignment"),
            "resource_utilization": ai_data.get("resource_utilization", "none")
        }
        
        return {**state, "generated_task": task}
        
    except Exception as e:
        print(f"Error generating AI task: {e}")
        
        # Enhanced fallback with simplified AI prompt
        try:
            fallback_prompt = f"""
            Emergency: {help_needed}
            Type: {emergency_type}, Urgency: {urgency}
            
            JSON response - choose role carefully:
            {{
                "description": "Task for responding to {help_needed} at ({latitude}, {longitude})",
                "roles": "choose exactly one: 'vol', 'fr', or 'both' based on situation complexity and needs"
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
            
            description = fallback_data.get("description", f"Assist person needing {help_needed} at location ({latitude}, {longitude}).")
            
        except:
            # Final intelligent rule-based fallback
            description = f"Assist person needing {help_needed} at location ({latitude}, {longitude})."
            
            # Enhanced intelligent role assignment
            help_lower = help_needed.lower()
            emergency_lower = emergency_type.lower()
            
            # Check for inappropriate or joke requests
            inappropriate_keywords = ['joke', 'funny', 'lol', 'haha', 'prank', 'fake', 'test123', 'random']
            is_inappropriate = any(keyword in help_lower for keyword in inappropriate_keywords)
            
            if is_inappropriate:
                description = "Assess situation appropriately and provide guidance on proper emergency procedures. Educate on the importance of using emergency services responsibly."
                roles = ["vol"]
            else:
                # Check for complex situations needing both
                mass_casualty = any(keyword in help_lower for keyword in [
                    'many people', 'multiple people', 'crowd', 'group', 'families', 'everyone', 'lots of'
                ])
                
                complex_emergency = any(keyword in emergency_lower for keyword in [
                    'major', 'widespread', 'multiple', 'mass', 'large scale'
                ])
                
                # Professional responders needed
                needs_fr = any(keyword in help_lower for keyword in [
                    'medical', 'injury', 'hurt', 'bleeding', 'unconscious', 'chest pain', 
                    'breathing', 'heart', 'ambulance', 'doctor', 'hospital', 'rescue',
                    'trapped', 'fire', 'smoke', 'gas', 'hazard', 'emergency', 'dying', 'dead'
                ])
                
                # High urgency situations
                high_urgency = urgency in ['high', 'urgent'] or any(keyword in help_lower for keyword in [
                    'urgent', 'critical', 'immediate', 'emergency', 'asap', 'quickly', 'now'
                ])
                
                # Determine role assignment
                if (mass_casualty or complex_emergency) and (needs_fr or high_urgency):
                    roles = ["vol", "fr"]  # Both needed for complex situations
                elif needs_fr or high_urgency:
                    roles = ["fr"]  # Professional response needed
                else:
                    roles = ["vol"]  # Basic volunteer support sufficient
            
            # Add resource coordination if available
            if nearby_resources and not is_inappropriate:
                closest_resource = nearby_resources[0]
                description += f" Coordinate with {closest_resource.get('name', 'nearby resource')} for assistance."
        
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
            "help_needed": help_needed,
            "user_id": state['user_id'],
            "ai_reasoning": "Intelligent fallback assignment based on context analysis"
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
        "timestamp": int(time.time() * 1000),
        "assigned_roles": state['generated_task']['roles'],
        "ai_reasoning": state['generated_task'].get('ai_reasoning', 'No reasoning provided')
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