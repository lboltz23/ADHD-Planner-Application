import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Clock,
  Palette,
  Bell,
  Layout,
  Eye,
} from 'lucide-react-native';
import Slider  from '@react-native-community/slider';
import { AppThemeColors, resolveThemePreference, ThemeColors } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';

export interface SettingsData {
  defaultTimerMinutes: number;
  soundEnabled: boolean;
  confettiEnabled: boolean;
  theme: "auto" | "light" | "dark";
  defaultTaskView: "all" | "routine" | "basic" | "related" | "long_interval" ;
  colorBlindMode: boolean;
}

interface SettingsProps {
  onNavigateBack: () => void;
  settings: SettingsData;
  onUpdateSettings: (settings: SettingsData) => void;
}

interface SettingsSectionProps {
  icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
  iconColor: string;
  themeColors: ThemeColors;
  children: React.ReactNode;
}

function SettingsSection({
  icon: Icon,
  title,
  subtitle,
  iconColor,
  themeColors,
  children,
}: SettingsSectionProps) {
  const styles = StyleSheet.create({
    section: {
      backgroundColor: themeColors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: iconColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: themeColors.heading,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 13,
      color: themeColors.textMuted,
    },
  });

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon size={20} color="#fff" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

export function Settings({
  onNavigateBack,
  settings,
  onUpdateSettings,
}: SettingsProps) {
  const systemScheme = useColorScheme();
  const resolvedTheme = resolveThemePreference(settings.theme, systemScheme);
  const colors = AppThemeColors[resolvedTheme];

  const updateSetting = <K extends keyof SettingsData>(
    key: K,
    value: SettingsData[K]
  ) => {
    onUpdateSettings({
      ...settings,
      [key]: value,
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 24,
    },
    backButton: {
      padding: 8,
      marginLeft: -8,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.heading,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    },
    settingLabel: {
      flex: 1,
    },
    settingLabelText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 4,
    },
    settingSubtext: {
      fontSize: 12,
      color: colors.textMuted,
    },
    valueText: {
      fontSize: 13,
      color: colors.accent,
      fontWeight: '500',
    },
    sliderContainer: {
      marginVertical: 12,
    },
    sliderMarkers: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
      paddingHorizontal: 4,
    },
    sliderMarkerText: {
      fontSize: 11,
      color: colors.textMuted,
    },
    selectOptions: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      overflow: 'hidden',
      marginTop: 8,
    },
    selectOption: {
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    selectOptionText: {
      fontSize: 14,
      color: colors.text,
    },
    aboutSection: {
      alignItems: 'center',
      marginTop: 24,
      paddingVertical: 16,
    },
    aboutText: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });

  const themeOptions: SettingsData['theme'][] = ['auto', 'light', 'dark'];
  const viewOptions: SettingsData['defaultTaskView'][] = [
    'all',
    'routine',
    'basic',
    'related',
    'long_interval',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
            <ArrowLeft size={20} color={colors.heading} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Timer Settings */}
        <SettingsSection
          icon={Clock}
          title="Timer Settings"
          subtitle="Configure One Thing Mode timer"
          iconColor="#b8a4d9"
          themeColors={colors}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <Text style={styles.settingLabelText}>Default Timer Duration</Text>
            </View>
            <Text style={styles.valueText}>{settings.defaultTimerMinutes} min</Text>
          </View>

          <View style={styles.sliderContainer}>
            <Slider
              style={{ height: 40 }}
              minimumValue={5}
              maximumValue={60}
              step={5}
              value={settings.defaultTimerMinutes}
              onValueChange={(value) =>
                updateSetting('defaultTimerMinutes', value)
              }
              minimumTrackTintColor="#b8a4d9"
              maximumTrackTintColor={colors.border}
              thumbTintColor="#b8a4d9"
            />
            <View style={styles.sliderMarkers}>
              <Text style={styles.sliderMarkerText}>5 min</Text>
              <Text style={styles.sliderMarkerText}>30 min</Text>
              <Text style={styles.sliderMarkerText}>60 min</Text>
            </View>
          </View>
        </SettingsSection>

        {/* Appearance Settings */}
        <SettingsSection
          icon={Palette}
          title="Appearance"
          subtitle="Customize the look and feel"
          iconColor="#a8d8ea"
          themeColors={colors}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <Text style={styles.settingLabelText}>Theme</Text>
              <Text style={styles.settingSubtext}>Choose your preferred theme</Text>
            </View>
          </View>

          <View style={styles.selectOptions}>
            {themeOptions.map((option, index) => (
              <TouchableOpacity
                key={option}
                onPress={() => updateSetting('theme', option)}
                style={[
                  styles.selectOption,
                  index === themeOptions.length - 1 && {
                    borderBottomWidth: 0,
                  },
                  settings.theme === option && {
                    backgroundColor: colors.surfaceMuted,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.selectOptionText,
                    settings.theme === option && {
                      fontWeight: '600',
                      color: colors.accent,
                    },
                  ]}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.settingRow, { marginTop: 16 }]}>
            <View style={styles.settingLabel}>
              <Text style={styles.settingLabelText}>Confetti Animations</Text>
              <Text style={styles.settingSubtext}>
                Show confetti on task completion
              </Text>
            </View>
            <Switch
              value={settings.confettiEnabled}
              onValueChange={(checked) =>
                updateSetting('confettiEnabled', checked)
              }
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#fff"
            />
          </View>
        </SettingsSection>

        {/* Accessibility Settings */}
        <SettingsSection
          icon={Eye}
          title="Accessibility"
          subtitle="Make the app more accessible"
          iconColor="#b8a4d9"
          themeColors={colors}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <Text style={styles.settingLabelText}>Color Blind Mode</Text>
              <Text style={styles.settingSubtext}>
                Use high-contrast, accessible colors with enhanced icons
              </Text>
            </View>
            <Switch
              value={settings.colorBlindMode}
              onValueChange={(checked) =>
                updateSetting('colorBlindMode', checked)
              }
              trackColor={{ false: colors.border, true: '#0077bb' }}
              thumbColor="#fff"
            />
          </View>
        </SettingsSection>

        {/* Notifications Settings */}
        <SettingsSection
          icon={Bell}
          title="Notifications"
          subtitle="Manage notification preferences"
          iconColor="#ffc9d4"
          themeColors={colors}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <Text style={styles.settingLabelText}>Sound Effects</Text>
              <Text style={styles.settingSubtext}>
                Play sounds for timer and completions
              </Text>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(checked) =>
                updateSetting('soundEnabled', checked)
              }
              trackColor={{ false: colors.border, true: '#ffc9d4' }}
              thumbColor="#fff"
            />
          </View>
        </SettingsSection>

        {/* Task View Settings */}
        <SettingsSection
          icon={Layout}
          title="Task View"
          subtitle="Default task filter on dashboard"
          iconColor="#ffd89b"
          themeColors={colors}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <Text style={styles.settingLabelText}>Default Task Filter</Text>
              <Text style={styles.settingSubtext}>
                Show specific task types by default
              </Text>
            </View>
          </View>

          <View style={styles.selectOptions}>
            {viewOptions.map((option, index) => (
              <TouchableOpacity
                key={option}
                onPress={() => updateSetting('defaultTaskView', option)}
                style={[
                  styles.selectOption,
                  index === viewOptions.length - 1 && {
                    borderBottomWidth: 0,
                  },
                  settings.defaultTaskView === option && {
                    backgroundColor: colors.surfaceMuted,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.selectOptionText,
                    settings.defaultTaskView === option && {
                      fontWeight: '600',
                      color: '#ffd89b',
                    },
                  ]}
                >
                  {option
                    .split(/(?=[A-Z])/)
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SettingsSection>

        {/* About Section */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutText}>Planner App v1.0</Text>
          <Text style={[styles.aboutText, { marginTop: 4 }]}>
            A minimal, calming task management experience
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
