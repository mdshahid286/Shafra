import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDhDFT-DwPoRmyOW9b620yNv0bhVi7lx9I",
  authDomain: "shafra-f22c6.firebaseapp.com",
  projectId: "shafra-f22c6",
  storageBucket: "shafra-f22c6.firebasestorage.app",
  messagingSenderId: "657676520739",
  appId: "1:657676520739:web:8ac7105e512752d7925096",
  measurementId: "G-GV074NQ51L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
