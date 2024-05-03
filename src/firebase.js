import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import getFirestore

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA4qjcP40hgzx-gWKqVB6c9h9OKpecZobw",
    authDomain: "lms-1-36b1f.firebaseapp.com",
    projectId: "lms-1-36b1f",
    storageBucket: "lms-1-36b1f.appspot.com",
    messagingSenderId: "568729903010",
    appId: "1:568729903010:web:5e85a998503b1054f9dcfb",
    measurementId: "G-Z5844EFCH1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app); // Export db

