(function() {
    'use strict';
    
    // Prevent multiple instances
    if (window.FeedbackSnippet) return;
    
    // Utility functions
    const hexToRgb = hex => {
        hex = hex.replace(/^#/, "");
        if (hex.length === 3) hex = hex.split("").map(x => x + x).join("");
        const num = parseInt(hex, 16);
        return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
    };

    function getContrastTextColor(hexColor) {
        if (!hexColor || typeof hexColor !== 'string') {
            return '#000000';
        }
        
        let hex = hexColor.replace('#', '').toUpperCase();
        
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }
        
        if (!/^[0-9A-F]*$/i.test(hex)) {
            return '#000000';
        }
        
        if (hex.length < 6) {
            hex = hex.padEnd(6, '0');
        } else if (hex.length > 6) {
            hex = hex.substring(0, 6);
        }
        
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const getLuminance = (r, g, b) => {
            const [rs, gs, bs] = [r, g, b].map(c => {
                c = c / 255;
                return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        };
        
        const backgroundLuminance = getLuminance(r, g, b);
        const whiteContrast = 1.05 / (backgroundLuminance + 0.05);
        const blackContrast = (backgroundLuminance + 0.05) / 0.05;
        
        return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
    }

    const CONFIG = {
        BASE_API: "http://localhost:5000",
    };
    
    class FeedbackSnippet {
        constructor() {
            this.webUrl = window.location.origin;
            this.pathname = window.location.pathname || "/";
            this.currentPath = window.location.pathname || "/";
            this.config = null;
            this.isOpen = false;
            this.activeTab = 'feedback';
            this.selectedFeedbackType = null;
            this.btnContent = '';
            this.setupRouteDetection();
            this.init();
        }

        async setupRouteDetection() {
            this.currentPath = window.location.pathname || '/';
            
            window.addEventListener('popstate', () => {
                this.handleRouteChange('popstate');
            });

            window.addEventListener('hashchange', () => {
                this.handleRouteChange('hashchange');
            });

            if (typeof MutationObserver !== 'undefined') {
                const observer = new MutationObserver(() => {
                    const newPath = window.location.pathname;
                    if (newPath !== this.currentPath) {
                        this.handleRouteChange('mutation');
                    }
                });
                
                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['href', 'data-path']
                });
                
                observer.observe(document.head, {
                    childList: true,
                    subtree: true
                });
                
                this.routeObserver = observer;
            }
            
            this.startRoutePolling();
        }
        
        startRoutePolling() {
    this.routePollingInterval = setInterval(() => {
        const newPath = window.location.pathname;
        if (newPath !== this.currentPath) {
            this.handleRouteChange('polling');
        }
    }, 500);
}
        destroy() {
  // Remove all event listeners
    window.removeEventListener('popstate', this.handleRouteChange);
    window.removeEventListener('hashchange', this.handleRouteChange);
    
    // Clear intervals
    if (this.routePollingInterval) {
        clearInterval(this.routePollingInterval);
    }
    
    // Remove style sheets
    document.querySelectorAll('style').forEach(style => {
        if (style.textContent.includes('.fw-container')) {
            style.remove();
        }
           
    });
    
    // Reset global reference
    delete window.FeedbackSnippet;
    
    // Existing cleanup...
    document.querySelector('.fw-overlay')?.remove();
    document.querySelector('.fw-popup')?.remove();
    document.querySelector('.fw-button')?.remove();
    this.routeObserver?.disconnect();
    this.isOpen = false;
     if (window.FeedbackSnippet) {
        delete window.FeedbackSnippet;
    }
    
    console.log("FeedbackSnippet destroyed and cleared from window");
}
        handleRouteChange(source) {
            const newPath = window.location.pathname;
            
            if (newPath !== this.currentPath) {
                console.log(`Route changed from ${this.currentPath} to ${newPath} (via ${source})`);
                
                this.currentPath = newPath;
                this.pathname = newPath;
                
                if (this.isOpen) {
                    this.closePopup();
                }
                
                this.loadConfig();
            }
        }
        
        async init() {
            try {
                await this.loadConfig();
                this.createWidget();
                this.bindEvents();
            } catch (err) {
                console.log(err);
            }
        }

        async loadConfig() {
            try {
                let res = await fetch(
                    `${CONFIG.BASE_API}/api/widget/GetWidConfig?webUrl=http://localhost:3000`,
                    {
                        method: "GET",
                    }
                );
                this.config = await res.json();
            } catch (err) {
                console.log(err);
                // Fallback config
                this.config = {
                    color: "#667eea",
                    modeColor: "#ffffff",
                    position: "bottom right",
                    text: ""
                };
            }
        }

        createWidget() {
            this.loadLucideIcons();
            this.injectStyles();
            this.createButton();
            this.createPopup();
        }

        loadLucideIcons() {
            if (!document.querySelector('script[src*="lucide"]')) {
                const lucideScript = document.createElement("script");
                lucideScript.src = "https://unpkg.com/lucide@latest/dist/umd/lucide.js";
                lucideScript.onload = () => {
                    if (window.lucide) {
                        lucide.createIcons();
                    }
                };
                document.head.appendChild(lucideScript);
            }
        }

        injectStyles() {
            const position = this.config.position.split(" ");
            const rgb = hexToRgb(this.config.color || "#667eea");
            const bgColor = !this.config.modeColor || this.config.modeColor.trim() === '' 
                ? "#ffffff" 
                : this.config.modeColor;
            const textColor = getContrastTextColor(bgColor);

            const styles = `

      .fw-container {
        --primary-color: ${this.config.color || "#667eea"};
        --primary-rgb: ${rgb};
        --bg-color: ${bgColor};
        --text-color: ${textColor};
        --primary-light: color-mix(in srgb, var(--primary-color) 20%, transparent);
        --border-color: color-mix(in srgb, var(--primary-color) 30%, transparent);
        --sent-color: color-mix(in srgb, var(--primary-color) 60%, transparent);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
            .fw-container, .fw-container * {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }
                .fw-container * {
                    box-sizing: border-box;
                }
                
                .fw-button {
                    position: fixed;
                    ${position[0]}: 24px;
                    ${position[1]}: 24px;
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, var(--primary-color) 0%, color-mix(in srgb, var(--primary-color) 80%, #000) 100%);
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 8px 32px color-mix(in srgb, var(--primary-color) 30%, transparent);
                    z-index: 999999;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 14px;
                    font-weight: 600;
                    overflow: hidden;
                }
                
                .fw-button:hover {
                    transform: scale(1.1);
                    box-shadow: 0 12px 40px color-mix(in srgb, var(--primary-color) 40%, transparent);
                }
                
                .fw-button.active {
                    transform: scale(0.95);
                }
                
                .fw-button svg,
                .fw-button i {
                    width: 24px;
                    height: 24px;
                    transition: transform 0.3s ease;
                }
                
                .fw-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.4);
                    z-index: 999998;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(8px);
                }
                
                .fw-overlay.active {
                    opacity: 1;
                    visibility: visible;
                }
                
                .fw-popup {
                    position: fixed;
                    ${position[0]}: 100px;
                    ${position[1]}: 100px;
                    width: 380px;
                    height:540px;
                    max-width: calc(100vw - 48px);
                    background: var(--bg-color);
                    border-radius: 20px;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
                    z-index: 999999;
                    transform: translateY(20px) scale(0.9);
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                    overflow: hidden;
                    border: 2px solid var(--border-color);
                }
                
                .fw-popup.active {
                    transform: translateY(0) scale(1);
                    opacity: 1;
                    visibility: visible;
                }
                
                @media (max-width: 480px) {
                    .fw-popup {
                        ${position[0]}: 24px;
                        ${position[1]}: 24px;
                        width: calc(100vw - 48px);
                    }
                }
                
                .fw-header {
                    display: flex;
                    background: linear-gradient(135deg, var(--primary-color) 0%, color-mix(in srgb, var(--primary-color) 80%, #000) 100%);
                    position: relative;
                }
                
                .fw-tab {
                    flex: 1;
                    padding: 20px 24px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.7);
                    transition: all 0.3s ease;
                    position: relative;
                }
                
                .fw-tab.active {
                    color: white;
                }
                
                .fw-tab.active::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 40px;
                    height: 3px;
                    background: white;
                    border-radius: 3px 3px 0 0;
                }
                
                .fw-close {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    width: 36px;
                    height: 36px;
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    cursor: pointer;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    backdrop-filter: blur(10px);
                }
                
                .fw-close:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: scale(1.1);
                }
                
                .fw-close svg {
                    width: 18px;
                    height: 18px;
                    stroke: white;
                }
                
                .fw-content {
                    padding: 25px;
                    max-height: 80vh;
                    overflow-y: scroll;
    scrollbar-width: none;
                }
                
                .fw-tab-content {
                    display: none;
                }
                
                .fw-tab-content.active {
                    display: block;
                    animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                /* Dropdown Styles */
                .fw-dropdown {
                    position: relative;
                    margin-bottom: 24px;
                }
                
                .fw-dropdown-button {
                    width: 100%;
                    padding: 12px 15px;
                    background: var(--bg-color);
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--text-color);
                    transition: all 0.3s ease;
                }
                
                .fw-dropdown-button:hover {
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px var(--primary-light);
                }
                
                .fw-dropdown-button.active {
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px var(--primary-light);
                }
                
                .fw-dropdown-arrow {
                    transition: transform 0.3s ease;
                    color: #64748b;
                }
                
                .fw-dropdown-arrow.rotated {
                    transform: rotate(180deg);
                }
                
                .fw-dropdown-content {
                    position: absolute;
                    top: calc(100% + 8px);
                    left: 0;
                    right: 0;
                    background: var(--bg-color);
                    border: 2px solid var(--primary-color);
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease;
                    z-index: 1000;
                }
                
                .fw-dropdown-content.show {
                    max-height: 300px;
                }
                
                .fw-dropdown-item {
                    padding: 12px 15px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border-bottom: 1px solid #f1f5f9;
                    color: var(--text-color);
                    font-weight: 500;
                    font-size:14px;
                }
                
                .fw-dropdown-item:last-child {
                    border-bottom: none;
                }
                
                .fw-dropdown-item:hover {
                    background: var(--primary-light);
                    color: var(--primary-color);
                }
                
                .fw-dropdown-item.selected {
                    background: var(--primary-light);
                    color: var(--primary-color);
                    font-weight: 600;
                }
                
                /* Rating Styles */
                .fw-rating {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 24px;
                    gap: 12px;
                }
                
                .fw-rating-option {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 54px;
                    width: 50px;
                    border-radius: 16px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 2px solid #e2e8f0;
                    position: relative;
                    overflow: hidden;
                }
                
                .fw-rating-option::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 70%, white));
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                
                .fw-rating-option:hover::before {
                    opacity: 0.1;
                }
                
                .fw-rating-option:hover {
                    transform: translateY(-4px) scale(1.05);
                    border-color: var(--primary-color);
                    box-shadow: 0 8px 25px var(--primary-light);
                }
                
                .fw-rating-option input {
                    display: none;
                }
                
                .fw-rating-option img {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                    position: relative;
                    z-index: 1;
                }
                
                .fw-rating-option input:checked + img {
                    transform: scale(1.3);
                    filter: drop-shadow(0 4px 8px var(--primary-color));
                }
                
                .fw-rating-option input:checked + img {
                    border: 2px solid var(--primary-color);
                }
                
                /* Form Styles */
                .fw-form-group {
                    margin-bottom: 24px;
                }
                
                .fw-input,
                .fw-textarea {
                    width: 100%;
                    padding: 10px 13px;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 400;
                    color: var(--text-color);
                    background: color-mix(in srgb, var(--bg-color) 95%, var(--primary-color));
                    transition: all 0.3s ease;
                    font-family: inherit;
                }
                
                .fw-input:focus,
                .fw-textarea:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px var(--primary-light);
                    transform: translateY(-2px);
                }
                
                .fw-textarea {
                    min-height: 120px;
                    resize: vertical;
                }
                
                .fw-submit {
                    width: 100%;
                    padding: 14px 24px;
                    background: linear-gradient(135deg, var(--primary-color) 0%, color-mix(in srgb, var(--primary-color) 80%, #000) 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                }
                
                .fw-submit:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 30px var(--primary-light);
                }
                
                .fw-submit:active {
                    transform: translateY(-1px);
                }
                
                /* Chat Styles */
                .fw-chat {
                    height: 400px;
                    display: flex;
                    flex-direction: column;
                }
                
                .fw-chat-messages {
                    flex: 1;
                      overflow: scroll;
    scrollbar-width: none;
                    background: color-mix(in srgb, var(--bg-color) 98%, var(--primary-color));
                    border-radius: 16px;
                    margin-bottom: 20px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    
                }
                
                .fw-message {
                    max-width: 85%;
                    padding: 14px 18px;
                    border-radius: 20px;
                    font-size: 15px;
                    line-height: 1.5;
                    font-weight: 500;
                    animation: messageSlideIn 0.3s ease;
                }
                
                @keyframes messageSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .fw-message.bot {
                    background: white;
                    color: var(--text-color);
                    border: 2px solid #f1f5f9;
                    align-self: flex-start;
                    border-radius: 20px 20px 20px 6px;
                }
                
                .fw-message.user {
                    background: linear-gradient(135deg, var(--primary-color) 0%, color-mix(in srgb, var(--primary-color) 80%, #000) 100%);
                    color: white;
                    align-self: flex-end;
                    border-radius: 20px 20px 6px 20px;
                }
                
                .fw-chat-input-container {
                    display: flex;
                    gap: 12px;
                    align-items: flex-end;
                }
                
                .fw-chat-input {
                    flex: 1;
                    padding: 14px 20px;
                    border: 2px solid #e2e8f0;
                    border-radius: 25px;
                    font-size: 15px;
                    resize: none;
                    max-height: 100px;
                    min-height: 50px;
                    transition: all 0.3s ease;
                    background: var(--bg-color);
                    color: var(--text-color);
                        overflow: scroll;
    scrollbar-width: none;
                }
                
                .fw-chat-input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px var(--primary-light);
                }
                
                .fw-chat-send {
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, var(--primary-color) 0%, color-mix(in srgb, var(--primary-color) 80%, #000) 100%);
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px var(--primary-light);
                }
                
                .fw-chat-send:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px var(--primary-light);
                }
                
                .fw-chat-send svg {
                    width: 20px;
                    height: 20px;
                    fill: white;
                }

                .fw-loader {
                    opacity: 0.6;
                    font-style: italic;
                }
            `;
            
            const styleSheet = document.createElement('style');
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }
        
        createButton() {
            this.button = document.createElement('button');
            this.button.className = 'fw-button fw-container';
            this.button.title = 'Send Feedback';
            this.button.setAttribute('aria-label', 'Open feedback widget');

            if (this.config.text) {
                this.btnContent = this.config.text;
            } else {
                this.btnContent = ` <svg viewBox="0 0 24 24">
                    <path fill="white" d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>`;
            }
            
            this.button.innerHTML = this.btnContent;
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
                    <button class="fw-tab active" data-tab="feedback">Feedback</button>
                    <button class="fw-tab" data-tab="chat">Chat</button>
                </div>
                
                <div class="fw-content">
                    <div class="fw-tab-content active" data-content="feedback">
                        <div class="fw-dropdown">
                            <div class="fw-dropdown-button">
                                <span class="fw-dropdown-text">Choose feedback type</span>
                                <span class="fw-dropdown-arrow">▼</span>
                            </div>
                            <div class="fw-dropdown-content">
                                <div class="fw-dropdown-item" data-value="Bug Reports">🐛 Bug Report</div>
                                <div class="fw-dropdown-item" data-value="Feature Requests">✨ Feature Request</div>
                                <div class="fw-dropdown-item" data-value="General Feedback">💬 General Feedback</div>
                                <div class="fw-dropdown-item" data-value="Improvements">🚀 Improvement</div>
                                <div class="fw-dropdown-item" data-value="Complaints">⚠️ Complaint</div>
                            </div>
                        </div>
                        
                        <div class="fw-rating">
                            <label class="fw-rating-option">
                                <input type="radio" name="rating" value="1">
                                <img src="${CONFIG.BASE_API}/images/unhappy.png" alt="Unhappy">
                            </label>
                            <label class="fw-rating-option">
                                <input type="radio" name="rating" value="2">
                                <img src="${CONFIG.BASE_API}/images/upset.png" alt="Upset">
                            </label>
                            <label class="fw-rating-option">
                                <input type="radio" name="rating" value="3">
                                <img src="${CONFIG.BASE_API}/images/smile.png" alt="Neutral">
                            </label>
                            <label class="fw-rating-option">
                                <input type="radio" name="rating" value="4">
                                <img src="${CONFIG.BASE_API}/images/happy.png" alt="Happy">
                            </label>
                            <label class="fw-rating-option">
                                <input type="radio" name="rating" value="5">
                                <img src="${CONFIG.BASE_API}/images/love.png" alt="Love">
                            </label>
                        </div>
                        
                        <form class="fw-form">
                            <div class="fw-form-group">
                                <input type="email" class="fw-input" name="email" placeholder="Your email (e.g., 'user@example.comz')" required>
                            </div>
                            <div class="fw-form-group">
                                <textarea class="fw-textarea" name="description" placeholder="Describe your feedback in detail..." required></textarea>
                            </div>
                            <button type="submit" class="fw-submit">
                                <span>Send Feedback</span>
                                <i data-lucide="send"></i>
                            </button>
                        </form>
                    </div>
                    
                    <div class="fw-tab-content" data-content="chat">
                        <div class="fw-chat">
                            <div class="fw-chat-messages">
                                <div class="fw-message bot">
                                    Hello there! How can I help you today? 👋
                                </div>
                            </div>
                            <div class="fw-chat-input-container">
                                <textarea class="fw-chat-input" placeholder="Ask your questions..." rows="1"></textarea>
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
            // Button events
            this.button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePopup();
            });
            
            // Overlay and close button
            this.overlay.addEventListener('click', () => this.closePopup());
            this.popup.querySelector('.fw-close').addEventListener('click', () => this.closePopup());
            
            // Tab switching
            this.popup.querySelectorAll('.fw-tab').forEach(tab => {
                tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
            });
            
            // Dropdown functionality
            this.setupDropdown();
            
            // Form submission
            this.popup.querySelector('.fw-form').addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFeedbackSubmit(e);
            });
            
            // Chat functionality
            this.setupChat();
            
            // Prevent popup close when clicking inside
            this.popup.addEventListener('click', (e) => e.stopPropagation());
        }

        setupDropdown() {
            const dropdownButton = this.popup.querySelector('.fw-dropdown-button');
            const dropdownContent = this.popup.querySelector('.fw-dropdown-content');
            const dropdownArrow = this.popup.querySelector('.fw-dropdown-arrow');
            const dropdownText = this.popup.querySelector('.fw-dropdown-text');
            const dropdownItems = this.popup.querySelectorAll('.fw-dropdown-item');
            let isDropdownOpen = false;

            // Toggle dropdown
            dropdownButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (isDropdownOpen) {
                    this.closeDropdown();
                } else {
                    this.openDropdown();
                }
            });

            // Handle item selection
            dropdownItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectDropdownItem(item);
                });
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (isDropdownOpen && !this.popup.querySelector('.fw-dropdown').contains(e.target)) {
                    this.closeDropdown();
                }
            });

            // Helper methods for dropdown
            this.openDropdown = () => {
                isDropdownOpen = true;
                dropdownContent.classList.add('show');
                dropdownButton.classList.add('active');
                dropdownArrow.classList.add('rotated');
            };

            this.closeDropdown = () => {
                isDropdownOpen = false;
                dropdownContent.classList.remove('show');
                dropdownButton.classList.remove('active');
                dropdownArrow.classList.remove('rotated');
            };

            this.selectDropdownItem = (item) => {
                // Remove previous selection
                dropdownItems.forEach(i => i.classList.remove('selected'));
                
                // Add selection to clicked item
                item.classList.add('selected');
                
                // Update display
                dropdownText.textContent = item.textContent;
                
                // Store selected value
                this.selectedFeedbackType = item.dataset.value;
                
                // Close dropdown
                this.closeDropdown();
                
                console.log('Selected feedback type:', this.selectedFeedbackType);
            };
        }

        setupChat() {
            const chatInput = this.popup.querySelector('.fw-chat-input');
            const chatSend = this.popup.querySelector('.fw-chat-send');
            const chatMessages = this.popup.querySelector('.fw-chat-messages');

            const sendMessage = () => {
                const message = chatInput.value.trim();
                if (!message) return;

                // Add user message
                this.addChatMessage(message, 'user');
                chatInput.value = '';
                chatInput.style.height = 'auto';

                // Add loading message
                const loadingMsg = this.addChatMessage('Wait a moment...', 'bot');
                loadingMsg.classList.add('fw-loader');

                // Send to API
                fetch(`${CONFIG.BASE_API}/api/llm/llmquery`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userMessage: message }),
                })
                .then(response => response.json())
                .then(data => {
                    // Remove loading message
                    loadingMsg.remove();
                    
                    // Add bot response
                    this.addChatMessage(data.data.replaceAll('/n', ''), 'bot');
                })
                .catch(error => {
                    console.error('Error fetching LLM response:', error);
                    loadingMsg.remove();
                    this.addChatMessage('Sorry, I encountered an error. Please try again.', 'bot');
                });
            };

            // Send button click
            chatSend.addEventListener('click', sendMessage);

            // Enter key to send (Shift+Enter for new line)
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });

            // Auto-resize chat input
            chatInput.addEventListener('input', () => {
                chatInput.style.height = 'auto';
                chatInput.style.height = Math.min(chatInput.scrollHeight, 100) + 'px';
            });
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
            
            // Update button icon
            this.button.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
