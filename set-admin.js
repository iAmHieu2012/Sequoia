const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const path = require('path');

const serviceAccountPath = path.resolve(__dirname, './core/firebase-key.json');

let serviceAccount;
try {
  serviceAccount = require(serviceAccountPath);
} catch (err) {
  console.error('Error: Could not find or read the service account file at:', serviceAccountPath);
  process.exit(1);
}

try {
  initializeApp({
    credential: cert(serviceAccount)
  });

  const uid = process.argv[2];

  if (!uid) {
    console.error('Error: Please provide a valid Firebase User UID.');
    console.error('Usage: node set-admin.js <FIREBASE_UID>');
    process.exit(1);
  }

  getAuth().setCustomUserClaims(uid, { isAdmin: true })
    .then(() => {
      console.log(`Success: Successfully assigned admin claims to user UID: ${uid}`);
      console.log('Note: The user must sign out and sign back in for the changes to take effect.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error setting custom claims:', err.message);
      process.exit(1);
    });

} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
