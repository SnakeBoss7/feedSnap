import { SimpleHeader } from "../../../components/header/header";
import {
  Code,
  LucideCopy,
  LucideDownload,
  Check,
  Terminal,
  Sparkles,
  Zap,
  LayoutDashboard
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../../../components/loader/loader";
import WidgetTabs from "../../../components/PageComponents/ScripGen/tabs/tabs";
import { Background } from "../../../components/background/background";

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
    ackMail: true,
  });

  const copyToClipboard = async (opt, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(opt);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const fileDownload = () => {
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
  };

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const genScript = async (e) => {
    e.preventDefault();

    if (!UrlSettings.webUrl || UrlSettings.webUrl.trim() === "") {
      console.warn("Website URL is required");
      return;
    }

    try {
      setUrlsettings((prev) => ({ ...prev, loading: true }));

      let res = await axios.post(
        `${apiUrl}/api/script/create`,
        { settings: UrlSettings },
        {
          withCredentials: true,
        }
      );

      setScriptInj(res.data.injection);
      await wait(1500); // Reduced wait time for snappier feel
      setUrlsettings((prev) => ({ ...prev, loading: false }));
    } catch (err) {
      console.error("API error:", err);
      setUrlsettings((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    if (localStorage.getItem("demoLive")) {
      setShowDemo(true);
      let script = document.createElement('script');
      script.src = `${apiUrl}/widget/script?webUrl=${frontendApiUrl}`;
      document.body.appendChild(script);
    }
  }, []);

  const genDemo = async (e) => {
    e.preventDefault();

    if (showDemo) {
      setShowDemo(false);

      if (window.FeedbackSnippet && typeof window.FeedbackSnippet.destroy === 'function') {
        window.FeedbackSnippet.destroy();
      }

      const scriptToRemove = document.querySelector(`script[src*="${apiUrl}/widget/script"]`);
      if (scriptToRemove && scriptToRemove.parentNode) {
        scriptToRemove.parentNode.removeChild(scriptToRemove);
      }

      const selectorsToRemove = [
        ".fw-overlay",
        ".fw-popup",
        ".fw-button",
        ".fw-container"
      ];

      selectorsToRemove.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (el && el.parentNode) {
            el.parentNode.removeChild(el);
          }
        });
      });

      document.querySelectorAll('style').forEach(style => {
        if (style.textContent.includes('.fw-container') ||
          style.textContent.includes('.fw-button') ||
          style.textContent.includes('.fw-popup')) {
          style.remove();
        }
      });

      localStorage.removeItem("demoLive");
      return;
    }

    try {
      setShowDemo("loading");
      await axios.post(`${apiUrl}/api/script/demo`, UrlSettings, {
        withCredentials: true,
      });

      localStorage.setItem("demoLive", "true");

      const script = document.createElement("script");
      script.src = `${apiUrl}/widget/script?webUrl=${encodeURIComponent(frontendApiUrl)}&t=${Date.now()}`;
      script.async = true;

      script.onerror = () => {
        console.error("Failed to load widget script");
        setShowDemo(false);
        localStorage.removeItem("demoLive");
      };

      script.onload = () => {
        setTimeout(() => {
          setShowDemo(true);
        }, 100);
      };

      document.body.appendChild(script);

    } catch (err) {
      console.error("Error loading demo widget:", err);
      setShowDemo(false);
      localStorage.removeItem("demoLive");
    }
  };

  const options = [
    { value: "bottom right", label: "Bottom Right" },
    { value: "bottom left", label: "Bottom Left" },
    { value: "top right", label: "Top Right" },
    { value: "top left", label: "Top Left" },
  ];

  return (
    <div className="min-h-screen overflow-y-auto font-sans text-gray-900 relative">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-500 via-blu-400 to-blue-200 pointer-events-none z-0" />
      
      <div className="relative z-10">
        <SimpleHeader color={'#2563EB'}/>

        <div className="max-w-7xl mx-auto p-6 md:p-10">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row mt-5 md:mt-0 justify-between items-start md:items-center mb-8 md:mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
                Script Generator
              </h1>
              <p className="text-black font-medium text-lg">
                Generate and customize your feedback widget script
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            {/* Left Column: Configuration */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-1 shadow-xl shadow-gray-200/50 border border-gray-100 transition-all duration-300 h-full">
                <div className="bg-white rounded-xl p-2 md:px-5 h-full">
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
              </div>
            </div>

            {/* Right Column: Console/Preview */}
            <div className="lg:col-span-2 flex flex-col gap-6 sticky top-6">
              {/* Compact Console */}
              <div className="bg-[#1e1e1e] rounded-2xl shadow-2xl shadow-gray-900/20 overflow-hidden border border-gray-800 relative group">
                {/* Console Header */}
                <div className="h-12 bg-[#252526] flex items-center justify-between px-4 border-b border-[#333]">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
                      <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
                      <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
                    </div>
                    <div className="ml-4 flex items-center gap-2 text-gray-400 text-xs font-mono bg-[#1e1e1e] px-3 py-1.5 rounded-md border border-[#333]">
                      <Terminal size={12} />
                      script.js
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => copyToClipboard(2, scriptInj)}
                      disabled={!scriptInj}
                      className="p-2 text-gray-400 hover:text-white hover:bg-[#333] rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Copy to clipboard"
                    >
                      {copied === 2 ? <Check size={16} className="text-green-500" /> : <LucideCopy size={16} />}
                    </button>
                    <button
                      onClick={fileDownload}
                      disabled={!scriptInj}
                      className="p-2 text-gray-400 hover:text-white hover:bg-[#333] rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Download file"
                    >
                      <LucideDownload size={16} />
                    </button>
                  </div>
                </div>

                {/* Console Body - Compact */}
                <div className="relative min-h-[200px] max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                  {UrlSettings.loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-3 py-8">
                      <Loader />
                      <p className="text-sm font-mono animate-pulse text-blue-400">Generating optimized script...</p>
                    </div>
                  ) : scriptInj ? (
                    <div className="p-6 font-mono text-sm leading-relaxed">
                      <div className="flex items-start">
                        <div className="flex-none w-8 text-right pr-4 text-gray-600 select-none pt-0.5 border-r border-gray-800 mr-4">
                          1
                        </div>
                        <div className="flex-1 text-gray-300 whitespace-pre-wrap break-all font-mono">
                          <span className="text-[#569cd6]">&lt;script</span> <span className="text-[#9cdcfe]">src</span>=<span className="text-[#ce9178]">"{scriptInj.match(/src="([^"]+)"/)?.[1] || '...'}"</span><span className="text-[#569cd6]">&gt;&lt;/script&gt;</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-4 select-none py-8">
                      <div className="w-16 h-16 rounded-2xl bg-[#252526] flex items-center justify-center border border-[#333]">
                        <Code size={32} className="text-gray-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-base font-medium text-gray-400">Ready to Generate</p>
                        <p className="text-sm text-gray-600 mt-1">Configure your widget to get started</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300 flex items-start gap-4 group">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-500 group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300">
                     <Sparkles size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Quick Setup</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Copy the generated script and paste it before the closing <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 font-mono text-xs border border-gray-200">&lt;/body&gt;</code> tag.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300 flex items-start gap-4 group">
                  <div className="p-3 bg-purple-50 rounded-xl text-purple-500 group-hover:bg-purple-100 group-hover:scale-110 transition-all duration-300">
                     <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Live Preview</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Use the "Live Demo" button to test your widget configuration instantly on this page.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-12"></div>
      </div>
    </div>
  );
};