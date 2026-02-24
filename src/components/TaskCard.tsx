import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  Repeat,
  CheckSquare,
  Link as LinkIcon,
  CheckCircle2,
  Hourglass,
} from "lucide-react-native";
import { Task, Weekday } from "../types";
import { getTaskTypeColor } from "./taskColors";
import EditTask from "./EditTask";

interface TaskCardProps {
  task: Task;
  tasks?: Task[];
  onToggle: (id: string) => void;
  onUpdate: (id: string, fields: { title?: string; due_date?: Date; notes?: string; parent_id?: string; start_date?: Date; end_date?: Date; recurrence_interval?: number; days_selected?: Weekday[] }) => void;
  onDelete: (id: string) => void;
  showDate?: boolean;
  colorBlindMode?: boolean;
}

interface TaskStyle {
  gradient: string;
  borderColor: string;
  iconColor: string;
  completedColor: string;
  Icon: React.ComponentType<any>;
  backgroundColor: string;
}

export function TaskCard({
  task,
  tasks = [],
  onToggle,
  onUpdate,
  onDelete,
  showDate,
  colorBlindMode = false,
}: TaskCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);

  const getTaskStyle = (type: Task["type"]): TaskStyle => {
    const taskColor = getTaskTypeColor(type, colorBlindMode);
    const iconMap = {
      routine: Repeat,
      basic: CheckSquare,
      related: LinkIcon,
      long_interval: Hourglass,
    };

    if (colorBlindMode) {
      return {
        gradient: "#ffffff",
        borderColor: taskColor,
        iconColor: taskColor,
        completedColor: taskColor,
        backgroundColor: "#f5f5f5",
        Icon: iconMap[type],
      };
    }

    switch (type) {
      case "routine":
        return {
          gradient: "#faf8fc",
          borderColor: "#b8a4d9",
          iconColor: "#b8a4d9",
          completedColor: "#d4c5e8",
          backgroundColor: "#ffffff",
          Icon: Repeat,
        };
      case "basic":
        return {
          gradient: "#f9fcff",
          borderColor: "#a8d8ea",
          iconColor: "#a8d8ea",
          completedColor: "#b8dde9",
          backgroundColor: "#ffffff",
          Icon: CheckSquare,
        };
      case "related":
        return {
          gradient: "#fef9fc",
          borderColor: "#ffc9d4",
          iconColor: "#ffc9d4",
          completedColor: "#ffd9e1",
          backgroundColor: "#ffffff",
          Icon: LinkIcon,
        };
      case "long_interval":
        return {
          gradient: "#fff0fbff",
          borderColor: "#f5a4e0ff",
          iconColor: "#f5a4e0ff",
          completedColor: "#f1cfe8ff",
          backgroundColor: "#ffffff",
          Icon: Hourglass,
        };
    }
  };

  const style = getTaskStyle(task.type);
  const IconComponent = style.Icon;

  const formatDate = (date: string | Date) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.card,
          {
            justifyContent: showDate ? "space-between" : "flex-start",
            backgroundColor: style.backgroundColor,
            borderWidth: colorBlindMode ? 2 : 1,
            borderColor: style.borderColor,
          },
        ]}
        onPress={() => setShowEditDialog(true)}
        activeOpacity={0.7}
      >
        <View style={styles.contentContainer}>
          <View style={[
            styles.iconContainer,
            {
              backgroundColor: colorBlindMode ? `${style.iconColor}20` : style.borderColor,
              borderWidth: colorBlindMode ? 2 : 0,
              borderColor: style.iconColor,
            },
          ]}>
            <IconComponent
              size={colorBlindMode ? 18 : 16}
              color={colorBlindMode ? style.iconColor : "#ffffff"}
              opacity={task.completed ? 0.5 : 1}
              strokeWidth={colorBlindMode ? 2.5 : 2}
            />
          </View>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onToggle(task.id);
            }}
            activeOpacity={0.7}
          >
            <CheckCircle2
              size={20}
              color={task.completed ? "#b4e7ce" : "#e5d9f2"}
            />
          </TouchableOpacity>

          <Text style={[
            styles.taskTitle,
            {
              color: task.completed ? "#999" : "#333",
              textDecorationLine: task.completed ? "line-through" : "none",
            },
          ]}>{task.title}</Text>
        </View>

        {showDate && <Text style={styles.dateText}>{formatDate(task.due_date)}</Text>}
      </TouchableOpacity>

      {/* Edit Task Dialog */}
      <EditTask
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        task={task}
        tasks={tasks}
        onSave={onUpdate}
        onDelete={onDelete}
        onToggle={onToggle}
        colorBlindMode={colorBlindMode}
      />
    </>
  );
}

const styles = StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderRadius: 12,
      marginVertical: 6,
    },
    contentContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    checkCircle: {
      width: 20,
      height: 20,
    },
    taskTitle: {
      flex: 1,
      fontSize: 16,
    },
    dateText: {
      fontSize: 14,
      color: "#999",
    },
  });
