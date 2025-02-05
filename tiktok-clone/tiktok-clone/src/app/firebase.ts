import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA7YHI7CizdgvOKvsP49U1tHu4a2CyQm5M",
  authDomain: "tiktok-clone-c9b6e.firebaseapp.com",
  projectId: "tiktok-clone-c9b6e",
  storageBucket: "tiktok-clone-c9b6e.appspot.com",
  messagingSenderId: "843145537943",
  appId: "1:843145537943:web:c06b7a9bbd809aa5d19364"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
