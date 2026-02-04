/**
 * Dashboard View
 * Renders the main dashboard with sidebar navigation and content area
 */

/**
 * Render the dashboard view
 * @param {Object} params - Optional parameters (e.g., activeSection: 'rooms' | 'friends')
 * @returns {string} HTML string for the dashboard view
 */
export function renderDashboardView(params = {}) {
    const activeSection = params.activeSection || 'rooms';
    const user = params.user || { username: 'User', email: 'user@example.com' };

    return `
        <div class="dashboard-container">
            <!-- Sidebar -->
            <aside class="dashboard-sidebar">
                <!-- Sidebar Header -->
                <div class="sidebar-header">
                    <h2 style="color: white; font-size: 1.25rem; margin: 0;">Chat App</h2>
                </div>

                <!-- Navigation -->
                <nav class="sidebar-nav">
                    <div class="nav-item ${activeSection === 'rooms' ? 'active' : ''}" data-section="rooms">
                        <span class="nav-item-icon">#</span>
                        <span>Rooms</span>
                    </div>
                    <div class="nav-item ${activeSection === 'friends' ? 'active' : ''}" data-section="friends">
                        <span class="nav-item-icon">@</span>
                        <span>Friends</span>
                    </div>
                    <div class="nav-item ${activeSection === 'settings' ? 'active' : ''}" data-section="settings">
                        <span class="nav-item-icon">⚙</span>
                        <span>Settings</span>
                    </div>
                </nav>

                <!-- User Profile -->
                <div class="sidebar-footer">
                    <div class="user-profile">
                        <div class="user-avatar">
                            ${user.photoURL 
                                ? `<img src="${user.photoURL}" alt="${user.username}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` 
                                : user.username.charAt(0).toUpperCase()}
                        </div>
                        <div class="user-info">
                            <div class="user-name">${user.username}</div>
                            <div class="user-status">Online</div>
                        </div>
                        <button id="logout-btn" class="btn-ghost" style="padding: 0.5rem;" title="Logout">
                            🚪
                        </button>
                    </div>
                </div>
            </aside>

            <!-- Main Content Area -->
            <main class="dashboard-main">
                <!-- Header -->
                <header class="main-header">
                    <h3 style="color: white; margin: 0;">
                        ${activeSection === 'rooms' ? 'Rooms' : activeSection === 'friends' ? 'Friends' : 'Settings'}
                    </h3>
                    ${activeSection === 'rooms' ? `
                        <button id="create-room-btn" class="btn-primary">
                            + Create Room
                        </button>
                    ` : ''}
                </header>

                <!-- Content -->
                <div class="main-content">
                    ${renderDashboardContent(activeSection, user)}
                </div>
            </main>
        </div>
    `;
}

/**
 * Render the dashboard content based on active section
 * @param {string} section - Active section name
 * @param {Object} user - User object
 * @returns {string} HTML string for the content
 */
function renderDashboardContent(section, user) {
    switch (section) {
        case 'rooms':
            return renderRoomsContent();
        case 'friends':
            return renderFriendsContent();
        case 'settings':
            return renderSettingsContent(user);
        default:
            return renderRoomsContent();
    }
}

/**
 * Render rooms content
 * @returns {string} HTML string for rooms section
 */
function renderRoomsContent() {
    return `
        <div class="room-list">
            <!-- Sample room items -->
            <div class="room-item" data-room-id="room1">
                <span class="room-name"># general</span>
                <span class="room-unread">3</span>
            </div>
            <div class="room-item" data-room-id="room2">
                <span class="room-name"># random</span>
            </div>
            <div class="room-item" data-room-id="room3">
                <span class="room-name"># announcements</span>
                <span class="room-unread">1</span>
            </div>
        </div>
    `;
}

/**
 * Render friends content
 * @returns {string} HTML string for friends section
 */
function renderFriendsContent() {
    return `
        <div class="friend-list">
            <!-- Online friends -->
            <div style="color: #b9bbbe; font-size: 0.875rem; margin-bottom: 0.5rem; padding: 0 0.5rem;">
                ONLINE — 2
            </div>
            <div class="friend-item" data-friend-id="friend1">
                <div class="friend-avatar">A</div>
                <div class="friend-info">
                    <div class="friend-name">Alice</div>
                    <div class="friend-status status-online">Online</div>
                </div>
            </div>
            <div class="friend-item" data-friend-id="friend2">
                <div class="friend-avatar">B</div>
                <div class="friend-info">
                    <div class="friend-name">Bob</div>
                    <div class="friend-status status-online">Online</div>
                </div>
            </div>

            <!-- Offline friends -->
            <div style="color: #b9bbbe; font-size: 0.875rem; margin: 1rem 0 0.5rem 0; padding: 0 0.5rem;">
                OFFLINE — 1
            </div>
            <div class="friend-item" data-friend-id="friend3">
                <div class="friend-avatar" style="background-color: #747f8d;">C</div>
                <div class="friend-info">
                    <div class="friend-name">Charlie</div>
                    <div class="friend-status status-offline">Offline</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render settings content
 * @param {Object} user - User object
 * @returns {string} HTML string for settings section
 */
