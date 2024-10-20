import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, IconButton } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { db } from '../FirebaseConfig';
import { collection, getDocs, setDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import RNHTMLtoPDF from 'react-native-html-to-pdf'; // Import the library for PDF
import { Document, Packer, Paragraph as DocxParagraph, TextRun } from 'docx'; // Import the library for DOCX
import ExcelJS from 'exceljs'; // Import the library for Excel
import RNFS from 'react-native-fs'; // Import the library for file system operations

export default function SectionDetails({ route, navigation }) {
  const { sectionId, sectionName } = route.params;
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      const snapshot = await getDocs(collection(db, 'students'));
      const studentsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllStudents(studentsList);
      setStudents(studentsList.filter(student => student.section === sectionId));
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
              Alert.alert('Error', error.message);
            }
          }
        }
      ],
      { cancelable: false }
    );
  };

  const generatePDF = async () => {
    let htmlContent = `
      <h1>${sectionName}</h1>
      <table border="1" style="width: 100%; border-collapse: collapse;">
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Created At</th>
          <th>Tally</th>
        </tr>
    `;

    students.forEach(student => {
      htmlContent += `
        <tr>
          <td>${student.name}</td>
          <td>${student.id}</td>
          <td>${student.createdAt}</td>
          <td>${student.tally}</td>
        </tr>
      `;
    });

    htmlContent += `</table>`;

    try {
      const options = {
        html: htmlContent,
        fileName: `${sectionName}_students`,
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      Alert.alert('Success', `PDF generated at ${file.filePath}`);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const generateDOCX = async () => {
    const doc = new Document();
    doc.addSection({
      children: [
        new DocxParagraph({
          children: [
            new TextRun({
              text: sectionName,
              bold: true,
              size: 24,
            }),
          ],
        }),
        ...students.map(student => new DocxParagraph({
          children: [
            new TextRun(`Name: ${student.name}`),
            new TextRun(`Email: ${student.id}`),
            new TextRun(`Created At: ${student.createdAt}`),
            new TextRun(`Tally: ${student.tally}`),
          ],
        })),
      ],
    });

    try {
      const packer = new Packer();
      const buffer = await packer.toBuffer(doc);
      const filePath = `${RNFS.DocumentDirectoryPath}/${sectionName}_students.docx`;
      await RNFS.writeFile(filePath, buffer, 'base64');
      Alert.alert('Success', `DOCX generated at ${filePath}`);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const generateExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sectionName);

    worksheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Created At', key: 'createdAt', width: 30 },
      { header: 'Tally', key: 'tally', width: 10 },
    ];

    students.forEach(student => {
      worksheet.addRow({
        name: student.name,
        email: student.id,
        createdAt: student.createdAt,
        tally: student.tally,
      });
    });

    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const filePath = `${RNFS.DocumentDirectoryPath}/${sectionName}_students.xlsx`;
      await RNFS.writeFile(filePath, buffer, 'base64');
      Alert.alert('Success', `Excel file generated at ${filePath}`);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
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
      <Button mode="contained" onPress={generatePDF} style={styles.button}>
        Generate PDF
      </Button>
      <Button mode="contained" onPress={generateDOCX} style={styles.button}>
        Generate DOCX
      </Button>
      <Button mode="contained" onPress={generateExcel} style={styles.button}>
        Generate Excel
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