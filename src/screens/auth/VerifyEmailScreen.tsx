import { Button } from "@components/common";
import { COLORS } from "@constants/index";
import { useAuth } from "@context/AuthContext";
import React from "react";
import {
    KeyboardAvoidingView,
    Linking,
    Platform,
    ScrollView,
    Text,
    View,
} from "react-native";

interface VerifyEmailScreenProps {
  onNavigateToSignIn?: () => void;
}

export const VerifyEmailScreen: React.FC<VerifyEmailScreenProps> = ({
  onNavigateToSignIn,
}) => {
  const { verificationEmail, clearVerificationEmail } = useAuth();

  const handleOpenEmail = async () => {
    const mailtoUrl = "mailto:";
    const canOpen = await Linking.canOpenURL(mailtoUrl);
    if (canOpen) {
      await Linking.openURL(mailtoUrl);
    }
  };

  const handleBackToSignIn = () => {
    clearVerificationEmail();
    onNavigateToSignIn?.();
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
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: COLORS.neutral.textDark,
              marginBottom: 8,
            }}
          >
            Verify your email
          </Text>
          <Text style={{ fontSize: 14, color: COLORS.neutral.text }}>
            We sent a verification link to:
          </Text>
          <Text
            style={{
              marginTop: 8,
              fontSize: 14,
              color: COLORS.primary,
              fontWeight: "600",
            }}
          >
            {verificationEmail ?? "your email address"}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "#eef2ff",
            borderRadius: 8,
            padding: 12,
            marginBottom: 20,
          }}
        >
          <Text style={{ color: COLORS.neutral.text, fontSize: 14 }}>
            Please open your inbox and click the verification link. Sign-up is
            complete only after verification.
          </Text>
        </View>

        <Button
          title="Open Email App"
          onPress={handleOpenEmail}
          fullWidth
          style={{ marginBottom: 12 }}
        />

        <Button
          title="I have verified, sign in"
          onPress={handleBackToSignIn}
          fullWidth
          variant="secondary"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
