import { 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs, 
    doc, 
    updateDoc, 
    arrayUnion, 
    arrayRemove,
    serverTimestamp,
    orderBy
} from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js';

/**
 * Creates a new chat room.
 * @param {string} name - Room name
 * @param {string} createdBy - User ID of creator
 * @param {string} type - 'public' or 'private'
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export async function createRoom(name, createdBy, type = 'public') {
    try {
        const db = window.db;
        if (!db) throw new Error("Firestore not initialized");

        const roomData = {
            name: name,
            type: type,
            createdBy: createdBy,
            createdAt: serverTimestamp(),
            members: [createdBy], // Creator is automatically a member
            recentMessage: {
                content: 'Room created',
                timestamp: serverTimestamp(),
                sentBy: 'system'
            }
        };

        const docRef = await addDoc(collection(db, "rooms"), roomData);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error creating room:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Fetches rooms where the user is a member.
 * @param {string} userId 
 * @returns {Promise<Array>} Array of room objects including their IDs
 */
export async function getRooms(userId) {
    try {
        const db = window.db;
        if (!db) throw new Error("Firestore not initialized");

        const roomsRef = collection(db, "rooms");
        // Query rooms where 'members' array contains userId
        const q = query(
            roomsRef, 
            where("members", "array-contains", userId),
            orderBy("recentMessage.timestamp", "desc") // Sort by most recent activity
        );

        const querySnapshot = await getDocs(q);
        const rooms = [];
        querySnapshot.forEach((doc) => {
            rooms.push({ id: doc.id, ...doc.data() });
        });

        return rooms;
    } catch (error) {
        // If index is missing for array-contains + orderBy, it might fail. 
        // We might need to handle that or fallback to client-side sorting.
        console.error("Error fetching rooms:", error);
        
        // Fallback: try without sorting if index error occurs
        if (error.code === 'failed-precondition') {
             console.warn("Index missing for sorting. Fetching unsorted.");
             // Simplified query without sort
             const qSimple = query(roomsRef, where("members", "array-contains", userId));
             const snapshot = await getDocs(qSimple);
             const roomsSimple = [];
             snapshot.forEach((doc) => {
                 roomsSimple.push({ id: doc.id, ...doc.data() });
             });
             return roomsSimple;
        }
        
        return [];
    }
}

/**
 * Fetches all public rooms (excluding joined ones if needed)
 * @returns {Promise<Array>}
 */
export async function getPublicRooms() {
    try {
        const db = window.db;
        const roomsRef = collection(db, "rooms");
        const q = query(
            roomsRef, 
            where("type", "==", "public"),
            orderBy("name")
        );
        
        const querySnapshot = await getDocs(q);
        const rooms = [];
        querySnapshot.forEach((doc) => {
            rooms.push({ id: doc.id, ...doc.data() });
        });
        
        return rooms;
    } catch (error) {
        console.error("Error fetching public rooms:", error);
        if (error.code === 'failed-precondition') {
            // Fallback for missing index
             const db = window.db;
             const roomsRef = collection(db, "rooms");
             const q = query(roomsRef, where("type", "==", "public"));
             const querySnapshot = await getDocs(q);
             const rooms = [];
             querySnapshot.forEach((doc) => {
                 rooms.push({ id: doc.id, ...doc.data() });
             });
             return rooms;
        }
        return [];
    }
}

/**
 * Adds a user to a room.
 * @param {string} roomId 
 * @param {string} userId 
 * @returns {Promise<boolean>}
 */
export async function joinRoom(roomId, userId) {
    try {
        const db = window.db;
        const roomRef = doc(db, "rooms", roomId);

        await updateDoc(roomRef, {
            members: arrayUnion(userId)
        });
        return true;
    } catch (error) {
        console.error("Error joining room:", error);
        return false;
    }
}

/**
 * Removes a user from a room.
 * @param {string} roomId 
 * @param {string} userId 
 * @returns {Promise<boolean>}
 */
export async function leaveRoom(roomId, userId) {
    try {
        const db = window.db;
        const roomRef = doc(db, "rooms", roomId);

        await updateDoc(roomRef, {
            members: arrayRemove(userId)
        });
        return true;
    } catch (error) {
        console.error("Error leaving room:", error);
        return false;
    }
}
