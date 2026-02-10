/**
 * SPA Router - Main Application Entry Point
 * Handles view switching and navigation for the Chat Application
 */

// Import view functions
import { renderLoginView } from './views/loginView.js';
import { renderDashboardView, updateDashboardSection } from './views/dashboardView.js';
import { renderCreateRoomModal } from './views/createRoomModal.js';
import { renderChatRoomView } from './views/chatRoomView.js';
import { renderPrivateChatView } from './views/privateChatView.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';
import { registerUser, loginUser, logoutUser } from './services/authService.js';
import * as userService from './services/userService.js';
import { createRoom, getRooms, getPublicRooms, joinRoom, getOrCreateDirectMessage } from './services/roomService.js';
import { messageService } from './services/messageService.js';
import { friendService } from './services/friendService.js';
import { renderMessage } from './views/chatRoomView.js';
import { renderJoinRoomModal } from './views/joinRoomModal.js';
import { renderAddFriendModal } from './views/addFriendModal.js';

/**
 * Router Class
 * Manages view navigation and rendering
 */
class Router {
    constructor() {
        this.root = document.getElementById('root');
        this.views = new Map();
        this.currentView = null;
        this.currentViewName = null;
        this.messageUnsubscribe = null;
        
        // Register views
        this.registerView('login', renderLoginView);
        this.registerView('dashboard', renderDashboardView);
        this.registerView('chat', renderChatRoomView);
        
        // Initialize router
        this.init();
    }

    /**
     * Register a view function
     * @param {string} name - View name identifier
     * @param {Function} renderFn - Function that returns HTML string
     */
    registerView(name, renderFn) {
        this.views.set(name, renderFn);
    }

    /**
     * Navigate to a specific view
     * @param {string} viewName - Name of the view to navigate to
     * @param {Object} params - Optional parameters to pass to the view
     */
    navigateTo(viewName, params = {}) {
        const renderFn = this.views.get(viewName);
        
        if (!renderFn) {
            console.error(`View '${viewName}' not found`);
            return;
        }

        // Clean up current view if exists
        if (this.currentView && typeof this.currentView.cleanup === 'function') {
            this.currentView.cleanup();
        }

        // Render new view
        const html = renderFn(params);
        this.root.innerHTML = html;
        
        // Store current view info
        this.currentViewName = viewName;
        this.currentView = {
            name: viewName,
            params: params,
            renderFn: renderFn
        };

        // Attach event listeners for the new view
        this.attachEventListeners(viewName);

        // Update URL hash for bookmarking
        window.location.hash = viewName;

        console.log(`Navigated to: ${viewName}`);
    }

    /**
     * Attach event listeners for the current view
     * @param {string} viewName - Name of the current view
     */
    attachEventListeners(viewName) {
        switch (viewName) {
            case 'login':
                this.attachLoginListeners();
                break;
            case 'dashboard':
                this.attachDashboardListeners();
                break;
            default:
                console.log(`No listeners for view: ${viewName}`);
        }
    }

