(function () {
  const webUrl = window.location.origin;
  if (!webUrl) return;

  let currentPathname = window.location.pathname == ''?"/":window.location.pathname ;

  // route change tracker for SPA 
  function onRouteChange(callback) {
    let lastUrl = location.href;

    new MutationObserver(() => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        callback(currentUrl);
      }
    }).observe(document, { subtree: true, childList: true });

    window.addEventListener('popstate', () => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        callback(currentUrl);
      }
    });
  }
// route change tracker for non SPA 
  onRouteChange(() => {
    currentPathname = window.location.pathname;
    const iframe = document.getElementById("feedback-widget-iframe");
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: "ROUTE_CHANGE",
          pathname: currentPathname,
          webUrl
        },
        "http://localhost:3002"
      );
    }
  });
  // getting data related website for customization and validation
  try {
    fetch(`http://localhost:5000/api/widget/GetWidConfig?webUrl=${webUrl}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Widget fetch successful:", data);

        const modal = document.createElement("div");
        modal.id = "feedback-widget-modal";
        modal.style.cssText = `
          display: none;
          position: fixed;
          backdrop-filter: blur(5px);      
          -webkit-backdrop-filter: blur(5px);
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          justify-content: center;
          align-items: center;
          z-index: 999999;
        `;


        // adding iframe
        const iframe = document.createElement("iframe");
        iframe.id = "feedback-widget-iframe";
        iframe.src = `http://localhost:3002?webUrl=${webUrl}`;
        iframe.style.cssText = `
          width: 70vw;
          max-width: 400px;
          height: 90vh;
          max-height: 550px;
          border: none;
          border-radius: 18px;
          background: white;
        `;
        modal.appendChild(iframe);
        document.body.appendChild(modal);

        // adding button
        const button = document.createElement("button");
        const arr = data.position.split(' ');
        let lucidLoad = false;

        button.title = "Send Feedback";
        button.style.cssText += `
          position: fixed;
          ${arr[1]}:20px;
          ${arr[0]}: 20px;
          padding: 9px;
          border-radius: 10px;
          border: none;
          background: ${data.color};
          color: white;
          font-size: 24px;
          cursor: pointer;
          z-index: 999999;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        `;

        if (data.text === '') {
          lucidLoad = true;
          button.style.cssText += `height: 60px;  width: 60px;   border-radius: 50%;`
        } else {
          button.innerText = data.text;
        }

        const icon = document.createElement("i");
        icon.setAttribute("data-lucide", "message-square");
        button.appendChild(icon);

        button.addEventListener("mouseenter", () => {
          button.style.transform = "scale(1.08)";
        });

        button.addEventListener("mouseleave", () => {
          button.style.transform = "scale(1)";
        });

        document.body.appendChild(button);
        // lucide icon
        const lucideScript = document.createElement("script");
        lucideScript.src = "https://unpkg.com/lucide@latest/dist/umd/lucide.js";
        lucideScript.onload = () => {
          lucide.createIcons();
        };
        if (lucidLoad) {
          document.head.appendChild(lucideScript);
        }

        button.addEventListener("click", () => {
          modal.style.display = "flex";
          button.style.display = "none";
        });

        modal.addEventListener("click", (e) => {
          if (e.target === modal) {
            modal.style.display = "none";
            button.style.display = "flex";
          }
        });

        // for closing the feedback widget
        window.addEventListener('message',(event)=>
          {
            console.log('yo');
            if(event.origin !== 'http://localhost:3002') return;
            if (event.data.type === "FEEDBACK_SUBMITTED") {
                          modal.style.display = "none";
            button.style.display = "flex";
            } 
          })

          // post man for validation and data providing securely
        iframe.onload = () => {
          setTimeout(() => {
            iframe.contentWindow.postMessage(
              {
                type: "FEEDBACK_WIDGET_CONFIG",
                payload: data,
                webUrl,
                pathname: currentPathname
              },
              "http://localhost:3002"
            );
          });
        };
      });
  } catch (err) {
    console.error("❌ Widget fetch failed:", err);
  }
})();
