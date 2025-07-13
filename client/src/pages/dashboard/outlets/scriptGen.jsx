import { SimpleHeader } from "../../../components/header/header";
import { GlobeLock, Paintbrush,Grid2X2, Grid2X2Check } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import  Select  from 'react-select'
import { HighlightedGridIcon } from "../../../utils/gridIcons";
let apiUrl = process.env.REACT_APP_API_URL
export const ScriptGen = () => {
  //widget color
  const[UrlSettings,setUrlsettings]=useState(
    {
        webUrl:'',
        position:'bottom right',
        color:'#2563EB',
        text:'Feedback'
    })

  const colorChange = (e) => {
    setUrlsettings((prev)=>({...prev,[e.target.name]:e.target.value}))
  };
  const genScript =async(e)=>
    {
      e.preventDefault();
      let emptyVal = Object.entries(UrlSettings).some((key,value)=>(value==='' && key !== UrlSettings.text ) )
        
        if(emptyVal)
          {
            console.warn('keys are empty')
            return;
          }
      
      try
      {
          let res = await axios.post(`${apiUrl}/api/script/create`,{settings:UrlSettings},
          {
            withCredentials:true
          })
        console.log(res);
      }catch(err)
      {
        
        console.log(err);
      }
    }

    const options = [
      {
        value:"bottom right",
        label:(
          <div className="flex items-center font-bold gap-3">
          <HighlightedGridIcon highlight="bottom-right"/>Bottom right</div>
        )
      },
      {
        value:"bottom left",
        label:(
          <div className="flex items-center font-bold gap-3"><HighlightedGridIcon highlight="bottom-left"/> Bottom left</div>
        )
      },
      {
        value:"top right",
        label:(
          <div className="flex items-center font-bold gap-3"><HighlightedGridIcon highlight="top-right"/>Top right</div>
        )
      },
      {
        value:"top left",
        label:(
          <div className="flex items-center font-bold gap-3">
            <HighlightedGridIcon highlight="top-left"/>
            Top left</div>
        )
      }
  ];
 
  return (
    <div className="flex overflow-y-scroll flex-col min-h-screen lg:[70%] w-full bg-white">
      <SimpleHeader />
      <div className="p-6">
        <h1 className="tracking-tight text-4xl font-bold ">Script Generator</h1>
        <p className="tracking-tight text-lg text-gray-600">
          Generate and customize your feedback widget script
        </p>
      </div>
      <div className="flex flex-col w-full h-full bg-white lg:flex-row">
        <form className="p-6 lg:w-1/2" action="" onSubmit={genScript}>
          <div className="border border-gray-300  p-2 rounded-lg w-full mb-5">
            <h1 className="tracking-tight text-zinc-800 text-2xl font-bold flex items-center gap-3">
              <GlobeLock className="h-5 " />
              Website Configuration
            </h1>
            <p className="mb-9 tracking-tight text-gray-600 text-sm ">
              Enter your website details to generate the script
            </p>
            {/* website url  */}
            <label for="web_url" className="tracking-tight text-lg font-bold">
              Website Url
            </label>
            <input
              onChange={(e) => {
                setUrlsettings((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value,
                }));
              }}
              className="border border-gray-300 rounded-lg tracking-tight w-full h-8 text-black px-3 my-2 py-5 text-lg"
              placeholder="https://yourwebsite.com"
              type="text"
              name="webUrl"
            />
            <p className="tracking-tight text-gray-500 mb-6 text-sm">
              Enter the full URL of your website
            </p>
            <button
              className={`h-12 rounded-md w-full text-white trasnition-all ease-in-out   text-xl font-bold ${
                UrlSettings.webUrl === ""
                  ? "bg-gradient-to-r from-blue-300 via-blue-300 to-purple-300"
                  : "bg-gradient-to-r from-blue-500 via-blue-600 to-purple-500"
              } `}
            >
              Generate
            </button>
          </div>
          {/* widget customization */}

          <div className="border border-gray-300 p-2 rounded-lg w-full mb-5 flex flex-col">
            <h1 className="tracking-tight text-2xl font-bold flex items-center gap-3">
              <Paintbrush className="h-5" />
              Widget Customiztion
            </h1>
            <p className="text-gray-600 mb-8 text-sm">
              Customize the appearance and behavior of your widget
            </p>
            <label
              for="position"
              className=" text-lg font-bold  tracking-tight"
            >
              Position
            </label>
             <Select
              required
              options={options}
              onChange={(e) =>
                setUrlsettings((prev) => ({ ...prev, title: e?.value || "" }))
              }
              placeholder="Select feedback type..."
              className="text-sm"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#d1d5db",
                  boxShadow: "none",
                  padding: "2px",
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected ? "#60a5fa" : "#fff",
                  color: state.isSelected ? "#fff" : "#000",
                  "&:hover": {
                    backgroundColor: "#e0f2fe",
                  },
                }),
              }}
            />
            {/* paint section  */}
            <label for="color " className="font-bold mt-5">
              Widget Color
            </label>
            <div class="color gap-3 flex  items-center mb-5 ">
              <input
                type="color"
                name="color"
                onChange={colorChange}
                value={UrlSettings.color}
                className="h-10 w-[80px] rounded-lg border-3 bourder-green-500"
              />
              <input
                className="w-fit h-8 p-3 border border-gray-500"
                type="text"
                defaultValue={UrlSettings.color}
                onChange={colorChange}
              />
            </div>
            {/*  widget text */}
            <label for="text" className="font-bold">
              Widget Text
            </label>
            <input
              onChange={(e) => {
                setUrlsettings((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value,
                }));
              }}
              className="h-10  border border-gray-400 px-3 mt-1 rounded-lg"
              defaultValue="FeedBack"
              type="text"
              name="text"
            />
          </div>
        </form>
        <div className="scriptBox p-6 min-h-[300px] h-fit mb-5 border m-6 border-gray-300 rounded-lg lg:w-1/2">
          <h1 className="text-3xl font-bold tracking-tight ">
            {"< >  "} Generated Script
          </h1>
          <p className="mb-10">
            Copy this script and paste it before the closing {"</body>"} tag
          </p>
          <div>
            {UrlSettings.webUrl !== "" ? (
              <></>
            ) : (
              <>
                <div className="icon text-2xl text-center tracking-tight font-bold">
                  {"<>"}
                </div>
                <p className="text-center font-bold text-gray-500">
                  Enter your website URL and click "Generate Script" to get
                  started
                </p>
                <button onClick={() => console.log(UrlSettings)}>print</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
