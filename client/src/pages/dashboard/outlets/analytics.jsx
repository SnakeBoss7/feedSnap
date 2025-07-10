import { SimpleHeader } from "../../../components/header/header";
import { GlobeLock, Paintbrush } from "lucide-react";
import { useState } from "react";

export const Analytics = () => {
  //widget color
  const [UrlSettings, setUrlsettings] = useState({
    webUrl: "",
    position: "bottom right",
    color: "#2563EB",
    text: "Feedback",
  });

  const colorChange = (e) => {
    setUrlsettings((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  return (
    <div className="flex overflow-y-scroll flex-col min-h-screen w-full bg-white">
      <SimpleHeader />
      <div className="p-6">
        <h1 className="tracking-tight text-4xl font-bold ">Script Generator</h1>
        <p className="tracking-tight text-lg text-gray-600">
          Generate and customize your feedback widget script
        </p>
      </div>
     
    </div>
  );
};