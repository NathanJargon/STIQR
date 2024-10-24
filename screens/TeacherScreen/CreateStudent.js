import React, { useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { TextInput, Button, Card, Title, Paragraph } from 'react-native-paper';
import { db } from '../FirebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function CreateStudent({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [section, setSection] = useState('');

  const createStudent = async () => {
    if (email && password && name && section) {
      try {
        const studentDocRef = doc(db, 'students', email);
        const studentDocSnap = await getDoc(studentDocRef);

        if (studentDocSnap.exists()) {
          Alert.alert('Error', 'Student email already exists');
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        await setDoc(studentDocRef, {
          password,
          name,
          section,
          tally: 0,
          classDates: [],
          createdAt: today,
        });

        await setDoc(doc(db, 'sections', section), { name: section });

        Alert.alert('Student created successfully!');
        navigation.goBack();
      } catch (error) {
        Alert.alert('Error creating student:', error.message);
      }
    } else {
      Alert.alert('Please fill in all fields');
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Create Student</Title>
          <Paragraph>Fill in the details to create a new student</Paragraph>
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
          <Button mode="contained" onPress={createStudent} style={[styles.button, styles.createButton]}>
            Create Student
          </Button>
          <Button mode="contained" onPress={() => navigation.goBack()} style={styles.button}>
            Back to Teacher Screen
          </Button>
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
  createButton: {
    backgroundColor: '#6200ee',
  },
});