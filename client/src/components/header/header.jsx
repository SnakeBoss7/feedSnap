import Checkbox from "./hamburger";
import logo from '../../img/image.png';

import { useSidebarContext } from "../../context/sidebarContext";
export const SimpleHeader = () => {
  const {showSidebar} = useSidebarContext()
  return (
    <div className="min-h-[70px] lg:justify-start bg-white w-full flex items-center justify-end px-4 shadow-md">
      <img
        src={logo}
        className="w-10 h-10 rounded-full object-cover"
        alt="Logo"
      />

      {!showSidebar && <div className="w-full flex justify-end h-full items-center">
        <Checkbox show={!showSidebar} />
      </div>}
    </div>
  );
};
