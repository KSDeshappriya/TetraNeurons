from app.services.ml_model import analyze_image_with_summary, disaster_model, yolo_model, device
from io import BytesIO

async def handle_emergency_report(
    emergencyType,
    urgencyLevel,
    situation,
    peopleCount,
    latitude,
    longitude,
    image,
    user
):
    if (image is not None):
        image_bytes = await image.read()
        result = analyze_image_with_summary(BytesIO(image_bytes),disaster_model, yolo_model, device)
        print("AI Summary:", result)
