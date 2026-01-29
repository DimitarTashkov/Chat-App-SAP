import { createUserWithEmailAndPassword, updateProfile } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';
import { doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js';

/**
 * Registers a new user with Firebase Auth and creates a Firestore document.
 * @param {string} email 
 * @param {string} password 
 * @param {string} username 
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function registerUser(email, password, username) {
    try {
        const auth = window.auth;
        const db = window.db;

        if (!auth || !db) {
            throw new Error("Firebase not initialized");
        }

        // 1. Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Generate a default avatar
        const photoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`;

        // 3. Update the Auth profile with display name and photo
        await updateProfile(user, {
            displayName: username,
            photoURL: photoURL
        });

        // 4. Create the user document in Firestore
        // We use the Auth UID as the document ID for easy lookup
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            username: username,
            email: email,
            photoURL: photoURL,
            bio: "Hey there! I'm using Chat App.",
            status: "online",
            createdAt: serverTimestamp(),
            lastSeen: serverTimestamp()
        });

        return { success: true, user: user };
    } catch (error) {
        console.error("Error registering user:", error);
        
        // Return a user-friendly error message if possible
        let errorMessage = error.message;
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = "This email is already registered.";
        } else if (error.code === 'auth/weak-password') {
            errorMessage = "Password should be at least 6 characters.";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "Please enter a valid email address.";
        }

        return { success: false, error: errorMessage };
    }
}
