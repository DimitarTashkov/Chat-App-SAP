/**
 * Render Join Room Modal
 * @param {Array} publicRooms - List of available public rooms
 * @param {string} currentUserId - Current user ID to filter joined status
 */
export function renderJoinRoomModal(publicRooms, currentUserId) {
    const availableRooms = publicRooms.filter(room => !room.members.includes(currentUserId));
    
    return `
        <div id="join-room-modal" class="modal-overlay" style="
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.7); display: flex;
            align-items: center; justify-content: center; z-index: 1000;
        ">
            <div class="modal-content" style="
                background: #36393f; padding: 2rem; border-radius: 8px;
                width: 100%; max-width: 480px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            ">
                <h2 style="color: white; margin-top: 0; margin-bottom: 0.5rem;">Browse Rooms</h2>
                <p style="color: #b9bbbe; margin-bottom: 1.5rem;">Join a public room to start chatting.</p>

                <div class="available-rooms-list" style="
                    max-height: 300px; overflow-y: auto; 
                    margin-bottom: 1.5rem; border: 1px solid #202225;
                    border-radius: 4px; background: #2f3136;
                ">
                    ${availableRooms.length === 0 
                        ? '<div style="padding: 1rem; color: #72767d; text-align: center;">No new rooms to join.</div>' 
                        : availableRooms.map(room => `
                            <div class="room-row" style="
                                display: flex; align-items: center; justify-content: space-between;
                                padding: 0.75rem 1rem; border-bottom: 1px solid #202225;
                            ">
                                <div style="display: flex; align-items: center; gap: 0.5rem; overflow: hidden;">
                                    <span style="color: #72767d; font-size: 1.25rem;">#</span>
                                    <div style="display: flex; flex-direction: column;">
                                        <span style="color: white; font-weight: 500;">${room.name}</span>
                                        <span style="color: #b9bbbe; font-size: 0.75rem;">${room.members.length} members</span>
                                    </div>
                                </div>
                                <button class="btn-primary btn-join-room" 
                                    data-room-id="${room.id}"
                                    style="padding: 0.25rem 0.75rem; font-size: 0.8rem;"
                                >
                                    Join
                                </button>
                            </div>
                        `).join('')
                    }
                </div>

                <div style="display: flex; justify-content: flex-end;">
                    <button id="close-join-modal-btn" class="btn-ghost" style="color: white;">Close</button>
                </div>
            </div>
        </div>
    `;
}
