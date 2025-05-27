from fastapi import APIRouter, Depends, UploadFile, File, Form,HTTPException
from app.services.role_service import require_user
from app.models.user import UserProfile
from typing import Optional
from app.services import emergency as emergency_service
from app.services.Request_Task_Generator import process_emergency_request

router = APIRouter(prefix="/user", tags=["Users"])

@router.get("/dashboard")
def user_dashboard(current_user: UserProfile = Depends(require_user)):
    return {
        "message": "User Dashboard",
        "user": current_user.name,
        "location": {"lat": current_user.latitude, "lng": current_user.longitude}
    }

# --- Emergency Report Endpoint ---
@router.post("/emergency/report")
async def emergency_report(
    emergencyType: str = Form(...),
    urgencyLevel: str = Form(...),
    situation: str = Form(...),
    peopleCount: str = Form(...),
    latitude: str = Form(...),
    longitude: str = Form(...),
    image: Optional[UploadFile] = File(None),
    current_user: UserProfile = Depends(require_user)
):
    # Call the emergency service function (placeholder for future logic)
    await emergency_service.handle_emergency_report(
        emergencyType=emergencyType,
        urgencyLevel=urgencyLevel,
        situation=situation,
        peopleCount=peopleCount,
        latitude=latitude,
        longitude=longitude,
        image=image,
        user=current_user
    )

    return {"status": "received"}

@router.post("/emergency/request")
async def report_emergency(
    disasterId: str = Form(...),
    help: str = Form(...),
    urgencyType: str = Form(...),
    latitude: str = Form(...),
    longitude: str = Form(...),
    current_user: UserProfile = Depends(require_user)
):
    try:
        if not all([disasterId, help, urgencyType, latitude, longitude]):
            raise HTTPException(status_code=400, detail="All fields are required")

        try:
            lat = float(latitude)
            lon = float(longitude)
            if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
                raise ValueError("Invalid coordinates")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid latitude or longitude")

        if urgencyType not in ["low", "medium", "high"]:
            raise HTTPException(status_code=400, detail="Invalid urgency type")

        try:
            result = await process_emergency_request(
                disaster_id=disasterId,
                user_id=current_user.uid,  
                help=help.strip(),
                urgency_type=urgencyType,
                latitude=latitude,
                longitude=longitude
            )
            
            return {
                "status": "received",
                "message": "Emergency request processed successfully",
                "task_id": result.get("generated_task", {}).get("task_id"),
                "user_request_saved": True
            }
            
        except Exception as e:
            print(f"Error processing emergency request: {e}")
            raise HTTPException(status_code=500, detail="Failed to process emergency request")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in report_emergency: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")