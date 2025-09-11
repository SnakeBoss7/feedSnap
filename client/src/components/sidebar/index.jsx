import { NavLink } from "react-router-dom";
import { useSidebarContext } from "../../context/sidebarContext";
import logo from '../../img/image.png';
import Checkbox from "../header/hamburger";
import {
  ChartColumnStacked,
  Code,
  LayoutDashboard,
  LucidePanelLeftClose,
  MessageSquare,
} from "lucide-react";
import { useLayoutEffect, useRef, useMemo, useCallback, memo, useState, useEffect } from "react";

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

// Memoized NavItem to prevent unnecessary re-renders
const NavItem = memo(({ item, sidebarSize, closeSidebarOnNavClick }) => {
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
    <NavLink onClick={closeSidebarOnNavClick} to={to} end={end} className={linkClasses}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      {!sidebarSize && <p className="whitespace-nowrap overflow-hidden">{label}</p>}
    </NavLink>
  );
}, (prevProps, nextProps) => {
  // Only re-render if sidebarSize changes
  return prevProps.sidebarSize === nextProps.sidebarSize;
});

// Memoized Logo section
const LogoSection = memo(({ sidebarSize, onToggle, closeSidebar }) => {
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
        <button
          onClick={onToggle}
          className={`opacity-60 hover:opacity-100 rounded-lg p-1 hidden lg:flex text-white cursor-pointer transition-all duration-200 ${sidebarSize ? "rotate-180" : "rotate-0"}`}
          aria-label="Toggle sidebar size"
        >
          <LucidePanelLeftClose size={35} />
        </button>
        <button
          onClick={closeSidebar}
          className={`opacity-60 hover:opacity-100 rounded-lg p-1 text-white lg:hidden cursor-pointer transition-all duration-200`}
          aria-label="Close sidebar"
        >
          <LucidePanelLeftClose size={35} />
        </button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.sidebarSize === nextProps.sidebarSize;
});

// Memoized Navigation section
const Navigation = memo(({ sidebarSize, closeSidebarOnNavClick }) => {
  return (
    <nav className="links flex flex-col text-primary gap-3 px-3 py-4 items-center">
      {NAV_ITEMS.map((item) => (
        <NavItem key={item.id} item={item} closeSidebarOnNavClick={closeSidebarOnNavClick} sidebarSize={sidebarSize} />
      ))}
    </nav>
  );
}, (prevProps, nextProps) => {
  return prevProps.sidebarSize === nextProps.sidebarSize;
});

// Memoized Footer section
const Footer = memo(({ sidebarSize }) => {
  return (
    <div className="flex flex-col self-center h-full items-center justify-end w-full pb-3">
      <hr className="my-2 border-0 h-[1px] bg-white opacity-30 w-full" />
      <div className="flex gap-3 self-center items-center justify-center rounded-lg">
        <img 
          src={logo} 
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          alt="Logo"
          loading="lazy"
        />
        <p className={`h-10 text-white flex items-center justify-center text-lg font-semibold ${sidebarSize ? "hidden" : "block"}`}>
          Insaen
        </p>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.sidebarSize === nextProps.sidebarSize;
});

export const Sidebar = memo(() => {
  const { showSidebar, setShowSidebar, sidebarSize, setSidebarSize } = useSidebarContext();
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const ref = useRef();
  
  // Fixed function to close sidebar on nav click
  const closeSidebarOnNavClick = useCallback(() => {
    // Check actual current window width instead of state
    const currentWidth = window.innerWidth;
    console.log('Current window width:', currentWidth);
    console.log('State window width:', windowWidth);
    
    // Only close on mobile screens
    if (currentWidth < 1024) {
      setShowSidebar(false);
    }
  }, [setShowSidebar, windowWidth]);

  // Fixed function to close sidebar (for mobile close button)
  const closeSidebar = useCallback(() => {
    setShowSidebar(false);
  }, [setShowSidebar]);
  
  // Window resize handler with immediate update
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Set initial value
    setWindowWidth(window.innerWidth);
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Memoized click handlers
  const handleToggleSize = useCallback(() => {
    setSidebarSize(prev => !prev);
  }, [setSidebarSize]);

  const handleBackdropClick = useCallback(() => {
    setShowSidebar(false);
  }, [setShowSidebar]);

  // Optimized outside click handler
  useLayoutEffect(() => {
    const handleOutsideClick = (event) => {
      if (windowWidth < 1024 && ref.current && !ref.current.contains(event.target)) {
        setShowSidebar(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [windowWidth, setShowSidebar]);

  // Memoized CSS classes - combining both approaches for best animation
  const sidebarClasses = useMemo(() => {
    const baseClasses = "font-sans z-50 flex flex-col lg:relative absolute bg-backgr h-full";
    const transformClasses = showSidebar ? "translate-x-0" : "translate-x-[-1000px]";
    const sizeClasses = sidebarSize ? "sidebar-collapsed" : "sidebar-expanded";
    const transitionClasses = "transition-all ease-in-out duration-500";
    
    return `${baseClasses} ${transformClasses} ${sizeClasses} ${transitionClasses}`;
  }, [showSidebar, sidebarSize]);

  return (
    <>
      {/* CSS for smooth width transitions - keeping the working animation from second version */}
      <style>{`
        .sidebar-expanded {
          width: 250px;
        }
        .sidebar-collapsed {
          width: 80px;
        }
        
        /* Mobile override */
        @media (max-width: 1023px) {
          .sidebar-expanded,
          .sidebar-collapsed {
            width: 70%;
          }
        }
      `}</style>

      {/* Mobile Backdrop - only render when needed */}
      {showSidebar && windowWidth < 1024 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleBackdropClick}
        />
      )}
      
      <aside
        ref={ref}
        className={sidebarClasses}
        style={{
          // Keep the working transition from the second version
          transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s ease-in-out',
          willChange: 'width, transform'
        }}
      >
        <LogoSection 
          sidebarSize={sidebarSize} 
          onToggle={handleToggleSize} 
          closeSidebar={closeSidebar} 
        />
        
        <hr className="border-0 h-[2px] bg-white opacity-30" />

        <Navigation 
          closeSidebarOnNavClick={closeSidebarOnNavClick} 
          sidebarSize={sidebarSize} 
        />

        <Footer sidebarSize={sidebarSize} />
      </aside>
    </>
  );
});