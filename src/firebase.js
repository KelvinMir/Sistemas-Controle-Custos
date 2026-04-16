// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAkrGfhhaVUhBCqfYgYO0POEmVvXrCbs0Q",
  authDomain: "solary-cacau.firebaseapp.com",
  projectId: "solary-cacau",
  storageBucket: "solary-cacau.firebasestorage.app",
  messagingSenderId: "535166324354",
  appId: "1:535166324354:web:b5d8f9e560f16c5b95ae9b",
  measurementId: "G-8REDLV0MLH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const dbFirestore = getFirestore(app);

export default dbFirestore;
