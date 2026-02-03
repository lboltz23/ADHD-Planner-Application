// src/app/Settings.tsx
import React , {useCallback,useState} from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter,useFocusEffect } from 'expo-router';
import { Settings as SettingsComponent } from '../components/Settings';
import { useApp } from '../contexts/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

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

  return (
    <View style={styles.container}>
      <SettingsComponent
        onNavigateBack={() => router.back()}
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
    backgroundColor: '#fff',
  },
});