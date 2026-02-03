import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSidebarContext } from "../../context/sidebarContext";
import Checkbox from "./hamburger";
import { LucideHome, LucideLogIn, LucideView, Sun, Moon } from "lucide-react";
import { useUserContext } from "../../context/userDataContext";
import { useThemeContext } from "../../context/themeContext";

export default function Header() {
  const { userData } = useUserContext();
  const { showSidebar, setShowSidebar } = useSidebarContext();
  const { darkMode, toggleTheme } = useThemeContext();
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <header className="w-full z-[9999] sticky top-0 flex  ">
        <div
          className={`w-full flex transition-all duration-500 ease-in-out ${isScrolling
            ? "mt-4 mx-4 lg:mx-16 px-6 py-3 rounded-full bg-white/70 dark:bg-black/70 shadow-lg backdrop-blur-md z"
            : "mt-0 px-6 py-5 bg-transparent"
            }`}
        >
          <div className="mx-auto container w-full flex justify-between items-center">
            {/* Logo - Left aligned on all screens */}
            <div className="flex justify-start">
              <div className="text-3xl font-semibold tracking-tight flex items-center">
                <div className="text-gray-900 dark:text-white text-3xl">Feed</div>
                <div className=" bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent text-3xl">
                  SNAP
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className=" gap-12 text-md font-bold text-gray-600 dark:text-gray-300 lg:flex hidden">
              <div className="flex group flex-col">
                <Link
                  className="group flex items-center gap-2  dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  to="/"
                >
                  {/* <LucideHome size={18} className="group-hover:scale-110 transition-transform" /> */}
                  Home
                </Link>
                <div className="h-[2px] w-0 bg-purple-600 dark:bg-purple-400 transition-all duration-300 group-hover:w-full"></div>
              </div>
              <div className="flex group flex-col">
                <Link
                  className="group flex items-center gap-2   dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  to="/overview"
                >
                  {/* <LucideView size={18} className="group-hover:scale-110 transition-transform" /> */}
                  Overview
                </Link>
                <div className="h-[2px] w-0 bg-blue-600 dark:bg-blue-400 transition-all duration-300 group-hover:w-full"></div>
              </div>
              <div className="flex group flex-col">
                <Link
                  className="group flex items-center gap-2   dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  to="/logIn"
                >
                  {/* <LucideLogIn size={18} className="group-hover:scale-110 transition-transform" /> */}
                  Log In
                </Link>
                <div className="h-[2px] w-0 bg-green-600 dark:bg-green-400 transition-all duration-300 group-hover:w-full"></div>
              </div>

            </div>
            <div className="flex gap-6 font-sans lg:flex hidden items-center">

              {/* Get Started Button */}
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full group bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun size={20} className="group-hover:text-yellow-500 group-hover:rotate-180 transition-all ease-in-out duration-1000" /> : <Moon size={20} className="group-hover:text-yellow-500 group-hover:rotate-180 transition-all ease-in-out duration-1000" />}
              </button>

              {/* Get Started Button */}
              {userData ? (
                <Link
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold   transition-all duration-300"
                  to="/dashboard"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold   transition-all duration-300"
                  to="/Signup"
                >
                  Get Started
                </Link>
              )}
            </div>

            {/* Mobile Hamburger - Right aligned */}
            <div className="lg:hidden flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <Checkbox show={"false"} />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Dropdown Menu - Separated from header */}
      {showSidebar && (
        <div className="lg:hidden mt-6 fixed top-20 left-0 right-0 z-[9998] px-4 animate-slideDown">
          <div
            className="w-full rounded-2xl bg-white dark:bg-black p-6 shadow-2xl"
            onClick={() => setShowSidebar((prev) => !prev)}
          >
            <div className="flex flex-col gap-4 font-medium">
              <Link
                className="transition-all duration-300 flex items-center gap-3 ease-in-out text-lg py-3 px-4 text-gray-900 dark:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"
                to="/"
              >
                <LucideHome className="text-gray-900 dark:text-white" size={20} />
                Home
              </Link>
              <Link
                className="transition-all duration-300 flex items-center gap-3 ease-in-out text-lg py-3 px-4 text-gray-900 dark:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"
                to="/overview"
              >
                <LucideView className="text-gray-900 dark:text-white" size={20} />
                Overview
              </Link>
              <Link
                className="transition-all duration-300 flex items-center gap-3 ease-in-out text-lg py-3 px-4 text-gray-900 dark:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"
                to="/logIn"
              >
                <LucideLogIn className="text-gray-900 dark:text-white" size={20} />
                Log In
              </Link>
              {userData ? (
                <Link
                  className={`font-bold px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 ${isScrolling ? "rounded-full" : "rounded-xl"
                    }`}
                  to="/dashboard"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  className={`font-bold px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 ${isScrolling ? "rounded-full" : "rounded-xl"
                    }`}
                  to="/Signup"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}