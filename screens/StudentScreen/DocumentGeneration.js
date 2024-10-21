import React from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Button, Title } from 'react-native-paper';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import ExcelJS from 'exceljs';
import RNFS from 'react-native-fs';

export default function DocumentGeneration({ route, navigation }) {
  const { sectionName, students } = route.params;

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
      console.error("Error generating PDF:", error);
      Alert.alert('Error', error.message);
    }
  };

  const generateExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'STIQR';
    workbook.created = new Date();
    workbook.modified = new Date();
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
      
      // Make sure to write the buffer correctly
      await RNFS.writeFile(filePath, buffer.toString('base64'), 'base64'); // ensure buffer is converted to base64
      Alert.alert('Success', `Excel file generated at ${filePath}`);
    } catch (error) {
      console.error("Error generating Excel:", error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.sectionName}>{sectionName}</Title>
      <Button mode="contained" onPress={generatePDF} style={styles.button}>
        Generate PDF
      </Button>
      <Button mode="contained" onPress={generateExcel} style={styles.button}>
        Generate Excel
      </Button>
      <Button mode="contained" onPress={() => navigation.goBack()} style={styles.button}>
        Back to Section
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
  button: {
    marginTop: 10,
  },
});
