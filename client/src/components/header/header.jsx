// components/Header/SimpleHeader.jsx
import { useState } from "react";
import Checkbox from "./hamburger";
import logo from '../../img/image.png';
import { useSidebarContext } from "../../context/sidebarContext";
import { useUserContext } from "../../context/userDataContext";

export const SimpleHeader = ({ color }) => {
  const { showSidebar } = useSidebarContext();
  const { userData, isLoading } = useUserContext();
  const [imgError, setImgError] = useState(false);

  const displayName = userData?.name || userData?.username || "User";
  const profileImage = (!imgError && userData?.profile) ? userData.profile : logo;

  const handleImageError = () => {
    setImgError(true);
  };

  const handleImageLoad = () => {
    setImgError(false);
  };

  return (
    <div className="min-h-[70px] lg:hidden shadow-lg bg-backgr w-full flex items-center justify-between px-4">
      {/* Profile Section */}
      <div className="flex items-center gap-3">
        {/* Profile Image */}
        <div className="relative">
          {/* {isLoading ? (
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
          ) : (
            <> */}
              <img
                key={userData?.profile || 'default'} // Force re-render on profile change
                src={profileImage}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                alt={`${displayName}'s profile`}
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
              {userData && !imgError && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            {/* </>
          )} */}
        </div>

        {/* User Info */}
        <div className="flex flex-col">
          {/* {isLoading ? (
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          ) : (
            <> */}
              <span className="text-sm font-medium text-white">
                {displayName}
              </span>
              {userData?.role && (
                <span className="text-xs text-gray-300 capitalize">
                  {userData.role}
                </span>
              )}
            {/* </>
          )} */}
        </div>
      </div>

      {/* Hamburger Menu */}
      <div className="flex items-center">
        <Checkbox show={!showSidebar} color={color} />
      </div>
    </div>
  );
};