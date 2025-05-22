from fastapi import APIRouter, Depends
from app.services.role_service import require_user
from app.models.user import UserProfile

router = APIRouter(prefix="/user", tags=["Users"])

@router.get("/dashboard")
def user_dashboard(current_user: UserProfile = Depends(require_user)):
    return {
        "message": "User Dashboard",
        "user": current_user.name,
        "location": {"lat": current_user.latitude, "lng": current_user.longitude}
    }
