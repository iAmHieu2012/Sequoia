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
  const newName = process.argv.slice(3).join(' ');

  if (!uid || !newName) {
    console.error('Error: Please provide a valid Firebase User UID and the new Display Name.');
    console.error('Usage: node update-profile.js <FIREBASE_UID> <New Display Name>');
    console.error('Example: node update-profile.js "MZB6XvlGjSPkOTXRQYTPfCsin2V2" "Administrator"');
    process.exit(1);
  }

  getAuth().updateUser(uid, { displayName: newName })
    .then((userRecord) => {
      console.log(`Success: Successfully updated display name for UID: ${userRecord.uid}`);
      console.log(`New Display Name: ${userRecord.displayName}`);
      console.log('Note: The user might need to reload or sign out and sign back in to see the changes.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error updating user profile:', err.message);
      process.exit(1);
    });

} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
