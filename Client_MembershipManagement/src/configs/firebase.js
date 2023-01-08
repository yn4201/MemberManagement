import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAeAgFjSqzX-oCJGqUEFhQ3MF_kTCgpCWA",
  authDomain: "uth-client.firebaseapp.com",
  projectId: "uth-client",
  storageBucket: "uth-client.appspot.com",
  messagingSenderId: "908992031616",
  appId: "1:908992031616:web:29804152ab0e43537cef65",
  measurementId: "G-VL42KCZ879"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);