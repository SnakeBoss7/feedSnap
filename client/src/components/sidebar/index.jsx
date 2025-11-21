// components/Sidebar/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { useSidebarContext } from "../../context/sidebarContext";
import logo from '../../img/image.png';
import {
  ChartColumnStacked,
  Code, LucideUsers2,
  LayoutDashboard,
  LucidePanelLeftClose,
  MessageSquare,
  LogOut,
  Settings,
  HelpCircle,
  Sun,
  Moon
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useUserContext } from "../../context/userDataContext";
import { useThemeContext } from "../../context/themeContext";

const navItems = [
  { 
    to: '/dashboard', 
    icon: LayoutDashboard, 
    label: 'Dashboard', 
    activeColor: 'text-white ', 
    activeBg: 'bg-primary1 border-0',
    hoverColor: 'group-hover:text-primary1 ',
    gradient: 'from-pink-500 to-rose-500',
    end: true 
  },
  { 
    to: 'scriptGen', 
    icon: Code, 
    label: 'Script Generator', 
    activeColor: 'text-white dark:text-white', 
    activeBg: 'bg-primary5 border-0',
    hoverColor: 'group-hover:text-primary5 ',
    gradient: 'from-blue-500 to-cyan-500',
    end: true 
  },
  { 
    to: 'teams', 
    icon: LucideUsers2, 
    label: 'Teams', 
    activeColor: 'text-white dark:text-white', 
    activeBg: 'bg-primary2 border-0',
    hoverColor: 'group-hover:text-primary2 ',
    gradient: 'from-green-500 to-emerald-500',
    end: true 
  },
  { 
    to: 'analytics', 
    icon: ChartColumnStacked, 
    label: 'Analytics', 
    activeColor: 'text-white ', 
    activeBg: 'bg-primary3 border-0',
    hoverColor: 'group-hover:text-primary3 ',
    gradient: 'from-orange-500 to-amber-500',
    end: true 
  },
  { 
    to: 'feedbacks', 
    icon: MessageSquare, 
    label: 'Feedbacks', 
    activeColor: 'text-white ', 
    activeBg: 'bg-primary2 border-0',
    hoverColor: 'group-hover:text-primary2 ',
    gradient: 'from-purple-500 to-indigo-500',
    end: true 
  },
];

