import { 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc,
    serverTimestamp,
    getDoc,
    setDoc
} from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js';

export const friendService = {
    /**
     * Send a friend request
     * @param {string} fromUserId - Sender's User ID
     * @param {string} toUserId - Recipient's User ID
     */
    async sendFriendRequest(fromUserId, toUserId) {
        const db = window.db;
        if (!db) throw new Error("Firestore not initialized");

        if (fromUserId === toUserId) {
            throw new Error("Cannot send friend request to yourself");
        }

        try {
            // 1. Check if request already exists (pending or accepted)
            const requestsRef = collection(db, 'friendRequests');
            const q = query(
                requestsRef, 
                where('from', '==', fromUserId), 
                where('to', '==', toUserId) // We could also check reverse direction if we want to auto-accept
            );
            const snapshot = await getDocs(q);
            
            if (!snapshot.empty) {
                // Check status
                const existing = snapshot.docs[0].data();
                if (existing.status === 'pending') throw new Error("Request already pending");
                if (existing.status === 'accepted') throw new Error("Already friends");
            }

            // 2. Check if already friends in users collection (redundancy check)
            const friendRef = doc(db, 'users', fromUserId, 'friends', toUserId);
            const friendSnap = await getDoc(friendRef);
            if (friendSnap.exists()) {
                throw new Error("Already friends");
            }

            // 3. Create Request
            // Fetch sender details to embed (Denormalization)
            const senderRef = doc(db, 'users', fromUserId);
            let senderData = {};
            try {
                const senderSnap = await getDoc(senderRef);
                if (senderSnap.exists()) senderData = senderSnap.data();
            } catch (e) {
                console.warn("Could not fetch sender details:", e);
            }

            await addDoc(requestsRef, {
                from: fromUserId,
                to: toUserId,
                senderUsername: senderData.username || 'Unknown',
                senderEmail: senderData.email || '',
                status: 'pending',
                timestamp: serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            console.error("Error sending friend request:", error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get pending Friend Requests for a user
     * @param {string} userId 
     */
    async getIncomingRequests(userId) {
        const db = window.db;
        if (!db) return [];

        try {
            const requestsRef = collection(db, 'friendRequests');
            const q = query(
                requestsRef, 
                where('to', '==', userId), 
                where('status', '==', 'pending')
            );
            
            const snapshot = await getDocs(q);
            const requests = [];
            
            for (const docSnap of snapshot.docs) {
                const reqData = docSnap.data();
                
                // Use embedded data if available, else fetch
                let senderData = { 
                    username: reqData.senderUsername || 'Unknown',
                    email: reqData.senderEmail || ''
                };

                if (!reqData.senderUsername) {
                    try {
                        const senderRef = doc(db, 'users', reqData.from);
                        const senderSnap = await getDoc(senderRef);
                        if (senderSnap.exists()) {
                            senderData = senderSnap.data();
                        }
                    } catch (e) {
                         console.warn("Could not fetch sender profile:", e);
                    }
                }

                requests.push({
                    id: docSnap.id,
                    ...reqData,
                    sender: senderData
                });
            }
            
            return requests;
        } catch (error) {
            console.error("Error fetching requests:", error);
            if (error.code === 'failed-precondition') return [];
            throw error;
        }
    },

    /**
     * Accept a friend request
     * @param {string} requestId 
     * @param {string} fromUserId - The user who sent the request
     * @param {string} toUserId - The user who is accepting (current user)
     */
    async acceptFriendRequest(requestId, fromUserId, toUserId) {
        const db = window.db;
        if (!db) throw new Error("Firestore not initialized");

        try {
            // 1. Update request status
            const requestRef = doc(db, 'friendRequests', requestId);
            await updateDoc(requestRef, { status: 'accepted' });

            // Fetch details for denormalization
            let toUserData = { username: 'Friend' }; // Defaults
            let fromUserData = { username: 'Friend' };

            // Fetch 'toUser' (Current User) - Should succeed
            try {
                const toUserSnap = await getDoc(doc(db, 'users', toUserId));
                if (toUserSnap.exists()) toUserData = toUserSnap.data();
            } catch (e) { console.warn("Could not fetch own profile:", e); }

            // Fetch 'fromUser' (Sender) or use existing knowledge if passed? 
            // We'll try to fetch.
            try {
                const fromUserSnap = await getDoc(doc(db, 'users', fromUserId));
                if (fromUserSnap.exists()) fromUserData = fromUserSnap.data();
            } catch (e) { 
                console.warn("Could not fetch sender profile for friend doc:", e);
                // Maybe we can get it from the request doc if we read it? 
                // But we don't have it here. rely on fallback.
            }

            // 2. Add to both users' friends subcollection
            const user1FriendRef = doc(db, 'users', toUserId, 'friends', fromUserId);
            const user2FriendRef = doc(db, 'users', fromUserId, 'friends', toUserId);

            const friendDataForUser1 = { // Stored in toUser's list (User1 is toUser)
                since: serverTimestamp(),
                username: fromUserData.username,
                email: fromUserData.email,
                avatar: fromUserData.avatar || null
            };
            
            const friendDataForUser2 = { // Stored in fromUser's list
                since: serverTimestamp(),
                username: toUserData.username,
                email: toUserData.email,
                avatar: toUserData.avatar || null
            };

            // Write own friend list (Should succeed)
            await setDoc(user1FriendRef, friendDataForUser1);

            // Write other's friend list (Might fail due to permissions)
            try {
                await setDoc(user2FriendRef, friendDataForUser2);
            } catch (e) {
                console.warn("Could not update other user's friend list (Permission issue likely):", e);
                // This implies the other user won't see us in their list immediately.
            }

            return { success: true };
        } catch (error) {
            console.error("Error accepting request:", error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Reject a friend request
     * @param {string} requestId 
     */
    async rejectFriendRequest(requestId) {
        const db = window.db;
        if (!db) throw new Error("Firestore not initialized");

        try {
            const requestRef = doc(db, 'friendRequests', requestId);
            await updateDoc(requestRef, { status: 'rejected' });
            // Or deleteDoc(requestRef) if we don't want history
            return { success: true };
        } catch (error) {
            console.error("Error rejecting request:", error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get list of friends for a user
     * @param {string} userId 
     */
    async getFriends(userId) {
        const db = window.db;
        if (!db) return [];

        try {
            const friendsRef = collection(db, 'users', userId, 'friends');
            const snapshot = await getDocs(friendsRef);
            
            const friendsPromise = snapshot.docs.map(async (docSnap) => {
                const friendId = docSnap.id;
                const denormalizedData = docSnap.data();

                // Always try to fetch fresh status/profile from the main Users collection
                try {
                    const friendProfileRef = doc(db, 'users', friendId);
                    const friendProfileSnap = await getDoc(friendProfileRef);
                    
                    if (friendProfileSnap.exists()) {
                         const profileData = friendProfileSnap.data();
                         return {
                             id: friendId,
                             ...denormalizedData, // Keep local notes/timestamps if we have them
                             ...profileData,      // Overwrite with live data (status, new avatar, etc)
                             // Ensure we don't overwrite the friendship 'since' timestamp with user 'createdAt'
                             since: denormalizedData.since || profileData.createdAt
                         };
                    }
                } catch (e) {
                    console.warn(`Could not fetch live profile for ${friendId}`, e);
                }

                // Fallback to denormalized data if fetch fails
                return {
                    id: friendId,
                    username: 'Unknown User',
                    status: 'offline', // Default to offline if we can't reach them
                    ...denormalizedData
                };
            });

            const friends = await Promise.all(friendsPromise);
            return friends;
        } catch (error) {
            console.error("Error fetching friends:", error);
            if (error.code === 'permission-denied') {
                console.error("ACTION REQUIRED: Update Firestore Security Rules to allow access to 'users/{id}/friends'. See firestore.rules file.");
            }
            return [];
        }
    }
};
