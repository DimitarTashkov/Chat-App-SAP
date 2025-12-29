/**
 * Firebase Configuration
 * 
 * Replace the placeholder values below with your actual Firebase project credentials.
 * 
 * To get your Firebase configuration:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a new project or select an existing one
 * 3. Go to Project Settings (gear icon)
 * 4. Scroll down to "Your apps" section
 * 5. Click on the web icon (</>)
 * 6. Copy the configuration object
 */

export const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

/**
 * Firebase Services Required for this Application:
 * 
 * 1. Authentication (firebase-auth)
 *    - Email/Password authentication
 *    - User session management
 * 
 * 2. Firestore (firebase-firestore)
 *    - Users collection
 *    - Rooms collection
 *    - Messages collection
 *    - Friends collection
 * 
 * 3. Realtime Database (firebase-database)
 *    - User presence (online/offline status)
 *    - Real-time notifications
 * 
 * Security Rules Setup:
 * 
 * Firestore Rules:
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     // Users can read/write their own data
 *     match /users/{userId} {
 *       allow read, write: if request.auth != null && request.auth.uid == userId;
 *     }
 *     // Room members can read/write room data
 *     match /rooms/{roomId} {
 *       allow read: if request.auth != null;
 *       allow write: if request.auth != null;
 *       match /messages/{messageId} {
 *         allow read, write: if request.auth != null;
 *       }
 *     }
 *   }
 * }
 * 
 * Realtime Database Rules:
 * {
 *   "rules": {
 *     ".read": "auth != null",
 *     ".write": "auth != null",
 *     "users": {
 *       "$uid": {
 *         ".read": "$uid === auth.uid",
 *         ".write": "$uid === auth.uid"
 *       }
 *     }
 *   }
 * }
 */

/**
 * Firestore Collection Structure:
 * 
 * users/{userId}
 *   - username: string (unique)
 *   - email: string (unique)
 *   - createdAt: timestamp
 *   - avatar: string (optional)
 *   - status: string ('online', 'offline', 'away')
 * 
 * rooms/{roomId}
 *   - name: string
 *   - createdBy: string (userId)
 *   - createdAt: timestamp
 *   - members: array of userIds
 *   - admins: array of userIds
 *   - type: string ('public', 'private')
 * 
 * rooms/{roomId}/messages/{messageId}
 *   - senderId: string (userId)
 *   - content: string
 *   - encrypted: boolean
 *   - createdAt: timestamp
 *   - editedAt: timestamp (optional)
 *   - deleted: boolean
 *   - reactions: object { userId: 'like' | 'dislike' }
 * 
 * friends/{userId}/{friendId}
 *   - status: string ('pending', 'accepted', 'rejected')
 *   - createdAt: timestamp
 *   - requestedBy: string (userId)
 * 
 * invitations/{invitationId}
 *   - roomId: string
 *   - invitedBy: string (userId)
 *   - invitedTo: string (userId)
 *   - status: string ('pending', 'accepted', 'rejected')
 *   - createdAt: timestamp
 */
