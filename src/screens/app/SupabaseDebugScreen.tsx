import React, { useState } from "react";
import { View, ScrollView, Alert } from "react-native";
import { supabaseTests } from "@utils/supabaseTests";
import { Button } from "@components/common/Button";

/**
 * Hidden debug screen for testing Supabase integration
 * Access by: Go to Settings → Scroll down → Look for "Debug Tests" button
 * or tap version number 5 times
 */
export const SupabaseDebugScreen: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRunTests = async () => {
    setLoading(true);
    try {
      const testResults = await supabaseTests.runAllTests();
      setResults(testResults);

      const passed = testResults.filter((r) => r.success).length;
      const total = testResults.length;

      Alert.alert("Test Results", `${passed}/${total} tests passed`, [
        { text: "OK" },
      ]);
    } catch (error) {
      Alert.alert("Error", `Failed to run tests: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearResults = () => {
    setResults([]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
      <View style={{ marginTop: 20, marginBottom: 20 }}>
        <Button
          variant="primary"
          size="medium"
          onPress={handleRunTests}
          disabled={loading}
        >
          {loading ? "Running Tests..." : "Run Supabase Tests"}
        </Button>
      </View>

      {results.length > 0 && (
        <View>
          <View style={{ marginBottom: 16 }}>
            <Button
              variant="secondary"
              size="small"
              onPress={handleClearResults}
            >
              Clear Results
            </Button>
          </View>

          {results.map((result, index) => (
            <View
              key={index}
              style={{
                padding: 12,
                marginBottom: 8,
                backgroundColor: result.success ? "#f0fdf4" : "#fef2f2",
                borderRadius: 8,
                borderLeftWidth: 4,
                borderLeftColor: result.success ? "#22c55e" : "#ef4444",
              }}
            >
              <Text
                style={{
                  fontWeight: "600",
                  color: result.success ? "#16a34a" : "#dc2626",
                  marginBottom: 4,
                }}
              >
                {result.success ? "✅" : "❌"} Test {index + 1}
              </Text>
              {result.message && (
                <Text style={{ fontSize: 12, color: "#666" }}>
                  {result.message}
                </Text>
              )}
              {result.error && (
                <Text style={{ fontSize: 11, color: "#dc2626" }}>
                  Error: {result.error}
                </Text>
              )}
              {result.count !== undefined && (
                <Text style={{ fontSize: 12, color: "#666" }}>
                  Count: {result.count}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      <View
        style={{
          marginTop: 20,
          padding: 12,
          backgroundColor: "#f3f4f6",
          borderRadius: 8,
        }}
      >
        <Text style={{ fontWeight: "600", marginBottom: 8 }}>
          📋 Test Guide:
        </Text>
        <Text style={{ fontSize: 12, color: "#666", lineHeight: 18 }}>
          {`1. Client Init: Verifies Supabase client is ready\n\n2. Auth Status: Checks if you're logged in\n\n3. Read Foods: Loads sample foods from database\n\n4. Read Profile: Gets your profile (requires login)\n\n5. RLS Policy: Tests row-level security\n\n6. Write Permission: Tests insert permissions`}
        </Text>
      </View>
    </ScrollView>
  );
};

import { Text } from "react-native";
export default SupabaseDebugScreen;
