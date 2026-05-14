// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

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
export const auth = getAuth(app);
let dbFirestore;

try {
  dbFirestore = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch (error) {
  console.error("Não foi possível ativar o cache persistente do Firestore:", error);
  dbFirestore = getFirestore(app);
}

export const authReady = new Promise((resolve, reject) => {
  const unsubscribe = onAuthStateChanged(
    auth,
    (user) => {
      if (user) {
        unsubscribe();
        resolve(user);
      }
    },
    (error) => {
      unsubscribe();
      reject(error);
    }
  );

  signInAnonymously(auth).catch((error) => {
    unsubscribe();
    reject(error);
  });
});

export default dbFirestore;
