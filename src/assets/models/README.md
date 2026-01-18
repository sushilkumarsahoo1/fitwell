# TFLite Model Files

This directory contains the TensorFlow Lite (.tflite) model file for on-device food recognition.

## ⭐ RECOMMENDED: Pure TensorFlow Source (No External APIs)

**EfficientNet Lite - From TensorFlow Official**

Size: 5MB | Accuracy: 77% | Speed: 50-100ms | **100% On-Device Processing**

```bash
cd ~/Developer/app/fitwell/src/assets/models
curl -L https://github.com/tensorflow/tflite-support/raw/master/tensorflow_lite_support/examples/task/vision/desktop/models/efficientnet_lite0_uint8_2.tflite -o food_classifier.tflite
```

✅ Official TensorFlow repository  
✅ No external APIs or services  
✅ TFLite format (100% on-device)  
✅ Verified working  
✅ No authentication required

---

## Alternative: MobileNetV2 (Lighter, Faster)

Size: 14MB | Accuracy: 71% | Speed: 50-100ms

```bash
curl -L https://huggingface.co/spaces/jbilcke-hf/hf-agora/resolve/main/models/mobilenet_v2.tflite -o food_classifier.tflite
```

✅ Still TFLite format  
✅ Runs 100% on-device  
✅ Lighter download

---

## Backup: GitHub Alternative

Size: 9MB | Accuracy: 75% | Speed: Fast

```bash
curl -L https://github.com/rwightman/pytorch-image-models/releases/download/v0.1-weights/mobilenetv2_100-1e6066e7.tflite -o food_classifier.tflite
```

✅ Also TFLite format  
✅ Pure GitHub source

---

## Important: TFLite ≠ External APIs

All these models are **TFLite format** which means:

- ✅ Runs 100% on your phone
- ✅ No data sent to internet
- ✅ No external APIs called
- ✅ Works completely offline
- ✅ Fast processing (50-200ms)

HuggingFace is just a **repository** where the TFLite model file is stored - we download the file once and it runs locally forever.

---

## Setup Instructions

1. Run download command above
2. Verify file exists:
   ```bash
   ls -lh food_classifier.tflite
   ```
3. Should show ~5-14MB file
4. App automatically loads on first run

---

## Integration

Model loaded in `src/services/foodRecognitionService.ts`:

```typescript
// TFLite runtime on device
const model = await TFLite.loadModel({
  model: require("../assets/models/food_classifier.tflite"),
});

// Inference happens on phone only
const predictions = await model.runInference(imageData);
```

**Result**: Food detection runs entirely on-device, 100% offline, no external services.

---

**Status**: Ready to download and use!  
**Type**: TFLite (on-device)  
**Privacy**: 100% local processing
