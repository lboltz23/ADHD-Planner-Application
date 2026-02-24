import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Pencil } from "lucide-react-native";
import { AppColors, getAppColors } from "../constants/theme";

interface NoteInputProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
}

export default function NoteInput({
  value,
  onChange,
  placeholder = "Enter notes here...",
}: NoteInputProps) {
  return (
    <View style={styles.container}>
    <Text style={styles.label}>Notes: </Text>
      <View style={styles.container}>
    <Pencil size={16} color={AppColors.primary} style={styles.icon} />

      <View style={[styles.inputRow, { backgroundColor: getAppColors(colorBlindMode, isDarkMode).inputBackground, borderColor: getAppColors(colorBlindMode, isDarkMode).border }]}>
      <Pencil size={16} color={getAppColors(colorBlindMode, isDarkMode).primary} style={styles.icon} />

      <TextInput
        style={[[styles.input, { color: getAppColors(colorBlindMode, isDarkMode).primary }], { backgroundColor: getAppColors(colorBlindMode).inputBackground, borderColor: getAppColors(colorBlindMode).border, color: getAppColors(colorBlindMode).primary }]}
        onChangeText={onChange}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={AppColors.placeholder}
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
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    paddingBottom: 4,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
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

