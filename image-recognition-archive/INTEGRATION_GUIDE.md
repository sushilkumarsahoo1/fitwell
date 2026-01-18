# Re-Integration Guide: Image Recognition Feature

This guide provides step-by-step instructions for re-integrating the image recognition feature back into the main FitWell app after launch.

**Estimated Time**: 25-45 minutes  
**Difficulty**: Moderate  
**Prerequisites**: Existing FitWell app environment

---

## 🎯 Overview

The image recognition feature was archived to focus on core app functionality for launch. This guide shows how to add it back.

**What gets re-added:**

- Food recognition camera screen
- Image processing service
- Navigation routes
- Search hook

---

## ✅ Step 1: Copy Service Files (5 mins)

Copy the food recognition service back to the main app:

```bash
cd /Users/apple/Developer/app/fitwell

# Copy the recognition service
cp image-recognition-archive/services/foodRecognitionService.ts src/services/
```

**Verify:**

```bash
ls -la src/services/foodRecognitionService.ts
# Should show the file exists
```

---

## ✅ Step 2: Copy Screen Components (5 mins)

Copy the UI screens back:

```bash
cd /Users/apple/Developer/app/fitwell

# Copy the main screen (use the _New version as it's more complete)
cp image-recognition-archive/screens/FoodRecognitionScreen_New.tsx src/screens/app/FoodRecognitionScreen.tsx

# Or copy the original if you prefer
# cp image-recognition-archive/screens/FoodRecognitionScreen.tsx src/screens/app/
```

**Verify:**

```bash
ls -la src/screens/app/FoodRecognitionScreen.tsx
# Should show the file exists
```

---

## ✅ Step 3: Re-add Screen Export (2 mins)

Update the screen index to export FoodRecognitionScreen:

**File**: `src/screens/app/index.ts`

```typescript
export { DashboardScreen } from "./DashboardScreen";
export { FoodLoggingScreen } from "./FoodLoggingScreen";
export { FoodRecognitionScreen } from "./FoodRecognitionScreen";  ← ADD THIS LINE
export { WorkoutLoggingScreen } from "./WorkoutLoggingScreen";
export { ProgressScreen } from "./ProgressScreen";
export { SettingsScreen } from "./SettingsScreen";
```

---

## ✅ Step 4: Re-add Search Hook (3 mins)

Add the food search hook back to `src/hooks/useNutrition.ts`:

**File**: `src/hooks/useNutrition.ts`

Find the end of the file and add this function:

```typescript
export const useFoodRecognitionSearch = (foodName: string) => {
  return useQuery({
    queryKey: ["foodRecognition", foodName],
    queryFn: async () => {
      if (!foodName.trim()) {
        return [];
      }

      // Search in Supabase database by food name
      const searchTerm = foodName.toLowerCase().trim();
      const { data, error } = await supabase
        .from("foods")
        .select("*")
        .ilike("name", `%${searchTerm}%`)
        .limit(20); // Top 20 matches

      if (error) {
        console.error(
          "[useFoodRecognitionSearch] Error searching foods:",
          error,
        );
        throw error;
      }

      console.log(
        `[useFoodRecognitionSearch] Found ${data?.length || 0} foods matching "${foodName}"`,
      );
      return data || [];
    },
    enabled: !!foodName.trim(),
  });
};
```

---

## ✅ Step 5: Re-add Navigation Route (5 mins)

Update `src/RootNavigator.tsx` to add the Camera tab back:

**File**: `src/RootNavigator.tsx`

**Step 5a**: Add import

```typescript
// Find this section (around line 6-12):
import {
    DashboardScreen,
    FoodLoggingScreen,
    FoodRecognitionScreen,  ← ADD THIS LINE
    ProgressScreen,
    SettingsScreen,
    WorkoutLoggingScreen,
} from "@screens/app";
```

**Step 5b**: Add the tab navigation

Find the section with food logging tab (around line 130-145) and add the camera tab after it:

