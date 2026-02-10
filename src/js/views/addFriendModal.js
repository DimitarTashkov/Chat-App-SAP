/**
 * Render Add Friend Modal
 */
export function renderAddFriendModal() {
    return `
        <div id="add-friend-modal" class="modal-overlay" style="
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.7); display: flex;
            align-items: center; justify-content: center; z-index: 1000;
        ">
            <div class="modal-content" style="
                background: #36393f; padding: 2rem; border-radius: 8px;
                width: 100%; max-width: 440px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            ">
                <h2 style="color: white; margin-top: 0; margin-bottom: 0.5rem; text-align: center;">ADD FRIEND</h2>
                <p style="color: #b9bbbe; margin-bottom: 1.5rem; text-align: center; font-size: 0.9rem;">
                    You can add friends with their exact username.
                </p>

                <form id="add-friend-form">
                    <div class="form-group" style="margin-bottom: 1.5rem;">
                        <div style="
                             background: #202225; border: 1px solid #202225; 
                             border-radius: 8px; padding: 0.5rem 1rem;
                             display: flex; align-items: center;
                        ">
                            <input type="text" id="friend-username" placeholder="Enter a Username#0000" required style="
                                background: transparent; border: none; color: white;
                                width: 100%; padding: 0.5rem 0; outline: none;
                            ">
                        </div>
                        <p id="add-friend-error" style="color: #ed4245; font-size: 0.8rem; margin-top: 0.5rem; display: none;"></p>
                    </div>

                    <div style="display: flex; justify-content: flex-end; gap: 1rem;">
                        <button type="button" id="close-add-friend-btn" class="btn-ghost" style="color: white;">Cancel</button>
                        <button type="submit" class="btn-primary" id="send-request-btn">
                            Send Friend Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}
