import { Button, TextInput } from "@components/common";
import { COLORS } from "@constants/index";
import { useAuth } from "@context/AuthContext";
import { validateEmail } from "@utils/validationUtils";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface SignInScreenProps {
  onSuccess?: () => void;
  onNavigateToSignUp?: () => void;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({
  onSuccess,
  onNavigateToSignUp,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateEmail(email)) {
      newErrors.email = "Invalid email address";
    }

    if (password.length < 6) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signIn(email, password);
      onSuccess?.();
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : "Sign in failed",
      });
    } finally {
      setLoading(false);
    }
  };

  // Clear general error when user modifies input
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: "" }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: "" }));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingVertical: 40,
          justifyContent: "center",
        }}
      >
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: COLORS.neutral.textDark,
              marginBottom: 8,
            }}
          >
            Welcome Back
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: COLORS.neutral.text,
            }}
          >
            Sign in to continue your fitness journey
          </Text>
        </View>

        {errors.general && (
          <View
            style={{
              backgroundColor: "#fee2e2",
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
            }}
          >
            <Text style={{ color: COLORS.danger, fontSize: 14 }}>
              {errors.general}
            </Text>
          </View>
        )}

        <TextInput
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={handleEmailChange}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          label="Password"
          placeholder="Enter password"
          value={password}
          onChangeText={handlePasswordChange}
          error={errors.password}
          secureTextEntry
        />

        <Button
          title="Sign In"
          onPress={handleSignIn}
          loading={loading}
          fullWidth
          style={{ marginVertical: 16 }}
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 16,
          }}
        >
          <Text style={{ color: COLORS.neutral.text }}>
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity onPress={onNavigateToSignUp}>
            <Text style={{ color: COLORS.primary, fontWeight: "600" }}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
