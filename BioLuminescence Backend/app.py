from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import torch
from torchvision.models.detection import fasterrcnn_resnet50_fpn, FasterRCNN_ResNet50_FPN_Weights
from torchvision.models.detection.faster_rcnn import FastRCNNPredictor
from PIL import Image
import numpy as np
import cv2
import json
import albumentations as A
from albumentations.pytorch import ToTensorV2
import base64
from io import BytesIO
import uuid
from collections import Counter

app = Flask(__name__)
CORS(app)

# --- CONFIGURATION ---
MODEL_WEIGHTS_PATH = './mixmodel.pth'  # Place your model file here
ANNOTATIONS_FILE_PATH = './mix_coco.json'  # Place your JSON file here
UPLOAD_FOLDER = './uploads'
RESULTS_FOLDER = './results'
CONFIDENCE_THRESHOLD = 0.8
IMAGE_SIZE = 512

# Create folders if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

# --- SETUP ---
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def get_model(num_classes):
    """Loads the Faster R-CNN model architecture."""
    weights = FasterRCNN_ResNet50_FPN_Weights.DEFAULT
    model = fasterrcnn_resnet50_fpn(weights=weights)
    in_features = model.roi_heads.box_predictor.cls_score.in_features
    model.roi_heads.box_predictor = FastRCNNPredictor(in_features, num_classes + 1)
    return model

def get_inference_transforms():
    """Defines the transformations for an input image."""
    return A.Compose([
        A.Resize(IMAGE_SIZE, IMAGE_SIZE),
        A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ToTensorV2(),
    ])

def get_high_contrast_colors():
    """Returns a list of high-contrast colors that are clearly visible against light brown backgrounds."""
    return [
        (0, 255, 255),    # Cyan
        (255, 0, 255),    # Magenta
        (0, 255, 0),      # Bright Green
        (255, 0, 0),      # Bright Red
        (0, 0, 255),      # Bright Blue
        (255, 255, 0),    # Bright Yellow
        (0, 255, 128),    # Spring Green
        (255, 128, 0),    # Orange
        (128, 0, 255),    # Purple
        (255, 0, 128),    # Hot Pink
        (0, 128, 255),    # Dodger Blue
        (128, 255, 0),    # Lime Green
        (255, 255, 255),  # White
        (0, 0, 0),        # Black
    ]

def draw_text_with_background(img, text, position, font, font_scale, color, thickness):
    """Draw text with a semi-transparent background for better visibility."""
    x, y = position
    
    # Get text size
    text_size = cv2.getTextSize(text, font, font_scale, thickness)[0]
    text_w, text_h = text_size
    
    # Create background rectangle (slightly larger than text)
    padding = 5
    bg_start = (x - padding, y - text_h - padding)
    bg_end = (x + text_w + padding, y + padding)
    
    # Draw semi-transparent background
    overlay = img.copy()
    cv2.rectangle(overlay, bg_start, bg_end, (0, 0, 0), -1)  # Black background
    cv2.addWeighted(overlay, 0.7, img, 0.3, 0, img)  # Blend with original
    
    # Draw white text on the background
    cv2.putText(img, text, position, font, font_scale, (255, 255, 255), thickness, cv2.LINE_AA)
    
    return img

