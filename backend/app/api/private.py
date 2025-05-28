from fastapi import APIRouter, Depends ,Query,HTTPException
from typing import List
from fastapi.responses import JSONResponse
from app.models.user import UserProfile
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.services.auth_service import AuthService
from app.services.check_disaster import get_nearby_disasters

router = APIRouter(prefix="/private", tags=["Private - Any Authenticated User"])
security = HTTPBearer()
auth_service = AuthService()

@router.get("/profile", response_model=UserProfile)
def get_profile(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    token_payload = auth_service.verify_token(token)
    uid = token_payload["uid"]
    return auth_service.get_user_profile(uid)

@router.get("/nearby", response_model=List[UserProfile])
def nearby_check(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    latitude: float = Query(...),
    longitude: float = Query(...)
):
    try:
        data = get_nearby_disasters(latitude, longitude) 
        return JSONResponse(content=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))