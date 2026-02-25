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
import { useAppTheme } from "../hooks/use-app-theme";

interface TaskCardProps {
  task: Task;
  tasks?: Task[];
  onToggle: (id: string) => void;
  onUpdate: (id: string, fields: { title?: string; due_date?: Date; notes?: string; parent_id?: string; start_date?: Date; end_date?: Date; recurrence_interval?: number; days_selected?: Weekday[] }) => void;
  onDelete: (id: string) => void;
  showDate?: boolean;
  colorBlindMode?: boolean;
  isDarkMode?: boolean;
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
  isDarkMode = false,
}: TaskCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { colors, isDark } = useAppTheme();

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
        gradient: isDark ? "#1f273a" : "#ffffff",
        borderColor: taskColor,
        iconColor: taskColor,
        completedColor: taskColor,
        backgroundColor: isDark ? "#1f273a" : "#f5f5f5",
        Icon: iconMap[type],
      };
    }

    switch (type) {
      case "routine":
        return {
          gradient: isDark ? "#232a3d" : "#faf8fc",
          borderColor: isDark ? "#8e77bf" : "#b8a4d9",
          iconColor: isDark ? "#8e77bf" : "#b8a4d9",
          completedColor: "#d4c5e8",
          backgroundColor: isDark ? "#1b2133" : "#ffffff",
          Icon: Repeat,
        };
      case "basic":
        return {
          gradient: isDark ? "#1d2a3a" : "#f9fcff",
          borderColor: isDark ? "#6ea6c2" : "#a8d8ea",
          iconColor: isDark ? "#6ea6c2" : "#a8d8ea",
          completedColor: "#b8dde9",
          backgroundColor: isDark ? "#1b2133" : "#ffffff",
          Icon: CheckSquare,
        };
      case "related":
        return {
          gradient: isDark ? "#2a2235" : "#fef9fc",
          borderColor: isDark ? "#d58aa5" : "#ffc9d4",
          iconColor: isDark ? "#d58aa5" : "#ffc9d4",
          completedColor: "#ffd9e1",
          backgroundColor: isDark ? "#1b2133" : "#ffffff",
          Icon: LinkIcon,
        };
      case "long_interval":
        return {
          gradient: isDark ? "#2c2231" : "#fff0fbff",
          borderColor: isDark ? "#c784b6" : "#f5a4e0ff",
          iconColor: isDark ? "#c784b6" : "#f5a4e0ff",
          completedColor: "#f1cfe8ff",
          backgroundColor: isDark ? "#1b2133" : "#ffffff",
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
              color={task.completed ? (isDark ? "#6ed6a3" : "#b4e7ce") : colors.border}
            />
          </TouchableOpacity>

          <Text style={[
            styles.taskTitle,
            {
              color: task.completed ? colors.textMuted : colors.text,
              textDecorationLine: task.completed ? "line-through" : "none",
            },
          ]}>{task.title}</Text>
        </View>

        {showDate && <Text style={[styles.dateText, { color: colors.textMuted }]}>{formatDate(task.due_date)}</Text>}
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
        isDarkMode={isDark}
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
    },
  });
