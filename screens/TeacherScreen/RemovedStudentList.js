import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Dimensions, Alert, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Button, TextInput, IconButton } from 'react-native-paper';
import { db } from '../FirebaseConfig';
import { collection, getDocs, setDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

export default function StudentList({ navigation }) {
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [view, setView] = useState('students'); // 'students' or 'folders'
  const [newSectionName, setNewSectionName] = useState('');
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editingSectionName, setEditingSectionName] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      const snapshot = await getDocs(collection(db, 'students'));
      const studentsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(studentsList);
    };

    const fetchSections = async () => {
      const snapshot = await getDocs(collection(db, 'sections'));
      const sectionsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSections(sectionsList);
    };

    fetchStudents();
    fetchSections();
  }, []);

  const createSection = async () => {
    if (newSectionName.trim() === '') {
      Alert.alert('Error', 'Folder name cannot be empty');
      return;
    }
    const sectionExists = sections.some(section => section.id === newSectionName);
    if (sectionExists) {
      Alert.alert('Error', 'Folder name already exists');
      return;
    }
    try {
      await setDoc(doc(db, 'sections', newSectionName), { name: newSectionName });
      setSections([...sections, { id: newSectionName, name: newSectionName }]);
      setNewSectionName('');
      Alert.alert('Success', 'Folder created successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renameSection = async (id) => {
    if (editingSectionName.trim() === '') {
      Alert.alert('Error', 'Folder name cannot be empty');
      return;
    }
    try {
      const sectionDocRef = doc(db, 'sections', id);
      await updateDoc(sectionDocRef, { name: editingSectionName });
      setSections(sections.map(section => section.id === id ? { ...section, name: editingSectionName } : section));
      setEditingSectionId(null);
      setEditingSectionName('');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const deleteSection = async (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this section?",
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
              const sectionDocRef = doc(db, 'sections', id);
              await deleteDoc(sectionDocRef);
              setSections(sections.filter(section => section.id !== id));
              Alert.alert('Success', 'Folder deleted successfully');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ],
      { cancelable: false }
    );
  };

  const addStudentToSection = async (studentId, sectionId) => {
    const section = sections.find(sec => sec.id === sectionId);
    if (!section) {
      Alert.alert('Error', 'Folder not found');
      return;
    }
    try {
      const studentDocRef = doc(db, 'students', studentId);
      await updateDoc(studentDocRef, { sectionId: sectionId, section: section.name });
      setStudents(students.map(student => student.id === studentId ? { ...student, sectionId: sectionId, section: section.name } : student));
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const resetTally = async (studentId) => {
    Alert.alert(
      "Confirm Reset",
      "Are you sure you want to reset the tally for this student?",
      [
        {
          text: "No",
          onPress: () => console.log("Reset cancelled"),
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              const studentDocRef = doc(db, 'students', studentId);
              await updateDoc(studentDocRef, { tally: 0 });
              setStudents(students.map(student => student.id === studentId ? { ...student, tally: 0 } : student));
              Alert.alert('Success', 'Tally reset successfully');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ],
      { cancelable: false }
    );
  };

  const resetAllTallies = async () => {
    Alert.alert(
      "Confirm Reset All",
      "Are you sure you want to reset the tally for all students?",
      [
        {
          text: "No",
          onPress: () => console.log("Reset all cancelled"),
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              const batch = db.batch();
              students.forEach(student => {
                const studentDocRef = doc(db, 'students', student.id);
                batch.update(studentDocRef, { tally: 0 });
              });
              await batch.commit();
              setStudents(students.map(student => ({ ...student, tally: 0 })));
              Alert.alert('Success', 'All tallies reset successfully');
            } catch (error) {
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
      {view === 'students' ? (
        <>
          <FlatList
            data={students}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <Card style={styles.card} onPress={() => navigation.navigate('StudentDetails', { email: item.id })}>
                <Card.Content>
                  <Title>{item.name}</Title>
                  <Paragraph>Email: {item.id}</Paragraph>
                  <Paragraph>Section: {item.section}</Paragraph>
                  <Paragraph>Created At: {item.createdAt}</Paragraph>
                  <Paragraph>Tally: {item.tally}</Paragraph>
                  <Button mode="contained" onPress={() => resetTally(item.id)} style={styles.resetButton}>
                    Reset Tally
                  </Button>
                </Card.Content>
              </Card>
            )}
          />
          <Button mode="contained" onPress={resetAllTallies} style={[styles.button, styles.resetAllButton]}>
            Reset All Tallies
          </Button>
        </>
      ) : (
        <>
          <FlatList
            data={sections}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <Card style={styles.card} onPress={() => navigation.navigate('SectionDetails', { sectionId: item.id, sectionName: item.name })}>
                <Card.Content>
                  <Title>{item.name}</Title>
                  <FlatList
                    data={students.filter(student => student.sectionId === item.id)}
                    keyExtractor={student => student.id}
                    renderItem={({ item: student }) => (
                      <Paragraph>{student.name}</Paragraph>
                    )}
                  />
                  <View style={styles.sectionActions}>
                    {editingSectionId === item.id ? (
                      <TextInput
                        label="Rename Folder"
                        value={editingSectionName}
                        onChangeText={setEditingSectionName}
                        style={[styles.input, styles.renameInput]}
                      />
                    ) : (
                      <Paragraph>{item.name}</Paragraph>
                    )}
                    <IconButton
                      icon={editingSectionId === item.id ? "check" : "pencil"}
                      onPress={() => {
                        if (editingSectionId === item.id) {
                          renameSection(item.id);
                        } else {
                          setEditingSectionId(item.id);
                          setEditingSectionName(item.name);
                        }
                      }}
                    />
                    <IconButton
                      icon="delete"
                      onPress={() => deleteSection(item.id)}
                    />
                  </View>
                </Card.Content>
              </Card>
            )}
          />
          <TextInput
            label="New Folder Name"
            value={newSectionName}
            onChangeText={setNewSectionName}
            style={styles.input}
          />
          <Button mode="contained" onPress={createSection} style={[styles.button, styles.createButton]}>
            Create Folder
          </Button>
        </>
      )}
      <Button mode="contained" onPress={() => setView(view === 'students' ? 'folders' : 'students')} style={styles.button}>
        {view === 'students' ? 'View Folders' : 'View Students'}
      </Button>
      <Button mode="contained" onPress={() => navigation.goBack()} style={styles.button}>
        Back to Teacher Screen
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    paddingTop: height * 0.065,
  },
  card: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
  createButton: {
    backgroundColor: '#6200ee', // Change the color of the "Create Section" button
  },
  resetButton: {
    backgroundColor: '#ff9800', // Orange color for reset button
    marginTop: 10,
  },
  resetAllButton: {
    backgroundColor: '#f44336', // Red color for reset all button
    marginTop: 20,
  },
  input: {
    marginBottom: 10,
  },
  renameInput: {
    width: '80%', // Increase the width of the "Rename Folder" input
  },
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});