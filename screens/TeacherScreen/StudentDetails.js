import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, Dimensions } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Text, Card, Title, Paragraph, Button } from 'react-native-paper';
import { db } from '../FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

export default function StudentDetails({ route, navigation }) {
  const { email } = route.params;
  const [student, setStudent] = useState(null);
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    const fetchStudentData = async () => {
      const docRef = doc(db, 'students', email);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const studentData = docSnap.data();
        setStudent(studentData);
        const dates = studentData.classDates.reduce((acc, date) => {
          acc[date] = { marked: true, dotColor: 'green' };
          return acc;
        }, {});
        setMarkedDates(dates);
      } else {
        Alert.alert('No such student found');
      }
    };

    fetchStudentData();
  }, [email]);

  const handleDayPress = (day) => {
    Alert.alert('Date Information', `Date: ${day.dateString}`);
  };

  if (!student) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>{student.name}</Title>
          <Paragraph>Email: {email}</Paragraph>
          <Paragraph>Section: {student.section}</Paragraph>
          <Paragraph>Created At: {student.createdAt}</Paragraph>
          <Paragraph>Tally: {student.tally}</Paragraph>
        </Card.Content>
      </Card>
      <Calendar
        markedDates={markedDates}
        markingType={'dot'}
        onDayPress={handleDayPress}
      />
      <Button mode="contained" onPress={() => navigation.goBack()} style={styles.button}>
        Back to Student List
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
});