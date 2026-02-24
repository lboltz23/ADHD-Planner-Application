import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Pencil } from "lucide-react-native";
import { getAppColors } from "../constants/theme";


interface TitleInputProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  colorBlindMode?: boolean;
  isDarkMode?: boolean;
}

export default function TitleInput({
  value,
  onChange,
  colorBlindMode = false,
  isDarkMode = false,
  placeholder = "Enter task title",
}: TitleInputProps) {
  return (
    <View style={styles.inputRow}>
      <Text style={[styles.label, { color: getAppColors(colorBlindMode, isDarkMode).primary }]}>Title: *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: getAppColors(colorBlindMode, isDarkMode).inputBackground, borderColor: getAppColors(colorBlindMode, isDarkMode).border, color: getAppColors(colorBlindMode, isDarkMode).primary }]}
        onChangeText={onChange}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={getAppColors(colorBlindMode, isDarkMode).placeholder}
      />
      <Pencil size={16} color={getAppColors(colorBlindMode, isDarkMode).primary} style={styles.icon} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderColor: AppColors.border,
    borderWidth: 1,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "left",
    marginRight: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  icon: {
    marginRight: 6,
  },
});
