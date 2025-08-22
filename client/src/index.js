import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { SidebarContextprovider } from './context/sidebarContext';
// import { CopilotKit } from "@copilotkit/react-core"; // ✅ Correct import
import "@copilotkit/react-ui/styles.css";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <CopilotKit // ✅ This was correct in your original code
      runtimeUrl="http://localhost:5000/api/copilot/getdata"
      // Remove instructions from here - put them in CopilotChat component instead
      runtimeFetch={async (input, init = {}) => {
        const modifiedInit = {
          ...init,
          credentials: "include",
        };
        
        console.log("Modified fetch config:", modifiedInit);
        
        const response = await window.fetch(input, modifiedInit);
        
        console.log("Response status:", response.status);
        return response;
      }}
    > */}
      <SidebarContextprovider>
        <App />
      </SidebarContextprovider>
    {/* </CopilotKit> */}
  </React.StrictMode>
);

reportWebVitals();