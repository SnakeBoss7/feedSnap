import { faAudioDescription } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import {
  Bug,
  BugIcon,
  BugOffIcon,
  BugPlay,
  HeartHandshake,
  HelpCircle,
  LucideBug,
  MessageSquare,
  MessageSquareShare,
  Puzzle,
  Send,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import Select from "react-select";
import { FileUploadBox } from "./fileupload";
const apiUrl = process.env.REACT_APP_API_URL;
export const FeedbackBox = () => {
  const [hover, setHover] = useState(null);
  const [greet, setGreet] = useState(false);
  const [themeColor, setThemeColor] = useState("#aec6cf");

  const [feedback, setFeedback] = useState({
    title: "",
    description: "",
    image: null,
    rating: "",
    pathname: "",
    Url: "",
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
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  useEffect(() => {

    // getting params give with iframe src to authentiate user
    const queryParams = new URLSearchParams(window.location.search);
    const webUrlParam = queryParams.get("webUrl");

    if (!webUrlParam) {
      console.warn("⚠️ webUrl missing in query params!");
      return;
    }

    // handling message from iframe
    const handleMessage = (event) => {
      console.log(" Message received:", event);

      if (event.origin !== webUrlParam) {
        console.warn(" Origin mismatch:", event.origin);
        return;
      }

      const { type, payload, pathname } = event.data;

      if (type === "FEEDBACK_WIDGET_CONFIG") {
        console.log(" Received config payload:", payload, pathname);
        setThemeColor(payload.color);
        setFeedback((prev) => ({ ...prev, Url: event.origin }));
      }
      if (type === "ROUTE_CHANGE") {
        console.log(" path changed", pathname);
        setFeedback((prev) => ({ ...prev, pathname: pathname }));
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

    // star or raing handling
  const handleClick = (value) => {
    setFeedback((prev) => ({ ...prev, rating: value }));
  };

  const onsubmit = async (e) => {
    e.preventDefault();

    const { title, description, image, rating, pathname, Url } = feedback;
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

    setGreet(true);
    let formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("image", image);
    formData.append("rating", rating);
    formData.append("pathname", pathname);
    formData.append("Url", Url);

    try {
      let res = await axios.post(
        `${apiUrl}/api/feedback/addfeedback`,
        formData,
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
    await wait(6000);
      console.log(window.parent);
      console.log(Url);
      window.parent.postMessage({ type: "FEEDBACK_SUBMITTED" }, `${Url}`);
    setGreet(false);
  };

  return (
    <form
      onSubmit={onsubmit}
      className="fixed rounded-xl overflow-hidden p-5 flex flex-col  bg-white h-full w-full  justify-between "
    >
      {greet ? (
        <>
          <div className="h-full w-full flex justify-center  items-center">
            <h1 className="flex text-3xl font-bold trakcing-tight">
              Thanks for your feedback! <HeartHandshake />
            </h1>
          </div>
        </>
      ) : (
        <>
          <div
            className="h-[6px] w-full left-[0%] absolute top-0 rounded-full "
            style={{ backgroundColor: themeColor }}
          ></div>
          <div class="heading flex flex-col items-center">
            <div
              className="bg text-white h-12 w-12 items-center justify-center flex rounded-xl"
              style={{ backgroundColor: themeColor }}
            >
              <LucideBug className="bg text-white size-7" />
            </div>
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
                  borderColor: themeColor,
                  boxShadow: `0 0 0 1px ${themeColor}`,
                  "&:hover": { borderColor: themeColor },
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected ? themeColor : "#fff",
                  color: state.isSelected ? "#fff" : "#000",
                  "&:hover": {
                    backgroundColor: `${themeColor}20`, // 20 = ~12% opacity
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
                      fill={
                        (hover || feedback.rating) >= star ? themeColor : "none"
                      }
                      stroke={
                        (hover || feedback.rating) >= star
                          ? themeColor
                          : "#d1d5db"
                      } //
                      viewBox="0 0 24 24"
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
              <div class="image flex flex-col gap-3">
                <FileUploadBox
                  onFileAccepted={(f) => {
                    setFeedback((prev) => ({ ...prev, image: f }));
                  }}
                />
              </div>
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
              style={{ outline: themeColor }}
              className="w-full  h-[100px] border border-gray-400 p-3"
              name="description"
              placeholder="Describe your issue here."
              id=""
            ></textarea>
          </div>
          <div class="controls flex flex-col gap-3">
            <button
              type="submit"
              className="rounded-xl text-white font-semibold text-lg h-12 w-full border
              bg-left 
             transition-all duration-300 ease-in-out flex items-center justify-center
             hover:bg-right hover:shadow-xl active:scale-95"
              style={{ backgroundColor: themeColor }}
            >
              <Send /> Submit
            </button>
          </div>
        </>
      )}
    </form>
  );
};
