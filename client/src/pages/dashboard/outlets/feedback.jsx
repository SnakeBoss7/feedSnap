import { useEffect, useReducer, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { MessageSquareText, Plus } from "lucide-react";
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
          userRole: parsed.data.userRole || 'viewer',
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
    userRole: 'viewer',
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
        userRole: action.payload.userRole || 'viewer',
        success: action.payload.success || false,
        isLoading: false
      };
    case 'FETCH_FAIL':
      return {
        ...state,
        isLoading: false,
      };
    case 'DELETE_ITEMS':
      return {
        ...state,
        data: state.data.filter(item => !action.payload.ids.includes(item._id)),
      };
    case 'UPDATE_STATUS':
      return {
        ...state,
        data: state.data.map(item =>
          action.payload.ids.includes(item._id)
            ? { ...item, status: action.payload.status, updatedOn: new Date().toISOString() }
            : item
        ),
      };
    case 'FORCE_RELOAD':
      return {
        ...state,
        isLoading: true,
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

  // Invalidate localStorage cache after delete
  const invalidateCache = useCallback(() => {
    localStorage.removeItem('feedbackData');
    localStorage.setItem('type', 'FETCH_FAIL');
  }, []);

  // Single delete handler
  const handleDeleteFeedback = useCallback(async (id) => {
    try {
      const res = await axios.delete(`${apiUrl}/api/feedback/delete/${id}`, {
        withCredentials: true
      });
      if (res.data.success) {
        dispatch({ type: 'DELETE_ITEMS', payload: { ids: [id] } });
        invalidateCache();
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Delete failed' };
    } catch (err) {
      console.error('[handleDeleteFeedback] Error:', err.response?.status, err.response?.data);
      const msg = err.response?.data?.message || 'Failed to delete feedback';
      return { success: false, message: msg };
    }
  }, [invalidateCache]);

  // Bulk delete handler
  const handleBulkDeleteFeedback = useCallback(async (ids) => {
    try {
      console.log('[handleBulkDeleteFeedback] Sending IDs:', ids);
      const res = await axios.post(`${apiUrl}/api/feedback/bulk-delete`, { ids }, {
        withCredentials: true
      });
      if (res.data.success) {
        dispatch({ type: 'DELETE_ITEMS', payload: { ids } });
        invalidateCache();
        return { success: true, message: res.data.message, deletedCount: res.data.deletedCount };
      }
      return { success: false, message: res.data.message || 'Bulk delete failed' };
    } catch (err) {
      console.error('[handleBulkDeleteFeedback] Error:', err.response?.status, err.response?.data);
      const msg = err.response?.data?.message || 'Failed to delete feedback';
      return { success: false, message: msg };
    }
  }, [invalidateCache]);

  // Single resolve handler
  const handleResolveFeedback = useCallback(async (id, status) => {
    try {
      const res = await axios.patch(`${apiUrl}/api/feedback/resolve/${id}`, { status }, {
        withCredentials: true
      });
      if (res.data.success) {
        dispatch({ type: 'UPDATE_STATUS', payload: { ids: [id], status } });
        invalidateCache();
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Update failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update feedback';
      return { success: false, message: msg };
    }
  }, [invalidateCache]);

  // Bulk resolve handler
  const handleBulkResolveFeedback = useCallback(async (ids, status) => {
    try {
      const res = await axios.post(`${apiUrl}/api/feedback/bulk-resolve`, { ids, status }, {
        withCredentials: true
      });
      if (res.data.success) {
        dispatch({ type: 'UPDATE_STATUS', payload: { ids, status } });
        invalidateCache();
        return { success: true, message: res.data.message, modifiedCount: res.data.modifiedCount };
      }
      return { success: false, message: res.data.message || 'Bulk update failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update feedback';
      return { success: false, message: msg };
    }
  }, [invalidateCache]);

  // Empty state — no feedback entries
  if (!state.isLoading && state.data.length === 0) {
    return (
      <div className="h-screen w-full bg-gray-50 dark:bg-dark-bg-primary flex flex-col overflow-hidden">
        <SimpleHeader color="#2b5fceff" />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-lg w-full">
            {/* Gradient Icon Circle */}
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center shadow-lg shadow-blue-200/50 dark:shadow-blue-900/20">
              <MessageSquareText className="w-12 h-12 text-blue-500 dark:text-blue-400" />
            </div>

            {/* Heading */}
            <h2 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-3">
              No Feedback Yet
            </h2>

            {/* Subtitle */}
            <p className="text-gray-500 dark:text-dark-text-muted text-lg mb-8 max-w-sm mx-auto">
              When you start receiving feedback from your widgets, it will appear here for you to manage.
            </p>

            {/* CTA Button */}
            <Link
              to="/dashboard/scriptGen"
              className="inline-flex items-center gap-2 px-8 py-3 text-white font-semibold rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
            >
              <Plus size={20} />
              Create a Widget
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (state.isLoading) {
    return (
      <div className="h-screen w-full bg-gray-50 dark:bg-dark-bg-primary flex flex-col overflow-hidden">
        <SimpleHeader color="#2b5fceff" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black dark:border-white mx-auto"></div>
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
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 lg:p-6 pb-24">
          <FilterTable
            setSelectedData={setSelectedData}
            data={state?.data}
            userRole={state.userRole}
            onDeleteFeedback={handleDeleteFeedback}
            onBulkDeleteFeedback={handleBulkDeleteFeedback}
            onResolveFeedback={handleResolveFeedback}
            onBulkResolveFeedback={handleBulkResolveFeedback}
          />
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
