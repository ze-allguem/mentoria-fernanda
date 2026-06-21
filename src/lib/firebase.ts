import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD6LPRUVt2P7tKUIbw6zxZfdiHkz6EeDRQ",
  authDomain: "forms-fernanda-4cdcd.firebaseapp.com",
  projectId: "forms-fernanda-4cdcd",
  storageBucket: "forms-fernanda-4cdcd.firebasestorage.app",
  messagingSenderId: "760382471241",
  appId: "1:760382471241:web:393e7dc5531baf7f87d398",
  measurementId: "G-XDN4R34355"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
