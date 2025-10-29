const widgetGen =(config)=> {
   return ` (function() {
    'use strict';
        const INJECTED_CONFIG = ${JSON.stringify(config)};
    // Prevent multiple instances
    if (window.FeedbackSnippet) return;
    
    // Utility functions
    const hexToRgb = hex => {
        hex = hex.replace(/^#/, "");
        if (hex.length === 3) hex = hex.split("").map(x => x + x).join("");
        const num = parseInt(hex, 16);
        return \`\${(num >> 16) & 255}, \${(num >> 8) & 255}, \${num & 255}\`;
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
        BASE_API: "https://feedsnap.onrender.com",
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
            this.selectedRating = null;
            this.followUp = false;
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
            window.removeEventListener('popstate', this.handleRouteChange);
            window.removeEventListener('hashchange', this.handleRouteChange);
            
            if (this.routePollingInterval) {
                clearInterval(this.routePollingInterval);
            }
            
            document.querySelectorAll('style').forEach(style => {
                if (style.textContent.includes('.fw-container')) {
                    style.remove();
                }
            });
            
            delete window.FeedbackSnippet;
            
            document.querySelector('.fw-overlay')?.remove();
            document.querySelector('.fw-popup')?.remove();
            document.querySelector('.fw-button')?.remove();
            this.routeObserver?.disconnect();
            this.isOpen = false;
            
            //.log("FeedbackSnippet destroyed and cleared from window");
        }

        handleRouteChange(source) {
            const newPath = window.location.pathname;
            
            if (newPath !== this.currentPath) {
                //.log(\`Route changed from \${this.currentPath} to \${newPath} (via \${source})\`);
                
                this.currentPath = newPath;
                this.pathname = newPath;
                
                if (this.isOpen) {
                    this.closePopup();
                }
                
                // this.loadConfig();
            }
        }
        
        async init() {
            try {
                await this.loadConfig();
                this.createWidget();
                this.bindEvents();
            } catch (err) {
                //.log(err);
            }
        }

        async loadConfig() {
                       try {
             
                this.config = INJECTED_CONFIG;
                console.log(this.config);
            } catch (err) {
                //.log(err);
                // Fallback config
                this.config = {
                    color: "#667eea",
                    bgColor: "#ffffff",
                    position: "bottom right",
                    widgetText: ""
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
                if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
        const fontLink = document.createElement("link");
        fontLink.rel = "stylesheet";
        fontLink.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap";
        document.head.appendChild(fontLink);
    }
            const position = this.config.position.split(" ");
            const rgb = hexToRgb(this.config.color || "#667eea");
            const bgColor = !this.config.bgColor || this.config.bgColor.trim() === '' 
                ? "#ffffff" 
                : this.config.bgColor;
            const textColor = getContrastTextColor(bgColor);
            const isDarkBg = textColor === '#FFFFFF';

            const styles = \`
                .fw-container {
                    --primary-color: \${this.config.color || "#667eea"};
                    --primary-rgb: \${rgb};
                    --bg-color: \${bgColor};
                    --text-color: \${textColor};
                    --text-secondary: \${isDarkBg ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'};
                    --border-color: \${isDarkBg ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'};
                    --surface: \${isDarkBg ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'};
                    --hover-surface: \${isDarkBg ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'};
                    --dropdown-bg: \${isDarkBg ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
                    --shadow: \${isDarkBg ? '0 20px 60px rgba(0, 0, 0, 0.5)' : '0 20px 60px rgba(0, 0, 0, 0.15)'};

                    --surface-1: \${isDarkBg ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'};
                    --surface-2: \${isDarkBg ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};
                    --shadow-clean: 0 2px 8px rgba(0, 0, 0, 0.06);
                    --shadow-medium: 0 4px 12px rgba(0, 0, 0, 0.08);
                    --shadow-large: 0 8px 32px rgba(0, 0, 0, 0.12);
                    --gradient-vibrant: linear-gradient(135deg, rgba(\${rgb}, 0.2), rgba(\${rgb}, 0.35), rgba(\${rgb}, 0.15));
                    --gradient-subtle: linear-gradient(135deg, rgba(\${rgb}, 0.08), rgba(\${rgb}, 0.12));
                }

                .fw-container, .fw-container * {
                    box-sizing: border-box;
                    font-family: "Poppins", sans-serif;
                    user-select: none;   
  -webkit-user-select: none; 
  -moz-user-select: none;   
  -ms-user-select: none;   
                }
                
 .fw-button {
    position: fixed;
    \${position[0]}: 20px;
    \${position[1]}: 20px;
    padding: 20px;
    height: 56px;
    background: linear-gradient(135deg, var(--primary-color), \${this.config.color}dd);
    border: 2px solid \${textColor === '#FFFFFF' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)'};
    border-radius: 100px;
    cursor: pointer;
    z-index: 999999;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--bg-color);
    font-size: 13px;
    font-weight: 600;
    overflow: hidden;
}

.fw-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}
                
                .fw-button:active {
                    transform: scale(0.98) translateY(0px);
                }
                
                .fw-button svg {
                    width: 20px;
                    height: 20px;
                    stroke: \${textColor === '#FFFFFF' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,1)'};
                    transition: transform 0.3s ease;
                }
                
                .fw-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 999998;
                    
                   background: rgba(0, 0, 0, 0.4);
                    visibility: hidden;
                }
                .fw-overlay_later
                {
                      
                    opacity: 0;
                  backdrop-filter: blur(8px);
                    
                }
                .fw-overlay.active {
                    opacity: 1;
                    visibility: visible;
                }
                
                .fw-popup {
                    position: fixed;
                    \${position[0]}: 90px;
                    \${position[1]}: 90px;
                    width: 400px;
                    height:570px;
                    max-width: calc(100vw - 40px);
                    background: var(--bg-color);
                    border-radius: 15px;
                    box-shadow: var(--shadow);
                    z-index: 999999;
                    transform: translateY(20px) scale(0.9);
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    overflow: hidden;
                    border: 1px solid var(--border-color);
                }
                
                .fw-popup.active {
                    transform: translateY(0) scale(1);
                    opacity: 1;
                    visibility: visible;
                }
                
                @media (max-width: 480px) {
                    .fw-popup {
                        \${position[0]}: 20px;
                        \${position[1]}: 20px;
                        width: calc(100vw - 40px);
                        height: auto;
                        max-height: calc(100vh - 40px);
                    }
                }
                
                .fw-header {
                    display: flex;
                    background: var(--surface);
                    border-bottom: 1px solid var(--border-color);
                    position: relative;
                }
                
                .fw-tab {
                    flex: 1;
                    padding: 20px 24px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    transition: all 0.3s ease;
                    position: relative;
                    border-radius: 0;
                }
                
                .fw-tab:hover {
                    color: var(--text-secondary);
                    background: var(--hover-surface);
                }
                
                .fw-tab.active {
                    color: var(--primary-color);
                    font-weight: 600;
                    background: rgba(var(--primary-rgb), 0.03);
                }
                
                .fw-tab.active::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 50%;
                    height: 2px;
                    background: var(--primary-color);
                    border-radius: 2px 2px 0 0;
                }
                
                .fw-content {
                    padding: 32px 28px;
                    max-height: 70vh;
                    overflow-y: auto;
                    scrollbar-width: none;
                }

                .fw-content::-webkit-scrollbar {
                    display: none;
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
                        transform: translateY(16px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                /* Modern Dropdown */
                .fw-dropdown {
                    position: relative;
                    margin-bottom: 28px;
                }
                
                .fw-dropdown-button {
                    width: 100%;
                    padding: 16px 20px;
                    background: var(--surface);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--text-color);
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                }
                
                .fw-dropdown-button:hover {
                    border-color: var(--primary-color);
                    background: var(--hover-surface);
              
                }
                
                .fw-dropdown-button.active {
                    border-color: var(--primary-color);
                }
                
                .fw-dropdown-arrow {
                    transition: transform 0.3s ease;
                    color: var(--text-secondary);
                    font-size: 12px;
                }
                
                .fw-dropdown-arrow.rotated {
                    transform: rotate(180deg);
                }
                
                .fw-dropdown-content {
                    position: absolute;
                    top: calc(100% + 8px);
                    left: 0;
                    right: 0;
                    background: var(--dropdown-bg);

                    border-radius: 12px;
                    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.2);
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    z-index: 1000;
                    backdrop-filter: blur(20px);
                }
                
                .fw-dropdown-content.show {
                    max-height: 280px;
                     border: 2px solid var(--border-color);
                }
                
                .fw-dropdown-item {
                    padding: 14px 20px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    color: var(--text-color);
                    font-weight: 500;
                    font-size: 14px;
                    border-bottom: 1px solid var(--border-color);
                }
                
                .fw-dropdown-item:last-child {
                    border-bottom: none;
                }
                
                .fw-dropdown-item:hover {
                    background: rgba(var(--primary-rgb), 0.08);
                    color: var(--primary-color);
                }
                
                .fw-dropdown-item.selected {
                    background: rgba(var(--primary-rgb), 0.1);
                    color: var(--primary-color);
                    font-weight: 600;
                }
                
                /* Enhanced Rating System */
                .fw-rating {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 28px;
                    gap: 8px;
                }
                
                .fw-rating-option {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 60px;
                    border-radius: 20px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
              
                }
                         .fw-rating-option:hover {
                    background: var(--gradient-vibrant);
                    transform: translateY(-3px) scale(1.02);
                }
                
                .fw-rating-option:hover img {
                    filter: grayscale(0) brightness(1.1) saturate(1.2);
                    transform: scale(1.15);
                }
                
                .fw-rating-option input {
                    display: none;
                }
                
                .fw-rating-option img {
                    width: 34px;
                    height: 34px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    z-index: 2;
                    filter: grayscale(1) brightness(0.9);
                }
                
                .fw-rating-option.selected {
                    background: var(--gradient-vibrant);
                    transform: translateY(-3px) scale(1.02);
                }
                
                .fw-rating-option.selected img {
                    filter: grayscale(0) brightness(1.1) saturate(1.2);
                    transform: scale(1.15);
                }
                
                /* Form Elements */
                .fw-form-group {
                    margin-bottom: 24px;
                }
                
                .fw-input,
                .fw-textarea {
                    width: 100%;
                    padding: 16px 20px;
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    font-size: 14px;
                    font-weight: 400;
                    color: var(--text-color) !important;
                    background: var(--surface) !important;
                    transition: all 0.3s ease;
                }
                
                .fw-input::placeholder,
                .fw-textarea::placeholder {
                    color: var(--text-secondary);
                }
                
                

.fw-input:-webkit-autofill,
.fw-input:-webkit-autofill:hover,
.fw-input:-webkit-autofill:focus,
.fw-textarea:-webkit-autofill,
.fw-textarea:-webkit-autofill:hover,
.fw-textarea:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0 1000px var(--bg-color) inset !important; /* cover the yellow */
  box-shadow: 0 0 0 1000px var(--bg-color) inset !important;
  -webkit-text-fill-color: var(--text-color) !important;           /* set text color */
  border-color: var(--primary-color) !important;                  /* show desired border */
  transition: background-color 5000s ease-in-out 0s !important;    /* stop the flash */
}


.fw-input:-webkit-autofill::first-line,
.fw-textarea:-webkit-autofill::first-line {
  color: var(--text-color) !important;
}

.fw-input:focus,
.fw-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}
                
                .fw-input:-webkit-autofill,
                .fw-input:-webkit-autofill:hover,
                .fw-input:-webkit-autofill:focus {
                    -webkit-box-shadow: 0 0 0 1000px var(--surface) inset !important;
                    -webkit-text-fill-color: var(--text-color) !important;
                    background-color: var(--surface) !important;
                    caret-color: var(--text-color);
                }
                
                .fw-textarea {
                    min-height: 120px;
                    resize: vertical;
                }
                
                .fw-submit {
                    width: 100%;
                    padding: 16px 24px;
                    background: linear-gradient(135deg, var(--primary-color), rgba(var(--primary-rgb), 0.9));
                    color: white;
                    border: none;
                    border-radius: 16px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                
                .fw-submit:hover {
                    transform: translateY(-2px);
                }
                
                .fw-submit:active {
                    transform: translateY(0);
                }
                
                /* Chat Interface */
                .fw-chat {
                    height: 420px;
                    display: flex;
                    flex-direction: column;
                }
                
                .fw-chat-messages {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    scrollbar-width: none;
                    background: var(--surface);
                    border-radius: 20px;
                    margin-bottom: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    backdrop-filter: blur(10px);
                }

                .fw-chat-messages::-webkit-scrollbar {
                    display: none;
                }
                
                .fw-message {
                    max-width: 80%;
                    padding: 12px 16px;
                    border-radius: 20px;
                    font-size: 14px;
                    line-height: 1.5;
                    font-weight: 400;
                    animation: messageSlideIn 0.3s ease;
                }
                
                @keyframes messageSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .fw-message.bot {
                    background: var(--hover-surface);
                    color: var(--text-color);
                    border: 1px solid var(--border-color);
                    align-self: flex-start;
                    border-radius: 20px 20px 20px 4px;
                }
                
                .fw-message.user {
                    background: linear-gradient(135deg, var(--primary-color), rgba(var(--primary-rgb), 0.9));
                    color: white;
                    align-self: flex-end;
                    border-radius: 20px 20px 4px 20px;
                }
                
                .fw-chat-input-container {
                    display: flex;
                    gap: 12px;
                    align-items: flex-end;
                }
                
                .fw-chat-input {
                    flex: 1;
                    padding: 14px 20px;
                    border: 1px solid var(--border-color);
                    border-radius: 25px;
                    font-size: 14px;
                    resize: none;
                    max-height: 100px;
                    min-height: 48px;
                    transition: all 0.3s ease;
                    background: var(--surface);
                    color: var(--text-color);
                    overflow-y: auto;
                    scrollbar-width: none;
                    backdrop-filter: blur(10px);
                }

                .fw-chat-input::placeholder {
                    color: var(--text-secondary);
                }

                .fw-chat-input::-webkit-scrollbar {
                    display: none;
                }
                
                .fw-chat-input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
                    background: var(--bg-color);
                }
                
                .fw-chat-send {
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, var(--primary-color), rgba(var(--primary-rgb), 0.9));
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.3);
                }
                
                .fw-chat-send:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 20px rgba(var(--primary-rgb), 0.4);
                }
                
                .fw-chat-send svg {
                    width: 18px;
                    height: 18px;
                    fill: white;
                }

                .fw-loader {
                    opacity: 0.6;
                    font-style: italic;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                .animate-spin {
                    animation: spin 1s linear infinite;
                }

                .animate-pulse {
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                    .fw-message.bot h1,
.fw-message.bot h2,
.fw-message.bot h3 {
    margin: 8px 0 4px 0;
    font-weight: 600;
    color: var(--text-color);
}

.fw-message.bot h1 { font-size: 18px; }
.fw-message.bot h2 { font-size: 15px; }
.fw-message.bot h3 { font-size: 13px; }

.fw-message.bot strong,
.fw-message.bot b {
    font-weight: 600;
    color: var(--primary-color);
}

.fw-message.bot ul,
.fw-message.bot ol {
    margin: 8px 0;
    padding-left: 20px;
}

.fw-message.bot li {
    margin: 4px 0;
}

.fw-message.bot p {
    margin: 6px 0;
}

.fw-message.bot code {
    background: var(--surface);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
}

.fw-message.bot pre {
    background: var(--surface);
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 8px 0;
}

.fw-message.bot a {
    color: var(--primary-color);
    text-decoration: underline;
}

.fw-message.bot br {
    display: block;
    margin: 4px 0;
    content: "";
}
            \`;
            
            const styleSheet = document.createElement('style');
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }
        
        createButton() {
            this.button = document.createElement('button');
            this.button.className = 'fw-button fw-container';
            this.button.title = 'Send Feedback';
            this.button.setAttribute('aria-label', 'Open feedback widget');
            //.log()
            if (this.config.widgetText) {
                this.btnContent = this.config.widgetText;
            } else {
                this.btnContent = \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>\`;
            }
            
            this.button.innerHTML = this.btnContent;
            document.body.appendChild(this.button);
        }
        
        createPopup() {
            this.overlay = document.createElement('div');
            this.overlay.className = 'fw-overlay fw-container';
            
            this.popup = document.createElement('div');
            this.popup.className = 'fw-popup fw-container';
            this.popup.innerHTML = \`
                <div class="fw-header">
                    <button class="fw-tab active" data-tab="feedback">Feedback</button>
                    <button class="fw-tab" data-tab="chat">Chatbot</button>
                </div>
                
                <div class="fw-content">
                    <div class="fw-tab-content active" data-content="feedback">
                        <div class="fw-dropdown">
                            <div class="fw-dropdown-button">
                                <span class="fw-dropdown-text">Choose feedback type</span>
                                <span class="fw-dropdown-arrow">▼</span>
                            </div>
                            <div class="fw-dropdown-content">
                                <div class="fw-dropdown-item" data-value="Bug Reports"> Bug Report</div>
                                <div class="fw-dropdown-item" data-value="Feature Requests"> Feature Request</div>
                                <div class="fw-dropdown-item" data-value="General Feedback"> General Feedback</div>
                                <div class="fw-dropdown-item" data-value="Improvements"> Improvement</div>
                                <div class="fw-dropdown-item" data-value="Complaints"> Complaint</div>
                            </div>
                        </div>
                        
                        <div class="fw-rating">
                            <label class="fw-rating-option">
                                <input type="radio" name="rating" value="1">
                                <img src="\${CONFIG.BASE_API}/images/unhappy.png" alt="Unhappy">
                            </label>
                            <label class="fw-rating-option">
                                <input type="radio" name="rating" value="2">
                                <img src="\${CONFIG.BASE_API}/images/upset.png" alt="Upset">
                            </label>
                            <label class="fw-rating-option">
                                <input type="radio" name="rating" value="3">
                                <img src="\${CONFIG.BASE_API}/images/smile.png" alt="Neutral">
                            </label>
                            <label class="fw-rating-option">
                                <input type="radio" name="rating" value="4">
                                <img src="\${CONFIG.BASE_API}/images/happy.png" alt="Happy">
                            </label>
                            <label class="fw-rating-option">
                                <input type="radio" name="rating" value="5">
                                <img src="\${CONFIG.BASE_API}/images/love.png" alt="Love">
                            </label>
                        </div>
                        
                        <form class="fw-form">
                            <div class="fw-form-group">
                                <input type="email" class="fw-input" name="email" placeholder="Your email address" required>
                            </div>
                            <div class="fw-form-group">
                                <textarea class="fw-textarea" name="description" placeholder="Tell us about your experience...(Optional)" ></textarea>
                            </div>
                            <button type="submit" class="fw-submit">
                                <span>Send Feedback</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
                                </svg>
                            </button>
                        </form>
                    </div>
                    
                    <div class="fw-tab-content" data-content="chat">
                        <div class="fw-chat">
                            <div class="fw-chat-messages">
                                <div class="fw-message bot">
                                    Hello! I'm here to help. What can I assist you with today? 👋
                                </div>
                            </div>
                            <div class="fw-chat-input-container">
                                <textarea class="fw-chat-input" placeholder="Type your message..." rows="1"></textarea>
                                <button class="fw-chat-send">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
            \`;
            
            document.body.appendChild(this.overlay);
            document.body.appendChild(this.popup);
        }
        
        bindEvents() {
            // Button events
            this.button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePopup();
            });
            
            // Overlay click to close
            this.overlay.addEventListener('click', () => this.closePopup());
            
            // Tab switching
            this.popup.querySelectorAll('.fw-tab').forEach(tab => {
                tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
            });
            
            // Dropdown functionality
            this.setupDropdown();
            
            // Rating selection
            this.popup.querySelectorAll('.fw-rating-option').forEach(option => {
                option.addEventListener('click', () => this.selectRating(option));
            });
            
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
                
                //.log('Selected feedback type:', this.selectedFeedbackType);
            };
        }

        selectRating(option) {
            // Remove previous selection
            this.popup.querySelectorAll('.fw-rating-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Add selection to clicked option
            option.classList.add('selected');
            this.selectedRating = option.querySelector('input').value;
            
            //.log('Selected rating:', this.selectedRating);
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
                const loadingMsg = this.addChatMessage('Thinking...', 'bot');
                loadingMsg.classList.add('fw-loader');

                // Send to API
                fetch(\`\${CONFIG.BASE_API}/api/llm/llmquery\`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userMessage: message, botContext: this.config.botContext || {}  }),
                })
                .then(response => response.json())
                .then(data => {
                    // Remove loading message
                    loadingMsg.remove();
                    
                    // Add bot response
                     const formattedMessage = data.data.replace(/\\n/g, '<br>');
                     //.log(formattedMessage)
    this.addChatMessage(formattedMessage, 'bot');
                })
                .catch(error => {
                    //.error('Error fetching LLM response:', error);
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
            
            if (window.lucide) {
                lucide.createIcons();
            }
        }

        handleFeedbackSubmit(e) {
            const email = this.popup.querySelector("input[name='email']").value;
            const description = this.popup.querySelector("textarea[name='description']").value;
            const rating = this.selectedRating;

            if (!this.selectedFeedbackType || !email  || !rating) {
                this.showNotification('Please fill in all fields and select a feedback type.', 'error');
                return;
            }

            const submitButton = this.popup.querySelector('.fw-submit');
            const originalContent = submitButton.innerHTML;
            
            // Show loading state
            submitButton.innerHTML = \`
                <span>Sending...</span>
                <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
            \`;
            submitButton.disabled = true;

            // Submit feedback
            //.log(this.selectedFeedbackType)
            fetch(\`\${CONFIG.BASE_API}/api/feedback/addfeedback\`, {
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
                    config:this.config
                }),
            })
            .then(response => response.json())
            .then(data => {
                //.log('Feedback submitted successfully:', data);
                
                // Show success state
                submitButton.innerHTML = \`
                    <span>Success! ✓</span>
                \`;
                submitButton.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                
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
                    //.log('Could not post message to parent');
                }
            })
            .catch(error => {
                //.error('Error submitting feedback:', error);
                
                // Show error state
                submitButton.innerHTML = \`
                    <span>Error - Try Again</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="m15 9-6 6"/>
                        <path d="m9 9 6 6"/>
                    </svg>
                \`;
                submitButton.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                
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
    messageEl.className = \`fw-message \${type}\`;
    
    // Use innerHTML instead of textContent to render HTML tags
    if (type === 'bot') {
        messageEl.innerHTML = message;
    } else {
        messageEl.textContent = message;
    }
    
    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return messageEl;
}

        resetForm() {
            // Reset form fields
            this.popup.querySelector("input[name='email']").value = '';
            this.popup.querySelector("textarea[name='description']").value = '';
            
            // Reset rating selection
            this.selectedRating = null;
            this.popup.querySelectorAll('.fw-rating-option').forEach(option => {
                option.classList.remove('selected');
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
            notification.style.cssText = \`
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 16px 24px;
                background: \${type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #10b981, #059669)'};
                color: white;
                border-radius: 16px;
                font-weight: 600;
                z-index: 9999999;
                animation: slideInNotification 0.3s ease;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                backdrop-filter: blur(10px);
                font-family: 'Inter', sans-serif;
                font-size: 14px;
            \`;
            notification.textContent = message;
            
            // Add slide in animation
            const style = document.createElement('style');
            style.textContent = \`
                @keyframes slideInNotification {
                    from {
                        opacity: 0;
                        transform: translateX(100%) translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0) translateY(0);
                    }
                }
            \`;
            document.head.appendChild(style);
            
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.animation = 'slideInNotification 0.3s ease reverse';
                setTimeout(() => {
                    notification.remove();
                    style.remove();
                }, 300);
            }, 4000);
        }
    }

    // Initialize widget
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

})();`;
};
module.exports = {widgetGen};