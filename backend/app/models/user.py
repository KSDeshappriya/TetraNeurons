from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum

class UserRole(str, Enum):
    FIRST_RESPONDER = "first_responder"
    VOLUNTEER = "volunteer"
    USER = "user"
    GOVERNMENT = "government"

class BaseUser(BaseModel):
    name: str
    email: EmailStr
    phone: str
    latitude: float
    longitude: float
    profile_image_url: Optional[str] = None

class UserSignup(BaseUser):
    password: str
    role: UserRole
    skills: Optional[List[str]] = None  # for volunteers
    department: Optional[str] = None   # for first_responders and government
    unit: Optional[str] = None         # for first_responders
    position: Optional[str] = None     # for government

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseUser):
    uid: str
    role: UserRole
    created_at: str
    skills: Optional[List[str]] = None
    department: Optional[str] = None
    unit: Optional[str] = None
    position: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user_info: dict