(function () {
  "use strict";
  const hexToRgb = hex => {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) hex = hex.split("").map(x => x + x).join("");
  const num = parseInt(hex, 16);
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
};
  const CONFIG = {
    //hard coded web url ** render **
    BASE_API: "http://localhost:5000",
  };


  //creating widget class
  class FeedbackSnippet {
    constructor(parameters) {
      this.webUrl = window.location.origin;
      this.pathname = window.location.pathname || "/";
      this.currentPath = window.location.pathname || "/"; // Initialize currentPath
      this.config = null;
      this.isOpen = false;
      this.btnCont=''
      this.selectedFeedbackType = null;
      this.setupRouteDetection();
      this.init();
      this.handleOutsideClick = this.handleOutsideClick.bind(this);
    }

    handleOutsideClick(e) {
  if (!this.modal.contains(e.target) && !this.button.contains(e.target)) {
    this.modal.classList.remove("open");
    this.isOpen = false;
    window.removeEventListener("click", this.handleOutsideClick);
    this.button.innerHTML = this.btnCont;
        lucide.createIcons();
  }
}

    async setupRouteDetection() {
      // Store initial path
      this.currentPath = window.location.pathname || '/';
      
      // Listen for forward and backward navigation (popstate)
      window.addEventListener('popstate', () => {
        this.handleRouteChange('popstate');
      });

      // Listen for hash changes
      window.addEventListener('hashchange', () => {
        this.handleRouteChange('hashchange');
      });

      // MutationObserver for SPA route changes
      if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver((mutations) => {
          const newPath = window.location.pathname;
          if (newPath !== this.currentPath) {
            this.handleRouteChange('mutation');
          }
        });
        
        // Observe changes to the entire document body for SPA navigation
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['href', 'data-path']
        });
        
        // Also observe title changes which often happen during route changes
        observer.observe(document.head, {
          childList: true,
          subtree: true
        });
        
        // Store observer reference for cleanup if needed
        this.routeObserver = observer;
      }
      
      // Additional method: Poll for route changes (fallback)
      this.startRoutePolling();
    }
    
    startRoutePolling() {
      // Fallback polling method for route detection
      setInterval(() => {
        const newPath = window.location.pathname;
        if (newPath !== this.currentPath) {
          this.handleRouteChange('polling');
        }
      }, 500); // Check every 500ms
    }

    handleRouteChange(source) {
      const newPath = window.location.pathname;
      
      if (newPath !== this.currentPath) {
        console.log(`Route changed from ${this.currentPath} to ${newPath} (via ${source})`);
        
        this.currentPath = newPath;
        this.pathname = newPath;
        
        // Close modal if open
        if (this.isOpen) {
          this.displayModal();
        }
        
        // Reload config for new page
        this.loadConfig();
      }
    }
    
    async init() {
      try {
        await this.loadConfig();
        this.createWidget();
        this.addEventListeners();

      } catch (err) {
        console.log(err);
      }
    }


  // Rest of your existing methods...

    async loadConfig() {
      try {
        // hard coded web url*******

        let res = await fetch(
          `${CONFIG.BASE_API}/api/widget/GetWidConfig?webUrl=http://localhost:3001`,
          {
            method: "GET",
          }
        );
        this.config = await res.json();
      } catch (err) {
        console.log(err);
      }
    }

    //widget creation (three parets styling and button ,modal creation)
    createWidget() {
            //lucide icons
      const lucideScript = document.createElement("script");
      lucideScript.src = "https://unpkg.com/lucide@latest";
      lucideScript.onload = () => {
      lucide.createIcons();
     };
      document.head.appendChild(lucideScript);
      this.createStyles();
      this.createButton();
      this.createModal();


    }

    //styling
    createStyles() {
      //font
      const fontLink = document.createElement("link");
      fontLink.rel = "stylesheet";
      fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap";
      document.head.appendChild(fontLink);


      //elements 
      const position = this.config.position.split(" ");
      const style = document.createElement("style");
      const rgb = hexToRgb(this.config.color || "#3b82f6");
      console.log(this.config);
      style.id = "widget_styles";
      style.innerText = ` 
  
      .feedsnap-widget-base-config
      {
        --primary-color:${this.config.color || "#3b82f6"};
        --primary-rgb:${rgb || "#3b82f6"};
        --mode-color:${this.config.bgColor || "#ffffffff"};

        --primary-hover: ${this.config.color || "#3b82f6"};
        --primary-light: ${this.config.color || "#3b82f6"};
        --shadow: 0 10px 25px rgba(0,0,0,0.15);
        --shadow-hover: 0 20px 40px rgba(0,0,0,0.2);
          font-family: 'Inter', sans-serif;
      }

      .feedsnap-button{
      position:fixed;
      color:var(--mode-color);
      background-color:var(--primary-color);
      z-index:9999;
      ${position[0]}:0;
      ${position[1]}:0;
      font-size:20px;
      padding:10px;
      margin:20px;
      border:2px solid var(--primary-color);
      border-radius:15px;
      border-bottom-${position[1]}-radius: 5px;
      cursor: pointer;
      }
 
.feedsnap-container {
    background-color: var(--mode-color);
    height: 550px;
    width: 400px;
    position: fixed;
    ${position[0]}: -230px;
    ${position[1]}: -155px;
    border: 2px solid var(--primary-color);
    border-radius: 15px;
    border-bottom-${position[1]}-radius: 5px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 9999999;
    transform: scale(0) rotate(15deg);
    opacity: 0;
    transition: all cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s;
    transform-origin: ${position[0]} ${position[1]};
    backdrop-filter: blur(10px);
}



.open {
    background-color: var(--mode-color);
    height: 550px;
    z-index: 999999999;
    width: 400px;
    position: fixed;
    ${position[0]}: 100px;
    ${position[1]}: 100px;
    border: 2px solid var(--primary-color);
    border-radius: 15px;
    border-bottom-${position[1]}-radius: 5px;
    display: flex;
    transform: scale(1) rotate(0deg);
    opacity: 1;
    flex-direction: column;
    transition: all cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s;
}

.open::before {
    opacity: 0.8;
}
      .closingButton
      {
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:45px;
      }
        .feedsnap-header
        {
        z-index:-9999999;
        display:flex;
        height:10%;
        justify-content:space-evenly;
        
        }
        .tab_btn {
          background-color:var(--primary-color);
          color:white;
          border: none;
          font-weight: 600;
          height:80%;
          width:50%;
          opacity:0.8;
          transition: all 0.3s ease;
          }
          .feedsnap-header .checked
          {
          opacity:1;
            height:100%;
          }

        .dropdown {
            position: relative;
            display: inline-block;
            width: 100%;
            margin-bottom: 20px;
        }

        .dropdown-button {
            width: 100%;
            padding: 12px 16px;
            background: var(--mode-color);
            border: 2px solid #ddd;
            border-bottom:0px;
            border-radius: 8px 8px 0 0;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 16px;
            transition: all 0.3s ease;
        }

        .dropdown-button:hover {
            border-color: var(--primary-color);
            box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.2);
        }

        .dropdown-button.active {
            border-color: var(--primary-color);
            border-radius: 8px 8px 0 0;
            border-bottom: 2px solid var(--primary-color);
        }

        .arrow {
            transition: transform 0.3s ease;
            font-size: 12px;
            color: #666;
        }

        .arrow.rotated {
            transform: rotate(180deg);
        }

        .dropdown-content {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--mode-color);
            border: 2px solid var(--primary-color);
            border-top: none;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
            z-index: 10000000;
        }

        .dropdown-content.show {
            max-height: 300px;
        }

        .dropdown-item {
            padding: 12px 16px;
            cursor: pointer;
            transition: background-color 0.2s ease;
            border-bottom: 1px solid #f0f0f0;
        }

        .dropdown-item:last-child {
            border-bottom: none;
        }

        .dropdown-item:hover {
            background-color: rgba(var(--primary-rgb), 0.1);
        }

        .dropdown-item.selected {
            background-color: rgba(var(--primary-rgb), 0.2);
            color: var(--primary-color);
            font-weight: 500;
        }

        .underline
        {
          height:2px;
          width:100%;
          border-radius:50px;
        background-color:rgb(169,169,169);
        margin-bottom:20px;
        }
        .highlight
        {
          height:100%;
        width:50%;
        background-color:rgba(var(--primary-rgb) ,0.6);
        border-radius:150px;
        transition: transform 0.3s ease;
        transform: translateX(0%);

        }
        .feedsnap-label
        {
          font-size:20px;
        }
        .feedsnap-select-wrapper
        {
          margin-bottom: 20px;
          width: 100%;
        }
        .radio-options
        {
          width:100%;
          display:flex;
          justify-content:space-evenly;
          margin-bottom: 20px;
          }
          .radio-option img
          {
            height:40px;
            width:40px;
            border-radius:50%;
            
            transition: all 0.2s ease; 
      }
      .radio-option input
      {
      display:none;
      }
.radio-option {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 55px;
  width: 55px;
  border-radius: 15px;
  transition: all 300ms ease-in-out;
}

.radio-option:hover {
  transform: translateY(-4px) scale(1.06);
  
  background-image: linear-gradient(
    to right,
    var(--primary-color),
    color-mix(in srgb, var(--primary-color) 40%, white)
  );
}
 .radio-option input:checked + img {
  transform: scale(1.2);
   filter: drop-shadow(0 0 5px  var(--primary-color));
  border:1px solid var(--primary-color);
}

.feedsnap-input, .feedsnap-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  margin-bottom: 15px;
  font-family: inherit;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.feedsnap-input:focus, .feedsnap-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.feedsnap-textarea {
  min-height: 80px;
  height: 180px;
  resize: vertical;
}

.feedsnap-submit {
  width: 100%;
  padding: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap:10px;
  background: var(--primary-color);
  color: var(--mode-color);
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.feedForm
{
      padding:20px;
      height:90%
}
.feedsnap-submit:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
}
  .showNot
  {
  display: none;
  }
  .ChatBot
  {
    height:90%;
  }
  .playground
  {
  height:85%;
  border-radius: 10px;
  padding: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  }
  .handler
  {
  padding:12px;
    height:15%;
  width:100%;
    display:flex;
      gap:4px;
      justify-content:center;
      align-items:center;
  }
      .handler input
      {
      padding:8px;
      width:100%;
      border: 2px solid color-mix(in srgb, var(--primary-color) 80%, white);
      border-radius:10px;
      outline-color:color-mix(in srgb, var(--primary-color) 80%, white);
      }
      .askAI
      {
      height:40px;
      background-color:var(--primary-color);
      color:white;
      width:50px;
      display:flex;
      justify-content:center;
      align-items:center;
      border-radius:20%;
      }
      .message
      {

  max-width: 70%;
  padding: 10px 15px;
  border-radius: 10px;
  font-size: 16px;
  line-height: 1.4;
  }
  .bot
  {
    
  color:black;
  align-self:flex-start;
  }
  .user
  {
    color:white;

      background-color:var(--primary-color);
      align-self:flex-end;
      }
      `;
      document.head.appendChild(style);
    }

    // button

    createButton() {
      this.button = document.createElement("button");
      this.button.className = "feedsnap-widget-base-config feedsnap-button ";
      this.button.title = `Send Feedback `;
      this.button.setAttribute("aria-label", "Open feedback widget");

      if (this.config.text) {
        this.btnCont = `
        ${this.config.text}
        `;
      } else {
        this.btnCont = `
          <i data-lucide="message-square"></i>
        `;
      }
      this.button.innerHTML = this.btnCont;
      document.body.appendChild(this.button);

    }

    // modal
    createModal() {

      this.modal = document.createElement("div");
      this.modal.className = "feedsnap-container feedsnap-widget-base-config";
      this.modal.innerHTML = `
          <div class="feedsnap-header">
            <button data-set="1" class="tab_btn checked">Feedback </button>
            <button data-set="2" class="tab_btn">Chat Bot</button>
          </div>

          <form data-content="1" id="feedbackForm" class=" feedForm">
          <div class="dropdown" id="myDropdown">
            <div class="dropdown-button" id="dropdownButton">
                <span id="selectedText">Choose feedback type</span>
                <span class="arrow" id="arrow">▼</span>
            </div>
            <div class="dropdown-content" id="dropdownContent">
                <div class="dropdown-item" data-value="bug">Bug Report</div>
                <div class="dropdown-item" data-value="feature">Feature Request</div>
                <div class="dropdown-item" data-value="general">General Feedback</div>
                <div class="dropdown-item" data-value="improvement">Improvement</div>
                <div class="dropdown-item" data-value="complaint">Complaint</div>
            </div>
          </div>

          <div class="radio-options">
              <label class="radio-option">
                  <input type="radio" name="rating" value="1" />
                <img src="http://localhost:5000/images/unhappy.png">
              </label>
              <label class="radio-option">
                <input type="radio" name="rating" value="2" />
              <img src="http://localhost:5000/images/upset.png">
              </label>
              <label class="radio-option">
                <input type="radio" name="rating" value="3" />
                <img src="http://localhost:5000/images/smile.png">
              </label >
              <label class="radio-option">
                <input type="radio" name="rating" value="4" />
                <img src="http://localhost:5000/images/happy.png">
              </label>
              <label class="radio-option">
                <input type="radio" name="rating" value="5" />
                <img src="http://localhost:5000/images/love.png">
              </label>
          </div>
        
          <input type="text" class="feedsnap-input" name="title" placeholder="Brief title (e.g., 'Login button not working')" required>

          <textarea class="feedsnap-textarea" name="description" placeholder="Describe your Story in detail..." required></textarea>

          <button type="submit" class="feedsnap-submit">
            <span class="submit-text">Send Feedback</span>
            <i data-lucide="send"></i>
            </button>
          </form>
          <div  data-content="2" class='showNot ChatBot'>
         
          <div class="playground">
           <div class="message bot">
           Hello there, how can i help you today</div>

      

           <div class="message user">
           You can't do shit nigga! Now FOOK offff

          </div>
          </div>
          <div class="handler">
          <input type='text' name="llmMessage" placeholder='Ask your doubts.....'></input>
          <div class="askAI">            <i data-lucide="send"></i></div>
          
          </div>
            `;
            

      document.body.appendChild(this.modal);
    }
    
    //send feedback
    addSendFeedbackEvent()
    {
      const sendBtn = this.modal.querySelector('.feedsnap-submit');
      console.log('reached the function')
      sendBtn.addEventListener("click", (e)=>{this.sendFeedback(e)});
    }
    //dropdown events - PROPERLY IMPLEMENTED
    addDropdownEvents() {
      const dropdownButton = this.modal.querySelector("#dropdownButton");
      const dropdownContent = this.modal.querySelector(".dropdown-content");
      const arrow = this.modal.querySelector("#arrow");
      const selectedText = this.modal.querySelector("#selectedText");
      const dropdownItems = this.modal.querySelectorAll(".dropdown-item");
      let isDropdownOpen = false;

      // Toggle dropdown on button click
      dropdownButton.addEventListener("click", (e) => {
        e.stopPropagation();
        if (isDropdownOpen) {
          this.closeDropdown();
        } else {
          this.openDropdown();
        }
      });

      // Handle item selection
      dropdownItems.forEach(item => {
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          this.selectDropdownItem(item);
        });
      });

      // Close dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (isDropdownOpen && !this.modal.querySelector(".dropdown").contains(e.target)) {
          this.closeDropdown();
        }
      });

      // Helper methods
      this.openDropdown = () => {
        isDropdownOpen = true;
        dropdownContent.classList.add("show");
        dropdownButton.classList.add("active");
        arrow.classList.add("rotated");
      };

      this.closeDropdown = () => {
        isDropdownOpen = false;
        dropdownContent.classList.remove("show");
        dropdownButton.classList.remove("active");
        arrow.classList.remove("rotated");
      };

      this.selectDropdownItem = (item) => {
        // Remove previous selection
        dropdownItems.forEach(i => i.classList.remove("selected"));
        
        // Add selection to clicked item
        item.classList.add("selected");
        
        // Update display
        selectedText.textContent = item.textContent;
        
        // Store selected value
        this.selectedFeedbackType = item.dataset.value;
        
        // Close dropdown
        this.closeDropdown();
        
        console.log('SelBOT hereected feedback type:', this.selectedFeedbackType);
      };
      this.sendFeedback = (e) => 
        {
          console.log('reached the function')
          e.preventDefault();
          const title = this.modal.querySelector("input[name='title']").value;
          const description = this.modal.querySelector("textarea[name='description']").value;
          const rating = this.modal.querySelector("input[name='rating']:checked")?.value;

          if (!this.selectedFeedbackType || !title || !description || !rating) {
            alert("Please fill in all fields.");
            return;
          }

          // Post data to server
          fetch(`${CONFIG.BASE_API}/api/feedback/addfeedback`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              webUrl: this.webUrl,
              pathname: this.pathname,
              feedbackType: this.selectedFeedbackType,
              title,
              description,
              rating,
            }),
          })
          .then(response => response.json())
          .then(data => {
            console.log("Feedback submitted successfully:", data);
            window.parent.postMessage({ type: "FEEDBACK_SUBMITTED" }, "*");
          })
          .catch(error => {
            console.error("Error submitting feedback:", error);
          });
        }
    }
    
    //EVENT HANDLERS
    addEventListeners() {
      // BUTTON EVENTS
      this.button.addEventListener("click", (e) => {
          e.stopPropagation();
        this.displayModal()
        //
        const tabSwitches = this.modal.querySelectorAll('.tab_btn');
        tabSwitches.forEach(tab => {
          tab.addEventListener("click", (e) => {
            if(tab.classList.contains("checked")) return; // Ignore if already checked
            tabSwitches.forEach(t => t.classList.remove("checked"));
            tab.classList.add("checked");

            const contentId = tab.dataset.set;
            this.modal.querySelectorAll("form[data-content], div[data-content]").forEach(el => {
              el.classList.toggle("show", el.dataset.content === contentId);
              if(el.classList.contains("showNot")) {
                 el.classList.remove("showNot");
              }
              else
                {
                  el.classList.add("showNot");
                }
            });
            console.log('Tab clicked:', e.target.textContent);
          });
        });
      });
      const sendLLMQuery = () => {
        console.log('cliced');
        const userMessage = this.modal.querySelector("input[name='llmMessage']");
        if(userMessage.value.trim() === "") {
          return;
        }
        fetch(`${CONFIG.BASE_API}/api/llm/llmquery`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userMessage:userMessage.value }),
        })
        .then(response => response.json())
        .then(data => {
          console.log("LLM response:", data);
        })
        .catch(error => {
          console.error("Error fetching LLM response:", error);
        });
        userMessage.value = ""; 
      };
      const askAI = this.modal.querySelector('.askAI');
      askAI.addEventListener('click', sendLLMQuery);
      // ADD DROPDOWN EVENTS
      this.addDropdownEvents();
      this.addSendFeedbackEvent();

    }

    //functions or events

 displayModal() {
  console.log(this.isOpen);
  if (this.isOpen) {
    this.button.classList.remove("closingButton");
    this.button.innerHTML = this.btnCont;
    this.modal.classList.remove("open");
    console.log('we are closing');
    lucide.createIcons();
    window.removeEventListener('click', this.handleOutsideClick);
  } else {
    this.button.innerHTML = `<i data-lucide="chevron-down"></i>`;
    this.modal.classList.add("open");
    console.log('we are adding');
    this.button.classList.add("closingButton");
    lucide.createIcons();
    window.addEventListener('click', this.handleOutsideClick);
  }
  console.log('changing');
  this.isOpen = !this.isOpen;
  console.log(this.isOpen);
}
  }
  
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => new FeedbackSnippet());
  } else {
    new FeedbackSnippet();
  }
})();

