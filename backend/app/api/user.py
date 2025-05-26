from fastapi import APIRouter, Depends, UploadFile, File, Form
from app.services.role_service import require_user
from app.models.user import UserProfile
from typing import Optional
from app.services import emergency as emergency_service

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
