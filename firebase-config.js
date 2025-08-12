import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCMysZiDromgVATBJhNiRPiM0qOpX-3bXQ",
    authDomain: "valdineia-bibliotecaria.firebaseapp.com",
    projectId: "valdineia-bibliotecaria",
    storageBucket: "valdineia-bibliotecaria.firebasestorage.app",
    messagingSenderId: "641418671046",
    appId: "1:641418671046:web:c46c48be1a61b1d16ef8c7",
    measurementId: "G-655LMG2EST"
};

// Inicializa Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
