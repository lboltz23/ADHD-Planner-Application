import React from "react";
import { View,
  Text,
  StyleSheet,
  ViewStyle, } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";


interface ProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export function ProgressCircle({ 
  percentage, 
  size = 120, 
  strokeWidth = 8,
  label = "Progress",
  sublabel
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;


const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      gap: 8,
    },
    circleContainer: {
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
    },
    centerText: {
      position: 'absolute',
      textAlign: 'center',
      fontSize: 16,
      fontWeight: '600',
      color: '#6b5b7f',
    },
    textContainer: {
      alignItems: 'center',
      gap: 4,
    },
    label: {
      fontSize: 14,
      color: '#999',
    },
    sublabel: {
      fontSize: 12,
      color: '#999',
      opacity: 0.7,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.circleContainer}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            <LinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#b8a4d9" />
              <Stop offset="50%" stopColor="#a8d8ea" />
              <Stop offset="100%" stopColor="#b4e7ce" />
            </LinearGradient>
          </Defs>

          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f0ebf7"
            strokeWidth={strokeWidth}
          />

          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </Svg>

        {/* Center text */}
        <Text style={styles.centerText}>{Math.round(percentage)}%</Text>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
      </View>
    </View>
  );
}