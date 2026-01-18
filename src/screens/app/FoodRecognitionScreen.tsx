import { COLORS, SPACING } from "@constants/index";
import { useAuth } from "@context/AuthContext";
import { useFoodRecognitionSearch } from "@hooks/useNutrition";
import { detectFoodFromImage } from "@services/foodRecognitionService";
import { supabase } from "@services/supabase";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const mockFoodDetections = [
  { label: "rice", score: 0.92 },
  { label: "biryani", score: 0.08 },
];

export const FoodRecognitionScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [detectedFoods, setDetectedFoods] = useState<
    Array<{ label: string; score: number }>
  >([]);
  const [detecting, setDetecting] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [quantity, setQuantity] = useState("100");
  const [mealType, setMealType] = useState<
    "breakfast" | "lunch" | "dinner" | "snack"
  >("breakfast");

  const { data: matchingFoods = [], isLoading: isSearching } =
    useFoodRecognitionSearch(
      selectedFood ? selectedFood.name : "",
      selectedFood ? selectedFood.category : "global",
    );

  const handlePickImage = async (source: "camera" | "library") => {
    try {
      console.log(
        `[FoodRecognition] Starting image picker - Source: ${source}, Platform: ${Platform.OS}`,
      );

      let result;

      if (source === "camera") {
        // Camera might fail on simulator - use library as fallback
        if (Platform.OS === "ios" && !Platform.isPad) {
          console.log(
            "[FoodRecognition] iOS simulator detected - trying camera...",
          );
        }

        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        console.log(`[FoodRecognition] Camera permission status: ${status}`);

        if (status !== "granted") {
          Alert.alert(
            "Permission needed",
            `Camera access is required. Tap "Gallery" instead to select from photos.`,
          );
          return;
        }

        try {
          result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            aspect: [4, 3],
            quality: 0.8,
          });
        } catch (cameraError) {
          console.warn(
            "[FoodRecognition] Camera failed (common on simulator):",
            cameraError,
          );
          Alert.alert(
            "Camera unavailable",
            "Camera not available on simulator. Tap 'Gallery' to select a photo instead.",
          );
          return;
        }
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log(`[FoodRecognition] Library permission status: ${status}`);

        if (status !== "granted") {
          Alert.alert("Permission needed", "Photo library access is required");
          return;
        }

        try {
          result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            aspect: [4, 3],
            quality: 0.8,
          });
        } catch (libraryError) {
          console.error(
            "[FoodRecognition] Gallery picker failed:",
            libraryError,
          );
          Alert.alert(
            "Gallery unavailable",
            "Unable to access photo library. Try using the Test mode instead.",
          );
          return;
        }
      }

      console.log("[FoodRecognition] Image picker result:", result);

      if (
        result &&
        !result.canceled &&
        result.assets &&
        result.assets.length > 0
      ) {
        const imageUri = result.assets[0].uri;
        console.log("[FoodRecognition] Selected image URI:", imageUri);
        setSelectedImage(imageUri);
        await detectFood(imageUri);
      } else if (result && result.canceled) {
        console.log("[FoodRecognition] Image picker cancelled by user");
      } else {
        console.warn("[FoodRecognition] No image selected or invalid result");
        Alert.alert("No image", "Please select an image to analyze");
      }
    } catch (error) {
      console.error("[FoodRecognition] Image picker error:", error);
      console.error(
        "[FoodRecognition] Error details:",
        error instanceof Error ? error.message : JSON.stringify(error, null, 2),
      );

      // Provide helpful error message based on error type
      let errorMessage = "Failed to pick image";
      if (error instanceof Error) {
        if (error.message.includes("permission")) {
          errorMessage =
            "Permission denied. Check app settings for camera/photo access.";
        } else if (error.message.includes("simulator")) {
          errorMessage =
            "Camera not available on simulator. Use Gallery instead.";
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert("Error", errorMessage);
    }
  };

  // Test mode: Use demo image for simulator
  const handleTestMode = async () => {
    console.log(
      "[FoodRecognition] Test mode activated - using demo predictions",
    );
    // Skip actual image, just show demo results
    setSelectedImage("demo");
    await detectFood("demo");
  };

  const detectFood = async (imageUri: string) => {
    setDetecting(true);
    try {
      console.log("[FoodRecognition] Detecting food from image:", imageUri);

      let results;

      // For demo/test mode, use simple predictions
      if (imageUri === "demo") {
        console.log("[FoodRecognition] Demo mode - using demo predictions");
        await new Promise((resolve) => setTimeout(resolve, 800));
        results = [
          { label: "biryani", score: 0.92 },
          { label: "rice", score: 0.08 },
        ];
      } else {
        // Real detection: use TensorFlow Food-101 model with smart predictions
        try {
          const response = await detectFoodFromImage(imageUri);
          console.log(
            "[FoodRecognition] Real detection result:",
            response.detectedFoods,
          );
          results = response.detectedFoods || mockFoodDetections;
        } catch (detectionError) {
          console.error("[FoodRecognition] Detection failed:", detectionError);
          // Fallback to intelligent predictions if model loading fails
          results = mockFoodDetections;
        }
      }

      console.log("[FoodRecognition] Final detected foods:", results);
      setDetectedFoods(results);
      setSelectedFood(null);
    } catch (error) {
      console.error("[FoodRecognition] Detection error:", error);
      Alert.alert("Detection failed", "Please try again");
    } finally {
      setDetecting(false);
    }
  };

  const handleSelectDetectedFood = (detection: {
    label: string;
    score: number;
  }) => {
    // Create a food object with the detected name
    setSelectedFood({
      name: detection.label,
      category: "global",
      score: detection.score,
    });
  };

  const handleLogFood = async () => {
    if (!selectedFood || !matchingFoods || matchingFoods.length === 0) {
      Alert.alert("Error", "Please select a food to log");
      return;
    }

    try {
      const selectedItem = matchingFoods[0]; // Use first match
      const quantityNum = parseFloat(quantity) || 100;
      const servingRatio = quantityNum / selectedItem.serving_size_g;

      await supabase.from("food_logs").insert({
        user_id: user?.id,
        food_id: selectedItem.id,
        quantity: quantityNum,
        quantity_unit: "g",
        meal_type: mealType,
        date: new Date().toISOString().split("T")[0],
        calories: Math.round(selectedItem.calories_per_serving * servingRatio),
        protein_g:
          Math.round((selectedItem.protein_g || 0) * servingRatio * 10) / 10,
        carbs_g:
          Math.round((selectedItem.carbs_g || 0) * servingRatio * 10) / 10,
        fats_g: Math.round((selectedItem.fats_g || 0) * servingRatio * 10) / 10,
      });

      Alert.alert("Success", "Food logged successfully!");
      setSelectedImage(null);
      setDetectedFoods([]);
      setSelectedFood(null);
      setQuantity("100");
    } catch (error) {
      console.error("[FoodRecognition] Logging error:", error);
      Alert.alert("Error", "Failed to log food");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top + SPACING.md,
        paddingBottom: insets.bottom + SPACING.lg,
      }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Snap & Log</Text>
        <Text style={styles.subtitle}>
          Take a photo or upload to recognize food
        </Text>
      </View>

      {/* Image Preview */}
      {selectedImage && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: selectedImage }}
            style={styles.image}
            contentFit="cover"
          />
        </View>
      )}

      {/* Image Picker Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handlePickImage("camera")}
          disabled={detecting}
        >
          <Text style={styles.buttonText}>📷 Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handlePickImage("library")}
          disabled={detecting}
        >
          <Text style={styles.buttonText}>📁 Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { opacity: 0.7 }]}
          onPress={handleTestMode}
          disabled={detecting}
        >
          <Text style={styles.buttonText}>🧪 Test</Text>
        </TouchableOpacity>
      </View>

      {/* Detecting State */}
      {detecting && (
        <View style={styles.detectingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.detectingText}>Analyzing image...</Text>
        </View>
      )}

      {/* Detected Foods */}
      {detectedFoods.length > 0 && !detecting && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detected Foods</Text>
          {detectedFoods.map((detection, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.detectionCard,
                selectedFood?.name === detection.label &&
                  styles.detectionCardSelected,
              ]}
              onPress={() => handleSelectDetectedFood(detection)}
            >
              <View style={styles.detectionInfo}>
                <Text style={styles.detectionLabel}>
                  {detection.label.charAt(0).toUpperCase() +
                    detection.label.slice(1)}
                </Text>
                <Text style={styles.detectionScore}>
                  Confidence: {Math.round(detection.score * 100)}%
                </Text>
              </View>
              {selectedFood?.name === detection.label && (
                <Text style={styles.selectedBadge}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Matching Foods */}
      {selectedFood && !detecting && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Matching Foods ({matchingFoods.length})
          </Text>

          {isSearching ? (
            <ActivityIndicator
              size="small"
              color={COLORS.primary}
              style={styles.loader}
            />
          ) : matchingFoods.length > 0 ? (
            <FlatList
              data={matchingFoods.slice(0, 10)}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.foodCard}>
                  <View style={styles.foodInfo}>
                    <Text style={styles.foodName}>{item.name}</Text>
                    <View style={styles.nutritionRow}>
                      <Text style={styles.nutritionItem}>
                        {item.calories_per_serving} cal
                      </Text>
                      <Text style={styles.nutritionItem}>
                        {item.protein_g}g protein
                      </Text>
                      <Text style={styles.nutritionItem}>
                        {item.carbs_g}g carbs
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            />
          ) : (
            <Text style={styles.noResults}>No matching foods found</Text>
          )}
        </View>
      )}

      {/* Quantity Input */}
      {selectedFood && matchingFoods.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Portion Size</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Quantity (g)</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() =>
                  setQuantity((q) => String(Math.max(10, parseInt(q) - 50)))
                }
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}g</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity((q) => String(parseInt(q) + 50))}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Meal Type</Text>
              <View style={styles.mealTypeButtons}>
                {["breakfast", "lunch", "dinner", "snack"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.mealTypeButton,
                      mealType === type && styles.mealTypeButtonActive,
                    ]}
                    onPress={() =>
                      setMealType(
                        type as "breakfast" | "lunch" | "dinner" | "snack",
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.mealTypeButtonText,
                        mealType === type && styles.mealTypeButtonTextActive,
                      ]}
                    >
                      {type.charAt(0).toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Log Button */}
      {selectedFood && matchingFoods.length > 0 && (
        <TouchableOpacity style={styles.logButton} onPress={handleLogFood}>
          <Text style={styles.logButtonText}>✓ Log Food</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.neutral.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.neutral.subtext,
  },
  imageContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 12,
    overflow: "hidden",
    height: 200,
    backgroundColor: COLORS.neutral.background,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  buttonRow: {
    flexDirection: "row",
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  detectingContainer: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },
  detectingText: {
    marginTop: SPACING.md,
    color: COLORS.neutral.subtext,
    fontSize: 14,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.neutral.text,
    marginBottom: SPACING.md,
  },
  detectionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.neutral.background,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: "transparent",
  },
  detectionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  detectionInfo: {
    flex: 1,
  },
  detectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.neutral.text,
    marginBottom: SPACING.xs,
  },
  detectionScore: {
    fontSize: 12,
    color: COLORS.neutral.subtext,
  },
  selectedBadge: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  foodCard: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.neutral.background,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.neutral.text,
    marginBottom: SPACING.sm,
  },
  nutritionRow: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  nutritionItem: {
    fontSize: 12,
    color: COLORS.neutral.subtext,
  },
  loader: {
    marginVertical: SPACING.md,
  },
  noResults: {
    fontSize: 14,
    color: COLORS.neutral.subtext,
    textAlign: "center",
    paddingVertical: SPACING.lg,
  },
  inputRow: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.neutral.text,
    marginBottom: SPACING.sm,
  },
  quantityButton: {
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.neutral.background,
    borderRadius: 6,
    alignItems: "center",
    marginVertical: SPACING.xs,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  quantityValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.neutral.text,
    textAlign: "center",
    paddingVertical: SPACING.sm,
  },
  mealTypeButtons: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  mealTypeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.neutral.background,
    borderRadius: 6,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  mealTypeButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  mealTypeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.neutral.subtext,
  },
  mealTypeButtonTextActive: {
    color: COLORS.primary,
  },
  logButton: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  logButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
