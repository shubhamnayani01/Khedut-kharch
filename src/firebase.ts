import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAvmVemDEE6bojn5lEJeCyblqTB2c3Wj9Q",
  authDomain: "khedut-kharch.firebaseapp.com",
  projectId: "khedut-kharch",
  storageBucket: "khedut-kharch.firebasestorage.app",
  messagingSenderId: "652906682156",
  appId: "1:652906682156:web:aa5ab9199190ed44a13e89",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);