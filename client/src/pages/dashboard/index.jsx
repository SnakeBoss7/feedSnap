import { Outlet } from "react-router-dom";
import { Sidebar } from "../../components/sidebar";
import { useSidebarContext } from "../../context/sidebarContext";
import { useEffect } from "react";
export const Dashboard = () => {
  const {  setShowSidebar } = useSidebarContext();
  useEffect(() => {
    const handleSidebar = () => {
      if (window.innerWidth < 1024) {
        setShowSidebar(false);
      } else {
        setShowSidebar(true);
      }
    };
    window.addEventListener("resize", handleSidebar);
    return () => {
      window.removeEventListener("resize", handleSidebar);
    };
  },[]);
  return (
    <div className="flex overflow-hidden h-full">
      <Sidebar />
      <Outlet />
    </div>
  );
};
