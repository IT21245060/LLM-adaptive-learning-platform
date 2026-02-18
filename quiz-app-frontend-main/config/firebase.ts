import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyB-aJVHp8gpiOz17oqiD7eWY30JX1Qzkkw",
  authDomain: "quiz-app-62bc4.firebaseapp.com",
  projectId: "quiz-app-62bc4",
  storageBucket: "quiz-app-62bc4.firebasestorage.app",
  messagingSenderId: "779853366346",
  appId: "1:779853366346:web:5cdc1d8ce0fd3f945e12b3",
  measurementId: "G-CK6T8F93GL"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
