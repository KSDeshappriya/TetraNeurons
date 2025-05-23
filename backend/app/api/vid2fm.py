from fastapi import FastAPI, UploadFile, File, APIRouter
from fastapi.responses import StreamingResponse
import cv2
import numpy as np
import io
import tempfile

router = APIRouter(prefix="/f", tags=["video to frames"])

@router.post("/vd2fm")
async def process_video(file: UploadFile = File(...)):
    return {"message": "Video to Frame not implemented"}