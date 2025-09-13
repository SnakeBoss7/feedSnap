// components/Header/SimpleHeader.jsx
import { useState } from "react";
import Checkbox from "./hamburger";
import logo from '../../img/image.png';
import { useSidebarContext } from "../../context/sidebarContext";
import { useUserContext } from "../../context/userDataContext";

export const SimpleHeader = ({ color }) => {
  const { showSidebar } = useSidebarContext();
  const { userData, isLoading, error } = useUserContext();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Handle profile image loading error
  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  // Handle successful image load
  const handleImageLoad = () => {
    setImageError(false);
    setImageLoading(false);
  };

  // Handle image load start
  const handleImageLoadStart = () => {
    setImageLoading(true);
  };

  // Determine which image to display
  const getProfileImage = () => {
    // Show default logo if:
    // 1. User data is still loading
    // 2. No user data available
    // 3. No profile image in user data
    // 4. Profile image failed to load
    if (isLoading || !userData || !userData.profile || imageError) {
      return logo;
    }
    return userData.profile;
  };

  // Get display name for alt text and username display
  const getDisplayName = () => {
    if (!userData) return "User";
    return userData.name || userData.username || "User";
  };

  // Check if we should show user info
  const shouldShowUserInfo = userData && !isLoading && !error;

  return (
    <div className="min-h-[70px] lg:hidden shadow-lg lg:justify-start bg-backgr w-full flex items-center justify-between px-4">
      {/* Left side - Profile Section */}
      <div className="flex items-center gap-3">
        {/* Profile Image Container */}
        <div className="relative">
          {/* Loading skeleton for user data */}
          {isLoading && (
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
            </div>
          )}
          
          {/* Profile Image */}
          {!isLoading && (
            <div className="relative">
              <img
                src={getProfileImage()}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 transition-opacity duration-200"
                alt={`${getDisplayName()}'s profile`}
                onError={handleImageError}
                onLoad={handleImageLoad}
                onLoadStart={handleImageLoadStart}
              />
              
              {/* Image loading overlay */}
              {imageLoading && (
                <div className="absolute inset-0 w-10 h-10 rounded-full bg-gray-200 animate-pulse flex items-center justify-center">
                  <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                </div>
              )}
            </div>
          )}
          
          {/* Online indicator (optional) */}
          {shouldShowUserInfo && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>

        {/* Username Display */}
        <div className="flex flex-col">
          {isLoading ? (
            <div className="sm:block">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
          ) : shouldShowUserInfo ? (
            <>
              <span className="text-sm font-medium text-white">
                {getDisplayName()}
              </span>
              {/* Optional: Show user role or status */}
              {userData.role && (
                <span className="text-xs text-gray-300  capitalize">
                  {userData.role}
                </span>
              )}
            </>
          ) : error ? (
            <span className="text-sm text-red-500 hidden sm:block">
              Error loading profile
            </span>
          ) : null}
        </div>
      </div>

      {/* Right side - Hamburger Menu */}
      <div className="flex items-center">
        <Checkbox show={!showSidebar} color={color} />
      </div>
    </div>
  );
};