import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Dimensions } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { db } from '../FirebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');


export default function StudentList({ navigation }) {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      const snapshot = await getDocs(collection(db, 'students'));
      const studentsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(studentsList);
    };

    fetchStudents();
  }, []);

  return (
    <View style={styles.container}>
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
            </Card.Content>
          </Card>
        )}
      />
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
});