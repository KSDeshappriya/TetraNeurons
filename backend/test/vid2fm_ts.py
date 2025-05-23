import os
import pytest
import numpy as np
import cv2
from fastapi.testclient import TestClient
from io import BytesIO
from PIL import Image

# Import the router or app (depends on your project structure)
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from app.api.vid2fm import router
from fastapi import FastAPI

# Create a FastAPI test app
app = FastAPI()
app.include_router(router)
client = TestClient(app)

@pytest.fixture
def sample_video_path():
    """Create a sample video file for testing."""
    # Create a temporary directory for test videos
    os.makedirs("test_videos", exist_ok=True)
    video_path = os.path.join("test_videos", "sample_video.mp4")
    
    # Create a test video if it doesn't exist
    if not os.path.exists(video_path):
        # Create a black video with white text labels
        height, width = 640, 480
        fps = 30
        seconds = 1  # 1-second video (30 frames at 30fps)
        
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(video_path, fourcc, fps, (width, height))
        
        for i in range(fps * seconds):
            frame = np.zeros((height, width, 3), dtype=np.uint8)
            # Add frame number as text
            cv2.putText(frame, f"Frame {i+1}", (width//3, height//2), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            out.write(frame)
        
        out.release()
    
    return video_path

def test_process_video_success(sample_video_path):
    """Test successful video processing."""
    with open(sample_video_path, "rb") as f:
        response = client.post(
            "/f/vd2fm",
            files={"file": ("test_video.mp4", f, "video/mp4")}
        )
    
    # Check response status code
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/jpeg"
    
    # Verify the response is a valid JPEG image
    img = Image.open(BytesIO(response.content))
    assert img.format == "JPEG"
    
    # Check image dimensions (3x3 grid, each cell 200x200)
    assert img.width == 600  # 3 frames * 200px width
    assert img.height == 600  # 3 frames * 200px height

def test_process_short_video():
    """Test with a video that has fewer than 9 frames."""
    # Create a very short video with just 5 frames
    short_video_path = os.path.join("test_videos", "short_video.mp4")
    
    height, width = 640, 480
    fps = 30
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(short_video_path, fourcc, fps, (width, height))
    
    for i in range(5):  # Only 5 frames
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        cv2.putText(frame, f"Frame {i+1}", (width//3, height//2), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        out.write(frame)
    
    out.release()
    
    with open(short_video_path, "rb") as f:
        response = client.post(
            "/f/vd2fm",
            files={"file": ("short_video.mp4", f, "video/mp4")}
        )
    
    # Should return an error
    assert response.status_code == 200  # The API returns errors with 200 status
    assert "error" in response.json()
    assert response.json()["error"] == "Video has fewer than 9 frames."

def test_invalid_file():
    """Test with an invalid file that is not a video."""
    # Create a text file instead of a video
    invalid_file_path = os.path.join("test_videos", "not_a_video.txt")
    with open(invalid_file_path, "w") as f:
        f.write("This is not a video file")
    
    with open(invalid_file_path, "rb") as f:
        response = client.post(
            "/f/vd2fm",
            files={"file": ("not_a_video.txt", f, "text/plain")}
        )
    
    # Should return an error
    assert response.status_code == 200  # The API returns errors with 200 status
    assert "error" in response.json()
    assert response.json()["error"] == "Cannot open video file."

def teardown_module(module):
    """Clean up test files after tests run."""
    import shutil
    if os.path.exists("test_videos"):
        shutil.rmtree("test_videos")