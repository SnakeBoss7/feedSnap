import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  useSidebarContext,
} from "../../context/sidebarContext";
import Checkbox from "./hamburger";
import { LucideHome, LucideLogIn, LucideView } from "lucide-react";
import { useUserContext } from "../../context/userDataContext";

export default function Header() {
    const { userData} = useUserContext();
  const { showSidebar, setShowSidebar } = useSidebarContext();
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
          className={`w-full flex glass-card ${
            isScrolling ? "mt-4 mx-4 lg:mx-16 px-6 py-3" : "mt-0 px-4 py-4"
          }`}
          style={{

            backdropFilter: "blur(2px)",
            borderRadius: isScrolling ? "9999px" : "0",
            transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div className="mx-auto container w-full flex justify-between items-center">
            {/* Logo - Left aligned on all screens */}
            <div className="flex justify-start">
              <div className="text-3xl font-semibold tracking-tight flex items-center">
                <div className="text-gray-900 text-3xl">Feed</div>
                <div className=" bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent text-3xl">
                  SNAP
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="flex gap-6 font-sans lg:flex hidden items-center">
              <Link
                className="transition-all duration-300 flex ease-in-out py-2 items-center gap-2 text-black text-lg rounded-md hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 bg-clip-text hover:text-transparent font-medium"
                to="/"
              >
                <LucideHome className="text-black" size={19} />
                Home
              </Link>
              <Link
                className="transition-all duration-300 flex ease-in-out py-2 items-center gap-2 text-black rounded-md hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 bg-clip-text hover:text-transparent font-medium"
                to="/overview"
              >
                <LucideView className="text-black" size={19} />
                Overview
              </Link>
              <Link
                className="transition-all duration-300 flex ease-in-out py-2 items-center gap-2 text-black rounded-md hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 bg-clip-text hover:text-transparent font-medium"
                to="/logIn"
              >
                <LucideLogIn className="text-black" size={19} />
                Log In
              </Link>

              {/* Get Started Button */}
              {userData?<Link
                className="font-bold px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white  text-xl hover:from-blue-600 hover:to-purple-700 hover:shadow-lg"
                to="/dashboard"
                style={{
                  borderRadius: isScrolling ? "9999px" : "0.375rem",
                  transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                Dashboard
              </Link>:<Link
                className="font-bold px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white  hover:from-blue-600 hover:to-purple-700 hover:shadow-lg"
                to="/Signup"
                style={{
                  borderRadius: isScrolling ? "9999px" : "0.375rem",
                  transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                Get Started
              </Link>}
            </div>

            {/* Mobile Hamburger - Right aligned */}
            <div className="lg:hidden flex">
              <Checkbox show={"false"} />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Dropdown Menu - Separated from header */}
      {showSidebar && (
        <div className="lg:hidden fixed top-20 left-0 right-0 z-[9998] px-4 animate-slideDown">
          <div
            className="w-full rounded-2xl p-6 shadow-2xl"
            style={{
              background: "rgba(255, 255, 255, 1)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.5)",
            }}
            onClick={() => setShowSidebar((prev) => !prev)}
          >
            <div className="flex flex-col gap-4 font-medium">
              <Link
                className="transition-all duration-300 flex items-center  gap-3 ease-in-out text-lg py-3 px-4 text-black rounded-xl hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white hover:shadow-md"
                to="/"
              >
                                <LucideHome className="text-black" size={19} />
                Home
              </Link>
              <Link
                className="transition-all duration-300 flex items-center gap-3 ease-in-out text-lg py-3 px-4 text-black rounded-xl hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white hover:shadow-md"
                to="/overview"
              >
                   <LucideView className="text-black" size={19} />
                Overview
              </Link>
              <Link
                className="transition-all duration-300 flex items-center gap-3  ease-in-out text-lg py-3 px-4 text-black rounded-xl hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white hover:shadow-md"
                to="/logIn"
              >
                <LucideLogIn className="text-black" size={19} />
                Log In
              </Link>
              {userData?<Link
                className="font-bold px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white  text-xl hover:from-blue-600 hover:to-purple-700 hover:shadow-lg"
                to="/dashboard"
                style={{
                  borderRadius: isScrolling ? "9999px" : "0.375rem",
                  transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                Dashboard
              </Link>:<Link
                className="font-bold px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white  hover:from-blue-600 hover:to-purple-700 hover:shadow-lg"
                to="/Signup"
                style={{
                  borderRadius: isScrolling ? "9999px" : "0.375rem",
                  transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                Get Started
              </Link>}
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