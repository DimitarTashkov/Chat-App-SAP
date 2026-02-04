import { doc, getDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js';

/**
 * Fetches user data from Firestore by User ID.
 * @param {string} userId 
 * @returns {Promise<object|null>} User data object or null if not found
 */
export async function getUserById(userId) {
    try {
        const db = window.db;
        if (!db) throw new Error("Firestore not initialized");

        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data();
        } else {
            console.warn(`User document not found for ID: ${userId}`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
    }
}

/**
 * Updates user profile information in Firestore.
 * @param {string} userId 
 * @param {object} data - Object containing fields to update (e.g. { bio: '...', username: '...' })
 * @returns {Promise<boolean>} True if successful
 */
export async function updateUserProfile(userId, data) {
    try {
        const db = window.db;
        if (!db) throw new Error("Firestore not initialized");

        const userRef = doc(db, "users", userId);
        
        // Add updated timestamp
        const updateData = {
            ...data,
            updatedAt: serverTimestamp()
        };

        await updateDoc(userRef, updateData);
        return true;
    } catch (error) {
        console.error("Error updating user profile:", error);
        return false;
    }
}

/**
 * Updates user status (online/offline/away).
 * @param {string} userId 
 * @param {string} status 
 */
export async function updateUserStatus(userId, status) {
    try {
        const db = window.db;
        if (!db) throw new Error("Firestore not initialized");

        const userRef = doc(db, "users", userId);
        
        await updateDoc(userRef, {
            status: status,
            lastSeen: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating user status:", error);
    }
}
