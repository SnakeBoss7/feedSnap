// pages/Dashboard/Dashboard.jsx
import { Outlet } from "react-router-dom";
import { Sidebar } from "../../components/sidebar";
import { useSidebarContext } from "../../context/sidebarContext";
import { useUserContext } from "../../context/userDataContext";
import { useEffect } from "react";

export const Dashboard = () => {
  const { setShowSidebar, setSidebarSize } = useSidebarContext();
  const { userData, isLoading, error } = useUserContext();

  // Handle sidebar responsiveness
  useEffect(() => {
    const handleSidebar = () => {
      const isMobile = window.innerWidth < 1024;
      
      if (isMobile) {
        setShowSidebar(false);
        setSidebarSize(false);
      } else {
        setShowSidebar(true);
        setSidebarSize(true);
      }
    };

    // Set initial sidebar state
    handleSidebar();

    // Listen for window resize events
    window.addEventListener("resize", handleSidebar);
    
    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleSidebar);
    };
  }, [setShowSidebar, setSidebarSize]);

  // Optional: Handle user data loading state or errors at app level
  useEffect(() => {
    if (error) {
      console.error('User data error in Dashboard:', error);
      // You could show a toast notification here or handle the error
    }
  }, [error]);

  // Optional: Log user data when it loads (for debugging)
  useEffect(() => {
    if (userData) {
      console.log('User data loaded in Dashboard:', userData);
    }
  }, [userData]);

  return (
    <div className="flex relative overflow-hidden h-full">
      <Sidebar />
      <div className="flex flex-col min-h-screen lg:flex-1 w-full bg-white relative z-10">
        {/* Optional: Show loading indicator while user data is being fetched */}
        {isLoading && (
          <div className="fixed top-0 left-0 right-0 h-1 bg-blue-500 animate-pulse z-50" />
        )}
        
        {/* Optional: Show error message if user data fails to load */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-4 mt-4">
            <span className="block sm:inline">
              Failed to load user data. Some features may not work properly.
            </span>
          </div>
        )}
        
        <Outlet />
      </div>
    </div>
  );
};