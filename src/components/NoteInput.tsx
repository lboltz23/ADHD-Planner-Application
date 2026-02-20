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
    <View style={styles.inputRow}>
      <Text style={[styles.label, { color: getAppColors(colorBlindMode, isDarkMode).primary }]}>Notes: </Text>
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
    paddingVertical: 6,
    paddingBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
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

