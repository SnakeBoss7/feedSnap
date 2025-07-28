import { Outlet } from "react-router-dom";
import { Sidebar } from "../../components/sidebar";
import { useSidebarContext } from "../../context/sidebarContext";
import { useEffect } from "react";
import { SimpleHeader } from "../../components/header/header";
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
    <div className="flex z- relative overflow-hidden h-full">
      <Sidebar />
      <div className="flex gap-1 overflow-y-scroll scrollbar-hide flex-col min-h-screen lg:[70%] w-full bg-white relative z-10">
    <SimpleHeader />
      <Outlet />
      </div>
    </div>
  );
};
