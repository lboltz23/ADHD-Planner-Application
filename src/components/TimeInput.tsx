import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { AppColors } from "../constants/theme";
import { getAppColors } from "../constants/theme";
import { Pencil } from "lucide-react-native";

interface TimePickerProps {
  time: Date | null;
  onTimeChange: (date: Date) => void;
  colorBlindMode?: boolean;
  isDarkMode?: boolean;
}

export default function TimePicker({
  time,
  onTimeChange,
  colorBlindMode = false,
  isDarkMode = false
}: TimePickerProps) {
  const [showTime, setShowTime] = useState(false);

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
        <View style = {{flexDirection: "row",justifyContent:"center",alignContent:"center",alignItems:"center"}}>
          <Text style={[styles.label, { color: getAppColors(colorBlindMode, isDarkMode).primary }]}>Time:  </Text>
        <TouchableOpacity
          style={[styles.dateInput,{ backgroundColor: getAppColors(colorBlindMode, isDarkMode).inputBackground, borderColor: getAppColors(colorBlindMode, isDarkMode).border }]}
          onPress={() => setShowTime(true)}
        >
          <Text style={time ? styles.dateText : styles.datePlaceholder}>
            {formatDate(time)}
          </Text>
        </TouchableOpacity>
        <Pencil size={16} color={getAppColors(colorBlindMode, isDarkMode).primary} style={styles.icon} />
        <DateTimePickerModal
          isVisible={showTime}
          mode="time"
          display="spinner"
          themeVariant="light"
          date={time || new Date()}
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
    paddingHorizontal: 12,
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
