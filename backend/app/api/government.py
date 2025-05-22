from fastapi import APIRouter, Depends
from app.services.role_service import require_government
from app.models.user import UserProfile

router = APIRouter(prefix="/gov", tags=["Government"])

@router.get("/dashboard")
def government_dashboard(current_user: UserProfile = Depends(require_government)):
    return {
        "message": "Government Dashboard",
        "user": current_user.name,
        "role": current_user.role,
        "department": current_user.department,
        "position": current_user.position
    }