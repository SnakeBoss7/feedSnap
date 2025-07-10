import Checkbox from "./hamburger";
import logo from '../../img/image.png';

import { useSidebarContext } from "../../context/sidebarContext";
export const SimpleHeader = () => {
  const {showSidebar} = useSidebarContext()
  return (
    <div className="min-h-[70px] bg-white w-full flex items-center justify-between px-4 shadow-md">
  <Checkbox show={!showSidebar} />
  <div onClick={()=>{console.log(showSidebar);}} className="w-10 h-10 rounded-full overflow-hidden">
    <img src={logo} className="w-full h-full object-cover" alt="Logo" />
  </div>
</div>

  );
};
