import { useEffect, useReducer, useState } from "react";
import axios from "axios";
import { SimpleHeader } from "../../../components/header/header";
import { FilterTable } from "../../../components/PageComponents/feedback/table/filterTable";
import { FeedbackAssistant } from "../../../components/PageComponents/feedback/FeedbackAssistant";

const apiUrl = process.env.REACT_APP_API_URL;

// Cache helper function
const getCachedData = () => {
  const type = localStorage.getItem('type');
  const cachedData = localStorage.getItem('feedbackData');

  if (type === 'FETCH_SUCCESS' && cachedData) {
    try {
      const parsed = JSON.parse(cachedData);
      const isRecent = Date.now() - parsed.timestamp < 5 * 60 * 1000; // 5 minutes

      if (isRecent && parsed.data) {
        return {
          data: parsed.data.data || [],
          sites: parsed.data.sites || [],
          userTeams: parsed.data.userTeams || [],
          success: parsed.data.success || false,
          isLoading: false
        };
      }
    } catch (e) {
      console.log('Cache parse error:', e);
    }
  }
  return {
    data: [],
    sites: [],
    userTeams: [],
    success: false,
    isLoading: true,
  };
};

const dashboardReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_SUCCESS':
      return {
        ...state,
        data: action.payload.data || [],
        sites: action.payload.sites || [],
        userTeams: action.payload.userTeams || [],
        success: action.payload.success || false,
        isLoading: false
      };
    case 'FETCH_FAIL':
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
};

const wait = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const Feedback = () => {
  const [state, dispatch] = useReducer(dashboardReducer, getCachedData());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile toggle
  const [isChatExpanded, setIsChatExpanded] = useState(() => window.innerWidth >= 1024); // Desktop toggle
  const [selectedData, setSelectedData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(`${apiUrl}/api/feedback/getFeedbacks`, {
          withCredentials: true
        });
        await wait(1000);
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: res.data,
        });

        const cacheData = {
          data: res.data,
          timestamp: Date.now()
        };

        localStorage.setItem("feedbackData", JSON.stringify(cacheData));
        localStorage.setItem("type", 'FETCH_SUCCESS');
      }
      catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: err.response?.data,
        });
        localStorage.setItem("type", 'FETCH_FAIL');
      }
    }

    if (state.isLoading) {
      fetchData();
    }
  }, [state.isLoading]);

  if (state.isLoading) {
    return (
      <div className="h-screen w-full bg-gray-50 dark:bg-dark-bg-primary flex flex-col overflow-hidden">
        <SimpleHeader color="#2b5fceff" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary5 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-medium">Loading feedback data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gray-50 dark:bg-dark-bg-primary flex flex-col overflow-hidden font-sans transition-colors duration-300">
      <SimpleHeader color="#2b5fceff" />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Content Area (Table) */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 lg:p-6">
          <FilterTable setSelectedData={setSelectedData} data={state?.data} />
        </div>

        <FeedbackAssistant
          userTeams={state.userTeams}
          selectedData={selectedData}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isChatExpanded={isChatExpanded}
          setIsChatExpanded={setIsChatExpanded}
        />
      </div>
    </div>
  );
};