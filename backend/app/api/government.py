from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.services.role_service import require_government
from app.models.user import UserProfile
from firebase_admin import db,firestore
from uuid import uuid4

router = APIRouter(prefix="/gov", tags=["Government"])

class DisasterRequest(BaseModel):
    disaster_id: str

class ResourcePayload(BaseModel):
    disasterId: str
    data: dict

@router.post("/emergency/accept")
async def accept_disaster(payload: DisasterRequest, user: UserProfile = Depends(require_government)):
    try:
        ref = db.reference('disasters')
        ref.child(payload.disaster_id).update({'status': 'active'})
        print(f"Disaster {payload.disaster_id} marked as active by {user.name}")
        return {"message": f"Disaster {payload.disaster_id} marked as active."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.post("/emergency/reject")
async def reject_disaster(payload: DisasterRequest, user: UserProfile = Depends(require_government)):
    try:
        ref = db.reference('disasters')
        ref.child(payload.disaster_id).update({'status': 'archived'})
        return {"message": f"Disaster {payload.disaster_id} archived."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

@router.post("/resource/add")
async def add_resource(payload: ResourcePayload, user: UserProfile = Depends(require_government)):
    try:
        dbb = firestore.client()
        doc_ref = dbb.collection("resources").document(payload.disasterId)
        doc_ref.collection("items").add(payload.data)
        return {"message": "Resource added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add resource: {str(e)}")
