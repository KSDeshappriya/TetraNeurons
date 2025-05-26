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
    status: str  # "pending", "accepted", "rejected"
    image_url: str

def upload_image_to_firebase_storage(image_bytes: bytes, disaster_id: str) -> str:
    """Upload image to Firebase Storage and return download URL"""
    try:
        bucket = storage.bucket()
        blob = bucket.blob(f"disaster_images/{disaster_id}.jpg")
        blob.upload_from_string(image_bytes, content_type='image/jpeg')
        blob.make_public()
        return blob.public_url
    except Exception as e:
        print(f"Error uploading image: {str(e)}")
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
                        'status': state['status'],
                        'image_url': state['image_url'],
                        'created_at': time.time(),
                        'geohash': pgh.encode(float(state['latitude']), float(state['longitude']), precision=7)
        }
        
        ref.child(disaster_id).set(disaster_data)
        print(f"Disaster {disaster_id} saved to Realtime Database")
        return True
    except Exception as e:
        print(f"Error saving to Realtime Database: {str(e)}")
        return False

def fetch_openmetro_weather(lat, lon):
    try:
        response = requests.get(
            f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true&hourly=temperature_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_days=7"
        )
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def fetch_gdac_disasters(lat, lon):
    try:
        response = requests.get(
            f"https://www.gdacs.org/gdacsapi/api/events/search?lat={lat}&lon={lon}&radius=100"
        )
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def run_cnn_yolo(state: EmergencyState) -> EmergencyState:
    image_bytes = state["image_bytes"]
    cnn_result = analyze_image_with_summary(BytesIO(image_bytes), disaster_model, yolo_model, device)
    state["cnn_result"] = cnn_result
    return state

def enrich_with_apis(state: EmergencyState) -> EmergencyState:
    lat = state["latitude"]
    lon = state["longitude"]
    state["weather"] = fetch_openmetro_weather(lat, lon)
    state["gdac_disasters"] = fetch_gdac_disasters(lat, lon)
    return state

def generate_government_report(state: EmergencyState) -> EmergencyState:
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
         - Assess the threat is genuine or false alarm using only Weather data and CNN,Image analysis
    2. RESOURCE REQUIREMENTS:
       - Personnel needed (rescue teams, medical, engineers, etc.)
       - Equipment required (helicopters, boats, heavy machinery, etc.)
       - Medical supplies and facilities
       - Shelter and logistics
    
    3. COST ESTIMATION:
       - Immediate response costs (next 24-48 hours)
       - Extended operation costs (1-2 weeks)
       - Infrastructure damage estimates
       - cost should be in LKR (1 US Dollar = 300 LKR)
    
    4. DEPLOYMENT DECISION:
       - Should backup/reinforcements be sent? (YES/NO with reasoning)
       - Priority level for resource allocation
       - Recommended response timeline
    
    5. FUTURE PROJECTIONS:
       - How will this situation evolve in next 24-72 hours?
       - Weather impact on operations (use detailed weather data)
       - Risk of situation worsening based on GDAC historical data
    
    6. COORDINATION RECOMMENDATIONS:
       - Which agencies should be involved?
       - Evacuation zones if needed
       - Public safety measures
    
    Format as a formal government emergency response report.
    """

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
    return state

def generate_citizen_survival_guide(state: EmergencyState) -> EmergencyState:
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
    
    2. SHELTER & PROTECTION:
       - How to create/find safe shelter
       - Protection from weather elements
       - Safety from specific disaster threats
    
    3. WATER & FOOD:
       - How to find/purify water
       - Food rationing if supplies are limited
       - What to eat/avoid in this situation
    
    4. COMMUNICATION & SIGNALING:
       - How to signal for help
       - Conserve phone battery
       - Create visible distress signals
    
    5. MEDICAL CARE:
       - Basic first aid for common injuries in this disaster
       - How to stay healthy while waiting
       - Warning signs that need immediate attention
    
    6. PSYCHOLOGICAL TIPS:
       - How to stay calm and focused
       - Keep group morale up
       - Activities to pass time safely
    
    7. WHAT TO EXPECT:
       - use weather data & gdac data to explain how conditions may change
       - Signs that help is coming
       - What rescue teams will do
    
    Write in simple, clear language that anyone can understand. Focus on PRACTICAL actions, not technical analysis.
    """

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
    return state

def create_emergency_graph():
    graph = StateGraph(EmergencyState)
    
    graph.add_node("cnn_yolo", run_cnn_yolo)
    graph.add_node("external_data", enrich_with_apis)
    graph.add_node("government_analysis", generate_government_report)
    graph.add_node("citizen_guide", generate_citizen_survival_guide)

    graph.set_entry_point("cnn_yolo")
    graph.add_edge("cnn_yolo", "external_data")
    graph.add_edge("external_data", "government_analysis")
    graph.add_edge("government_analysis", "citizen_guide")
    graph.set_finish_point("citizen_guide")

    return graph.compile()

graph = create_emergency_graph()

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
    if image is None:
        return {"error": "No image uploaded"}

    # Record submission time
    submitted_time = time.time()
    ai_processing_start_time = time.time()
    
    # Generate unique disaster ID
    disaster_id = generate_geohash_date_uuid(latitude, longitude)
    
    image_bytes = await image.read()
    
    # Upload image to Firebase Storage
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
        "image_url": image_url
    }

    # Process with AI
    final_state = graph.invoke(initial_state)
    
    # Record AI processing end time
    ai_processing_end_time = time.time()
    final_state["ai_processing_end_time"] = ai_processing_end_time
    
    # Calculate processing time
    processing_time = ai_processing_end_time - ai_processing_start_time
    
    # Save to Firebase Realtime Database
    save_success = save_to_realtime_database(final_state, disaster_id, processing_time)
    
    if not save_success:
        return {"error": "Failed to save disaster report to database"}

    return {
        "disaster_id": disaster_id,
        "government_report": final_state["government_report"],
        "citizen_survival_guide": final_state["citizen_survival_guide"],
        "processing_time": processing_time,
        "image_url": image_url,
        "status": final_state["status"]
    }

