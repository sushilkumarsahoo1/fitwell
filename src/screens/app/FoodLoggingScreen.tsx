import { Button, Card, LoadingSpinner, TextInput } from "@components/common";
import { COLORS, FOOD_CATEGORIES, MEAL_TYPES } from "@constants/index";
import { useAuth } from "@context/AuthContext";
import {
  useAddFoodLog,
  useDailyFoodLogs,
  useDeleteFoodLog,
  useFoodDatabase,
  useGetFoodDetails,
  useLogUSDAFood,
  useSearchFoods,
} from "@hooks/useNutrition";
import { useNavigation } from "@react-navigation/native";
import { extractNutrition } from "@services/foodService";
import { formatDate } from "@utils/dateUtils";
import { convertToGrams, type QuantityUnit } from "@utils/foodUtils";
import { calculateDailyCalorieTarget } from "@utils/nutritionUtils";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FoodLoggingScreenProps {}

type FoodSource = "database" | "usda" | "manual";

export const FoodLoggingScreen: React.FC<FoodLoggingScreenProps> = () => {
  const navigation = useNavigation();
  const { user, profile } = useAuth();
  const [date] = useState(formatDate(new Date()));
  const [selectedMeal, setSelectedMeal] = useState<string>("breakfast");
  const [selectedCategory, setSelectedCategory] = useState<string>("indian");
  const [quantity, setQuantity] = useState("100");
  const [quantityUnit, setQuantityUnit] = useState<QuantityUnit>("g");
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [foodSource, setFoodSource] = useState<FoodSource>("database");
  const [usedaSearch, setUSDASearch] = useState("");
  const [selectedFdcId, setSelectedFdcId] = useState<string | null>(null);
  const [categorySearch, setCategorySearch] = useState("");
  const [foodOffset, setFoodOffset] = useState(0);

  // Manual Entry Form State
  const [manualFoodName, setManualFoodName] = useState("");
  const [manualWeight, setManualWeight] = useState("");
  const [manualCalories, setManualCalories] = useState("");
  const [manualProtein, setManualProtein] = useState("");
  const [manualCarbs, setManualCarbs] = useState("");
  const [manualFats, setManualFats] = useState("");

  const FOODS_PER_PAGE = 1000;

  // Calculate goal-based calorie target
  const goalCalorieTarget = profile
    ? calculateDailyCalorieTarget(
        profile.weight_kg,
        profile.height_cm,
        profile.age,
        profile.gender,
        profile.activity_level,
        (profile.fitness_goal as
          | "maintain"
          | "mild_loss"
          | "normal_loss"
          | "extreme_loss"
          | "mild_gain"
          | "normal_gain"
          | "extreme_gain") || "maintain",
      )
    : 2000;

  // Hook data fetching
  const { data: foodLogs = [], isLoading: logsLoading } = useDailyFoodLogs(
    user?.id || "",
    date,
  );
  const { data: foods = [], isLoading: foodsLoading } = useFoodDatabase(
    selectedCategory,
    foodOffset,
    FOODS_PER_PAGE,
  );
  const { data: usdaResults = [], isLoading: usdaLoading } =
    useSearchFoods(usedaSearch);
  const { data: selectedFoodDetails, isLoading: detailsLoading } =
    useGetFoodDetails(selectedFdcId);

  const addFoodLog = useAddFoodLog();
  const logUSDAFood = useLogUSDAFood();
  const deleteFoodLog = useDeleteFoodLog();

  /**
   * Handle logging manual food entry
   */
  const handleAddManualFood = async () => {
    if (
      !manualFoodName ||
      !manualWeight ||
      !manualCalories ||
      !manualProtein ||
      !manualCarbs ||
      !manualFats ||
      !user
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const weight = parseFloat(manualWeight);
      const calories = Math.round(parseFloat(manualCalories));
      const protein = Math.round(parseFloat(manualProtein) * 10) / 10;
      const carbs = Math.round(parseFloat(manualCarbs) * 10) / 10;
      const fats = Math.round(parseFloat(manualFats) * 10) / 10;

      await addFoodLog.mutateAsync({
        user_id: user.id,
        food_id: "00000000-0000-0000-0000-000000000002", // Placeholder UUID for manual foods
        food_name: manualFoodName,
        quantity: weight,
        quantity_unit: "g",
        meal_type: selectedMeal as any,
        date,
        calories,
        protein_g: protein,
        carbs_g: carbs,
        fats_g: fats,
      } as any);

      // Reset manual entry form
      setManualFoodName("");
      setManualWeight("");
      setManualCalories("");
      setManualProtein("");
      setManualCarbs("");
      setManualFats("");
      setShowFoodModal(false);
      Alert.alert("Success", "Food logged successfully!");
    } catch (error) {
      console.error("Add manual food error:", error);
      Alert.alert("Error", "Failed to log food");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFood = async (foodId: string) => {
    const food = foods.find((f) => f.id === foodId);
    if (!food || !user || !quantity) return;

    setLoading(true);
    try {
      const qty = parseFloat(quantity);
      // Calculate serving multiplier: if food serving is 100g and user enters 100g, multiplier is 1
      // If user enters 200g with 100g serving size, multiplier is 2
      const servingMultiplier = qty / (food.serving_size_g || 100);

      const totalCalories = Math.round(
        (food.calories_per_serving || 0) * servingMultiplier,
      );
      const totalProtein =
        Math.round((food.protein_g || 0) * servingMultiplier * 10) / 10;
      const totalCarbs =
        Math.round((food.carbs_g || 0) * servingMultiplier * 10) / 10;
      const totalFats =
        Math.round((food.fats_g || 0) * servingMultiplier * 10) / 10;

      await addFoodLog.mutateAsync({
        user_id: user.id,
        food_id: foodId,
        quantity: qty,
        meal_type: selectedMeal as any,
        date,
        calories: totalCalories,
        protein_g: totalProtein,
        carbs_g: totalCarbs,
        fats_g: totalFats,
      } as any);

      setQuantity("100");
      setQuantityUnit("g");
      setShowFoodModal(false);
    } catch (error) {
      console.error("Add food error:", error);
      Alert.alert("Error", "Failed to log food");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle logging USDA food with nutrition extraction
   */
  const handleAddUSDAFood = async () => {
    if (!selectedFoodDetails || !user || !quantity) {
      Alert.alert("Error", "Please select a food and enter quantity");
      return;
    }

    setLoading(true);
    try {
      console.log("[FoodLoggingScreen] Starting to log USDA food:", {
        food: selectedFoodDetails.description,
        fdcId: selectedFoodDetails.fdcId,
        quantity,
        quantityUnit,
        meal: selectedMeal,
      });

      // Convert quantity to grams for USDA API (which uses per-100g)
      const quantityInGrams = convertToGrams(
        parseFloat(quantity),
        quantityUnit,
      );

      console.log("[FoodLoggingScreen] Quantity in grams:", quantityInGrams);

      // Extract nutrition from USDA response
      const nutrition = extractNutrition(selectedFoodDetails, quantityInGrams);

      console.log("[FoodLoggingScreen] Extracted nutrition:", nutrition);

      // Log to database
      await logUSDAFood.mutateAsync({
        userId: user.id,
        foodName: selectedFoodDetails.description,
        fdcId: selectedFoodDetails.fdcId,
        quantity: parseFloat(quantity),
        quantityUnit,
        mealType: selectedMeal as "breakfast" | "lunch" | "dinner" | "snack",
        date,
        nutrition,
      });

      console.log("[FoodLoggingScreen] Food logged successfully!");
      Alert.alert("Success", "Food logged successfully!");
      setQuantity("100");
      setQuantityUnit("g");
      setUSDASearch("");
      setSelectedFdcId(null);
      setShowFoodModal(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("[FoodLoggingScreen] USDA food log error:", errorMessage);
      Alert.alert("Error", `Failed to log USDA food: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      await deleteFoodLog.mutateAsync(logId);
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", "Failed to delete food log");
    }
  };

  // Filter foods based on category search
  const filteredFoods = useMemo(() => {
    if (!categorySearch.trim()) {
      return foods;
    }
    const searchLower = categorySearch.toLowerCase();
    return foods.filter(
      (food) => food.name && food.name.toLowerCase().includes(searchLower),
    );
  }, [foods, categorySearch]);

  // Calculate total nutrition for display
  const totalNutrition = useMemo(() => {
    return foodLogs.reduce(
      (acc, log) => ({
        calories: acc.calories + (log.calories || 0),
        protein_g: acc.protein_g + (log.protein_g || 0),
        carbs_g: acc.carbs_g + (log.carbs_g || 0),
        fats_g: acc.fats_g + (log.fats_g || 0),
      }),
      { calories: 0, protein_g: 0, carbs_g: 0, fats_g: 0 },
    );
  }, [foodLogs]);

  if (logsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f5f5f5" }}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 200,
        }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: COLORS.neutral.textDark,
            marginBottom: 20,
          }}
        >
          Log Food
        </Text>

        {/* Daily Summary */}
        <Card title="Today's Nutrition" style={{ marginBottom: 16 }}>
          <View style={{ gap: 8 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 12, color: COLORS.neutral.text }}>
                Calories:
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: COLORS.primary,
                }}
              >
                {totalNutrition.calories} / {goalCalorieTarget}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 12, color: COLORS.neutral.text }}>
                Protein:
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: COLORS.success,
                }}
              >
                {totalNutrition.protein_g.toFixed(1)}g
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 12, color: COLORS.neutral.text }}>
                Carbs:
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: COLORS.warning,
                }}
              >
                {totalNutrition.carbs_g.toFixed(1)}g
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 12, color: COLORS.neutral.text }}>
                Fats:
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: COLORS.neutral.textDark,
                }}
              >
                {totalNutrition.fats_g.toFixed(1)}g
              </Text>
            </View>
          </View>
        </Card>

        {/* Meal Type Selector */}
        <Card title="Select Meal" style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            {MEAL_TYPES.map((meal) => (
              <TouchableOpacity
                key={meal.id}
                onPress={() => setSelectedMeal(meal.id)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor:
                    selectedMeal === meal.id
                      ? COLORS.primary
                      : COLORS.neutral.border,
                  backgroundColor:
                    selectedMeal === meal.id ? "#f0f9ff" : "white",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color:
                      selectedMeal === meal.id
                        ? COLORS.primary
                        : COLORS.neutral.text,
                    fontWeight: "600",
                  }}
                >
                  {meal.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Food List */}
        {MEAL_TYPES.map((mealType) => {
          const mealLogs = foodLogs.filter(
            (log) => log.meal_type === mealType.id,
          );
          return (
            <Card
              key={mealType.id}
              title={mealType.label}
              style={{ marginBottom: 16 }}
            >
              {mealLogs.length === 0 ? (
                <Text
                  style={{
                    fontSize: 12,
                    color: COLORS.neutral.text,
                    textAlign: "center",
                    paddingVertical: 12,
                  }}
                >
                  No items logged
                </Text>
              ) : (
                mealLogs.map((log) => (
                  <View
                    key={log.id}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: COLORS.neutral.border,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color: COLORS.neutral.textDark,
                        }}
                      >
                        {log.food_name || log.foods?.name || "Unnamed Food"}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: COLORS.neutral.text,
                          marginTop: 2,
                        }}
                      >
                        {log.quantity}
                        {log.quantity_unit
                          ? ` ${log.quantity_unit}`
                          : ""} • {log.calories} cal • P: {log.protein_g}g • C:{" "}
                        {log.carbs_g}g • F: {log.fats_g}g
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteLog(log.id)}
                      style={{
                        paddingHorizontal: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: COLORS.danger,
                          fontWeight: "600",
                        }}
                      >
                        Remove
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </Card>
          );
        })}

        <Button
          title="Add Food Item"
          onPress={() => setShowFoodModal(true)}
          fullWidth
          style={{ marginTop: 24 }}
        />
      </ScrollView>

      {/* Food Selection Modal */}
      <Modal
        visible={showFoodModal}
        onRequestClose={() => {
          setShowFoodModal(false);
          setUSDASearch("");
          setCategorySearch("");
          setSelectedFdcId(null);
          setManualFoodName("");
          setManualWeight("");
          setManualCalories("");
          setManualProtein("");
          setManualCarbs("");
          setManualFats("");
        }}
        animationType="slide"
      >
        <View style={{ flex: 1, paddingTop: 40 }}>
          <ScrollView
            scrollEnabled={true}
            nestedScrollEnabled={true}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingVertical: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: COLORS.neutral.textDark,
                }}
              >
                Select Food
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowFoodModal(false);
                  setUSDASearch("");
                  setCategorySearch("");
                  setSelectedFdcId(null);
                  setManualFoodName("");
                  setManualWeight("");
                  setManualCalories("");
                  setManualProtein("");
                  setManualCarbs("");
                  setManualFats("");
                }}
              >
                <Text style={{ fontSize: 16, color: COLORS.primary }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Food Source Tabs */}
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
              <TouchableOpacity
                onPress={() => setFoodSource("database")}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor:
                    foodSource === "database"
                      ? COLORS.primary
                      : COLORS.neutral.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color:
                      foodSource === "database" ? "white" : COLORS.neutral.text,
                    textAlign: "center",
                  }}
                >
                  App Foods
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFoodSource("manual")}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor:
                    foodSource === "manual"
                      ? COLORS.primary
                      : COLORS.neutral.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color:
                      foodSource === "manual" ? "white" : COLORS.neutral.text,
                    textAlign: "center",
                  }}
                >
                  Manual Entry
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFoodSource("usda")}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor:
                    foodSource === "usda"
                      ? COLORS.primary
                      : COLORS.neutral.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color:
                      foodSource === "usda" ? "white" : COLORS.neutral.text,
                    textAlign: "center",
                  }}
                >
                  USDA Search
                </Text>
              </TouchableOpacity>
            </View>

            {foodSource === "database" ? (
              <>
                {/* Category Selector for Database Foods */}
                <View style={{ marginBottom: 20 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: COLORS.neutral.textDark,
                      marginBottom: 8,
                    }}
                  >
                    Category
                  </Text>
                  <View
                    style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}
                  >
                    {FOOD_CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => {
                          setSelectedCategory(cat.id);
                          setFoodOffset(0);
                        }}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 8,
                          borderWidth: 2,
                          borderColor:
                            selectedCategory === cat.id
                              ? COLORS.primary
                              : COLORS.neutral.border,
                          backgroundColor:
                            selectedCategory === cat.id ? "#f0f9ff" : "white",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color:
                              selectedCategory === cat.id
                                ? COLORS.primary
                                : COLORS.neutral.text,
                            fontWeight: "600",
                          }}
                        >
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Category Search Input */}
                <TextInput
                  label="Search Foods"
                  placeholder="Search by name or description"
                  value={categorySearch}
                  onChangeText={setCategorySearch}
                  style={{ marginBottom: 16 }}
                />

                {/* Quantity Input for Database */}
                <View
                  style={{ marginBottom: 16, flexDirection: "row", gap: 8 }}
                >
                  <TextInput
                    label="Quantity (grams)"
                    placeholder="100"
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="decimal-pad"
                    style={{ flex: 1 }}
                  />
                  <View style={{ justifyContent: "flex-end", marginBottom: 8 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: COLORS.neutral.text,
                        marginBottom: 4,
                      }}
                    >
                      Serving Size
                    </Text>
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: COLORS.neutral.border,
                        borderRadius: 4,
                        paddingHorizontal: 8,
                        paddingVertical: 8,
                      }}
                    >
                      <Text style={{ fontSize: 12 }}>g</Text>
                    </View>
                  </View>
                </View>

                {/* Food List from Database */}
                {foodsLoading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: COLORS.neutral.textDark,
                        marginBottom: 12,
                        marginTop: 12,
                      }}
                    >
                      Foods ({foodOffset + filteredFoods.length})
                    </Text>

                    {/* Load More Button - Top */}
                    {foods.length >= FOODS_PER_PAGE && (
                      <TouchableOpacity
                        onPress={() =>
                          setFoodOffset(foodOffset + FOODS_PER_PAGE)
                        }
                        style={{
                          marginBottom: 16,
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          backgroundColor: COLORS.primary,
                          borderRadius: 8,
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: "white",
                          }}
                        >
                          Load More Foods
                        </Text>
                      </TouchableOpacity>
                    )}

                    {filteredFoods.length === 0 ? (
                      <Text
                        style={{
                          fontSize: 12,
                          color: COLORS.neutral.text,
                          textAlign: "center",
                          paddingVertical: 20,
                        }}
                      >
                        {foods.length === 0
                          ? "No foods in this category"
                          : "No foods match your search"}
                      </Text>
                    ) : (
                      filteredFoods.map((food) => (
                        <TouchableOpacity
                          key={food.id}
                          onPress={() => handleAddFood(food.id)}
                          style={{
                            backgroundColor: "white",
                            borderWidth: 1,
                            borderColor: COLORS.neutral.border,
                            borderRadius: 8,
                            padding: 12,
                            marginBottom: 8,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                fontSize: 13,
                                fontWeight: "600",
                                color: COLORS.neutral.textDark,
                              }}
                            >
                              {food.name}
                            </Text>
                            <Text
                              style={{
                                fontSize: 12,
                                color: COLORS.neutral.text,
                                marginTop: 2,
                              }}
                            >
                              P: {food.protein_g}g | C: {food.carbs_g}g | F:{" "}
                              {food.fats_g}g
                            </Text>
                          </View>
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: "700",
                              color: COLORS.primary,
                            }}
                          >
                            {food.calories_per_serving} cal
                          </Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </>
                )}
              </>
            ) : foodSource === "manual" ? (
              <>
                {/* Manual Food Entry Form */}
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: COLORS.neutral.textDark,
                    marginBottom: 16,
                  }}
                >
                  Enter Food Details
                </Text>

                <TextInput
                  label="Food Name"
                  placeholder="e.g., Homemade Pizza, Rice Bowl"
                  value={manualFoodName}
                  onChangeText={setManualFoodName}
                  style={{ marginBottom: 16 }}
                />

                <TextInput
                  label="Weight (grams)"
                  placeholder="e.g., 150"
                  value={manualWeight}
                  onChangeText={setManualWeight}
                  keyboardType="decimal-pad"
                  style={{ marginBottom: 16 }}
                />

                <TextInput
                  label="Calories"
                  placeholder="e.g., 250"
                  value={manualCalories}
                  onChangeText={setManualCalories}
                  keyboardType="decimal-pad"
                  style={{ marginBottom: 16 }}
                />

                <View
                  style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}
                >
                  <TextInput
                    label="Protein (g)"
                    placeholder="e.g., 15"
                    value={manualProtein}
                    onChangeText={setManualProtein}
                    keyboardType="decimal-pad"
                    style={{ flex: 1 }}
                  />
                  <TextInput
                    label="Carbs (g)"
                    placeholder="e.g., 30"
                    value={manualCarbs}
                    onChangeText={setManualCarbs}
                    keyboardType="decimal-pad"
                    style={{ flex: 1 }}
                  />
                </View>

                <TextInput
                  label="Fats (g)"
                  placeholder="e.g., 8"
                  value={manualFats}
                  onChangeText={setManualFats}
                  keyboardType="decimal-pad"
                  style={{ marginBottom: 20 }}
                />

                <Button
                  title="Log Food"
                  onPress={handleAddManualFood}
                  disabled={loading}
                  fullWidth
                />
              </>
            ) : (
              <>
                {/* USDA Search Section */}
                <TextInput
                  label="Search USDA Foods"
                  placeholder="e.g., banana, chicken breast, rice"
                  value={usedaSearch}
                  onChangeText={setUSDASearch}
                  style={{ marginBottom: 16 }}
                />

                {/* Quantity and Unit for USDA */}
                <View style={{ marginBottom: 16, gap: 12 }}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TextInput
                      label="Quantity"
                      placeholder="100"
                      value={quantity}
                      onChangeText={setQuantity}
                      keyboardType="decimal-pad"
                      style={{ flex: 1 }}
                    />
                    <View
                      style={{ justifyContent: "flex-end", marginBottom: 8 }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: COLORS.neutral.text,
                          marginBottom: 4,
                        }}
                      >
                        Unit
                      </Text>
                      <TouchableOpacity
                        style={{
                          borderWidth: 1,
                          borderColor: COLORS.neutral.border,
                          borderRadius: 4,
                          paddingHorizontal: 8,
                          paddingVertical: 8,
                          minWidth: 70,
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: "600" }}>
                          {quantityUnit}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* USDA Search Results */}
                {usdaLoading && usedaSearch ? (
                  <LoadingSpinner />
                ) : usedaSearch ? (
                  <>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: COLORS.neutral.textDark,
                        marginBottom: 12,
                        marginTop: 12,
                      }}
                    >
                      USDA Results ({usdaResults.length})
                    </Text>
                    {usdaResults.length === 0 ? (
                      <Text
                        style={{
                          fontSize: 12,
                          color: COLORS.neutral.text,
                          textAlign: "center",
                          paddingVertical: 20,
                        }}
                      >
                        No results found
                      </Text>
                    ) : (
                      usdaResults.map((result) => (
                        <TouchableOpacity
                          key={result.fdcId}
                          onPress={() => setSelectedFdcId(result.fdcId)}
                          style={{
                            backgroundColor:
                              selectedFdcId === result.fdcId
                                ? "#f0f9ff"
                                : "white",
                            borderWidth: selectedFdcId === result.fdcId ? 2 : 1,
                            borderColor:
                              selectedFdcId === result.fdcId
                                ? COLORS.primary
                                : COLORS.neutral.border,
                            borderRadius: 8,
                            padding: 12,
                            marginBottom: 8,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: "600",
                              color: COLORS.neutral.textDark,
                            }}
                          >
                            {result.description}
                          </Text>
                          <Text
                            style={{
                              fontSize: 11,
                              color: COLORS.neutral.text,
                              marginTop: 4,
                            }}
                          >
                            {result.dataType}
                            {result.brandOwner && ` • ${result.brandOwner}`}
                          </Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </>
                ) : (
                  <Text
                    style={{
                      fontSize: 12,
                      color: COLORS.neutral.text,
                      textAlign: "center",
                      paddingVertical: 20,
                    }}
                  >
                    Search for foods from USDA FoodData Central database
                  </Text>
                )}

                {/* Selected Food Details */}
                {selectedFdcId && detailsLoading && <LoadingSpinner />}

                {selectedFdcId && selectedFoodDetails && (
                  <Card
                    title="Selected Food"
                    style={{ marginTop: 16, marginBottom: 16 }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: COLORS.neutral.textDark,
                        marginBottom: 8,
                      }}
                    >
                      {selectedFoodDetails.description}
                    </Text>
                    <Button
                      title={`Log ${quantity}${quantityUnit}`}
                      onPress={handleAddUSDAFood}
                      disabled={loading}
                      style={{ marginTop: 12 }}
                    />
                  </Card>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
