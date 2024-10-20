// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Ensure full Firestore is imported
import { getStorage } from 'firebase/storage'; // Import Firebase Storage
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3QobYH0Ubbuyy-XPzx1sP4Jtx94oqbBo",
  authDomain: "stiqr-55147.firebaseapp.com",
  projectId: "stiqr-55147",
  storageBucket: "stiqr-55147.appspot.com",
  messagingSenderId: "46456073231",
  appId: "1:46456073231:web:c8f1328a0fc78d78f5877a",
  measurementId: "G-W10YF1F12R"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const db = getFirestore(app);
const storage = getStorage(app); // Initialize Firebase Storage

export { auth, db, storage };