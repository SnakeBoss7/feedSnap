import { SimpleHeader } from "../../../components/header/header";
import {
  LucideCode,
  Code,
  LucideCopy,
  LucideDownload,
  Check,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { HighlightedGridIcon } from "../../../utils/gridIcons";
import Loader from "../../../components/loader/loader";
import WidgetTabs from "../../../components/tabs/tabs";

let apiUrl = process.env.REACT_APP_API_URL;
let frontendApiUrl = process.env.REACT_APP_API_FRONTEND_URL;

export const ScriptGen = () => {
  //widget color
  const [scriptInj, setScriptInj] = useState("");
  const [showDemo, setShowDemo] = useState(false);
  const [copied, setCopied] = useState(false);
  const [UrlSettings, setUrlsettings] = useState({
    webUrl: "",
    position: "bottom right",
    color: "#2563EB",
    bgColor: "#ffffff",
    text: "Feedback",
    loading: false,
    botContext: "",
    ackMail:true,
  });

  const copyToClipboard = async (opt,text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(opt);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);

    }
  };

  const fileDownload = () => {
    console.log("download");
    const text = scriptInj;
    const blog = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blog);
    let link = document.createElement('a');
    link.href = url;
    link.download = 'script.js';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const colorChange = (e) => {
    setUrlsettings((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    console.log(e.target.name);
    console.log(e.target.value);
  };

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const genScript = async (e) => {
    console.log("genScript called with UrlSettings:", UrlSettings);
    e.preventDefault();

    // Fixed validation logic - check if webUrl is empty (the main required field)
    if (!UrlSettings.webUrl || UrlSettings.webUrl.trim() === "") {
      console.warn("Website URL is required");
      return;
    }

    // Optional: More detailed validation
    const requiredFields = ["webUrl", "position", "color"];
    const emptyFields = requiredFields.filter(
      (field) => !UrlSettings[field] || UrlSettings[field].trim() === ""
    );
    console.log(UrlSettings);
    if (emptyFields.length > 0) {
      console.warn("Empty required fields:", emptyFields);
      return;
    }

    try {
      console.log("Starting API call...");
      setUrlsettings((prev) => ({ ...prev, loading: true }));

      let res = await axios.post(
        `${apiUrl}/api/script/create`,
        { settings: UrlSettings },
        {
          withCredentials: true,
        }
      );

      console.log("API response:", res);
      setScriptInj(res.data.injection);
      await wait(4000);
      setUrlsettings((prev) => ({ ...prev, loading: false }));
    } catch (err) {
      console.error("API error:", err);
      setUrlsettings((prev) => ({ ...prev, loading: false }));
    }
  };
  useEffect(()=>{
    if(localStorage.getItem("demoLive"))
      {
        setShowDemo(true);
         let script = document.createElement('script');
      script.src = `${apiUrl}/integrated.js?webUrl=${frontendApiUrl}`;
      console.log("Script element created:", script);
      document.body.appendChild(script);
      }
  },[])
const genDemo = async (e) => {
  e.preventDefault();

  if (showDemo) {
    setShowDemo(false);

    // Call the script's destroy method if it exists
    if (window.FeedbackSnippet && typeof window.FeedbackSnippet.destroy === 'function') {
      window.FeedbackSnippet.destroy();
    }

    // Remove any remaining DOM elements
    [
      `script[src^='${apiUrl}/integrated.js']`,
      ".fw-overlay",
      ".fw-popup", 
      ".fw-button",
      ".fw-container"
    ].forEach(sel => {
      const el = document.querySelector(sel);
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });

    localStorage.removeItem("demoLive");
    return;
  }

  try {
    console.log("Starting demo with settings:", UrlSettings);
    
    // FIRST: Update the database with new settings
    let res = await axios.post(
      `${apiUrl}/api/script/demo`, 
      { settings: UrlSettings }, 
      { withCredentials: true }
    );
    
    console.log("Demo API response:", res);

    // THEN: Add the script with cache-busting timestamp
    const timestamp = Date.now();
    const script = document.createElement("script");
    script.src = `${apiUrl}/integrated.js?webUrl=${frontendApiUrl}&v=${timestamp}`;
    script.async = true;
    
    // Optional: Add onload handler to confirm script loaded
    script.onload = () => {
      console.log("Demo script loaded successfully");
    };
    
    script.onerror = () => {
      console.error("Failed to load demo script");
    };

    document.body.appendChild(script);

    setShowDemo(true);
    localStorage.setItem("demoLive", true);

  } catch (err) {
    console.error("Demo API error:", err);
    alert("Failed to start demo. Please try again.");
  }
};
  const options = [
    {
      value: "bottom right",
      label: (
        <div className="flex items-center  gap-3">
          <HighlightedGridIcon color={UrlSettings.color} highlight="bottom-right" />
          Bottom right
        </div>
      ),
    },
    {
      value: "bottom left",
      label: (
        <div className="flex items-center  gap-3">
          <HighlightedGridIcon color={UrlSettings.color} highlight="bottom-left" /> Bottom left
        </div>
      ),
    },
    {
      value: "top right",
      label: (
        <div className="flex items-center  gap-3">
          <HighlightedGridIcon color={UrlSettings.color} highlight="top-right" />
          Top right
        </div>
      ),
    },
    {
      value: "top left",
      label: (
        <div className="flex items-center  gap-3">
          <HighlightedGridIcon color={UrlSettings.color} highlight="top-left" />
          Top left
        </div>
      ),
    },
  ];

  return (
    <div className="h-full w-full font-sans overflow-y-scroll scrollbar-hide">
      <SimpleHeader color="#517cd8ff" />

      <div className="relative h-full md:px-10 px-5 py-8">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_1050px_at_50%_200px,#c5b5ff,transparent)] pointer-events-none">
          <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#e8e8e8_1px,transparent_2px),linear-gradient(to_bottom,#e8e8e8_0.5px,transparent_2px)] bg-[size:4.5rem_3.5rem]">
            {/* Small screen gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_700px_at_100%_100px,#173f96,transparent)] lg:bg-none"></div>
            {/* Large screen gradient */}
            <div className="absolute inset-0 bg-none lg:bg-[radial-gradient(circle_1800px_at_100%_100px,#173f96,transparent)]"></div>
          </div>
        </div>
        
        <div className="relative mb-12">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-primary5 via-black/80 to-black bg-clip-text text-transparent">
            Script Generator
          </h1>
          <p className="text-md text-black tracking-tight">
            Generate and customize your feedback widget script
          </p>
        </div>
        
        <div className="flex w-full">
          <div className="flex flex-col md:flex-row w-full justify-between gap-10">
            <div className="md:w-[40%] w-full">
              <WidgetTabs
                options={options}
                colorChange={colorChange}
                UrlSettings={UrlSettings}
                setUrlsettings={setUrlsettings}
                genScript={genScript}
                scriptInj={scriptInj}
                genDemo={genDemo}
                copied={copied}
                showDemo={showDemo}
                copyToClipboard={copyToClipboard}
              />
            </div>
            
            <div className="md:w-[60%] h-[40%] w-full">
              <div className="bg-white rounded-lg h-full shadow-lg overflow-hidden">
                <div className="bg-gray-800 h-[20%] text-white px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code color="#5BAE83" size={25} />
                    <span className="text-lg text-center  tracking-tight  text-white">Script.js</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(2,scriptInj)}
                      className={`text-gray-300 hover:rotate-12  rounded-md hover:text-primary2 transition-all ease-in-out duration-300  hover:bg-white hover:text-primary2 p-1 cursor-pointer ${!scriptInj ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!scriptInj}
                      title="Copy to clipboard"
                    
                    >
                      {copied===2 ? <Check size={20} /> : <LucideCopy size={20} />}
                    </button>
                    <button
                      onClick={() => {
                        fileDownload();
                        console.log('ok');
                      }}
                      className={`text-gray-300 hover:rotate-12  rounded-md hover:text-primary2 transition-all ease-in-out duration-300  hover:bg-white z hover:text-primary2 p-1 cursor-pointer ${!scriptInj ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!scriptInj}
                      
                      title="Download script"
                    >
                      <LucideDownload size={20} />
                    </button>
                  </div>
                </div>
                
                <div className=" h-[80%] ">
                  {UrlSettings.loading ? (
                    <div className="px-4 w-full h-full bg-gray-900 flex flex-col items-center justify-center">
                      <Loader />
                      {/* <p className="text-white mt-4">Generating script...</p> */}
                    </div>
                  ) : scriptInj !== "" ? (
                    <div className="bg-gray-900 text-gray-100 p-4 font-mono text-sm overflow-x-auto h-full">
                      <pre className="whitespace-pre-wrap">{scriptInj}</pre>
                    </div>
                  ) : (
                    <div className="px-4 w-full h-full bg-gray-900 flex flex-col items-center justify-center">
                      <LucideCode color="#5BAE83" size={40} />
                      <p className="text-lg text-center mt-3 tracking-tight  text-white">
                        No Script Generated Yet
                      </p>
                      <p className="text-sm text-center tracking-tight text-gray-300">
                        Configure your widget and click generate
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};