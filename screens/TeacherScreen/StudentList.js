import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Dimensions, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, TextInput, IconButton } from 'react-native-paper';
import { db } from '../FirebaseConfig';
import { collection, getDocs, setDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

export default function StudentList({ navigation }) {
  const [sections, setSections] = useState([]);
  const [newSectionName, setNewSectionName] = useState('');
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editingSectionName, setEditingSectionName] = useState('');

  useEffect(() => {
    const fetchSections = async () => {
      const snapshot = await getDocs(collection(db, 'sections'));
      const sectionsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSections(sectionsList);
    };

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

  return (
    <View style={styles.container}>
      <FlatList
        data={sections}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => navigation.navigate('SectionDetails', { sectionId: item.id, sectionName: item.name })}>
            <Card.Content>
              <Title>{item.name}</Title>
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