```typescript
      <Tab.Screen
        name="FoodLogging"
        options={{
          tabBarLabel: "Food",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🍔</Text>
          ),
        }}
        component={FoodLoggingScreen}
      />

      {/* ADD THIS BLOCK */}
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
      {/* END ADD */}

      <Tab.Screen
        name="Workout"
        options={{
          tabBarLabel: "Workout",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>💪</Text>
          ),
        }}
        component={WorkoutLoggingScreen}
      />
```

---

## ✅ Step 6: Download TFLite Model (5-10 mins)

The feature requires a pre-trained TensorFlow Lite model. Download it:

```bash
cd /Users/apple/Developer/app/fitwell

# Create models directory if it doesn't exist
mkdir -p src/assets/models

# Download the food classifier model (Option A - Recommended)
curl -L https://github.com/tensorflow/tflite-support/raw/master/tensorflow_lite_support/examples/task/vision/desktop/models/efficientnet_lite0_uint8_2.tflite \
  -o src/assets/models/food_classifier.tflite

# Or use this alternative (Option B)
# curl -L https://storage.googleapis.com/download.tensorflow.org/models/tflite/mobilenet_v2_1.0_224.tflite \
#   -o src/assets/models/food_classifier.tflite
```

**Verify the download:**

```bash
ls -lh src/assets/models/food_classifier.tflite
# Should show a file size of 10-50 MB (depending on model)
```

---

## ✅ Step 7: Update Permissions (3 mins)

Ensure camera and photo permissions are configured in `app.json`:

**File**: `app.json`

```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow FitWell to access your photos so you can recognize foods",
          "cameraPermission": "Allow FitWell to use your camera to capture food photos"
        }
      ]
    ]
  }
}
```

---

## ✅ Step 8: Install Dependencies (Already Done ✓)

These packages are already installed in `package.json`, so no action needed:

```json
{
  "dependencies": {
    "expo-image-picker": "~17.0.10",
    "expo-image-manipulator": "^11.1.1",
    "tflite-react-native": "latest"
  }
}
```

If any are missing, install:

```bash
npm install --legacy-peer-deps
```

---

## ✅ Step 9: Test Locally (10 mins)

### 9a: Clear cache and start

```bash
cd /Users/apple/Developer/app/fitwell

# Stop any running servers
pkill -f "expo start" || true
pkill -f "npm start" || true

# Clear cache and restart
npm start -- --clear-cache
```

### 9b: Test on simulator

```
Press 'i' for iOS simulator
or
Press 'a' for Android emulator
```

### 9c: Verify the Camera tab appears

- Look at bottom navigation
- Should see: Dashboard | Food | Snap | Workout | Progress | Settings
- Click on "Snap" tab

### 9d: Test functionality

1. **Test Camera Capture:**
   - Tap "Take Photo" button
   - Should show camera UI (may fail on simulator - normal)
   - Take a screenshot

2. **Test Gallery Picker:**
   - Tap "Choose from Gallery" button
   - Select an image from device
   - Should show food predictions

3. **Test Predictions:**
   - Verify predictions appear with confidence scores
   - Example: "Green Salad (88%)", "Broccoli (75%)"

4. **Test Food Logging:**
   - Tap on a predicted food
   - Should navigate to food logging
   - Food name should be pre-filled

---

## ✅ Step 10: Build & Test on Device (15 mins)

### Option A: Expo Go (Fast - Recommended for testing)

```bash
# Simply open Expo Go app on your device
# Scan QR code from terminal
# App will load and you can test
```

### Option B: EAS Build (Required for app store)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS
eas build --platform ios

# Or build for Android
eas build --platform android

# Download and install on device
```

### Option C: Local build (Advanced)

```bash
# For iOS
npm run ios

