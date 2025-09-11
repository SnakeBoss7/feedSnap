(function() {
    'use strict';
    
    // Prevent multiple instances
    if (window.FloatingWidget) return;
    
    class FloatingWidget {
        constructor() {
            this.isOpen = false;
            this.activeTab = 'feedback';
            this.init();
        }
        
        init() {
            this.injectStyles();
            this.createButton();
            this.createPopup();
            this.bindEvents();
        }
        
        injectStyles() {
            const styles = `
                .fw-container * {
                    box-sizing: border-box;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                }
                
                .fw-button {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
                    z-index: 999999;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .fw-button:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
                }
                
                .fw-button svg {
                    width: 24px;
                    height: 24px;
                    fill: white;
                    transition: transform 0.3s ease;
                }
                
                .fw-button.active svg {
                    transform: rotate(45deg);
                }
                
                .fw-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 999998;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(4px);
                }
                
                .fw-overlay.active {
                    opacity: 1;
                    visibility: visible;
                }
                
                .fw-popup {
                    position: fixed;
                    bottom: 100px;
                    right: 24px;
                    width: 400px;
                    max-width: calc(100vw - 48px);
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                    z-index: 999999;
                    transform: translateY(20px) scale(0.95);
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                }
                
                .fw-popup.active {
                    transform: translateY(0) scale(1);
                    opacity: 1;
                    visibility: visible;
                }
                
                @media (max-width: 480px) {
                    .fw-popup {
                        bottom: 24px;
                        right: 24px;
                        left: 24px;
                        width: auto;
                        max-width: none;
                    }
                }
                
                .fw-header {
                    padding: 20px 24px 0;
                    border-bottom: 1px solid #f0f0f0;
                }
                
                .fw-tabs {
                    display: flex;
                    gap: 0;
                    margin-bottom: 20px;
                }
                
                .fw-tab {
                    flex: 1;
                    padding: 12px 16px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    color: #666;
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s ease;
                }
                
                .fw-tab.active {
                    color: #667eea;
                    border-bottom-color: #667eea;
                }
                
                .fw-content {
                    padding: 24px;
                    max-height: 60vh;
                    overflow-y: auto;
                }
                
                .fw-tab-content {
                    display: none;
                }
                
                .fw-tab-content.active {
                    display: block;
                    animation: fadeIn 0.3s ease;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .fw-form-group {
                    margin-bottom: 20px;
                }
                
                .fw-label {
                    display: block;
                    font-size: 14px;
                    font-weight: 500;
                    color: #333;
                    margin-bottom: 8px;
                }
                
                .fw-input, .fw-textarea {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid #e1e5e9;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: all 0.2s ease;
                    background: white;
                }
                
                .fw-input:focus, .fw-textarea:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }
                
                .fw-textarea {
                    min-height: 80px;
                    resize: vertical;
                }
                
                .fw-submit {
                    width: 100%;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .fw-submit:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                }
                
                .fw-chat {
                    height: 300px;
                    display: flex;
                    flex-direction: column;
                }
                
                .fw-chat-messages {
                    flex: 1;
                    padding: 16px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    overflow-y: auto;
                }
                
                .fw-message {
                    margin-bottom: 12px;
                    padding: 10px 14px;
                    border-radius: 12px;
                    max-width: 80%;
                    font-size: 14px;
                    line-height: 1.4;
                }
                
                .fw-message.bot {
                    background: white;
                    border: 1px solid #e1e5e9;
                    margin-right: auto;
                }
                
                .fw-message.user {
                    background: #667eea;
                    color: white;
                    margin-left: auto;
                }
                
                .fw-chat-input-group {
                    display: flex;
                    gap: 8px;
                    align-items: flex-end;
                }
                
                .fw-chat-input {
                    flex: 1;
                    padding: 12px 16px;
                    border: 1px solid #e1e5e9;
                    border-radius: 20px;
                    font-size: 14px;
                    resize: none;
                    max-height: 80px;
                }
                
                .fw-chat-send {
                    width: 40px;
                    height: 40px;
                    background: #667eea;
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                
                .fw-chat-send:hover {
                    background: #5a6fd8;
                    transform: scale(1.05);
                }
                
                .fw-chat-send svg {
                    width: 16px;
                    height: 16px;
                    fill: white;
                }
                
                .fw-close {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    width: 32px;
                    height: 32px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                
                .fw-close:hover {
                    background: #f0f0f0;
                }
                
                .fw-close svg {
                    width: 16px;
                    height: 16px;
                    stroke: #666;
                }
            `;
            
            const styleSheet = document.createElement('style');
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }
        
        createButton() {
            this.button = document.createElement('button');
            this.button.className = 'fw-button fw-container';
            this.button.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
            
            `;
            document.body.appendChild(this.button);
        }
        
        createPopup() {
            this.overlay = document.createElement('div');
            this.overlay.className = 'fw-overlay fw-container';
            
            this.popup = document.createElement('div');
            this.popup.className = 'fw-popup fw-container';
            this.popup.innerHTML = `
                <button class="fw-close">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
                
                <div class="fw-header">
                    <div class="fw-tabs">
                        <button class="fw-tab active" data-tab="feedback">Feedback</button>
                        <button class="fw-tab" data-tab="chat">Chat</button>
                    </div>
                </div>
                
                <div class="fw-content">
                    <div class="fw-tab-content active" data-content="feedback">
                        <form class="fw-form">
                            <div class="fw-form-group">
                                <label class="fw-label">Title</label>
                                <input type="text" class="fw-input" placeholder="Brief description of your feedback" required>
                            </div>
                            <div class="fw-form-group">
                                <label class="fw-label">Description</label>
                                <textarea class="fw-textarea" placeholder="Please provide more details about your feedback..." required></textarea>
                            </div>
                            <div class="fw-form-group">
                                <label class="fw-label">Email</label>
                                <input type="email" class="fw-input" placeholder="your@email.com" required>
                            </div>
                            <button type="submit" class="fw-submit">Send Feedback</button>
                        </form>
                    </div>
                    
                    <div class="fw-tab-content" data-content="chat">
                        <div class="fw-chat">
                            <div class="fw-chat-messages">
                                <div class="fw-message bot">
                                    Hello! How can I help you today?
                                </div>
                                <div class="fw-message user">
                                    Hi there! I have a question about your service.
                                </div>
                                <div class="fw-message bot">
                                    I'd be happy to help! What would you like to know?
                                </div>
                            </div>
                            <div class="fw-chat-input-group">
                                <textarea class="fw-chat-input fw-input" placeholder="Type your message..." rows="1"></textarea>
                                <button class="fw-chat-send">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(this.overlay);
            document.body.appendChild(this.popup);
        }
        
        bindEvents() {
            // Toggle popup
            this.button.addEventListener('click', () => this.togglePopup());
            this.overlay.addEventListener('click', () => this.closePopup());
            this.popup.querySelector('.fw-close').addEventListener('click', () => this.closePopup());
            
            // Tab switching
            this.popup.querySelectorAll('.fw-tab').forEach(tab => {
                tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
            });
            
            // Form submission
            this.popup.querySelector('.fw-form').addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFeedbackSubmit(e);
            });
            
            // Chat functionality
            const chatInput = this.popup.querySelector('.fw-chat-input');
            const chatSend = this.popup.querySelector('.fw-chat-send');
            
            const sendMessage = () => {
                const message = chatInput.value.trim();
                if (message) {
                    this.addChatMessage(message, 'user');
                    chatInput.value = '';
                    
                    // Simulate bot response
                    setTimeout(() => {
                        this.addChatMessage("Thanks for your message! This is a demo response.", 'bot');
                    }, 1000);
                }
            };
            
            chatSend.addEventListener('click', sendMessage);
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
            
            // Auto-resize chat input
            chatInput.addEventListener('input', () => {
                chatInput.style.height = 'auto';
                chatInput.style.height = Math.min(chatInput.scrollHeight, 80) + 'px';
            });
            
            // Prevent popup close when clicking inside
            this.popup.addEventListener('click', (e) => e.stopPropagation());
        }
        
        togglePopup() {
            if (this.isOpen) {
                this.closePopup();
            } else {
                this.openPopup();
            }
        }
        
        openPopup() {
            this.isOpen = true;
            this.button.classList.add('active');
            this.overlay.classList.add('active');
            this.popup.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        closePopup() {
            this.isOpen = false;
            this.button.classList.remove('active');
            this.overlay.classList.remove('active');
            this.popup.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        switchTab(tabName) {
            // Update tab buttons
            this.popup.querySelectorAll('.fw-tab').forEach(tab => {
                tab.classList.toggle('active', tab.dataset.tab === tabName);
            });
            
            // Update tab content
            this.popup.querySelectorAll('.fw-tab-content').forEach(content => {
                content.classList.toggle('active', content.dataset.content === tabName);
            });
            
            this.activeTab = tabName;
        }
        
        handleFeedbackSubmit(e) {
            const formData = new FormData(e.target);
            const data = {
                title: e.target.querySelector('input[type="text"]').value,
                description: e.target.querySelector('textarea').value,
                email: e.target.querySelector('input[type="email"]').value
            };
            
            console.log('Feedback submitted:', data);
            
            // Show success message
            const button = e.target.querySelector('.fw-submit');
            const originalText = button.textContent;
            button.textContent = 'Sent! ✓';
            button.style.background = '#10b981';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
                e.target.reset();
                this.closePopup();
            }, 2000);
        }
        
        addChatMessage(message, type) {
            const messagesContainer = this.popup.querySelector('.fw-chat-messages');
            const messageEl = document.createElement('div');
            messageEl.className = `fw-message ${type}`;
            messageEl.textContent = message;
            messagesContainer.appendChild(messageEl);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
    
    // Initialize widget when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.FloatingWidget = new FloatingWidget();
        });
    } else {
        window.FloatingWidget = new FloatingWidget();
    }
})();