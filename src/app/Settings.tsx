// src/app/Settings.tsx
import React , {useCallback,useState,useEffect} from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter,useFocusEffect } from 'expo-router';
import { Settings as SettingsComponent } from '../components/Settings';
import { useApp } from '../contexts/AppContext';
import { supabase, getProfile } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings } = useApp();
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [loading,setLoading] = useState(false)

     useEffect(() => {
      const init = async () => {
        const { data } = await supabase.auth.getSession()
        setUser(data.session?.user ?? null)
      }

      setLoading(true);
      init()

      const { data: subscription } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user ?? null)
        }
      )

      setLoading(false);
      return () => {
        subscription.subscription.unsubscribe()
      }
    }, [])

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
    <View style={styles.container}>
      <SettingsComponent
        onNavigateBack={() => router.back()}
        settings={settings}
        onUpdateSettings={updateSettings}
        user={user}
        username={{username,loading}}
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