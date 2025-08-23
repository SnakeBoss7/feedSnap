import { useState } from "react";
import { Paintbrush, LucideInfo, Globe2Icon, LucideStars, LucideTvMinimalPlay } from "lucide-react";
import Select from "react-select";

export default function WidgetTabs({ options, colorChange, UrlSettings, setUrlsettings, genScript }) {
  const [active, setActive] = useState(0);

  // Tabs with labels + content as JSX
  const tabs = [
    {
      label: "Customize",
    },
    { 
      label: "Settings", 
    },
    { label: "Preview" },
  ];

  return (
    <div className="w-full max-w-3xl">
      {/* Tabs row */}
      <div className="relative flex w-full h-[50px] bg-gray-100  rounded-lg mb-6">
        {/* Sliding highlight - moved to back with pointer-events-none */}
        <div
          className="absolute p-2 top-[4px] bottom-[4px] w-1/3 bg-blue-500 rounded-md transition-all duration-300 ease-in-out pointer-events-none z-0"
          style={{
            left: `calc(${active * 33.333}% + 4px)`,
            width: `calc(33.333% - 10px)`,
          }}
        ></div>

        {/* Tab buttons */}
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`relative flex-1 text-center py-2 font-medium transition-colors duration-300 z-10 ${
              active === i ? "text-white" : "text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <form action="" id="widget-config" className="flex flex-col gap-3" onSubmit={genScript}>
        <div className="border bg-white opacity-80 p-3 rounded-md  w-full">

        {active === 0 && (
            <>

            <h1 className="tracking-tight text-xl font-bold flex items-center gap-3">
              <Paintbrush className="text-purple-500 h-5" />
              Widget Customization
          </h1>
          <p className="text-gray-600 mb-8 text-sm">
            Customize the appearance and behavior of your widget
          </p>

          <label htmlFor="position" className="text-lg font-[500] mb-2 block z-[9999999999]">
            Position
          </label>
          <Select
            required
            options={options}
            onChange={(e) =>
                setUrlsettings((prev) => ({ ...prev, title: e?.value || "" }))
            }
            placeholder="Select feedback type..."
            className="text-sm mb-4 relative z-[999999]"
            styles={{
                control: (base) => ({ ...base, borderColor: "#d1d5db", boxShadow: "none", padding: "2px" }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected ? "#60a5fa" : "#fff",
                color: state.isSelected ? "#fff" : "#000",
                "&:hover": { backgroundColor: "#e0f2fe" },
              }),
            }}
          />

          {/* Color picker */}
          <label htmlFor="color" className="font-[500] mt-5 mb-2 block">Widget Color</label>
          <div className="flex gap-3 items-center mb-5 relative z-10">
            <input
              type="color"
              name="color"
              onChange={colorChange}
              value={UrlSettings.color}
              className="h-10 w-[80px] rounded-lg border relative z-10"
            />
            <input
              className="h-10 p-2 border border-gray-500 rounded-lg relative z-10"
              type="text"
              name="color"
              value={UrlSettings.color}
              onChange={colorChange}
              />
          </div>

          {/* Widget text */}
           <div className="flex gap-2 items-center relative mb-4">
            <label htmlFor="text" className="font-[500]">Widget Text</label>
            <div className="relative">
              <LucideInfo size={18} className="peer inline-block ml-1 cursor-help" />
              <p className="bg-gray-800 rounded-md text-white p-2 absolute left-20 -top-5 sm:left-6 sm:-top-2 -left-32 -top-12 text-sm hidden peer-hover:block sm:whitespace-nowrap shadow-lg z-[9999] max-w-[280px] sm:max-w-none">
                Default Feedback as text will be shown, if empty a message icon will be shown
              </p>
            </div>
          </div>
          <input
            onChange={(e) =>
                setUrlsettings((prev) => ({ ...prev, [e.target.name]: e.target.value }))
            }
            className="h-10 border border-gray-400 px-3 mt-1 rounded-lg block relative z-10"
            defaultValue="FeedBack"
            type="text"
            name="text"
            />
        </>
  )}
  {active === 1 && (
    <>

            <h1 className="text-zinc-800 text-xl font-[700] flex items-center gap-3">
              <Globe2Icon className="h-5 text-blue-500" />
              Website Configuration
            </h1>
            <p className="mb-9 tracking-tight text-gray-600 text-sm pt-1">
              Enter your website details to generate the script
            </p>
            {/* website url */}
            <label htmlFor="web_url" className="tracking-tight text-lg font-[500]">
              Website Url
            </label>
            <input
            name="webUrl"
              onChange={(e) => {
                  setUrlsettings((prev) => ({
                      ...prev,
                      [e.target.name]: e.target.value,
                    }));
                }}
            />
      </>
  )}
  </div>
      <div className="flex gap-3">
      <button type="submit" className={`flex justify-center items-center gap-2 w-[70%] rounded-lg h-[60px] bg-gradient-to-r from-blue-500  to-blue-600 text-white
        ${UrlSettings.webUrl === ""?'opacity-70 cursor-not-allowed':''}`}>
        <LucideStars/>Generate Script</button>
      <button className={`flex justify-center items-center gap-2  w-[30%] rounded-lg h-[60px] bg-gradient-to-r from-purple-500 to-purple-600 text-white
             ${UrlSettings.webUrl === ""?'opacity-70 cursor-not-allowed':''}`}>
        <LucideTvMinimalPlay/>Live Demo</button>

      </div>
                 </form>
    </div>
  );
}