export const Sidebar = () => {
  const { showSidebar, setShowSidebar, sidebarSize, setSidebarSize } = useSidebarContext();
  const { userData, isLoading } = useUserContext();
  const { darkMode, toggleTheme } = useThemeContext();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
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
  const profileImage =  userData?.profile ? userData.profile : logo;

  const sidebarClasses = `
    font-sans z-[999] flex flex-col bg-white dark:bg-dark-bg-primary h-full border-r border-gray-300 dark:border-dark-border-subtle shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 ease-in-out
    ${isMobile ? 'fixed w-[280px] shadow-2xl' : 'relative'}
    ${isMobile ? (showSidebar ? 'translate-x-0' : '-translate-x-full') : ''}
    ${!isMobile ? (sidebarSize ? 'w-[88px]' : 'w-[280px]') : ''}
  `;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && showSidebar && (
        <div 
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-[998] transition-opacity duration-300"
          onClick={handleClose}
        />
      )}
      
      <aside ref={sidebarRef} className={sidebarClasses}>
        {/* Logo Section */}
        <div className={`flex items-center h-[72px] ${sidebarSize ? "px-2 justify-center gap-2" : "px-6 justify-between"} border-b border-gray-100 dark:border-dark-border-subtle transition-all duration-300`}>
          <div className={`flex items-center gap-2.5 overflow-hidden transition-all ease-in-out ${sidebarSize ? "w-0 opacity-0 duration-200 hidden" : "w-fit opacity-100 duration-300"}`}>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900 dark:text-dark-text-primary leading-none tracking-tight">Feed
                <span className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent leading-none tracking-tight">Snap</span>
              </span>
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Dashboard</span>
            </div>
          </div>

          {!isMobile && (
            <button
              onClick={handleToggleSize}
              className={`p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-dark-text-tertiary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-all duration-200 ${sidebarSize ? "rotate-180" : ""}`}
            >
              <LucidePanelLeftClose size={32} />
            </button>
          )}
          
          {isMobile && (
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-dark-text-tertiary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary"
            >
              <LucidePanelLeftClose size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2 px-4 py-6 overflow-y-auto scrollbar-hide">
          
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={handleNavClick}
                className={({ isActive }) => `
                  flex items-center h-12 px-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden
                  ${isActive 
                    ? `${item.activeBg}  shadow-sm` 
                    : "text-gray-500 dark:text-dark-text-muted hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary "
                  }
                  ${sidebarSize ? "justify-center" : "justify-start gap-3.5"}
                `}
              >
                {({ isActive }) => (
                  <>
                    <div className={`relative z-10 transition-transform duration-300  ${isActive ? item.activeColor : item.hoverColor}`}>
                      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    
                    <span className={`whitespace-nowrap font-medium z-10 transition-all ease-in-out ${sidebarSize ? "w-0 opacity-0 duration-200 hidden" : "w-auto opacity-100 duration-300"} ${isActive ? 'text-white dark:text-white' : 'text-gray-600 dark:text-dark-text-muted'}`}>
                      {item.label}
                    </span>

                    {/* Tooltip for collapsed state */}
                    {sidebarSize && (
                      <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all duration-200 shadow-xl translate-x-2 group-hover:translate-x-0">
                        {item.label}
                        {/* Arrow */}
                        <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}



        </nav>

        {/* Footer/Profile */}
        <div className="p-4 border-t border-gray-100 dark:border-dark-border-subtle bg-gray-50/50 dark:bg-dark-bg-secondary/50">
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleTheme}
            className={`w-full flex items-center h-10 rounded-lg mb-3 transition-all duration-300 group relative text-gray-500 dark:text-dark-text-muted hover:bg-white dark:hover:bg-dark-bg-tertiary hover:shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-dark-border-emphasis ${sidebarSize ? "justify-center px-0" : "justify-start px-3 gap-3"}`}
          >
            {darkMode ? (
              <Sun size={20} className="text-yellow-500 transition-transform duration-500 group-hover:rotate-90" />
            ) : (
              <Moon size={20} className="text-blue-500 transition-transform duration-500 group-hover:-rotate-12" />
            )}
            <span className={`whitespace-nowrap font-medium transition-all ease-in-out ${sidebarSize ? "w-0 opacity-0 hidden" : "w-auto opacity-100"}`}>
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          <div className={`flex items-center gap-3 p-2.5 rounded-xl hover:bg-white dark:hover:bg-dark-bg-tertiary hover:shadow-md transition-all duration-300 cursor-pointer group border border-transparent hover:border-gray-100 dark:hover:border-dark-border-emphasis ${sidebarSize ? "justify-center" : ""}`}>
            {isLoading ? (
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-dark-bg-tertiary animate-pulse flex-shrink-0"></div>
            ) : (
              <div className="relative flex-shrink-0">
                <img
                  referrerPolicy="no-referrer"
                  key={userData?.profile || 'default'}
                  src={profileImage}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-dark-border-emphasis shadow-sm group-hover:scale-105 transition-transform duration-300"
                  alt={`${displayName}'s profile`}
                />
                <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-dark-border-emphasis rounded-full shadow-sm"></div>
              </div>
            )}
            
            <div className={`flex flex-col overflow-hidden transition-all ease-in-out ${sidebarSize ? "w-0 opacity-0 duration-200 hidden" : "w-auto opacity-100 duration-300"}`}>
              {isLoading ? (
                <div className="space-y-1">
                  <div className="h-3 w-20 bg-gray-200 dark:bg-dark-bg-tertiary animate-pulse rounded"></div>
                  <div className="h-2 w-12 bg-gray-100 dark:bg-dark-bg-tertiary animate-pulse rounded"></div>
                </div>
              ) : (
                <>
                  <p className="text-sm font-bold text-gray-900 dark:text-dark-text-primary truncate max-w-[140px]">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-dark-text-muted truncate capitalize font-medium">
                    {userData?.role || 'Free Plan'}
                  </p>
                </>
              )}
            </div>
            
            {!sidebarSize && !isLoading && (
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                 <LogOut size={18} className="text-gray-400 hover:text-red-500 transition-colors" />
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;