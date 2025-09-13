// components/Sidebar/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { useSidebarContext } from "../../context/sidebarContext";
import logo from '../../img/image.png';
import {
  ChartColumnStacked,
  Code,
  LayoutDashboard,
  LucidePanelLeftClose,
  MessageSquare,
} from "lucide-react";
import { useLayoutEffect, useRef, useMemo, useCallback, memo, useState, useEffect } from "react";
import { useUserContext } from "../../context/userDataContext";

// Static navigation data to prevent recreation
const NAV_ITEMS = [
  {
    id: 'dashboard',
    to: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    end: true
  },
  {
    id: 'feedbacks', 
    to: 'feedbacks',
    icon: MessageSquare,
    label: 'Feedbacks',
    end: true
  },
  {
    id: 'analytics',
    to: 'analytics', 
    icon: ChartColumnStacked,
    label: 'Analytics',
    end: true
  },
  {
    id: 'scriptGen',
    to: 'scriptGen',
    icon: Code,
    label: 'Script Generator', 
    end: true
  }
];

// Custom hook for responsive detection
const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 1024;
  });

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };

    // Check immediately
    checkMobile();

    // Throttled resize handler for better performance
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 100);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return isMobile;
};

// Memoized NavItem to prevent unnecessary re-renders
const NavItem = memo(({ item, sidebarSize, onNavClick }) => {
  const { to, icon: Icon, label, end } = item;
  
  // Memoize classes to prevent recalculation
  const linkClasses = useCallback(({ isActive }) => {
    const baseClasses = "flex items-center gap-3 w-full h-12 font-extrabold text-[15px] p-2 rounded-lg transition-all ease-in-out duration-300 tracking-tight";
    const activeClasses = isActive 
      ? "bg-white text-blue-800"
      : "text-blue-200 opacity-50 hover:opacity-100 hover:text-white";
    const alignmentClasses = sidebarSize ? "justify-center" : "justify-start";
    
    return `${baseClasses} ${activeClasses} ${alignmentClasses}`;
  }, [sidebarSize]);

  return (
    <NavLink 
      onClick={onNavClick} 
      to={to} 
      end={end} 
      className={linkClasses}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {!sidebarSize && <p className="whitespace-nowrap overflow-hidden">{label}</p>}
    </NavLink>
  );
});

// Memoized Logo section
const LogoSection = memo(({ sidebarSize, onToggle, onClose, isMobile }) => {
  return (
    <div className={`flex p-3 ${sidebarSize ? "justify-center" : "justify-between"}`}>
      <div className={`logo overflow-hidden flex items-center justify-center transition-all ease-in-out duration-400 gap-1 ${sidebarSize ? "w-[0%]" : "w-fit"}`}>
        <div className={`text-white text-3xl flex items-center ${sidebarSize ? "hidden" : "block"}`}>
          Feed
        </div>
        <div className={`font-sans flex justify-center items-center text-primary bg-gradient-to-r from-blue-700 to-purple-800 bg-clip-text text-transparent text-4xl ${sidebarSize ? "hidden" : "block"}`}>
          SNAP
        </div>
      </div>

      <div className="flex items-center justify-center">
        {/* Desktop toggle button */}
        {!isMobile && (
          <button
            onClick={onToggle}
            className={`opacity-60 hover:opacity-100 rounded-lg p-1 text-white cursor-pointer transition-all duration-200 ${sidebarSize ? "rotate-180" : "rotate-0"}`}
            aria-label="Toggle sidebar size"
          >
            <LucidePanelLeftClose size={35} />
          </button>
        )}
        
        {/* Mobile close button */}
        {isMobile && (
          <button
            onClick={onClose}
            className="opacity-60 hover:opacity-100 rounded-lg p-1 text-white cursor-pointer transition-all duration-200"
            aria-label="Close sidebar"
          >
            <LucidePanelLeftClose size={35} />
          </button>
        )}
      </div>
    </div>
  );
});

// Memoized Navigation section
const Navigation = memo(({ sidebarSize, onNavClick }) => {
  return (
    <nav className="links flex flex-col text-primary gap-3 px-3 py-4 items-center">
      {NAV_ITEMS.map((item) => (
        <NavItem 
          key={item.id} 
          item={item} 
          onNavClick={onNavClick} 
          sidebarSize={sidebarSize} 
        />
      ))}
    </nav>
  );
});

