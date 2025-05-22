from fastapi import APIRouter, Depends
from app.services.role_service import require_any_role
from app.models.user import UserProfile

router = APIRouter(prefix="/private", tags=["Private - Any Authenticated User"])

@router.get("/profile")
def get_private_profile(current_user: UserProfile = Depends(require_any_role)):
    return {
        "message": "Private area",
        "user": current_user.name,
        "role": current_user.role
    }
