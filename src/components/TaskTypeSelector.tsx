import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { Repeat, CheckSquare, Link as LinkIcon, Hourglass } from "lucide-react-native";
import { TaskType } from "../types";
import { getTaskTypeColor } from "./taskColors";
import { useAppTheme } from "../hooks/use-app-theme";

interface TaskTypeSelectorProps {
  selectedType: TaskType;
  onSelectType: (type: TaskType) => void;
  colorBlindMode?: boolean;
}

interface TypeOption {
  value: TaskType;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

export function TaskTypeSelector({
  selectedType,
  onSelectType,
  colorBlindMode = false,
}: TaskTypeSelectorProps) {
  const { isDark, colors } = useAppTheme();

  const getTypes = (): TypeOption[] => {
    if (colorBlindMode) {
      return [
        {
          value: "basic",
          label: "Basic",
          icon: CheckSquare,
          color: getTaskTypeColor("basic", true),
          bgColor: isDark ? colors.surface : "#f5f5f5",
        },
        {
          value: "routine",
          label: "Routine",
          icon: Repeat,
          color: getTaskTypeColor("routine", true),
          bgColor: isDark ? colors.surface : "#f5f5f5",
        },
        {
          value: "related",
          label: "Related",
          icon: LinkIcon,
          color: getTaskTypeColor("related", true),
          bgColor: isDark ? colors.surface : "#f5f5f5",
        },
        {          
          value: "long_interval",
          label: "Long-Interval",
          icon: Hourglass,
          color: getTaskTypeColor("long_interval", true),
          bgColor: isDark ? colors.surface : "#f5f5f5",
        }
      ];
    }

    return [
      {
        value: "basic",
        label: "Basic",
        icon: CheckSquare,
        color: "#a8d8ea",
        bgColor: isDark ? "#1f2e3d" : "#e5f0f3",
      },
      {
        value: "routine",
        label: "Routine",
        icon: Repeat,
        color: "#b8a4d9",
        bgColor: isDark ? "#2a2438" : "#f5f0fa",
      },
      {
        value: "related",
        label: "Related",
        icon: LinkIcon,
        color: "#ffc9d4",
        bgColor: isDark ? "#3a2931" : "#fff5f7",
      },
      {
        value: "long_interval",
        label: "Long-Interval",
        icon: Hourglass,
        color: "#f5a4e0ff",
        bgColor: isDark ? "#38273a" : "#f8edf5ff",
      },
    ];
  };

  const types = getTypes();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 8,
      borderWidth: 0,
      marginBottom: 8,
      minWidth: '48%',
    },
    buttonSelected: {
      borderWidth: 9,
      borderColor: '#020102',
    },
    buttonText: {
      fontSize: 14,
      fontWeight: '500',
    },
    buttonTextRegular: {
      fontSize: 14,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      {types.map((type) => {
        const Icon = type.icon;
        const isSelected = selectedType === type.value;

        return (
          <TouchableOpacity
            key={type.value}
            onPress={() => onSelectType(type.value)}
            style={[
              styles.button,
              {
                backgroundColor: isSelected ? (isDark ? colors.surfaceMuted : "#ffffffff") : type.bgColor,
                borderColor: isSelected ? type.color : 'transparent',
                borderWidth: isSelected ? 2 : 0,
              },
            ]}
            activeOpacity={0.8}
          >
            <Icon
              size={colorBlindMode ? 18 : 16}
              color={type.color}
              strokeWidth={colorBlindMode ? 2.5 : 2}
            />
            <Text
              style={[
                colorBlindMode ? styles.buttonText : styles.buttonTextRegular,
                { color: type.color },
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
