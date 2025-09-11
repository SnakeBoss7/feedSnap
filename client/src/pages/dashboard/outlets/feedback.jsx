import React, { useEffect, useReducer, useRef, useState } from "react";
import {
  BotMessageSquareIcon,
  LucideArrowUp,
  LucideBot,
} from "lucide-react";
import axios from "axios";
import { SimpleHeader } from "../../../components/header/header";
import { FilterTable } from "../../../components/table/filterTable";

const apiUrl = process.env.REACT_APP_API_URL;

// Cache helper function
const getCachedData = () => {
  const type = localStorage.getItem('type');
  const cachedData = localStorage.getItem('feedbackData');
  
  if(type === 'FETCH_SUCCESS' && cachedData) {
    try {
      const parsed = JSON.parse(cachedData);
      const isRecent = Date.now() - parsed.timestamp < 5 * 60 * 1000; // 5 minutes
      
      if(isRecent && parsed.data) {
        return {
          data: parsed.data.data || [],
          sites: parsed.data.sites || [],
          success: parsed.data.success || false,
          isLoading: false
        };
      }
    } catch(e) {
      console.log('Cache parse error:', e);
    }
  }
  return {
    data: [],
    sites: [],
    success: false,
    isLoading: true,
  };
};

const dashboardReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_SUCCESS':
      return {
        ...state,
        data: action.payload.data || [],
        sites: action.payload.sites || [],
        success: action.payload.success || false,
        isLoading: false
      };
    case 'FETCH_FAIL':
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
};

