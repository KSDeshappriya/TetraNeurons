import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyATA3h_NVAXRyI76FQUghb9YMCMR804r_g",
  authDomain: "disaster-b6076.firebaseapp.com",
  projectId: "disaster-b6076",
  storageBucket: "disaster-b6076.firebasestorage.app",
  messagingSenderId: "614042758329",
  appId: "1:614042758329:web:0a99da1501b2fd41a8ff68",
  databaseURL: "https://disaster-b6076-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const firestore = getFirestore(app);

export default app;