from firebase_admin import firestore
from fastapi import HTTPException
from app.models.user import UserSignup, UserLogin, UserProfile, Token,Status
from app.services.jwt_service import JWTService
from datetime import datetime
import bcrypt
import uuid
import yaml

with open("trusted_domain.yaml", "r") as file:
    TRUSTED_DOMAINS = yaml.safe_load(file)

class AuthService:
    def __init__(self):
        self.db = firestore.client()
        self.jwt_service = JWTService()
    
    def is_domain_trusted(self, email: str, role: str) -> bool:
        domain = email.split('@')[-1].lower()
        if role == "government":
            return domain in TRUSTED_DOMAINS.get("gov", [])
        elif role == "first_responder":
            return domain in TRUSTED_DOMAINS.get("first_responders", [])
        return True  
    
    def hash_password(self, password: str) -> str:
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    def create_user(self, user_data: UserSignup):
        try:
            if self.db.collection("users").where("email", "==", user_data.email).get():
                raise HTTPException(status_code=400, detail="Email already registered")

            if not self.is_domain_trusted(user_data.email, user_data.role):
                raise HTTPException(status_code=403, detail=f"Email domain not allowed for role: {user_data.role}")

            user_uid = str(uuid.uuid4())
            hashed_password = self.hash_password(user_data.password)

            user_doc = {
                "uid": user_uid,
                "name": user_data.name,
                "email": user_data.email,
                "phone": user_data.phone,
                "latitude": user_data.latitude,
                "longitude": user_data.longitude,
                "profile_image_url": user_data.profile_image_url,
                "role": user_data.role,
                "password_hash": hashed_password,
                "created_at": datetime.now().isoformat()
            }

            if user_data.role != "government":
                user_doc["status"] = Status.NORMAL

            if user_data.role == "volunteer":
                if user_data.skills:
                    user_doc["skills"] = user_data.skills

            elif user_data.role in {"first_responder", "government"}:
                if user_data.department:
                    user_doc["department"] = user_data.department
                if user_data.role == "first_responder" and user_data.unit:
                    user_doc["unit"] = user_data.unit
                if user_data.role == "government" and user_data.position:
                    user_doc["position"] = user_data.position

            self.db.collection("users").document(user_uid).set(user_doc)

            return {"message": "User created successfully", "uid": user_uid}

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    def login_user(self, login_data: UserLogin):
        try:
            users = self.db.collection("users").where("email", "==", login_data.email).get()
            
            if not users:
                raise HTTPException(status_code=401, detail="Invalid email or password")
            
            user_doc = users[0]
            user_data = user_doc.to_dict()

            
            if not self.verify_password(login_data.password, user_data["password_hash"]):
                raise HTTPException(status_code=401, detail="Invalid email or password")
            
            token_payload = {
                "uid": str(user_data["uid"]),
                "email": str(user_data["email"]),
                "role": str(user_data["role"]),
                "name": str(user_data["name"])
            }
            
            try:
                access_token = self.jwt_service.create_access_token(data=token_payload)
                print("Access token created successfully")
            except Exception as jwt_error:
                print(f"JWT creation error: {jwt_error}")
                print(f"JWT error type: {type(jwt_error)}")
                raise
            
            # Create user_info dictionary with careful type handling
            user_info = {}
            for key, value in user_data.items():
                if key != "password_hash":
                    if value is None:
                        user_info[key] = None
                    elif isinstance(value, (str, int, float, bool)):
                        user_info[key] = value
                    elif isinstance(value, list):
                        user_info[key] = value
                    elif isinstance(value, dict):
                        user_info[key] = value
                    else:
                        # Convert everything else to string
                        user_info[key] = str(value)
            
            token_data = {
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": self.jwt_service.access_token_expire_minutes * 60,
                "user_info": user_info
            }
            
            return Token(**token_data)
            
        except Exception as e:
            print(f"Login error: {e}")
            print(f"Error type: {type(e)}")
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=400, detail=str(e))
      
    def verify_token(self, token: str):
        return self.jwt_service.verify_token(token)
    
    def get_user_profile(self, uid: str):
        try:
            user_doc = self.db.collection("users").document(uid).get()
            if not user_doc.exists:
                raise HTTPException(status_code=404, detail="User not found")
            
            user_data = user_doc.to_dict()
            user_data.pop("password_hash", None)
            return UserProfile(**user_data)
            
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=400, detail=str(e))
