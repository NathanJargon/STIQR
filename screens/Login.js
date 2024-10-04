import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Alert, Dimensions, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from './FirebaseConfig';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [domain, setDomain] = useState('');
  const navigation = useNavigation();

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
            navigation.navigate('TeacherHome');
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
      <Text style={styles.header}>STIQR</Text>
      <Text style={styles.description}>An STI QR system</Text>
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
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Button mode="contained" onPress={handleLogin} style={styles.loginButton}>
              Login
            </Button>
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
    top: height * 0.2,
  },
  description: {
    fontSize: width * 0.04,
    marginBottom: height * 0.03,
    position: 'absolute',
    top: height * 0.27,
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
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: height * 0.02,
  },
  backButtonText: {
    fontSize: width * 0.04,
    color: '#007BFF',
  },
});