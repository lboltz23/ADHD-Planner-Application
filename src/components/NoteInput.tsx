import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Pencil } from "lucide-react-native";
import { getAppColors } from "../constants/theme";

interface NoteInputProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  colorBlindMode?: boolean;
}

export default function NoteInput({
  value,
  onChange,
  placeholder = "Enter notes here...",
  colorBlindMode = false,
}: NoteInputProps) {
  return (
    <View style={styles.container}>
    <Text style={styles.label}>Notes: </Text>
      <View style={styles.inputRow}>
      <Pencil size={16} color={AppColors.primary} style={styles.icon} />

      <TextInput
        style={[styles.input, { backgroundColor: getAppColors(colorBlindMode).inputBackground, borderColor: getAppColors(colorBlindMode).border, color: getAppColors(colorBlindMode).primary }]}
        onChangeText={onChange}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={getAppColors(colorBlindMode).placeholder}
      />
      <Pencil size={16} color={getAppColors(colorBlindMode).primary} style={styles.icon} />
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

