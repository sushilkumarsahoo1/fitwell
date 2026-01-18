/**
 * Test Script: USDA Food API Integration
 *
 * Run this to verify that:
 * 1. USDA API key is configured correctly
 * 2. Food details can be fetched
 * 3. Nutrition extraction works properly
 *
 * Usage: npx ts-node test-usda-integration.ts
 */

import {
    debugUSDAFoodResponse,
    extractNutrition,
    getFoodDetails,
    searchFoods,
} from "./src/services/foodService";

const USDA_API_KEY = "E2WpkwatJoL2sT1T4PUgqFDxyWj8UU1oO5R0t3pj";

async function runTests() {
  console.log("🧪 Starting USDA Food API Integration Tests\n");

  // Test 1: Search for beef
  console.log("📝 Test 1: Search for 'beef tenderloin'");
  try {
    const searchResults = await searchFoods("beef tenderloin", 1, 5);
    console.log(`✅ Found ${searchResults.length} results`);
    if (searchResults.length > 0) {
      console.log(
        `   First result: ${searchResults[0].description} (FDC ID: ${searchResults[0].fdcId})`,
      );
    }
  } catch (error) {
    console.error("❌ Search failed:", error);
  }

  // Test 2: Get detailed nutrition for a specific food
  console.log(
    "\n📝 Test 2: Get food details for FDC ID 1458149 (Beef Tenderloin)",
  );
  try {
    const foodDetails = await getFoodDetails("1458149");
    if (foodDetails) {
      console.log(`✅ Food details fetched`);
      console.log(`   Name: ${foodDetails.description}`);
      console.log(
        `   Nutrients count: ${foodDetails.foodNutrients?.length || 0}`,
      );

      // Test 3: Extract nutrition
      console.log("\n📝 Test 3: Extract nutrition (100g serving)");
      const nutrition = extractNutrition(foodDetails, 100);
      console.log(`   Calories: ${nutrition.calories} kcal`);
      console.log(`   Protein: ${nutrition.protein_g}g`);
      console.log(`   Carbs: ${nutrition.carbs_g}g`);
      console.log(`   Fats: ${nutrition.fats_g}g`);

      if (nutrition.calories === 0) {
        console.warn("\n⚠️  WARNING: Nutrition values are all 0!");
        console.log(
          "   This means the nutrient extraction is not working correctly.",
        );
        console.log("   Running debug test...\n");

        await debugUSDAFoodResponse("1458149");
      } else {
        console.log("\n✅ Nutrition extraction successful!");
      }
    } else {
      console.error("❌ Failed to fetch food details");
    }
  } catch (error) {
    console.error("❌ Food details fetch failed:", error);
  }

  console.log("\n✨ Tests complete!");
}

// Run tests
runTests().catch(console.error);
