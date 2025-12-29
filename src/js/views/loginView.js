/**
 * Login/Register View
 * Renders the authentication form for login and registration
 */

/**
 * Render the login/register view
 * @param {Object} params - Optional parameters (e.g., mode: 'login' | 'register')
 * @returns {string} HTML string for the login view
 */
export function renderLoginView(params = {}) {
    const mode = params.mode || 'login';
    const isLogin = mode === 'login';

    return `
        <div class="auth-container">
            <div class="card auth-card">
                <h1 class="auth-title" id="auth-title">
                    ${isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>
                
                <form id="auth-form" class="auth-form">
                    <!-- Username field (only for registration) -->
                    <div id="username-field" class="${isLogin ? 'hidden' : ''}">
                        <label for="username" style="color: #b9bbbe; font-size: 0.875rem; margin-bottom: 0.25rem; display: block;">
                            Username
                        </label>
                        <input 
                            type="text" 
                            id="username" 
                            name="username" 
                            placeholder="Choose a username"
                            autocomplete="username"
                            ${isLogin ? 'disabled' : ''}
                        >
                    </div>

                    <!-- Email field -->
                    <div>
                        <label for="email" style="color: #b9bbbe; font-size: 0.875rem; margin-bottom: 0.25rem; display: block;">
                            Email
                        </label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            placeholder="name@example.com"
                            autocomplete="email"
                            required
                        >
                    </div>

                    <!-- Password field -->
                    <div>
                        <label for="password" style="color: #b9bbbe; font-size: 0.875rem; margin-bottom: 0.25rem; display: block;">
                            Password
                        </label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            placeholder="${isLogin ? 'Enter your password' : 'Create a password'}"
                            autocomplete="${isLogin ? 'current-password' : 'new-password'}"
                            required
                            minlength="6"
                        >
                    </div>

                    <!-- Submit button -->
                    <button type="submit" id="auth-submit-btn" class="btn-primary">
                        ${isLogin ? 'Login' : 'Register'}
                    </button>
                </form>

                <!-- Toggle between login and register -->
                <div class="auth-toggle">
                    <span id="auth-toggle-text">
                        ${isLogin ? "Don't have an account?" : 'Already have an account?'}
                    </span>
                    <button 
                        type="button" 
                        id="auth-toggle-btn" 
                        class="btn-ghost"
                        data-mode="${isLogin ? 'login' : 'register'}"
                        style="margin-left: 0.5rem;"
                    >
                        ${isLogin ? 'Register' : 'Login'}
                    </button>
                </div>

                <!-- Error message container -->
                <div id="auth-error" style="display: none; margin-top: 1rem; padding: 0.75rem; background-color: #ed4245; color: white; border-radius: 4px; font-size: 0.875rem;">
                </div>

                <!-- Success message container -->
                <div id="auth-success" style="display: none; margin-top: 1rem; padding: 0.75rem; background-color: #43b581; color: white; border-radius: 4px; font-size: 0.875rem;">
                </div>
            </div>
        </div>
    `;
}

/**
 * Show an error message in the auth form
 * @param {string} message - Error message to display
 */
export function showAuthError(message) {
    const errorEl = document.getElementById('auth-error');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorEl.style.display = 'none';
        }, 5000);
    }
}

/**
 * Show a success message in the auth form
 * @param {string} message - Success message to display
 */
export function showAuthSuccess(message) {
    const successEl = document.getElementById('auth-success');
    if (successEl) {
        successEl.textContent = message;
        successEl.style.display = 'block';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            successEl.style.display = 'none';
        }, 3000);
    }
}

/**
 * Clear all auth messages
 */
export function clearAuthMessages() {
    const errorEl = document.getElementById('auth-error');
    const successEl = document.getElementById('auth-success');
    
    if (errorEl) {
        errorEl.style.display = 'none';
        errorEl.textContent = '';
    }
    
    if (successEl) {
        successEl.style.display = 'none';
        successEl.textContent = '';
    }
}

/**
 * Get form data from the auth form
 * @returns {Object} Form data object
 */
export function getAuthFormData() {
    const email = document.getElementById('email')?.value || '';
    const password = document.getElementById('password')?.value || '';
    const username = document.getElementById('username')?.value || '';
    
    return {
        email,
        password,
        username
    };
}

/**
 * Validate auth form data
 * @param {Object} data - Form data to validate
 * @param {string} mode - 'login' or 'register'
 * @returns {Object} Validation result { valid: boolean, errors: string[] }
 */
export function validateAuthForm(data, mode = 'login') {
    const errors = [];
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email) {
        errors.push('Email is required');
    } else if (!emailRegex.test(data.email)) {
        errors.push('Please enter a valid email address');
    }
    
    // Password validation
    if (!data.password) {
        errors.push('Password is required');
    } else if (data.password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }
    
    // Username validation (only for registration)
    if (mode === 'register') {
        if (!data.username) {
            errors.push('Username is required');
        } else if (data.username.length < 3) {
            errors.push('Username must be at least 3 characters');
        } else if (data.username.length > 20) {
            errors.push('Username must be less than 20 characters');
        } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
            errors.push('Username can only contain letters, numbers, and underscores');
        }
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Reset the auth form
 */
export function resetAuthForm() {
    const form = document.getElementById('auth-form');
    if (form) {
        form.reset();
    }
    clearAuthMessages();
}
