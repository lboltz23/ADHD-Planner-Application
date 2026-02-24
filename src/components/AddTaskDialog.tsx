import React, { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Plus, X } from "lucide-react-native";
import { Task, TaskType, CreateTaskParams, Weekday, toLocalDateString } from "../types";
import { Calendar } from "react-native-calendars";
import { getTaskTypeColor, getEnhancedTaskTypeColor } from "./taskColors";
import TitleInput from "./TitleInput";
import DateRangePicker from "./DateRangePicker";
import RelatedTaskInput from "./RelatedTask";
import NoteInput from "./NoteInput";
import TimePicker from "./TimeInput";
import { getAppColors, AppThemeColors, resolveThemePreference } from "../constants/theme";
import { useColorScheme } from '../hooks/use-color-scheme';

const ALL_WEEKDAYS: Weekday[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const WEEKDAY_ABBREVIATIONS: Record<Weekday, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (params: CreateTaskParams) => void;
  initialTaskType: TaskType;
  initialTitle?: string;
  colorBlindMode?: boolean;
  tasks?: Task[];
}

export default function AddTaskDialog({
  isOpen,
  onClose,
  onAddTask,
  initialTaskType,
  initialTitle = "",
  colorBlindMode = false,
  tasks = [],
}: AddTaskDialogProps) {
  const [taskTitle, setTaskTitle] = useState(initialTitle);
  const [selectedDate, setSelectedDate] = useState("");
  const [editedTime, setEditedTime] = useState<Date | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedDays, setSelectedDays] = useState<Weekday[]>([]);
  const [intervalMonths, setIntervalMonths] = useState("");
  const [parentTaskId, setParentTaskId] = useState("");
  const [notes, setNotes] = useState("");

  // Toggle a weekday selection
  const toggleDay = (day: Weekday) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };
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
      // Default start date to today if not provided
      const effectiveStartDate = startDate || new Date();

      // Validate end date is after start date if both are provided
      if (endDate && endDate < effectiveStartDate) {
        alert("End date must be after start date");
        return;
      }

      // Parse interval for long_interval type
      const interval = intervalMonths ? parseInt(intervalMonths) : undefined;

      // Validate at least one day is selected for routine tasks
      if (initialTaskType === "routine" && selectedDays.length === 0) {
        alert("Please select at least one day to repeat on");
        return;
      }

      // Use startDate as the primary task date
      onAddTask({
        title: taskTitle,
        due_date: effectiveStartDate,
        time: editedTime || new Date(new Date().setHours(23, 59, 0, 0)),
        type: initialTaskType,
        days_selected: initialTaskType === "routine" ? selectedDays : undefined,
        recurrence_interval: interval,
        notes,
        start_date: effectiveStartDate,
        end_date: endDate || undefined,
      });
    } else {
      // For basic and related types
      if (!selectedDate) {
        alert("Please select a date");
        return;
      }

      // Validate parent task is selected for related tasks
      if (initialTaskType === "related" && !parentTaskId) {
        alert("Please select a parent task to link to");
        return;
      }

      // Convert selected date string to Date object in local timezone (not UTC) to avoid timezone issues
      const [year, month, day] = selectedDate.split('-').map(Number);
      const dueDate = new Date(year, month - 1, day);
      onAddTask({
        title: taskTitle,
        due_date: dueDate,
        time: editedTime ||new Date(new Date().setHours(23, 59, 0, 0)),
        type: initialTaskType,
        parent_task_id: initialTaskType === "related" ? parentTaskId : undefined,
        notes: notes,
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
    setStartDate(null);
    setEndDate(null);
    setEditedTime(null);
    setSelectedDays([]);
    setIntervalMonths("");
    setParentTaskId("");
    setNotes("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleInputChange = (text: string) => {
    setTaskTitle(text);
  }

  const getTypeColor = () => {
    return getTaskTypeColor(initialTaskType, colorBlindMode);
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
            {initialTaskType === "basic" && (
              <View style={[styles.section, { borderColor: getAppColors(colorBlindMode, isDarkMode).sectionBorder }]}>
                <TitleInput value={taskTitle} onChange={handleInputChange} colorBlindMode={colorBlindMode} isDarkMode={isDarkMode} />
                <NoteInput value={notes} onChange={setNotes} colorBlindMode={colorBlindMode} isDarkMode={isDarkMode} />
                <TimePicker time = {editedTime} onTimeChange={setEditedTime}/>
                <Text style={[styles.label, { color: getAppColors(colorBlindMode, isDarkMode).primary }]}>Select Date: </Text>
                {/* Calendar */}
                <Calendar
                  onDayPress={(day) => setSelectedDate(day.dateString)}
                  markedDates={
                    selectedDate
                      ? { [selectedDate]: { selected: true, selectedColor: "#b8a4d9" } }
                      : {}
                  }
                  minDate={toLocalDateString(new Date())}
                  theme={{
                    todayTextColor: "#a8d8ea",
                    arrowColor: "#a8d8ea",
                  }}
                  style={styles.calendar}
                />
              </View>
            )}
            {initialTaskType === "routine" && (
              <View style={styles.section}>
                <TitleInput value={taskTitle} onChange={handleInputChange} />
                <NoteInput value={notes} onChange={setNotes} />
                <TimePicker time = {editedTime} onTimeChange={setEditedTime}/>

                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                />

                <Text style={styles.label}>Repeat On (select days): </Text>
                <View style={styles.frequencyRow}>
                  {ALL_WEEKDAYS.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.frequencyButton,
                        selectedDays.includes(day) && styles.frequencyButtonActive,
                      ]}
                      onPress={() => toggleDay(day)}
                    >
                      <Text
                        style={[
                          styles.frequencyText,
                          selectedDays.includes(day) && styles.frequencyTextActive,
                        ]}
                      >
                        {WEEKDAY_ABBREVIATIONS[day]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            {initialTaskType === "related" && (
              <View style={styles.section}>
                <TitleInput value={taskTitle} onChange={handleInputChange} />
                <NoteInput value={notes} onChange={setNotes} />
                <TimePicker time = {editedTime} onTimeChange={setEditedTime}/>

                <RelatedTaskInput
                  tasks={tasks}
                  selectedTaskId={parentTaskId}
                  onSelect={setParentTaskId}
                />
                <Text style={styles.label}>Select Date: </Text>
                <Calendar
                  onDayPress={(day) => setSelectedDate(day.dateString)}
                  markedDates={
                    selectedDate
                      ? { [selectedDate]: { selected: true, selectedColor: "#b8a4d9" } }
                      : {}
                  }
                  minDate={toLocalDateString(new Date())}
                  theme={{
                    todayTextColor: "#a8d8ea",
                    arrowColor: "#a8d8ea",
                  }}
                  style={styles.calendar}
                />
              </View>
            )}
            {initialTaskType === "long_interval" && (
              <View style={styles.section}>
                <TitleInput value={taskTitle} onChange={handleInputChange} />
                <NoteInput value={notes} onChange={setNotes} />
                <TimePicker time = {editedTime} onTimeChange={setEditedTime}/>

                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                />

                <View style={styles.inputRow}>
                  <Text style={styles.label}>Interval(months): </Text>
                  <TextInput
                    style={styles.dateInput}
                    value={intervalMonths}
                    onChangeText={setIntervalMonths}
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
                  { backgroundColor: getEnhancedTaskTypeColor(initialTaskType, colorBlindMode) },
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
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 40,
    width: "100%",
  },
  dialog: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 18,
    width: "100%",
    maxWidth: 400,
    minHeight: 350,
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
    padding: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b5b7f",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  frequencyButton: {
    flexGrow: 1,
    flexBasis: "28%",
    minWidth: 80,
    paddingVertical: 12,
    paddingHorizontal: 8,
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
    // backgroundColor is set dynamically based on task type
  },
  createText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});
