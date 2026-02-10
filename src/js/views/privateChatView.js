import { renderChatRoomView } from './chatRoomView.js';

/**
 * Renders the Private Chat View
 * wrapper around the generic Chat Room View but adapts the room name/details for 1-1 context
 * 
 * @param {Object} room - The DM Room object
 * @param {Object} currentUser - The current authenticated user
 * @param {Object} otherUser - The friend details { id, username, status... }
 * @returns {string} HTML content
 */
export function renderPrivateChatView(room, currentUser, otherUser) {
    // Create a display-friendly version of the room
    // The room name should be the Friend's name
    const displayRoom = {
        ...room,
        name: otherUser.username,
        type: 'private' // This triggers the Lock icon in the view
    };

    return renderChatRoomView(displayRoom, currentUser);
}
