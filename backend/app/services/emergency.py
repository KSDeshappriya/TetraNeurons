from app.services.ml_model import analyze_image_with_summary, disaster_model, yolo_model, device
from io import BytesIO
import base64
import requests
from typing import TypedDict
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph
import os
import time
import uuid
import pygeohash as pgh
from firebase_admin import storage, db
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime

gemini = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=os.getenv("GOOGLE_API_KEY"))

class EmergencyState(TypedDict):
    image_bytes: bytes
    emergencyType: str
    urgencyLevel: str
    situation: str
    peopleCount: int
    latitude: float
    longitude: float
    cnn_result: str
    weather: dict
    gdac_disasters: dict
    government_report: str
    citizen_survival_guide: str
    user_id: str
    submitted_time: float
    ai_processing_start_time: float
    ai_processing_end_time: float
    status: str  
    image_url: str

    agents_status: dict
    parallel_tasks_completed: bool
    analysis_ready: bool
    ai_matrix_logs: list  # New field to collect logs

# === LOGGING UTILITY ===
def add_log_to_matrix(state: EmergencyState, message: str, agent: str = "system", level: str = "info"):
    """Add a log entry to the AI matrix logs"""
    if "ai_matrix_logs" not in state:
        state["ai_matrix_logs"] = []
    
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "unix_timestamp": time.time(),
        "agent": agent,
        "level": level,
        "message": message
    }
    state["ai_matrix_logs"].append(log_entry)
    
    # Also print for console output
    print(message)

# === UTILITY FUNCTIONS ===
def upload_image_to_firebase_storage(image_bytes: bytes, disaster_id: str) -> str:
    """Upload image to Firebase Storage and return download URL"""
    try:
        bucket = storage.bucket()
        blob = bucket.blob(f"disaster_images/{disaster_id}.jpg")
        blob.upload_from_string(image_bytes, content_type='image/jpeg')
        blob.make_public()
        return blob.public_url
    except Exception as e:
        error_msg = f"Error uploading image: {str(e)}"
        print(error_msg)
        return ""

def generate_geohash_date_uuid(latitude, longitude) -> str:
    """Generate a unique ID based on geohash and timestamp"""
    lat = float(latitude)
    lon = float(longitude)
    geohash = pgh.encode(lat, lon, precision=4)
    timestamp = str(int(time.time()))
    unique_id = f"{geohash}_{timestamp}_{str(uuid.uuid4())[:8]}"
    return unique_id

def save_to_realtime_database(state: EmergencyState, disaster_id: str, processing_time: float):
    """Save disaster data to Firebase Realtime Database"""
    try:
        ref = db.reference('disasters')
        disaster_data = {
            'disaster_id': disaster_id,
            'emergency_type': state['emergencyType'],
            'urgency_level': state['urgencyLevel'],
            'situation': state['situation'],
            'people_count': state['peopleCount'],
            'latitude': float(state['latitude']),
            'longitude': float(state['longitude']),
            'government_report': state['government_report'],
            'citizen_survival_guide': state['citizen_survival_guide'],
            'user_id': state['user_id'],
            'submitted_time': state['submitted_time'],
            'ai_processing_time': float(processing_time),
            'status': 'pending',
            'image_url': state['image_url'],
            'created_at': time.time(),
            'geohash': pgh.encode(float(state['latitude']), float(state['longitude']), precision=4)
        }
        
        ref.child(disaster_id).set(disaster_data)
        print(f"Disaster {disaster_id} saved to Realtime Database")
        return True
    except Exception as e:
        print(f"Error saving to Realtime Database: {str(e)}")
        return False

