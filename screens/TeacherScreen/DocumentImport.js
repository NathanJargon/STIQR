import React, { useState } from 'react';
import { StyleSheet, View, Alert, Dimensions, Modal } from 'react-native';
import { Button, Text, ActivityIndicator } from 'react-native-paper';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import XLSX from 'xlsx';
import { db } from '../FirebaseConfig';
import { collection, doc, writeBatch, getDocs } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

export default function DocumentImport({ route, navigation }) {
  const { sectionId, sectionName } = route.params;
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleDocumentPick = async () => {
    try {
      console.log('Document picker initiated...');
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      console.log('Document picker result:', result);
      console.log('File URI:', result.assets[0].uri);

      if (result.assets.length > 0) {
        const fileUri = result.assets[0].uri;
        console.log('Document picked successfully:', fileUri);

        setLoading(true);
        setModalMessage('Analyzing data...');
        setModalVisible(true);

        // Fetch the binary data from the fileUri
        const response = await fetch(fileUri);
        const fileBlob = await response.blob();

        console.log('File fetched successfully, size:', fileBlob.size);

        // Create a file reader to read the binary data
        const reader = new FileReader();

        reader.onload = (e) => {
          const arrayBuffer = e.target.result;
          const binaryString = new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '');

          console.log('Binary string obtained, starting Excel parsing...');
          try {
            const workbook = XLSX.read(binaryString, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            console.log('First sheet name:', sheetName);

            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            console.log('Parsed Excel data:', jsonData);
            processExcelData(jsonData);
          } catch (parseError) {
            console.error('Error parsing Excel file:', parseError);
            Alert.alert('Error', 'Failed to parse Excel file');
            setModalVisible(false);
          }
        };

        reader.onerror = (err) => {
          console.error('File reading error:', err);
          Alert.alert('Error', 'Failed to read file');
          setModalVisible(false);
        };

        reader.readAsArrayBuffer(fileBlob);
      } else {
        console.log('Document picking cancelled or failed');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick or read document');
      console.error('Error during document picking:', err);
      setModalVisible(false);
    } finally {
      setLoading(false);
    }
  };

  const processExcelData = async (jsonData) => {
    try {
      console.log('Processing Excel data...');
      setModalMessage('Writing data...');

      // Fetch existing students' emails
      const existingStudentsSnapshot = await getDocs(collection(db, 'students'));
      const existingEmails = existingStudentsSnapshot.docs.map((doc) => doc.data().email);
      console.log('Existing students fetched, emails:', existingEmails);

      // Filter out students whose emails already exist
      const newStudents = jsonData.filter((student) => !existingEmails.includes(student.Email));
      console.log('New students to add:', newStudents);

      if (newStudents.length === 0) {
        Alert.alert('No new students to add', 'All students in the file already exist.');
        setModalVisible(false);
        return;
      }

      const batch = writeBatch(db);
      newStudents.forEach((student) => {
        const studentDocRef = doc(collection(db, 'students'), student.Email);
        batch.set(studentDocRef, { ...student, section: sectionId });
      });

      await batch.commit();
      Alert.alert('Success', 'Students imported successfully');
      console.log('Batch write successful!');
    } catch (error) {
      Alert.alert('Error', 'Failed to import students');
      console.error('Error during data import:', error);
    } finally {
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Import Students for {sectionName}</Text>
      <Button mode="contained" onPress={handleDocumentPick} style={styles.button}>
        Pick Excel Document
      </Button>
      {loading && <ActivityIndicator />}
      <Button mode="contained" onPress={() => navigation.goBack()} style={styles.button}>
        Back to Section
      </Button>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>{modalMessage}</Text>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: width * 0.05,
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    marginBottom: height * 0.02,
    textAlign: 'center',
  },
  button: {
    marginTop: height * 0.02,
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalText: {
    fontSize: width * 0.05,
    color: 'white',
    marginBottom: height * 0.02,
  },
});