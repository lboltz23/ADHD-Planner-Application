import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Pencil } from "lucide-react-native";
import { AppColors } from "../constants/theme";

interface TitleInputProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
}

export default function TitleInput({
  value,
  onChange,
  placeholder = "Enter task title",
}: TitleInputProps) {
  return (
    <View style={styles.container}>
    <Text style={styles.label}>Title: </Text>
      <View style={styles.inputRow}>
      <Pencil size={16} color={AppColors.primary} style={styles.icon} />
      <TextInput
        style={styles.input}
        onChangeText={onChange}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={AppColors.placeholder}
        underlineColorAndroid="transparent"
      />
    </View>
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