def save_ai_matrix_to_database(state: EmergencyState, disaster_id: str):
    """Save AI matrix logs to Firebase Realtime Database"""
    try:
        ref = db.reference('ai_matrixes')
        
        # Calculate processing statistics
        total_agents = len(state["agents_status"])
        completed_agents = sum(1 for status in state["agents_status"].values() if status == "completed")
        failed_agents = sum(1 for status in state["agents_status"].values() if status == "failed")
        
        ai_matrix_data = {
            'disaster_id': disaster_id,
            'created_at': time.time(),
            'created_at_iso': datetime.now().isoformat(),
            'processing_start_time': state['ai_processing_start_time'],
            'processing_end_time': state['ai_processing_end_time'],
            'total_processing_time': state['ai_processing_end_time'] - state['ai_processing_start_time'],
            'agents_summary': {
                'total_agents': total_agents,
                'completed_agents': completed_agents,
                'failed_agents': failed_agents,
                'success_rate': (completed_agents / total_agents * 100) if total_agents > 0 else 0
            },
            'agents_status': state['agents_status'],
            'final_status': state['status'],
            'logs': state.get('ai_matrix_logs', []),
            'emergency_context': {
                'emergency_type': state['emergencyType'],
                'urgency_level': state['urgencyLevel'],
                'people_count': state['peopleCount'],
                'latitude': state['latitude'],
                'longitude': state['longitude']
            }
        }
        
        ref.child(disaster_id).set(ai_matrix_data)
        print(f"AI Matrix for disaster {disaster_id} saved to Realtime Database")
        return True
    except Exception as e:
        print(f"Error saving AI Matrix to Realtime Database: {str(e)}")
        return False

# === SPECIALIZED AGENT FUNCTIONS ===

def image_analysis_agent(state: EmergencyState) -> EmergencyState:
    """Agent specialized in computer vision analysis"""
    add_log_to_matrix(state, "🔍 Image Analysis Agent: Processing image with CNN/YOLO...", "image_analysis", "info")
    
    try:
        image_bytes = state["image_bytes"]
        cnn_result = analyze_image_with_summary(BytesIO(image_bytes), disaster_model, yolo_model, device)
        state["cnn_result"] = cnn_result
        state["agents_status"]["image_analysis"] = "completed"
        add_log_to_matrix(state, f"✅ Image Analysis Agent: Completed - {cnn_result[:100]}...", "image_analysis", "success")
    except Exception as e:
        state["agents_status"]["image_analysis"] = "failed"
        add_log_to_matrix(state, f"❌ Image Analysis Agent: Failed - {str(e)}", "image_analysis", "error")
    
    return state

def weather_data_agent(state: EmergencyState) -> EmergencyState:
    """Agent specialized in weather data collection"""
    add_log_to_matrix(state, "🌤️ Weather Data Agent: Fetching weather information...", "weather_data", "info")
    
    lat = state["latitude"]
    lon = state["longitude"]
    try:
        response = requests.get(
            f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true&hourly=temperature_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_days=7",
            timeout=10
        )
        state["weather"] = response.json()
        state["agents_status"]["weather_data"] = "completed"
        add_log_to_matrix(state, "✅ Weather Data Agent: Completed", "weather_data", "success")
    except Exception as e:
        state["weather"] = {"error": str(e)}
        state["agents_status"]["weather_data"] = "failed"
        add_log_to_matrix(state, f"❌ Weather Data Agent: Failed - {str(e)}", "weather_data", "error")
    return state

def disaster_history_agent(state: EmergencyState) -> EmergencyState:
    """Agent specialized in historical disaster data"""
    add_log_to_matrix(state, "📊 Disaster History Agent: Fetching GDAC disaster data...", "disaster_history", "info")
    
    lat = state["latitude"]
    lon = state["longitude"]
    try:
        response = requests.get(
            f"https://www.gdacs.org/gdacsapi/api/events/search?lat={lat}&lon={lon}&radius=100",
            timeout=10
        )
        state["gdac_disasters"] = response.json()
        state["agents_status"]["disaster_history"] = "completed"
        add_log_to_matrix(state, "✅ Disaster History Agent: Completed", "disaster_history", "success")
    except Exception as e:
        state["gdac_disasters"] = {"error": str(e)}
        state["agents_status"]["disaster_history"] = "failed"
        add_log_to_matrix(state, f"❌ Disaster History Agent: Failed - {str(e)}", "disaster_history", "error")
    return state