const wait = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const Feedback = () => {
  const [aiResponse, setAiResponse] = useState([
    {
      role: "assistant",
      content: "Hello! how can I help you today",
    },
  ]);
  
  const [state, dispatch] = useReducer(dashboardReducer, getCachedData());
  const [userPrompt, setUserPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const chatRefContainer = useRef(null);
  const messagesEndRef = useRef(null);

  // Improved scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth", 
        block: "end" 
      });
    }
  };

  // Alternative scroll method using the container
  const scrollToBottomContainer = () => {
    if (chatRefContainer.current) {
      const container = chatRefContainer.current;
      container.scrollTop = container.scrollHeight;
    }
  };

  // Typewriter effect for AI messages
  useEffect(() => {
    if (!aiResponse.length) return;

    const lastMessage = aiResponse[aiResponse.length - 1];
    if (lastMessage.role !== "assistant") {
      setDisplayedMessages(aiResponse);
      // Use setTimeout to ensure DOM is updated before scrolling
      setTimeout(scrollToBottomContainer, 100);
      return;
    }

    let words = lastMessage.content.split(" ");
    let i = 0;
    const tempMessages = [...displayedMessages];

    const interval = setInterval(() => {
      if (
        !tempMessages.length ||
        tempMessages[tempMessages.length - 1].role !== "assistant"
      ) {
        tempMessages.push({ role: "assistant", content: "" });
      }

      tempMessages[tempMessages.length - 1].content +=
        (i === 0 ? "" : " ") + words[i];
      setDisplayedMessages([...tempMessages]);
      
      // Scroll after each word for smooth experience
      setTimeout(scrollToBottomContainer, 50);

      i++;
      if (i >= words.length) {
        clearInterval(interval);
        // Final scroll after typewriter is complete
        setTimeout(scrollToBottomContainer, 100);
      }
    }, 150); // 150ms per word

    return () => clearInterval(interval);
  }, [aiResponse]);

  // Scroll when displayed messages change
  useEffect(() => {
    setTimeout(scrollToBottomContainer, 100);
  }, [displayedMessages]);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('Fetching fresh feedback data...');
        const res = await axios.get(`${apiUrl}/api/feedback/getFeedbacks`, {
          withCredentials: true
        });
        await wait(2000);
        console.log(res);
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: res.data,
        });
        
        // Store with timestamp
        const cacheData = {
          data: res.data,
          timestamp: Date.now()
        };

        localStorage.setItem("feedbackData", JSON.stringify(cacheData));
        localStorage.setItem("type", 'FETCH_SUCCESS');
        console.log(cacheData);
      }
      catch(err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: err.response?.data,
        });
        console.log(err);
        localStorage.setItem("type", 'FETCH_FAIL');
      }
    }

    // Fetch fresh data if cache is missing, old, or invalid
    if(state.isLoading) {
      fetchData();
    }
  }, [state.isLoading]);

  const handleInput = async () => {
    if (userPrompt.trim() === "") return;
    
    // Add user message
    setAiResponse((prev) => [...prev, { role: "user", content: userPrompt }]);
    setUserPrompt("");
    setIsLoading(true);
    
    // Scroll immediately after adding user message
    setTimeout(scrollToBottomContainer, 100);
    
    try {
      let aiRes = await axios.post(`${apiUrl}/api/llm/askAI`, {
        aiResponse,
        userPrompt,
      });
      console.log(aiRes.data);
      setAiResponse((prev) => [
        ...prev,
        { role: "assistant", content: aiRes.data.response },
      ]);
    } catch (error) {
      console.log(error);
      setAiResponse((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    }
    setIsLoading(false);
  };

  if (state.isLoading) {
    return (
      <div className="h-full w-full font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading feedback data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden font-sans">
      <SimpleHeader color="#c5b5ff" />

      {/* <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#e8e8e8_1px,transparent_2px),linear-gradient(to_bottom,#e8e8e8_0.5px,transparent_2px)] bg-[size:4.5rem_3.5rem]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_700px_at_0%_250px,#2563EB,transparent)] lg:bg-none"></div>
      <div className="absolute inset-0 bg-none lg:bg-[radial-gradient(circle_1900px_at_0%_10px,#fffffff,transparent)]"></div>
    </div> */}

      <div className="flex lg:flex-row flex-col overflow-y-auto scrollbar-hide max-h-screen">
        <div className="flex flex-col w-full lg:w-[75%]">
          <FilterTable data={state?.data}/>
        </div>

        <div className="lg:w-[25%] bg-white w-full h-full lg:min-h-screen min-h-[800px]" style={{borderLeft: '1px solid #eee',boxShadow: '-3px 0 15px rgba(0, 0, 0, 0.1), -1px 0 6px rgba(0, 0, 0, 0.06)'}}>
          <div className="h-full w-full min-h-screen p-5 pb-10 flex flex-col">
            <div className="flex-1 flex flex-col">
              <div >
                <h1 className="text-xl  mb-1 font-bold text-black flex items-center gap-3 ">
                <LucideBot color="#000000" /> Feedback Assistant
              </h1>
              <p className="text-sm  mb-6  text-gray-500">Get insights and help with your feedback data</p>
              </div>
              
              <div 
                ref={chatRefContainer}
                className="chats flex-1 overflow-y-auto scrollbar-hide mb-4 pr-2"
                style={{ maxHeight: 'calc(100vh - 280px)' }}
              >
                {displayedMessages.map((chat, idx) => (
                  <div
                    key={idx}
                    className={`w-full my-2 flex text-md ${
                      chat.role === "assistant" ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-2xl  shadow-sm ${
                        chat.role === "assistant"
                          ? "text-black bg-gray-100"
                          : "bg-primary5 text-white rounded-br-md"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm break-words text-left">
                        {chat.content}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="w-full my-2 flex justify-start">
                    <div className="max-w-[70%] p-3 rounded-2xl shadow-sm text-black bg-gray-100">
                      <p className="text-gray-500">Typing...</p>
                    </div>
                  </div>
                )}
                {/* Invisible element to scroll to */}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            <div className="w-full flex flex-col py-5 px-2 border border-black rounded-2xl mt-auto lg:mb-0 mb-10">
              <div className="flex w-full items-end ">
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleInput();
                    }
                  }}
                  placeholder="Ask here"
                  className="w-full border-0 outline-0 bg-transparent  text-black resize-none rounded-md"
                  disabled={isLoading}
                />
                <LucideArrowUp 
                  onClick={handleInput}
                  // color={isLoading && "gray"}
                  className={`ml-2 hover:mb-1 hover:scale-[1.1] transition-all ease-in-out duration-300 ${isLoading ? "cursor-not-allowed text-gray-400 " : "cursor-pointer text-black"}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};