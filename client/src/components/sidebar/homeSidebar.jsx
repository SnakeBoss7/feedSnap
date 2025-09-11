
import { useSidebarContext } from "../../context/sidebarContext";
export const SimpleSidebar = ({color}) => {
  const {showSidebar,setShowSidebar} = useSidebarContext()
  return (
    // <div className={`w-[300px] h-full glass-card-bg absolute z-[9999999999999999] bg-white transition-all duration-300  ease-in-out ${showSidebar ? "translate-x-0" : "translate-x-[-100%]"} `}>
    <div>
        Hello
    </div>
  );
};
