(function() {
  'use strict';
  
  // Configuration
  const CONFIG = {
    API_BASE: 'https://api.feedsnap.io',
    WIDGET_VERSION: '1.0.0',
    MAX_RETRIES: 3,
    ANIMATION_DURATION: 300
  };

  class FeedSnapWidget {
    constructor() {
      this.webUrl = window.location.origin;
      this.currentPath = window.location.pathname || '/';
      this.isOpen = false;
      this.config = null;
      this.retryCount = 0;
      this.uploadedFiles = [];
      
      this.init();
    }

    async init() {
      try {
        await this.loadConfig();
        this.createWidget();
        this.setupRouteTracking();
        this.setupEventListeners();
      } catch (error) {
        console.error('FeedSnap Widget failed to initialize:', error);
        this.handleError(error);
      }
    }

    async loadConfig() {
      const response = await fetch(
        `${CONFIG.API_BASE}/api/widget/config?webUrl=${encodeURIComponent(this.webUrl)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Widget-Version': CONFIG.WIDGET_VERSION
          }
        }
      );
      
      if (!response.ok) throw new Error(`Config fetch failed: ${response.status}`);
      this.config = await response.json();
    }

    createWidget() {
      this.createStyles();
      this.createButton();
      this.createModal();
    }

    createStyles() {
      const style = document.createElement('style');
      style.id = 'feedsnap-styles';
      style.textContent = `
        .feedsnap-widget {
          --primary-color: ${this.config.color || '#3b82f6'};
          --primary-hover: ${this.adjustColor(this.config.color || '#3b82f6', -20)};
          --primary-light: ${this.adjustColor(this.config.color || '#3b82f6', 40)};
          --shadow: 0 10px 25px rgba(0,0,0,0.15);
          --shadow-hover: 0 20px 40px rgba(0,0,0,0.2);
        }

        .feedsnap-button {
          position: fixed;
          ${this.getPosition()};
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: ${this.config.text ? '12px' : '50%'};
          padding: ${this.config.text ? '12px 20px' : '16px'};
          font-size: ${this.config.text ? '14px' : '20px'};
          font-weight: 600;
          cursor: pointer;
          box-shadow: var(--shadow);
          transition: all ${CONFIG.ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 999998;
          display: flex;
          align-items: center;
          gap: 8px;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .feedsnap-button:hover {
          transform: translateY(-2px) scale(1.05);
          background: var(--primary-hover);
          box-shadow: var(--shadow-hover);
        }

        .feedsnap-button:active {
          transform: translateY(0) scale(0.98);
        }

        .feedsnap-modal {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          opacity: 0;
          visibility: hidden;
          transition: all ${CONFIG.ANIMATION_DURATION}ms ease;
        }

        .feedsnap-modal.open {
          opacity: 1;
          visibility: visible;
        }

        .feedsnap-container {
          background: white;
          border-radius: 16px;
          width: min(420px, 90vw);
          max-height: min(650px, 90vh);
          box-shadow: 0 25px 50px rgba(0,0,0,0.25);
          transform: scale(0.9) translateY(20px);
          transition: all ${CONFIG.ANIMATION_DURATION}ms cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: hidden;
        }

        .feedsnap-modal.open .feedsnap-container {
          transform: scale(1) translateY(0);
        }

        .feedsnap-header {
          background: var(--primary-color);
          color: white;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .feedsnap-close {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .feedsnap-close:hover {
          background: rgba(255,255,255,0.2);
        }

        .feedsnap-content {
          padding: 24px;
          max-height: 450px;
          overflow-y: auto;
        }

        .feedsnap-tabs {
          display: flex;
          border-bottom: 2px solid #f1f5f9;
          margin-bottom: 20px;
        }

        .feedsnap-tab {
          flex: 1;
          padding: 12px;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 600;
          color: #64748b;
          transition: all 0.2s;
          border-bottom: 2px solid transparent;
        }

        .feedsnap-tab.active {
          color: var(--primary-color);
          border-bottom-color: var(--primary-color);
        }

        .feedsnap-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .feedsnap-input, .feedsnap-textarea {
          padding: 12px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
          font-family: inherit;
        }

        .feedsnap-input:focus, .feedsnap-textarea:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .feedsnap-textarea {
          resize: vertical;
          min-height: 100px;
        }

        /* Custom Select Dropdown */
        .feedsnap-select-wrapper {
          position: relative;
        }

        .feedsnap-select {
          width: 100%;
          padding: 12px 40px 12px 12px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
        }

        .feedsnap-select:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .feedsnap-select-arrow {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #64748b;
          transition: transform 0.2s;
        }

        .feedsnap-select:focus + .feedsnap-select-arrow {
          transform: translateY(-50%) rotate(180deg);
        }

        /* Custom Drop Zone */
        .feedsnap-dropzone {
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          background: #f9fafb;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .feedsnap-dropzone:hover {
          border-color: var(--primary-color);
          background: var(--primary-light);
        }

        .feedsnap-dropzone.drag-over {
          border-color: var(--primary-color);
          background: var(--primary-light);
          transform: scale(1.02);
        }

        .feedsnap-dropzone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .feedsnap-dropzone-icon {
          width: 48px;
          height: 48px;
          color: #9ca3af;
          transition: color 0.3s;
        }

        .feedsnap-dropzone:hover .feedsnap-dropzone-icon,
        .feedsnap-dropzone.drag-over .feedsnap-dropzone-icon {
          color: var(--primary-color);
        }

        .feedsnap-dropzone-text {
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
        }

        .feedsnap-dropzone-subtext {
          color: #9ca3af;
          font-size: 12px;
        }

        .feedsnap-file-input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .feedsnap-file-preview {
          margin-top: 12px;
          padding: 12px;
          background: #f1f5f9;
          border-radius: 8px;
          display: none;
        }

        .feedsnap-file-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: white;
          border-radius: 6px;
          margin-bottom: 8px;
        }

        .feedsnap-file-item:last-child {
          margin-bottom: 0;
        }

        .feedsnap-file-icon {
          width: 32px;
          height: 32px;
          background: var(--primary-color);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        .feedsnap-file-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .feedsnap-file-name {
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
        }

        .feedsnap-file-size {
          font-size: 12px;
          color: #6b7280;
        }

        .feedsnap-file-remove {
          background: #ef4444;
          border: none;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: background 0.2s;
        }

        .feedsnap-file-remove:hover {
          background: #dc2626;
        }

        .feedsnap-submit {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .feedsnap-submit:hover:not(:disabled) {
          background: var(--primary-hover);
        }

        .feedsnap-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .feedsnap-loading {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @media (max-width: 480px) {
          .feedsnap-container {
            width: 95vw;
            margin: 20px;
          }
          
          .feedsnap-dropzone {
            padding: 16px;
          }
        }
      `;
      document.head.appendChild(style);
    }

    createButton() {
      this.button = document.createElement('button');
      this.button.className = 'feedsnap-widget feedsnap-button';
      this.button.title = 'Send Feedback';
      this.button.setAttribute('aria-label', 'Open feedback widget');
      
      if (this.config.text) {
        this.button.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
          ${this.config.text}
        `;
      } else {
        this.button.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
        `;
      }
      
      document.body.appendChild(this.button);
    }

    createModal() {
      this.modal = document.createElement('div');
      this.modal.className = 'feedsnap-modal';
      this.modal.innerHTML = `
        <div class="feedsnap-container">
          <div class="feedsnap-header">
            <h3>Send Feedback</h3>
            <button class="feedsnap-close" aria-label="Close">&times;</button>
          </div>
          <div class="feedsnap-content">
            <div class="feedsnap-tabs">
              <button class="feedsnap-tab active" data-tab="feedback">Feedback</button>
              <button class="feedsnap-tab" data-tab="chat">Chat</button>
            </div>
            <div id="feedsnap-feedback-tab">
              <form class="feedsnap-form" id="feedsnap-form">
                <div class="feedsnap-select-wrapper">
                  <select class="feedsnap-select" name="type" required>
                    <option value="">Select feedback type...</option>
                    <option value="bug">🐛 Bug Report</option>
                    <option value="feature">💡 Feature Request</option>
                    <option value="general">💬 General Feedback</option>
                    <option value="improvement">⚡ Improvement</option>
                    <option value="complaint">😔 Complaint</option>
                  </select>
                  <svg class="feedsnap-select-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6,9 12,15 18,9"></polyline>
                  </svg>
                </div>
                
                <input type="text" class="feedsnap-input" name="title" placeholder="Brief title (e.g., 'Login button not working')" required>
                
                <textarea class="feedsnap-textarea" name="description" placeholder="Describe your feedback in detail..." required></textarea>
                
                <div class="feedsnap-dropzone" id="feedsnap-dropzone">
                  <div class="feedsnap-dropzone-content">
                    <svg class="feedsnap-dropzone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                    <div class="feedsnap-dropzone-text">Drop files here or click to upload</div>
                    <div class="feedsnap-dropzone-subtext">Screenshots, documents, or any relevant files</div>
                  </div>
                  <input type="file" class="feedsnap-file-input" name="files" multiple accept="image/*,.pdf,.doc,.docx,.txt">
                </div>
                
                <div class="feedsnap-file-preview" id="feedsnap-file-preview"></div>
                
                <button type="submit" class="feedsnap-submit">
                  <span class="submit-text">Send Feedback</span>
                </button>
              </form>
            </div>
            <div id="feedsnap-chat-tab" style="display: none;">
              <div id="feedsnap-chat-messages" style="height: 200px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
                <div style="color: #64748b; text-align: center; padding: 20px;">
                  👋 Hi! I'm here to help. Ask me anything about this website!
                </div>
              </div>
              <div style="display: flex; gap: 8px;">
                <input type="text" id="feedsnap-chat-input" class="feedsnap-input" placeholder="Type your message..." style="flex: 1;">
                <button id="feedsnap-chat-send" class="feedsnap-submit">Send</button>
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(this.modal);
    }

    setupEventListeners() {
      // Button click
      this.button.addEventListener('click', () => this.openModal());
      
      // Modal close
      const closeBtn = this.modal.querySelector('.feedsnap-close');
      closeBtn.addEventListener('click', () => this.closeModal());
      
      // Modal backdrop click
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.closeModal();
      });
      
      // Tab switching
      const tabs = this.modal.querySelectorAll('.feedsnap-tab');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
      });
      
      // Form submission
      const form = this.modal.querySelector('#feedsnap-form');
      form.addEventListener('submit', (e) => this.handleFeedbackSubmit(e));
      
      // File upload handling
      this.setupFileUpload();
      
      // Chat functionality
      const chatInput = this.modal.querySelector('#feedsnap-chat-input');
      const chatSend = this.modal.querySelector('#feedsnap-chat-send');
      
      chatSend.addEventListener('click', () => this.sendChatMessage());
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.sendChatMessage();
      });
      
      // Keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) this.closeModal();
      });
    }

    setupFileUpload() {
      const dropzone = this.modal.querySelector('#feedsnap-dropzone');
      const fileInput = this.modal.querySelector('.feedsnap-file-input');
      const filePreview = this.modal.querySelector('#feedsnap-file-preview');

      // Drag and drop events
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-over');
      });

      dropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        if (!dropzone.contains(e.relatedTarget)) {
          dropzone.classList.remove('drag-over');
        }
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files);
        this.handleFiles(files);
      });

      // Click to upload
      fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        this.handleFiles(files);
      });
    }

    handleFiles(files) {
      const filePreview = this.modal.querySelector('#feedsnap-file-preview');
      
      files.forEach(file => {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          this.showError(`File "${file.name}" is too large. Maximum size is 10MB.`);
          return;
        }
        
        this.uploadedFiles.push(file);
        this.addFilePreview(file);
      });

      if (this.uploadedFiles.length > 0) {
        filePreview.style.display = 'block';
      }
    }

    addFilePreview(file) {
      const filePreview = this.modal.querySelector('#feedsnap-file-preview');
      const fileItem = document.createElement('div');
      fileItem.className = 'feedsnap-file-item';
      
      const fileExt = file.name.split('.').pop().toUpperCase().substring(0, 3);
      const fileSize = this.formatFileSize(file.size);
      
      fileItem.innerHTML = `
        <div class="feedsnap-file-icon">${fileExt}</div>
        <div class="feedsnap-file-info">
          <div class="feedsnap-file-name">${file.name}</div>
          <div class="feedsnap-file-size">${fileSize}</div>
        </div>
        <button type="button" class="feedsnap-file-remove" onclick="this.parentElement.remove()">&times;</button>
      `;
      
      // Remove file from array when removed from preview
      const removeBtn = fileItem.querySelector('.feedsnap-file-remove');
      removeBtn.addEventListener('click', () => {
        const index = this.uploadedFiles.indexOf(file);
        if (index > -1) {
          this.uploadedFiles.splice(index, 1);
        }
        fileItem.remove();
        
        if (this.uploadedFiles.length === 0) {
          filePreview.style.display = 'none';
        }
      });
      
      filePreview.appendChild(fileItem);
    }

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    setupRouteTracking() {
      // SPA route tracking
      let lastUrl = location.href;
      
      const observer = new MutationObserver(() => {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
          lastUrl = currentUrl;
          this.currentPath = window.location.pathname;
        }
      });
      
      observer.observe(document, { subtree: true, childList: true });
      
      window.addEventListener('popstate', () => {
        this.currentPath = window.location.pathname;
      });
    }

    openModal() {
      this.isOpen = true;
      this.modal.classList.add('open');
      this.button.style.display = 'none';
      document.body.style.overflow = 'hidden';
    }

    closeModal() {
      this.isOpen = false;
      this.modal.classList.remove('open');
      this.button.style.display = 'flex';
      document.body.style.overflow = '';
      
      // Reset form and files
      this.uploadedFiles = [];
      const filePreview = this.modal.querySelector('#feedsnap-file-preview');
      filePreview.innerHTML = '';
      filePreview.style.display = 'none';
    }

    switchTab(tab) {
      const tabs = this.modal.querySelectorAll('.feedsnap-tab');
      const feedbackTab = this.modal.querySelector('#feedsnap-feedback-tab');
      const chatTab = this.modal.querySelector('#feedsnap-chat-tab');
      
      tabs.forEach(t => t.classList.remove('active'));
      this.modal.querySelector(`[data-tab="${tab}"]`).classList.add('active');
      
      if (tab === 'feedback') {
        feedbackTab.style.display = 'block';
        chatTab.style.display = 'none';
      } else {
        feedbackTab.style.display = 'none';
        chatTab.style.display = 'block';
      }
    }

    async handleFeedbackSubmit(e) {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData();
      const submitBtn = form.querySelector('.feedsnap-submit');
      const submitText = submitBtn.querySelector('.submit-text');
      
      // Add form data
      const type = form.type.value;
      const title = form.title.value;
      const description = form.description.value;
      
      formData.append('type', type);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('webUrl', this.webUrl);
      formData.append('currentPath', this.currentPath);
      
      // Add files
      this.uploadedFiles.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });
      
      // Update button state
      submitBtn.disabled = true;
      submitText.textContent = 'Sending...';
      submitBtn.insertAdjacentHTML('afterbegin', '<div class="feedsnap-loading"></div>');
      
      try {
        const response = await fetch(`${CONFIG.API_BASE}/api/feedback/submit`, {
          method: 'POST',
          body: formData,
          headers: {
            'X-Web-URL': this.webUrl,
            'X-Page-Path': this.currentPath,
            'X-Widget-Version': CONFIG.WIDGET_VERSION
          }
        });
        
        if (response.ok) {
          this.showSuccess('Feedback sent successfully! Thank you for helping us improve.');
          form.reset();
          this.uploadedFiles = [];
          const filePreview = this.modal.querySelector('#feedsnap-file-preview');
          filePreview.innerHTML = '';
          filePreview.style.display = 'none';
          setTimeout(() => this.closeModal(), 2500);
        } else {
          throw new Error('Failed to send feedback');
        }
      } catch (error) {
        this.showError('Failed to send feedback. Please try again.');
        console.error('Feedback submission error:', error);
      } finally {
        submitBtn.disabled = false;
        submitText.textContent = 'Send Feedback';
        const loader = submitBtn.querySelector('.feedsnap-loading');
        if (loader) loader.remove();
      }
    }

    async sendChatMessage() {
      const input = this.modal.querySelector('#feedsnap-chat-input');
      const message = input.value.trim();
      
      if (!message) return;
      
      // Add user message
      this.addChatMessage(message, 'user');
      input.value = '';
      
      try {
        const response = await fetch(`${CONFIG.API_BASE}/api/chat/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Web-URL': this.webUrl,
            'X-Page-Path': this.currentPath
          },
          body: JSON.stringify({ message, webUrl: this.webUrl })
        });
        
        const data = await response.json();
        this.addChatMessage(data.response, 'bot');
      } catch (error) {
        this.addChatMessage('Sorry, I encountered an error. Please try again.', 'bot');
      }
    }

    addChatMessage(message, sender) {
      const messages = this.modal.querySelector('#feedsnap-chat-messages');
      const messageEl = document.createElement('div');
      messageEl.style.cssText = `
        margin-bottom: 12px;
        padding: 8px 12px;
        border-radius: 8px;
        ${sender === 'user' 
          ? 'background: var(--primary-color); color: white; margin-left: 20%; text-align: right;' 
          : 'background: #f1f5f9; color: #1e293b; margin-right: 20%;'
        }
      `;
      messageEl.textContent = message;
      messages.appendChild(messageEl);
      messages.scrollTop = messages.scrollHeight;
    }

    showSuccess(message) {
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed; top: 20px; right: 20px;
        background: #10b981; color: white;
        padding: 12px 20px; border-radius: 8px;
        font-weight: 600; z-index: 1000000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      `;
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.remove();
      }, 4000);
    }

    showError(message) {
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed; top: 20px; right: 20px;
        background: #ef4444; color: white;
        padding: 12px 20px; border-radius: 8px;
        font-weight: 600; z-index: 1000000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      `;
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.remove();
      }, 4000);
    }

    getPosition() {
      const [vertical, horizontal] = (this.config.position || 'bottom right').split(' ');
      return `${vertical}: 20px; ${horizontal}: 20px;`;
    }

    adjustColor(color, amount) {
      const num = parseInt(color.replace("#", ""), 16);
      const amt = Math.round(2.55 * amount);
      const R = (num >> 16) + amt;
      const G = (num >> 8 & 0x00FF) + amt;
      const B = (num & 0x0000FF) + amt;
      return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    handleError(error) {
      if (this.retryCount < CONFIG.MAX_RETRIES) {
        this.retryCount++;
        setTimeout(() => this.init(), 1000 * this.retryCount);
      } else {
        console.error('FeedSnap Widget failed to load after retries');
      }
    }
  }

  // Initialize widget when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new FeedSnapWidget());
  } else {
    new FeedSnapWidget();
  }

})();