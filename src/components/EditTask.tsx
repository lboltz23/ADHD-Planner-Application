import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { X, Trash2, CheckCircle2, Link as LinkIcon, Save } from "lucide-react-native";
import { Calendar } from "react-native-calendars";
import { Task, toLocalDateString } from "../types";
import { getTaskTypeColor, getEnhancedTaskTypeColor } from "./taskColors";
import TitleInput from "./TitleInput";
import NoteInput from "./NoteInput";
import { getAppColors } from "../constants/theme";
import DateRangePicker from "./DateRangePicker";
import TimePicker from "./TimeInput";
import { confirm } from "./Confirmation";

export interface EditTaskProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onSave: (id: string, fields: { title?: string; due_date?: Date; notes?: string }) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  colorBlindMode?: boolean;
  isDarkMode?: boolean;
}

export default function EditTask({
  isOpen,
  onClose,
  task,
  onSave,
  onDelete,
  onToggle,
  colorBlindMode = false,
  isDarkMode = false,
}: EditTaskProps) {
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDate, setEditedDate] = useState(task.due_date);
  const [editedTime, setEditedTime] = useState(task.time|| null);
  const [editiedNotes, setEditedNotes] = useState(task.notes || "");
  const handleSave = () => {
    if (editedTitle.trim()) {
      onSave(task.id, { title: editedTitle.trim(), due_date: editedDate, notes: editiedNotes });
      onClose();
    }
  };

  const handleDelete = () => {
    onDelete(task.id);
    onClose();
  };

  const handleToggleComplete = () => {
    onToggle(task.id);
  };

  const handleDateSelect = (day: any) => {
    const [year, month, dayNum] = day.dateString.split('-').map(Number);
    const newDate = new Date(year, month - 1, dayNum);
    setEditedDate(newDate);
  };

  // Convert editedDate to YYYY-MM-DD format for calendar
  const getDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const typeColor = getTaskTypeColor(task.type, colorBlindMode);

  return (
    <>
      <Modal visible={isOpen} transparent animationType="fade">
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={[styles.dialog, { backgroundColor: isDarkMode ? '#1b2133' : 'white' }]}>
              {/* Header */}
              <View style={styles.header}>
                <View style={[styles.typeIndicator, { backgroundColor: typeColor }]} />
                <Text style={[styles.title, { color: getAppColors(colorBlindMode, isDarkMode).primary }]}>Edit Task</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={24} color={getAppColors(colorBlindMode, isDarkMode).primary} />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View style={[styles.section, { borderColor: getAppColors(colorBlindMode, isDarkMode).sectionBorder }]}>
                <TitleInput value={editedTitle} onChange={setEditedTitle} colorBlindMode={colorBlindMode} isDarkMode={isDarkMode} />
                <NoteInput value = {editiedNotes} onChange={setEditedNotes} colorBlindMode={colorBlindMode} isDarkMode={isDarkMode} />
                <TimePicker time = {editedTime} onTimeChange={setEditedTime} colorBlindMode={colorBlindMode} isDarkMode={isDarkMode}/>
                <Text style={[styles.label, { color: getAppColors(colorBlindMode, isDarkMode).primary }]}>Due Date</Text>
                <Calendar
                  onDayPress={handleDateSelect}
                  markedDates={{
                    [getDateString(editedDate)]: {
                      selected: true,
                      selectedColor: colorBlindMode ? "#33BBEE" : "#b8a4d9",
                    }
                  }}
                  minDate={toLocalDateString(new Date())}
                  theme={{
                    todayTextColor: colorBlindMode ? "#33BBEE" : "#a8d8ea",
                    arrowColor: colorBlindMode ? "#33BBEE" : "#a8d8ea",
                  }}
                  style={[styles.calendar, { borderColor: getAppColors(colorBlindMode, isDarkMode).border }]}
                />
                </View>
              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <View style={styles.leftButtons}>
                  <TouchableOpacity
                    onPress= {async () => {
                      const confirmed = await confirm(task.is_template? "Are you sure you want to delete this recurring task? \n\n" + "Warning: This will delete all instances of this recurring task." : "Are you sure you want to delete this task?");
                      if (confirmed) {
                        handleDelete();
                      }
                    }}
                    style={[styles.button, styles.deleteButton]}
                  >
                    <Trash2 size={16} color="#ffffff" />
                    <Text style={styles.deleteText}
                      adjustsFontSizeToFit
                      numberOfLines={1}
                      >
                      Delete
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleToggleComplete}
                    style={[styles.button, task.completed ? styles.completeButtonActive : styles.completeButton]}
                  >
                    <CheckCircle2 size={16} color={task.completed ? "#ffffff" : "#3bdc29"} />
                    <Text style={task.completed ? styles.completeTextActive : styles.completeText}>
                      {task.completed ? "Completed" : "Complete"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.rightButtons}>
                  <TouchableOpacity
                    onPress={handleSave}
                    style={[styles.button, styles.saveButton, { backgroundColor: getEnhancedTaskTypeColor(task.type, colorBlindMode) }]}
                  >
                    <Save size={16} color="#ffffff" />
                    <Text style={styles.saveText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
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
  typeIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
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
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 12,
  },
  calendar: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5d9f2",
    marginBottom: 16,
  },
  notesText: {
    fontSize: 14,
    color: "#6b5b7f",
    backgroundColor: "#f8f6fb",
    borderWidth: 1,
    borderColor: "#e5d9f2",
    borderRadius: 8,
    padding: 12,
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 8,
  },
  leftButtons: {
    flexDirection: "row",
    flex: 1,
    gap: 6,
  },
  rightButtons: {
    flexDirection: "row",
    gap: 8,
    flex: 1,
    justifyContent: "flex-end",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 2,
  },
  deleteButton: {
    backgroundColor: "#f85e5e",
  },
  deleteText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  completeButton: {
    borderWidth: 1,
    borderColor: "#3bdc29",
    backgroundColor: "#e6f9e6",
  },
  completeButtonActive: {
    backgroundColor: "#3bdc29",
  },
  completeText: {
    color: "#3bdc29",
    fontWeight: "600",
    fontSize: 14,
  },
  completeTextActive: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  saveButton: {
    // backgroundColor set dynamically
  },
  saveText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 4,
  },
  parentTaskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    padding: 8,
    backgroundColor: "#fef9fc",
    borderWidth: 1,
    borderColor: "#ffc9d4",
    borderRadius: 8,
  },
  parentTaskText: {
    fontSize: 13,
    color: "#6b5b7f",
    flex: 1,
  },
});
