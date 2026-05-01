import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC9_as7EVCU5Kg2KG8W7sPDpqae9juJo2A",
  authDomain: "yaa-baby-enterprise.firebaseapp.com",
  projectId: "yaa-baby-enterprise",
  storageBucket: "yaa-baby-enterprise.firebasestorage.app",
  messagingSenderId: "904412493978",
  appId: "1:904412493978:web:12b8f6c2319b1f8ca98723",
  measurementId: "G-MYFB1QY9Q3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
