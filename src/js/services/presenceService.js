import { 
    ref, 
    onValue, 
    onDisconnect, 
    set, 
    serverTimestamp as rtdbTimestamp 
} from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js';
import { 
    doc, 
    updateDoc, 
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js';

export const presenceService = {
    /**
     * Initialize presence tracking for a user
     * @param {string} userId 
     */
    initializePresence(userId) {
        const rtdb = window.rtdb;
        const db = window.db;
        
        if (!rtdb || !db) {
             console.error("Firebase services not initialized for presence");
             return;
        }

        const userStatusDatabaseRef = ref(rtdb, '/status/' + userId);
        const isOfflineForDatabase = {
            state: 'offline',
            last_changed: rtdbTimestamp()
        };
        const isOnlineForDatabase = {
            state: 'online',
            last_changed: rtdbTimestamp()
        };

        const connectedRef = ref(rtdb, '.info/connected');

        onValue(connectedRef, async (snapshot) => {
            // If we are not connected, we don't do anything.
            if (snapshot.val() === false) {
                return;
            }

            // When we connect (or reconnect)...
            
            // 1. Register the onDisconnect handler. This runs on the server when the connection drops.
            await onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase);
            
            // 2. Set our local status to online in RTDB
            set(userStatusDatabaseRef, isOnlineForDatabase);

            // 3. Update Firestore status to 'online' (Visible to old queries)
            // Note: If the user closes the tab, this won't update to 'offline' automatically 
            // without Cloud Functions, but RTDB will.
            const userDocRef = doc(db, 'users', userId);
            try {
                await updateDoc(userDocRef, {
                    status: 'online',
                    lastSeen: serverTimestamp()
                });
            } catch (e) {
                console.error("Error updating firestore presence:", e);
            }
        });
    },
    
    /**
     * Go offline manually (e.g. on logout)
     * @param {string} userId
     */
    async goOffline(userId) {
        const rtdb = window.rtdb;
        const db = window.db;
        if (!rtdb || !db) return;

        const userStatusDatabaseRef = ref(rtdb, '/status/' + userId);
        
        try {
            // 1. Update RTDB
            await set(userStatusDatabaseRef, {
                state: 'offline',
                last_changed: rtdbTimestamp()
            });

            // 2. Update Firestore
            const userDocRef = doc(db, 'users', userId);
            await updateDoc(userDocRef, {
                status: 'offline',
                lastSeen: serverTimestamp()
            });
        } catch (e) {
            console.error("Error setting offline:", e);
        }
    },

    /**
     * Subscribe to status changes for a list of friends
     * @param {Array<string>} friendIds 
     * @param {Function} callback - Called with (friendId, status)
     * @returns {Function} Unsubscribe function
     */
    subscribeToFriendStatuses(friendIds, callback) {
        const rtdb = window.rtdb;
        if (!rtdb || !friendIds.length) return () => {};

        const unsubscribers = [];

        friendIds.forEach(friendId => {
            const statusRef = ref(rtdb, '/status/' + friendId);
            const unsubscribe = onValue(statusRef, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    callback(friendId, data.state);
                } else {
                    callback(friendId, 'offline'); // Default if no data
                }
            });
            unsubscribers.push(unsubscribe);
        });

        // Return a function that calls all unsubscribers
        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }
};
