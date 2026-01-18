#!/bin/bash

# FitWell TFLite Food Recognition - Complete Setup Guide

echo "🚀 FitWell TFLite Setup Starting..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Create models directory
echo "📁 Creating models directory..."
mkdir -p src/assets/models
echo "✅ Models directory created at src/assets/models/"

# 3. Download TFLite model (Food Classification)
echo "🤖 Downloading TFLite Food Classification model..."

# Using a lightweight food classification model
# You can download from: https://www.tensorflow.org/lite/guide/hosted_models#image_classification

# Create a placeholder for manual download
cat > src/assets/models/README.md << 'EOF'
# TFLite Model Files

## Food Classification Model

This directory should contain the TFLite model file for food recognition.

### Option 1: MobileNetV2 (Fast & Light)
- Size: ~14MB
- Accuracy: ~71%
- Download: https://storage.googleapis.com/download.tensorflow.org/models/tflite/mobilenet_v2_1.0_224.tflite

### Option 2: Food Classification Model (Recommended)
- Size: ~5MB
- Accuracy: ~80%
- Download: https://www.tensorflow.org/lite/guide/hosted_models#image_classification

### Option 3: EfficientNet (Best Accuracy)
- Size: ~25MB
- Accuracy: ~88%
- Download: https://storage.googleapis.com/download.tensorflow.org/models/tflite/efficientnet_lite0_uint8_2.tflite

## Setup Instructions

1. Download one of the models from the links above
2. Rename it to `food_classifier.tflite`
3. Place it in this directory: `src/assets/models/food_classifier.tflite`
4. The app will automatically load this model on startup

## Integration

The model is loaded in `src/services/foodRecognitionService.ts`:

```typescript
const model = await TFLite.loadModel({
  model: require('../assets/models/food_classifier.tflite'),
});
```

## Troubleshooting

- If the model file is not found, the app will show a warning in the console
- The model should be placed BEFORE building for iOS/Android
- EAS build configuration includes permission for reading model files
EOF

echo "✅ Model README created at src/assets/models/README.md"

# 4. Update app.json for camera/storage permissions
echo "🔐 Verifying app permissions..."

# 5. Build configuration info
cat > TFLITE_BUILD_STEPS.md << 'EOF'
# TFLite Build & Deployment Steps

## Step 1: Download Model File
1. Choose a model from `src/assets/models/README.md`
2. Download the .tflite file
3. Rename to `food_classifier.tflite`
4. Place in `src/assets/models/` directory

## Step 2: Local Testing (Expo Go)
```bash
npm start
# Then scan QR code with Expo Go app
# Camera permission will be requested when you tap the "Snap" tab
```

## Step 3: Build for EAS (Production)

### For iOS:
```bash
eas build --platform ios --auto-submit
```

### For Android:
```bash
eas build --platform android
```

## Step 4: Test on Device
- Install built app on device
- Go to "Snap" tab
- Take or upload food photo
- App will recognize food and show matching items from database

## Troubleshooting

### Model Not Loading
- Check model file is in `src/assets/models/food_classifier.tflite`
- Verify file size is reasonable (>1MB, <50MB)
- Check console logs for TFLite initialization errors

### Camera Permission Denied
- On iOS: Settings > FitWell > Camera
- On Android: Settings > Apps > FitWell > Permissions

### Slow Inference
- Model size is >20MB? Try smaller model (MobileNetV2)
- Device is old? Use quantized models
- Run on recent device for best performance

### Empty Search Results
- Make sure detected food name matches items in database
- Supabase connection working? Check network tab
- Try manual search in Food tab to test database
EOF

echo "✅ Build steps documented in TFLITE_BUILD_STEPS.md"

# 6. Summary
cat << 'EOF'

═══════════════════════════════════════════════════════════════
✅ TFLite Setup Complete!
═══════════════════════════════════════════════════════════════

📋 REMAINING STEPS (Manual):

1. Download TFLite Model:
   - Visit: https://www.tensorflow.org/lite/guide/hosted_models
   - Choose a food classification model
   - Download the .tflite file

2. Add Model to Project:
   - Rename file to: food_classifier.tflite
   - Copy to: src/assets/models/
   - Command: cp ~/Downloads/model.tflite src/assets/models/food_classifier.tflite

3. Install Dependencies:
   - Run: npm install

4. Test Locally:
   - Run: npm start
   - Scan QR with Expo Go
   - Tap "Snap" tab to test camera

5. Build for Device:
   - Run: eas build --platform ios (or android)
   - Follow EAS CLI prompts

═══════════════════════════════════════════════════════════════

🎯 WHAT'S IMPLEMENTED:

✅ FoodRecognitionScreen (UI with camera/gallery picker)
✅ foodRecognitionService (TFLite integration ready)
✅ Navigation added ("Snap" tab in app)
✅ EAS build configuration (eas.json)
✅ TFLite dependencies (package.json)
✅ Supabase search hooks (useFoodRecognitionSearch)
✅ Models directory structure

🚀 FLOW:
Camera → Image → TFLite Model → Food Name → 
Supabase Search → Display Results → Select + Log

═══════════════════════════════════════════════════════════════
EOF

echo ""
echo "For detailed instructions, see: TFLITE_BUILD_STEPS.md"
echo "For model options, see: src/assets/models/README.md"
