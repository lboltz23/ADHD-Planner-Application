import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { AppColors } from "../constants/theme";
import { getAppColors } from "../constants/theme";
import { toLocalDateString } from "../types";
import { Pencil } from "lucide-react-native";

interface TimePickerProps {
  time: Date | null;
  onTimeChange: (date: Date) => void;
  colorBlindMode?: boolean;
  isDarkMode?: boolean;
  selectedDate?: string; // "YYYY-MM-DD"
}

export default function TimePicker({
  time,
  onTimeChange,
  colorBlindMode = false,
  isDarkMode = false,
  selectedDate,
}: TimePickerProps) {
  const [showTime, setShowTime] = useState(false);

  const getBaseDate = (): Date => {
    if (time) return time;
    if (selectedDate) {
      const [year, month, day] = selectedDate.split('-').map(Number);
      const base = new Date(year, month - 1, day);
      base.setHours(new Date().getHours(), new Date().getMinutes(), 0, 0);
      return base;
    }
    return new Date();
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return "Select time...";
    return date.toLocaleTimeString("en-US", {
      hour:"2-digit",
      hour12: true,
      minute:"2-digit",
      timeZoneName:'short'
    });
  };

  return (
    <View style={styles.dateInputRow}>
      <View style={styles.dateInputContainer}>
        <Text style={[styles.label, { color: getAppColors(colorBlindMode, isDarkMode).primary }]}>Time:  </Text>
        <View style = {{flexDirection: "row",justifyContent:"center",alignContent:"center",alignItems:"center"}}>
        <TouchableOpacity
          style={[styles.dateInput,{ backgroundColor: getAppColors(colorBlindMode, isDarkMode).inputBackground, borderColor: getAppColors(colorBlindMode, isDarkMode).border,flexDirection:"row" }]}
          onPress={() => setShowTime(true)}
        >
          <Pencil size={16} color={getAppColors(colorBlindMode, isDarkMode).primary} style={styles.icon} />
          <Text
            style={[
              time ? styles.dateText : styles.datePlaceholder,
              { paddingHorizontal: 4, color: time ? getAppColors(colorBlindMode, isDarkMode).primary : getAppColors(colorBlindMode, isDarkMode).placeholder }
            ]}
          >
            {formatDate(time)}
          </Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={showTime}
          mode="time"
          display="spinner"
          isDarkModeEnabled={isDarkMode}
          themeVariant={isDarkMode ? "dark" : "light"}
          date={getBaseDate()}
          minimumDate={selectedDate === toLocalDateString(new Date()) ? new Date() : undefined}
          onConfirm={(date) => {
            onTimeChange(date);
            setShowTime(false);
          }}
          onCancel={() => setShowTime(false)}
        />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dateInputRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  dateInputContainer: {
    flex: 1,
    minWidth: 120,
  },
  label: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "left",
    marginRight: 8,
  },
  dateInput: {
    backgroundColor: AppColors.inputBackground,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    paddingHorizontal: 0,
    paddingVertical: 10,
    flex:1
  },
  dateText: {
    fontSize: 14,
    color: AppColors.primary,
  },
  datePlaceholder: {
    fontSize: 14,
    color: AppColors.placeholder,
  },icon: {
    marginLeft: 8,
  },
});
