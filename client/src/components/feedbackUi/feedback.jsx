import { faAudioDescription } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { Bug, BugIcon, HelpCircle, MessageSquare, MessageSquareShare, Puzzle, Send, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import Select from "react-select";
import { FileUploadBox } from "./fileupload";
const apiUrl = process.env.REACT_APP_API_URL;
export const FeedbackBox = () => {
  const [hover, setHover] = useState(null);
  const [file, setFile] = useState(null);
  const [feedback, setFeedback] = useState({
    title: "",
    description: "",
    image: null,
    rating: "",
  });
  const options = [
    {
      value: "bug",
      label: (
        <div className="flex items-center gap-2">
          <Bug size={18} /> Bug
        </div>
      ),
    },
    {
      value: "feedback",
      label: (
        <div className="flex items-center gap-2">
          <MessageSquare size={18} /> Feedback
        </div>
      ),
    },
    {
      value: "confusion",
      label: (
        <div className="flex items-center gap-2">
          <HelpCircle size={18} /> UI Confusion
        </div>
      ),
    },
    {
      value: "feature",
      label: (
        <div className="flex items-center gap-2">
          <Sparkles size={18} /> Feature Request
        </div>
      ),
    },
    {
      value: "other",
      label: (
        <div className="flex items-center gap-2">
          <Puzzle size={18} /> Other
        </div>
      ),
    },
  ];

  //  const [rating, setRating] = useState(0);

  const handleClick = (value) => {
    setFeedback(prev=>({...prev,rating:value}));
    // onChange?.(value);
  };

  const onsubmit = async (e) => {
    e.preventDefault();

    
    const { title, description, image, rating } = feedback;
    //validating
    if (!title || !description) {
      alert("Please fill in required fields: title and description.");
      return;
    }

    // Conditional check: if feedback, rating is required
    if (title === "feedback" && !rating) {
      alert("For feedback, rating is required.");
      return;
    }

    const fullUrl = window.location.href;
    let formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("image", file);
    formData.append("rating", rating);
    formData.append("fullUrl", fullUrl);
    try {
      let res = await axios.post(`${apiUrl}/api/feedback/addfeedback`, formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(res);
    } catch (err) {
      console.log(err);
    }

  };

  return (
    <div className="h-[100%] w-[100%] fixed ">
      <div className="h-[100%]  w-[100%] backdrop-blur-md bg-gray-400 flex justify-center items-center">
        <form
          onSubmit={onsubmit}
          className="fixed rounded-xl overflow-hidden p-5 flex flex-col  bg-white lg:w-[500px] w-[400px]  justify-between h-[600px]"
        >
        <div className="h-[6px] w-[4000px] left-[0%] absolute top-0 bg-blue-500 rounded-full "></div>
          <div class="heading flex flex-col items-center">
            <BugIcon className="" />
            <h1 className="text-3xl font-bold mt-3 trakcing-tight">Feedback</h1>
            <p className="tracking-tight text-gray-500 ">Help us improve</p>
          </div>
          <div class="type flex gap-3 flex-col">
            <label
              for="role"
              border-4
              border-gray-500
              className="text-lg font-bold"
            >
              Report Type *
            </label>

            <Select
              required
              options={options}
              onChange={(e) =>
                setFeedback((prev) => ({ ...prev, title: e?.value || "" }))
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

            {feedback.title === "feedback" ? (
              <>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      onClick={() => handleClick(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(null)}
                      xmlns="http://www.w3.org/2000/svg"
                      fill={(hover || feedback.rating) >= star ? "#facc15" : "none"}
                      viewBox="0 0 24 24"
                      stroke="#facc15"
                      className="w-6 h-6 cursor-pointer transition-all"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M11.48 3.499l2.241 6.908h7.26l-5.872 4.268 2.241 6.908-5.87-4.268-5.87 4.268 2.241-6.908-5.872-4.268h7.26z"
                      />
                    </svg>
                  ))}
                </div>
              </>
            ) : feedback.title === "bug" ? (
              <div class="image flex flex-col gap-3"><FileUploadBox onFileAccepted={(f)=>{setFile(f)}}/></div>
            ) : (
              <></>
            )}
          </div>
          <div class="description flex flex-col gap-3">
            <label
              for="description"
              className="text-lg font-bold tracking-tight"
            >
              Description *
            </label>
            <textarea 
              required
              onChange={(e) => {
                setFeedback((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value,
                }));
              }}
              className="w-full outline-blue-500 h-[100px] border border-gray-400 p-3"
              name="description"
              placeholder="Describe your issue here."
              id=""
            ></textarea>
          </div>
          <div class="controls flex flex-col gap-3">
            <button
              type="submit"
              className="rounded-xl text-white font-semibold text-lg h-12 w-full border 
             bg-gradient-to-r from-blue-500 via-blue-600 to-purple-500 
             bg-[length:200%_100%] bg-left 
             transition-all duration-300 ease-in-out flex items-center justify-center
             hover:bg-right hover:shadow-xl active:scale-95"
            >
             <Send/> Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