</svg>`;
            if (window.lucide) {
                lucide.createIcons();
            }
        }

        closePopup() {
            this.isOpen = false;
            this.button.classList.remove('active');
            this.overlay.classList.remove('active');
            this.popup.classList.remove('active');
            document.body.style.overflow = '';
            
            // Restore button content
            this.button.innerHTML = this.btnContent;
            if (window.lucide) {
                lucide.createIcons();
            }
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
            const email = this.popup.querySelector("input[name='email']").value;
            const description = this.popup.querySelector("textarea[name='description']").value;
            const rating = this.popup.querySelector("input[name='rating']:checked")?.value;

            if (!this.selectedFeedbackType || !email || !description || !rating) {
                this.showNotification('Please fill in all fields and select a feedback type.', 'error');
                return;
            }

            const submitButton = this.popup.querySelector('.fw-submit');
            const originalContent = submitButton.innerHTML;
            
            // Show loading state
            submitButton.innerHTML = `
                <span>Sending...</span>
                <i data-lucide="loader" class="animate-spin"></i>
            `;
            submitButton.disabled = true;

            // Submit feedback
            console.log(this.selectedFeedbackType)
            fetch(`${CONFIG.BASE_API}/api/feedback/addfeedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    webUrl: this.webUrl,
                    pathname: this.pathname,
                    title: this.selectedFeedbackType,
                    email,
                    description,
                    rating,
                }),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Feedback submitted successfully:', data);
                
                // Show success state
                submitButton.innerHTML = `
                    <span>Sent Successfully! ✓</span>
                `;
                submitButton.style.background = 'var(--sent-color)';
                
                // Reset form after delay
                setTimeout(() => {
                    submitButton.innerHTML = originalContent;
                    submitButton.style.background = '';
                    submitButton.disabled = false;
                    this.resetForm();
                    this.closePopup();
                    
                    if (window.lucide) {
                        lucide.createIcons();
                    }
                }, 2000);
                
                // Notify parent window
                try {
                    window.parent.postMessage({ type: 'FEEDBACK_SUBMITTED' }, '*');
                } catch (e) {
                    console.log('Could not post message to parent');
                }
            })
            .catch(error => {
                console.error('Error submitting feedback:', error);
                
                // Show error state
                submitButton.innerHTML = `
                    <span>Error - Try Again</span>
                    <i data-lucide="alert-circle"></i>
                `;
                submitButton.style.background = '#ef4444';
                
                setTimeout(() => {
                    submitButton.innerHTML = originalContent;
                    submitButton.style.background = '';
                    submitButton.disabled = false;
                    
                    if (window.lucide) {
                        lucide.createIcons();
                    }
                }, 3000);
            });
        }

        addChatMessage(message, type) {
            const messagesContainer = this.popup.querySelector('.fw-chat-messages');
            const messageEl = document.createElement('div');
            messageEl.className = `fw-message ${type}`;
            messageEl.textContent = message;
            messagesContainer.appendChild(messageEl);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            return messageEl;
        }

        resetForm() {
            // Reset form fields
            this.popup.querySelector("input[name='email']").value = '';
            this.popup.querySelector("textarea[name='description']").value = '';
            
            // Reset rating selection
            this.popup.querySelectorAll("input[name='rating']").forEach(radio => {
                radio.checked = false;
            });
            
            // Reset dropdown
            this.selectedFeedbackType = null;
            this.popup.querySelector('.fw-dropdown-text').textContent = 'Choose feedback type';
            this.popup.querySelectorAll('.fw-dropdown-item').forEach(item => {
                item.classList.remove('selected');
            });
        }

        showNotification(message, type = 'info') {
            // Simple notification system - you can enhance this
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 16px 24px;
                background: ${type === 'error' ? '#ef4444' : '#10b981'};
                color: white;
                border-radius: 12px;
                font-weight: 600;
                z-index: 9999999;
                animation: slideIn 0.3s ease;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.remove();
            }, 4000);
        }
    }

    // Initialize widget
// At the bottom, replace the initialization code with:
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.FeedbackSnippet) {
            window.FeedbackSnippet.destroy();
        }
        window.FeedbackSnippet = new FeedbackSnippet();
    });
} else {
    if (window.FeedbackSnippet) {
        window.FeedbackSnippet.destroy();
    }
    window.FeedbackSnippet = new FeedbackSnippet();
}

})();