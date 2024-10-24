import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, Alert, Dimensions, TouchableOpacity, Keyboard } from 'react-native';
import { Button } from 'react-native-paper';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { db } from './FirebaseConfig';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [domain, setDomain] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleLogin = async () => {
    if (!domain) {
      Alert.alert('Please choose a domain');
      return;
    }

    try {
      const collectionName = domain === 'teacher' ? 'teachers' : 'students';
      const docRef = doc(db, collectionName, email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.password === password) {
          if (domain === 'student') {
            navigation.navigate('StudentHome', { email });
          } else {
            navigation.navigate('TeacherHome', { email });
          }
        } else {
          Alert.alert('Invalid password');
        }
      } else {
        Alert.alert('No such user found');
      }
    } catch (error) {
      Alert.alert('Login failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.header, keyboardVisible && styles.hidden]}>STIQR</Text>
      <Text style={[styles.description, keyboardVisible && styles.hidden]}>An STI QR system</Text>
      <View style={styles.bottomContainer}>
        {!domain ? (
          <>
            <Text style={styles.domainText}>Choose your domain</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.domainButton, domain === 'student' && styles.selectedButton]}
                onPress={() => setDomain('student')}
              >
                <Text style={styles.buttonText}>Student</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.domainButton, domain === 'teacher' && styles.selectedButton]}
                onPress={() => setDomain('teacher')}
              >
                <Text style={styles.buttonText}>Teacher</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={() => setDomain('')} style={styles.backButton}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.domainText}>Login as a {domain}</Text>
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
            <Button mode="contained" onPress={handleLogin} style={styles.loginButton}>
              Login
            </Button>
            {domain === 'student' && (
              <TouchableOpacity onPress={() => navigation.navigate('StudentSignup')} style={styles.signUpButton}>
                <Text style={styles.signUpButtonText}>Don't have an account? Sign Up</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
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
    fontSize: width * 0.125,
    fontWeight: 'bold',
    marginBottom: height * 0.01,
    position: 'absolute',
    top: height * 0.1,
  },
  description: {
    fontSize: width * 0.04,
    marginBottom: height * 0.03,
    position: 'absolute',
    top: height * 0.16,
  },
  hidden: {
    opacity: 0,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: height * 0.1,
    width: '100%',
    alignItems: 'center',
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
  domainText: {
    fontSize: width * 0.05,
    marginVertical: height * 0.02,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: height * 0.02,
  },
  domainButton: {
    flex: 1,
    marginHorizontal: width * 0.01,
    padding: width * 0.03,
    backgroundColor: '#ddd',
    alignItems: 'center',
    borderRadius: 4,
  },
  selectedButton: {
    backgroundColor: '#aaa',
  },
  buttonText: {
    fontSize: width * 0.04,
  },
  loginButton: {
    width: '100%',
    padding: width * 0.03,
  },
  signUpButton: {
    marginTop: height * 0.02,
  },
  signUpButtonText: {
    fontSize: width * 0.04,
    color: '#007BFF',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: height * 0.02,
  },
  backButtonText: {
    fontSize: width * 0.04,
    color: '#007BFF',
  },
});