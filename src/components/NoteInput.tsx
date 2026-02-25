import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Pencil } from "lucide-react-native";
import { getAppColors } from "../constants/theme";

interface NoteInputProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  colorBlindMode?: boolean;
  isDarkMode?: boolean;
}

export default function NoteInput({
  value,
  onChange,
  placeholder = "Enter notes here...",
  colorBlindMode = false,
  isDarkMode = false,
}: NoteInputProps) {
  return (
    <View style={styles.container}>
    <Text style={styles.label}>Notes: </Text>
      <View style={styles.inputRow}>
      <Pencil size={16} color={AppColors.primary} style={styles.icon} />

      <TextInput
        style={[styles.input, { backgroundColor: getAppColors(colorBlindMode, isDarkMode).inputBackground, borderColor: getAppColors(colorBlindMode, isDarkMode).border, color: getAppColors(colorBlindMode, isDarkMode).primary }]}
        onChangeText={onChange}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={getAppColors(colorBlindMode, isDarkMode).placeholder}
      />
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    paddingBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: AppColors.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderColor: AppColors.border,
    borderWidth: 1,
    paddingBottom: 4,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.primary,
    marginBottom: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: AppColors.primary,
    paddingVertical: 6,
  },
  icon: {
    marginRight: 6,
  },
});

