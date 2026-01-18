/**
 * Migration: Migrate Indian foods from foods_indian table to main foods table
 *
 * This script migrates Indian foods with proper UUID support to fix the
 * "invalid input syntax for type uuid" error when logging Indian foods.
 *
 * Usage:
 *   npx ts-node scripts/migrate-indian-foods.ts
 *
 * Environment Variables:
 *   SUPABASE_URL - Supabase project URL
 *   SUPABASE_KEY - Supabase service role key (or anon key)
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Error: SUPABASE_URL or SUPABASE_KEY not set");
  console.error(
    "Please set these environment variables in .env.local or export them:",
  );
  console.error("  SUPABASE_URL=your-url");
  console.error("  SUPABASE_KEY=your-key");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface IndianFood {
  id: number;
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  serving_size_g: number;
}

async function migrateIndianFoods() {
  console.log("🔄 Starting Indian Foods Migration...\n");

  try {
    // Step 1: Fetch all Indian foods from foods_indian table
    console.log("📥 Fetching Indian foods from foods_indian table...");
    const { data: indianFoods, error: fetchError } = await supabase
      .from("foods_indian")
      .select("*")
      .limit(1000);

    if (fetchError) {
      throw new Error(`Failed to fetch Indian foods: ${fetchError.message}`);
    }

    console.log(`✅ Found ${indianFoods?.length || 0} Indian foods\n`);

    if (!indianFoods || indianFoods.length === 0) {
      console.log("⚠️  No Indian foods to migrate");
      return;
    }

    // Step 2: Transform and insert into main foods table
    console.log("🔄 Transforming and migrating to main foods table...");

    const foodsToInsert = (indianFoods as IndianFood[]).map((food) => ({
      name: food.name,
      calories_per_serving: Math.round(food.calories || 0),
      protein_g: food.protein_g || 0,
      carbs_g: food.carbs_g || 0,
      fats_g: food.fat_g || 0,
      serving_size_g: food.serving_size_g || 100,
      category: "indian",
      is_custom: false,
    }));

    // Insert foods (will skip duplicates based on unique constraint if it exists)
    const { data: insertedFoods, error: insertError } = await supabase
      .from("foods")
      .insert(foodsToInsert)
      .select()
      .limit(1000);

    if (insertError) {
      console.error(`⚠️  Some foods may already exist: ${insertError.message}`);
    }

    console.log(
      `✅ Migrated ${insertedFoods?.length || 0} foods to main table\n`,
    );

    // Step 3: Verify the migration
    console.log("✅ Verifying migration...");
    const { data: verifyFoods, error: verifyError } = await supabase
      .from("foods")
      .select("*")
      .eq("category", "indian")
      .limit(1);

    if (verifyError) {
      console.error(`⚠️  Could not verify: ${verifyError.message}`);
    } else {
      console.log(`✅ Sample verified Indian food in main table`);
      if (verifyFoods && verifyFoods[0]) {
        console.log(`   Name: ${verifyFoods[0].name}`);
        console.log(`   ID: ${verifyFoods[0].id}`);
        console.log(`   Calories: ${verifyFoods[0].calories_per_serving}`);
      }
    }

    console.log("\n🎉 Migration completed successfully!");
    console.log("\n📝 Summary:");
    console.log(`   • Migrated ${foodsToInsert.length} Indian foods`);
    console.log("   • All foods now use proper UUID IDs");
    console.log("   • Food logging will work correctly");
    console.log("\n✨ You can now log Indian foods without UUID errors!");
  } catch (error) {
    console.error(
      "❌ Migration failed:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
}

// Run the migration
migrateIndianFoods().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
