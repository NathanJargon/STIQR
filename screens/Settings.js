import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import { db } from './FirebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function Settings({ navigation, route }) {
  const email = route.params?.email || 'test@gmail.com';
  const userType = route.params?.userType;
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    try {
      const userDocRef = doc(db, userType, email);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        await updateDoc(userDocRef, { password: newPassword });
        Alert.alert('Success', 'Password changed successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'User not found');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <TextInput
        label="New Password"
        secureTextEntry={!showNewPassword}
        value={newPassword}
        onChangeText={setNewPassword}
        style={styles.input}
        right={
          <TextInput.Icon
            icon={showNewPassword ? "eye-off" : "eye"}
            onPress={() => setShowNewPassword(!showNewPassword)}
          />
        }
      />
      <TextInput
        label="Confirm New Password"
        secureTextEntry={!showConfirmNewPassword}
        value={confirmNewPassword}
        onChangeText={setConfirmNewPassword}
        style={styles.input}
        right={
          <TextInput.Icon
            icon={showConfirmNewPassword ? "eye-off" : "eye"}
            onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
          />
        }
      />
      <Button mode="contained" onPress={handleChangePassword} style={styles.button}>
        Change Password
      </Button>
      <Button mode="contained" onPress={() => navigation.goBack()} style={styles.button}>
        Go Back
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    width: '100%',
  },
});