# For Android
npm run android
```

---

## 🧪 Validation Checklist

Before submitting to app stores, verify:

- [ ] **Navigation**: Camera tab appears in bottom navigation
- [ ] **Permissions**: App requests camera permission on first use
- [ ] **Camera**: Camera button opens camera (iOS) or shows permission dialog
- [ ] **Gallery**: Gallery button opens photo picker
- [ ] **Image Selection**: Can select image from gallery
- [ ] **Predictions**: Food predictions appear with scores
- [ ] **Performance**: Predictions load within 3-5 seconds
- [ ] **Logging**: Can tap prediction to log food to meal
- [ ] **Integration**: Food logging flow works correctly
- [ ] **No Crashes**: App doesn't crash when using camera feature
- [ ] **No Console Errors**: Check terminal for errors
- [ ] **Model Loading**: Console shows "[FoodRecognition] Model ready" message

---

## 🚨 Troubleshooting

### Error: "Cannot find module 'foodRecognitionService'"

**Cause**: File wasn't copied correctly  
**Fix**: Verify file exists:

```bash
ls -la src/services/foodRecognitionService.ts
# If missing, copy again from archive
cp image-recognition-archive/services/foodRecognitionService.ts src/services/
```

### Error: "FoodRecognitionScreen is not defined"

**Cause**: Export missing from index file  
**Fix**: Add to `src/screens/app/index.ts`:

```typescript
export { FoodRecognitionScreen } from "./FoodRecognitionScreen";
```

### Error: "Cannot find module 'food_classifier.tflite'"

**Cause**: Model file not downloaded  
**Fix**: Download model:

```bash
mkdir -p src/assets/models
curl -L https://github.com/tensorflow/tflite-support/raw/master/tensorflow_lite_support/examples/task/vision/desktop/models/efficientnet_lite0_uint8_2.tflite \
  -o src/assets/models/food_classifier.tflite
```

### Error: "Camera permission denied"

**Cause**: Permissions not requested in app.json  
**Fix**: Update app.json (see Step 7)

### Predictions are very slow (>10 seconds)

**Cause**: Model inference is slow  
**Fix**:

- Use a smaller TFLite model
- Reduce image resolution in service
- Reduce the number of predictions returned

### App crashes when taking camera photo

**Cause**: Common on iOS simulator  
**Fix**:

- Test on real device instead
- Use "Choose from Gallery" instead
- Check console for exact error

---

## 📊 Files Modified Summary

| File                                        | Changes                           |
| ------------------------------------------- | --------------------------------- |
| `src/services/foodRecognitionService.ts`    | ✅ RESTORED (760 lines)           |
| `src/screens/app/FoodRecognitionScreen.tsx` | ✅ RESTORED (380 lines)           |
| `src/screens/app/index.ts`                  | ✅ UPDATED (added export)         |
| `src/hooks/useNutrition.ts`                 | ✅ UPDATED (added hook)           |
| `src/RootNavigator.tsx`                     | ✅ UPDATED (added route & import) |
| `app.json`                                  | ✅ VERIFIED (permissions)         |
| `package.json`                              | ✅ VERIFIED (dependencies)        |

---

## 🎉 Success!

Once all steps are complete and validated, your app now has:

- ✅ Camera image capture
- ✅ Food recognition via AI
- ✅ Gallery image selection
- ✅ Food prediction with confidence scores
- ✅ Integration with meal logging
- ✅ Supabase database search

---

## 📞 Next Steps

1. **Test thoroughly** on real devices (iOS & Android)
2. **Submit to app stores** when ready
3. **Monitor crashes** after release
4. **Gather user feedback** on accuracy
5. **Iterate** on model or UI based on feedback

---

## 📚 Reference Docs

- `../documentation/FOOD101_ARCHITECTURE.md` - System architecture
- `../documentation/TFLITE_SETUP_GUIDE.md` - Model setup details
- `../documentation/START_HERE_FOOD101.md` - Feature overview

---

_Re-integration Guide v1.0_  
_Last Updated: January 18, 2026_  
_Estimated Success Time: 25-45 minutes_
