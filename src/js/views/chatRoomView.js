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

    // Render Reactions
    let reactionsHtml = '';
    if (message.reactions) {
        reactionsHtml = `
            <div class="message-reactions" style="
                display: flex; gap: 4px; margin-top: 4px; 
                ${isOwnMessage ? 'justify-content: flex-end;' : 'justify-content: flex-start;'}
            ">
                ${Object.entries(message.reactions).map(([emoji, users]) => `
                    <button class="reaction-tag ${users.includes(currentUserId) ? 'active' : ''}" 
                        data-emoji="${emoji}" 
                        data-message-id="${message.id}"
                        style="
                            background: ${users.includes(currentUserId) ? 'rgba(88, 101, 242, 0.3)' : '#2f3136'};
                            border: 1px solid ${users.includes(currentUserId) ? '#5865f2' : 'transparent'};
                            border-radius: 8px;
                            padding: 2px 6px;
                            cursor: pointer;
                            color: #b9bbbe;
                            font-size: 0.85rem;
                            display: flex; align-items: center; gap: 4px;
                        "
                        title="${users.length} users reacted with ${emoji}"
                    >
                        <span>${emoji}</span>
                        <span style="font-size: 0.75rem;">${users.length}</span>
                    </button>
                `).join('')}
            </div>
        `;
    }

    return `
        <div class="message-item ${isOwnMessage ? 'own-message' : ''}" style="
            display: flex;
            gap: 1rem;
            padding: 0.5rem 0; /* increased padding */
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
            
            <div class="message-content" style="max-width: 70%; position: relative;">
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
                
                ${reactionsHtml}
                
                <!-- Reaction Picker (Hidden by default, shown on hover/click?) -->
                <!-- We will put a small Add Reaction button that appears on hover/click -->
                <div class="reaction-picker-trigger" style="
                    position: absolute;
                    ${isOwnMessage ? 'left: -30px;' : 'right: -30px;'}
                    top: 50%; transform: translateY(-50%);
                    opacity: 0;
                    transition: opacity 0.2s;
                ">
                    <button class="btn-add-reaction" data-message-id="${message.id}" style="
                        background: #2f3136;
                        border: none;
                        border-radius: 50%;
                        width: 24px; height: 24px;
                        cursor: pointer;
                        display: flex; align-items: center; justify-content: center;
                        color: #b9bbbe;
                        font-size: 1rem;
                    " title="Add Reaction">
                        +
                    </button>
                    <!-- Small tooltip popup for picking reaction -->
                    <div class="emoji-picker-tooltip" id="emoji-picker-${message.id}" style="
                        display: none;
                        position: absolute;
                        top: -40px;
                        left: 50%; transform: translateX(-50%);
                        background: #2f3136;
                        padding: 4px;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.5);
                        z-index: 100;
                        white-space: nowrap;
                    ">
                        <span class="emoji-btn" data-emoji="👍" data-message-id="${message.id}" style="cursor:pointer; padding:2px;">👍</span>
                        <span class="emoji-btn" data-emoji="❤️" data-message-id="${message.id}" style="cursor:pointer; padding:2px;">❤️</span>
                        <span class="emoji-btn" data-emoji="😂" data-message-id="${message.id}" style="cursor:pointer; padding:2px;">😂</span>
                        <span class="emoji-btn" data-emoji="😮" data-message-id="${message.id}" style="cursor:pointer; padding:2px;">😮</span>
                        <span class="emoji-btn" data-emoji="😢" data-message-id="${message.id}" style="cursor:pointer; padding:2px;">😢</span>
                        <span class="emoji-btn" data-emoji="😡" data-message-id="${message.id}" style="cursor:pointer; padding:2px;">😡</span>
                    </div>
                </div>
            </div>

            ${isOwnMessage ? `
            <div class="message-actions" style="
                display: flex; 
                flex-direction: column;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.2s;
            ">
                <button class="btn-delete" data-message-id="${message.id}" style="
                    background: none; 
                    border: none; 
                    cursor: pointer; 
                    color: #ed4245; 
                    padding: 4px;
                    font-size: 0.9rem;
                " title="Delete Message">
                    🗑️
                </button>
            </div>
            ` : ''}
            
            <style>
                .message-item:hover .reaction-picker-trigger,
                .message-item:hover .message-actions {
                    opacity: 1 !important;
                }
                .emoji-btn:hover {
                    transform: scale(1.2);
                }
            </style>
        </div>
    `;
}
