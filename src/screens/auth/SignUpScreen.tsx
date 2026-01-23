import { Button, TextInput } from "@components/common";
import { COLORS } from "@constants/index";
import { useAuth } from "@context/AuthContext";
import { validateEmail, validatePassword } from "@utils/validationUtils";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface SignUpScreenProps {
  onSuccess?: () => void;
  onNavigateToSignIn?: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({
  onSuccess,
  onNavigateToSignIn,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signUp } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateEmail(email)) {
      newErrors.email = "Invalid email address";
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.errors[0];
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signUp(email, password);
      onSuccess?.();
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : "Sign up failed",
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

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
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
            Create Account
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: COLORS.neutral.text,
            }}
          >
            Join your fitness journey today
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
          placeholder="Secure password"
          value={password}
          onChangeText={handlePasswordChange}
          error={errors.password}
          secureTextEntry
        />

        <TextInput
          label="Confirm Password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          error={errors.confirmPassword}
          secureTextEntry
        />

        <Button
          title="Create Account"
          onPress={handleSignUp}
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
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={onNavigateToSignIn}>
            <Text style={{ color: COLORS.primary, fontWeight: "600" }}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
