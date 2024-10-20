import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Alert, Dimensions, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { db } from '../FirebaseConfig';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

export default function StudentSignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  const handleSignUp = async () => {
    try {
      const docRef = doc(db, 'students', email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        Alert.alert('User already exists');
      } else {
        await setDoc(docRef, { email, password, name, tally: 0, classDates: [], section: "A0" });
        Alert.alert('Sign-up successful', 'You can now log in');
        navigation.navigate('Login');
      }
    } catch (error) {
      Alert.alert('Sign-up failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordButton}>
          <Icon name={showPassword ? 'visibility' : 'visibility-off'} size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <Button mode="contained" onPress={handleSignUp} style={styles.signUpButton}>
        Sign Up
      </Button>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: width * 0.05,
  },
  header: {
    fontSize: width * 0.1,
    fontWeight: 'bold',
    marginBottom: height * 0.03,
  },
  input: {
    width: '100%',
    padding: width * 0.03,
    marginVertical: height * 0.01,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginVertical: height * 0.01,
  },
  passwordInput: {
    flex: 1,
    padding: width * 0.03,
  },
  showPasswordButton: {
    padding: width * 0.03,
  },
  signUpButton: {
    width: '100%',
    padding: width * 0.03,
    marginTop: height * 0.02,
  },
  backButton: {
    marginTop: height * 0.02,
  },
  backButtonText: {
    fontSize: width * 0.04,
    color: '#007BFF',
  },
});