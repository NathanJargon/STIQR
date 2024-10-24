import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, Dimensions } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Text, Card, Title, Paragraph, Button } from 'react-native-paper';
import { db } from '../FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export default function CalendarScreen({ route }) {
  const email = route.params?.email || 'test@gmail.com';
  const [markedDates, setMarkedDates] = useState({});
  const [studentData, setStudentData] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchStudentData = async () => {
      const docRef = doc(db, 'students', email);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStudentData(data);
        const dates = data.classDates.reduce((acc, date) => {
          const dateOnly = date.split('T')[0];
          acc[dateOnly] = { marked: true, dotColor: 'green' };
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
    if (!studentData) {
      Alert.alert('Date Information', 'No student data available.');
      return;
    }
    const selectedDate = studentData.classDates.find(date => date.split('T')[0] === day.dateString);
    if (selectedDate) {
      Alert.alert('Date Information', `Date: ${formatDateTime(selectedDate)}`);
    } else {
      Alert.alert('Date Information', 'Have not been present at this day.');
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.header}>Attendance Calendar</Title>
          <View style={styles.calendarContainer}>
            <Calendar
              markedDates={markedDates}
              markingType={'dot'}
              onDayPress={handleDayPress}
            />
          </View>
          <Paragraph style={styles.tallyText}>Tally: {studentData ? studentData.tally : 0}</Paragraph>
          <Button mode="contained" onPress={() => navigation.navigate('StudentHome', { email })} style={styles.button}>
            Back to Student Home
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
  header: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
    marginBottom: height * 0.02,
    marginTop: height * 0.02,
  },
  calendarContainer: {
    width: '100%',
    marginBottom: height * 0.02,
  },
  tallyText: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    marginTop: height * 0.02,
    padding: 10,
    textAlign: 'center',
  },
  button: {
    marginTop: height * 0.02,
  },
});