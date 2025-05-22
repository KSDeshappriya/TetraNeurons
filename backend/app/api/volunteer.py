from fastapi import APIRouter, Depends
from app.services.role_service import require_volunteer
from app.models.user import UserProfile

router = APIRouter(prefix="/volunteer", tags=["Volunteers"])

@router.get("/dashboard")
def volunteer_dashboard(current_user: UserProfile = Depends(require_volunteer)):
    return {
        "message": "Volunteer Dashboard",
        "volunteer": current_user.name,
        "skills": current_user.skills
    }