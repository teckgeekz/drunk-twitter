const admin = require('firebase-admin');

// We use an empty app because we'll verify tokens using public keys
// Or we can initialize with application default credentials if available
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  } catch(err) {
    // If running without credentials in local dev, this might fail
    console.warn("Firebase Admin init failed, falling back if needed", err);
  }
}

async function verifyFirebaseToken(token) {
  if (process.env.NODE_ENV === 'development' && token === 'test-token') {
    return { uid: 'test-user-123' };
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid Firebase token');
  }
}

module.exports = { verifyFirebaseToken };
