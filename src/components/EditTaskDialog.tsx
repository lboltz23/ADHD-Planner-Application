import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { X, Calendar as CalendarIcon, Trash2 } from "lucide-react-native";
import { Task } from "../types";
import { getTaskTypeColor } from "./taskColors";
import TitleInput from "./TitleInput";
import RescheduleDialog from "./RescheduleDialog";

interface EditTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onSave: (id: string, newTitle: string, newDate: Date) => void;
  onDelete: (id: string) => void;
  colorBlindMode?: boolean;
}

export default function EditTaskDialog({
  isOpen,
  onClose,
  task,
  onSave,
  onDelete,
  colorBlindMode = false,
}: EditTaskDialogProps) {
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDate, setEditedDate] = useState(task.date);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);

  const handleSave = () => {
    if (editedTitle.trim()) {
      onSave(task.id, editedTitle.trim(), editedDate);
      onClose();
    }
  };

  const handleDelete = () => {
    onDelete(task.id);
    onClose();
  };

  const handleReschedule = (newDateString: string) => {
    const [year, month, day] = newDateString.split('-').map(Number);
    const newDate = new Date(year, month - 1, day);
    setEditedDate(newDate);
    setShowRescheduleDialog(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
                <Text style={styles.label}>Task Title</Text>
                <TitleInput value={editedTitle} onChange={setEditedTitle} />

                <Text style={styles.label}>Due Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowRescheduleDialog(true)}
                >
                  <CalendarIcon size={18} color="#6b5b7f" />
                  <Text style={styles.dateText}>{formatDate(editedDate)}</Text>
                </TouchableOpacity>

                {task.notes && (
                  <>
                    <Text style={styles.label}>Notes</Text>
                    <Text style={styles.notesText}>{task.notes}</Text>
                  </>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  onPress={handleDelete}
                  style={[styles.button, styles.deleteButton]}
                >
                  <Trash2 size={16} color="#ffffff" />
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>

                <View style={styles.rightButtons}>
                  <TouchableOpacity
                    onPress={onClose}
                    style={[styles.button, styles.cancelButton]}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSave}
                    style={[styles.button, styles.saveButton, { backgroundColor: typeColor }]}
                  >
                    <Text style={styles.saveText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Reschedule Dialog */}
      <RescheduleDialog
        isOpen={showRescheduleDialog}
        onClose={() => setShowRescheduleDialog(false)}
        onReschedule={handleReschedule}
        taskTitle={editedTitle}
        currentDate={editedDate}
      />
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
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f6fb",
    borderWidth: 1,
    borderColor: "#e5d9f2",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: "#6b5b7f",
    fontWeight: "500",
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
    justifyContent: "space-between",
    gap: 12,
    marginTop: 8,
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
    backgroundColor: "#ff4444",
  },
  deleteText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
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
  saveButton: {
    // backgroundColor set dynamically
  },
  saveText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});