def process_image(model, img_path, class_map, transform, device, threshold=0.5):
    """Runs inference on a single image and returns results with detailed counting."""
    model.eval()

    # Load and resize the image
    img_pil = Image.open(img_path).convert("RGB")
    img_np = np.array(img_pil)

    transformed = transform(image=img_np)
    img_tensor = transformed['image'].to(device).unsqueeze(0)

    # Run inference
    with torch.no_grad():
        preds = model(img_tensor)

    # Extract predictions
    boxes = preds[0]["boxes"].cpu().numpy()
    labels = preds[0]["labels"].cpu().numpy()
    scores = preds[0]["scores"].cpu().numpy()

    # Prepare resized image for drawing
    output_image = cv2.resize(img_np, (IMAGE_SIZE, IMAGE_SIZE))
    output_image = cv2.cvtColor(output_image, cv2.COLOR_RGB2BGR)

    detections = []
    detected_classes = []  # For counting species

    # Get high contrast colors
    high_contrast_colors = get_high_contrast_colors()

    # Draw detections
    for box, label, score in zip(boxes, labels, scores):
        if score > threshold:
            x1, y1, x2, y2 = map(int, box)
            
            # Get class name and high-contrast color
            class_name = class_map.get(label, f"ID:{label}")
            color = high_contrast_colors[label % len(high_contrast_colors)]

            # Add to detected classes for counting
            detected_classes.append(class_name)

            # Draw thicker bounding box for better visibility
            cv2.rectangle(output_image, (x1, y1), (x2, y2), color, 3)
            
            # Draw corner markers for extra visibility
            corner_size = 10
            # Top-left corner
            cv2.line(output_image, (x1, y1), (x1 + corner_size, y1), color, 4)
            cv2.line(output_image, (x1, y1), (x1, y1 + corner_size), color, 4)
            # Top-right corner
            cv2.line(output_image, (x2, y1), (x2 - corner_size, y1), color, 4)
            cv2.line(output_image, (x2, y1), (x2, y1 + corner_size), color, 4)
            # Bottom-left corner
            cv2.line(output_image, (x1, y2), (x1 + corner_size, y2), color, 4)
            cv2.line(output_image, (x1, y2), (x1, y2 - corner_size), color, 4)
            # Bottom-right corner
            cv2.line(output_image, (x2, y2), (x2 - corner_size, y2), color, 4)
            cv2.line(output_image, (x2, y2), (x2, y2 - corner_size), color, 4)

            # Prepare label text with better formatting
            text = f"{class_name}: {score:.2f}"
            text_position = (x1, max(y1 - 10, 20))
            
            # Draw text with background for maximum visibility
            output_image = draw_text_with_background(
                output_image, 
                text, 
                text_position,
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,  # Slightly larger font
                color,
                2  # Thicker text
            )
            
            # Store detection info
            detections.append({
                'class_name': class_name,
                'confidence': float(score),
                'bbox': [int(x1), int(y1), int(x2), int(y2)]
            })

    # Convert back to RGB
    output_image_rgb = cv2.cvtColor(output_image, cv2.COLOR_BGR2RGB)
    
    # Count species using Counter
    species_counts = Counter(detected_classes)
    total_count = len(detected_classes)
    unique_species = len(species_counts)
    
    # Create species summary
    species_summary = [
        {
            'species': species,
            'count': count,
            'percentage': round((count / total_count) * 100, 1) if total_count > 0 else 0
        }
        for species, count in species_counts.most_common()
    ]
    
    return output_image_rgb, detections, total_count, unique_species, species_summary

# Load model and setup (do this once when server starts)
print("Loading model...")
try:
    with open(ANNOTATIONS_FILE_PATH) as f:
        data = json.load(f)
    CLASS_MAP = {cat['id']: cat['name'] for cat in data['categories']}
    NUM_CLASSES = len(data['categories'])

    # Load model + weights
    inference_model = get_model(num_classes=NUM_CLASSES)
    inference_model.load_state_dict(torch.load(MODEL_WEIGHTS_PATH, map_location=DEVICE))
    inference_model.to(DEVICE)

    # Apply transforms
    transforms = get_inference_transforms()
    
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # Generate unique filename
        file_id = str(uuid.uuid4())
        filename = f"{file_id}.jpg"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        # Save uploaded file
        file.save(filepath)

        # Process the image
        processed_image, detections, total_count, unique_species, species_summary = process_image(
            model=inference_model,
            img_path=filepath,
            class_map=CLASS_MAP,
            transform=transforms,
            device=DEVICE,
            threshold=CONFIDENCE_THRESHOLD
        )

        # Save processed image
        result_filename = f"result_{filename}"
        result_filepath = os.path.join(RESULTS_FOLDER, result_filename)
        
        # Convert numpy array to PIL Image and save
        pil_image = Image.fromarray(processed_image)
        pil_image.save(result_filepath)

        # Convert image to base64 for frontend
        buffer = BytesIO()
        pil_image.save(buffer, format='JPEG')
        img_base64 = base64.b64encode(buffer.getvalue()).decode()

        # Clean up uploaded file
        os.remove(filepath)

        return jsonify({
            'success': True,
            'image': f"data:image/jpeg;base64,{img_base64}",
            'detections': detections,
            'total_count': total_count,
            'unique_species': unique_species,
            'species_summary': species_summary,
            'file_id': file_id
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
