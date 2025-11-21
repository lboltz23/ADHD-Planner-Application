import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Repeat, CheckSquare, Link as LinkIcon, Hourglass } from "lucide-react-native";
import { TaskType } from "../App";
import { getTaskTypeColor } from "./taskColors";

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
  const getTypes = (): TypeOption[] => {
    if (colorBlindMode) {
      return [
        {
          value: "routine",
          label: "Routine",
          icon: Repeat,
          color: getTaskTypeColor("routine", true),
          bgColor: "#f5f5f5",
        },
        {
          value: "basic",
          label: "Basic",
          icon: CheckSquare,
          color: getTaskTypeColor("basic", true),
          bgColor: "#f5f5f5",
        },
        {
          value: "related",
          label: "Related",
          icon: LinkIcon,
          color: getTaskTypeColor("related", true),
          bgColor: "#f5f5f5",
        },
        {          
          value: "long_interval",
          label: "Long-Interval",
          icon: Hourglass,
          color: getTaskTypeColor("long_interval", true),
          bgColor: "#f5f5f5",
        }
      ];
    }

    return [
      {
        value: "routine",
        label: "Routine",
        icon: Repeat,
        color: "#b8a4d9",
        bgColor: "#f5f0fa",
      },
      {
        value: "basic",
        label: "Basic",
        icon: CheckSquare,
        color: "#a8d8ea",
        bgColor: "#f0f8fb",
      },
      {
        value: "related",
        label: "Related",
        icon: LinkIcon,
        color: "#ffc9d4",
        bgColor: "#fff5f7",
      },
      {
        value: "long_interval",
        label: "Long-Interval",
        icon: Hourglass,
        color: "#f5a4e0ff",
        bgColor: "#f8edf5ff",
      },
    ];
  };

  const types = getTypes();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
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
    },
    buttonSelected: {
      borderWidth: 2,
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
                backgroundColor: isSelected ? "#ffffffff" : type.bgColor,
                borderColor: colorBlindMode && isSelected ? type.color : 'transparent',
                borderWidth: isSelected ? (colorBlindMode ? 2 : 0) : 0,
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