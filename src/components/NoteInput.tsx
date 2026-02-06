import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Pencil } from "lucide-react-native";
import { AppColors } from "../constants/theme";

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
    <View style={styles.inputRow}>
      <Text style={styles.label}>Notes: </Text>
      <TextInput
        style={styles.input}
        onChangeText={onChange}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={AppColors.placeholder}
      />
      <Pencil size={16} color={AppColors.primary} style={styles.icon} />
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.primary,
    marginBottom: 4,
    textAlign: "left",
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: AppColors.inputBackground,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: AppColors.primary,
  },
  icon: {
    marginLeft: 8,
  },
});
