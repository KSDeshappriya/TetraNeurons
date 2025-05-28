from mcp.server.fastmcp import FastMCP
import requests
from typing import List, Dict, Optional, Any
from dotenv import load_dotenv
import os

load_dotenv()

mcp = FastMCP("Disaster Helper")

token = os.getenv('TOKEN')
base_url = "http://localhost:8000"
headers = {
    'Cookie': f'token={token}',
    'Content-Type': 'application/json'
}

# Utility: Get server's current location using IP geolocation
def get_current_location() -> tuple[float, float]:
    """Get current location using IP geolocation with proper error handling."""
    try:
        resp = requests.get("http://ip-api.com/json/", timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        if data.get("status") == "success":
            return float(data["lat"]), float(data["lon"])
        else:
            raise Exception(f"Geolocation API error: {data.get('message', 'Unknown error')}")
    except requests.RequestException as e:
        raise Exception(f"Failed to get location: {str(e)}")
    except (KeyError, ValueError, TypeError) as e:
        raise Exception(f"Invalid location data received: {str(e)}")

# Tool: Get nearby disasters
@mcp.tool()
def get_nearby_disasters() -> dict:
    """
    Query nearby disasters using the server's current location.
    """
    latitude, longitude = get_current_location()
    endpoint = f"{base_url}/private/nearby"
    auth_headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    params = {
        "latitude": latitude,
        "longitude": longitude
    }
    
    response = requests.get(endpoint, headers=auth_headers, params=params)
    
    if response.status_code != 200:
        error_msg = response.json().get('error', 'Unknown error')
        raise Exception(f"Failed to get nearby disasters: {error_msg}")
    
    return response.json()

# Tool: Report an emergency
@mcp.tool()
def report_emergency(
    disaster_id: int,
    help_text: str,
    urgency_type: str
) -> dict:
    """
    Report an emergency for a selected disaster using the server's current location.
    
    Args:
        disaster_id (string): The ID of the disaster you are reporting
        help_text (str): The description of the help needed.
        urgency_type (str): The urgency level, must be one of "low", "medium", or "high".
    
    urgency_type must be one of: "low", "medium", "high"
    """
    allowed_urgency = {"low", "medium", "high"}
    if urgency_type not in allowed_urgency:
        raise ValueError(f"urgency_type must be one of {allowed_urgency}, but got '{urgency_type}'")
    
    latitude, longitude = get_current_location()
    endpoint = f"{base_url}/user/emergency/request"
    auth_headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {
        "disasterId": disaster_id,
        "help": help_text,
        "urgencyType": urgency_type,
        "latitude": latitude,
        "longitude": longitude
    }
    
    response = requests.post(endpoint, headers=auth_headers, data=data)
    
    if response.status_code not in [200, 201]:
        error_msg = response.json().get('error', 'Unknown error')
        raise Exception(f"Failed to report emergency: {error_msg}")
    
    return response.json()