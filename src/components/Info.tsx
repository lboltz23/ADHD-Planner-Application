import React, { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { getTaskTypeColor } from "./taskColors";
import { Repeat, CheckSquare, Link as LinkIcon, Hourglass, X } from "lucide-react-native";
import { getAppColors } from "../constants/theme";

export interface EditTaskProps {
  isOpen: boolean;
  onClose: () => void;
  colorBlindMode?: boolean;
  isDarkMode?: boolean;
}

export default function EditTask({
  isOpen,
  onClose,
  colorBlindMode = false,
  isDarkMode = false,
}: EditTaskProps) {

  return (
    <>
      <Modal visible={isOpen} transparent animationType="fade">
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={[styles.dialog, { backgroundColor: getAppColors(colorBlindMode, isDarkMode).inputBackground }]}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: getAppColors(colorBlindMode, isDarkMode).primary }]}>What Are the Different Task Types?</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={24} color={getAppColors(colorBlindMode, isDarkMode).primary} />
                </TouchableOpacity>
              </View>

              {/* Basic */}
              <View style={[styles.section, { borderColor: getTaskTypeColor("basic", colorBlindMode) }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <CheckSquare size={18} color={getTaskTypeColor("basic", colorBlindMode)} />
                  <Text style={[styles.label, { color: getAppColors(colorBlindMode, isDarkMode).primary }]}>Basic</Text>
                </View>
                <Text style={[styles.description, { color: getAppColors(colorBlindMode, isDarkMode).primary }]}>A one-time task with a due date.</Text>
                <Text style={styles.example}>e.g. "Buy groceries on Friday"</Text>
              </View>

              {/* Routine */}
              <View style={[styles.section, { borderColor: getTaskTypeColor("routine", colorBlindMode) }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Repeat size={18} color={getTaskTypeColor("routine", colorBlindMode)} />
                  <Text style={[styles.label, { color: getAppColors(colorBlindMode, isDarkMode).primary }]}>Routine</Text>
                </View>
                <Text style={[styles.description, { color: getAppColors(colorBlindMode, isDarkMode).primary }]}>Repeats on selected weekdays within a date range.</Text>
                <Text style={styles.example}>e.g. "Go to gym every Mon / Wed / Fri"</Text>
              </View>

              {/* Long Interval */}
              <View style={[styles.section, { borderColor: getTaskTypeColor("long_interval", colorBlindMode) }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Hourglass size={18} color={getTaskTypeColor("long_interval", colorBlindMode)} />
                  <Text style={[styles.label, { color: getAppColors(colorBlindMode, isDarkMode).primary }]}>Long Interval</Text>
                </View>
                <Text style={[styles.description, { color: getAppColors(colorBlindMode, isDarkMode).primary }]}>Repeats at a monthly interval (e.g. every 3 months).</Text>
                <Text style={styles.example}>e.g. "Change air filter every 3 months"</Text>
              </View>

              {/* Related */}
              <View style={[styles.section, { borderColor: getTaskTypeColor("related", colorBlindMode) }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <LinkIcon size={18} color={getTaskTypeColor("related", colorBlindMode)} />
                  <Text style={[styles.label, { color: getAppColors(colorBlindMode, isDarkMode).primary }]}>Related</Text>
                </View>
                <Text style={[styles.description, { color: getAppColors(colorBlindMode, isDarkMode).primary }]}>A one-time task linked to a parent task, for breaking big tasks into smaller steps.</Text>
                <Text style={styles.example}>e.g. "Buy paint" linked to "Renovate bedroom"</Text>
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
  },
  description: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  example: {
    fontSize: 13,
    color: "#999",
    fontStyle: "italic",
  },
});