    /**
     * Attach event listeners for login view
     */
    attachLoginListeners() {
        // Toggle between login and register forms
        const toggleBtn = document.getElementById('auth-toggle-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const isLogin = toggleBtn.dataset.mode === 'login';
                const title = document.getElementById('auth-title');
                const submitBtn = document.getElementById('auth-submit-btn');
                const toggleText = document.getElementById('auth-toggle-text');
                const usernameField = document.getElementById('username-field');
                const usernameInput = document.getElementById('username');

                if (isLogin) {
                    // Switch to register
                    title.textContent = 'Create Account';
                    submitBtn.textContent = 'Register';
                    toggleText.textContent = 'Already have an account?';
                    toggleBtn.textContent = 'Login';
                    toggleBtn.dataset.mode = 'register';
                    usernameField.classList.remove('hidden');
                    if (usernameInput) usernameInput.disabled = false;
                } else {
                    // Switch to login
                    title.textContent = 'Welcome Back';
                    submitBtn.textContent = 'Login';
                    toggleText.textContent = "Don't have an account?";
                    toggleBtn.textContent = 'Register';
                    toggleBtn.dataset.mode = 'login';
                    usernameField.classList.add('hidden');
                    if (usernameInput) usernameInput.disabled = true;
                }
            });
        }

        // Handle form submission
        const authForm = document.getElementById('auth-form');
        if (authForm) {
            authForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const isLogin = toggleBtn.dataset.mode === 'login';
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const username = document.getElementById('username')?.value;
                const submitBtn = document.getElementById('auth-submit-btn');

                // Basic validation
                if (!email || !password) {
                    alert('Please fill in all fields');
                    return;
                }
                
                if (!isLogin && !username) {
                    alert('Please enter a username');
                    return;
                }

                // Show loading state
                const originalBtnText = submitBtn.textContent;
                submitBtn.textContent = 'Processing...';
                submitBtn.disabled = true;

                try {
                    let result;
                    if (isLogin) {
                        console.log('Attempting login...');
                        result = await loginUser(email, password);
                    } else {
                        console.log('Attempting registration...');
                        result = await registerUser(email, password, username);
                    }

                    if (result && result.success) {
                        console.log('Auth successful', result.user);
                        // Manually navigate to dashboard since auth state change listener might be delayed
                        this.navigateTo('dashboard');
                    } else {
                        console.error('Auth error:', result?.error);
                        alert('Auth failed: ' + (result?.error || 'Unknown error'));
                        // Reset button
                        submitBtn.textContent = originalBtnText;
                        submitBtn.disabled = false;
                    }
                } catch (error) {
                    console.error('Unexpected auth error:', error);
                    alert('An unexpected error occurred. Please try again.');
                    // Reset button
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                }
            });
        }
    }

    /**
     * Helper to load data for the active section
     * @param {string} section 
     * @param {string} uid 
     */
    async loadSectionData(section, uid) {
        if (!uid) return [];
        
        switch (section) {
            case 'rooms':
                try {
                    return await getRooms(uid);
                } catch (error) {
                    console.error("Error loading rooms:", error);
                    return [];
                }
            case 'friends':
                try {
                    const friends = await friendService.getFriends(uid);
                    const requests = await friendService.getIncomingRequests(uid);
                    return { friends, requests };
                } catch (error) {
                    console.error("Error loading friends:", error);
                    return { friends: [], requests: [] };
                }
            default:
                return [];
        }
    }

    /**
     * Attach event listeners for dashboard view
     */
    attachDashboardListeners() {
        // Navigation items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', async () => {
                // ... classes handled in updateDashboardSection but let's keep visual feedback instant if needed 
                // Actually updateDashboardSection handles classes too.
                
                const section = item.dataset.section;
                console.log('Switching to section:', section);
                
                try {
                    const uid = window.auth.currentUser?.uid;
                    let user = null;
                    let sectionData = [];

                    if (uid) {
                        user = await userService.getUserById(uid);
                        sectionData = await this.loadSectionData(section, uid);
                    }
                    updateDashboardSection(section, user, sectionData);
                } catch (error) {
                    console.error("Error switching section:", error);
                }
            });
        });

        // Event Delegation for Dynamic Content (Rooms, Friends)
        const dashboardMain = document.querySelector('.dashboard-main');
        if (dashboardMain) {
            dashboardMain.addEventListener('click', async (e) => {
                // Handle Room Click
                const roomItem = e.target.closest('.room-item');
                if (roomItem) {
                    const roomId = roomItem.dataset.roomId;
                    const roomName = roomItem.querySelector('.room-name').textContent;
                    console.log('Opening room:', roomId, roomName);
                    
                    // Navigate to chat view (replacing the dashboard main content or full view?)
                    // Design choice: Layout says Dashboard has sidebar. Chat typically replaces "Main Content".
                    // But our Router replaces "Root".
                    // To keep Sidebar, we have 2 options:
                    // 1. ChatView includes Sidebar (duplicate code).
                    // 2. Chat is a "Section" of Dashboard.
                    // Let's go with Option 2: Render Chat INSIDE Dashboard Main Content.
                    
                    const uid = window.auth.currentUser?.uid;
                    const user = await userService.getUserById(uid);
                    
                    // Mock room object for now (until we fetch full room details)
                    const room = { id: roomId, name: roomName, type: 'public', members: [] }; // We need to fetch this
                    
                    const chatHtml = renderChatRoomView(room, user);
                    const contentEl = document.querySelector('.main-content');
                    if (contentEl) contentEl.innerHTML = chatHtml;
                    
                    // Attach chat listeners (send button, etc)
                    // We might need a separate method for this since we are bypassing the Router for sub-views
                    this.attachChatListeners(roomId, user);
                }

                // Handle Accept Request
                const acceptBtn = e.target.closest('.btn-accept-req');
                if (acceptBtn) {
                    const reqId = acceptBtn.dataset.reqId;
                    const fromId = acceptBtn.dataset.fromId;
                    const btn = acceptBtn;
                    
                    btn.textContent = '...';
                    btn.disabled = true;

                    try {
                        const uid = window.auth.currentUser?.uid;
                        await friendService.acceptFriendRequest(reqId, fromId, uid);
                        
                        // Refresh
                        const friends = await friendService.getFriends(uid);
                        const requests = await friendService.getIncomingRequests(uid);
                        const user = await userService.getUserById(uid);
                        
                        updateDashboardSection('friends', user, { friends, requests });
                         // Re-attach logic for delegation and other elements
                         this.attachDashboardListeners();
                    } catch (err) {
                        console.error("Error accepting request:", err);
                        alert("Failed to accept request.");
                        btn.textContent = 'Accept';
                        btn.disabled = false;
                    }
                }

                // Handle Reject Request
                const rejectBtn = e.target.closest('.btn-reject-req');
                if (rejectBtn) {
                    const reqId = rejectBtn.dataset.reqId;
                    const btn = rejectBtn;
                    
                    btn.textContent = '...';
                    btn.disabled = true;

                    try {
                        await friendService.rejectFriendRequest(reqId);
                        
                        const uid = window.auth.currentUser?.uid;
                        const friends = await friendService.getFriends(uid);
                        const requests = await friendService.getIncomingRequests(uid);
                        const user = await userService.getUserById(uid);
                        
                        updateDashboardSection('friends', user, { friends, requests });
                        this.attachDashboardListeners();
                    } catch (err) {
                        console.error("Error rejecting request:", err);
                        btn.textContent = 'Reject';
                        btn.disabled = false;
                    }
                }

                // Handle Friend Click (Private Chat)
                const friendItem = e.target.closest('.friend-item');
                // Ensure we aren't clicking an action button within the item
                if (friendItem && !e.target.closest('.friend-actions')) {
                    const friendId = friendItem.dataset.friendId;
                    console.log('Opening private chat with:', friendId);

                    try {
                        // Show loading state if needed (or just wait)
                        const contentEl = document.querySelector('.main-content');
                        if (contentEl) contentEl.innerHTML = '<div class="loading-spinner"></div><div style="text-align:center; color:#ccc;">Setting up secure channel...</div>';

                        const uid = window.auth.currentUser?.uid;
                        const user = await userService.getUserById(uid);
                        const friendUser = await userService.getUserById(friendId); // Fetch fresh details

                        if (!user || !friendUser) throw new Error("Could not load user details");

                        const result = await getOrCreateDirectMessage(user, friendUser);
                        if (result.success) {
                            const chatHtml = renderPrivateChatView(result.room, user, friendUser);
                            if (contentEl) contentEl.innerHTML = chatHtml;
                            this.attachChatListeners(result.room.id, user); // Helper to attach listeners
                        } else {
                            throw new Error(result.error);
                        }
                    } catch (err) {
                        console.error("Error opening private chat:", err);
                        alert("Could not open chat: " + err.message);
                    }
                }
            });
        }

        // Settings Form Handling (Event Delegation)
        const dashboardMainForm = document.querySelector('.dashboard-main') || document.body;
        dashboardMainForm.addEventListener('submit', async (e) => {
            if (e.target.id === 'settings-form') {
                e.preventDefault();
                const bio = document.getElementById('settings-bio').value;
                const status = document.getElementById('settings-status').value;
                const saveBtn = document.getElementById('save-settings-btn');
                
                if (saveBtn) {
                     const originalText = saveBtn.textContent;
                     saveBtn.textContent = 'Saving...';
                     saveBtn.disabled = true;

                     try {
                         const uid = window.auth.currentUser?.uid;
                         if (uid) {
                             await userService.updateUserProfile(uid, { bio: bio });
                             await userService.updateUserStatus(uid, status);
                             
                             // Also update local UI elements like status in sidebar if needed
                             // For now, simple alert or toast
                             alert('Profile updated successfully!');
                         }
                     } catch (error) {
                         console.error("Error saving profile:", error);
                         alert('Failed to save profile.');
                     } finally {
                         saveBtn.textContent = originalText;
                         saveBtn.disabled = false;
                     }
                }
            }
        });

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                console.log('Logout clicked');
                // TODO: Implement Firebase logout
                this.navigateTo('login');
            });
        }

        // Create Room Button
        const createRoomBtn = document.getElementById('create-room-btn');
        if (createRoomBtn) {
            createRoomBtn.addEventListener('click', () => {
                console.log('Opening create room modal');
                const modalHtml = renderCreateRoomModal();
                document.body.insertAdjacentHTML('beforeend', modalHtml);
                
                const uid = window.auth.currentUser?.uid;
                if (uid) {
                    this.attachCreateRoomListeners({ uid: uid });
                }
            });
        }

        // Browse Rooms Button
        const browseRoomsBtn = document.getElementById('browse-rooms-btn');
        if (browseRoomsBtn) {
            browseRoomsBtn.addEventListener('click', async () => {
                const uid = window.auth.currentUser?.uid;
                if (!uid) return;
                
                const btn = browseRoomsBtn;
                const originalText = btn.textContent;
                btn.textContent = '...';
                
                try {
                    const publicRooms = await getPublicRooms();
                    document.body.insertAdjacentHTML('beforeend', renderJoinRoomModal(publicRooms, uid));
                    this.attachJoinRoomListeners({ uid: uid });
                } catch (err) {
                    console.error("Error loading public rooms", err);
                } finally {
                    btn.textContent = originalText;
                }
            });
        }
        
        // Add Friend Button
        const addFriendBtn = document.getElementById('add-friend-btn');
        if (addFriendBtn) {
            addFriendBtn.addEventListener('click', () => {
                const uid = window.auth.currentUser?.uid;
                if (!uid) return;
                document.body.insertAdjacentHTML('beforeend', renderAddFriendModal());
                this.attachAddFriendListeners({ uid: uid });
            });
        }

        // Event Delegation for Dynamic Content (Rooms, Friends)
        const roomItems = document.querySelectorAll('.room-item');
        roomItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove active class from all rooms
                roomItems.forEach(r => r.classList.remove('active'));
                // Add active class to clicked room
                item.classList.add('active');
                
                const roomId = item.dataset.roomId;
                console.log('Room selected:', roomId);
                // TODO: Implement room view navigation
            });
        });

        // Friend items
        const friendItems = document.querySelectorAll('.friend-item');
        friendItems.forEach(item => {
            item.addEventListener('click', () => {
                const friendId = item.dataset.friendId;
                console.log('Friend selected:', friendId);
                // TODO: Implement private chat navigation
            });
        });
    }

    /**
     * Attach event listeners for chat view
     * @param {string} roomId 
     * @param {Object} user 
     */
    attachChatListeners(roomId, user) {
        const form = document.getElementById('message-form');
        const input = document.getElementById('message-input');
        const container = document.getElementById('messages-container');

        // 1. Cleanup previous listener if exists
        if (this.messageUnsubscribe) {
            this.messageUnsubscribe();
            this.messageUnsubscribe = null;
        }

        // 2. Subscribe to messages
        this.messageUnsubscribe = messageService.subscribeToMessages(roomId, (messages) => {
            if (!container) return;
            
            // Clear current messages (simple re-render strategy)
            container.innerHTML = '';
            
            // Allow just a bit of flex spacing at top if few messages
            if (messages.length === 0) {
                container.innerHTML = '<div class="no-messages">No messages yet. Start the conversation!</div>';
            }

            messages.forEach(msg => {
                const msgHtml = renderMessage(msg, user.uid);
                container.insertAdjacentHTML('beforeend', msgHtml);
            });

            // Auto-scroll to bottom on new messages
            container.scrollTop = container.scrollHeight;
        });

        // 3. Handle Message Actions via Delegation
        container.addEventListener('click', async (e) => {
            // A. Delete Message
            const deleteBtn = e.target.closest('.btn-delete');
            if (deleteBtn) {
                const messageId = deleteBtn.dataset.messageId;
                if (!messageId) return;

                if (confirm('Are you sure you want to delete this message?')) {
                    try {
                        await messageService.deleteMessage(roomId, messageId);
                    } catch (error) {
                        console.error("Failed to delete message", error);
                    }
                }
                return;
            }

            // B. Open Emoji Picker
            const addReactionBtn = e.target.closest('.btn-add-reaction');
            if (addReactionBtn) {
                const messageId = addReactionBtn.dataset.messageId;
                const picker = document.getElementById(`emoji-picker-${messageId}`);
                if (picker) {
                    const isVisible = picker.style.display === 'block';
                    // Hide all other pickers
                    document.querySelectorAll('.emoji-picker-tooltip').forEach(el => el.style.display = 'none');
                    // Toggle this one
                    picker.style.display = isVisible ? 'none' : 'block';
                }
                return;
            }

            // C. Click on specific emoji (in picker)
            const emojiBtn = e.target.closest('.emoji-btn');
            if (emojiBtn) {
                const messageId = emojiBtn.dataset.messageId;
                const emoji = emojiBtn.dataset.emoji;
                
                try {
                    await messageService.toggleReaction(roomId, messageId, user.uid, emoji);
                    // Hide picker
                    const picker = document.getElementById(`emoji-picker-${messageId}`);
                    if (picker) picker.style.display = 'none';
                } catch (error) {
                    console.error("Failed to add reaction", error);
                }
                return;
            }

            // D. Click on existing reaction (toggle)
            const reactionTag = e.target.closest('.reaction-tag');
            if (reactionTag) {
                const messageId = reactionTag.dataset.messageId;
                const emoji = reactionTag.dataset.emoji;
                
                try {
                    await messageService.toggleReaction(roomId, messageId, user.uid, emoji);
                } catch (error) {
                    console.error("Failed to toggle reaction", error);
                }
                return;
            }
            
            // Close pickers if clicking elsewhere
            if (!e.target.closest('.emoji-picker-tooltip') && !e.target.closest('.btn-add-reaction')) {
                 document.querySelectorAll('.emoji-picker-tooltip').forEach(el => el.style.display = 'none');
            }
        });

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const content = input.value.trim();
                
                if (!content) return;

                // Clear input immediately for better UX
                input.value = '';
                input.style.height = 'auto'; // Reset height
                input.focus();

                try {
                    await messageService.sendMessage(roomId, user.uid, user.username, content);
                    // The onSnapshot listener will handle updating the UI
                } catch (error) {
                    console.error("Failed to send message", error);
                    alert("Failed to send message. Please try again.");
                }
            });

            // Handle Enter key to send (Shift+Enter for newline)
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    form.dispatchEvent(new Event('submit'));
                }
            });
        }
    }

    /**
     * Initialize the router
     */
    init() {
        // Check URL hash for initial view
        const hash = window.location.hash.slice(1) || 'login';
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            const newHash = window.location.hash.slice(1) || 'login';
             // If trying to access protected route while not logged in, redirect will be handled by auth listener
             // But for manual URL changes, `navigateTo` will execute.
             // We can check auth state here too, but the listener is more robust.
            this.navigateTo(newHash);
        });

        // Initialize Auth State Listener
        // We use window.auth which is initialized in index.html
        // We need to wait for it to be available if it's not immediately ready, 
        // but due to module loading order, it should be.
        const auth = window.auth;
        
        if (auth) {
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    console.log("User is signed in:", user.uid);
                    
                    // Fetch full user profile
                    try {
                        let userProfile = await userService.getUserById(user.uid);
                        
                        // Fallback to Auth data if Firestore document is missing
                        if (!userProfile) {
                            console.warn("User profile missing in Firestore, using Auth data fallback.");
                            userProfile = {
                                username: user.displayName || 'User',
                                email: user.email,
                                photoURL: user.photoURL,
                                uid: user.uid
                            };
                        }

                        // User is signed in
                        // Always navigate to dashboard if on login, OR if we are already on dashboard but need to update data
                        if (this.currentViewName === 'login') {
                            this.navigateTo('dashboard', { user: userProfile });
                            // Initial load of rooms if landing on dashboard
                            const rooms = await this.loadSectionData('rooms', user.uid);
                            updateDashboardSection('rooms', userProfile, rooms);
                        } else if (this.currentViewName === 'dashboard') {
                            // If we're already on dashboard, re-render to show correct user info
                            // AND load initial data (rooms)
                            const rooms = await this.loadSectionData('rooms', user.uid);
                            this.navigateTo('dashboard', { user: userProfile, data: rooms }); 
                        }
                    } catch (error) {
                        console.error("Error fetching user profile:", error);
                    }
                } else {
                    console.log("User is signed out");
                    // User is signed out
                    if (this.currentViewName !== 'login') {
                        this.navigateTo('login');
                    }
                }
            });
        } else {
            console.error("Firebase Auth not initialized when Router started");
        }

        // Navigate to initial view
        this.navigateTo(hash);
    }

    /**
     * Attach listeners for create room modal
     * @param {Object} user 
     */
    attachCreateRoomListeners(user) {
        const modal = document.getElementById('create-room-modal');
        const closeBtn = document.getElementById('close-modal-btn');
        const cancelBtn = document.getElementById('cancel-room-btn');
        const form = document.getElementById('create-room-form');

        const closeModal = () => {
             if (modal) modal.remove();
        };

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
        
        // Close on click outside
        if (modal) {
             modal.addEventListener('click', (e) => {
                 if (e.target === modal) closeModal();
             });
        }

        // Handle creation
        if (form) {
             form.addEventListener('submit', async (e) => {
                 e.preventDefault();
                 const nameInput = document.getElementById('room-name');
                 const typeInput = document.querySelector('input[name="room-type"]:checked');
                 const submitBtn = document.getElementById('submit-room-btn');
                 
                 if (!nameInput || !typeInput) return;

                 const name = nameInput.value;
                 const type = typeInput.value;
                 const uid = user.uid;

                 // Loading state
                 const originalText = submitBtn.textContent;
                 submitBtn.textContent = 'Creating...';
                 submitBtn.disabled = true;

                 try {
                     const result = await createRoom(name, uid, type);
                     if (result.success) {
                         console.log('Room created:', result.id);
                         closeModal();
                         alert(`Room "${name}" created successfully!`);
                         
                         // Refresh rooms list immediately
                         const rooms = await this.loadSectionData('rooms', uid);
                         updateDashboardSection('rooms', user, rooms);
                         
                         // Re-attach listeners because content was replaced
                         this.attachDashboardListeners();
                     } else {
                         alert('Failed to create room: ' + result.error);
                     }
                 } catch (error) {
                     console.error("Error creating room:", error);
                     alert('An error occurred.');
                 } finally {
                     if (submitBtn) {
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                     }
                 }
             });
        }
    }

    /**
     * Attach listeners for add friend modal
     * @param {Object} user 
     */
    attachAddFriendListeners(user) {
        const modal = document.getElementById('add-friend-modal');
        const closeBtn = document.getElementById('close-add-friend-btn');
        const form = document.getElementById('add-friend-form');
        const errorEl = document.getElementById('add-friend-error');
        const submitBtn = document.getElementById('send-request-btn');

        const closeModal = () => {
            if (modal) modal.remove();
        };

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const usernameInput = document.getElementById('friend-username');
                if (!usernameInput) return;

                const targetUsername = usernameInput.value.trim();
                const currentUsername = user.username || window.currentUserData?.username;

                if (!targetUsername) return;

                if (targetUsername === currentUsername) {
                    errorEl.textContent = "You cannot add yourself.";
                    errorEl.style.display = 'block';
                    return;
                }

                // Initial UI reset
                errorEl.style.display = 'none';
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Sending...';
                submitBtn.disabled = true;

                try {
                    // Inline query to find user ID by username
                    // This is a bit hacky to do inline but efficient for now
                    const { collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js');
                    const db = window.db; 
                    
                    const usersRef = collection(db, 'users');
                    const q = query(usersRef, where('username', '==', targetUsername));
                    const snapshot = await getDocs(q);

                    if (snapshot.empty) {
                        errorEl.textContent = "User not found.";
                        errorEl.style.display = 'block';
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                        return;
                    }

                    const targetUserDoc = snapshot.docs[0];
                    const targetUserId = targetUserDoc.id;

                    // Send Request
                    const result = await friendService.sendFriendRequest(user.uid, targetUserId);
                    
                    if (result.success) {
                        closeModal();
                        alert(`Friend request sent to ${targetUsername}!`);
                    } else {
                        errorEl.textContent = result.error || "Failed to send request.";
                        errorEl.style.display = 'block';
                    }

                } catch (error) {
                    console.error("Error sending friend request:", error);
                    errorEl.textContent = "An error occurred.";
                    errorEl.style.display = 'block';
                } finally {
                    if (submitBtn && document.body.contains(submitBtn)) { 
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    }
                }
            });
        }
    }

    /**
     * Attach listeners for join room modal
     * @param {Object} user 
     */
    attachJoinRoomListeners(user) {
        const modal = document.getElementById('join-room-modal');
        const closeBtn = document.getElementById('close-join-modal-btn');
        const joinBtns = document.querySelectorAll('.btn-join-room');

        const closeModal = () => {
            if (modal) modal.remove();
        };

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }

        joinBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const roomId = btn.dataset.roomId;
                const originalText = btn.textContent;
                btn.textContent = 'Joining...';
                btn.disabled = true;

                try {
                    await joinRoom(roomId, user.uid);
                    closeModal();
                    // Refresh room list
                    const rooms = await this.loadSectionData('rooms', user.uid);
                    updateDashboardSection('rooms', user, rooms);
                    // Re-attach listeners because content was replaced
                    this.attachDashboardListeners();
                    alert("Joined room successfully!");
                } catch (error) {
                    console.error("Error joining room:", error);
                    alert("Failed to join room.");
                    btn.textContent = originalText;
                    btn.disabled = false;
                }
            });
        });
    }

    /**
     * Get current view name
     * @returns {string} Current view name
     */
    getCurrentView() {
        return this.currentViewName;
    }

    /**
     * Get current view parameters
     * @returns {Object} Current view parameters
     */
    getCurrentParams() {
        return this.currentView?.params || {};
    }
}

// Create global router instance
const router = new Router();

// Make router available globally for debugging
window.router = router;
window.userService = userService;

// Export router for use in other modules
export default router;
