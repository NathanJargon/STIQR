import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, Dimensions } from 'react-native';
import { Camera } from 'expo-camera';
import { Calendar } from 'react-native-calendars';
import { Text, Button, Card, Title, Paragraph } from 'react-native-paper';
import { db, auth } from '../FirebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
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

export default function Home({ route }) {
  const email = route.params?.email || 'test@gmail.com';
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [tally, setTally] = useState(0);
  const [markedDates, setMarkedDates] = useState({});
  const [cameraRef, setCameraRef] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [scanCount, setScanCount] = useState(0);
  const [studentData, setStudentData] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert('Camera permission is required to scan QR codes');
      }
    };

    const fetchStudentData = async () => {
      const docRef = doc(db, 'students', email);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStudentData(data);
        setTally(data.tally);
        setStudentName(data.name);
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

    getCameraPermissions();
    fetchStudentData();
  }, [email]);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    if (data !== today) {
      Alert.alert('Invalid QR Code', 'The QR code does not match today\'s date.');
      setScanned(false);
      return;
    }

    const docRef = doc(db, 'students', email);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      Alert.alert('No such student found');
      setScanned(false);
      return;
    }

    const studentData = docSnap.data();
    const alreadyScannedToday = studentData.classDates.some(date => date.startsWith(today));

    try {
      if (alreadyScannedToday) {
        setScanCount(scanCount + 1);
        if (scanCount >= 1) {
          await updateDoc(docRef, {
            tally: tally - 1,
            classDates: arrayRemove(now),
          });
          setTally(tally - 1);
          setMarkedDates((prevDates) => {
            const newDates = { ...prevDates };
            delete newDates[today];
            return newDates;
          });
          Alert.alert(
            'Scan Warning',
            `You have already scanned for today. Tally has been decreased.\n\nEmail: ${email}\nName: ${studentName}\nTally: ${tally - 1}\nDate: ${formatDateTime(now)}`,
            [{ text: 'OK', onPress: () => setScanned(false) }]
          );
          setScanCount(0); // Reset scan count after decrementing tally
        } else {
          Alert.alert(
            'Scan Warning',
            `You have already scanned for today. Scanning again will decrease your tally.\n\nEmail: ${email}\nName: ${studentName}\nTally: ${tally}\nDate: ${formatDateTime(now)}`,
            [{ text: 'OK', onPress: () => setScanned(false) }]
          );
        }
      } else {
        await updateDoc(docRef, {
          tally: tally + 1,
          classDates: arrayUnion(now),
        });
        setTally(tally + 1);
        setMarkedDates({
          ...markedDates,
          [today]: { marked: true, dotColor: 'green' },
        });
        Alert.alert(
          'Scan Successful',
          `Student Information:\n\nEmail: ${email}\nName: ${studentName}\nTally: ${tally + 1}\nDate: ${formatDateTime(now)}`,
          [{ text: 'Present', onPress: () => setScanned(false) }]
        );
        setScanCount(0); // Reset scan count after successful scan
      }
    } catch (error) {
      Alert.alert('Error updating student data:', error.message);
    }

    setTimeout(() => setScanned(false), 2000); // Reset scanner after 2 seconds
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error logging out:', error.message);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

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
          <Title style={styles.header}>Student Home</Title>
          <Paragraph>Welcome, {email}</Paragraph>
          <View style={styles.scannerContainer}>
            <Camera
              style={StyleSheet.absoluteFillObject}
              type={Camera.Constants.Type.back}
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              barCodeTypes={["qr", "pdf417"]} // don't change this please.
              ref={(ref) => setCameraRef(ref)}
            />
            {scanned && (
              <Button mode="contained" onPress={() => setScanned(false)} style={styles.button}>
                Tap to Scan Again
              </Button>
            )}
          </View>
          <View style={styles.calendarContainer}>
            <Calendar
              markedDates={markedDates}
              markingType={'dot'}
              onDayPress={handleDayPress}
            />
          </View>
          <View style={styles.tallyContainer}>
            <Text style={styles.tallyText}>Tally: {tally}</Text>
          </View>
          <Button mode="contained" onPress={handleLogout} style={styles.logoutButton}>
            Logout
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
  scannerContainer: {
    width: '100%',
    height: height * 0.3,
    marginBottom: height * 0.02,
    position: 'relative',
  },
  button: {
    marginTop: 10,
  },
  calendarContainer: {
    width: '100%',
    marginBottom: height * 0.02,
  },
  tallyContainer: {
    width: '100%',
    alignItems: 'center',
  },
  tallyText: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 20,
  },
});