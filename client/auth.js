
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  authDomain: import.meta.env.VITE_GOOGLE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_GOOGLE_PROJECTID,
  appId: import.meta.env.VITE_GOOGLE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };
