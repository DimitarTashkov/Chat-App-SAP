import { 
    collection, 
    addDoc, 
    serverTimestamp, 
    query, 
    orderBy, 
    onSnapshot,
    limit,
    doc,
    deleteDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

export const messageService = {
    /**
     * Send a message to a specific room
     * @param {string} roomId 
     * @param {string} senderId 
     * @param {string} senderName 
     * @param {string} content 
     */
    async sendMessage(roomId, senderId, senderName, content) {
        try {
            const db = window.db;
            const messagesRef = collection(db, 'rooms', roomId, 'messages');
            await addDoc(messagesRef, {
                content: content,
                senderId: senderId,
                senderName: senderName,
                timestamp: serverTimestamp()
            });
            console.log('Message sent successfully!');
        } catch (error) {
            console.error("Error sending message:", error);
            throw error;
        }
    },

    /**
     * Delete a message
     * @param {string} roomId 
     * @param {string} messageId 
     */
    async deleteMessage(roomId, messageId) {
        try {
            const db = window.db;
            const messageRef = doc(db, 'rooms', roomId, 'messages', messageId);
            await deleteDoc(messageRef);
        } catch (error) {
            console.error("Error deleting message:", error);
            throw error;
        }
    },

    /**
     * Edit a message
     * @param {string} roomId 
     * @param {string} messageId 
     * @param {string} newContent 
     */
    async editMessage(roomId, messageId, newContent) {
        try {
            const db = window.db;
            const messageRef = doc(db, 'rooms', roomId, 'messages', messageId);
            await updateDoc(messageRef, {
                content: newContent,
                isEdited: true, // Optional flag to show (edited) label
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error editing message:", error);
            throw error;
        }
    },

    /**
     * Listen to real-time messages for a room
     * @param {string} roomId 
     * @param {Function} callback function to handle list of messages
     * @returns {Function} unsubscribe function
     */
    subscribeToMessages(roomId, callback) {
        const db = window.db;
        const messagesRef = collection(db, 'rooms', roomId, 'messages');
        
        // Order by timestamp ascending (oldest first) so chat flows naturally
        const q = query(
            messagesRef, 
            orderBy('timestamp', 'asc'),
            limit(100) // Limit to last 100 messages for verification
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messages = [];
            snapshot.forEach((doc) => {
                messages.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            callback(messages);
        }, (error) => {
            console.error("Error getting messages:", error);
            // If we hit an index error (likely due to composite index sorting), 
            // we might handle it here similarly to roomService, 
            // but for a subcollection simple orderBy timestamp it usually works out of box
            // unless composite fields are involved. Simple single field index is usually auto-created.
            if (error.code === 'failed-precondition') {
                console.warn('Index might be missing for messages sorting.');
            }
        });

        return unsubscribe;
    }
};
