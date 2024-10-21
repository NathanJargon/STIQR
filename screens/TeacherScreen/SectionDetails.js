import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, IconButton } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { db } from '../FirebaseConfig';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export default function SectionDetails({ route, navigation }) {
  const { sectionId, sectionName } = route.params;
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'students'));
        const studentsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllStudents(studentsList);
        setStudents(studentsList.filter(student => student.section === sectionId));
      } catch (error) {
        console.error("Error fetching students:", error);
        Alert.alert('Error', 'Failed to fetch students');
      }
    };

    fetchStudents();
  }, [sectionId]);

  const addStudentToSection = async () => {
    if (selectedStudentId.trim() === '') {
      Alert.alert('Error', 'Please select a student');
      return;
    }
    try {
      const studentDocRef = doc(db, 'students', selectedStudentId);
      await updateDoc(studentDocRef, { section: sectionId });
      setStudents([...students, allStudents.find(student => student.id === selectedStudentId)]);
      setSelectedStudentId('');
      Alert.alert('Success', 'Student added to folder');
    } catch (error) {
      console.error("Error adding student to section:", error);
      Alert.alert('Error', error.message);
    }
  };

  const removeStudentFromSection = async (studentId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to remove this student from the folder?",
      [
        {
          text: "No",
          onPress: () => console.log("Delete cancelled"),
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              const studentDocRef = doc(db, 'students', studentId);
              await updateDoc(studentDocRef, { section: 'A0' });
              setStudents(students.filter(student => student.id !== studentId));
              Alert.alert('Success', 'Student removed from folder');
            } catch (error) {
              console.error("Error removing student from section:", error);
              Alert.alert('Error', error.message);
            }
          }
        }
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <Title style={styles.sectionName}>{sectionName}</Title>
      <FlatList
        data={students}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardContent}>
                <View>
                  <Title>{item.name}</Title>
                  <Paragraph>Email: {item.id}</Paragraph>
                  <Paragraph>Created At: {item.createdAt}</Paragraph>
                  <Paragraph>Tally: {item.tally}</Paragraph>
                </View>
                <IconButton
                  icon="delete"
                  onPress={() => removeStudentFromSection(item.id)}
                />
              </View>
            </Card.Content>
          </Card>
        )}
      />
      <Picker
        selectedValue={selectedStudentId}
        onValueChange={(itemValue) => setSelectedStudentId(itemValue)}
        style={styles.input}
      >
        <Picker.Item label="Select a student" value="" />
        {allStudents.filter(student => student.section !== sectionId).map(student => (
          <Picker.Item key={student.id} label={student.name} value={student.id} />
        ))}
      </Picker>
      <Button mode="contained" onPress={addStudentToSection} style={styles.button}>
        Add Student
      </Button>
      <Button mode="contained" onPress={() => navigation.navigate('DocumentGeneration', { sectionId, sectionName, students })} style={styles.button}>
        Generate Documents
      </Button>
      <Button mode="contained" onPress={() => navigation.goBack()} style={styles.button}>
        Back to Folders
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  sectionName: {
    marginTop: 30,
    fontSize: 24,
  },
  card: {
    marginBottom: 10,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    marginTop: 10,
  },
  input: {
    marginBottom: 10,
  },
});