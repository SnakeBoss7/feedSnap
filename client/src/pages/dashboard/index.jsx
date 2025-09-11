import { Outlet } from "react-router-dom";
import { Sidebar } from "../../components/sidebar";
import { useSidebarContext } from "../../context/sidebarContext";
import { useEffect } from "react";
export const Dashboard = () => {
  const { setShowSidebar, setSidebarSize } = useSidebarContext();
  
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
    
    // Call once on mount
    handleSidebar();
    
    window.addEventListener("resize", handleSidebar);
    return () => {
      window.removeEventListener("resize", handleSidebar);
    };
  }, [setShowSidebar, setSidebarSize]); // Add dependencies!
  
  return (
    <div className="flex relative overflow-hidden h-full">
      <Sidebar />
      <div className="flex flex-col min-h-screen lg:flex-1 w-full bg-white relative z-10">
        <Outlet />
      </div>
    </div>
  );
};
