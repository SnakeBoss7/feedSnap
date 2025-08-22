import { SimpleHeader } from "../../../components/header/header";
import { BarChartBigIcon, BellPlusIcon, Calendar, Calendar1Icon, Cross, ExternalLink, Globe, Globe2, GlobeLock, MapPlus, MessageSquare, MoonStar, Paintbrush, Plus, PlusCircle, PlusSquare, PlusSquareIcon, Star, StarHalfIcon, StarIcon, StarOff, StarsIcon } from "lucide-react";
import { useState,useEffect } from "react";
import axios from "axios";
import { useReducer } from "react";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { RatingStar } from "../../../components/star/star";
import { Link } from "react-router-dom";
//backedn_api
const apiUrl = process.env.REACT_APP_API_URL;
const getCachedData = ()=> 
{
     const type = localStorage.getItem('type');
  const cachedData = localStorage.getItem('dashboardData');
  
  // Check if cache exists and is recent (e.g., less than 5 minutes old)
  if(type === 'FETCH_SUCCESS' && cachedData) {
    try {
      const parsed = JSON.parse(cachedData);
      const isRecent = Date.now() - parsed.timestamp < 5 * 60 * 1000; // 5 minutes
      
      if(isRecent && parsed.data) {
        return {
          ...parsed.data,isLoading:false
        };
      }
    } catch(e) {
      console.log('Cache parse error:', e);
    }
  }
  return {
    sites:[],
    userfeedback:[],
    avgRatingPerSite:{},
    feedbackPerSite:{},
    avgRating:0,
    isLoading: true,
    mess:'',
  }
}
const dashboardReducer = (state,action) =>
  {
    switch (action.type) {
      case 'FETCH_SUCCESS':
        return{
          ...state,
          ...action.payload,
          isLoading:false
        };
      case 'FETCH_FAIL':
               return{
          ...state,
          isLoading:false,
        };
      default:
        return state; // ✅ Always return state in default

    }
  }
  const wait= (ms)=>
    {
      return new Promise(resolve => setTimeout(resolve,ms));
    }
