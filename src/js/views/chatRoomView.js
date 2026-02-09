/**
 * Chat Room View
 * Renders the chat interface for a specific room
 */

/**
 * Render the chat room view
 * @param {Object} room - Room object { id, name, type, members, ... }
 * @param {Object} currentUser - Current user object
 * @returns {string} HTML string for the chat view
 */
export function renderChatRoomView(room, currentUser) {
    return `
        <div class="chat-container" style="display: flex; flex-direction: column; height: 100%; background-color: #36393f;">
            <!-- Chat Header -->
            <header class="chat-header" style="
                padding: 1rem;
                background-color: #36393f;
                border-bottom: 1px solid #202225;
                box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-shrink: 0;
            ">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="color: #72767d; font-size: 1.5rem; line-height: 1;">${room.type === 'private' ? '🔒' : '#'}</span>
                    <h3 style="color: white; margin: 0; font-size: 1rem;">${room.name}</h3>
                </div>
                <!-- Optional: Room actions like 'Add Member' or 'Leave Room' -->
                <div style="color: #b9bbbe; font-size: 0.875rem;">
                    ${room.members ? room.members.length : 0} Members
                </div>
            </header>

            <!-- Messages Area -->
            <div id="messages-container" class="messages-container" style="
                flex: 1;
                overflow-y: auto;
                padding: 1rem;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            ">
                <!-- Loading State / Empty State -->
                <div style="color: #72767d; text-align: center; margin-top: 2rem;">
                    Loading messages...
                </div>
            </div>

            <!-- Message Input Area -->
            <div class="chat-input-area" style="
                padding: 0 1rem 1.5rem 1rem;
                background-color: #36393f;
                flex-shrink: 0;
            ">
                <div style="
                    background-color: #40444b;
                    border-radius: 8px;
                    padding: 0.75rem;
                ">
                    <form id="message-form" style="display: flex; align-items: flex-end; gap: 0.5rem;">
                        <textarea 
                            id="message-input" 
                            placeholder="Message #${room.name}" 
                            rows="1" 
                            style="
                                flex: 1;
                                background: transparent;
                                border: none;
                                color: #dcddde;
                                resize: none;
                                max-height: 140px;
                                padding: 0.25rem;
                                outline: none;
                                font-family: inherit;
                                line-height: 1.5;
                            "
                        ></textarea>
                        <button type="submit" class="btn-ghost" style="color: #b9bbbe; padding: 0.25rem;">
                            ➤
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render a single message
 * @param {Object} message - Message object
 * @param {string} currentUserId - ID of current user to determine styling
 * @returns {string} HTML string for the message
 */
export function renderMessage(message, currentUserId) {
    const isOwnMessage = message.senderId === currentUserId;
    const date = message.timestamp?.toDate ? message.timestamp.toDate() : new Date();
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
        <div class="message-item ${isOwnMessage ? 'own-message' : ''}" style="
            display: flex;
            gap: 1rem;
            padding: 0.25rem 0;
            ${isOwnMessage ? 'flex-direction: row-reverse;' : ''}
            group
        ">
            <div class="message-avatar" style="
                width: 40px; 
                height: 40px; 
                border-radius: 50%; 
                background-color: #5865f2; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                color: white;
                font-weight: bold;
                flex-shrink: 0;
            ">
                ${message.senderName ? message.senderName.charAt(0).toUpperCase() : '?'}
            </div>
            
            <div class="message-content" style="max-width: 70%;">
                <div style="display: flex; align-items: baseline; gap: 0.5rem; margin-bottom: 0.25rem; ${isOwnMessage ? 'flex-direction: row-reverse;' : ''}">
                    <span style="color: white; font-weight: 500;">
                        ${message.senderName || 'Unknown'}
                    </span>
                    <span style="color: #72767d; font-size: 0.75rem;">
                        ${timeString}
                    </span>
                </div>
                <div style="
                    color: #dcddde; 
                    line-height: 1.5; 
                    white-space: pre-wrap; 
                    word-break: break-word;
                    ${isOwnMessage ? 'text-align: right;' : ''}
                ">
                    ${message.content}
                    ${message.isEdited ? '<span style="font-size: 0.6rem; color: #72767d; margin-left: 4px;">(edited)</span>' : ''}
                </div>
            </div>

            ${isOwnMessage ? `
            <div class="message-actions" style="
                display: flex; 
                align-items: center;
                opacity: 0.7;
            ">
                <button class="btn-delete" data-message-id="${message.id}" style="
                    background: none; 
                    border: none; 
                    cursor: pointer; 
                    color: #ed4245; 
                    padding: 4px;
                    font-size: 0.9rem;
                    transition: opacity 0.2s;
                " title="Delete Message">
                    🗑️
                </button>
            </div>
            ` : ''}
        </div>
    `;
}
