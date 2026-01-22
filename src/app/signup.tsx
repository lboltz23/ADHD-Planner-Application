// src/app/CalendarView.tsx
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../contexts/AppContext';

export default function CalendarViewScreen() {
  const router = useRouter();
  const { tasks, settings, addTask, toggleTask, rescheduleTask } = useApp();
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("")


  function validEmail(str: string): boolean {
    const regex = /[@]/; // \d matches any digit (0-9)
    return regex.test(str);
  }

  function hasNumber(str: string): boolean {
    const regex = /\d/; // \d matches any digit (0-9)
    return regex.test(str);
  }

  function hasLetter(str: string): boolean {
    const regex = /[a-zA-Z]/; 
    return regex.test(str);
  }

  function hasSpecialChars(str: string): boolean {
  const specialCharsRegex = /[^a-zA-Z0-9_\s]+/;
  
  // The test() method returns true if the pattern is found, otherwise false.
  return specialCharsRegex.test(str);
}


  return (
    <View style={[,styles.container,{paddingTop:insets.top,backgroundColor:'#b8a4d9'}]}>
      <View style={[styles.container,{padding:16}]}>
        <View style={styles.headerRight}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.push('/login')}>
              <ArrowLeft size={20} color="#6b5b7f" />
            </TouchableOpacity>
        </View>
        <View style={[{alignItems:"center",justifyContent:'center'},styles.container]}>
          <View style={styles.section}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Sign Up</Text>
            </View>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabelText,{paddingRight:2}]}>Username:</Text>
              <TextInput 
              style={{borderColor: '#e5d9f2',borderWidth:1,width:"80%",borderRadius:5,paddingHorizontal:2}}
              value={username}
              onChangeText={setUsername}
              />
            </View>
            <View style = {{alignItems:'flex-start'}}>
              {username.length < 3 && <Text style = {{color:"red"}}>Username Must At Least Be 3 Characters</Text>}

            </View>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabelText,{paddingRight:2}]}>Email:</Text>
              <TextInput 
              style={{borderColor: '#e5d9f2',borderWidth:1,width:"80%",borderRadius:5,paddingHorizontal:2}}
              value={email}
              onChangeText={setEmail}
              />
            </View>
            <View style = {{alignItems:'flex-start'}}>
              {!validEmail(email) && <Text style = {{color:"red"}}>Invalid Email</Text>}

            </View>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabelText,{paddingRight:2}]}>Password:</Text>
              <TextInput style={{borderColor: '#e5d9f2',borderWidth:1,width:"80%",borderRadius:5,paddingHorizontal:2}}
              value={password}
              onChangeText={setPassword}/>
            </View>
            <View style = {{alignItems:'flex-start'}}>
              {!hasNumber(password) && <Text style = {{color:"red"}}>Needs At Least 1 Number</Text>}
              {!hasLetter(password) && <Text style = {{color:"red"}}>Needs At Least 1 Letter</Text>}
              {!hasSpecialChars(password) && <Text style = {{color:"red"}}>Needs At Least 1 Special Character</Text>}
              { password.length < 8 && <Text style = {{color:"red"}}>Password Needs To Be At Least 8 Characters</Text>}

            </View>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabelText,{paddingRight:2}]}>Confirm Password:</Text>
              <TextInput style={{borderColor: '#e5d9f2',borderWidth:1,width:"80%",borderRadius:5,paddingHorizontal:2}}
              value={confirmPassword}
              onChangeText={setConfirmPassword}/>
            </View>
            <View style = {{alignItems:'flex-start'}}>
              {password !== confirmPassword && <Text style = {{color:"red"}}>Passwords Are Not The Same</Text>}

            </View>
            <View style={[{alignItems:"center",justifyContent:'center'}]}>
              <TouchableOpacity
                style={styles.mainButton}
                onPress={() => router.push('/login')}>
                <Text style={styles.mainButtonText}>Sign Up</Text>
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