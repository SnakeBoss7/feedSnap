// pages/Dashboard/Dashboard.jsx
import { Outlet } from "react-router-dom";
import { Sidebar } from "../../components/sidebar";
import { useSidebarContext } from "../../context/sidebarContext";
// import { useUserContext } from "../../context/userDataContext";
import { useEffect } from "react";

export const Dashboard = () => {
  const { setShowSidebar, setSidebarSize } = useSidebarContext();
  // const { userData, isLoading, error } = useUserContext();

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

  return (
    <div className="flex relative overflow-hidden h-full">
      <Sidebar />
      <div className="flex flex-col min-h-screen lg:flex-1 w-full bg-white relative">

        <Outlet />
      </div>
    </div>
  );
};