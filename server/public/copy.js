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

  let buttonContent;
  //creating widget class
  class FeedbackSnippet {
    constructor(parameters) {
      this.webUrl = window.location.origin;
      this.pathname = window.location.pathname || "/";
      this.config = null;
      this.isOpen = false;
      this.selectedFeedbackType = null;
      this.init();
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
      this.addTabSwitchingEvents()


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
      .feedsnap-modal
      {

      top:0;
      left:0;
      height:100%;
      width:100%;
      position:fixed;
      z-index:9999999;
      display:none;
      
      }
        .feedsnap-container{
                  justify-content: space-between;
        background-color:var(--mode-color);
        height:550px;
        width:400px;
        position:fixed;
        ${position[0]}:100px;
        ${position[1]}:100px;
        border: 2px solid rgba(var(--primary-rgb) ,0.6);
        border-radius:15px;
        border-bottom-${position[1]}-radius: 5px;
        padding:20px;
        display:flex;
        flex-direction:column;
        overflow: visible;
        }
      .open
      {
      display:flex;
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
        display:flex;
        justify-content:space-evenly;
        }
          background: none;
          border: none;
          cursor: pointer;
          padding: 10px 20px;
          font-size: 16px;
          transition: all 0.3s ease;
        }
        .tab_btn {
          color: var(--primary-color);
          font-weight: 600;
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
            height:35px;
            width:35px;
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
  height: 50px;
  width: 50px;
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
  resize: vertical;
}

.feedsnap-submit {
  width: 100%;
  padding: 12px;
  background: var(--primary-color);
  color: var(--mode-color);
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.feedsnap-submit:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
}
      `;
      document.head.appendChild(style);
    }

    // button

    createButton() {
      this.button = document.createElement("button");
      this.button.className = "feedsnap-widget-base-config feedsnap-button ";
      this.button.title = "Send Feedback";
      this.button.setAttribute("aria-label", "Open feedback widget");

      if (this.config.text) {
        buttonContent = `
        ${this.config.text}
        `;
      } else {
        buttonContent = `
           <i data-lucide="home"></i>
        `;
      }
      this.button.innerHTML = buttonContent;
      document.body.appendChild(this.button);

    }

    // modal
    createModal() {

      this.modal = document.createElement("div");
      this.modal.className = "feedsnap-modal";
      this.modal.innerHTML = `
        <div class="feedsnap-container feedsnap-widget-base-config">
          <div class="feedsnap-header">
            <button class="tab_btn active">Feedback </button>
            <button class="tab_btn">Let's Chat</button>
          </div>

          <div class="underline">
            <div class="highlight"></div>
          </div>
          
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
          
          <textarea class="feedsnap-textarea" name="description" placeholder="Describe your feedback in detail..." required></textarea>
          
          <button type="submit" class="feedsnap-submit">
            <span class="submit-text">Send Feedback</span>
          </button>
        </div>
      `;

      document.body.appendChild(this.modal);
    }
    
    //tab switching events - FIXED
    addTabSwitchingEvents() {
      const btns = this.modal.querySelectorAll('.tab_btn');
      const highlight = this.modal.querySelector('.highlight');

      btns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
          // Remove active class from all buttons
          btns.forEach(b => b.classList.remove('active'));
          // Add active class to clicked button
          btn.classList.add('active');
          // Move highlight
          highlight.style.transform = `translateX(${index * 100}%)`;
        });
      });
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
        
        console.log('Selected feedback type:', this.selectedFeedbackType);
      };
    }
    
    //EVENT HANDLERS
    addEventListeners() {
      // BUTTON EVENTS
      this.button.addEventListener("click", () => this.displayModal());
      this.modal.addEventListener("click", (e) => {
        if (e.target == this.modal) {
          this.displayModal();
        }
      });
      
      // ADD DROPDOWN EVENTS
      this.addDropdownEvents();
    }

    //functions or events
    displayModal() {
      console.log(this.isOpen);
      if (this.isOpen) {
        this.button.classList.remove("closingButton");
        this.button.innerHTML = buttonContent;
        this.modal.classList.remove("open");
         lucide.createIcons();
        } else {
          this.button.innerHTML = `<i data-lucide="chevron-down"></i>`;
          this.modal.classList.add("open");
          this.button.classList.add("closingButton");
          lucide.createIcons();
      }
      this.isOpen = !this.isOpen;
    }
  }
  
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => new FeedbackSnippet());
  } else {
    new FeedbackSnippet();
  }
})();