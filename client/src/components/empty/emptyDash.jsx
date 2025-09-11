import React from 'react';
import { BarChart3, Plus, Sparkles, ArrowRight } from 'lucide-react';
import bull from "../../img/bull.svg"
import chart from "../../img/chart.svg"
import thunder from "../../img/thunder.svg"
import Header from '../header';
import { SimpleHeader } from '../header/header';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
export const EmptyDash = ({ 
  title = "No Data Yet",
  subtitle = "Start building your dashboard by adding your first widget"
}) => {
  return (
    <div className='overflow-y-scroll scrollbar-hide '>
        <SimpleHeader/>
  <div className="flex flex-col min-h-screen items-center justify-center  text-center font-sans">
      {/* Animated Icon Container */}
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500">
          <BarChart3 className="w-12 h-12 text-white" />
        </div>
        
        {/* Floating decorative elements */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full shadow-lg animate-bounce"></div>
        <div className="absolute -bottom-1 -left-3 w-4 h-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full shadow-lg animate-pulse"></div>
        <div className="absolute top-1/2 -right-6 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg animate-ping"></div>
      </div>

      {/* Content */}
      <h3 className="text-2xl font-bold text-black  mb-3">
        {title}
      </h3>
      <p className="text-gray-600 mb-8 max-w-md tracking-tight  leading-relaxed">
        {subtitle}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col items-center sm:flex-row gap-4 mb-8">
        <Link to="scriptGen" >
        <button

          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group"
          >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          Add Your First Widget
        </button>
          </Link>
       
        <Link  to="scriptGen">
        <button
          className="bg-white hover:bg-backgr hover:text-white justify-center text-gray-700 px-6 py-3 rounded-xl font-medium border border-blue-200 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-sm flex items-center gap-2 group"
        >
          <Sparkles className="w-5 h-5 group-hover:text-yellow-500 transition-colors duration-300" />
          View Demo
        </button>
        </Link>
      </div>

      {/* Quick Tips */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
        {[
          {
            icon:<img className='w-[40px] h-[40px]' src={chart} alt=""/>,
            text: "Track feedback & ratings"
          },
          {
            icon:<img className='w-[40px] h-[40px]' src={thunder} alt=""/>,
            text: "Real-time analytics"
          },
          {
            icon:<img className='w-[40px] h-[40px]' src={bull} alt=""/>,
            text: "Easy to integrate"
          }
        ].map((tip, index) => (
          <div
            key={index}
            className="flex flex-col items-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:border hover:border-gray-300 hover:to-indigo-50 transition-all duration-300 hover:scale-[1.02] group"
          >
            <div className="text-2xl mb-2  transition-transform duration-300">
              
            {tip.icon}
            </div>
            <span className="text-sm text-gray-600 font-medium">
              {tip.text}
            </span>
          </div>
        ))}
      </div> */}

      {/* Subtle call-to-action */}
      <div className="mt-8 flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors duration-300 cursor-pointer group">
        <span>Get started in under 2 minutes</span>
        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
      </div>

    </div>

    </div>
  
  );
};
