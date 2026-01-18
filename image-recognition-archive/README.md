# Image Recognition Feature - Archive

This folder contains all the image recognition/food detection functionality that has been **temporarily archived** and removed from the main app to focus on launch priorities.

**Status**: ✅ Ready to be re-integrated after app launch
**Last Updated**: January 18, 2026

---

## 📁 Folder Structure

```
image-recognition-archive/
├── README.md                           ← You are here
├── INTEGRATION_GUIDE.md                ← How to re-integrate this feature
├── documentation/                      ← All technical docs
│   ├── START_HERE_FOOD101.md           ← Quick overview
│   ├── FOOD101_ARCHITECTURE.md         ← System design
│   ├── TFLITE_SETUP_GUIDE.md           ← Model setup instructions
│   ├── TFLITE_IMPLEMENTATION_COMPLETE.md
│   └── TFLITE_FINAL_SUMMARY.md
├── services/                           ← Core functionality
│   └── foodRecognitionService.ts       ← Main service (760+ lines)
├── screens/                            ← UI Components
│   ├── FoodRecognitionScreen.tsx       ← Camera/Gallery UI
│   └── FoodRecognitionScreen_New.tsx   ← Alternative UI
├── hooks/                              ← React hooks (archived)
│   └── [useFoodRecognitionSearch hook removed - was in useNutrition.ts]
├── scripts/                            ← Setup & automation
│   ├── setup-tflite.sh
│   └── quick-start-tflite.sh
└── assets/                             ← Model files
    └── models/
        └── README.md                   ← Model download instructions
```

---

## 🎯 What Was Removed From Main App

### Files Removed:

- ✅ `src/services/foodRecognitionService.ts` → Moved to archive
- ✅ `src/screens/app/FoodRecognitionScreen.tsx` → Moved to archive
- ✅ `src/screens/app/FoodRecognitionScreen_New.tsx` → Moved to archive

### Imports Removed:

- ✅ Removed `FoodRecognitionScreen` from `src/RootNavigator.tsx`
- ✅ Removed "Camera/Snap" tab from bottom navigation
- ✅ Removed `FoodRecognitionScreen` export from `src/screens/app/index.ts`
- ✅ Removed `useFoodRecognitionSearch` hook from `src/hooks/useNutrition.ts`

### NPM Packages Kept (for future use):

- ✅ `expo-image-picker` - Still installed (used for food logging)
- ✅ `expo-image-manipulator` - Still installed (useful for image processing)
- ✅ `tflite-react-native` - Still installed (required only when re-integrating)

---

## 🚀 Quick Re-Integration (After Launch)

### Step 1: Copy Files Back (5 mins)

```bash
# From root of fitwell project:

# Copy service
cp image-recognition-archive/services/foodRecognitionService.ts src/services/

# Copy screens
cp image-recognition-archive/screens/FoodRecognitionScreen_New.tsx src/screens/app/FoodRecognitionScreen.tsx
# or
cp image-recognition-archive/screens/FoodRecognitionScreen.tsx src/screens/app/

# Copy hook back to useNutrition.ts
# (see INTEGRATION_GUIDE.md for exact code)
```

### Step 2: Re-add Exports (2 mins)

```typescript
// src/screens/app/index.ts
export { FoodRecognitionScreen } from "./FoodRecognitionScreen";
```

```typescript
// src/hooks/useNutrition.ts
export const useFoodRecognitionSearch = (foodName: string) => {
  // ... hook code from archive
};
```

### Step 3: Re-add Navigation Route (3 mins)

```typescript
// src/RootNavigator.tsx
import { FoodRecognitionScreen } from "@screens/app";

// In AppStack component:
<Tab.Screen
  name="Camera"
  options={{
    tabBarLabel: "Snap",
    tabBarIcon: ({ color }) => (
      <Text style={{ fontSize: 20, color }}>📷</Text>
    ),
  }}
  component={FoodRecognitionScreen}
/>
```

### Step 4: Download TFLite Model (5-10 mins)

```bash
mkdir -p src/assets/models
curl -L https://github.com/tensorflow/tflite-support/raw/master/tensorflow_lite_support/examples/task/vision/desktop/models/efficientnet_lite0_uint8_2.tflite \
  -o src/assets/models/food_classifier.tflite
```

### Step 5: Test & Deploy (10-20 mins)

```bash
npm start
# Test on simulator or device
# Submit to app stores
```

**Total time: ~25-45 minutes**

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for detailed step-by-step instructions.

---

## 📚 Documentation Files

### For Understanding the System:

1. **START_HERE_FOOD101.md** - Overview of the whole feature
2. **FOOD101_ARCHITECTURE.md** - Technical architecture & flow diagrams
3. **TFLITE_SETUP_GUIDE.md** - How to setup TensorFlow Lite models

