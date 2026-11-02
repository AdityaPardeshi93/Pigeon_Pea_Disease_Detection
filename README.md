# Pigeon Pea Leaf Disease Detection

A web-based AI application for detecting and classifying diseases in pigeon pea leaves using deep learning. This system helps farmers and agricultural professionals identify leaf diseases quickly and get actionable treatment recommendations.

## Features

- **AI-Powered Disease Detection**: Uses a trained Convolutional Neural Network (CNN) model to classify pigeon pea leaf diseases
- **Image Validation**: Integrated validator model ensures only pigeon pea leaf images are processed, preventing false predictions
- **Four Disease Classes**: Detects Healthy, Leaf Spot, Leaf Webber, and Sterilic Mosaic
- **Comprehensive Information**: Provides disease description, causes, organic and chemical treatments, and prevention methods
- **Interactive Visualization**: Real-time confidence scores with probability charts using Chart.js
- **Beautiful UI**: Modern nature-themed design with glass morphism effects and smooth animations
- **Drag & Drop Upload**: Easy image upload with preview functionality.

## Tech Stack

- **Backend**: Flask, Flask-CORS
- **Deep Learning**: TensorFlow/Keras
- **Frontend**: HTML5, CSS3, JavaScript
- **Image Processing**: PIL (Pillow), NumPy
- **Visualization**: Chart.js
- **Styling**: Font Awesome, Google Fonts (Poppins)

## Models

- `pigeon_pea_validator.keras` - Validates if uploaded image is a pigeon pea leaf
- `pigeon_pea_disease_model.keras` - Classifies pigeon pea leaf diseases into 4 categories

## Disease Classes

| Class | Description | Severity |
|---|---|---|
| **Healthy** | No signs of disease | None |
| **Leaf Spot** | Fungal disease caused by Cercospora/Alternaria spp. | Moderate to High |
| **Leaf Webber** | Pest infestation by Helicoverpa armigera larvae | Moderate to Severe |
| **Sterilic Mosaic** | Viral disease transmitted by eriophyid mites | High |

## Installation

1. Clone the repository:
```bash
git clone https://github.com/AdityaPardeshi93/Pigeon_Pea_Disease_Detection.git
cd Pigeon_Pea_Disease_Detection
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python app.py
```

4. Open your browser and navigate to `http://localhost:5000`

## Usage

1. Go to the "Detect" section or click "Start Detection"
2. Upload a pigeon pea leaf image (drag & drop or browse)
3. Click "Detect Disease" to analyze
4. View results including prediction, confidence, severity, treatment recommendations, and probability chart
5. If uploaded image is not a pigeon pea leaf, the validator will show an invalid image message

## Project Structure

```
Pigeon_Pea_Disease_Detection/
├── app.py                      # Flask backend with model integration
├── requirements.txt            # Python dependencies
├── pigeon_pea_validator.keras  # Validator model
├── pigeon_pea_disease_model.keras # Disease classification model
├── static/
│   ├── css/
│   │   └── style.css          # Frontend styles
│   └── js/
│       └── script.js         # Frontend logic
└── templates/
    └── index.html             # Main HTML template
```

## How It Works

1. **Image Upload**: User uploads an image through the web interface
2. **Validation**: The validator model checks if the image is a pigeon pea leaf
3. **Disease Prediction**: If valid, the disease classification model predicts the disease class
4. **Results Display**: Comprehensive information and recommendations are shown to the user

## SPM Project

This project was developed as part of the SPM (Software Project Management) course.

## License

This project is for educational purposes.
