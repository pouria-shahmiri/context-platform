import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBBSqv6bh1Xwqut4uBRcVx6Z2r7apLRy9o",
  authDomain: "pyramid-s.firebaseapp.com",
  projectId: "pyramid-s",
  storageBucket: "pyramid-s.firebasestorage.app",
  messagingSenderId: "767685344402",
  appId: "1:767685344402:web:fcd239e0686420e4267a4b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