def parallel_data_collection_coordinator(state: EmergencyState) -> EmergencyState:
    """Coordinator that runs weather and disaster history agents in parallel"""
    add_log_to_matrix(state, "🔄 Parallel Data Collection Coordinator: Starting parallel tasks...", "coordinator", "info")
    
    # Initialize agent status tracking
    state["agents_status"] = {
        "image_analysis": "pending",
        "weather_data": "pending", 
        "disaster_history": "pending",
        "government_analysis": "pending",
        "citizen_guide": "pending"
    }
    
    # Run weather and disaster history agents in parallel using threading
    with ThreadPoolExecutor(max_workers=2) as executor:
        # Submit both tasks
        weather_future = executor.submit(weather_data_agent, state.copy())
        disaster_future = executor.submit(disaster_history_agent, state.copy())
        
        # Wait for both to complete and merge results
        weather_result = weather_future.result()
        disaster_result = disaster_future.result()
        
        # Merge results back into main state
        state["weather"] = weather_result["weather"]
        state["gdac_disasters"] = disaster_result["gdac_disasters"]
        state["agents_status"]["weather_data"] = weather_result["agents_status"]["weather_data"]
        state["agents_status"]["disaster_history"] = disaster_result["agents_status"]["disaster_history"]
        
        # Merge logs from parallel tasks
        if "ai_matrix_logs" in weather_result:
            state["ai_matrix_logs"].extend(weather_result["ai_matrix_logs"])
        if "ai_matrix_logs" in disaster_result:
            state["ai_matrix_logs"].extend(disaster_result["ai_matrix_logs"])
    
    state["parallel_tasks_completed"] = True
    add_log_to_matrix(state, "✅ Parallel Data Collection Coordinator: All parallel tasks completed", "coordinator", "success")
    return state

def data_validation_agent(state: EmergencyState) -> EmergencyState:
    """Agent that validates all collected data before analysis"""
    add_log_to_matrix(state, "🔍 Data Validation Agent: Validating collected data...", "data_validation", "info")
    
    validation_results = {
        "image_analysis": bool(state.get("cnn_result")),
        "weather_data": "error" not in state.get("weather", {}),
        "disaster_history": "error" not in state.get("gdac_disasters", {})
    }
    
    # Set analysis_ready flag based on critical data availability
    state["analysis_ready"] = validation_results["image_analysis"]  # Image analysis is critical
    
    add_log_to_matrix(state, f"✅ Data Validation Agent: Validation complete - Ready for analysis: {state['analysis_ready']}", "data_validation", "success")
    add_log_to_matrix(state, f"   - Image Analysis: {'✅' if validation_results['image_analysis'] else '❌'}", "data_validation", "info")
    add_log_to_matrix(state, f"   - Weather Data: {'✅' if validation_results['weather_data'] else '❌'}", "data_validation", "info")
    add_log_to_matrix(state, f"   - Disaster History: {'✅' if validation_results['disaster_history'] else '❌'}", "data_validation", "info")
    
    return state

def government_analysis_agent(state: EmergencyState) -> EmergencyState:
    """Agent specialized in government response analysis"""
    add_log_to_matrix(state, "🏛️ Government Analysis Agent: Generating government report...", "government_analysis", "info")
    
    if not state.get("analysis_ready", False):
        add_log_to_matrix(state, "❌ Government Analysis Agent: Cannot proceed - insufficient data", "government_analysis", "error")
        state["government_report"] = "Error: Insufficient data for analysis"
        state["agents_status"]["government_analysis"] = "failed"
        return state
    
    image_bytes = state["image_bytes"]
    img_b64 = base64.b64encode(image_bytes).decode("utf-8")

    government_context = f"""
    EMERGENCY SITUATION REPORT FOR GOVERNMENT RESPONSE TEAM
    
    Basic Information:
    - Emergency Type: {state['emergencyType']}
    - Urgency Level: {state['urgencyLevel']}
    - Situation Description: {state['situation']}
    - People Affected: {state['peopleCount']}
    - GPS Coordinates: {state['latitude']}, {state['longitude']}
    
    AI Analysis Results: {state['cnn_result']}
    Weather Data: {state['weather']}
    Historical Disasters (GDAC): {state['gdac_disasters']}
    """

    gov_prompt = f"""
    {government_context}
    
    You are analyzing this emergency for GOVERNMENT RESPONSE COORDINATION. Create a comprehensive government report with:
    1. THREAT ASSESSMENT & SEVERITY SCALE (1-10)
         - Assess the threat is genuine or false alarm using only Weather data,Image analysis and CNN
         (cnn can be unreliable sometime because it only train to classifed some of disasters 
         so there some problem of mismatching disaster so mainly focus on user,weather and image analysis 
         data if that kind situation come.)
       
    2. FUTURE PROJECTIONS:
       - How will this situation evolve in next 24-72 hours?
       - Weather impact on operations (use detailed weather data)
       - Risk of situation worsening based on GDAC historical data

    3. RESOURCE REQUIREMENTS:
       - Personnel needed (rescue teams, medical, engineers, etc.)
       - Equipment required (helicopters, boats, heavy machinery, etc.)
       - Medical supplies and facilities
       - Shelter and logistics
    
    4. DEPLOYMENT DECISION:
       - Should backup/reinforcements be sent? (YES/NO with reasoning)
       - Priority level for resource allocation
       - Recommended response timeline
    
    5. COORDINATION RECOMMENDATIONS:
       - Which agencies should be involved?
       - Evacuation zones if needed
       - Public safety measures
    
    Format as a formal government emergency response report.
    """

    try:
        response = gemini.invoke([
            HumanMessage(
                content=[
                    {"type": "text", "text": gov_prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{img_b64}"
                        }
                    }
                ]
            )
        ])
        state["government_report"] = response.content
        state["agents_status"]["government_analysis"] = "completed"
        add_log_to_matrix(state, "✅ Government Analysis Agent: Report generated", "government_analysis", "success")
    except Exception as e:
        state["government_report"] = f"Error generating government report: {str(e)}"
        state["agents_status"]["government_analysis"] = "failed"
        add_log_to_matrix(state, f"❌ Government Analysis Agent: Failed - {str(e)}", "government_analysis", "error")
    
    return state