function renderSettingsContent(user) {
    if (!user) user = { username: '', email: '', bio: '', status: 'online' };
    
    return `
        <div class="card" style="max-width: 600px;">
            <h3 style="color: white; margin-bottom: 1.5rem;">Account Settings</h3>
            
            <form id="settings-form" style="display: flex; flex-direction: column; gap: 1rem;">
                <div>
                    <label for="settings-username" style="color: #b9bbbe; font-size: 0.875rem; margin-bottom: 0.25rem; display: block;">
                        Username
                    </label>
                    <input type="text" id="settings-username" value="${user.username || ''}" disabled style="cursor: not-allowed; opacity: 0.7;">
                    <small style="color: #72767d; font-size: 0.75rem;">Username cannot be changed currently.</small>
                </div>
                
                <div>
                    <label for="settings-email" style="color: #b9bbbe; font-size: 0.875rem; margin-bottom: 0.25rem; display: block;">
                        Email
                    </label>
                    <input type="email" id="settings-email" value="${user.email || ''}" disabled style="cursor: not-allowed; opacity: 0.7;">
                </div>

                <div>
                    <label for="settings-bio" style="color: #b9bbbe; font-size: 0.875rem; margin-bottom: 0.25rem; display: block;">
                        Bio
                    </label>
                    <textarea id="settings-bio" rows="3" placeholder="Tell us about yourself" style="width: 100%; padding: 10px; background-color: #202225; color: #dcddde; border: 1px solid #202225; border-radius: 4px;">${user.bio || ''}</textarea>
                </div>

                <div>
                    <label for="settings-status" style="color: #b9bbbe; font-size: 0.875rem; margin-bottom: 0.25rem; display: block;">
                        Status
                    </label>
                    <select id="settings-status" style="width: 100%; padding: 10px; background-color: #202225; color: #dcddde; border: 1px solid #202225; border-radius: 4px;">
                        <option value="online" ${user.status === 'online' ? 'selected' : ''}>Online</option>
                        <option value="away" ${user.status === 'away' ? 'selected' : ''}>Away</option>
                        <option value="dnd" ${user.status === 'dnd' ? 'selected' : ''}>Do Not Disturb</option>
                        <option value="offline" ${user.status === 'offline' ? 'selected' : ''}>Invisible</option>
                    </select>
                </div>

                <div style="margin-top: 1rem; display: flex; gap: 1rem;">
                    <button type="submit" class="btn-primary" id="save-settings-btn">
                        Save Changes
                    </button>
                    <!-- Future: Change Password Button -->
                </div>
            </form>
        </div>
    `;
}

/**
 * Update the dashboard content without re-rendering the entire view
 * @param {string} section - Section to update
 * @param {Object} user - User object
 */
export function updateDashboardSection(section, user) {
    const contentEl = document.querySelector('.main-content');
    const headerTitle = document.querySelector('.main-header h3');
    const createRoomBtn = document.getElementById('create-room-btn');

    if (contentEl) {
        contentEl.innerHTML = renderDashboardContent(section, user);
    }

    if (headerTitle) {
        headerTitle.textContent = section === 'rooms' ? 'Rooms' : section === 'friends' ? 'Friends' : 'Settings';
    }

    // Show/hide create room button based on section
    if (createRoomBtn) {
        if (section === 'rooms') {
            createRoomBtn.style.display = 'block';
        } else {
            createRoomBtn.style.display = 'none';
        }
    }

    // Update active nav item
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.dataset.section === section) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Re-attach event listeners for the new content
    attachDashboardContentListeners(section);
}

/**
 * Attach event listeners for dashboard content
 * @param {string} section - Current section
 */
function attachDashboardContentListeners(section) {
    if (section === 'rooms') {
        const roomItems = document.querySelectorAll('.room-item');
        roomItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove active class from all rooms
                roomItems.forEach(r => r.classList.remove('active'));
                // Add active class to clicked room
                item.classList.add('active');
                
                const roomId = item.dataset.roomId;
                console.log('Room selected:', roomId);
                // TODO: Navigate to room view
            });
        });
    } else if (section === 'friends') {
        const friendItems = document.querySelectorAll('.friend-item');
        friendItems.forEach(item => {
            item.addEventListener('click', () => {
                const friendId = item.dataset.friendId;
                console.log('Friend selected:', friendId);
                // TODO: Navigate to private chat view
            });
        });
    }
}

/**
 * Update user profile in sidebar
 * @param {Object} user - User object with username and email
 */
export function updateUserProfile(user) {
    const avatarEl = document.querySelector('.user-avatar');
    const nameEl = document.querySelector('.user-name');
    const statusEl = document.querySelector('.user-status');

    if (avatarEl && user.username) {
        avatarEl.textContent = user.username.charAt(0).toUpperCase();
    }

    if (nameEl && user.username) {
        nameEl.textContent = user.username;
    }

    if (statusEl) {
        statusEl.textContent = user.status || 'Online';
    }
}

/**
 * Update user online status
 * @param {string} status - Status ('online', 'offline', 'away')
 */
export function updateUserStatus(status) {
    const statusEl = document.querySelector('.user-status');
    if (statusEl) {
        statusEl.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        statusEl.className = 'user-status';
        
        if (status === 'online') {
            statusEl.classList.add('status-online');
        } else if (status === 'offline') {
            statusEl.classList.add('status-offline');
        }
    }
}
