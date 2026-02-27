import React, { useEffect, useState } from "react";
import { Text } from "react-native";

export const DotLoader = () => {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? "." : prev + "."));
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return <Text style={{ fontSize: 24, color: "white" }}>{dots}</Text>;
};