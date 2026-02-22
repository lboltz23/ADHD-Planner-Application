import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { AppColors } from "../constants/theme";

interface TimePickerProps {
  time: Date | null;
  onTimeChange: (date: Date) => void;
}

export default function TimePicker({
  time,
  onTimeChange,
}: TimePickerProps) {
  const [showTime, setShowTime] = useState(false);

  const formatDate = (date: Date | null): string => {
    if (!date) return "Select time";
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
        <Text style={styles.label}>Time:</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowTime(true)}
        >
          <Text style={time ? styles.dateText : styles.datePlaceholder}>
            {formatDate(time)}
          </Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={showTime}
          mode="time"
          display="spinner"
          themeVariant="light"
          date={time || new Date()}
          minimumDate={new Date()}
          onConfirm={(date) => {
            onTimeChange(date);
            setShowTime(false);
          }}
          onCancel={() => setShowTime(false)}
        />
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
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.primary,
    marginBottom: 8,
  },
  dateInput: {
    backgroundColor: AppColors.inputBackground,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateText: {
    fontSize: 14,
    color: AppColors.primary,
  },
  datePlaceholder: {
    fontSize: 14,
    color: AppColors.placeholder,
  },
});
