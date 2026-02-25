import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Pencil } from "lucide-react-native";
import { AppColors, getAppColors } from "../constants/theme";


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
    <View style={styles.container}>
    <Text style={[styles.label, { color: getAppColors(colorBlindMode, isDarkMode).primary }]}>Title: </Text>
      <View style={[styles.inputRow, { backgroundColor: getAppColors(colorBlindMode, isDarkMode).inputBackground, borderColor: getAppColors(colorBlindMode, isDarkMode).border }]}>
      <Pencil size={16} color={getAppColors(colorBlindMode, isDarkMode).primary} style={styles.icon} />
      <TextInput
        style={[styles.input, {  color: getAppColors(colorBlindMode, isDarkMode).primary }]}
        onChangeText={onChange}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={getAppColors(colorBlindMode, isDarkMode).placeholder}
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
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 6,
  },
  icon: {
    marginRight: 6,
  },
});
