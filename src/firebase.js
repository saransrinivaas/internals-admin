// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics"; // optional

// Paste your own config object from Firebase Console here:
const firebaseConfig = {
  apiKey: "AIzaSyBv9Wyhcyup29olmjElFF_Q5LEctdF1TQE",
  authDomain: "sihback.firebaseapp.com",
  projectId: "sihback",
  storageBucket: "sihback.firebasestorage.app",
  messagingSenderId: "540961193745",
  appId: "1:540961193745:web:7125b8aecdd4daf57b96b0",
  measurementId: "G-FX49CENJB7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Optional: Analytics (only works on web in production)
export const analytics = getAnalytics(app);
