from app.services.cnn_model import analyze_image_with_summary, disaster_model, yolo_model, device
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
    ai_matrix_logs: list  

# === LOGGING UTILITY ===
def add_log_to_matrix(state: EmergencyState, message: str, component: str = "system", level: str = "info"):
    """Add a log entry to the AI matrix logs"""
    if "ai_matrix_logs" not in state:
        state["ai_matrix_logs"] = []
    
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "unix_timestamp": time.time(),
        "component": component,
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
        total_components = len(state["agents_status"])
        completed_components = sum(1 for status in state["agents_status"].values() if status == "completed")
        failed_components = sum(1 for status in state["agents_status"].values() if status == "failed")
        
        ai_matrix_data = {
            'disaster_id': disaster_id,
            'created_at': time.time(),
            'created_at_iso': datetime.now().isoformat(),
            'processing_start_time': state['ai_processing_start_time'],
            'processing_end_time': state['ai_processing_end_time'],
            'total_processing_time': state['ai_processing_end_time'] - state['ai_processing_start_time'],
            'components_summary': {
                'total_components': total_components,
                'completed_components': completed_components,
                'failed_components': failed_components,
                'success_rate': (completed_components / total_components * 100) if total_components > 0 else 0
            },
            'components_status': state['agents_status'],
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

# === AI AGENTS (True AI-powered components) ===

def computer_vision_ai_agent(state: EmergencyState) -> EmergencyState:
    """AI Agent: Computer Vision Analysis using CNN/YOLO models"""
    add_log_to_matrix(state, "🤖 AI AGENT: Computer Vision - Processing image with CNN/YOLO models...", "ai_agent_computer_vision", "info")
    
    try:
        image_bytes = state["image_bytes"]
        cnn_result = analyze_image_with_summary(BytesIO(image_bytes), disaster_model, yolo_model, device)
        state["cnn_result"] = cnn_result
        state["agents_status"]["computer_vision_ai"] = "completed"
        add_log_to_matrix(state, f"✅ AI AGENT: Computer Vision - Analysis completed: {cnn_result[:100]}...", "ai_agent_computer_vision", "success")
    except Exception as e:
        state["agents_status"]["computer_vision_ai"] = "failed"
        add_log_to_matrix(state, f"❌ AI AGENT: Computer Vision - Failed: {str(e)}", "ai_agent_computer_vision", "error")
    
    return state

def government_analysis_ai_agent(state: EmergencyState) -> EmergencyState:
    """AI Agent: Government Response Analysis using Gemini AI"""
    add_log_to_matrix(state, "🤖 AI AGENT: Government Analysis - Generating government report using Gemini AI...", "ai_agent_government", "info")
    
    if not state.get("analysis_ready", False):
        add_log_to_matrix(state, "❌ AI AGENT: Government Analysis - Cannot proceed: insufficient data", "ai_agent_government", "error")
        state["government_report"] = "Error: Insufficient data for analysis"
        state["agents_status"]["government_analysis_ai"] = "failed"
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
        state["agents_status"]["government_analysis_ai"] = "completed"
        add_log_to_matrix(state, "✅ AI AGENT: Government Analysis - Report generated successfully", "ai_agent_government", "success")
    except Exception as e:
        state["government_report"] = f"Error generating government report: {str(e)}"
        state["agents_status"]["government_analysis_ai"] = "failed"
        add_log_to_matrix(state, f"❌ AI AGENT: Government Analysis - Failed: {str(e)}", "ai_agent_government", "error")
    
    return state

def citizen_survival_ai_agent(state: EmergencyState) -> EmergencyState:
    """AI Agent: Citizen Survival Guide using Gemini AI"""
    add_log_to_matrix(state, "🤖 AI AGENT: Citizen Survival - Generating survival guide using Gemini AI...", "ai_agent_citizen", "info")
    
    if not state.get("analysis_ready", False):
        add_log_to_matrix(state, "❌ AI AGENT: Citizen Survival - Cannot proceed: insufficient data", "ai_agent_citizen", "error")
        state["citizen_survival_guide"] = "Error: Insufficient data for guidance"
        state["agents_status"]["citizen_survival_ai"] = "failed"
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
        state["agents_status"]["citizen_survival_ai"] = "completed"
        add_log_to_matrix(state, "✅ AI AGENT: Citizen Survival - Guide generated successfully", "ai_agent_citizen", "success")
    except Exception as e:
        state["citizen_survival_guide"] = f"Error generating citizen guide: {str(e)}"
        state["agents_status"]["citizen_survival_ai"] = "failed"
        add_log_to_matrix(state, f"❌ AI AGENT: Citizen Survival - Failed: {str(e)}", "ai_agent_citizen", "error")
    
    return state

# === DATA COLLECTION TOOLS (Non-AI API calls) ===

def weather_data_collection_tool(state: EmergencyState) -> EmergencyState:
    """Data Collection Tool: Weather API integration"""
    add_log_to_matrix(state, "🌤️ DATA TOOL: Weather Collection - Fetching weather data from Open-Meteo API...", "data_tool_weather", "info")
    
    lat = state["latitude"]
    lon = state["longitude"]
    try:
        response = requests.get(
            f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true&hourly=temperature_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_days=7",
            timeout=10
        )
        state["weather"] = response.json()
        state["agents_status"]["weather_data_tool"] = "completed"
        add_log_to_matrix(state, "✅ DATA TOOL: Weather Collection - Weather data retrieved successfully", "data_tool_weather", "success")
    except Exception as e:
        state["weather"] = {"error": str(e)}
        state["agents_status"]["weather_data_tool"] = "failed"
        add_log_to_matrix(state, f"❌ DATA TOOL: Weather Collection - Failed: {str(e)}", "data_tool_weather", "error")
    return state

def disaster_history_collection_tool(state: EmergencyState) -> EmergencyState:
    """Data Collection Tool: GDAC disaster history API integration"""
    add_log_to_matrix(state, "📊 DATA TOOL: Disaster History - Fetching historical disaster data from GDAC API...", "data_tool_disaster_history", "info")
    
    lat = state["latitude"]
    lon = state["longitude"]
    try:
        response = requests.get(
            f"https://www.gdacs.org/gdacsapi/api/events/search?lat={lat}&lon={lon}&radius=100",
            timeout=10
        )
        state["gdac_disasters"] = response.json()
        state["agents_status"]["disaster_history_tool"] = "completed"
        add_log_to_matrix(state, "✅ DATA TOOL: Disaster History - Historical data retrieved successfully", "data_tool_disaster_history", "success")
    except Exception as e:
        state["gdac_disasters"] = {"error": str(e)}
        state["agents_status"]["disaster_history_tool"] = "failed"
        add_log_to_matrix(state, f"❌ DATA TOOL: Disaster History - Failed: {str(e)}", "data_tool_disaster_history", "error")
    return state

# === SYSTEM COORDINATORS (Orchestration components) ===

def parallel_data_collection_coordinator(state: EmergencyState) -> EmergencyState:
    """System Coordinator: Parallel execution of data collection tools"""
    add_log_to_matrix(state, "🔄 SYSTEM COORDINATOR: Data Collection - Starting parallel data collection...", "system_coordinator_data", "info")
    
    # Initialize component status tracking
    state["agents_status"] = {
        "computer_vision_ai": "pending",
        "weather_data_tool": "pending", 
        "disaster_history_tool": "pending",
        "government_analysis_ai": "pending",
        "citizen_survival_ai": "pending"
    }
    
    # Run weather and disaster history tools in parallel using threading
    with ThreadPoolExecutor(max_workers=2) as executor:
        # Submit both tasks
        weather_future = executor.submit(weather_data_collection_tool, state.copy())
        disaster_future = executor.submit(disaster_history_collection_tool, state.copy())
        
        # Wait for both to complete and merge results
        weather_result = weather_future.result()
        disaster_result = disaster_future.result()
        
        # Merge results back into main state
        state["weather"] = weather_result["weather"]
        state["gdac_disasters"] = disaster_result["gdac_disasters"]
        state["agents_status"]["weather_data_tool"] = weather_result["agents_status"]["weather_data_tool"]
        state["agents_status"]["disaster_history_tool"] = disaster_result["agents_status"]["disaster_history_tool"]
        
        # Merge logs from parallel tasks
        if "ai_matrix_logs" in weather_result:
            state["ai_matrix_logs"].extend(weather_result["ai_matrix_logs"])
        if "ai_matrix_logs" in disaster_result:
            state["ai_matrix_logs"].extend(disaster_result["ai_matrix_logs"])
    
    state["parallel_tasks_completed"] = True
    add_log_to_matrix(state, "✅ SYSTEM COORDINATOR: Data Collection - All data collection tasks completed", "system_coordinator_data", "success")
    return state

def data_validation_coordinator(state: EmergencyState) -> EmergencyState:
    """System Coordinator: Data validation and readiness assessment"""
    add_log_to_matrix(state, "🔍 SYSTEM COORDINATOR: Data Validation - Validating collected data...", "system_coordinator_validation", "info")
    
    validation_results = {
        "computer_vision": bool(state.get("cnn_result")),
        "weather_data": "error" not in state.get("weather", {}),
        "disaster_history": "error" not in state.get("gdac_disasters", {})
    }
    
    # Set analysis_ready flag based on critical data availability
    state["analysis_ready"] = validation_results["computer_vision"]  # Computer vision is critical
    
    add_log_to_matrix(state, f"✅ SYSTEM COORDINATOR: Data Validation - Validation complete. Ready for AI analysis: {state['analysis_ready']}", "system_coordinator_validation", "success")
    add_log_to_matrix(state, f"   - Computer Vision AI: {'✅' if validation_results['computer_vision'] else '❌'}", "system_coordinator_validation", "info")
    add_log_to_matrix(state, f"   - Weather Data Tool: {'✅' if validation_results['weather_data'] else '❌'}", "system_coordinator_validation", "info")
    add_log_to_matrix(state, f"   - Disaster History Tool: {'✅' if validation_results['disaster_history'] else '❌'}", "system_coordinator_validation", "info")
    
    return state

def parallel_ai_analysis_coordinator(state: EmergencyState) -> EmergencyState:
    """System Coordinator: Parallel execution of AI analysis agents"""
    add_log_to_matrix(state, "🔄 SYSTEM COORDINATOR: AI Analysis - Starting parallel AI agent analysis...", "system_coordinator_ai_analysis", "info")
    
    if not state.get("analysis_ready", False):
        add_log_to_matrix(state, "❌ SYSTEM COORDINATOR: AI Analysis - Cannot proceed: data validation failed", "system_coordinator_ai_analysis", "error")
        return state
    
    # Run both AI analysis agents in parallel using threading
    with ThreadPoolExecutor(max_workers=2) as executor:
        # Submit both AI agent tasks
        gov_future = executor.submit(government_analysis_ai_agent, state.copy())
        citizen_future = executor.submit(citizen_survival_ai_agent, state.copy())
        
        # Wait for both to complete and merge results
        gov_result = gov_future.result()
        citizen_result = citizen_future.result()
        
        # Merge results back into main state
        state["government_report"] = gov_result["government_report"]
        state["citizen_survival_guide"] = citizen_result["citizen_survival_guide"]
        state["agents_status"]["government_analysis_ai"] = gov_result["agents_status"]["government_analysis_ai"]
        state["agents_status"]["citizen_survival_ai"] = citizen_result["agents_status"]["citizen_survival_ai"]
        
        # Merge logs from parallel tasks
        if "ai_matrix_logs" in gov_result:
            state["ai_matrix_logs"].extend(gov_result["ai_matrix_logs"])
        if "ai_matrix_logs" in citizen_result:
            state["ai_matrix_logs"].extend(citizen_result["ai_matrix_logs"])
    
    add_log_to_matrix(state, "✅ SYSTEM COORDINATOR: AI Analysis - All AI agent analysis tasks completed", "system_coordinator_ai_analysis", "success")
    return state

def final_system_coordinator(state: EmergencyState) -> EmergencyState:
    """System Coordinator: Final processing and status determination"""
    add_log_to_matrix(state, "🎯 SYSTEM COORDINATOR: Final Processing - Finalizing emergency response...", "system_coordinator_final", "info")
    
    # Check overall success status
    completed_components = sum(1 for status in state["agents_status"].values() if status == "completed")
    total_components = len(state["agents_status"])
    
    add_log_to_matrix(state, f"📊 Processing Summary: {completed_components}/{total_components} components completed successfully", "system_coordinator_final", "info")
    
    # Categorize components for logging
    ai_agents = ["computer_vision_ai", "government_analysis_ai", "citizen_survival_ai"]
    data_tools = ["weather_data_tool", "disaster_history_tool"]
    
    add_log_to_matrix(state, "🤖 AI AGENTS STATUS:", "system_coordinator_final", "info")
    for agent in ai_agents:
        if agent in state["agents_status"]:
            status = state["agents_status"][agent]
            status_icon = "✅" if status == "completed" else "❌" if status == "failed" else "⏳"
            add_log_to_matrix(state, f"   - {agent}: {status_icon} {status}", "system_coordinator_final", "info")
    
    add_log_to_matrix(state, "🔧 DATA COLLECTION TOOLS STATUS:", "system_coordinator_final", "info")
    for tool in data_tools:
        if tool in state["agents_status"]:
            status = state["agents_status"][tool]
            status_icon = "✅" if status == "completed" else "❌" if status == "failed" else "⏳"
            add_log_to_matrix(state, f"   - {tool}: {status_icon} {status}", "system_coordinator_final", "info")
    
    # Determine overall status based on critical AI agents
    critical_ai_agents = ["computer_vision_ai"]  # Define which AI agents are critical
    critical_success = all(state["agents_status"].get(agent) == "completed" for agent in critical_ai_agents)
    
    if critical_success and completed_components >= len(critical_ai_agents):
        state["status"] = "accepted"
        add_log_to_matrix(state, "✅ SYSTEM COORDINATOR: Final Processing - Emergency response ACCEPTED", "system_coordinator_final", "success")
    else:
        state["status"] = "rejected"
        add_log_to_matrix(state, "❌ SYSTEM COORDINATOR: Final Processing - Emergency response REJECTED due to insufficient data", "system_coordinator_final", "error")
    
    return state

def create_multiagent_emergency_graph():
    """Create the multiagent emergency response graph with clear AI/Tool distinction"""
    print("🏗️ Creating Multiagent Emergency Response System...")
    print("🤖 AI Agents: Computer Vision, Government Analysis, Citizen Survival")
    print("🔧 Data Tools: Weather Collection, Disaster History Collection")
    print("⚙️ System Coordinators: Data Collection, Data Validation, AI Analysis, Final Processing")
    
    graph = StateGraph(EmergencyState)
    
    # Add AI agents and tools with coordinators
    graph.add_node("computer_vision_ai", computer_vision_ai_agent)
    graph.add_node("parallel_data_collection", parallel_data_collection_coordinator)
    graph.add_node("data_validation", data_validation_coordinator)
    graph.add_node("parallel_ai_analysis", parallel_ai_analysis_coordinator)
    graph.add_node("final_coordinator", final_system_coordinator)

    # Set up the workflow
    graph.set_entry_point("computer_vision_ai")
    graph.add_edge("computer_vision_ai", "parallel_data_collection")
    graph.add_edge("parallel_data_collection", "data_validation")
    graph.add_edge("data_validation", "parallel_ai_analysis")
    graph.add_edge("parallel_ai_analysis", "final_coordinator")
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
    print("🤖 3 AI Agents + 2 Data Collection Tools + 4 System Coordinators")
    
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
        "agents_status": {},
        "parallel_tasks_completed": False,
        "analysis_ready": False,
        "ai_matrix_logs": []  
    }

    # Add initial log entry
    add_log_to_matrix(initial_state, "🚨 MULTIAGENT EMERGENCY RESPONSE SYSTEM ACTIVATED 🚨", "system", "info")
    add_log_to_matrix(initial_state, "🤖 AI AGENTS: Computer Vision, Government Analysis, Citizen Survival", "system", "info")
    add_log_to_matrix(initial_state, "🔧 DATA TOOLS: Weather Collection, Disaster History Collection", "system", "info")
    add_log_to_matrix(initial_state, f"📋 Generated Disaster ID: {disaster_id}", "system", "info")
    add_log_to_matrix(initial_state, "⚙️ Starting Multiagent Processing Pipeline...", "system", "info")
    
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
        "agents_status": final_state["agents_status"],  
        "ai_matrix_saved": ai_matrix_success  
    }