// Memoized Footer section with user profile
const Footer = memo(({ sidebarSize, userData, isLoading, error }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageError(false);
  }, []);

  const getProfileImage = useCallback(() => {
    if (isLoading || !userData || !userData.profile || imageError) {
      return logo;
    }
    return userData.profile;
  }, [isLoading, userData, imageError]);

  const getDisplayName = useCallback(() => {
    if (!userData) return "User";
    return userData.name || userData.username || "User";
  }, [userData]);

  if (isLoading) {
    return (
      <div className="flex flex-col self-center h-full items-center justify-end w-full pb-3">
        <hr className="my-2 border-0 h-[1px] bg-white opacity-30 w-full" />
        <div className="flex gap-3 self-center items-center justify-center rounded-lg">
          <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse"></div>
          {!sidebarSize && (
            <div className="h-6 w-24 bg-gray-300 animate-pulse rounded"></div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col self-center h-full items-center justify-end w-full pb-3">
      <hr className="my-2 border-0 h-[1px] bg-white opacity-30 w-full" />
      <div className="flex gap-3 self-center items-center justify-center rounded-lg">
        <img 
          src={getProfileImage()}
          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 transition-opacity duration-200"
          alt={`${getDisplayName()}'s profile`}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        {!sidebarSize && (
          <p className="h-10 text-white flex items-center justify-center text-lg font-semibold">
            {getDisplayName()}
          </p>
        )}
      </div>
    </div>
  );
});

export const Sidebar = memo(() => {
  const { showSidebar, setShowSidebar, sidebarSize, setSidebarSize } = useSidebarContext();
  const { userData, isLoading, error } = useUserContext();
  const isMobile = useResponsive();
  const sidebarRef = useRef();

  // Navigation click handler - always check current window size
  const handleNavClick = useCallback(() => {
    // Always check current window width, not state
    if (window.innerWidth < 1024) {
      setShowSidebar(false);
    }
  }, [setShowSidebar]);

  // Sidebar size toggle (desktop only)
  const handleToggleSize = useCallback(() => {
    if (!isMobile) {
      setSidebarSize(prev => !prev);
    }
  }, [setSidebarSize, isMobile]);

  // Close sidebar (mobile)
  const handleCloseSidebar = useCallback(() => {
    setShowSidebar(false);
  }, [setShowSidebar]);

  // Backdrop click handler
  const handleBackdropClick = useCallback(() => {
    if (isMobile) {
      setShowSidebar(false);
    }
  }, [isMobile, setShowSidebar]);

  // Outside click handler for mobile
  useLayoutEffect(() => {
    if (!isMobile || !showSidebar) return;

    const handleOutsideClick = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setShowSidebar(false);
      }
    };

    // Small delay to prevent immediate closure on the same click that opened it
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleOutsideClick);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isMobile, showSidebar, setShowSidebar]);

  // Memoized CSS classes for sidebar
  const sidebarClasses = useMemo(() => {
    const baseClasses = "font-sans z-50 flex flex-col bg-backgr h-full";
    const positionClasses = isMobile ? "fixed" : "relative";
    const transformClasses = showSidebar ? "translate-x-0" : "-translate-x-full";
    const sizeClasses = isMobile 
      ? "w-[70%]" 
      : (sidebarSize ? "w-20" : "w-64");
    const transitionClasses = "transition-all ease-in-out duration-300";
    
    return `${baseClasses} ${positionClasses} ${transformClasses} ${sizeClasses} ${transitionClasses}`;
  }, [showSidebar, sidebarSize, isMobile]);

  return (
    <>
      {/* Mobile Backdrop */}
      {showSidebar && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleBackdropClick}
        />
      )}
      
      <aside
        ref={sidebarRef}
        className={sidebarClasses}
      >
        <LogoSection 
          sidebarSize={sidebarSize} 
          onToggle={handleToggleSize} 
          onClose={handleCloseSidebar}
          isMobile={isMobile}
        />
        
        <hr className="border-0 h-[2px] bg-white opacity-30" />

        <Navigation 
          onNavClick={handleNavClick} 
          sidebarSize={sidebarSize} 
        />

        <Footer 
          sidebarSize={sidebarSize}
          userData={userData}
          isLoading={isLoading}
          error={error}
        />
      </aside>
    </>
  );
});