/**
 * Render the Create Room Modal
 * @returns {string} HTML string for the modal
 */
export function renderCreateRoomModal() {
    return `
        <div id="create-room-modal" class="modal-overlay">
            <div class="modal-content card">
                <div class="modal-header">
                    <h3>Create New Room</h3>
                    <button id="close-modal-btn" class="btn-ghost">×</button>
                </div>
                <div class="modal-body">
                    <form id="create-room-form">
                        <div style="margin-bottom: 1rem;">
                            <label for="room-name" style="display: block; margin-bottom: 0.5rem;">Room Name</label>
                            <input type="text" id="room-name" required placeholder="e.g. General, Random, Tech Talk">
                        </div>
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; margin-bottom: 0.5rem;">Room Type</label>
                            <div style="display: flex; gap: 1rem;">
                                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                    <input type="radio" name="room-type" value="public" checked> 
                                    <span>Public</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                    <input type="radio" name="room-type" value="private"> 
                                    <span>Private</span>
                                </label>
                            </div>
                        </div>
                        <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 0.5rem;">
                            <button type="button" id="cancel-room-btn" class="btn-secondary">Cancel</button>
                            <button type="submit" id="submit-room-btn" class="btn-primary">Create Room</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}
