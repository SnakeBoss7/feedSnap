(async () => {
  const webUrl = window.location.origin;
  if (!webUrl) return;

  try {
    const res = await fetch(`http://localhost:5000/api/widget/GetWidConfig?webUrl=${webUrl}`);
    const data = await res.json();

    if (data && data.position && data.color && data.text) {
      // 🌟 1. Create Floating Button
      const btn = document.createElement("button");
      btn.innerText = data.text;
      btn.style.position = "fixed";
      const [vertical, horizontal] = data.position.split(" ");
      btn.style[vertical] = "20px";
      btn.style[horizontal] = "20px";
      btn.style.backgroundColor = data.color;
      btn.style.color = "#fff";
      btn.style.padding = "10px 15px";
      btn.style.borderRadius = "5px";
      btn.style.zIndex = 9999;
      btn.style.cursor = "pointer";

      // 🌟 2. Create Feedback Modal
      const modal = document.createElement("div");
      modal.style.position = "fixed";
      modal.style.top = 0;
      modal.style.left = 0;
      modal.style.width = "100vw";
      modal.style.height = "100vh";
      modal.style.background = "rgba(0, 0, 0, 0.5)";
      modal.style.display = "none";
      modal.style.justifyContent = "center";
      modal.style.alignItems = "center";
      modal.style.zIndex = 10000;

      modal.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 8px; width: 400px; z-index-999999; box-shadow: 0 0 10px rgba(0,0,0,0.3)">
          <h3 style="margin-top: 0">Report Issue</h3>
          <p>Help us improve sharing your feedback</p>
          <label>Report Type * </lable>
          <input></>
          <textarea id="fs-feedback" style="width: 100%; height: 450px; resize: none"></textarea>
          <button id="fs-submit" style="margin-top: 10px; background: ${data.color}; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">Submit</button>
          <button id="fs-cancel" style="margin-top: 10px; margin-left: 10px; background: gray; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">Cancel</button>
        </div>
      `;

      // 🌟 3. Add event listeners
      btn.onclick = () => {
        modal.style.display = "flex";
      };

      modal.querySelector("#fs-cancel").onclick = () => {
        modal.style.display = "none";
      };

      modal.querySelector("#fs-submit").onclick = async () => {
        const feedback = modal.querySelector("#fs-feedback").value;
        const route = window.location.pathname;

        if (!feedback.trim()) {
          alert("Please enter your feedback.");
          return;
        }

        try {
          await fetch("http://localhost:5000/api/feedback/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ webUrl, route, feedback }),
          });
          alert("✅ Feedback submitted!");
          modal.style.display = "none";
        } catch (err) {
          alert("❌ Failed to send feedback.");
          console.error(err);
        }
      };

      // 🌟 4. Add to page
      document.body.appendChild(btn);
      document.body.appendChild(modal);
    }
  } catch (err) {
    console.error("❌ Widget fetch failed:", err);
  }
})();
