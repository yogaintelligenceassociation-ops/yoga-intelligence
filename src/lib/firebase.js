// ─── Firebase initialisation ────────────────────────────────────────────────
// The Firebase WEB config is PUBLIC by design (Google secures access via
// Authorized Domains + Phone-sign-in settings, not by hiding these values), so
// it is safe to ship in the client bundle.
//
// Values are read from REACT_APP_FIREBASE_* env vars when present, otherwise
// they fall back to the literals below. Paste your project's config into the
// FIREBASE_CONFIG object (or set the env vars) — that's the only change needed.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const FIREBASE_CONFIG = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBpnMs5ZgryEs6i65G6EhCJe92lYF-qWK0",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "yoga-intelligence.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "yoga-intelligence",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "yoga-intelligence.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "631344239395",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:631344239395:web:81e815a33d36ab5f86b296",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-WPEGF14LB8",
};

export const firebaseConfigured =
  !String(FIREBASE_CONFIG.apiKey).startsWith("PASTE_") &&
  !String(FIREBASE_CONFIG.projectId).startsWith("PASTE_");

const app = initializeApp(FIREBASE_CONFIG);

export const auth = getAuth(app);
// India numbers: default region prefix used by AuthModal.
auth.languageCode = "en";

export { FIREBASE_CONFIG };
