import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Repeat, CheckSquare, Link as LinkIcon, CheckCircle2 } from 'lucide-react-native';
import { Task } from "../App";
import { getTaskTypeColor } from "./taskColors";

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
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
  onToggle,
  showDate,
  colorBlindMode = false,
}: TaskCardProps) {
  const getTaskStyle = (type: Task["type"]): TaskStyle => {
    const taskColor = getTaskTypeColor(type, colorBlindMode);

    const iconMap = {
      routine: Repeat,
      basic: CheckSquare,
      related: LinkIcon,
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
    }
  };

  const style = getTaskStyle(task.type);
  const IconComponent = style.Icon;

  const styles = StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: showDate ? 'space-between' : 'flex-start',
      padding: 16,
      borderRadius: 12,
      backgroundColor: style.backgroundColor,
      borderWidth: colorBlindMode ? 2 : 1,
      borderColor: style.borderColor,
      marginVertical: 6,
    },
    contentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colorBlindMode ? `${style.iconColor}20` : style.borderColor,
      borderWidth: colorBlindMode ? 2 : 0,
      borderColor: style.iconColor,
    },
    checkCircle: {
      width: 20,
      height: 20,
    },
    taskTitle: {
      flex: 1,
      fontSize: 16,
      color: task.completed ? '#999' : '#333',
      textDecorationLine: task.completed ? 'line-through' : 'none',
    },
    dateText: {
      fontSize: 14,
      color: '#999',
    },
  });

  const formatDate = (date: string | Date) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onToggle(task.id)}
      activeOpacity={0.7}
    >
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <IconComponent
            size={colorBlindMode ? 18 : 16}
            color={style.iconColor}
            opacity={task.completed ? 0.5 : 1}
            strokeWidth={colorBlindMode ? 2.5 : 2}
          />
        </View>

        <CheckCircle2
          size={20}
          color={task.completed ? "#b4e7ce" : "#e5d9f2"}
        />

        <Text style={styles.taskTitle}>{task.title}</Text>
      </View>

      {showDate && (
        <Text style={styles.dateText}>{formatDate(task.date)}</Text>
      )}
    </TouchableOpacity>
  );
}