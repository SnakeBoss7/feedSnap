import { SimpleHeader } from "../../../components/header/header";
import {
  GlobeLock,
  Paintbrush,
  Grid2X2,
  Grid2X2Check,
  LucideInfo,
  LucideBadgeInfo,
  LucideCode,
  LucideBookCopy,
  LucideCloudDownload,
} from "lucide-react";
import { useState } from "react";
import axios from "axios";
import Select from "react-select";
import { HighlightedGridIcon } from "../../../utils/gridIcons";
import { RatingStar } from "../../../components/star/star";
import Loader from "../../../components/loader/loader";
import WidgetTabs from "../../../components/tabs/tabs";
let apiUrl = process.env.REACT_APP_API_URL;
export const ScriptGen = () => {
  //tabs
  const [active, setActive] = useState(0);
  const tabs = ["Tab One", "Tab Two", "Tab Three"];
  //tabs content

  //widget color
  const [scriptInj, setScriptInj] = useState("");
  const [UrlSettings, setUrlsettings] = useState({
    webUrl: "",
    position: "bottom right",
    color: "#2563EB",
    text: "Feedback",
    loaded: false,
  });

  const colorChange = (e) => {
    setUrlsettings((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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

    if (emptyFields.length > 0) {
      console.warn("Empty required fields:", emptyFields);
      return;
    }

    try {
      console.log("Starting API call...");
      setUrlsettings((prev) => ({ ...prev, loaded: true }));

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
      setUrlsettings((prev) => ({ ...prev, loaded: false }));
    } catch (err) {
      console.error("API error:", err);
      setUrlsettings((prev) => ({ ...prev, loaded: false }));
    }
  };

  const options = [
    {
      value: "bottom right",
      label: (
        <div className="flex items-center font-bold gap-3">
          <HighlightedGridIcon highlight="bottom-right" />
          Bottom right
        </div>
      ),
    },
    {
      value: "bottom left",
      label: (
        <div className="flex items-center font-bold gap-3">
          <HighlightedGridIcon highlight="bottom-left" /> Bottom left
        </div>
      ),
    },
    {
      value: "top right",
      label: (
        <div className="flex items-center font-bold gap-3">
          <HighlightedGridIcon highlight="top-right" />
          Top right
        </div>
      ),
    },
    {
      value: "top left",
      label: (
        <div className="flex items-center font-bold gap-3">
          <HighlightedGridIcon highlight="top-left" />
          Top left
        </div>
      ),
    },
  ];

  return (
    <div className="relative h-full px-10 py-8">
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#e8e8e8_1px,transparent_1px),linear-gradient(to_bottom,#e8e8e8_1px,transparent_1px)] bg-[size:4.5rem_3.5rem] [&>div]:absolute [&>div]:inset-0 [&>div]:bg-[radial-gradient(circle_850px_at_0%_200px,#c5b5ff,transparent)]">
          <div></div>
        </div>
      </div>

      <div className="relative">
        <h1 className="text-4xl  font-extrabold bg-gradient-to-r from-blue-500 via-purple-400  to-purple-800 bg-clip-text text-transparent ">
          Script Generator
        </h1>
        <p className="text-lg text-gray-700 tracking-tight">
          Generate and customize your feedback widget script
        </p>
      </div>
      <div className="flex flex-col w-full my-3 h-full lg:flex-row justify-between">
        {/* <div className="relative flex w-full max-w-md mx-auto bg-gray-100 rounded-lg p-1"> */}
        {/* Highlight Background
      <div
        className="absolute top-1 bottom-1 w-1/3 bg-blue-500 rounded-lg transition-all duration-300 ease-in-out"
        style={{
          left: `${active * 33.3333}%`,
        }}
      ></div> */}

        <WidgetTabs
          options={options}
          colorChange={colorChange}
          UrlSettings={UrlSettings}
          setUrlsettings={setUrlsettings}
          genScript={genScript}
        />
        {/* </div> */}
        <div className="scriptBox p-6 min-h-[300px] h-fit mb-5 border m-6 border-gray-300 rounded-lg lg:w-[40%] text-white  bg-[#111828] flex flex-col items-center">
          <h1 className="text-2xl w-full font-medium mb-1 tracking-tight flex  items-start justify-between">
            <div class="mb-8 items-center flex gap-3">
              <LucideCode className="text-[#5BAE83]" />
              Generated Script
            </div>
            <div class="right text-sm">
              <p
                className={`${
                  scriptInj !== ""
                    ? "text-white bg-[#5BAE83]"
                    : "text-white bg-gray-600"
                } rounded-xl p-1 px-2 text-xs`}
              >
                Ready
              </p>
            </div>
          </h1>

        
            {UrlSettings.loaded ? (
              <div className="px-4 w-full self-center w-[90%] bg-[#1E2939] rounded-lg border-[0.5px] border-[#5BAE83]  py-8 text-white rounded-lg flex flex-col items-center ">
                {" "}
                <Loader />
              </div>
            ) : scriptInj !== "" ? (
              <>
                <div className="p-4 w-full w-[90%] bg-[#1E2939] rounded-lg border-[0.5px] border-[#5BAE83] text-white overflow-x-scroll">
                  <code className="text-[#5BAE83]">{scriptInj}</code>
                </div>
                <div className="w-full mt-5 flex gap-5 justify-between">
                  <button className="bg-[#1E2939] rounded-lg border-[0.5px] border-[#5BAE83] h-10 w-full text-sm font-medium gap-3 flex justify-center items-center p-2">
                    <LucideBookCopy />Copy</button>
                  <button className="bg-[#1E2939] rounded-lg border-[0.5px] border-[#5BAE83] h-10 w-full text-sm font-medium gap-3 flex justify-center items-center p-2">
                    <LucideCloudDownload />Download</button>
                </div>
              </>
            ) : (
              <>
                <div className="px-4  self-center py-8 w-[90%] bg-[#1E2939] rounded-lg border-[0.5px] border-[#5BAE83] text-white rounded-lg flex flex-col items-center ">
                  <LucideCode color="#5BAE83" size={40} />
                  <p className="text-lg text-center mt-3 tracking-tight font-bold">
                    No Script Generated Yet
                  </p>
                  <p className="text-sm text-center tracking-tight">
                    Configure your widget and click generate
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
  
  );
};

{
  /* <div class="relative h-screen">
  <!-- Background Pattern -->
  <div class="absolute inset-0">
    <div class="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)]"></div>
  </div>
  
  <!-- Hero Content -->

</div> */
}
{
  /* <div class="relative h-screen">
  <!-- Background Pattern -->
  <div class="absolute inset-0">
    <div class="relative h-full w-full [&>div]:absolute [&>div]:top-0 [&>div]:right-0 [&>div]:z-[-2] [&>div]:h-full [&>div]:w-full [&>div]:bg-gradient-to-l [&>div]:from-blue-200 [&>div]:to-white">
    <div></div>
    
  </div>
  </div>
  
  <!-- Hero Content -->
  <div class="relative z-10 flex h-full flex-col items-center justify-center px-4">
    <div class="max-w-3xl text-center">
      <h1 class="mb-8 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl text-slate-900">
        Your Next Great
        <span class="text-sky-900">Project</span>
      </h1>
      <p class="mx-auto mb-8 max-w-2xl text-lg text-slate-700">
        Build modern and beautiful websites with this collection of stunning background patterns. 
        Perfect for landing pages, apps, and dashboards.
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <button class="rounded-lg px-6 py-3 font-medium bg-sky-900 text-white hover:bg-sky-800">
          Get Started
        </button>
        <button class="rounded-lg border px-6 py-3 font-medium border-slate-200 bg-white text-slate-900 hover:bg-slate-50">
          Learn More
        </button>
      </div>
    </div>
  </div>
</div> */
}

{
  /* <div class="relative h-screen">
  <!-- Background Pattern -->
  <div class="absolute inset-0">
    <div class="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] [&>div]:absolute [&>div]:inset-0 [&>div]:bg-[radial-gradient(circle_800px_at_100%_200px,#d5c5ff,transparent)]">
    <div></div>
    
  </div>
  </div>
  
  <!-- Hero Content -->
  <div class="relative z-10 flex h-full flex-col items-center justify-center px-4">
    <div class="max-w-3xl text-center">
      <h1 class="mb-8 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl text-slate-900">
        Your Next Great
        <span class="text-sky-900">Project</span>
      </h1>
      <p class="mx-auto mb-8 max-w-2xl text-lg text-slate-700">
        Build modern and beautiful websites with this collection of stunning background patterns. 
        Perfect for landing pages, apps, and dashboards.
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <button class="rounded-lg px-6 py-3 font-medium bg-sky-900 text-white hover:bg-sky-800">
          Get Started
        </button>
        <button class="rounded-lg border px-6 py-3 font-medium border-slate-200 bg-white text-slate-900 hover:bg-slate-50">
          Learn More
        </button>
      </div>
    </div>
  </div>
</div> */
}
