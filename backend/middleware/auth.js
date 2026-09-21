const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

try {
  initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'invoiceai-94973'
  });
} catch (error) {
  if (!/already exists/.test(error.message)) {
    console.warn('Firebase Admin initialization issue (ignored if using mock auth):', error.message);
  }
}

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1].trim();

  // Support local mock users for development
  if (token.startsWith('mock_')) {
    req.user = { uid: token.replace('mock_', '') };
    return next();
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = { uid: decodedToken.uid };
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error.message);
    return res.status(403).json({ success: false, error: 'Unauthorized: Invalid token' });
  }
};

module.exports = authMiddleware;
