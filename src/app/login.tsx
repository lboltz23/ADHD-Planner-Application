// Test Username : user@example.com
// Test Password : 123456

import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert,Keyboard} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../contexts/AppContext';
import { supabase,getCurrentUser } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js'
import { useFocusEffect } from 'expo-router';

export default function CalendarViewScreen() {
  const router = useRouter();
  const { tasks, settings, addTask, toggleTask, rescheduleTask } = useApp();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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


   async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })
    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  // Fix the same sizing problem we had on the sign up page
  return (
    <View style={[,styles.container,{paddingTop:insets.top,backgroundColor:'#b8a4d9'}]}>
      <View style={[styles.container,{padding:16}]}>
        <View style={styles.headerRight}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={20} color="#6b5b7f" />
            </TouchableOpacity>
        </View>
        <View style={[{alignItems:"center",justifyContent:'center'},styles.container]}>
          <View style={styles.section}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Login</Text>
            </View>
            {!loading ?
            <View>
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabelText,{paddingRight:2}]}>Email:</Text>
                <TextInput 
                style={{borderColor: '#e5d9f2',borderWidth:1,maxWidth:"90%",borderRadius:5,paddingHorizontal:2, flex:1}}
                value={email}
                onChangeText={setEmail}
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                }}
                />
              </View>
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabelText,{paddingRight:2}]}>Password:</Text>
                <TextInput style={{borderColor: '#e5d9f2',borderWidth:1,maxWidth:"80%",borderRadius:5,paddingHorizontal:2, flex:1}}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                }}/>
              </View>
              <View style={[styles.settingRow,{paddingTop:0}]}>
                <TouchableOpacity
                  onPress={() => router.push('/login')}>
                  <Text style={{color:'#b8a4d9'}}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
              <View style={[{alignItems:"center",justifyContent:'center'}]}>
                <TouchableOpacity
                  style={styles.mainButton}
                  onPress={() => signInWithEmail()}>
                  <Text style={styles.mainButtonText}>Login In</Text>
                </TouchableOpacity>
              </View>
              <View style={[{alignItems:"center",justifyContent:'center',borderTopWidth:1, borderColor:'#b8a4d9'}]}>
                <TouchableOpacity
                  style={styles.mainButton}
                  onPress={() => router.push('/login')}>
                  <Text style={styles.mainButtonText}>Use Apple</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.mainButton}
                  onPress={() => router.push('/login')}>
                  <Text style={styles.mainButtonText}>Use Android</Text>
                </TouchableOpacity>
              </View>
              <View style={[{alignItems:"center",justifyContent:'center',borderTopWidth:1, borderColor:'#b8a4d9'}]}>
                <View style={styles.settingRow}>
                  <Text style={[styles.settingLabelText,{paddingRight:2}]}>New User?</Text>
                  <TouchableOpacity
                    style={styles.mainButton}
                    onPress={() => router.push('/signup')}>
                    <Text style={styles.mainButtonText}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {user &&
              <View style={[{alignItems:"center",justifyContent:'center',borderTopWidth:1, borderColor:'#b8a4d9'}]}>
                <View style={styles.settingRow}>
                  <Text style={[styles.settingLabelText,{paddingRight:2}]}>{user.id}</Text>
                </View>
              </View>}
            </View>
            :
           <Text style={[styles.settingLabelText,{paddingRight:2}]}>Loading.....</Text>}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fafafa',
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
      color: '#6b5b7f',
    },
    headerRight: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
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
      color: '#333',
      marginBottom: 4,
    },
    settingSubtext: {
      fontSize: 12,
      color: '#999',
    },
    valueText: {
      fontSize: 13,
      color: '#b8a4d9',
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
      color: '#999',
    },
    selectOptions: {
      borderWidth: 1,
      borderColor: '#e5d9f2',
      borderRadius: 8,
      overflow: 'hidden',
      marginTop: 8,
    },
    selectOption: {
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#e5d9f2',
    },
    selectOptionText: {
      fontSize: 14,
      color: '#333',
    },
    aboutSection: {
      alignItems: 'center',
      marginTop: 24,
      paddingVertical: 16,
    },
    aboutText: {
      fontSize: 12,
      color: '#999',
      textAlign: 'center',
    },
    mainButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#b8a4d9',
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 8,
      gap: 6,
      margin:8
    },
    mainButtonText: {
      color: '#ffffff',
      fontWeight: '600',
      fontSize: 14,
    },
    section: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#e5d9f2',
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: '#6b5b7f',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 13,
      color: '#999',
    },
  });