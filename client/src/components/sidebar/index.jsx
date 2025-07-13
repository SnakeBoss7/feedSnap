import { NavLink } from "react-router-dom";
import { useSidebarContext } from "../../context/sidebarContext";
import Checkbox from "../header/hamburger";
import {
  ChartArea,
  ChartBar,
  Code,
  DatabaseIcon,
  MessageCircle,
  MessageSquare,
  MessageSquareCode,
} from "lucide-react";
import { useLayoutEffect, useRef } from "react";
export const Sidebar = () => {
  const { showSidebar, setShowSidebar } = useSidebarContext();
  const ref = useRef();
  const onclickLink = () => {
    setShowSidebar((prev) => !prev);
  };
  useLayoutEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        window.innerWidth < 1024 &&
        ref.current &&
        !ref.current.contains(event.target)
      ) {
        setShowSidebar(false);
      }
      else
      {
        setShowSidebar(true);

      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);
  return (
    <div
      ref={ref}
      className={`z-59 flex flex-col lg:relative absolute ${
        showSidebar ? "translate-x-0" : "translate-x-[-400px]"
      } transition:all ease-in-out duration-500 lg:block bg-white lg:w-[20%] w-[40%]  shadow-right h-full`}
    >
      <div className="flex justify-between p-3 items-start">
        <div class="logo flex items-start ">
          <div className="text-gray-900 text-2xl flex items-start">Feed</div>
          <div className="font-mono text-primary bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent text-3xl text-bottom">
            SNAP
          </div>
        </div>
        {/* <Checkbox show={showSidebar} /> */}
      </div>
      <div className="links flex flex-col gap-3 p-8">
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            isActive
              ? "flex items-center gap-3 text-white h-12 font-bold  text-lg rounded-lg bg-blue-500  pl-2"
              : "flex items-center gap-3 text-gray-700 h-12 hover:text-blue-500 pl-2"
          }
        >
          <DatabaseIcon className="w-5" /> Dashboard
        </NavLink>
        <NavLink
          to="/dashboard/feedback"
          className={({ isActive }) =>
            isActive
              ? "flex items-center gap-3 text-white h-12 font-bold  text-lg rounded-lg bg-blue-500  pl-2"
              : "flex items-center gap-3 text-gray-700v h-12 hover:text-blue-500 pl-2"
          }
        >
          <MessageSquare className="w-5" /> Feedback
        </NavLink>
        <NavLink
          to="/dashboard/analytics"
          className={({ isActive }) =>
            isActive
              ? "flex items-center gap-3 text-white h-12 font-bold  text-lg rounded-lg bg-blue-500  pl-2"
              : "flex items-center gap-3 text-gray-700 h-12 hover:text-blue-500 pl-2"
          }
        >
          <ChartArea className="w-5" /> Analytics
        </NavLink>

        <NavLink
          to="/dashboard/scriptGen"
          className={({ isActive }) =>
            isActive
              ? "flex items-center gap-3 text-white h-12 font-bold  text-lg rounded-lg bg-blue-500  pl-2"
              : "flex items-center gap-3 text-gray-700 h-12 hover:text-blue-500 pl-2"
          }
        >
          <Code className="w-5" /> Script Generator
        </NavLink>
      </div>
    </div>
  );
};
