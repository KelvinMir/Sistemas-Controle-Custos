// firebase.js
// Para configurar o Firebase:
// 1. Acesse https://console.firebase.google.com/
// 2. Crie um novo projeto
// 3. Ative o Firestore Database
// 4. Vá em Configurações do Projeto > Configuração do app > Web app
// 5. Copie as configurações e substitua abaixo

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Substitua pelas suas configurações do Firebase Console
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let dbFirestore = null;

try {
  // Only initialize Firebase if configuration is valid
  const isConfigured = firebaseConfig.projectId && 
                       firebaseConfig.projectId !== "YOUR_PROJECT_ID" &&
                       firebaseConfig.apiKey !== "YOUR_API_KEY";
  
  if (isConfigured) {
    const app = initializeApp(firebaseConfig);
    dbFirestore = getFirestore(app);
    console.log("Firebase initialized successfully");
  } else {
    console.log("Firebase not configured - app will work offline");
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
  console.log("App will work offline with IndexedDB only");
}

export default dbFirestore;