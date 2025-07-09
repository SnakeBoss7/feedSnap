import React from "react";
import { useState } from "react";
import Header from "../../components/header";
import { faCheck, faMagic,faFileAlt,faUsers,faMagicWandSparkles } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


export const  Home=()=> {

    const navigate = useNavigate();
    
    


  return (
    <div
      className=" flex flex-col gap-10 items-center"
      style={{ backgroundColor: "#E9EEF4" }}
    >
      {/* Header section  */}
      <Header />
      {/* Hero section  */}
      <div className="hero  flex flex-col items-center  w-full">
        <span className=" mb-5 text-blue-700 text-xs font-normal tracking-tight bg-white px-3 py-1 rounded-xl hover:bg-gray-300 transition ease-in-out duration-300">
          ✨ Collect Customer Feedback Effortlessly
        </span>
        <h1 className="text-center  md:text-7xl text-4xl mb-2 font-black tracking-tight">
          Turn Website Visitors Into
        </h1>
        <h1
          className="  bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent
 text-center text-6xl  font-black tracking-tight"
        >
          Valuable Insights
        </h1>
        <p className="text-xl md:w-1/2 w-full p-2 text-center my-1  font-normal text-gray-600  mt-5">
          Add a beautiful feedback widget to any website in seconds. Collect
          ratings, comments, and analytics to improve your user experience.
        </p>
      </div>
      <div class="features flex gap-3 px-5 items-center">
        <div class="div flex flex-wrap text-center items-center font-extrabold flex-col sm:flex-row sm:gap-3"> <FontAwesomeIcon icon={faCheck} className="text-green-600"/>  No credit card required</div>
        <div class="div flex flex-wrap text-center items-center font-extrabold flex-col sm:flex-row sm:gap-3"> <FontAwesomeIcon icon={faCheck} className="text-green-600"/> Less than 5 minutes to set up</div>
        <div class="div flex flex-wrap text-center items-center font-extrabold flex-col sm:flex-row sm:gap-3"> <FontAwesomeIcon icon={faCheck} className="text-green-600"/>  Free forever Plan</div>
      </div>
      {/* Message section  */}
      <div className=" mt-10 message flex flex-col items-center w-full">
        <div className="message_content text-center text-sm font-normal text-gray-600  tracking-tight">
          <h1 className="text-4xl mb-2 mt-10 font-extrabold px-3 text-black tracking-tight">
            Everything you need to optimize resumes
          </h1>
          <p className="lg:text-xl text-lg px-5 text-gray-500 tracking-tight ">
            Our AI-powered platform provides comprehensive resume analysis for
            both job seekers and HR professionals.
          </p>
        </div>
      </div>

      {/* Analyse redirection section  */}
      <div className=" px-5  mx-auto md:container md:p-0 w-full">
        <div class="box h-[300px] flex flex-col p-5 items-center justify-evenly w-full  bg-gradient-to-r from-primary via-primary_lg to-purple-500 text-white font-normal tracking-tight  rounded-xl">
          <div class="textual_dta">
            <h1 className="md:text-4xl text-3xl text-center font-extrabold ">
              Ready to optimize your resume?
            </h1>
            <h3 className="text-center text-gray-200 text-sm mt-4 font-bold tracking-tight">
              Join thousands of professionals who have improved their job
              prospects with ResumeAI.
            </h3>
          </div>
          <Link
            to="/single_analyzer"
            className="border-2 flex justify-center items-center gap-3
            rounded-lg text-lg bg-white text-black font-bold w-auto px-4 py-2"
          >
            Start Free Analysis <faArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
}

