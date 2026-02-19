import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { getAppColors } from "../constants/theme";

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  startLabel?: string;
  endLabel?: string;
  colorBlindMode?: boolean;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startLabel = "Start Date",
  endLabel = "End Date",
  colorBlindMode = false,
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
        <Text style={[styles.label, { color: getAppColors(colorBlindMode).primary }]}>{startLabel}</Text>
        <TouchableOpacity
          style={[styles.dateInput, {backgroundColor: getAppColors(colorBlindMode).inputBackground, borderColor: getAppColors(colorBlindMode).border }]}
          onPress={() => setShowStartPicker(true)}
        >
          <Text style={startDate ? [styles.dateText, { color: getAppColors(colorBlindMode).primary }] : [styles.datePlaceholder, {color: getAppColors(colorBlindMode).placeholder }]}>
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
        <Text style={[styles.label, { color: getAppColors(colorBlindMode).primary }]}>{endLabel}</Text>
        <TouchableOpacity
          style={[styles.dateInput, {backgroundColor: getAppColors(colorBlindMode).inputBackground, borderColor: getAppColors(colorBlindMode).border }]}
          onPress={() => setShowEndPicker(true)}
        >
          <Text style={endDate ? [styles.dateText, { color: getAppColors(colorBlindMode).primary }] : [styles.datePlaceholder, {color: getAppColors(colorBlindMode).placeholder }]}>
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
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateText: {
    fontSize: 14,
  },
  datePlaceholder: {
    fontSize: 14,
  },
});
