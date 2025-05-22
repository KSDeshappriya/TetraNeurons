from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.user import UserSignup, UserLogin, UserProfile, Token
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()
auth_service = AuthService()

@router.post("/signup")
def signup(user_data: UserSignup):
    return auth_service.create_user(user_data)

@router.post("/login", response_model=Token)
def login(login_data: UserLogin):
    return auth_service.login_user(login_data)

@router.get("/profile", response_model=UserProfile)
def get_profile(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    token_payload = auth_service.verify_token(token)
    uid = token_payload["uid"]
    return auth_service.get_user_profile(uid)

@router.get("/verify")
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    token_payload = auth_service.verify_token(token)
    return {"valid": True, "payload": token_payload}