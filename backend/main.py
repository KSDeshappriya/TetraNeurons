import firebase_admin
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import credentials
from dotenv import load_dotenv
load_dotenv()

cred = credentials.Certificate("./serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    'storageBucket': 'disaster-b6076.firebasestorage.app',
    'databaseURL': 'https://disaster-b6076-default-rtdb.firebaseio.com/'
})

# Import all routers (dont change the import position)
from app.api.auth import router as auth_router
from app.api.government import router as gov_router
from app.api.user import router as user_router
from app.api.first_responder import router as first_responder_router
from app.api.volunteer import router as volunteer_router
from app.api.private import router as private_router
from app.api.public import router as public_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)           
app.include_router(gov_router)            
app.include_router(user_router)           
app.include_router(first_responder_router) 
app.include_router(volunteer_router)      
app.include_router(private_router)        
app.include_router(public_router)         

@app.get("/")
def read_root():
    return {"status": "running"}
