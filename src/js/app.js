/**
 * SPA Router - Main Application Entry Point
 * Handles view switching and navigation for the Chat Application
 */

// Import view functions
import { renderLoginView } from './views/loginView.js';
import { renderDashboardView } from './views/dashboardView.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';
import { registerUser, loginUser, logoutUser } from './services/authService.js';

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
        
        // Register views
        this.registerView('login', renderLoginView);
        this.registerView('dashboard', renderDashboardView);
        
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
     * Attach event listeners for dashboard view
     */
    attachDashboardListeners() {
        // Navigation items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove active class from all items
                navItems.forEach(i => i.classList.remove('active'));
                // Add active class to clicked item
                item.classList.add('active');
                
                const section = item.dataset.section;
                console.log('Dashboard section:', section);
                // TODO: Implement section switching
            });
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

        // Create room button
        const createRoomBtn = document.getElementById('create-room-btn');
        if (createRoomBtn) {
            createRoomBtn.addEventListener('click', () => {
                console.log('Create room clicked');
                // TODO: Implement room creation modal
            });
        }

        // Room items
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
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    console.log("User is signed in:", user.uid);
                    // User is signed in
                    if (this.currentViewName === 'login') {
                        this.navigateTo('dashboard');
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

// Export router for use in other modules
export default router;
