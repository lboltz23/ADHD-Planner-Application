import React, { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView, TextInput } from "react-native";
import { X, Trash2, CheckCircle2, Link as LinkIcon } from "lucide-react-native";
import { Calendar } from "react-native-calendars";
import { Task, toLocalDateString, Weekday } from "../types";
import { getTaskTypeColor, getEnhancedTaskTypeColor } from "./taskColors";
import TitleInput from "./TitleInput";
import NoteInput from "./NoteInput";
import { confirm } from "./Confirmation";
import RelatedTaskInput from "./RelatedTask";
import DateRangePicker from "./DateRangePicker";
import TimePicker from "./TimeInput";

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

export interface EditTaskProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  tasks: Task[]; // Pass all tasks for related task selection
  onSave: (id: string, fields: { title?: string; time?:Date; due_date?: Date; notes?: string; parent_id?: string; start_date?: Date; end_date?: Date; recurrence_interval?: number; days_selected?: Weekday[] }) => void;
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
  const [editedTime, setEditedTime] = useState(task.time);
  const [editedStartDate, setEditedStartDate] = useState(task.start_date);
  const [editedEndDate, setEditedEndDate] = useState(task.end_date);
  const [editedInterval, setEditedInterval] = useState(task.recurrence_interval);
  const [editedParentId, setEditedParentId] = useState(task.parent_task_id);
  const [editedNotes, setEditedNotes] = useState(task.notes || "");
  const [editedDaysSelected, setEditedDaysSelected] = useState<Weekday[]>(task.days_selected || []);

  // Reset state when modal opens to reflect latest task values
  useEffect(() => {
    if (isOpen) {
      setEditedTitle(task.title);
      setEditedDate(task.due_date);
      setEditedTime(task.time);
      setEditedStartDate(task.start_date);
      setEditedEndDate(task.end_date);
      setEditedInterval(task.recurrence_interval);
      setEditedParentId(task.parent_task_id);
      setEditedNotes(task.notes || "");
      setEditedDaysSelected(task.days_selected || []);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (editedTitle.trim()) {
      const fields: Parameters<typeof onSave>[1] = {
        title: editedTitle.trim(),
        due_date: editedDate,
        notes: editedNotes,
        time: editedTime
      };

      if (task.type === "related") {
        fields.parent_id = editedParentId;
      }

      if (task.is_template) {
        fields.start_date = editedStartDate;
        fields.end_date = editedEndDate;
        if (task.type === "routine") {
          fields.days_selected = editedDaysSelected;
        }
        if (task.type === "long_interval") {
          fields.recurrence_interval = editedInterval;
        }
      }

      onSave(task.id, fields);
      onClose();
    }
  };

  const toggleDay = (day: Weekday) => {
      setEditedDaysSelected((prev) =>
        prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
      );
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
                <NoteInput value = {editedNotes} onChange={setEditedNotes} />
                <TimePicker time = {editedTime || new Date()} onTimeChange={setEditedTime}/>
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
                {task.type === "routine" && task.is_template === true ? (
                  <>
                    <DateRangePicker
                      startDate={editedStartDate || new Date()}
                      endDate={editedEndDate || new Date()}
                      onStartDateChange={setEditedStartDate}
                      onEndDateChange={setEditedEndDate}
                    />

                   <Text style={styles.label}>Repeat On (select days) *</Text>
                   <View style={styles.frequencyRow}>
                    {ALL_WEEKDAYS.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.frequencyButton,
                        editedDaysSelected.includes(day) && styles.frequencyButtonActive,
                      ]}
                      onPress={() => toggleDay(day)}
                    >
                      <Text
                        style={[
                          styles.frequencyText,
                          editedDaysSelected.includes(day) && styles.frequencyTextActive,
                        ]}
                      >
                        {WEEKDAY_ABBREVIATIONS[day]}
                      </Text>
                    </TouchableOpacity>
                    ))}
                  </View>
                </>
                ): null}
                {task.type === "long_interval" && task.is_template === true ? (
                  <>
                  <DateRangePicker
                    startDate={editedStartDate || new Date()}
                    endDate={editedEndDate || new Date()}
                    onStartDateChange={setEditedStartDate}
                    onEndDateChange={setEditedEndDate}
                  />

                <View style={styles.inputRow}>
                  <Text style={styles.label}>Interval (months):</Text>
                  <TextInput
                    style={styles.dateInput}
                    value={editedInterval ? String(editedInterval) : ""}
                    onChangeText={(text) => setEditedInterval(text ? parseInt(text, 10) || undefined : undefined)}
                    placeholder="e.g., 3"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </View>
                </>
                ) : null}
                  
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
    borderWidth: 3,
    borderRadius: 8,
    borderColor: "#e5d9f2",
    padding: 12,
  },
  label: {
    fontSize: 16,
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
});
