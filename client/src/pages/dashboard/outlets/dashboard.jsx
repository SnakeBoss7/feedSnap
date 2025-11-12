import { SimpleHeader } from "../../../components/header/header";
import {
  BarChartBigIcon,
  Calendar1Icon,
  ExternalLink,
  Globe,
  MessageSquare,
  Plus,
  Star,
} from "lucide-react";
import { Background } from "../../../components/background/background";
import { useEffect } from "react";
import axios from "axios";
import { useReducer } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { RatingStar } from "../../../components/star/star";
import { Link } from "react-router-dom";
import { EmptyDash } from "../../../components/empty/emptyDash";
import AddButton from "../../../components/button/addButton";
//backedn_api
const apiUrl = process.env.REACT_APP_API_URL;
const getCachedData = () => {
  const type = localStorage.getItem("type");
  const cachedData = localStorage.getItem("dashboardData");

  // Check if cache exists and is recent (e.g., less than 5 minutes old)
  if (type === "FETCH_SUCCESS" && cachedData) {
    try {
      const parsed = JSON.parse(cachedData);
      const isRecent = Date.now() - parsed.timestamp < 5 * 60 * 1000; // 5 minutes

      if (isRecent && parsed.data) {
        return {
          ...parsed.data,
          isLoading: false,
        };
      }
    } catch (e) {
      console.log("Cache parse error:", e);
    }
  }
  return {
    sites: [],
    userfeedback: [],
    avgRatingPerSite: {},
    feedbackPerSite: {},
    avgRating: 0,
    isLoading: true,
    mess: "",
  };
};
const dashboardReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_SUCCESS":
      return {
        ...state,
        ...action.payload,
        isLoading: false,
      };
    case "FETCH_FAIL":
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state; // ✅ Always return state in default
  }
};
const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
export const DashboardHome = () => {
  const [state, dispatch] = useReducer(dashboardReducer, getCachedData());
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(`${apiUrl}/api/feedback/getfeedback`, {
          withCredentials: true,
        });
        await wait(2000);
        console.log(res);
        dispatch({
          type: "FETCH_SUCCESS",
          payload: res.data,
        });

        // Store with timestamp
        const cacheData = {
          data: res.data,
          timestamp: Date.now(),
        };
        console.log(cacheData);
        localStorage.setItem("dashboardData", JSON.stringify(cacheData));
        localStorage.setItem("type", "FETCH_SUCCESS");
      } catch (err) {
        dispatch({
          type: "FETCH_FAIL",
          payload: err.response?.data,
        });
        console.log(err);
        localStorage.setItem("type", "FETCH_FAIL");
      }
    }

    // Fetch fresh data if cache is missing, old, or invalid
    if (state.isLoading) {
      fetchData();
    }
  }, [state.isLoading]);
  return (
    state.sites.length<= 0 && !state.isLoading ?<EmptyDash/> :<>
      <div className="h-full w-full overflow-y-scroll scrollbar-hide  font-sans">
      <SimpleHeader color="#c5b5ff" />

      <div className="relative h-full  md:px-10 px-5 py-8">
        <Background color={"#c5b5ff"}/>

        {state.isLoading ? (
          <SkeletonTheme baseColor="#b88fddff" highlightColor="#ede1f7">
            <div className="p-6 space-y-6">
              {/* Header skeleton */}
              <Skeleton height={40} width={300} />
              <Skeleton height={20} width={250} />

              {/* Button skeleton */}
              <Skeleton height={40} width={180} />

              {/* Grid skeletons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Skeleton height={100} />
                <Skeleton height={100} />
                <Skeleton height={100} />
                <Skeleton height={100} />
              </div>
            </div>
          </SkeletonTheme>
        ) : (
          <>
            <div className="relative header flex flex-col gap-5 sm:flex-row justify-between items-start md:items-center">
              <div className="heading flex flex-col gap-1">
                <h1 className="text-5xl  font-extrabold bg-gradient-to-r tracking-tight from-blue-500 via-purple-400  to-purple-800 bg-clip-text text-transparent ">
                  Dashboard
                </h1>
                <p className="text-md text-gray-700 tracking-tight">
                  Welcome back! Here's your feedback overview.
                </p>
              </div>
              <Link
                to="scriptGen"
                className="flex items-center justify-center"
              >
                {" "}
               <AddButton/>
              </Link>
            </div>
            {/* <button onClick={()=>console.log(state)}>helo</button> */}
            <div className="mt-14 w-full gap-3 overallStats grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1">
              <div className="h-[110px] backdrop-blur-md bg-white/80 border border-white/10 flex rounded-lg items-center justify-between p-3">
                <div className="left ">
                  <h1 className="text-sm font-bold text-gray-900">
                    Total Feedback
                  </h1>
                  <p className="text-xl font-regular mb-2">
                    {state.totalFeedbacks}
                  </p>
                </div>
                <MessageSquare
                  size={25}
                  className="h-full "
                  color="#8714d4ff"
                />
              </div>
              <div className="h-[110px] backdrop-blur-md bg-white/80 border border-white/10 flex rounded-lg items-center justify-between p-3">
                <div className="left ">
                  <h1 className="text-sm font-bold text-gray-900">
                    Average Rating
                  </h1>
                  <p className="mb-3 text-xl font-regular mb-2">
                    {state.avgRating}
                  </p>
                  <RatingStar value={state.avgRating} />
                </div>
                <Star size={25} color="#EAB307" />
              </div>
              <div className="h-[110px] group backdrop-blur-md bg-white/80 border border-white/10  flex rounded-lg items-center justify-between p-3">
                <div className="left ">
                  <h1 className="text-sm font-bold text-gray-900">
                    Average Widgets
                  </h1>
                  <p className="text-xl font-regular mb-2">
                    {state.sites.length}
                  </p>
                  <p className="text-[12px] text-gray-500">
                    Across All websites
                  </p>
                </div>
                <Globe size={25} className="group-hover:rotate-180 transition-all ease-in-out duration-300"  color="#1976e0ff" />
              </div>
              <div className="h-[110px] backdrop-blur-md bg-white/80 border border-white/10  flex rounded-lg items-center justify-between p-3">
                <div className="left ">
                  <h1 className="text-sm font-bold text-gray-900">
                    This months
                  </h1>
                  <p className="text-xl font-regular mb-2">
                    {state.sites.length}
                  </p>
                </div>
                <Calendar1Icon size={25} color="#4fc00dff" />
              </div>
            </div>
            <div className="mt-3 reviws_sites flex w-full flex-col gap-3 lg:flex-row justify-between  ">
              <div className="reviews lg:w-[50%] w-full backdrop-blur-md bg-white/80 border border-white/10 rounded-lg p-3 ">
                <div className="flex justify-between w-full">
                  <div>
                    <h1 className="text-xl lg:text-2xl font-semibold">
                      Recent Feedback
                    </h1>
                    <p className="text-gray-600 text-sm">
                      Latest customer responses
                    </p>
                  </div>
                  <Link
                    to="feedbacks"
                    className="gap-1 px-3 h-10 flex items-center border border-gray-300 hover:text-primary1 hover:border-primary1 transition-all ease-in-out duration-500"
                  >
                    View All
                  </Link>
                </div>
                <div className="mt-10 flex flex-col gap-5">
                  {state?.userfeedback
                    ?.filter((data) => data.rating && data.rating !== "")
                    .slice(0, 3)
                    .map((data, idx) => {
                      return (
                        <div
                          key={idx}
                          className="flex flex-col gap-2 p-3 rounded-lg "
                          style={{ border: "2px solid #e3f0fdff" }}
                        >
                          <div className="metaData ">
                            <p
                              className="text-xs font-bold w-fit px-1"
                              style={{ border: "2px solid #e3f0fdff" }}
                            >
                              {data.webUrl
                                .replace(/(^\w+:|^)\/\//, "")
                                .replace(/["']/g, "")}
                            </p>
                          </div>
                          <div className="description text-sm font-normal text-gray-600 flex flex-col gap-1">
  <p className="overflow-hidden break-words overflow-wrap-anywhere">
    {data.description}
  </p>
  <p className="text-xs text-gray-500">Page: {data.pathname}</p>
</div>
                        </div>
                      );
                    })}
                </div>
              </div>
              <div className="sites lg:w-[50%] w-full  backdrop-blur-md bg-white/80 border border-white/10   rounded-lg   p-3">
                <div className="flex justify-between w-full">
                  <div>
                    <h1 className="text-xl lg:text-2xl font-bold">
                      Your websites
                    </h1>
                    <p className="text-gray-600 text-sm">
                      Widget status overview
                    </p>
                  </div>
                  <Link
                    to="scriptGen"
                    className="gap-1 px-2 h-10 group   flex items-center border border-gray-300  hover:text-primary1 hover:border-primary1 transition-all ease-in-out duration-500"
                  >
                    <Plus size={20} className="group-hover:scale-[1.2] group-hover:rotate-90 transition-all ease-in-out duration-300"/> Add Site
                  </Link>
                </div>
                <div className="mt-10 flex flex-col gap-5 border">
                  {state.sites.map((val, idx) => {
                    return (
                      <>
                        <div className="flex justify-between  p-2 rounded-sm"  style={{ border: "1px solid #c9d6e2ff" }}>
                          <div className="flex items-center gap-3" key={idx}>
                            <Globe color="#1976e0ff" /> {val}
                          </div>

                          <div
                            key={val}
                            className="flex gap-1 text-sm flex-col items-center"
                          >
                            <p className="font-bold">
                              {Object.values(state.avgRatingPerSite)[idx]}
                            </p>
                            <p className="text-xs text-gray-600">
                              {Object.values(state.feedbackPerSite)[idx]}{" "}
                              feedback
                            </p>
                            <RatingStar
                              value={Object.values(state.avgRatingPerSite)[idx]}
                            />
                          </div>
                        </div>
                      </>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="my-10 mb-30 py-5 px-5 rounded-lg backdrop-blur-md bg-white/80 border border-white/10">
              <div className="flex flex-col gap-2">
                <h1 className="text-xl lg:text-2xl  font-bold">
                  Quick Actions
                </h1>
                <p className="text-gray-700 text-sm">
                  Common tasks to manage your feedback widgets
                </p>
              </div>
              <div className="navigarots mt-10 w-full gap-3 overallStats grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1">
                <Link to="scriptGen" className="h-[110px] text-sm hover:scale-[1.01] hover:text-primary1 hover:bg-primary1/30 duration-100 transition-all ease-in bg-white  shadow-lg flex flex-col rounded-lg items-center justify-center gap-2 border border-black/20 hover:border-primary1/20">
                  <Plus />
                  <p className="font-regular">Add Widget</p>
                </Link>
                <Link to="feedbacks" className="h-[110px] text-sm hover:scale-[1.01] hover:text-primary1 hover:bg-primary1/30 duration-100 transition-all ease-in bg-white shadow-lg flex  flex-col rounded-lg items-center justify-center gap-2 p-3 border border-black/20 hover:border-primary1/20">
                  <MessageSquare />
                  <p>View Feedback</p>
                </Link>
                <Link to="analytics" className="h-[110px] text-sm hover:scale-[1.01] hover:text-primary1 hover:bg-primary1/30 duration-100 transition-all ease-in bg-white shadow-lg flex flex-col rounded-lg items-center justify-center gap-2 p-3 border border-black/20 hover:border-primary1/20">
                  <BarChartBigIcon />
                  <p className=" font-regular">Analytics</p>
                </Link>
                <Link to="scriptGen" className="h-[110px] text-sm hover:scale-[1.01] hover:text-primary1 hover:bg-primary1/30 duration-100 transition-all ease-in bg-white shadow-lg flex flex-col rounded-lg items-center justify-center gap-2 p-3 border border-black/20 hover:border-primary1/20">
                  <ExternalLink />
                  <p className=" font-regular">Widget Demo</p>
                </Link>
              </div>
            </div>
            <div className="h-[10px]"></div>
          </>
        )}
        <div className="lg:h-5 h-10"></div>
      </div>
    </div></> 
  
  );
};
