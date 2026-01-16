import { Button, Card, LoadingSpinner, TextInput } from "@components/common";
import { COLORS, FOOD_CATEGORIES, MEAL_TYPES } from "@constants/index";
import { useAuth } from "@context/AuthContext";
import {
    useAddFoodLog,
    useDailyFoodLogs,
    useDeleteFoodLog,
    useFoodDatabase,
} from "@hooks/useNutrition";
import { useNavigation } from "@react-navigation/native";
import { formatDate } from "@utils/dateUtils";
import React, { useState } from "react";
import {
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";

interface FoodLoggingScreenProps {}

export const FoodLoggingScreen: React.FC<FoodLoggingScreenProps> = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [date] = useState(formatDate(new Date()));
  const [selectedMeal, setSelectedMeal] = useState<string>("breakfast");
  const [selectedCategory, setSelectedCategory] = useState<string>("indian");
  const [quantity, setQuantity] = useState("1");
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: foodLogs = [], isLoading: logsLoading } = useDailyFoodLogs(
    user?.id || "",
    date
  );
  const { data: foods = [], isLoading: foodsLoading } = useFoodDatabase(
    selectedCategory
  );
  const addFoodLog = useAddFoodLog();
  const deleteFoodLog = useDeleteFoodLog();

  const handleAddFood = async (foodId: string) => {
    const food = foods.find((f) => f.id === foodId);
    if (!food || !user || !quantity) return;

    setLoading(true);
    try {
      const qty = parseFloat(quantity);
      const totalCalories = Math.round(food.calories_per_serving * qty);
      const totalProtein = Math.round(food.protein_g * qty * 10) / 10;
      const totalCarbs = Math.round(food.carbs_g * qty * 10) / 10;
      const totalFats = Math.round(food.fats_g * qty * 10) / 10;

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

      setQuantity("1");
      setShowFoodModal(false);
      navigation.navigate("Dashboard" as never);
    } catch (error) {
      console.error("Add food error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      await deleteFoodLog.mutateAsync(logId);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  if (logsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          paddingBottom: 20,
        }}
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
          const mealLogs = foodLogs.filter((log) => log.meal_type === mealType.id);
          return (
            <Card key={mealType.id} title={mealType.label} style={{ marginBottom: 16 }}>
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
                        {log.foods?.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: COLORS.neutral.text,
                          marginTop: 2,
                        }}
                      >
                        {log.quantity} × {log.calories} cal
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
        onRequestClose={() => setShowFoodModal(false)}
        animationType="slide"
      >
        <View style={{ flex: 1, paddingTop: 40 }}>
          <ScrollView
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
              <TouchableOpacity onPress={() => setShowFoodModal(false)}>
                <Text style={{ fontSize: 16, color: COLORS.primary }}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            {/* Category Selector */}
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
              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                {FOOD_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
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

            {/* Quantity Input */}
            <TextInput
              label="Quantity"
              placeholder="1"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
            />

            {/* Food List */}
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
                  Foods
                </Text>
                {foods.map((food) => (
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
                ))}
              </>
            )}

            <Button
              title="Close"
              onPress={() => setShowFoodModal(false)}
              variant="secondary"
              fullWidth
              style={{ marginTop: 20 }}
            />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};
