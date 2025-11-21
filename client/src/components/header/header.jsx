// components/Header/SimpleHeader.jsx
import { useState } from "react";
import Checkbox from "./hamburger";
import logo from '../../img/image.png';
import { useSidebarContext } from "../../context/sidebarContext";
import { useUserContext } from "../../context/userDataContext";

export const SimpleHeader = ({ color }) => {
  const { showSidebar } = useSidebarContext();
  const { userData } = useUserContext();
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
    <div className="min-h-[70px] lg:hidden shadow-sm bg-white dark:bg-dark-bg-primary border-b border-gray-200 dark:border-dark-border-subtle w-full flex items-center justify-between px-4 transition-colors duration-300">
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
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-100 dark:border-dark-border-emphasis"
                alt={`${displayName}'s profile`}
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
              {userData && !imgError && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-dark-bg-primary rounded-full"></div>
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
              <span className="text-sm font-bold text-gray-900 dark:text-dark-text-primary">
                {displayName}
              </span>
              {userData?.role && (
                <span className="text-xs text-gray-500 dark:text-dark-text-muted capitalize">
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