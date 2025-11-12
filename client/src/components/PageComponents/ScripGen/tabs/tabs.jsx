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
} from "lucide-react";
import Select from "react-select";
import Switch from "../../../button/switch";
import DemLoader from "../../../loader/demoLoader";

// Memoized tab button component
const TabButton = memo(({ tab, index, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative flex-1 tracking-tight text-center py-2 text-sm md:text-lg font-medium transition-colors duration-300 z-10 ${
      isActive ? "text-white" : "text-gray-600"
    }`}
  >
    {tab.label}
  </button>
));

// Memoized input components
const WebUrlInput = memo(({ value, onChange }) => (
  <div className="flex flex-col">
    <label
      htmlFor="web_url"
      className="flex items-center gap-2 tracking-tight text-lg "
    >
      <LucideArrowUpLeftFromSquare size={18} /> Website Url
    </label>
    <input
      className="h-10 p-2 backdrop-blur-md bg-[#fff] border border-black/30 rounded-md mt-2 relative z-10"
      name="webUrl"
      placeholder="https://example.com"
      value={value || ""}
      onChange={onChange}
    />
  </div>
));

const ColorInput = memo(({ color, onChange, text, name }) => (
  <>
    <label htmlFor={name} className="  block">
      {text}
    </label>
    <div className="flex gap-3 items-center  relative z-10">
      <input
        type="color"
        name={name}
        onChange={onChange}
        value={color}
        className="h-10 w-[80px] rounded-lg border relative z-10"
      />
      <input
        className="h-10 p-2 backdrop-blur-md bg-[#fff] border border-black/30 rounded-lg relative z-10"
        type="text"
        name={name}
        value={color}
        onChange={onChange}
      />
    </div>
  </>
));

const TextInput = memo(({ value, onChange }) => (
  <>
    <div className="flex gap-2 items-center relative">
      <label htmlFor="text" className="font-[500]">
        Widget Text
      </label>
      <div className="relative">
        <LucideInfo size={18} className="peer inline-block ml-1 cursor-help" />
        <p className="bg-gray-800 rounded-md text-white p-2 absolute left-20 -top-5 sm:left-6 sm:-top-2 -left-32 -top-12 text-sm hidden peer-hover:block sm:whitespace-nowrap shadow-lg z-[9999] max-w-[280px] sm:max-w-none">
          Default Feedback as text will be shown, if empty a message icon will
          be shown
        </p>
      </div>
    </div>
    <input
      onChange={onChange}
      className="h-10 p-2 backdrop-blur-md bg-[#fff] border border-black/30 rounded-lg relative z-10"
      defaultValue="FeedBack"
      type="text"
      name="text"
      value={value || ""}
    />
  </>
));

// Pre-defined static styles to avoid inline calculations
const TAB_STYLES = {
  0: { left: "calc(0% + 4px)", width: "calc(33.333% - 8px)" },
  1: { left: "calc(33.333% + 4px)", width: "calc(33.333% - 8px)" },
  2: { left: "calc(66.666% + 4px)", width: "calc(33.333% - 8px)" },
};

// Static select styles
const SELECT_STYLES = {
  control: (base) => ({ ...base, padding: "2px" }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? "#9c9c9cff" : "#fff",
    color: state.isSelected ? "#fff" : "#000",
    "&:hover": { backgroundColor: "#c4c5c5ff" },
  }),
};

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
  const [contextlen, setContextlen] = useState(0);
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
  // const isOverLimit = contextLength > MAX_CONTEXT_LENGTH;

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
        setContextlen(value.length);
      }

      setUrlsettings((prev) => ({ ...prev, [name]: value }));
    },
    [setUrlsettings]
  );

  // Fixed handleSelectChange to update position
  const handleSelectChange = useCallback(
    (selectedOption) => {
      console.log("Position selected:", selectedOption?.value);
      setUrlsettings((prev) => ({
        ...prev,
        position: selectedOption?.value || "bottom right",
      }));
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
  const slideStyle = useMemo(() => TAB_STYLES[active], [active]);

  // Find the selected option for the Select component
  const selectedOption = useMemo(
    () =>
      options.find((option) => option.value === UrlSettings.position) || null,
    [options, UrlSettings.position]
  );

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

  return (
    <div className="w-full font-sans  ">
      {/* Tabs row */}
      <div className="relative flex w-full h-[50px] border backdrop-blur-md bg-white/90 border border-white/10 rounded-lg mb-3">
        {/* Sliding highlight */}
        <div
          className="absolute p-2 top-[4px] bottom-[4px] bg-primary5        rounded-md transition-all duration-300 ease-in-out pointer-events-none z-0"
          style={slideStyle}
        />
        {tabButtons}
      </div>

      <form
        id="widget-config"
        className="flex flex-col gap-3"
        onSubmit={handleFormSubmit}
      >
        <div className="border backdrop-blur-md lg:h-[470px] w-[500px] bg-white/90 border border-white/10 p-3 rounded-md flex flex-col justify-between w-full">
          {/* Configuration Tab */}
          {active === 0 && (
            <>
              <div>
                <h1 className="tracking-tight text-[22px]  flex items-center gap-2">
                  <Globe2Icon
                    className="text-white rounded-md bg-blue-500 p-1 h-6 w-6"
                    size={30}
                  />
                  Widget Configuration
                </h1>
                <p className="tracking-tight  mb-9 text-gray-600 text-sm pt-1">
                  Enter your website details to generate the script
                </p>
              </div>

              <div className="flex flex-col justify-between gap-3">
                <WebUrlInput
                  value={UrlSettings.webUrl}
                  onChange={handleInputChange}
                />
                <div>
                  <label
                    htmlFor="web_url"
                    className="flex pb-2 items-center gap-2 tracking-tight text-lg "
                  >
                    <MailCheck size={18} /> Acknowledgment email.
                  </label>
                  <Switch
                    UrlSettings={UrlSettings}
                    setUrlsettings={setUrlsettings}
                  />
                </div>
                {/* <div>
                  <h2 className="flex items-center gap-2 tracking-tight text-lg ">
                    <LucideShield className="text-primary" size={18}/>
                    Website verification
                  </h2>
                  <p className="text-sm tracking-tight">Add this meta tag in you website to mark ownership</p>
                  <div className="border border-black/30 rounded-md mt-1 px-2 py-4">
                    <code>
                      &lt;meta name="widget-id" content="{UrlSettings.id}" /&gt;
                    </code>
                  </div>
                </div> */}

                <div>
                  <h2 className="flex items-center gap-2 tracking-tight text-lg mb-2">
                    <Bot className="text-primary" size={25} />
                    Bot Context
                  </h2>
                  <div className="relative">
                    <textarea
                      name="botContext"
                      value={UrlSettings.botContext || ""}
                      onChange={handleInputChange}
                      className="scrollbar-hide resize-none h-[120px] w-full p-2 pb-8 backdrop-blur-md bg-[#fff] border border-black/30 rounded-md relative z-[1]"
                      placeholder="Tell us about your website..."
                      maxLength={MAX_CONTEXT_LENGTH}
                    />
                    <div className="absolute bottom-2 right-2 text-sm flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm z-[2] pointer-events-none">
                      <span
                        className={
                          contextLength > MAX_CONTEXT_LENGTH
                            ? "text-red-500 font-semibold"
                            : contextLength > 180
                            ? "text-orange-500"
                            : "text-green-500"
                        }
                      >
                        {contextLength}
                      </span>
                      <span className="text-gray-500">
                        /{MAX_CONTEXT_LENGTH}
                      </span>
                    </div>
                  </div>
                  {contextLength > 180 && (
                    <p
                      className={`text-xs mt-2  flex gap-1 item-center ${
                        contextLength >= MAX_CONTEXT_LENGTH
                          ? "text-red-500"
                          : "text-orange-500"
                      }`}
                    >
                      {contextLength >= MAX_CONTEXT_LENGTH ? (
                        <>
                          {" "}
                          <LucideAlertTriangle size={14} />
                          Character limit reached
                        </>
                      ) : (
                        <>
                          {" "}
                          <LucideAlertTriangle size={14} />
                          {MAX_CONTEXT_LENGTH - contextLength} characters
                          remaining
                        </>
                      )}
                    </p>
                  )}
                </div>

                {/* <div className="w-full rounded-lg border border-primary5        bg-primary/10 px-1 flex gap-2">
                  <LucideStars size={$30} className="text-primary"/>
                  <span className=" tracking-tight lg:text-sm text-[10px] text-primary">
                    For Live Demo: 
                    <span className="font-[100] lg:text-[12px] text-[10px] text-black"> Complete the customization in the next tab, then use the Preview tab to see your widget in action before going live.</span>
                  </span>
                </div> */}
              </div>
            </>
          )}

          {/* Customization Tab */}
          {active === 1 && (
            <>
              <div>
                {" "}
                <h1 className="tracking-tight text-[22px]  flex items-center gap-2">
                  <Paintbrush
                    className="text-white rounded-md bg-primary1 p-1 h-6 w-6"
                    size={30}
                  />
                  Widget Customization
                </h1>
                <p className="mb-9 tracking-tight text-gray-600 text-sm pt-1">
                  Customize the appearance and behavior of your widget
                </p>
              </div>

              <div className="flex flex-col justify-between gap-2">
                <label
                  htmlFor="position"
                  className="text-lg  block z-[9999999999]"
                >
                  Position
                </label>
                <Select
                  required
                  options={options}
                  value={selectedOption}
                  onChange={handleSelectChange}
                  placeholder="Select position..."
                  className="text-sm bg-white/20 relative z-[999999]"
                  styles={SELECT_STYLES}
                />

                <div className="flex flex-col gap-2 ">
                  <ColorInput
                    color={UrlSettings.color}
                    onChange={colorChange}
                    name={"color"}
                    text={"Widget Color"}
                  />
                  <ColorInput
                    color={UrlSettings.bgColor}
                    onChange={colorChange}
                    name={"bgColor"}
                    text={"Widget mode Color"}
                  />
                </div>
                <TextInput
                  value={UrlSettings.text}
                  onChange={handleInputChange}
                />
              </div>
            </>
          )}

          {/* Preview Tab */}
          {active === 2 && (
            <>
              <div>
                <h1 className="tracking-tight text-[22px]  flex items-center gap-2">
                  <Brain
                    className="text-white rounded-md bg-primary5 p-1 h-6 w-6"
                    size={30}
                  />{" "}
                  Widget Installation
                </h1>

                <p className="mb-9 tracking-tight text-gray-600 text-sm pt-1">
                  Follow these simple steps to integrate FeedSnap into your
                  website 👇
                </p>
              </div>

              <ol className="list-decimal list-inside text-md text-gray-700 space-y-2 mb-6">
                <li>Copy the script shown below.</li>
                <li>
                  Paste it just before the{" "}
                  <code className="bg-gray-600 text-white  px-2 py-1 rounded-sm">
                    &lt;/body&gt;
                  </code>{" "}
                  tag of your website.
                </li>
                <li>
                  Save your page and refresh — your widget should appear
                  instantly{" "}
                </li>
              </ol>

              {/* Script Display */}
              <div className="relative bg-gray-200  border border-blue-200  rounded-lg p-3 font-mono text-sm text-gray-800 ">
                <pre className="overflow-x-auto whitespace-pre-wrap">
                  {scriptInj
                    ? scriptInj
                    : `<script src="datahereRandomDataIM_MR_ROBTO">THis isa demo script so calm the fuck down </script>`}
                </pre>
                <button
                  type="button"
                  onClick={() => copyToClipboard(1, scriptInj)}
                  className="absolute top-2 right-2 text-xs bg-gray-200  text-gray-800  p-2 rounded-xl hover:bg-blue-200 transition-colors flex items-center gap-1"
                >
                  {copied === 1 ? (
                    <TicketCheckIcon
                      size={15}
                      className="text-primary5 bg-blue-100"
                    />
                  ) : (
                    <Copy size={15} className="text-primary5 bg-blue-100" />
                  )}
                  {/* {copied ? "Copied!" : "Copy"} */}
                </button>
              </div>

              <p className="text-xs text-gray-600 mt-3">
                💡 Tip: You can re-generate this script anytime from the “Script
                Generator” page.
              </p>
            </>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isDisabled}
            className={`flex justify-center mt-3 items-center gap-2 w-[70%] rounded-lg h-[60px] bg-primary5       text-white transition-opacity ${
              isDisabled ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            <LucideStars />
            Generate Script
          </button>
          <button
            onClick={(e) => genDemo(e)}
            className={`flex justify-center items-center mt-3  md:gap-2 p-3 w-[30%] rounded-lg h-[60px]  text-white ${showDemo ? 'bg-backgr':'bg-primary1'} transition-opacity`}
          >
            {showDemo === "loading" ? (
              <>
                {/* <Loader/> */}

                <DemLoader />
              </>
            ) : showDemo ? (
              <>
                <LucideTvMinimalPlay />
                Stop Demo
              </>
            ) : (
              <>
                <LucideTvMinimalPlay />
                Live Demo
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
