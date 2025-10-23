// components/Sidebar/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { useSidebarContext } from "../../context/sidebarContext";
import logo from '../../img/image.png';
import {
  ChartColumnStacked,
  Code,LucideUsers2,
  LayoutDashboard,
  LucidePanelLeftClose,
  MessageSquare,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useUserContext } from "../../context/userDataContext";

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard',color:'primary1', end: true },
  { to: 'feedbacks', icon: MessageSquare, label: 'Feedbacks',color:'primary2', end: true },
  { to: 'analytics', icon: ChartColumnStacked, label: 'Analytics',color:'primary3', end: true },
  { to: 'teams', icon: LucideUsers2, label: 'Teams',color:'primary2', end: true },
  { to: 'scriptGen', icon: Code, label: 'Script Generator',color:'primary5', end: true },
];

export const Sidebar = () => {
  const { showSidebar, setShowSidebar, sidebarSize, setSidebarSize } = useSidebarContext();
  const { userData, isLoading } = useUserContext();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [imgError, setImgError] = useState(false);
  const sidebarRef = useRef();

  // Handle responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close on outside click (mobile)
  useEffect(() => {
    if (!isMobile || !showSidebar) return;

    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setShowSidebar(false);
      }
    };

    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, showSidebar, setShowSidebar]);

  // Prevent body scroll on mobile
  useEffect(() => {
    if (isMobile && showSidebar) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isMobile, showSidebar]);

  const handleNavClick = () => {
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleToggleSize = () => {
    if (!isMobile) {
      setSidebarSize(!sidebarSize);
    }
  };

  const handleClose = () => {
    setShowSidebar(false);
  };

  const displayName = userData?.name || userData?.username || "User";
  const profileImage = (!imgError && userData?.profile) ? userData.profile : logo;

  const handleImageError = () => {
    setImgError(true);
  };

  const handleImageLoad = () => {
    setImgError(false);
  };

  const sidebarClasses = `
    font-sans z-50 flex flex-col bg-backgr h-full transition-all duration-300 ease-in-out
    ${isMobile ? 'fixed w-[280px] shadow-2xl' : 'relative'}
    ${isMobile ? (showSidebar ? 'translate-x-0' : '-translate-x-full') : ''}
    ${!isMobile ? (sidebarSize ? 'w-20' : 'w-64') : ''}
  `;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleClose}
        />
      )}
      
      <aside ref={sidebarRef} className={sidebarClasses}>
        {/* Logo Section */}
        <div className={`flex p-3 ${sidebarSize ? "justify-center" : "justify-between"}`}>
          <div className={`flex items-center gap-1 overflow-hidden transition-all duration-300 ${sidebarSize ? "w-0" : "w-fit"}`}>
            <div className={`text-white text-3xl ${sidebarSize ? "hidden" : "block"}`}>
              Feed
            </div>
            <div className={`text-4xl bg-gradient-to-r from-blue-700 to-purple-800 bg-clip-text text-transparent ${sidebarSize ? "hidden" : "block"}`}>
              SNAP
            </div>
          </div>

          <div className="flex items-center">
            {!isMobile && (
              <button
                onClick={handleToggleSize}
                className={`opacity-60 hover:opacity-100 rounded-lg p-1 text-white transition-all duration-200 ${sidebarSize ? "rotate-180" : ""}`}
              >
                <LucidePanelLeftClose size={35} />
              </button>
            )}
            
            {isMobile && (
              <button
                onClick={handleClose}
                className="opacity-60 hover:opacity-100 rounded-lg p-1 text-white"
              >
                <LucidePanelLeftClose size={35} />
              </button>
            )}
          </div>
        </div>
        
        <hr className="border-0 h-[2px] bg-white opacity-30" />

        {/* Navigation */}
        <nav className="flex flex-col gap-3 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Helper to ensure Tailwind sees all possible text-primaryX classes
            const textColorClass = `text-${item.color}`;
            // List all possible classes here so Tailwind JIT picks them up
            // text-primary1 text-primary2 text-primary3 text-primary5
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={handleNavClick}
                className={({ isActive }) => `
  flex items-center gap-3 w-full h-12 font-extrabold text-[15px] p-2 rounded-lg 
  transition-all duration-300 tracking-tight
  ${isActive 
    ? `bg-white ${textColorClass}`
    : "text-blue-200 opacity-50 hover:opacity-100 hover:text-white"
  }
  ${sidebarSize ? "justify-center" : "justify-start"}
`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarSize && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer/Profile */}
        <div className="flex flex-col justify-end h-full pb-3">
          <hr className="my-2 border-0 h-[1px] bg-white opacity-30 w-full" />
          
          <div className="flex gap-3 items-center justify-center px-3">
            {isLoading ? (
              <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse"></div>
            ) : (
              <img
                key={userData?.profile || 'default'} // Force re-render on profile change
                src={profileImage}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                alt={`${displayName}'s profile`}
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            )}
            
            {!sidebarSize && (
              <div className="flex flex-col">
                {isLoading ? (
                  <div className="h-6 w-24 bg-gray-300 animate-pulse rounded"></div>
                ) : (
                  <>
                    <p className="text-white text-lg font-semibold truncate max-w-[120px]">
                      {displayName}
                    </p>
                    {userData?.role && (
                      <p className="text-gray-300 text-xs capitalize">
                        {userData.role}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;