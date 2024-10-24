import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, Dimensions, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import { Text, Button, IconButton } from 'react-native-paper';
import { db } from '../FirebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
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

export default function Scanner({ route }) {
  const email = route.params?.email || 'test@gmail.com';
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [tally, setTally] = useState(0);
  const [markedDates, setMarkedDates] = useState({});
  const [cameraRef, setCameraRef] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [scanCount, setScanCount] = useState(0);
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

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.navigate('StudentHome', { email })}
        />
        <Text style={styles.headerText}>Scanner</Text>
      </View>
      <View style={styles.scannerContainer}>
        <Camera
          style={styles.camera}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  scannerContainer: {
    width: '100%',
    height: height * 0.7,
    marginBottom: height * 0.02,
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
    borderRadius: 20,
  },
  button: {
    marginTop: 10,
  },
});