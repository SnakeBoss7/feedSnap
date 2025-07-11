(async () => {
  const webUrl = window.location.origin;
  if (!webUrl) return;

  try {
    const res = await fetch(`http://localhost:5000/api/widget/GetWidConfig?webUrl=${webUrl}`);
    const data = await res.json();
    console.log("✅ Widget fetch successful:", data);

    // Create modal container
    const modal = document.createElement("div");
    modal.id = "feedback-widget-modal";
    modal.style.cssText = `
      display: none;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      justify-content: center;
      align-items: center;
      z-index: 999999;
    `;

    // Create iframe inside modal
    const iframe = document.createElement("iframe");
    iframe.src = "http://localhost:3002/widget";
    iframe.style.cssText = `
      width: 400px;
      height: 600px;
      border: none;
      border-radius: 12px;
      background: white;
    `;
    modal.appendChild(iframe);
    document.body.appendChild(modal);

    // Create floating feedback button
    const button = document.createElement("button");
    button.innerText = "💬";
    button.title = "Send Feedback";
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: none;
      background: ${data.themeColor || "#4f46e5"};
      color: white;
      font-size: 24px;
      cursor: pointer;
      z-index: 999999;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(button);

    // Show modal on button click
    button.addEventListener("click", () => {
      modal.style.display = "flex";
    });

    // Close modal if background is clicked
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });

    // Send config to iframe once it's ready
    iframe.onload = () => {
      iframe.contentWindow.postMessage(
        {
          type: "FEEDBACK_WIDGET_CONFIG",
          payload: data, // includes emailRequired, themeColor, etc.
        },
        "*"
      );
    };
  } catch (err) {
    console.error("❌ Widget fetch failed:", err);
  }
})();