def citizen_guide_agent(state: EmergencyState) -> EmergencyState:
    """Agent specialized in citizen survival guidance"""
    add_log_to_matrix(state, "👥 Citizen Guide Agent: Generating survival guide...", "citizen_guide", "info")
    
    if not state.get("analysis_ready", False):
        add_log_to_matrix(state, "❌ Citizen Guide Agent: Cannot proceed - insufficient data", "citizen_guide", "error")
        state["citizen_survival_guide"] = "Error: Insufficient data for guidance"
        state["agents_status"]["citizen_guide"] = "failed"
        return state
    
    image_bytes = state["image_bytes"]
    img_b64 = base64.b64encode(image_bytes).decode("utf-8")

    citizen_context = f"""
    CITIZEN SITUATION:
    - Emergency Type: {state['emergencyType']}
    - Your Location: {state['latitude']}, {state['longitude']}
    - Current Weather: {state['weather'].get('current_weather', {})}
    - Number of People with You: {state['peopleCount']}
    """

    citizen_prompt = f"""
    {citizen_context}
    
    You are providing SURVIVAL INSTRUCTIONS for civilians in this emergency situation. Create a practical survival guide with:
    
    1. IMMEDIATE SAFETY ACTIONS (next 30 minutes):
       - What to do RIGHT NOW to stay safe
       - Where to position yourself
       - What to avoid

    2. WHAT TO EXPECT:
       - use weather data & gdac data to explain how conditions may change
       - Signs that help is coming
       - What rescue teams will do
    
    3. SHELTER & PROTECTION:
       - How to create/find safe shelter
       - Protection from weather elements
       - Safety from specific disaster threats
       - Basic first aid for common injuries in this disaster
       - Warning signs that need immediate attention

    4. COMMUNICATION & SIGNALING:
       - How to signal for help
       - Conserve phone battery
       - Create visible distress signals

    
    Write in simple, clear language that anyone can understand. Focus on PRACTICAL actions, not technical analysis.
    """

    try:
        response = gemini.invoke([
            HumanMessage(
                content=[
                    {"type": "text", "text": citizen_prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{img_b64}"
                        }
                    }
                ]
            )
        ])
        state["citizen_survival_guide"] = response.content
        state["agents_status"]["citizen_guide"] = "completed"
        add_log_to_matrix(state, "✅ Citizen Guide Agent: Survival guide generated", "citizen_guide", "success")
    except Exception as e:
        state["citizen_survival_guide"] = f"Error generating citizen guide: {str(e)}"
        state["agents_status"]["citizen_guide"] = "failed"
        add_log_to_matrix(state, f"❌ Citizen Guide Agent: Failed - {str(e)}", "citizen_guide", "error")
    
    return state

