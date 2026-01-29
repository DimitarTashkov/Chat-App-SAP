import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';
import { doc, setDoc, serverTimestamp, updateDoc } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js';

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

/**
 * Logs in an existing user using Firebase Auth.
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function loginUser(email, password) {
    try {
        const auth = window.auth;
        const db = window.db;

        if (!auth || !db) {
            throw new Error("Firebase not initialized");
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update user status to 'online' in Firestore
        // We do this in a non-blocking way (fire and forget) or await it if strict sync is needed
        await updateDoc(doc(db, "users", user.uid), {
            status: "online",
            lastSeen: serverTimestamp()
        });

        return { success: true, user: user };
    } catch (error) {
        console.error("Error logging in user:", error);
        
        let errorMessage = "Failed to log in.";
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMessage = "Invalid email or password.";
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = "Too many failed attempts. Please try again later.";
        }

        return { success: false, error: errorMessage };
    }
}

/**
 * Logs out the current user.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function logoutUser() {
    try {
        const auth = window.auth;
        const db = window.db;

        if (!auth || !db) {
            throw new Error("Firebase not initialized");
        }

        const user = auth.currentUser;

        if (user) {
            // Update user status to 'offline' in Firestore
            await updateDoc(doc(db, "users", user.uid), {
                status: "offline",
                lastSeen: serverTimestamp()
            });
        }

        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error("Error logging out:", error);
        return { success: false, error: error.message };
    }
}
