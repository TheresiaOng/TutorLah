import { initializeApp } from 'firebase/app';

// Optionally import the services that you want to use
// import {...} from 'firebase/auth';
// import {...} from 'firebase/database';
// import {...} from 'firebase/firestore';
// import {...} from 'firebase/functions';
// import {...} from 'firebase/storage';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD6X5mdNdusRyvaqU-Ptwp0sEUs1W2zERU",
  authDomain: "tutorlah.firebaseapp.com",
  databaseURL: 'https://tutorlah.firebaseio.com',
  projectId: "tutorlah",
  storageBucket: "tutorlah.firebasestorage.app",
  messagingSenderId: "682565229135",
  appId: "1:682565229135:web:5370daad4050892a01e83a",
  measurementId: "G-T9SR44J9MN"
};

const app = initializeApp(firebaseConfig);
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
