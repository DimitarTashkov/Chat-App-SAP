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
            await addDoc(requestsRef, {
                from: fromUserId,
                to: toUserId,
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
                // Fetch sender info for display
                const senderRef = doc(db, 'users', reqData.from);
                const senderSnap = await getDoc(senderRef);
                const senderData = senderSnap.exists() ? senderSnap.data() : { username: 'Unknown' };

                requests.push({
                    id: docSnap.id,
                    ...reqData,
                    sender: senderData
                });
            }
            
            return requests;
        } catch (error) {
            console.error("Error fetching requests:", error);
            // Fallback for missing index if any
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

            // 2. Add to both users' friends subcollection
            const user1FriendRef = doc(db, 'users', toUserId, 'friends', fromUserId);
            const user2FriendRef = doc(db, 'users', fromUserId, 'friends', toUserId);

            // Fetch basic info to store in friend doc (snapshot)
            // or just store timestamp and fetch detail on load. 
            // Storing basic detail helps prevent N+1 queries later but needs syncing.
            // Let's just store timestamp for now and ID is key.
            const friendData = { since: serverTimestamp() };

            await setDoc(user1FriendRef, friendData);
            await setDoc(user2FriendRef, friendData);

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
            
            const friends = [];
            for (const docSnap of snapshot.docs) {
                const friendId = docSnap.id;
                // Fetch full friend profile
                const friendProfileRef = doc(db, 'users', friendId);
                const friendProfileSnap = await getDoc(friendProfileRef);
                
                if (friendProfileSnap.exists()) {
                    friends.push({
                        id: friendId,
                        ...friendProfileSnap.data()
                    });
                }
            }
            return friends;
        } catch (error) {
            console.error("Error fetching friends:", error);
            return [];
        }
    }
};
