// src/app/Settings.tsx
import React , {useCallback,useState,useEffect} from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter,useFocusEffect } from 'expo-router';
import { Settings as SettingsComponent } from '../components/Settings';
import { useApp } from '../contexts/AppContext';
import { supabase, getProfile } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useSafeBack } from '../hooks/use-Safe-Back';
import { useAppTheme } from '../hooks/use-app-theme';


export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings } = useApp();
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState<string | null>(null)

      useEffect(() =>{
        supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
          })
      },[])
  const handleBack = useSafeBack();
  const { colors } = useAppTheme();

      useEffect(() =>{
        const GetUsername = async () =>{
          const username = await getProfile(user)
          setUsername(username)
        } 
        if(user){
          GetUsername();
        } else {
          setUsername(null);
        }
      },[user])

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SettingsComponent
        onNavigateBack={handleBack}
        settings={settings}
        onUpdateSettings={updateSettings}
        user={user}
        username={username}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
