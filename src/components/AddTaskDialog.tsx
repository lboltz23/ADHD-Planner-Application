import React, { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Plus, X } from "lucide-react-native";
import { TaskType } from "../types";
import { Calendar } from "react-native-calendars";

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (title: string, date: Date, type: TaskType) => void;
  initialTaskType: TaskType;
  initialTitle?: string;
}

export default function AddTaskDialog({
  isOpen,
  onClose,
  onAddTask,
  initialTaskType,
  initialTitle = "",
}: AddTaskDialogProps) {
  const [taskTitle, setTaskTitle] = useState(initialTitle);
  const [selectedDate, setSelectedDate] = useState("");

  // TODO: Add state for task-specific fields
  // - repeatFrequency for routine tasks
  // - intervalDays for long_interval tasks
  // - notes for all tasks
  // - parentTaskId for related tasks
  useEffect(() => {
    setTaskTitle(initialTitle);
  }, [initialTitle]);

  const handleCreateTask = () => {
    // TODO: Add validation
    // - Check if title is not empty
    // - Check if date is selected (for tasks that need it)
    // - Check if interval is valid (for long_interval tasks)

    // TODO: Convert selected date to Date object
    // TODO: Call onAddTask with all necessary data

    // TODO: Reset form and close dialog
  };

  const resetForm = () => {
    // TODO: Reset all form fields to default values
    setTaskTitle("");
    setSelectedDate("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleInputChange = (text: string) => {
    setTaskTitle(text);
  }

  // Get color based on task type
  const getTypeColor = () => {
    switch (initialTaskType) {
      case "routine":
        return "#b8a4d9";
      case "basic":
        return "#a8d8ea";
      case "related":
        return "#ffc9d4";
      case "long_interval":
        return "#f5a4e0";
      default:
        return "#a8d8ea";
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.dialog}>
            {/* Header */}
            <View style={styles.header}>
              <LinearGradient
                colors={[getTypeColor(), "#ffffff"]}
                style={styles.iconContainer}
              >
                <Plus color="white" size={20} />
              </LinearGradient>
              <Text style={styles.title}>Create New Task</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={24} color="#6b5b7f" />
              </TouchableOpacity>
            </View>
            {/* TODO: Add conditional fields based on task type */}
            {/*
              - BASIC: Date picker + Notes
              - ROUTINE: Frequency selector (daily/weekly/monthly) + Notes
              - RELATED: Date picker + Parent task selector + Notes
              - LONG_INTERVAL: Date picker + Interval input + Notes
            */}
            {initialTaskType === "basic" && (
              <View style = {styles.section}>
                <Text style={styles.tasklabel}>Title:</Text>
                  <TextInput
                    onChangeText={handleInputChange}
                    value={taskTitle}
                    placeholder = "Enter task title"
                  />
                <Text style={styles.label}>Select Date *</Text>
              </View>
            )}
            {initialTaskType === "routine" && (
              <View style = {styles.section}>
                <Text style={styles.tasklabel}>Title: {taskTitle}</Text>
                  <Text style={styles.label}>Select Date Routine*</Text>
                
              </View>
              )}
            {initialTaskType === "related" && (
              <View style = {styles.section}>
                <Text style={styles.tasklabel}>Title: {taskTitle}</Text>
                  <Text style={styles.label}>Select Date Related*</Text>
                
              </View>
              )}
            {initialTaskType === "long_interval" && (
              <View style = {styles.section}>
                <Text style={styles.tasklabel}>Title: {taskTitle}</Text>
                  <Text style={styles.label}>Select Date Long Interval*</Text>
                
              </View>
              )}
            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={handleClose} style={[styles.button, styles.cancelButton]}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCreateTask}
                style={[
                  styles.button,
                  styles.createButton,
                  { backgroundColor: getTypeColor() },
                ]}
              >
                <Text style={styles.createText}>Create Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  dialog: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#6b5b7f",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  section: {
    marginBottom: 16,
    borderWidth: 3,
    borderRadius: 8,
    borderColor: "#e5d9f2",
    padding: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b5b7f",
    marginBottom: 8,
  },
  tasklabel: {
    fontSize: 20,
    fontWeight: "600",
    color: "#6b5b7f",
    marginBottom: 4,
    textAlign: "left",
    flexDirection: "row",
  },
  input: {
    backgroundColor: "#f8f6fb",
    borderWidth: 1,
    borderColor: "#e5d9f2",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#6b5b7f",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#e5d9f2",
    backgroundColor: "#f8f6fb",
  },
  cancelText: {
    color: "#6b5b7f",
    fontWeight: "600",
    fontSize: 14,
  },
  createButton: {
    // backgroundColor set dynamically based on task type
  },
  createText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});
