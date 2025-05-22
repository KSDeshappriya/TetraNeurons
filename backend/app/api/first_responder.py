from fastapi import APIRouter, Depends
from app.services.role_service import require_first_responder
from app.models.user import UserProfile

router = APIRouter(prefix="/firstrespond", tags=["First Responders"])

@router.get("/dashboard")
def responder_dashboard(current_user: UserProfile = Depends(require_first_responder)):
    return {
        "message": "First Responder Dashboard",
        "responder": current_user.name,
        "department": current_user.department,
        "unit": current_user.unit
    }
