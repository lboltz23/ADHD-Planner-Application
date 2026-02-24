import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { getAppColors } from "../constants/theme";
import { Dropdown } from "react-native-element-dropdown";
import { Task } from "../types";

interface RelatedTaskInputProps {
  tasks: Task[];
  selectedTaskId: string;
  onSelect: (taskId: string) => void;
  colorBlindMode?: boolean;
  isDarkMode?: boolean;
}

export default function RelatedTaskInput({
  tasks,
  selectedTaskId,
  onSelect,
  colorBlindMode = false,
  isDarkMode = false,
}: RelatedTaskInputProps) {
  const selectableTasks = tasks.filter((task) => {
    // Hide completed tasks
    if (task.completed) return false;

    // For recurring types, only show the template, not every instance
    if (task.type === "routine" || task.type === "long_interval") {
      return task.is_template === true;
    }

    return true;
  });

  if (selectableTasks.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.label, { color: getAppColors(colorBlindMode, isDarkMode).primary }]}>Related To:</Text>
        <View style={[styles.emptyState, { backgroundColor: getAppColors(colorBlindMode, isDarkMode).inputBackground, borderColor: getAppColors(colorBlindMode, isDarkMode).border }]}>
          <Text style={[styles.emptyText, { color: getAppColors(colorBlindMode, isDarkMode).placeholder }]}>
            No tasks available. Create a task first to link to.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: getAppColors(colorBlindMode, isDarkMode).primary }]}>Related To:</Text>
      <Dropdown
        style={[styles.dropdown, { backgroundColor: getAppColors(colorBlindMode, isDarkMode).inputBackground, borderColor: getAppColors(colorBlindMode, isDarkMode).border }]}
        placeholderStyle={[styles.placeholderText, { color: getAppColors(colorBlindMode, isDarkMode).placeholder }]}
        selectedTextStyle={[styles.selectedText, { color: getAppColors(colorBlindMode, isDarkMode).primary }]}
        data={selectableTasks}
        labelField="title"
        valueField="id"
        placeholder="Select a task"
        value={selectedTaskId}
        onChange={(item) => onSelect(item.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  placeholderText: {
    fontSize: 14,
  },
  selectedText: {
    fontSize: 14,
  },
  emptyState: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  emptyText: {
    fontSize: 14,
  },
});
