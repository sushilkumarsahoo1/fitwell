import React from "react";
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
  Text,
  ViewStyle,
} from "react-native";
import { COLORS } from "@constants/index";

interface InputProps extends RNTextInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  error?: string;
  containerStyle?: ViewStyle;
  icon?: React.ReactNode;
  secureTextEntry?: boolean;
}

export const TextInput: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  containerStyle,
  icon,
  secureTextEntry = false,
  ...props
}) => {
  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {label && (
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: COLORS.neutral.textDark,
            marginBottom: 8,
          }}
        >
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: error ? COLORS.danger : COLORS.neutral.border,
          borderRadius: 12,
          paddingHorizontal: 12,
          backgroundColor: COLORS.neutral.lighter,
        }}
      >
        {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
        <RNTextInput
          style={{
            flex: 1,
            paddingVertical: 12,
            fontSize: 16,
            color: COLORS.neutral.textDark,
          }}
          placeholder={placeholder}
          placeholderTextColor={COLORS.neutral.text}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          {...props}
        />
      </View>
      {error && (
        <Text
          style={{
            fontSize: 12,
            color: COLORS.danger,
            marginTop: 6,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};
