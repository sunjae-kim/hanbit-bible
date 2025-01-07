// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth, OAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDxsypJRIqGF_YtuOBUQm0qzskejBPsM1A',
  authDomain: 'hb-read-bible.firebaseapp.com',
  projectId: 'hb-read-bible',
  storageBucket: 'hb-read-bible.firebasestorage.app',
  messagingSenderId: '409878983488',
  appId: '1:409878983488:web:32f4b0247d7b7e187bc0a5',
  measurementId: 'G-5JFR5WMNH7',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
auth.useDeviceLanguage();
export const db = getFirestore(app)
export const kakaoProvider = new OAuthProvider('oidc.kakao')
