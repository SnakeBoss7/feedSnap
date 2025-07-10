import React, { useState } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
// import { FaUsers,FaPagelines } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagic, faFileAlt, faUsers } from '@fortawesome/free-solid-svg-icons';
import { SidebarContextprovider } from "../../context/sidebarContext";

export default function Header({ pages, links, icons }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const color = [
    "bg-blue-600",
    "bg-green-600",
    "bg-purple-600",
    "bg-orange-600",
  ];
  const toggleNav = () => {
    console.log("hello");
    setIsMenuOpen((prev) => !prev);
  };
  useEffect(() => {
    const handleSize = () => {
      if (window.innerWidth > 1024) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleSize);
    return () => window.removeEventListener("resize", handleSize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (isMenuOpen) {
        setShow(true);
        return;
      }
      if (typeof window !== "undefined") {
        if (window.scrollY > lastScrollY && show) {
          setShow(false);
        } else if (window.scrollY < lastScrollY && !show) {
          setShow(true);
        }
        setLastScrollY(window.scrollY);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMenuOpen, show, lastScrollY]);

  return (
    <header
      className={`w-full transition-all duration-300 md:px-20 items-center p-4 glass-card border-b-1 ${
        show ? "translate-y-0" : "translate-y-[-100px]"
      }  border-black-600 flex flex-col ${isMenuOpen ? "h-[100vh]" : ""} `}>
      <div className=" mx-auto container w-full flex justify-between ">
        <div className="left text-3xl font-semibold tracking-tight flex  ">
          <div className="text-gray-900 text-3xl text-top">Feed</div>
          <div className="font-mono text-primary bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent text-4xl text-bottom">SNAP</div>
        </div>
        <div className="right flex items-center gap-3">
        
         <Link
            className="text-bg_c transtition-all hover:bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text hover:text-transparent  ease-in-out duration-400 font-bold  px-4 py-2 rounded-md  hover:bg-gradient-to-r hover:from-blue-500 hover:via-blue-500 hover:to-purple-600 hover:text-white hover:border-white"
            to="/logIn"
          >
            Log In
          </Link>
          <Link
            className="text-bg_c transtition-all ease-in-out duration-400 font-bold border  border-black  px-4 py-2 rounded-md  hover:bg-gradient-to-r hover:from-blue-500 hover:via-blue-500 hover:to-purple-600 hover:text-white hover:border-white"
            to="/signIn"
          >
            Get Started
          </Link>
        </div>
      </div>

      
    </header>
  );
}
