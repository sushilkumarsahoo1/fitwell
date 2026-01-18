# TFLite Food Recognition Setup Guide

## Overview

This guide explains how to set up TensorFlow Lite (TFLite) for on-device food recognition in your Fitwell app.

## Why TFLite?

✅ Runs completely offline (no internet needed)
✅ Lightweight and fast
✅ Preserves user privacy
✅ No API costs
✅ Works on mobile devices

## Setup Steps

### 1. Install Required Package

For React Native + Expo, use:

```bash
npm install @react-native-ml-kit/vision-camera react-native-vision-camera
# OR
npm install @react-native-pytorch-core pytorch-react-native
```

**Recommended for Expo**: Use EAS Build with custom native code

### 2. Get a Pre-trained Food Model

Download a TFLite food classification model (100% on-device, no external APIs):

**Option A: Pure TensorFlow Source ⭐ RECOMMENDED**

```bash
cd src/assets/models
curl -L https://github.com/tensorflow/tflite-support/raw/master/tensorflow_lite_support/examples/task/vision/desktop/models/efficientnet_lite0_uint8_2.tflite -o food_classifier.tflite
```

- Size: 5MB | Speed: 50-100ms | Accuracy: 77%
- **Official TensorFlow repository**

**Option B: Alternative TFLite Model**

```bash
cd src/assets/models
curl -L https://huggingface.co/spaces/jbilcke-hf/hf-agora/resolve/main/models/mobilenet_v2.tflite -o food_classifier.tflite
```

- Size: 14MB | Speed: 50-100ms | Accuracy: 71%
- **Still TFLite format, 100% on-device**

**Option C: GitHub Alternative**

```bash
cd src/assets/models
curl -L https://github.com/rwightman/pytorch-image-models/releases/download/v0.1-weights/mobilenetv2_100-1e6066e7.tflite -o food_classifier.tflite
```

- Size: 9MB | Speed: Fast | Accuracy: 75%
- **Pure GitHub source**

### 3. Add Model to Your App

Place the `.tflite` file in your assets:

```
src/
├── assets/
│   └── models/
│       └── food_classification_model.tflite
```

### 4. Load and Run Model

```typescript
// In foodRecognitionService.ts
import { TensorflowLiteContext } from "@react-native-ml-kit/vision-camera";

// Initialize model
const model = await TensorflowLiteContext.loadModel(
  require("../assets/models/food_classification_model.tflite"),
);

// Run inference on image
const predictions = await model.runInference(imageData);
```

### 5. Integrate with Food Database

The flow:

```
📸 Image → TFLite Model → Food name (e.g., "Biryani")
    ↓
Search Supabase for "Biryani"
    ↓
Display matching foods with nutrition
    ↓
User logs the food
```

## Current Implementation Status

**✅ Completed:**

- Service structure created
- Hook for Supabase search ready
- UI screen built
- Food logging logic ready

**⏳ To Complete:**

1. Choose and download a TFLite model
2. Add to app assets
3. Install TFLite library (needs EAS build)
4. Implement inference in `runTFLiteInference()`
5. Test on device

## Model Recommendations

### For Quick Start (Beginner):

- MobileNetV2 (from Hugging Face)
- File: `food_classifier.tflite`
- Size: 14MB | Accuracy: 71%
- Download time: ~2-5 min on typical internet
- **✅ Recommended for testing**

### For Production (Better Accuracy):

- Food Classification v1 (Google)
- File: `food_classifier.tflite`
- Size: ~5MB
- Accuracy: ~80%

### For Best Results (Specialized):

- Food-101 Dataset Model
- Size: ~25MB
- Accuracy: ~88%

## EAS Build Setup (Required for Native Code)

Since TFLite needs native bindings, you'll need EAS:

```bash
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```

## Testing

Test with these food images:

- Indian: Biryani, Dosa, Naan, Curry
- Packaged: Bread, Cereal, Chips
- Global: Pizza, Pasta, Sushi, Rice

## Troubleshooting

**Model not loading?**

- Check file path
- Verify file exists
- Check file permissions

**Inference too slow?**

- Reduce image resolution before inference
- Use quantized model (smaller size)

**Low accuracy?**

- Try different model
- Pre-process image (crop, rotate)
- Fine-tune model on your dataset

## Next Steps

1. Choose a TFLite model above
2. Download the `.tflite` file
3. Add to `src/assets/models/`
4. Install required packages
5. Implement `runTFLiteInference()` function
6. Build with EAS
7. Test on device

## Resources

- TensorFlow Lite: https://www.tensorflow.org/lite
- Models: https://tfhub.dev/
- React Native TFLite: https://github.com/tensorflow/examples/tree/master/lite/examples/image_classification/android
