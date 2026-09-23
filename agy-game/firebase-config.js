/**
 * Firebase Configuration & Service Initialization
 * Project ID: agy-sandbox-4a603
 * Services: Hosting, Firestore, Authentication
 */

// Default Firebase Configuration for project agy-sandbox-4a603
const firebaseConfig = {
    projectId: "agy-sandbox-4a603",
    authDomain: "agy-sandbox-4a603.firebaseapp.com",
    storageBucket: "agy-sandbox-4a603.appspot.com"
};

// Export config for app consumption
if (typeof window !== 'undefined') {
    window.FIREBASE_PROJECT_ID = "agy-sandbox-4a603";
    window.firebaseConfig = firebaseConfig;
}
