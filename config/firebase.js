// config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDu7VtLQ5-aEX077MRc12I_7fTr-qKL7W0",
  authDomain: "ecommerce-guider.firebaseapp.com",
  projectId: "ecommerce-guider",
  storageBucket: "ecommerce-guider.firebasestorage.app",
  messagingSenderId: "642798508634",
  appId: "1:642798508634:web:53c6a7f330cf623ae51663",
  measurementId: "G-T4RKVH7YNJ"
};

// ✅ Initialize Firebase only once
const app = initializeApp(firebaseConfig);

// ✅ Auth service
const auth = getAuth(app);

export { app, auth };
