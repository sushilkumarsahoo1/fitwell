#!/bin/bash

# FitWell TFLite Quick Start - Local Testing

set -e

echo "🚀 FitWell TFLite Quick Start"
echo "=============================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "📥 Install from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Check if in fitwell directory
if [ ! -f "package.json" ]; then
    echo "❌ Not in FitWell directory"
    echo "📍 Please run from: /Users/apple/Developer/app/fitwell"
    exit 1
fi

echo "📍 Working directory: $(pwd)"
echo ""

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps || npm install

echo "✅ Dependencies installed"
echo ""

# Step 2: Check models directory
echo "🔍 Checking models directory..."
if [ ! -d "src/assets/models" ]; then
    echo "📁 Creating models directory..."
    mkdir -p src/assets/models
fi

if [ ! -f "src/assets/models/food_classifier.tflite" ]; then
    echo "⚠️  Model file not found: src/assets/models/food_classifier.tflite"
    echo ""
    echo "📥 Download a model:"
    echo "   Option 1 (Fast): MobileNetV2"
    echo "   curl -o src/assets/models/food_classifier.tflite \\"
    echo "     https://storage.googleapis.com/download.tensorflow.org/models/tflite/mobilenet_v2_1.0_224.tflite"
    echo ""
    echo "   Option 2 (Balanced): Food Classification Model"
    echo "   Visit: https://www.tensorflow.org/lite/guide/hosted_models"
    echo ""
    echo "⏭️  Continuing without model (will use mock data for testing)..."
else
    echo "✅ Model file found: $(ls -lh src/assets/models/food_classifier.tflite | awk '{print $5}')"
fi

echo ""

# Step 3: Environment check
echo "🔍 Checking environment variables..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local exists"
else
    echo "⚠️  .env.local not found"
    echo "   Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set"
fi

echo ""

# Step 4: Ready for testing
cat << 'EOF'
✅ Ready for Testing!

🎮 START DEV SERVER:
   npm start

Then:
   1. Scan QR code with Expo Go app (or press 'i' for iOS simulator)
   2. Navigate to "Snap" tab (📷)
   3. Test camera by taking a photo of food
   4. App will recognize food and show matches from database

📝 FEATURES TO TEST:

   ✓ Camera Permissions
     - First time should prompt for camera access
     - On iOS: Settings > FitWell > Camera > Allow
     - On Android: Settings > Apps > FitWell > Permissions

   ✓ Image Recognition
     - Take photo of food
     - Should see "Detecting..." loading state
     - Model will return predictions (or mock data if no model)

   ✓ Food Matching
     - Search results from Supabase (all 3.76M foods)
     - Shows top 20 matches
     - Each food shows calories, protein, carbs, fats

   ✓ Food Logging
     - Select a food
     - Enter quantity (default 100g)
     - Choose meal type (Breakfast, Lunch, Dinner, Snack)
     - Tap "Log Food"
     - Should see success message

🚀 BUILD FOR DEVICE:

   iOS: eas build --platform ios
   Android: eas build --platform android

📚 MORE INFO:
   See: TFLITE_IMPLEMENTATION_COMPLETE.md
   See: TFLITE_BUILD_STEPS.md

═══════════════════════════════════════════════════════════════

Happy Testing! 🎉
EOF

echo ""
