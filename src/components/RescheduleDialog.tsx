import React, { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles } from "lucide-react-native";

interface RescheduleDialogProps {
  isOpen: boolean;
  // Only called when user selects a new date
  onClose: () => void;
  onReschedule: (newDate: string) => void;
  taskTitle: string;
  currentDate?: Date | string;
}

const encouragingMessages = [
  "Life happens! Let's find a better time for this.",
  "Great job being flexible! When works better?",
  "Smart move! Prioritizing is key to success.",
  "No worries! Let's reschedule for when you're ready.",
  "Taking care of yourself first? Perfect!",
  "Adaptability is a strength! Pick a new date.",
  "Being realistic is healthy! Choose a better time.",
  "You're doing great! Let's move this to when it fits.",
];

export default function RescheduleDialog({
  isOpen,
  onClose,
  onReschedule,
  taskTitle,
  currentDate,
}: RescheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [message] = useState(
    () => encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]
  );

  // Reset selected date when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate("");
    }
  }, [isOpen]);

  // Convert current date to YYYY-MM-DD format for marking (using local timezone)
  const getCurrentDateString = () => {
    if (!currentDate) return null;
    const date = typeof currentDate === 'string' ? new Date(currentDate) : new Date(currentDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const currentDateString = getCurrentDateString();

  // Get today's date in local timezone (not UTC) for minDate
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleReschedule = () => {
    if (selectedDate) {
      onReschedule(selectedDate);
      onClose();
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={["#ffd89b", "#ffc9d4"]}
              style={styles.iconContainer}
            >
              {/*Sparkles Icon */}
              <Sparkles color="white" size={18} />
            </LinearGradient>
            <Text style={styles.title}>Reschedule Task</Text>
          </View>

          <Text style={styles.message}>{message}</Text>

          {/* Task Info */}
          <View style={styles.taskBox}>
            <Text style={styles.taskLabel}>Task:</Text>
            <Text style={styles.taskTitle}>{taskTitle}</Text>
          </View>

          {/* Calendar */}
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{
              ...(currentDateString && !selectedDate
                ? {
                    [currentDateString]: {
                      marked: true,
                      dotColor: "#b8a4d9",
                    }
                  }
                : {}),
              ...(selectedDate
                ? {
                    [selectedDate]: {
                      selected: true,
                      selectedColor: "#b8a4d9",
                      marked: true,
                      dotColor: "white"
                    }
                  }
                : {})
            }}
            minDate={getTodayString()}
            theme={{
              todayTextColor: "#a8d8ea",
              arrowColor: "#a8d8ea",
            }}
            style={styles.calendar}
          />

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancel]}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleReschedule}
              style={[
                styles.button,
                selectedDate ? styles.rescheduleActive : styles.rescheduleDisabled,
              ]}
              disabled={!selectedDate}
            >
              <Text style={styles.rescheduleText}>Reschedule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dialog: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 360,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b5b7f",
  },
  message: {
    color: "#6b5b7f",
    fontSize: 14,
    marginBottom: 12,
  },
  taskBox: {
    backgroundColor: "#faf8fc",
    borderWidth: 1,
    borderColor: "#e5d9f2",
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  taskLabel: {
    color: "#a093c7",
    fontSize: 12,
  },
  taskTitle: {
    color: "#6b5b7f",
    fontWeight: "500",
  },
  calendar: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5d9f2",
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  cancel: {
    borderWidth: 1,
    borderColor: "#e5d9f2",
    backgroundColor: "#f8f6fb",
  },
  cancelText: {
    color: "#6b5b7f",
    fontWeight: "500",
  },
  rescheduleActive: {
    backgroundColor: "#b8a4d9",
  },
  rescheduleDisabled: {
    backgroundColor: "#d9d2ea",
  },
  rescheduleText: {
    color: "white",
    fontWeight: "600",
  },
});
