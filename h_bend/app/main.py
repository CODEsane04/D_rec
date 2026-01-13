from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import onnxruntime as ort
import numpy as np
from PIL import Image, ImageOps
import base64
import io
import os
from contextlib import asynccontextmanager

# Global variable to hold the ONNX session
ort_session = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the ML model
    global ort_session
    model_path = os.path.join(os.path.dirname(__file__), "../digits.onnx")
    try:
        ort_session = ort.InferenceSession(model_path)
        print(f"Model loaded from {model_path}")
    except Exception as e:
        print(f"Error loading model: {e}")
        # We might want to raise an error here if the model is critical
    yield
    # Clean up the ML models and release the resources
    ort_session = None

app = FastAPI(lifespan=lifespan)

# CORS configuration
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InputData(BaseModel):
    image: str

@app.get("/")
def root():
    return {"message": "FastAPI is running"}

@app.post("/predict")
async def predict(data: InputData):
    global ort_session
    if ort_session is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    try:
        # Step A: Decode Base64 string
        base64_image = data.image
        if "," in base64_image:
            base64_image = base64_image.split(",")[1]
        
        image_bytes = base64.b64decode(base64_image)

        # Step B: Image Loading
        image = Image.open(io.BytesIO(image_bytes))

        # Step C: Grayscale
        image = image.convert("L")

        # Step D: Inversion (CRITICAL)
        # User draws black on white, model expects white on black
        image = ImageOps.invert(image)

        # Step E: Resize
        image = image.resize((28, 28), resample=Image.Resampling.LANCZOS)

        # Step F: Normalization
        image_array = np.array(image).astype(np.float32)
        image_array = image_array / 255.0

        # Step G: Reshape
        # (1, 1, 28, 28) -> (Batch_Size, Channels, Height, Width)
        input_tensor = image_array.reshape(1, 1, 28, 28)

        # Step H: Inference
        input_name = ort_session.get_inputs()[0].name
        outputs = ort_session.run(None, {input_name: input_tensor})
        
        # Step I: Response
        # The output is typically a list of arrays, we take the first one
        logits = outputs[0][0] # Shape (10,)
        
        # Calculate probabilities using softmax (optional but good for confidence)
        # Simple softmax implementation
        exp_logits = np.exp(logits - np.max(logits))
        probs = exp_logits / exp_logits.sum()
        
        prediction = int(np.argmax(probs))
        confidence = float(probs[prediction])

        return {"prediction": prediction, "confidence": confidence}

    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
