import React from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const FAQ = () => {
  const navigation = useNavigation();

  const teacherFaqs = [
    {
      question: "How do I manage my students?",
      answer: "To manage your students, go to the Teacher Home screen and select the 'Manage Students' option."
    },
    {
      question: "How do I reset a student's tally?",
      answer: "To reset a student's tally, go to the Section Details screen and click on the 'Reset Tally' button for the specific student."
    },
    // Add more teacher FAQs as needed
  ];

  const studentFaqs = [
    {
      question: "What is STIQR?",
      answer: "STIQR is an STI QR system designed to manage student and teacher interactions efficiently."
    },
    {
      question: "How do I reset my password?",
      answer: "To reset your password, go to the Settings screen and follow the instructions to reset your password."
    },
    {
      question: "How do I upload my schedule?",
      answer: "To upload your schedule, go to the Home screen and click on the 'Upload Schedule File' button."
    },
    // Add more student FAQs as needed
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="#000" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>FAQ</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.sectionTitle}>For Teachers</Text>
        {teacherFaqs.map((faq, index) => (
          <Card key={index} style={styles.card}>
            <Card.Content>
              <Title style={styles.question}>{faq.question}</Title>
              <Paragraph style={styles.answer}>{faq.answer}</Paragraph>
            </Card.Content>
          </Card>
        ))}
        <Text style={styles.sectionTitle}>For Students</Text>
        {studentFaqs.map((faq, index) => (
          <Card key={index} style={styles.card}>
            <Card.Content>
              <Title style={styles.question}>{faq.question}</Title>
              <Paragraph style={styles.answer}>{faq.answer}</Paragraph>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: width * 0.05,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
    marginTop: height * 0.02,
  },
  backButtonText: {
    fontSize: width * 0.04,
    marginLeft: width * 0.02,
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    marginBottom: height * 0.02,
    textAlign: 'center',
    marginTop: height * 0.02,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    marginTop: height * 0.03,
    marginBottom: height * 0.01,
    textAlign: 'center',
  },
  card: {
    width: '90%',
    marginBottom: height * 0.02,
  },
  question: {
    fontSize: width * 0.05,
  },
  answer: {
    fontSize: width * 0.04,
  },
});

export default FAQ;