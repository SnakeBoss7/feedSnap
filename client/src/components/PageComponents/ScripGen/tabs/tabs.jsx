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
    className={`relative flex-1 text-lg font-bold py-3 px-2 text-sm  transition-colors duration-300 rounded-xl flex items-center justify-center gap-2 z-10 ${isActive ? "text-white" : "text-gray-500 dark:text-dark-text-muted hover:text-gray-700 dark:hover:text-dark-text-primary"
      }`}
  >
    {isActive && (
      <motion.div
        layoutId="activeTab"
        className="absolute inset-0 bg-blue-600 rounded-xl shadow-sm -z-10"
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
      className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors"
    >
      <LucideArrowUpLeftFromSquare size={16} className="text-blue-500 dark:text-blue-400" /> Website Url
    </label>
    <input
      className="h-12 px-4 bg-white dark:bg-dark-bg-tertiary border border-gray-200 dark:border-dark-border-subtle rounded-xl focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all w-full text-sm text-gray-900 dark:text-dark-text-primary placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-600"
      name="webUrl"
      placeholder="https://example.com"
      value={value || ""}
      onChange={onChange}
    />
  </div>
));

const ColorInput = memo(({ color, onChange, text, name }) => (
  <div className="flex flex-col gap-2 group">
    <label htmlFor={name} className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors">
      {text}
    </label>
    <div className="flex items-center border border-gray-300 dark:border-dark-border-subtle rounded-xl overflow-hidden bg-gray-50 dark:bg-dark-bg-tertiary hover:border-gray-400 dark:hover:border-gray-500 transition-colors focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:ring-0">
      <div className="relative w-[50px] h-[50px] border-r border-gray-200 dark:border-dark-border-subtle shrink-0">
        <input
          type="color"
          name={name}
          onChange={onChange}
          value={color}
          className="absolute top-0 left-0 w-full h-full cursor-pointer p-0 border-0 opacity-0"
        />
        <div
          className="w-full h-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <input
        className="h-12 px-4 bg-transparent border-none outline-none w-full text-sm font-mono text-gray-600 dark:text-dark-text-secondary uppercase"
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
      <label htmlFor="text" className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors">
        Widget Text
      </label>
      <div className="relative group/tooltip overflow-visible">
        <LucideInfo size={14} className="text-gray-400 dark:text-gray-500 cursor-help hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />
        <div className="absolute left-0 bottom-full mb-2 hidden group-hover/tooltip:block z-50 w-64">
          <div className="bg-gray-900 dark:bg-dark-bg-tertiary text-white dark:text-dark-text-primary text-xs rounded-lg py-2 px-3 shadow-xl border border-transparent dark:border-dark-border-subtle">
            Default Feedback text will be shown. If empty, a message icon will be shown.
            <div className="absolute left-3 top-full border-4 border-transparent border-t-gray-900 dark:border-t-dark-bg-tertiary"></div>
          </div>
        </div>
      </div>
    </div>
    <input
      onChange={onChange}
      className="h-12 px-4 bg-white dark:bg-dark-bg-tertiary border border-gray-200 dark:border-dark-border-subtle rounded-xl focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all w-full text-sm text-gray-900 dark:text-dark-text-primary hover:border-gray-300 dark:hover:border-gray-600"
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
      { label: "Config" },
      { label: "Personalize" },
      { label: "Setup" },
    ],
    []
  );

  const contextLength = UrlSettings.botContext?.length || 0;
  const MAX_CONTEXT_LENGTH = 1300;

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
          <div className="relative w-full aspect-video bg-gray-50 dark:bg-dark-bg-tertiary border border-gray-200 dark:border-dark-border-subtle rounded-lg overflow-hidden shadow-inner">
            {positions.map((pos) => (
              <button
                key={pos.id}
                type="button"
                onClick={() => onChange({ value: pos.id })}
                className={`absolute w-1/3 h-1/3 m-1 transition-all duration-200 rounded-sm ${pos.class
                  } ${value === pos.id
                    ? "bg-blue-500 shadow-md scale-110 z-10 ring-2 ring-white dark:ring-dark-bg-secondary"
                    : "bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 border border-gray-400/50 dark:border-gray-600"
                  }`}
                title={pos.id}
              />
            ))}
          </div>
          <div className="flex flex-col justify-center text-xs text-gray-500 dark:text-dark-text-muted capitalize">
            Selected: <span className="font-semibold text-gray-800 dark:text-dark-text-primary">{value}</span>
          </div>
        </div>
      </div>
    );
  });

  const InputLabel = ({ icon: Icon, label, subLabel }) => (
    <div className="mb-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
        {Icon && <Icon size={16} className="text-blue-500 dark:text-blue-400" />}
        {label}
      </label>
      {subLabel && <p className="text-xs text-gray-500 dark:text-dark-text-muted mt-0.5 ml-6">{subLabel}</p>}
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
    <div className="w-full font-sans h-full flex flex-col ">
      {/* Tabs row */}
      <div className="bg-gray-50 dark:bg-dark-bg-tertiary p-0 rounded-2xl flex gap-1 mb-8 border border-gray-100 dark:border-dark-border-subtle relative">
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
                <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <Globe2Icon className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                  Widget Configuration
                </h1>
                <p className="text-sm text-gray-500 dark:text-dark-text-muted ml-[52px]">
                  Enter your website details to generate the script
                </p>
              </div>

              <div className="space-y-6">
                <WebUrlInput
                  value={UrlSettings.webUrl}
                  onChange={handleInputChange}
                />

                <div className="p-4 bg-gray-50 dark:bg-dark-bg-tertiary rounded-xl flex items-center justify-between  border border-gray-100 dark:border-dark-border-subtle">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-text-secondary ">
                    <MailCheck size={16} className="text-blue-500 dark:text-blue-400" /> Acknowledgment Email
                  </label>
                  <div className="pl-1">
                    <Switch
                      UrlSettings={UrlSettings}
                      setUrlsettings={setUrlsettings}
                    />
                  </div>
                </div>

                <div className="group">
                  <h2 className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors">
                    <Bot size={16} className="text-blue-500 dark:text-blue-400" />
                    Bot Context
                  </h2>
                  <div className="relative">
                    <textarea
                      name="botContext"
                      value={UrlSettings.botContext || ""}
                      onChange={handleInputChange}
                      className="w-full h-[140px] p-4 bg-white dark:bg-dark-bg-tertiary border border-gray-200 dark:border-dark-border-subtle rounded-xl focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all text-sm text-gray-900 dark:text-dark-text-primary placeholder-gray-400 dark:placeholder-gray-500 resize-none hover:border-gray-300 dark:hover:border-gray-600"
                      placeholder="Tell us about your website so the AI can answer user queries better..."
                      maxLength={MAX_CONTEXT_LENGTH}
                    />
                    <div className="absolute bottom-3 right-3 text-xs font-medium bg-white/90 dark:bg-dark-bg-secondary/90 backdrop-blur px-2 py-1 rounded-md border border-gray-100 dark:border-dark-border-subtle shadow-sm">
                      <span
                        className={
                          contextLength > MAX_CONTEXT_LENGTH
                            ? "text-red-500"
                            : contextLength > 400
                              ? "text-orange-500"
                              : "text-green-600 dark:text-green-400"
                        }
                      >
                        {contextLength}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500">
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
                <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <Paintbrush className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                  Widget Customization
                </h1>
                <p className="text-sm text-gray-500 dark:text-dark-text-muted ml-[52px]">
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
                <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/30">
                    <Brain className="text-green-600 dark:text-green-400" size={20} />
                  </div>
                  Installation Guide
                </h1>
                <p className="text-sm text-gray-500 dark:text-dark-text-muted ml-[52px]">
                  Follow these steps to integrate FeedSnap
                </p>
              </div>

              <div className="bg-white dark:bg-dark-bg-tertiary rounded-xl p-6 border border-gray-200 dark:border-dark-border-subtle shadow-sm">
                <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-dark-text-secondary space-y-4">
                  <li className="pl-2">Copy the generated script from the console.</li>
                  <li className="pl-2">
                    Paste it just before the{" "}
                    <code className="bg-gray-100 dark:bg-dark-bg-secondary text-gray-800 dark:text-gray-300 px-2 py-1 rounded-md text-xs font-mono border border-gray-200 dark:border-dark-border-subtle">
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
              <div className="relative bg-[#1e1e1e] rounded-xl p-5 font-mono text-xs text-gray-300 shadow-lg overflow-hidden group border border-gray-800 dark:border-dark-border">
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

              <div className="flex items-start gap-3 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <LucideInfo className="text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" size={18} />
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                  <strong>Pro Tip:</strong> You can re-generate this script anytime. Changes to configuration will require updating the script on your site.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-6 flex gap-3 border-t border-gray-100 dark:border-dark-border-subtle">
          <button
            type="submit"
            disabled={isDisabled}
            className={`flex-1 flex justify-center md:w-[70%] w-[60%] items-center gap-2 rounded-xl h-[52px] text-sm font-bold text-white shadow-md transition-all duration-300 ${isDisabled
              ? "bg-blue-300 dark:bg-blue-900/40 cursor-not-allowed shadow-none opacity-70"
              : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30 hover:-translate-y-0.5"
              }`}
          >
            <LucideStars size={18} />
            Generate Script
          </button>

          <button
            onClick={(e) => genDemo(e)}
            className={`flex justify-center items-center gap-2 rounded-xl h-[52px] md:w-[30%] w-[40%] text-sm font-bold transition-all duration-300 border shadow-sm hover:shadow-md ${showDemo
              ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/30'
              : 'bg-white dark:bg-dark-bg-tertiary text-gray-700 dark:text-dark-text-secondary border-gray-200 dark:border-dark-border-subtle hover:bg-gray-50 dark:hover:bg-dark-bg-hover hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-900 dark:hover:text-dark-text-primary'
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