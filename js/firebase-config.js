// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBjc2oIlFfYV1lkEdzT2f1GGxGPLnIrm7c",
  authDomain: "online-examination-syste-7c3fe.firebaseapp.com",
  projectId: "online-examination-syste-7c3fe",
  storageBucket: "online-examination-syste-7c3fe.firebasestorage.app",
  messagingSenderId: "256039373831",
  appId: "1:256039373831:web:0177b59a0bde8d12eb6ea2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

console.log("🔥 Firebase Connected Successfully");