def parallel_analysis_coordinator(state: EmergencyState) -> EmergencyState:
    """Coordinator that runs government and citizen analysis agents in parallel"""
    add_log_to_matrix(state, "🔄 Parallel Analysis Coordinator: Starting parallel analysis...", "coordinator", "info")
    
    if not state.get("analysis_ready", False):
        add_log_to_matrix(state, "❌ Parallel Analysis Coordinator: Cannot proceed - data validation failed", "coordinator", "error")
        return state
    
    # Run both analysis agents in parallel using threading
    with ThreadPoolExecutor(max_workers=2) as executor:
        # Submit both tasks
        gov_future = executor.submit(government_analysis_agent, state.copy())
        citizen_future = executor.submit(citizen_guide_agent, state.copy())
        
        # Wait for both to complete and merge results
        gov_result = gov_future.result()
        citizen_result = citizen_future.result()
        
        # Merge results back into main state
        state["government_report"] = gov_result["government_report"]
        state["citizen_survival_guide"] = citizen_result["citizen_survival_guide"]
        state["agents_status"]["government_analysis"] = gov_result["agents_status"]["government_analysis"]
        state["agents_status"]["citizen_guide"] = citizen_result["agents_status"]["citizen_guide"]
        
        # Merge logs from parallel tasks
        if "ai_matrix_logs" in gov_result:
            state["ai_matrix_logs"].extend(gov_result["ai_matrix_logs"])
        if "ai_matrix_logs" in citizen_result:
            state["ai_matrix_logs"].extend(citizen_result["ai_matrix_logs"])
    
    add_log_to_matrix(state, "✅ Parallel Analysis Coordinator: All analysis tasks completed", "coordinator", "success")
    return state

def final_coordinator_agent(state: EmergencyState) -> EmergencyState:
    """Final agent that coordinates completion and status updates"""
    add_log_to_matrix(state, "🎯 Final Coordinator Agent: Finalizing emergency response...", "final_coordinator", "info")
    
    # Check overall success status
    completed_agents = sum(1 for status in state["agents_status"].values() if status == "completed")
    total_agents = len(state["agents_status"])
    
    add_log_to_matrix(state, f"📊 Agent Status Summary: {completed_agents}/{total_agents} agents completed successfully", "final_coordinator", "info")
    for agent, status in state["agents_status"].items():
        status_icon = "✅" if status == "completed" else "❌" if status == "failed" else "⏳"
        add_log_to_matrix(state, f"   - {agent}: {status_icon} {status}", "final_coordinator", "info")
    
    # Determine overall status
    critical_agents = ["image_analysis"]  # Define which agents are critical
    critical_success = all(state["agents_status"].get(agent) == "completed" for agent in critical_agents)
    
    if critical_success and completed_agents >= len(critical_agents):
        state["status"] = "accepted"
        add_log_to_matrix(state, "✅ Final Coordinator Agent: Emergency response ACCEPTED", "final_coordinator", "success")
    else:
        state["status"] = "rejected"
        add_log_to_matrix(state, "❌ Final Coordinator Agent: Emergency response REJECTED due to insufficient data", "final_coordinator", "error")
    
    return state

def create_multiagent_emergency_graph():
    """Create the multiagent emergency response graph"""
    print("🏗️ Creating Multiagent Emergency Response System...")
    
    graph = StateGraph(EmergencyState)
    
    # Add all specialized agents
    graph.add_node("image_analysis", image_analysis_agent)
    graph.add_node("parallel_data_collection", parallel_data_collection_coordinator)
    graph.add_node("data_validation", data_validation_agent)
    graph.add_node("parallel_analysis", parallel_analysis_coordinator)
    graph.add_node("final_coordinator", final_coordinator_agent)

    # Set up the workflow
    graph.set_entry_point("image_analysis")
    graph.add_edge("image_analysis", "parallel_data_collection")
    graph.add_edge("parallel_data_collection", "data_validation")
    graph.add_edge("data_validation", "parallel_analysis")
    graph.add_edge("parallel_analysis", "final_coordinator")
    graph.set_finish_point("final_coordinator")

    print("✅ Multiagent Emergency Response System created successfully!")
    return graph.compile()

