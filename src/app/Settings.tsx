// src/app/Settings.tsx
import React , {useCallback,useState} from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter,useFocusEffect } from 'expo-router';
import { Settings as SettingsComponent } from '../components/Settings';
import { useApp } from '../contexts/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useSafeBack } from '../hooks/use-Safe-Back';
import { useAppTheme } from '../hooks/use-app-theme';


export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings } = useApp();
  const [user, setUser] = useState<User | null>(null)

    useFocusEffect(
        useCallback(() => {
          supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user)
          })
  
          supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
          })
        }, [])
      )
  const handleBack = useSafeBack();
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SettingsComponent
        onNavigateBack={handleBack}
        settings={settings}
        onUpdateSettings={updateSettings}
        user={user}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
