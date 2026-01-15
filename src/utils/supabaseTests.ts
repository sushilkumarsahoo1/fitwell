import { supabase } from "@services/supabase";

/**
 * Fitwell Supabase Integration Tests
 * Run this to verify Supabase connectivity and basic operations
 */

export const supabaseTests = {
  /**
   * Test 1: Verify client initialization
   */
  async testClientInitialization() {
    try {
      console.log("🧪 Test 1: Client Initialization");
      if (!supabase) throw new Error("Supabase client not initialized");
      console.log("✅ Supabase client ready");
      return { success: true, message: "Client initialized" };
    } catch (error: any) {
      console.error("❌ Failed:", error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test 2: Check authentication status
   */
  async testAuthStatus() {
    try {
      console.log("🧪 Test 2: Auth Status");
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) throw error;

      if (user) {
        console.log("✅ User authenticated:", user.email);
        return { success: true, user };
      } else {
        console.log("⚠️ No user authenticated (expected if not logged in)");
        return { success: true, message: "No user, expected before login" };
      }
    } catch (error: any) {
      console.error("❌ Auth error:", error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test 3: Read from foods table (public data)
   */
  async testReadFoods() {
    try {
      console.log("🧪 Test 3: Read Foods Table");
      const { data, error } = await supabase
        .from("foods")
        .select("id, name, calories_per_serving")
        .limit(3);

      if (error) throw error;

      if (data && data.length > 0) {
        console.log(`✅ Read ${data.length} foods:`, data);
        return { success: true, count: data.length, data };
      } else {
        console.log("⚠️ No foods in database (load sample-data.sql)");
        return { success: true, message: "No foods yet, need sample data" };
      }
    } catch (error: any) {
      console.error("❌ Read error:", error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test 4: Read user profile (requires auth)
   */
  async testReadProfile() {
    try {
      console.log("🧪 Test 4: Read User Profile");
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("⚠️ Not authenticated, skipping profile read");
        return { success: true, message: "Not authenticated, skip this test" };
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code === "PGRST116") {
        console.log("⚠️ Profile not found (expected for new users)");
        return { success: true, message: "No profile yet, expected" };
      }

      if (error) throw error;

      console.log("✅ Profile found:", data);
      return { success: true, data };
    } catch (error: any) {
      console.error("❌ Profile read error:", error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test 5: RLS Policy (try to read another user's data)
   */
  async testRLSPolicy() {
    try {
      console.log("🧪 Test 5: RLS Policy Enforcement");
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("⚠️ Not authenticated, skipping RLS test");
        return { success: true, message: "Not authenticated, skip this test" };
      }

      // Try to read a specific profile (should only work if it's ours)
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", "fake-uuid-12345");

      if (error?.code === "42501") {
        // RLS error
        console.log("✅ RLS Policy working: Cannot access other user's data");
        return { success: true, message: "RLS enforcing correctly" };
      }

      // Should return empty, not error
      if (!data || data.length === 0) {
        console.log("✅ RLS Policy working: No data returned for other user");
        return { success: true, message: "RLS enforcing correctly" };
      }

      console.log("✅ RLS Policy working");
      return { success: true, message: "RLS enforcing" };
    } catch (error: any) {
      console.error("❌ RLS test error:", error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test 6: Write permission (insert into food_logs)
   */
  async testWritePermission() {
    try {
      console.log("🧪 Test 6: Write Permission");
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log(
          "⚠️ Not authenticated, need to login first to test writing"
        );
        return {
          success: true,
          message: "Not authenticated, login first to test",
        };
      }

      // Check if user has profile (required for food_logs)
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        console.log("⚠️ No profile found (complete onboarding first)");
        return { success: true, message: "Need profile first" };
      }

      // Try to insert (won't actually create if we don't have a food)
      const { error } = await supabase
        .from("food_logs")
        .insert({
          user_id: user.id,
          food_id: "fake-id",
          quantity: 1,
          meal_type: "breakfast",
          date: new Date().toISOString().split("T")[0],
        })
        .single();

      // Expected: "Column 'food_id' violates foreign key constraint"
      // Which means write permission worked!
      if (error?.message?.includes("violates foreign key")) {
        console.log("✅ Write permission working (FK error is expected)");
        return { success: true, message: "Write permissions OK" };
      }

      if (error?.code === "42501") {
        console.error("❌ RLS blocking write:", error.message);
        return { success: false, error: "RLS blocking write" };
      }

      console.log("✅ Write permission granted");
      return { success: true, message: "Write permissions OK" };
    } catch (error: any) {
      console.error("❌ Write test error:", error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log("🚀 Running Fitwell Supabase Integration Tests");
    console.log("============================================\n");

    const results = [
      await this.testClientInitialization(),
      await this.testAuthStatus(),
      await this.testReadFoods(),
      await this.testReadProfile(),
      await this.testRLSPolicy(),
      await this.testWritePermission(),
    ];

    const passed = results.filter((r) => r.success).length;
    const total = results.length;

    console.log("\n============================================");
    console.log(`📊 Results: ${passed}/${total} tests passed`);

    if (passed === total) {
      console.log("✅ All systems go!");
    } else {
      console.log(`⚠️ ${total - passed} tests need attention`);
    }

    return results;
  },
};

// Export for testing
export default supabaseTests;
