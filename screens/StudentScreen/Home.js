import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, Dimensions, TouchableOpacity, FlatList, Modal, Image, ActivityIndicator } from 'react-native';
import { Text, Button, Card, Avatar, IconButton } from 'react-native-paper';
import { db, auth, storage } from '../FirebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import uuid from 'react-native-uuid'; // Import react-native-uuid

const avatarIcons = [
  'account', 'star', 'heart', 'camera', 'emoticon', 'robot', 'alien', 'cat', 'dog'
];

const { width, height } = Dimensions.get('window');

export default function Home({ route }) {
  const email = route.params?.email || 'test@gmail.com';
  const [studentName, setStudentName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('account');
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [scheduleFile, setScheduleFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fullImageModalVisible, setFullImageModalVisible] = useState(false); // State for full image modal
  const [originalRatio, setOriginalRatio] = useState(true); // State to toggle between original ratio and portrait mode
  const navigation = useNavigation();

  useEffect(() => {
    const fetchStudentData = async () => {
      const docRef = doc(db, 'students', email);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStudentName(data.name);
        setSelectedAvatar(data.avatarIcon || 'account');
        setScheduleFile(data.scheduleFile || null);
      }
    };

    fetchStudentData();
  }, [email]);

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "No",
          onPress: () => console.log("Logout cancelled"),
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.navigate('Login');
            } catch (error) {
              Alert.alert('Error logging out:', error.message);
            }
          }
        }
      ],
      { cancelable: false }
    );
  };

  const handleAvatarSelect = async (icon) => {
    setSelectedAvatar(icon);
    setAvatarModalVisible(false);
    const userDocRef = doc(db, 'students', email);
    await updateDoc(userDocRef, { avatarIcon: icon });
  };

  const handleImageUpload = async () => {
    console.log("Starting image upload...");

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log("ImagePicker result:", result);

    if (!result.cancelled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      console.log("Image URI:", imageUri);

      setUploading(true);

      try {
        // Delete the existing file if it exists
        if (scheduleFile) {
          const existingFileRef = ref(storage, scheduleFile);
          await deleteObject(existingFileRef);
          console.log("Existing file deleted");
        }

        const response = await fetch(imageUri);
        const blob = await response.blob();
        console.log("File fetched and converted to Blob");

        const uniqueImageName = `${uuid.v4()}.jpg`; // Generate a unique filename using react-native-uuid
        const storageRef = ref(storage, `schedules/${uniqueImageName}`);
        await uploadBytes(storageRef, blob); // Upload the Blob to Firebase Storage
        console.log("Image uploaded successfully");

        const downloadURL = await getDownloadURL(storageRef);
        console.log("Download URL obtained:", downloadURL);
        setScheduleFile(downloadURL);

        const userDocRef = doc(db, 'students', email);
        await updateDoc(userDocRef, { scheduleFile: downloadURL });
        console.log("Firestore updated with download URL");

        Alert.alert('File uploaded successfully');
        setUploading(false);
      } catch (error) {
        console.error("Error uploading image:", error);
        Alert.alert('Upload failed:', error.message);
        setUploading(false);
      }
    } else {
      console.log("ImagePicker cancelled or no assets found");
    }
  };

  const handleImagePress = () => {
    setFullImageModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setAvatarModalVisible(true)}>
              <Avatar.Icon size={40} icon={selectedAvatar} />
            </TouchableOpacity>
            <Text style={styles.emailText}>{email}</Text>
            <IconButton
              icon="cog"
              size={24}
              onPress={() => navigation.navigate('Settings', { email })}
            />
          </View>
          {uploading && <ActivityIndicator />}
          {scheduleFile && (
            <TouchableOpacity onPress={handleImagePress} style={styles.imageContainer}>
              <Image source={{ uri: scheduleFile }} style={styles.scheduleImage} />
              <Text style={styles.imageText}>Click for Full Picture</Text>
            </TouchableOpacity>
          )}
          <Button mode="contained" onPress={handleImageUpload} style={styles.button}>
            Upload Schedule File
          </Button>
          <Button mode="contained" onPress={() => navigation.navigate('Scanner', { email })} style={styles.button}>
            Open Scanner
          </Button>
          <Button mode="contained" onPress={() => navigation.navigate('CalendarScreen', { email })} style={styles.button}>
            View Calendar
          </Button>
          <Button mode="contained" onPress={() => navigation.navigate('FAQ')} style={styles.button}>
            View FAQ
          </Button>
          <Button mode="contained" onPress={handleLogout} style={[styles.button, styles.logoutButton]}>
            Logout
          </Button>
        </Card.Content>
      </Card>

      <Modal
        animationType="slide"
        transparent={true}
        visible={avatarModalVisible}
        onRequestClose={() => {
          setAvatarModalVisible(!avatarModalVisible);
        }}
      >
        <View style={styles.modalView}>
          <Text style={styles.qrText}>Select an Avatar Icon:</Text>
          <FlatList
            data={avatarIcons}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleAvatarSelect(item)}>
                <Avatar.Icon size={40} icon={item} style={styles.avatarIcon} />
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
            numColumns={3}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setAvatarModalVisible(!avatarModalVisible)}
          >
            <Text style={styles.textStyle}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={fullImageModalVisible}
        onRequestClose={() => {
          setFullImageModalVisible(!fullImageModalVisible);
        }}
      >
        <View style={styles.fullImageModalView}>
          <Image
            source={{ uri: scheduleFile }}
            style={styles.fullImagePortrait}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setFullImageModalVisible(!fullImageModalVisible)}
          >
            <Text style={styles.textStyle}>Close</Text>
          </TouchableOpacity>
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
    padding: 20,
  },
  card: {
    width: '100%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  emailText: {
    marginLeft: 10,
    fontSize: 18,
    flex: 1,
  },
  button: {
    marginTop: 10,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: 'red',
  },
  modalView: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    marginTop: 'auto',
    margin: 20,
    padding: 35,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fullImageModalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  closeButton: {
    backgroundColor: '#590de4',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginTop: height * 0.02,
    marginBottom: height * 0.15,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  qrText: {
    fontSize: 20,
    marginBottom: 20,
  },
  avatarIcon: {
    margin: 10,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  scheduleImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  imageText: {
    marginTop: 5,
    fontSize: 12,
    color: '#007BFF',
  },
  fullImageOriginal: {
    width: '90%',
    height: '90%',
  },
  fullImagePortrait: {
    width: '100%',
    height: '100%',
  },
  toggleButton: {
    marginTop: 10,
  },
});