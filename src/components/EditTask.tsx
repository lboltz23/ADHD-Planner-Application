import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { X, Trash2, CheckCircle2, Link as LinkIcon } from "lucide-react-native";
import { Calendar } from "react-native-calendars";
import { Task, toLocalDateString } from "../types";
import { getTaskTypeColor, getEnhancedTaskTypeColor } from "./taskColors";
import TitleInput from "./TitleInput";
import NoteInput from "./NoteInput";
import RelatedTaskInput from "./RelatedTask";

export interface EditTaskProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  tasks: Task[]; // Pass all tasks for related task selection
  onSave: (id: string, fields: { title?: string; due_date?: Date; notes?: string; parent_id?: string; start_date?: Date; end_date?: Date; recurrence_interval?: number; days_selected?: string[] }) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  colorBlindMode?: boolean;
}

export default function EditTask({
  isOpen,
  onClose,
  task,
  tasks = [],
  onSave,
  onDelete,
  onToggle,
  colorBlindMode = false,
}: EditTaskProps) {
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDate, setEditedDate] = useState(task.due_date);
  const [editedStartDate, setEditedStartDate] = useState(task.start_date);
  const [editedEndDate, setEditedEndDate] = useState(task.end_date);
  const [editedInterval, setEditedInterval] = useState(task.recurrence_interval);
  const [editedParentId, setEditedParentId] = useState(task.parent_task_id);
  const [editiedNotes, setEditedNotes] = useState(task.notes || "");
  const [editedDaysSelected, setEditedDaysSelected] = useState(task.days_selected || []);

  const handleSave = () => {
    if (editedTitle.trim()) {
      onSave(task.id, { title: editedTitle.trim(), due_date: editedDate, notes: editiedNotes, start_date: editedStartDate, end_date: editedEndDate, recurrence_interval: editedInterval, parent_id: editedParentId, days_selected: editedDaysSelected });
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
            <View style={styles.dialog}>
              {/* Header */}
              <View style={styles.header}>
                <View style={[styles.typeIndicator, { backgroundColor: typeColor }]} />
                <Text style={styles.title}>Edit Task</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={24} color="#6b5b7f" />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View style={styles.section}>
                <TitleInput value={editedTitle} onChange={setEditedTitle} />
                <NoteInput value = {editiedNotes} onChange={setEditedNotes} />
                {task.type === "related" ? (
                    <RelatedTaskInput
                      tasks={tasks}
                      selectedTaskId={editedParentId || task.parent_task_id || ""}
                      onSelect={setEditedParentId}
                      />
                ) : null}
                {task.type === "basic" || task.type === "related" || task.is_template === false ? (
                  <>
                    <Text style={styles.label}>Due Date</Text>
                    <Calendar
                      onDayPress={handleDateSelect}
                      markedDates={{
                        [getDateString(editedDate)]: {
                          selected: true,
                          selectedColor: "#b8a4d9",
                        }
                      }}
                      minDate={toLocalDateString(new Date())}
                      theme={{
                        todayTextColor: "#a8d8ea",
                        arrowColor: "#a8d8ea",
                      }}
                      style={styles.calendar}
                    />
                  </>
                ) : null}

              </View>
              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <View style={styles.leftButtons}>
                  <TouchableOpacity
                    onPress={handleDelete}
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
                    <CheckCircle2 size={16} color={task.completed ? "#ffffff" : "#b4e7ce"} />
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
    fontSize: 14,
    fontWeight: "600",
    color: "#6b5b7f",
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
    gap: 12,
  },
  rightButtons: {
    flexDirection: "row",
    gap: 12,
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
    gap: 6,
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
    borderColor: "#b4e7ce",
    backgroundColor: "#ffffff",
  },
  completeButtonActive: {
    backgroundColor: "#74f2ab",
  },
  completeText: {
    color: "#4a9d7a",
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
  },
  parentTaskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    padding: 10,
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
