import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { AppColors } from "../constants/theme";

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  startLabel?: string;
  endLabel?: string;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startLabel = "Start Date",
  endLabel = "End Date",
}: DateRangePickerProps) {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const formatDate = (date: Date | null): string => {
    if (!date) return "Select date";
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  return (
    <View style={styles.dateInputRow}>
      <View style={styles.dateInputContainer}>
        <Text style={styles.label}>{startLabel}</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowStartPicker(true)}
        >
          <Text style={startDate ? styles.dateText : styles.datePlaceholder}>
            {formatDate(startDate)}
          </Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={showStartPicker}
          mode="date"
          display="spinner"
          themeVariant="light"
          date={startDate || new Date()}
          minimumDate={new Date()}
          onConfirm={(date) => {
            onStartDateChange(date);
            setShowStartPicker(false);
          }}
          onCancel={() => setShowStartPicker(false)}
        />
      </View>
      <View style={styles.dateInputContainer}>
        <Text style={styles.label}>{endLabel}</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowEndPicker(true)}
        >
          <Text style={endDate ? styles.dateText : styles.datePlaceholder}>
            {formatDate(endDate)}
          </Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={showEndPicker}
          mode="date"
          display="spinner"
          themeVariant="light"
          date={endDate || startDate || new Date()}
          minimumDate={startDate || new Date()}
          onConfirm={(date) => {
            onEndDateChange(date);
            setShowEndPicker(false);
          }}
          onCancel={() => setShowEndPicker(false)}
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
