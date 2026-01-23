import React, { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Plus, X, Pencil  } from "lucide-react-native";
import { TaskType, CreateTaskParams } from "../types";
import { Calendar } from "react-native-calendars";

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (params: CreateTaskParams) => void;
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [repeatFrequency, setRepeatFrequency] = useState<"daily" | "weekly" | "monthly">("daily");
  const [intervalDays, setIntervalDays] = useState("");
  const [notes, setNotes] = useState("");
  useEffect(() => {
    setTaskTitle(initialTitle);
  }, [initialTitle]);

  const handleCreateTask = () => {
    // Validation
    if (!taskTitle.trim()) {
      alert("Please enter a task title");
      return;
    }

    // Different validation based on task type
    if (initialTaskType === "routine" || initialTaskType === "long_interval") {
      if (!startDate || !endDate) {
        alert("Please enter both start and end dates");
        return;
      }
      // Validate date format (basic check)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        alert("Please use YYYY-MM-DD format for dates");
        return;
      }

      // Parse start and end dates
      const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
      const parsedStartDate = new Date(startYear, startMonth - 1, startDay);

      const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
      const parsedEndDate = new Date(endYear, endMonth - 1, endDay);

      // Validate end date is after start date
      if (parsedEndDate < parsedStartDate) {
        alert("End date must be after start date");
        return;
      }

      // Parse interval for long_interval type
      const interval = intervalDays ? parseInt(intervalDays) : undefined;

      // Use startDate as the primary task date
      onAddTask({
        title: taskTitle,
        date: parsedStartDate,
        type: initialTaskType,
        repeatFrequency: initialTaskType === "routine" ? repeatFrequency : undefined,
        intervalDays: interval,
        notes,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      });
    } else {
      // For basic and related types
      if (!selectedDate) {
        alert("Please select a date");
        return;
      }
      // Convert selected date string to Date object in local timezone (not UTC) to avoid timezone issues
      const [year, month, day] = selectedDate.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      onAddTask({
        title: taskTitle,
        date,
        type: initialTaskType,
      });
    }

    // Reset form and close dialog
    resetForm();
    onClose();
  };

  const resetForm = () => {
    if (initialTitle) {
      setTaskTitle(initialTitle);
    } else {
      setTaskTitle("");
    }
    setSelectedDate("");
    setStartDate("");
    setEndDate("");
    setRepeatFrequency("daily");
    setIntervalDays("");
    setNotes("");
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
                <View style={styles.inputRow}>
                  <Text style={styles.tasklabel}>Title: *</Text>
                  <TextInput
                    style={styles.input}
                    onChangeText={handleInputChange}
                    value={taskTitle}
                    placeholder = "Enter task title"
                  />
                  <Pencil
                    size={16}
                    color="#6b5b7f"
                    style={{ marginLeft: 8 }}
                  /> 
                </View>

                <Text style={styles.label}>Select Date *</Text>
                {/* Calendar */}
                <Calendar
                  onDayPress={(day) => setSelectedDate(day.dateString)}
                  markedDates={
                    selectedDate
                      ? { [selectedDate]: { selected: true, selectedColor: "#b8a4d9" } }
                      : {}
                  }
                  minDate={new Date().toISOString().split('T')[0]}
                  theme={{
                    todayTextColor: "#a8d8ea",
                    arrowColor: "#a8d8ea",
                  }}
                  style={styles.calendar}
                />
              </View>
            )}
            {initialTaskType === "routine" && (
              <View style = {styles.section}>
                <View style={styles.inputRow}>
                  <Text style={styles.tasklabel}>Title: *</Text>
                  <TextInput
                    style={styles.input}
                    onChangeText={handleInputChange}
                    value={taskTitle}
                    placeholder = "Enter task title"
                  />
                  <Pencil
                    size={16}
                    color="#6b5b7f"
                    style={{ marginLeft: 8 }}
                  />
                </View>

                <View style={styles.dateInputRow}>
                  <View style={styles.dateInputContainer}>
                    <Text style={styles.label}>Start Date *</Text>
                    <TextInput
                      style={styles.dateInput}
                      value={startDate}
                      onChangeText={setStartDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#999"
                    />
                  </View>
                  <View style={styles.dateInputContainer}>
                    <Text style={styles.label}>End Date *</Text>
                    <TextInput
                      style={styles.dateInput}
                      value={endDate}
                      onChangeText={setEndDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>

                <Text style={styles.label}>Repeat Frequency *</Text>
                <View style={styles.frequencyRow}>
                  <TouchableOpacity
                    style={[styles.frequencyButton, repeatFrequency === "daily" && styles.frequencyButtonActive]}
                    onPress={() => setRepeatFrequency("daily")}
                  >
                    <Text style={[styles.frequencyText, repeatFrequency === "daily" && styles.frequencyTextActive]}>
                      Daily
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.frequencyButton, repeatFrequency === "weekly" && styles.frequencyButtonActive]}
                    onPress={() => setRepeatFrequency("weekly")}
                  >
                    <Text style={[styles.frequencyText, repeatFrequency === "weekly" && styles.frequencyTextActive]}>
                      Weekly
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.frequencyButton, repeatFrequency === "monthly" && styles.frequencyButtonActive]}
                    onPress={() => setRepeatFrequency("monthly")}
                  >
                    <Text style={[styles.frequencyText, repeatFrequency === "monthly" && styles.frequencyTextActive]}>
                      Monthly
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {initialTaskType === "related" && (
              <View style = {styles.section}>
                <View style={styles.inputRow}>
                  <Text style={styles.tasklabel}>Title: *</Text>
                  <TextInput
                    style={styles.input}
                    onChangeText={handleInputChange}
                    value={taskTitle}
                    placeholder = "Enter task title"
                  />
                  <Pencil
                    size={16}
                    color="#6b5b7f"
                    style={{ marginLeft: 8 }}
                  />
                </View>

                <Text style={styles.label}>Select Date *</Text>
                <Calendar
                  onDayPress={(day) => setSelectedDate(day.dateString)}
                  markedDates={
                    selectedDate
                      ? { [selectedDate]: { selected: true, selectedColor: "#b8a4d9" } }
                      : {}
                  }
                  minDate={new Date().toISOString().split('T')[0]}
                  theme={{
                    todayTextColor: "#a8d8ea",
                    arrowColor: "#a8d8ea",
                  }}
                  style={styles.calendar}
                />
              </View>
            )}
            {initialTaskType === "long_interval" && (
              <View style = {styles.section}>
                <View style={styles.inputRow}>
                  <Text style={styles.tasklabel}>Title: *</Text>
                  <TextInput
                    style={styles.input}
                    onChangeText={handleInputChange}
                    value={taskTitle}
                    placeholder = "Enter task title"
                  />
                  <Pencil
                    size={16}
                    color="#6b5b7f"
                    style={{ marginLeft: 8 }}
                  />
                </View>

                <View style={styles.dateInputRow}>
                  <View style={styles.dateInputContainer}>
                    <Text style={styles.label}>Start Date *</Text>
                    <TextInput
                      style={styles.dateInput}
                      value={startDate}
                      onChangeText={setStartDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#999"
                    />
                  </View>
                  <View style={styles.dateInputContainer}>
                    <Text style={styles.label}>End Date *</Text>
                    <TextInput
                      style={styles.dateInput}
                      value={endDate}
                      onChangeText={setEndDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <Text style={styles.label}>Interval (days):</Text>
                  <TextInput
                    style={styles.dateInput}
                    value={intervalDays}
                    onChangeText={setIntervalDays}
                    placeholder="e.g., 3"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </View>
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
    alignItems: "center",
    padding: 10,
    width: "100%",
  },
  dialog: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "95%",
    maxWidth: 800,
  },
  calendar: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5d9f2",
    marginBottom: 16,
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
    marginRight: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: "#f8f6fb",
    borderWidth: 1,
    borderColor: "#e5d9f2",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#6b5b7f",
  },
  dateInputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateInput: {
    backgroundColor: "#f8f6fb",
    borderWidth: 1,
    borderColor: "#e5d9f2",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#6b5b7f",
  },
  frequencyRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5d9f2",
    backgroundColor: "#f8f6fb",
    alignItems: "center",
  },
  frequencyButtonActive: {
    backgroundColor: "#b8a4d9",
    borderColor: "#b8a4d9",
  },
  frequencyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b5b7f",
  },
  frequencyTextActive: {
    color: "#ffffff",
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
