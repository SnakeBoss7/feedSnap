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
  // <React.StrictMode>  ← Comment this out
    <SidebarContextprovider>
      <App />
    </SidebarContextprovider>
  // </React.StrictMode>  ← Comment this out
);
reportWebVitals();