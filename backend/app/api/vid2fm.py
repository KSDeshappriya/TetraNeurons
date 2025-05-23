from fastapi import FastAPI, UploadFile, File, APIRouter
from fastapi.responses import StreamingResponse
import cv2
import numpy as np
import io
import tempfile

router = APIRouter(prefix="/f", tags=["video to frames"])

@router.post("/vd2fm")
async def process_video(file: UploadFile = File(...)):
    # Save the uploaded video to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
        temp_video.write(await file.read())
        temp_video_path = temp_video.name

    # Open the video file using OpenCV
    cap = cv2.VideoCapture(temp_video_path)
    if not cap.isOpened():
        return {"error": "Cannot open video file."}

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames < 9:
        return {"error": "Video has fewer than 9 frames."}

    # Calculate indices for 9 evenly spaced frames
    frame_indices = np.linspace(0, total_frames - 1, 9, dtype=int)

    frames = []
    for idx in frame_indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if not ret:
            continue
        # Resize frame to a standard size (e.g., 200x200)
        frame_resized = cv2.resize(frame, (200, 200))
        frames.append(frame_resized)

    cap.release()

    if len(frames) < 9:
        return {"error": "Could not extract 9 frames from the video."}

    # Combine frames into a 3x3 grid
    row1 = np.hstack(frames[0:3])
    row2 = np.hstack(frames[3:6])
    row3 = np.hstack(frames[6:9])
    combined_image = np.vstack([row1, row2, row3])

    # Encode the combined image to JPEG format
    _, img_encoded = cv2.imencode('.jpg', combined_image)
    img_bytes = img_encoded.tobytes()

    return StreamingResponse(io.BytesIO(img_bytes), media_type="image/jpeg")
