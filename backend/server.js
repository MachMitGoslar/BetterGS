const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Firebase Admin SDK
// You need to add your service account key file
const serviceAccount = require('./config/firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://bettergs-74f1e.firebaseio.com" // Replace with your project URL
});

// Database connections
let currentDatabase = 'staging'; // Default database
const defaultDB = admin.firestore();
let stagingDB;

// Try to initialize staging database, fallback to default if not available
try {
  const { getFirestore } = require('firebase-admin/firestore');
  stagingDB = getFirestore(admin.app(), 'staging');
} catch (error) {
  console.log('Staging database not available, using default database for both connections');
  stagingDB = defaultDB;
}

const databases = {
  default: defaultDB,
  staging: stagingDB
};

// Helper function to get current database
function getCurrentDB() {
  return databases[currentDatabase];
}

const auth = admin.auth();

// Routes

// Serve the main admin panel
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes

// Database management endpoints
// Get current database
app.get('/api/database/current', (req, res) => {
  res.json({ 
    success: true, 
    currentDatabase,
    availableDatabases: Object.keys(databases)
  });
});

// Switch database
app.post('/api/database/switch', (req, res) => {
  try {
    const { database } = req.body;
    
    if (!databases[database]) {
      return res.status(400).json({ 
        success: false, 
        error: `Database '${database}' not available. Available databases: ${Object.keys(databases).join(', ')}` 
      });
    }
    
    currentDatabase = database;
    
    res.json({ 
      success: true, 
      message: `Switched to database: ${database}`,
      currentDatabase,
      availableDatabases: Object.keys(databases)
    });
  } catch (error) {
    console.error('Error switching database:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Copy activities between databases
app.post('/api/database/copy-activities', async (req, res) => {
  try {
    const { fromDatabase, toDatabase } = req.body;
    
    if (!databases[fromDatabase] || !databases[toDatabase]) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid database selection' 
      });
    }
    
    if (fromDatabase === toDatabase) {
      return res.status(400).json({ 
        success: false, 
        error: 'Source and target databases must be different' 
      });
    }
    
    const sourceDB = databases[fromDatabase];
    const targetDB = databases[toDatabase];
    
    // Get all activities from source database
    const activitiesSnapshot = await sourceDB.collection('activities').get();
    
    if (activitiesSnapshot.empty) {
      return res.json({ 
        success: true, 
        message: `No activities found in ${fromDatabase} database`,
        copiedCount: 0
      });
    }
    
    // Copy activities to target database
    const batch = targetDB.batch();
    let copiedCount = 0;
    
    activitiesSnapshot.forEach(doc => {
      const activityData = doc.data();
      const targetRef = targetDB.collection('activities').doc(doc.id);
      batch.set(targetRef, {
        ...activityData,
        copiedFrom: fromDatabase,
        copiedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      copiedCount++;
    });
    
    await batch.commit();
    
    res.json({ 
      success: true, 
      message: `Successfully copied ${copiedCount} activities from ${fromDatabase} to ${toDatabase}`,
      copiedCount,
      fromDatabase,
      toDatabase
    });
  } catch (error) {
    console.error('Error copying activities:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const listUsersResult = await auth.listUsers();
    const users = listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'No Name',
      customClaims: user.customClaims || {},
      disabled: user.disabled,
      emailVerified: user.emailVerified,
      creationTime: user.metadata.creationTime,
      lastSignInTime: user.metadata.lastSignInTime
    }));
    
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update user role (admin claim)
app.post('/api/users/:uid/role', async (req, res) => {
  try {
    const { uid } = req.params;
    const { role } = req.body;
    
    const customClaims = { role: role };
    
    await auth.setCustomUserClaims(uid, customClaims);
    
    res.json({ 
      success: true, 
      message: `User role updated to ${role}`,
      uid,
      claims: customClaims
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all activities
app.get('/api/activities', async (req, res) => {
  try {
    const db = getCurrentDB();
    const activitiesSnapshot = await db.collection('activities').get();
    const activities = [];
    
    activitiesSnapshot.forEach(doc => {
      activities.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({ 
      success: true, 
      activities,
      database: currentDatabase
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new activity
app.post('/api/activities', async (req, res) => {
  try {
    const { title, description, icon, imageUrl } = req.body;
    
    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }
    
    const db = getCurrentDB();
    const activityId = uuidv4();
    const activityData = {
      id: activityId,
      title: title.trim(),
      description: description?.trim() || '',
      icon: icon || 'add',
      imageUrl: imageUrl || 'https://picsum.photos/700/400',
      isActive: true,
      timeSpend: 0,
      is_active: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('activities').doc(activityId).set(activityData);
    
    res.json({ 
      success: true, 
      message: 'Activity created successfully',
      activity: activityData,
      database: currentDatabase
    });
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update activity
app.put('/api/activities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, icon, imageUrl, isActive } = req.body;
    
    const db = getCurrentDB();
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (icon !== undefined) updateData.icon = icon;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    await db.collection('activities').doc(id).update(updateData);
    
    res.json({ 
      success: true, 
      message: 'Activity updated successfully',
      id,
      updateData,
      database: currentDatabase
    });
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete activity
app.delete('/api/activities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const db = getCurrentDB();
    await db.collection('activities').doc(id).delete();
    
    res.json({ 
      success: true, 
      message: 'Activity deleted successfully',
      id,
      database: currentDatabase
    });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'BetterGS Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 BetterGS Backend server is running on port ${PORT}`);
  console.log(`📱 Admin Panel: http://localhost:${PORT}`);
  console.log(`🔥 Firebase Admin SDK initialized`);
});

module.exports = app;
