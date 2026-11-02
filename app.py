import os
import numpy as np
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from PIL import Image
import io
import base64

app = Flask(__name__)
CORS(app)

# Load the trained models once at startup
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pigeon_pea_disease_model.keras')
model = load_model(MODEL_PATH)
print("Disease model loaded successfully!")

VALIDATOR_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pigeon_pea_validator.keras')
validator_model = load_model(VALIDATOR_PATH)
print("Validator model loaded successfully!")

# Disease class names in order
CLASS_NAMES = ['Healthy', 'Leaf_Spot', 'Leaf_webber', 'Sterilic_mosaic']

# Comprehensive disease information
DISEASE_INFO = {
    'Healthy': {
        'description': 'The pigeon pea leaf shows no signs of disease. The plant is healthy with vibrant green color, normal leaf structure, and no visible spots, discoloration, or pest damage.',
        'causes': 'N/A - The plant is healthy.',
        'organic_treatment': 'Maintain good agricultural practices including proper spacing, adequate irrigation, and regular monitoring.',
        'chemical_treatment': 'No chemical treatment required.',
        'prevention': 'Continue regular crop monitoring, maintain soil health with organic compost, practice crop rotation, and ensure proper field sanitation.',
        'severity': 'None',
        'color': '#22c55e',
        'icon': 'fa-leaf'
    },
    'Leaf_Spot': {
        'description': 'Leaf Spot is a fungal disease caused by pathogens like Cercospora spp. or Alternaria spp. It appears as small, dark, water-soaked spots on leaves that enlarge into circular lesions with brown/grey centers and dark margins.',
        'causes': 'Fungal pathogens (Cercospora, Alternaria), high humidity, poor air circulation, overhead irrigation, and infected crop debris.',
        'organic_treatment': 'Remove and destroy infected leaves, apply neem oil spray (2-3 ml/liter water), use copper-based fungicides like Bordeaux mixture, and improve drainage.',
        'chemical_treatment': 'Apply fungicides like Mancozeb (0.2%), Carbendazim (0.1%), or Propiconazole (0.1%) at 10-15 day intervals. Spray early in the morning.',
        'prevention': 'Use disease-free seeds, practice crop rotation (avoid planting near previous pigeon pea fields), maintain proper plant spacing for air circulation, avoid overhead irrigation, and remove volunteer plants.',
        'severity': 'Moderate to High',
        'color': '#f59e0b',
        'icon': 'fa-virus'
    },
    'Leaf_webber': {
        'description': 'Leaf Webber is caused by the pest Helicoverpa armigera (Gram pod borer) or similar lepidopteran larvae. Caterpillars web leaves together and feed on leaf tissue, causing skeletonization and holes.',
        'causes': 'Infestation by Helicoverpa armigera larvae, favorable warm temperatures (25-30°C), and high humidity during flowering and pod formation stages.',
        'organic_treatment': 'Handpick larvae during early infestation, apply Bacillus thuringiensis (Bt) spray, use neem seed kernel extract (5%), introduce natural enemies like Trichogramma wasps.',
        'chemical_treatment': 'Apply insecticides like Quinalphos (0.05%), Chlorpyrifos (0.04%), or Spinosad (0.3 ml/liter) when 5-10% damage is observed. Target early larval stages.',
        'prevention': 'Deep summer plowing to expose pupae, grow trap crops like marigold, use light traps to monitor adult moths, apply pheromone traps, and intercropping with compatible crops.',
        'severity': 'Moderate to Severe',
        'color': '#ef4444',
        'icon': 'fa-bug'
    },
    'Sterilic_mosaic': {
        'description': 'Sterile Mosaic is a viral disease transmitted by the eriophyid mite Aceria cajani. It causes mosaic patterns of light and dark green areas on leaves, stunted growth, reduced flowering, and sterile or aborted pods.',
        'causes': 'Pigeon Pea Sterility Mosaic Virus (PPSMV) transmitted by the eriophyid mite Aceria cajani. Spread through infected plant debris, volunteer plants, and mite vectors.',
        'organic_treatment': 'Remove and destroy infected plants immediately, control mite vectors using sulfur dust or acaricidal oils, maintain field sanitation, and use reflective mulches.',
        'chemical_treatment': 'Apply acaricides like Wettable Sulfur (0.2%) or Dicofol (0.05%) to control mite vectors. No direct antiviral chemicals exist, so vector control is critical.',
        'prevention': 'Use resistant varieties like ICPL 87, destroy volunteer pigeon pea plants, practice roguing (remove infected plants), control weeds that harbor mites, and maintain proper field sanitation.',
        'severity': 'High',
        'color': '#dc2626',
        'icon': 'fa-disease'
    }
}

def preprocess_image(img):
    """Preprocess image for model prediction: RGB, resize to 224x224, normalize by /255.0"""
    img = img.convert('RGB')
    img = img.resize((224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0
    return img_array

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Read and preprocess image
        img_bytes = file.read()
        img = Image.open(io.BytesIO(img_bytes))
        processed_img = preprocess_image(img)
        
        # Step 1: Validate if image is a Pigeon Pea leaf
        validator_output = validator_model.predict(processed_img, verbose=0)
        validator_output = validator_output[0]
        
        # Handle both binary (sigmoid) and categorical (softmax) outputs
        if validator_output.shape[-1] == 1:
            is_pigeon_pea = float(validator_output[0]) > 0.5
            confidence = float(validator_output[0])
        else:
            is_pigeon_pea = int(np.argmax(validator_output)) == 0
            confidence = float(validator_output[0])
        
        if not is_pigeon_pea:
            # Convert image to base64 for preview even on invalid
            buffered = io.BytesIO()
            img.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode()
            
            return jsonify({
                'success': True,
                'invalid_image': True,
                'message': 'Invalid Image – Please upload a Pigeon Pea leaf',
                'validator_confidence': round(confidence * 100, 2),
                'image_base64': img_str
            })
        
        # Step 2: Predict disease
        predictions = model.predict(processed_img, verbose=0)
        predictions = predictions[0]
        
        # Get predicted class and confidence
        predicted_class_idx = np.argmax(predictions)
        predicted_class = CLASS_NAMES[predicted_class_idx]
        confidence = float(predictions[predicted_class_idx])
        
        # Get disease info
        disease_data = DISEASE_INFO[predicted_class]
        
        # Prepare probability data for all classes
        prob_data = []
        for i, class_name in enumerate(CLASS_NAMES):
            prob_data.append({
                'class': class_name,
                'probability': float(predictions[i]),
                'percentage': round(float(predictions[i]) * 100, 2)
            })
        
        # Convert image to base64 for preview
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return jsonify({
            'success': True,
            'invalid_image': False,
            'predicted_class': predicted_class,
            'confidence': round(confidence * 100, 2),
            'severity': disease_data['severity'],
            'description': disease_data['description'],
            'causes': disease_data['causes'],
            'organic_treatment': disease_data['organic_treatment'],
            'chemical_treatment': disease_data['chemical_treatment'],
            'prevention': disease_data['prevention'],
            'color': disease_data['color'],
            'icon': disease_data['icon'],
            'probabilities': prob_data,
            'image_base64': img_str
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