export const DashboardHome = () => {
    const [state, dispatch] = useReducer(dashboardReducer, getCachedData());
useEffect(() => {
 
  async function fetchData() {
    try {
      const res = await axios.get(`${apiUrl}/api/feedback/getfeedback`, {
        withCredentials: true
      });
      await wait(2000);
      console.log(res);
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: res.data,
      });
      
      // Store with timestamp
      const cacheData = {
        data: res.data,
        timestamp: Date.now()
      };
      localStorage.setItem("dashboardData", JSON.stringify(cacheData));
      localStorage.setItem("type", 'FETCH_SUCCESS');
    }
    catch(err) {
      dispatch({
        type: 'FETCH_FAIL',
        payload: err.response?.data,
      });
      console.log(err);
      localStorage.setItem("type", 'FETCH_FAIL');
    }
  }


  
  // Fetch fresh data if cache is missing, old, or invalid
  if(state.isLoading)
    {
      fetchData();

    }
}, []);
  return (
    <div className="p-4 pb-20relative h-full" style={{ backgroundColor: "#F9FAFB" }}>
      {state.isLoading ? (
        <SkeletonTheme baseColor="#d1d5db" highlightColor="#f3f4f6">
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
          <div className=" header flex flex-col gap-5 sm:flex-row justify-between items-start">
            <div className="heading flex flex-col gap-1">
              <h1 className="text-4xl font-regular bg-gradient-to-r from-blue-500 via-purple-400  to-purple-800 bg-clip-text text-transparent ">
                Dashboard
              </h1>
              <p className="text-lg text-gray-700 tracking-tight">
                Welcome back! Here's your feedback overview.
              </p>
            </div>
            <Link to="scriptGen" className="flex items-center px-2 py-3 text-white tracking-tight gap-2 rounded-lg bg-gradient-to-r from-blue-500 via-blue-600 to-purple-500">
              {" "}
              <PlusCircle /> Add New widget
            </Link>
          </div>
          {/* <button onClick={()=>console.log(state)}>helo</button> */}
          <div className="mt-10 w-full gap-3 overallStats grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1">
            <div className="h-[110px] bg-white shadow-lg flex rounded-lg items-center justify-between p-3"  style={{border:'2px solid #e3f0fdff'} }>
              <div className="left ">
                <h1 className="text-sm text-gray-900">Total Feedback</h1>
                <p className="text-2xl font-regular">{state.totalFeedbacks}</p>
              </div>
              <MessageSquare size={20} className="h-full " color="#8714d4ff" />
            </div>
            <div className="h-[110px] bg-white shadow-lg flex rounded-lg items-center justify-between p-3"   style={{border:'2px solid #e3f0fdff'} }>
              <div className="left ">
                <h1 className="text-sm text-gray-900">Average Rating</h1>
                <p className="mb-3 text-2xl font-regular">{state.avgRating}</p>
                <RatingStar value={state.avgRating} />
              </div>
              <Star size={20} color="#EAB307" />
            </div>
            <div className="h-[110px] bg-white shadow-lg flex rounded-lg items-center justify-between p-3"  style={{border:'2px solid #e3f0fdff'} }>
              <div className="left ">
                <h1 className="text-sm text-gray-900">Average Widgets</h1>
                <p className="text-2xl font-regular">{state.sites.length}</p>
                <p className="text-[12px] text-gray-500">Across All websites</p>
              </div>
              <Globe size={20} color="#1976e0ff" />
            </div>
            <div className="h-[110px] bg-white shadow-lg flex rounded-lg items-center justify-between p-3"  style={{border:'2px solid #e3f0fdff'} }>
              <div className="left ">
                <h1 className="text-sm text-gray-900">This months</h1>
                <p className="text-2xl font-regular">{state.sites.length}</p>
              </div>
              <Calendar1Icon size={20} color="#4fc00dff" />
            </div>
          </div>
           <div className="mt-3 reviws_sites flex w-full flex-col gap-3 lg:flex-row justify-between "  >
              <div className="reviews lg:w-[50%] w-full bg-white shadow-lg p-3 " style={{border:'2px solid #e3f0fdff'} }>
                <div className="flex justify-between w-full">
                  <div>
                    <h1 className="text-2xl font-bold">Recent Feedback</h1>
                    <p className="text-gray-400">Latest customer responses</p>
                  </div>
                  <Link to="scriptGen" className="gap-1 px-3 h-10 flex items-center border border-gray-300" style={{border:'2px solid #e3f0fdff'}}>
                    View All
                  </Link>
                </div>
                <div className="mt-10 flex flex-col gap-5">
                  {
                    state?.userfeedback?.filter((data)=> (data.rating && data.rating!=='')).slice(0,3).map((data,idx)=>
                      {
                        return(
                          <div key={idx} className="flex flex-col gap-2 p-3 " style={{border:'2px solid #e3f0fdff'}}>
                            <div className="metaData " >
                              <p className="text-xs font-bold w-fit px-1" style={{border:'2px solid #e3f0fdff'}}>{data.webUrl.replace(/(^\w+:|^)\/\//, '').replace(/["']/g, '')}</p>
                            </div>
                            <RatingStar value={data.rating}/>
                            <div className="description text-sm font-normal text-gray-600 flex flex-col">
                              <p>{data.description}</p>
                         
                            <p>

                              Page : {data.pathname}
                            </p>
                            </div>
                          </div>
                        )
                      } )
                  }
                </div>
              </div>
              <div className="sites lg:w-[50%] w-full bg-white shadow-lg p-3" style={{border:'2px solid #e3f0fdff'} }>
                <div className="flex justify-between w-full">
                  <div>
                    <h1 className="text-2xl font-bold">Your websites</h1>
                    <p className="text-gray-400">Widget status overview</p>
                  </div>
                  <Link to="scriptGen" style={{border:'2px solid #e3f0fdff'} } className="gap-1 px-2 h-10   flex items-center border border-gray-300">
                    <Plus size={20} /> Add Site
                  </Link>
                </div>
                <div className="mt-10 flex flex-col gap-5 border"  >
                   {state.sites.map((val, idx) => {
                    return (
                      <><div className="flex justify-between">
                        <div className="flex items-center gap-3" key={idx}>
                        
                          <Globe color="#1976e0ff" /> {val}
                        </div>

                        <div key={val} className="flex gap-1 text-sm flex-col items-center" >
                          <p className="font-bold">{Object.values(state.avgRatingPerSite)[idx]}</p>
                          <p className="text-xs text-gray-600">{Object.values(state.feedbackPerSite)[idx]} feedback</p>
                          <RatingStar value={Object.values(state.avgRatingPerSite)[idx]} />
                      </div>
                        </div>
                      </>
                    );
                  })}
                  
                </div>
              </div>
            </div>
            <div className="my-10 mb-30 py-5 px-3" style={{border:'2px solid #e3f0fdff'} }>
                  <div className="flex flex-col gap-2"  >
                    <h1 className="text-3xl font-bold">Quick Actions</h1>
                    <p className="text-gray-700">Common tasks to manage your feedback widgets</p>
                  </div>
              <div className="navigarots mt-10 w-full gap-3 overallStats grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1">
            <div  className="h-[110px] text-sm hover:scale-[1.01] hover:text-blue-500 hover:bg-[#e3f0fdff] duration-100 transition-all ease-in bg-white  shadow-lg flex flex-col rounded-lg items-center justify-center gap-2"  style={{border:'2px solid #e3f0fdff'} }>
              
                <Plus/>
                <p className="font-regular">Add Widget</p>
              
              
            </div>
            <div className="h-[110px] text-sm hover:scale-[1.01] hover:text-blue-500 hover:bg-[#e3f0fdff] duration-100 transition-all ease-in bg-white shadow-lg flex  flex-col rounded-lg items-center justify-center gap-2 p-3"  style={{border:'2px solid #e3f0fdff'} }>
              
                <MessageSquare />
                <p >View Feedback</p>
              
              
            </div>
            <div className="h-[110px] text-sm hover:scale-[1.01] hover:text-blue-500 hover:bg-[#e3f0fdff] duration-100 transition-all ease-in bg-white shadow-lg flex flex-col rounded-lg items-center justify-center gap-2 p-3"  style={{border:'2px solid #e3f0fdff'} }>
              
               <BarChartBigIcon/>
                <p className=" font-regular">Analytics</p>
              
              
            </div>
            <div  className="h-[110px] text-sm hover:scale-[1.01] hover:text-blue-500 hover:bg-[#e3f0fdff] duration-100 transition-all ease-in bg-white shadow-lg flex flex-col rounded-lg items-center justify-center gap-2 p-3"  style={{border:'2px solid #e3f0fdff'} }>
              
                <ExternalLink/>
                <p className=" font-regular">Widget Demo</p>
              
              
            </div>
            
          </div>
            </div>
            <div className="h-[10px]">

            </div>
        </>
      )}
    </div>
  );
};
