// src/app/CalendarView.tsx
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View,TouchableWithoutFeedback,Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../contexts/AppContext';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabaseClient';
import { DotLoader } from '../components/DotLoader';

export default function CalendarViewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");


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

const ValidSignUp = () => {
  if (
    username.length < 3 ||
    username.length > 20 ||
    !username ||
    !validEmail(email) ||
    !email ||
    !hasNumber(password) ||
    !hasLetter(password) ||
    !hasSpecialChars(password) ||
    password.length < 8 ||
    password !== confirmPassword
  ) {
    return false;
  }

  return true;
};

 async function signUpWithEmail() {
    setLoading(true)
    if (!ValidSignUp()){ 
      Alert.alert("Invalid Sign Up Credentials")
    } else {
      const {
        data: { session },
        error,
      } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            display_name:username
          }
        }
      })
      if (error) {
        Alert.alert(error.message);
        console.log(error)
        setLoading(false);
        return;
      }

      if (!session) {
        Alert.alert("Please check your inbox for email verification! Don't forget to check your spam folder. If an account already has that email try logging in.");
        router.back();
      }
    }
    setLoading(false)
    router.replace("/login")
  }
  
// Supabase having issues signing up new user
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={[,styles.container,{paddingTop:insets.top,backgroundColor:'#b8a4d9',width:"100%",justifyContent:'center'}]}>
      <View style={[styles.container,{padding:16}]}>
        <View style={styles.headerRight}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={20} color="#6b5b7f" />
            </TouchableOpacity>
        </View>
         <View style={[{justifyContent:'center',width:"100%"},styles.container]}>
          <View style={[styles.section]}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Welcome To PlanAble!</Text>
            </View>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Sign Up</Text>
            </View>
            {!loading ?
            <View>
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabelText,{paddingRight:2}]}>Username:</Text>
                <TextInput 
                style={styles.settingsTextBox}
                value={username}
                onChangeText={setUsername}
                />
              </View>
              <View style = {{alignItems:'flex-start'}}>
                {username.length < 3 && username!="" && username.length > 20 && <Text style = {{color:"red"}}>
                  Must Be At Least 3 Characters And No Greater Than 20 Characters</Text>}

              </View>
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabelText,{paddingRight:2}]}>Email:</Text>
                <TextInput 
                style={styles.settingsTextBox}
                value={email}
                onChangeText={setEmail}
                />
              </View>
              <View style = {{alignItems:'flex-start'}}>
                {!validEmail(email) && email !="" && <Text style = {{color:"red"}}>Invalid Email</Text>}

              </View>
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabelText,{paddingRight:2}]}>Password:</Text>
                <TextInput style={styles.settingsTextBox}
                value={password}
                secureTextEntry={true}
                onChangeText={setPassword}/>
              </View>
              <View style = {{alignItems:'flex-start'}}>
                {!hasNumber(password) && password !="" &&<Text style = {{color:"red"}}>Needs At Least 1 Number</Text>}
                {!hasLetter(password) && password !="" &&<Text style = {{color:"red"}}>Needs At Least 1 Letter</Text>}
                {!hasSpecialChars(password) && password !="" &&<Text style = {{color:"red"}}>Needs At Least 1 Special Character</Text>}
                { password.length < 8 && password !="" &&<Text style = {{color:"red"}}>Password Needs To Be At Least 8 Characters</Text>}

              </View>
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabelText,{paddingRight:2}]}>Confirm Password:</Text>
                <TextInput style={styles.settingsTextBox}
                value={confirmPassword}
                secureTextEntry={true}
                onChangeText={setConfirmPassword}/>
              </View>
              <View style = {{alignItems:'flex-start'}}>
                {password !== confirmPassword && confirmPassword !="" &&<Text style = {{color:"red"}}>Passwords Are Not The Same</Text>}

              </View>
              <View style={[{alignItems:"center",justifyContent:'center'}]}>
                <TouchableOpacity
                  style={styles.mainButton}
                  onPress={() => signUpWithEmail()}>
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
            :
            <View style = {{flexDirection:'row',justifyContent:'center',alignContent:'center'}}>
              <Text style={[styles.settingLabelText,{paddingRight:2}]}>Loading.</Text><DotLoader/>
            </View>}
          </View>
        </View>
      </View>
    </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  settingsTextBox:{
      borderColor: '#e5d9f2',
      borderWidth:1,
      maxWidth:"90%",
      borderRadius:5,
      paddingHorizontal:2,
      paddingVertical:5,
      flex:1
    },
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