import { NavLink } from "react-router-dom";
import { useSidebarContext } from "../../context/sidebarContext";
import logo from '../../img/image.png';

import Checkbox from "../header/hamburger";
import {
  ChartArea,
  ChartBar,
  ChartColumnStacked,
  Code,
  DatabaseIcon,
  LayoutDashboard,
  LayoutDashboardIcon,
  LucideAlignLeft,
  LucideArrowBigDownDash,
  LucideArrowBigLeft,
  LucideArrowLeft,
  LucideArrowLeftFromLine,
  LucideArrowLeftSquare,
  LucideArrowLeftToLine,
  LucideChevronLeft,
  LucideChevronsRightLeft,
  LucideCircleArrowLeft,
  LucideFlagTriangleLeft,
  LucideMoveLeft,
  LucidePanelLeftClose,
  MessageCircle,
  MessageSquare,
  MessageSquareCode,
} from "lucide-react";
import { useLayoutEffect, useRef } from "react";
export const Sidebar = () => {
  const { showSidebar, setShowSidebar } = useSidebarContext();
  const { sidebarSize, setSidebarSize } = useSidebarContext();
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
    <>
        {/* ADD THIS FIRST - Mobile Backdrop */}
      {showSidebar && window.innerWidth < 1024 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
    <div
      ref={ref}
        style={{ background: "linear-gradient(to bottom, #2F34EC, #763AED)" }}
      className={`z-50 flex flex-col lg:relative absolutez
        ${
        sidebarSize ? "lg:w-[80px] w-[70%]" : "lg:w-[20%] w-[70%]"
        } transition:all ease-in-out duration-500  
        ${
        showSidebar ? "translate-x-0" : "translate-x-[-1000px]"
        } transition:all ease-in-out duration-500   shadow-right h-full`}
        >
      <div className={`flex  p-3 ${sidebarSize ? "justify-center" : "justify-between"}`}>
        <div className={`logo overflow-hidden flex items-start transition:all ease-in-out duration-500   ${sidebarSize ? "w-[0%]" : "w-fit"}`}>
          <div className={`text-white text-3xl flex items-start ${sidebarSize ? "hidden" : "block"}`}>Feed</div>
          <div className={`font-mono flex justify-center items-center text-primary bg-gradient-to-r from-blue-7z00 to-purple-800 bg-clip-text text-transparent text-4xl text-bottom ${sidebarSize ? "hidden" : "block"}`}>
            SNAP
          </div>
   
        </div>

          <LucidePanelLeftClose onClick={()=>setSidebarSize(prev =>!prev)}  size={35} className="hidden lg:block opacity-60 hover:opacity-100 rounded-lg  p-1 text-white"/>

        {/* <Checkbox show={showSidebar} /> */}
      </div>
<hr className="my-2 border-0 h-[2px] bg-white opacity-30" />

      <div className="links flex flex-col gap-3 px-3 py-4 items-center ">
<NavLink
  to="/dashboard"
  end
  className={({ isActive }) =>
    `${isActive
        ? "flex items-center gap-3 w-full text-purple-500  h-12 font-extrabold text-[15px] rounded-lg bg-white text-blue-800"
      : "flex items-center gap-3 w-full text-blue-200 opacity-50 hover:opacity-100 font-extrabold h-12 hover:text-white"
    } ${sidebarSize ? "justify-center " : "justify-start "} p-2 transition-all ease-in-out duration-300`
  }
>
  <LayoutDashboard className="w-5" />
  {!sidebarSize && <p>Dashboard</p>}
</NavLink>
<NavLink
  to="feedbacks"
  end
  className={({ isActive }) =>
    `${isActive
      ? "flex items-center gap-3 w-full  h-12 font-extrabold text-[15px] rounded-lg bg-white text-blue-800"
      : "flex items-center gap-3 w-full text-blue-200 opacity-50 hover:opacity-100 font-extrabold h-12 hover:text-white"
    } ${sidebarSize ? "justify-center " : "justify-start "} p-2 transition-all ease-in-out duration-300`
  }
>
  <MessageSquare className="w-5" />
  {!sidebarSize && <p>Feedbacks</p>}
</NavLink>
<NavLink
  to="analytics"
  end
  className={({ isActive }) =>
    `${isActive
      ? "flex items-center gap-3 w-full  h-12 font-extrabold text-[15px] rounded-lg bg-white text-blue-800"
      : "flex items-center gap-3 w-full text-blue-200 opacity-50 hover:opacity-100 font-extrabold h-12 hover:text-white"
    } ${sidebarSize ? "justify-center " : "justify-start "} p-2 transition-all ease-in-out duration-300`
  }
>
  <ChartColumnStacked className="w-5" />
  {!sidebarSize && <p>Analytics</p>}
</NavLink>
<NavLink
  to="scriptGen"
  end
  className={({ isActive }) =>
    `${isActive
      ? "flex items-center gap-3 w-full  h-12 font-extrabold text-[15px] rounded-lg bg-white text-blue-800"
      : "flex items-center gap-3 w-full text-blue-200 opacity-50 hover:opacity-100 font-extrabold h-12 hover:text-white"
    } ${sidebarSize ? "justify-center " : "justify-start "} p-2 transition-all ease-in-out duration-300`
  }
>
  <Code className="w-5" />
  {!sidebarSize && <p>Script Generator</p>}
</NavLink>

      </div>

      <div className="flex flex-col self-center h-full items-center justify-end w-full pb-3">
        <hr className="my-2 border-0 h-[1px] bg-white opacity-30 w-full" />
        <div className="flex gap-3 self-center  items-center  justify-center  rounded-lg ">
          <img src={logo} 
         className="w-10 h-10 rounded-full object-cover"
        alt="Logo"/>
        <p className={`h-10 text-white flex items-center justify-center text-lg font-semibold ${sidebarSize ? "hidden" : "block"}`}>Insaen</p>
        </div>
      </div>
    </div>
        </>
  );
};
