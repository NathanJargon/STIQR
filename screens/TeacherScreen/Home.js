import React, { useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { TextInput, Button, Text, Card, Title, Paragraph } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { db, auth } from '../FirebaseConfig';
import { signOut } from 'firebase/auth';

export default function TeacherHome({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [section, setSection] = useState('');
  const [qrValue, setQrValue] = useState('');

  const createStudent = async () => {
    if (email && password && name && section) {
      try {
        const today = new Date().toISOString().split('T')[0];
        await db.collection('students').doc(email).set({
          password,
          name,
          section,
          tally: 0,
          classDates: [],
          createdAt: today,
        });
        setQrValue(`${email}|${section}`);
        Alert.alert('Student created successfully!');
      } catch (error) {
        Alert.alert('Error creating student:', error.message);
      }
    } else {
      Alert.alert('Please fill in all fields');
    }
  };

  const generateQRCode = () => {
    const value = email ? `${email}|${section}` : `default-${Math.random().toString(36).substring(7)}`;
    setQrValue(value);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error logging out:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Teacher Screen</Title>
          <Paragraph>Create a student or generate a QR code</Paragraph>
          <TextInput
            label="Student Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            mode="outlined"
            secureTextEntry
          />
          <TextInput
            label="Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Section"
            value={section}
            onChangeText={setSection}
            style={styles.input}
            mode="outlined"
          />
          <Button mode="contained" onPress={createStudent} style={styles.button}>
            Create Student
          </Button>
          <Button mode="contained" onPress={generateQRCode} style={styles.button}>
            Generate QR Code
          </Button>
          <Button mode="contained" onPress={() => navigation.navigate('StudentList')} style={styles.button}>
            View All Students
          </Button>
          <Button mode="contained" onPress={handleLogout} style={styles.button}>
            Logout
          </Button>
          {qrValue ? (
            <View style={styles.qrContainer}>
              <Text>Scan this QR code:</Text>
              <QRCode value={qrValue} size={200} />
              <Text>{qrValue}</Text>
            </View>
          ) : null}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    padding: 20,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
  qrContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});