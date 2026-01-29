import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AppColors } from "../constants/theme";
import { Dropdown } from "react-native-element-dropdown";
import { Task } from "../types";

interface RelatedTaskInputProps {
  tasks: Task[];
  selectedTaskId: string;
  onSelect: (taskId: string) => void;
}

export default function RelatedTaskInput({
  tasks,
  selectedTaskId,
  onSelect,
}: RelatedTaskInputProps) {
  const uniqueTasks = tasks.filter((task, index, self) => {
    if (task.recurringTaskId) {
      return self.findIndex((t) => t.recurringTaskId === task.recurringTaskId) === index;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Related To:</Text>
      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.placeholderText}
        selectedTextStyle={styles.selectedText}
        data={uniqueTasks}
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
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.primary,
    marginBottom: 8,
  },
  dropdown: {
    backgroundColor: AppColors.inputBackground,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  placeholderText: {
    fontSize: 14,
    color: AppColors.placeholder,
  },
  selectedText: {
    fontSize: 14,
    color: AppColors.primary,
  },
});
