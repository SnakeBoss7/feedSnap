import { useState, useCallback, useMemo, memo } from "react";
import {
  Paintbrush,
  LucideInfo,
  Globe2Icon,
  LucideStars,
  LucideTvMinimalPlay,
  LucideArrowUpLeftFromSquare,
  Bot,
  Copy,
  Brain,
  TicketCheckIcon,
  MailCheck,
  LucideAlertTriangle,
  LayoutTemplate,
  Check,
} from "lucide-react";
import Switch from "../../../button/switch";
import { motion } from "framer-motion";

// Custom minimal loader
const Spinner = ({ size = 18, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="animate-spin"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
      className="opacity-25"
    />
    <path
      fill={color}
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      className="opacity-75"
    />
  </svg>
);

// Memoized tab button component
const TabButton = memo(({ tab, index, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative flex-1 py-3 px-2 text-sm font-medium transition-colors duration-300 rounded-xl flex items-center justify-center gap-2 z-10 ${
      isActive ? "text-white" : "text-gray-500 hover:text-gray-700"
    }`}
  >
    {isActive && (
      <motion.div
        layoutId="activeTab"
        className="absolute inset-0 bg-blue-600 rounded-xl shadow-md shadow-blue-200 -z-10"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
    {tab.label}
  </button>
));

// Memoized input components
const WebUrlInput = memo(({ value, onChange }) => (
  <div className="flex flex-col group">
    <label
      htmlFor="web_url"
      className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors"
    >
      <LucideArrowUpLeftFromSquare size={16} className="text-blue-500" /> Website Url
    </label>
    <input
      className="h-12 px-4 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all w-full text-sm text-gray-900 placeholder-gray-400 hover:border-gray-300"
      name="webUrl"
      placeholder="https://example.com"
      value={value || ""}
      onChange={onChange}
    />
  </div>
));

const ColorInput = memo(({ color, onChange, text, name }) => (
  <div className="flex flex-col gap-2 group">
    <label htmlFor={name} className="text-sm font-medium text-gray-700 group-focus-within:text-blue-600 transition-colors">
      {text}
    </label>
    <div className="flex gap-3 items-center">
      <div className="relative w-[60px] h-12 rounded-xl overflow-hidden border border-gray-200 shadow-sm ring-2 ring-transparent group-focus-within:ring-blue-500/10 transition-all">
        <input
          type="color"
          name={name}
          onChange={onChange}
          value={color}
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 border-0"
        />
      </div>
      <input
        className="h-12 px-4 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all flex-1 text-sm font-mono text-gray-600 uppercase hover:border-gray-300"
        type="text"
        name={name}
        value={color}
        onChange={onChange}
      />
    </div>
  </div>
));

const TextInput = memo(({ value, onChange }) => (
  <div className="flex flex-col gap-2 group">
    <div className="flex gap-2 items-center relative">
      <label htmlFor="text" className="text-sm font-medium text-gray-700 group-focus-within:text-blue-600 transition-colors">
        Widget Text
      </label>
      <div className="relative group/tooltip">
        <LucideInfo size={14} className="text-gray-400 cursor-help hover:text-blue-500 transition-colors" />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/tooltip:block z-50 w-64">
          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl">
            Default Feedback text will be shown. If empty, a message icon will be shown.
            <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </div>
    <input
      onChange={onChange}
      className="h-12 px-4 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all w-full text-sm text-gray-900 hover:border-gray-300"
      defaultValue="FeedBack"
      type="text"
      name="text"
      value={value || ""}
    />
  </div>
));

// Main component
export default function WidgetTabs({
  options,
  colorChange,
  UrlSettings,
  setUrlsettings,
  copied,
  genScript,
  scriptInj,
  copyToClipboard,
  genDemo,
  showDemo,
}) {
  const [active, setActive] = useState(0);
  
  // Static tabs array
  const tabs = useMemo(
    () => [
      { label: "Configuration" },
      { label: "Customization" },
      { label: "Installation" },
    ],
    []
  );

  const contextLength = UrlSettings.botContext?.length || 0;
  const MAX_CONTEXT_LENGTH = 600;

  // Memoized callbacks
  const handleTabClick = useCallback((index) => {
    setActive(index);
  }, []);

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      // For botContext, enforce max length
      if (name === "botContext") {
        if (value.length > MAX_CONTEXT_LENGTH) {
          return; // Block if over limit
        }
      }

      setUrlsettings((prev) => ({ ...prev, [name]: value }));
    },
    [setUrlsettings]
  );

  const handleFormSubmit = useCallback(
    (e) => {
      e.preventDefault();
      genScript(e);
    },
    [genScript]
  );

  // Memoized computed values
  const isDisabled = useMemo(() => !UrlSettings.webUrl, [UrlSettings.webUrl]);

  // Memoized tab buttons
  const tabButtons = useMemo(
    () =>
      tabs.map((tab, i) => (
        <TabButton
          key={i}
          tab={tab}
          index={i}
          isActive={active === i}
          onClick={() => handleTabClick(i)}
        />
      )),
    [tabs, active, handleTabClick]
  );

  const PositionSelector = memo(({ value, onChange }) => {
    const positions = [
      { id: "top left", class: "top-0 left-0 rounded-tl-md" },
      { id: "top right", class: "top-0 right-0 rounded-tr-md" },
      { id: "bottom left", class: "bottom-0 left-0 rounded-bl-md" },
      { id: "bottom right", class: "bottom-0 right-0 rounded-br-md" },
    ];

    return (
      <div className="space-y-3">
        <InputLabel icon={LayoutTemplate} label="Widget Position" />
        <div className="grid grid-cols-2 gap-4 max-w-[200px]">
          <div className="relative w-full aspect-video bg-gray-50 border border-gray-200 rounded-lg overflow-hidden shadow-inner">
            {positions.map((pos) => (
              <button
                key={pos.id}
                type="button"
                onClick={() => onChange({ value: pos.id })}
                className={`absolute w-1/3 h-1/3 m-1 transition-all duration-200 rounded-sm ${
                  pos.class
                } ${
                  value === pos.id
                    ? "bg-blue-500 shadow-md scale-110 z-10 ring-2 ring-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
                title={pos.id}
              />
            ))}
          </div>
          <div className="flex flex-col justify-center text-xs text-gray-500 capitalize">
            Selected: <span className="font-semibold text-gray-800">{value}</span>
          </div>
        </div>
      </div>
    );
  });

  const InputLabel = ({ icon: Icon, label, subLabel }) => (
    <div className="mb-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {Icon && <Icon size={16} className="text-blue-500" />}
        {label}
      </label>
      {subLabel && <p className="text-xs text-gray-500 mt-0.5 ml-6">{subLabel}</p>}
    </div>
  );

  const handlePositionChange = useCallback(
    (selectedOption) => {
      setUrlsettings((prev) => ({
        ...prev,
        position: selectedOption?.value || "bottom right",
      }));
    },
    [setUrlsettings]
  );

  return (
    <div className="w-full font-sans h-full flex flex-col">
      {/* Tabs row */}
      <div className="bg-gray-50 p-0 rounded-2xl flex gap-1 mb-8 border border-gray-100 relative">
        {tabButtons}
      </div>

      <form
        id="widget-config"
        className="flex flex-col flex-1 min-h-0"
        onSubmit={handleFormSubmit}
      >
        <div className="flex-1 overflow-y-auto scrollbar-hide px-1">
          {/* Configuration Tab */}
          {active === 0 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 rounded-xl border border-blue-100">
                    <Globe2Icon className="text-blue-600" size={20} />
                  </div>
                  Widget Configuration
                </h1>
                <p className="text-sm text-gray-500 ml-[52px]">
                  Enter your website details to generate the script
                </p>
              </div>

              <div className="space-y-6">
                <WebUrlInput
                  value={UrlSettings.webUrl}
                  onChange={handleInputChange}
                />
                
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <MailCheck size={16} className="text-blue-500" /> Acknowledgment Email
                  </label>
                  <div className="pl-1">
                    <Switch
                      UrlSettings={UrlSettings}
                      setUrlsettings={setUrlsettings}
                    />
                  </div>
                </div>

                <div className="group">
                  <h2 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                    <Bot size={16} className="text-blue-500" />
                    Bot Context
                  </h2>
                  <div className="relative">
                    <textarea
                      name="botContext"
                      value={UrlSettings.botContext || ""}
                      onChange={handleInputChange}
                      className="w-full h-[140px] p-4 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm text-gray-900 placeholder-gray-400 resize-none hover:border-gray-300"
                      placeholder="Tell us about your website so the AI can answer user queries better..."
                      maxLength={MAX_CONTEXT_LENGTH}
                    />
                    <div className="absolute bottom-3 right-3 text-xs font-medium bg-white/90 backdrop-blur px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                      <span
                        className={
                          contextLength > MAX_CONTEXT_LENGTH
                            ? "text-red-500"
                            : contextLength > 400
                            ? "text-orange-500"
                            : "text-green-600"
                        }
                      >
                        {contextLength}
                      </span>
                      <span className="text-gray-400">
                        /{MAX_CONTEXT_LENGTH}
                      </span>
                    </div>
                  </div>
                  {contextLength > 400 && (
                    <p className="text-xs mt-2 flex gap-1 items-center text-orange-500 font-medium">
                      <LucideAlertTriangle size={12} />
                      {MAX_CONTEXT_LENGTH - contextLength} characters remaining
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Customization Tab */}
          {active === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 rounded-xl border border-blue-100">
                    <Paintbrush className="text-blue-600" size={20} />
                  </div>
                  Widget Customization
                </h1>
                <p className="text-sm text-gray-500 ml-[52px]">
                  Customize the appearance and behavior
                </p>
              </div>

              <div className="space-y-8">
                <PositionSelector value={UrlSettings.position} onChange={handlePositionChange} />

                <div className="grid grid-cols-2 gap-6">
                  <ColorInput
                    color={UrlSettings.color}
                    onChange={colorChange}
                    name={"color"}
                    text={"Primary Color"}
                  />
                  <ColorInput
                    color={UrlSettings.bgColor}
                    onChange={colorChange}
                    name={"bgColor"}
                    text={"Background Color"}
                  />
                </div>
                
                <TextInput
                  value={UrlSettings.text}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          {/* Installation Tab */}
          {active === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-50 rounded-xl border border-green-100">
                    <Brain className="text-green-600" size={20} />
                  </div>
                  Installation Guide
                </h1>
                <p className="text-sm text-gray-500 ml-[52px]">
                  Follow these steps to integrate FeedSnap
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <ol className="list-decimal list-inside text-sm text-gray-600 space-y-4">
                  <li className="pl-2">Copy the generated script from the console.</li>
                  <li className="pl-2">
                    Paste it just before the{" "}
                    <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs font-mono border border-gray-200">
                      &lt;/body&gt;
                    </code>{" "}
                    tag of your website.
                  </li>
                  <li className="pl-2">
                    Save your page and refresh to see the widget.
                  </li>
                </ol>
              </div>

              {/* Script Display */}
              <div className="relative bg-[#1e1e1e] rounded-xl p-5 font-mono text-xs text-gray-300 shadow-lg overflow-hidden group border border-gray-800">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-75"></div>
                <pre className="overflow-x-auto whitespace-pre-wrap pt-2 leading-relaxed">
                  {scriptInj
                    ? scriptInj
                    : <span className="text-gray-500 italic">{"<!-- Your script will appear here -->\n<script src=\"...\"></script>"}</span>}
                </pre>
                <button
                  type="button"
                  onClick={() => copyToClipboard(1, scriptInj)}
                  className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100 border border-white/10"
                  title="Copy Code"
                >
                  {copied === 1 ? (
                    <Check size={16} className="text-green-400" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <LucideInfo className="text-blue-500 mt-0.5 flex-shrink-0" size={18} />
                <p className="text-xs text-blue-700 leading-relaxed">
                  <strong>Pro Tip:</strong> You can re-generate this script anytime. Changes to configuration will require updating the script on your site.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-6 mt-auto flex gap-3 border-t border-gray-100">
          <button
            type="submit"
            disabled={isDisabled}
            className={`flex-1 flex justify-center items-center gap-2 rounded-xl h-[52px] text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 ${
              isDisabled
                ? "bg-gray-300 cursor-not-allowed shadow-none"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30 hover:-translate-y-0.5"
            }`}
          >
            <LucideStars size={18} />
            Generate Script
          </button>
          
          <button
            onClick={(e) => genDemo(e)}
            className={`flex justify-center items-center gap-2 px-6 rounded-xl h-[52px] min-w-[140px] text-sm font-bold transition-all duration-300 border ${
              showDemo 
                ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:border-red-200' 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900'
            }`}
          >
            {showDemo === "loading" ? (
              <Spinner size={20} color="#4B5563" />
            ) : showDemo ? (
              <>
                <LucideTvMinimalPlay size={18} />
                Stop Demo
              </>
            ) : (
              <>
                <LucideTvMinimalPlay size={18} />
                Live Demo
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}