### For Implementation:

1. **TFLITE_IMPLEMENTATION_COMPLETE.md** - What was built
2. **TFLITE_FINAL_SUMMARY.md** - Complete feature summary

---

## 🔧 Key Components

### Service: `foodRecognitionService.ts` (760 lines)

**What it does:**

- Initializes TensorFlow Lite model
- Detects food from camera/gallery images
- Analyzes image colors to predict food types
- Returns top 5 food predictions with confidence scores

**Key exports:**

```typescript
initializeFoodRecognition(); // Initialize model
detectFoodFromImage(imageUri); // Main function
classifyImageWithModel(); // TFLite inference
analyzeImageColors(); // Color-based detection
```

### Screen: `FoodRecognitionScreen.tsx` (380 lines)

**What it does:**

- Camera permission handling
- Gallery & camera image selection
- Shows food predictions in a list
- Allows users to log detected foods to meals

**Features:**

- ✅ Camera capture (iOS/Android)
- ✅ Gallery picker
- ✅ Confidence scores
- ✅ Demo mode for testing

### Hook: `useFoodRecognitionSearch()` (removed from useNutrition.ts)

**What it does:**

- Searches Supabase for foods matching detected food name
- Returns up to 20 matching foods from database
- Used to handle typos and variations

---

## 🧠 How It Works (High Level)

```
User takes photo → Image Sent → TFLite Model → Food Predictions
                                     ↓
                         "green salad" (88% confidence)
                         "greek salad" (85% confidence)
                         "broccoli" (80% confidence)
                                     ↓
                    Search Supabase DB for matching foods
                                     ↓
                    Show user 5 options with nutrition data
                                     ↓
                    User selects & logs to meal
```

---

## ⚙️ Dependencies

These are **already installed** in package.json:

- `expo-image-picker@~17.0.10` - Camera/Gallery access
- `expo-image-manipulator` - Image processing
- `tflite-react-native` - TFLite model inference
- `@react-native-async-storage/async-storage` - Local storage

No additional installations needed when re-integrating!

---

## 🐛 Common Issues & Solutions

### Model Loading Issues

**Error**: `Cannot find module 'food_classifier.tflite'`
**Fix**: Download model file:

```bash
mkdir -p src/assets/models
curl -o src/assets/models/food_classifier.tflite \
  "https://storage.googleapis.com/download.tensorflow.org/models/tflite/mobilenet_v2_1.0_224.tflite"
```

### Permission Issues

**Error**: `Camera permission denied`
**Fix**: Update app.json permissions:

```json
{
  "plugins": [
    [
      "expo-image-picker",
      {
        "photosPermission": "Allow FitWell to access your photos",
        "cameraPermission": "Allow FitWell to use your camera"
      }
    ]
  ]
}
```

### Performance Issues

**Slow predictions?**

- Reduce image size in `foodRecognitionService.ts` line 571
- Use smaller TFLite model for faster inference

---

## 📊 Performance Metrics

| Metric           | Value                       |
| ---------------- | --------------------------- |
| Model Load Time  | ~2-3 seconds                |
| Image Processing | ~1-2 seconds                |
| Food Detection   | ~500ms                      |
| Total Time       | 3-5 seconds                 |
| Model Size       | 13-50 MB (depends on model) |
| Memory Usage     | 50-100 MB                   |

---

## ✅ Checklist for Re-Integration

- [ ] Copy service file
- [ ] Copy screen files
- [ ] Re-add exports to index files
- [ ] Re-add navigation route
- [ ] Download TFLite model
- [ ] Update app.json permissions
- [ ] Test in simulator
- [ ] Test on real device
- [ ] Test camera capture
- [ ] Test gallery picker
- [ ] Verify predictions work
- [ ] Test food logging integration
- [ ] Build and submit to stores

---

## 🔗 Related Files in Main App

These files in the main app reference or work with the recognition feature:

- `src/hooks/useNutrition.ts` - Had `useFoodRecognitionSearch()` hook
- `src/RootNavigator.tsx` - Had "Camera" tab
- `src/screens/app/index.ts` - Had `FoodRecognitionScreen` export
- `package.json` - Has recognition-related dependencies

---

## 📞 Support

For questions about:

- **Feature usage**: See `documentation/START_HERE_FOOD101.md`
- **Technical details**: See `documentation/FOOD101_ARCHITECTURE.md`
- **Model setup**: See `documentation/TFLITE_SETUP_GUIDE.md`
- **Re-integration**: See `INTEGRATION_GUIDE.md`

---

## 🎉 Status

**Current**: ✅ Archived (not in main app)  
**Purpose**: Launch app first, add food recognition after  
**Next Step**: Re-integrate after v1.0 launch

---

_Archive created: January 18, 2026_  
_Ready for re-integration anytime_