# Create the multiagent graph
multiagent_graph = create_multiagent_emergency_graph()

async def handle_emergency_report(
    emergencyType,
    urgencyLevel,
    situation,
    peopleCount,
    latitude,
    longitude,
    image,
    user
):
    """Main handler for emergency reports using multiagent system"""
    print("🚨 MULTIAGENT EMERGENCY RESPONSE SYSTEM ACTIVATED 🚨")
    
    if image is None:
        return {"error": "No image uploaded"}

    # Record submission time
    submitted_time = time.time()
    ai_processing_start_time = time.time()
    
    # Generate unique disaster ID
    disaster_id = generate_geohash_date_uuid(latitude, longitude)
    print(f"📋 Generated Disaster ID: {disaster_id}")
    
    image_bytes = await image.read()
    
    # Upload image to Firebase Storage
    print("📤 Uploading image to Firebase Storage...")
    image_url = upload_image_to_firebase_storage(image_bytes, disaster_id)

    initial_state: EmergencyState = {
        "image_bytes": image_bytes,
        "emergencyType": emergencyType,
        "urgencyLevel": urgencyLevel,
        "situation": situation,
        "peopleCount": peopleCount,
        "latitude": latitude,
        "longitude": longitude,
        "cnn_result": "",
        "weather": {},
        "gdac_disasters": {},
        "government_report": "",
        "citizen_survival_guide": "",
        "user_id": getattr(user, 'uid', 'anonymous'),
        "submitted_time": submitted_time,
        "ai_processing_start_time": ai_processing_start_time,
        "ai_processing_end_time": 0,
        "status": "pending",
        "image_url": image_url,
        # Multiagent specific fields
        "agents_status": {},
        "parallel_tasks_completed": False,
        "analysis_ready": False,
        "ai_matrix_logs": []  # Initialize logging
    }

    # Add initial log entry
    add_log_to_matrix(initial_state, "🚨 MULTIAGENT EMERGENCY RESPONSE SYSTEM ACTIVATED 🚨", "system", "info")
    add_log_to_matrix(initial_state, f"📋 Generated Disaster ID: {disaster_id}", "system", "info")
    add_log_to_matrix(initial_state, "🤖 Starting Multiagent Processing Pipeline...", "system", "info")
    
    # Process with multiagent system
    final_state = multiagent_graph.invoke(initial_state)
    
    # Record AI processing end time
    ai_processing_end_time = time.time()
    final_state["ai_processing_end_time"] = ai_processing_end_time
    
    # Calculate processing time
    processing_time = ai_processing_end_time - ai_processing_start_time
    
    add_log_to_matrix(final_state, f"⏱️ Total Processing Time: {processing_time:.2f} seconds", "system", "info")
    
    # Save to Firebase Realtime Database
    add_log_to_matrix(final_state, "💾 Saving to Firebase Realtime Database...", "system", "info")
    save_success = save_to_realtime_database(final_state, disaster_id, processing_time)
    
    if not save_success:
        add_log_to_matrix(final_state, "❌ Failed to save disaster report to database", "system", "error")
        return {"error": "Failed to save disaster report to database"}

    # Save AI Matrix logs to database
    add_log_to_matrix(final_state, "💾 Saving AI Matrix logs to database...", "system", "info")
    ai_matrix_success = save_ai_matrix_to_database(final_state, disaster_id)
    
    if ai_matrix_success:
        add_log_to_matrix(final_state, "✅ AI Matrix logs saved successfully", "system", "success")
    else:
        add_log_to_matrix(final_state, "❌ Failed to save AI Matrix logs", "system", "error")

    add_log_to_matrix(final_state, "🎉 MULTIAGENT EMERGENCY RESPONSE COMPLETED SUCCESSFULLY!", "system", "success")
    
    return {
        "disaster_id": disaster_id,
        "government_report": final_state["government_report"],
        "citizen_survival_guide": final_state["citizen_survival_guide"],
        "processing_time": processing_time,
        "image_url": image_url,
        "status": final_state["status"],
        "agents_status": final_state["agents_status"],  # Include agent status for debugging
        "ai_matrix_saved": ai_matrix_success  # Indicate if AI matrix was saved
    }