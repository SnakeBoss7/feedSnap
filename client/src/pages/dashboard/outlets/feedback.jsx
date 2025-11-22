import React, { useEffect, useReducer, useRef, useState } from "react";
import DOMPurify from 'dompurify';
import {
  LucideArrowUp,
  LucideBot,
  LucideCopy,
  LucideCheck,
  LucideSend,
  LucideMailCheck,
  LucidePanelRightClose,
  LucideEdit,
  LucideEye,
  LucideSparkles,
  LucideMessageSquare,
  LucideX,
  LucideMaximize2,
  LucideMinimize2
} from "lucide-react";
import axios from "axios";
import { SimpleHeader } from "../../../components/header/header";
import { FilterTable } from "../../../components/PageComponents/feedback/table/filterTable";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";

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
          userTeams: parsed.data.userTeams || [],
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
    userTeams:[],
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
        userTeams:action.payload.userTeams || [],
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
      content: "Hello! I'm your Feedback Assistant. How can I help you analyze your data today?"
    },
  ]);
  
  const [state, dispatch] = useReducer(dashboardReducer, getCachedData());
  const [userPrompt, setUserPrompt] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile toggle
  const [isChatExpanded, setIsChatExpanded] = useState(() => window.innerWidth >= 1024); // Desktop toggle
  const [promptSuggestion, setPromptSuggestion] = useState({
    sug1:'',
    sug2:''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const chatRefContainer = useRef(null);
  const messagesEndRef = useRef(null);
  const [selectedData, setSelectedData] = useState(null);

  // Scroll functions
  const scrollToBottomContainer = () => {
    if (chatRefContainer.current) {
      const container = chatRefContainer.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Typewriter effect for AI messages
  useEffect(() => {
    if (!aiResponse.length) return;

    const lastMessage = aiResponse[aiResponse.length - 1];
    if (lastMessage.role !== "assistant") {
      setDisplayedMessages(aiResponse);
      setTimeout(scrollToBottomContainer, 100);
      return;
    }

    let words = lastMessage?.content?.split(" ");
    let i = 0;
    const tempMessages = [...aiResponse.slice(0, -1)];

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
      
      scrollToBottomContainer();

      i++;
      if (i >= words.length) {
        clearInterval(interval);
        setTimeout(scrollToBottomContainer, 100);
      }
    }, 30); // Faster typing speed

    return () => clearInterval(interval);
  }, [aiResponse]); 

  useEffect(() => {
    setTimeout(scrollToBottomContainer, 100);
  }, [displayedMessages]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(`${apiUrl}/api/feedback/getFeedbacks`, {
          withCredentials: true
        });
        await wait(1000);
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: res.data,
        });
        
        const cacheData = {
          data: res.data,
          timestamp: Date.now()
        };

        localStorage.setItem("feedbackData", JSON.stringify(cacheData));
        localStorage.setItem("type", 'FETCH_SUCCESS');
      }
      catch(err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: err.response?.data,
        });
        localStorage.setItem("type", 'FETCH_FAIL');
      }
    }

    if(state.isLoading) {
      fetchData();
    }
  }, [state.isLoading]);

  const handleInput = async () => {
    if (userPrompt.trim() === "") return;

    setAiResponse((prev) => [...prev, { role: "user", content: userPrompt }]);
    setUserPrompt("");
    setIsLoading(true);

    setTimeout(scrollToBottomContainer, 100);

    try {
      let aiRes = await axios.post(`${apiUrl}/api/llm/askAI`, {
        aiResponse,
        userPrompt,
        feedbackData: selectedData
      },{withCredentials:true});
      
      setAiResponse((prev) => [
        ...prev,
        { role: "assistant", content: aiRes.data?.response.response},
      ]);
      
      if(aiRes.data?.response.reports_or_emails?.mail) {
        setAiResponse((prev) => [
          ...prev,
          {
            role: "emailPrep",
            subject: aiRes.data?.response.reports_or_emails?.mail?.subject, 
            body: aiRes.data?.response?.reports_or_emails?.mail?.body,
            timestamp: new Date().toISOString()
          }
        ]);
      }
      
      setPromptSuggestion({
        sug1: aiRes.data?.response.sug1,
        sug2: aiRes.data?.response.sug2
      });
    } catch (error) {
      console.log(error);
      setAiResponse((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    }
    setIsLoading(false);
  };

  const handleCopyEmail = (emailBody, index) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = emailBody;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    navigator.clipboard.writeText(textContent).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  const handleSendEmail = async (emailData, index, selectedTeam) => {
    try {
      let res = await axios.post(`${apiUrl}/api/mail/send`, {
        to: selectedTeam.value,
        subject: emailData.subject,
        body: emailData.body
      }, { withCredentials: true });
      
      setAiResponse((prev) => {
        const newMessages = prev.filter((_, idx) => idx !== index);
        return [
          ...newMessages,
          {
            role: "emailSent",
            content: `Email sent to ${selectedTeam.label} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          }
        ];
      });

      setDisplayedMessages((prev) => {
        const newMessages = prev.filter((_, idx) => idx !== index);
        return [
          ...newMessages,
          {
            role: "emailSent",
            content: `Email sent to ${selectedTeam.label} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          }
        ];
      });
      
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  if (state.isLoading) {
    return (
      <div className="h-screen w-full bg-gray-50 dark:bg-dark-bg-primary flex flex-col overflow-hidden">
        <SimpleHeader color="#2b5fceff" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary5 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-medium">Loading feedback data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gray-50 dark:bg-dark-bg-primary flex flex-col overflow-hidden font-sans transition-colors duration-300">
      <SimpleHeader color="#2b5fceff" />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Content Area (Table) */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 lg:p-6">
          <FilterTable setSelectedData={setSelectedData} data={state?.data}/>
          
        </div>

        {/* Floating Chat Toggle Button (Mobile & Desktop when closed) */}
        <AnimatePresence>
          {(!isChatExpanded && !isSidebarOpen) && (
             <motion.button
             initial={{ scale: 0, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             exit={{ scale: 0, opacity: 0 }}
             onClick={() => {
               setIsSidebarOpen(true);
               setIsChatExpanded(true);
             }}
             className="absolute bottom-16 right-6 p-4 bg-black text-white dark:bg-white  dark:text-black rounded-full shadow-xl hover:shadow-2xl  transition-all ease-in-out duration-400 z-50 flex items-center gap-2 group"
           >
             <LucideBot size={24} className="group-hover:rotate-12 transition-all  ease-in-out duration-400 "/>
             <span className="font-medium pr-1 hidden group-hover:block transition-all  ease-in-out duration-400 ">Ask AI</span>
           </motion.button>
          )}
        </AnimatePresence>

        {/* Chat Sidebar */}
        <div 
          className={` overflow-y-scroll scrollbar-hide
            fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] lg:w-[400px] 
            bg-white dark:bg-black border-l border-gray-200 dark:border-white/10 shadow-2xl lg:shadow-none
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen || (isChatExpanded && window.innerWidth >= 1024) ? 'translate-x-0' : 'translate-x-full'}
            lg:relative lg:flex flex-col
            ${!isChatExpanded && 'lg:hidden'}
          `}
        >
          {/* Chat Header */}
          <div className="flex-shrink-0 h-16 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-white dark:bg-black px-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center">
                <LucideBot size={16} className="text-white dark:text-black" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white text-sm">Co-Pilot</h2>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setIsSidebarOpen(false);
                  setIsChatExpanded(false);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-400 transition-colors"
              >
                {window.innerWidth >= 1024 ? <LucidePanelRightClose size={18}/> : <LucideX size={18}/>}
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div 
            ref={chatRefContainer}
            className="flex-1 overflow-y-auto scrollbar-hide scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10 p-6 space-y-8 bg-white dark:bg-black"
          >
            {displayedMessages.map((chat, idx) => (
              <div key={idx} className={`flex w-full ${chat.role === "assistant" ? "justify-start" : chat.role === "user" ? "justify-end" : "justify-center"}`}>

                
                {(chat.role === "assistant" || chat.role === "user") && (
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    chat.role === "assistant" 
                      ? "bg-white dark:bg-black border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 rounded-tl-none" 
                      : "bg-black dark:bg-white text-white dark:text-black rounded-tr-none"
                  }`}>
                    <div 
                      className="whitespace-pre-wrap break-words"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(chat.content) }}
                    />
                  </div>
                )}

                {chat.role === "emailPrep" && (
                  <EmailCard
                    chat={chat}
                    index={idx}
                    teams={state.userTeams}
                    copiedIndex={copiedIndex}
                    onCopy={handleCopyEmail}
                    onSend={handleSendEmail}
                  />
                )}

                {chat.role === "emailSent" && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-full">
                    <LucideMailCheck size={12} className="text-green-600 dark:text-green-400" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">{chat.content}</span>
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start w-full">

                <div className="bg-gray-50 dark:bg-dark-bg-secondary p-3.5 rounded-2xl rounded-tl-none flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions & Input */}
          <div className="flex-shrink-0 bg-white dark:bg-black border-t border-gray-200 dark:border-white/10 p-6 space-y-4 z-10">
            {/* Suggestions */}
            {(promptSuggestion.sug1 || promptSuggestion.sug2 || (!displayedMessages.length || displayedMessages.length <= 1)) && (
              <div className="flex flex-col gap-2 overflow-x-auto scrollbar-hide pb-2">
                <SuggestionButton 
                  text={promptSuggestion.sug2 || "Evaluate the data"} 
                  onClick={setUserPrompt} 
                />
                <SuggestionButton 
                  text={promptSuggestion.sug1 || `Analyze feedback for ${state?.userTeams[0]?.label || 'my team'}`} 
                  onClick={setUserPrompt} 
                />
              </div>
            )}

            {/* Input Area */}
            <div className="relative group ">
              <div className="relative bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-white/10 focus-within:border-black dark:focus-within:border-white transition-all duration-200 shadow-sm">
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleInput();
                    }
                  }}
                  placeholder="Ask anything..."
                  className="w-full scrollbar-hide p-3 bg-transparent border-none focus:ring-0 focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 min-h-[52px] max-h-[120px] resize-none py-4 pl-4 pr-12 rounded-2xl"
                  rows={1}
                  disabled={isLoading}
                />
                <button
                  onClick={handleInput}
                  disabled={!userPrompt.trim() || isLoading}
                  className={`absolute right-2 bottom-2 p-2 rounded-xl transition-all duration-200 ${
                    userPrompt.trim() && !isLoading
                      ? "bg-black dark:bg-white text-white dark:text-black hover:scale-105 shadow-md" 
                      : "bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-white/20 cursor-not-allowed"
                  }`}
                >
                  <LucideArrowUp size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

const SuggestionButton = ({ text, onClick }) => (
  <button 
    onClick={() => onClick(text)}
    className="whitespace-nowrap px-4 py-2 text-xs w-fit font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-200"
  >
    {text}
  </button>
);

// Email Card Component
const EmailCard = ({ chat, index, teams, copiedIndex, onCopy, onSend }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [subject, setSubject] = useState(chat.subject);
  const [body, setBody] = useState(chat.body);
  const [isEditingBody, setIsEditingBody] = useState(false);

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '42px',
      fontSize: '13px',
      backgroundColor: 'transparent',
      borderColor: state.isFocused ? '#000000' : 'rgba(229, 231, 235, 1)',
      boxShadow: 'none',
      '&:hover': { borderColor: '#000000' },
      borderRadius: '0.75rem',
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '0.75rem',
      zIndex: 9999,
      fontSize: '13px',
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#000000' : state.isFocused ? '#f3f4f6' : 'transparent',
      color: state.isSelected ? 'white' : '#111827',
      cursor: 'pointer',
    }),
  };

  return (
    <div className="w-full max-w-[95%] mx-auto my-4 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-2xl shadow-lg shadow-gray-100 dark:shadow-none overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-white dark:bg-black">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black dark:bg-white rounded-lg">
             <LucideMessageSquare size={14} className="text-white dark:text-black"/>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Email Generator</h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">AI-Drafted Content</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onCopy(body, index)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
          >
            {copiedIndex === index ? <LucideCheck size={12} className="text-green-500"/> : <LucideCopy size={12}/>}
            {copiedIndex === index ? "Copied" : "Copy"}
          </button>
          <button
            onClick={() => onSend({ subject, body }, index, selectedTeam)}
            disabled={!selectedTeam}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              selectedTeam
                ? 'bg-black dark:bg-white text-white dark:text-black hover:scale-105 shadow-sm'
                : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            <LucideSend size={12} />
            Send
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Recipient */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Recipient</label>
          <Select
            options={teams}
            value={selectedTeam}
            onChange={setSelectedTeam}
            placeholder="Select team..."
            styles={customSelectStyles}
            className="text-sm"
            classNamePrefix="react-select"
          />
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full text-sm bg-transparent border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-black dark:focus:border-white text-gray-900 dark:text-white transition-colors"
          />
        </div>

        {/* Body */}
        <div className="space-y-2 ">
          <div className="flex items-center justify-between ml-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Content</label>
            <button
              onClick={() => setIsEditingBody(!isEditingBody)}
              className="text-xs font-medium text-black dark:text-white hover:underline flex items-center gap-1"
            >
              {isEditingBody ? <><LucideEye size={12}/> Preview</> : <><LucideEdit size={12}/> Edit</>}
            </button>
          </div>
          
          {isEditingBody ? (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full h-64 text-sm bg-gray-50  scrollbar-hide dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-black dark:focus:border-white text-gray-900 dark:text-white font-mono resize-none leading-relaxed"
            />
          ) : (
            <div 
              className="w-full h-64 overflow-y-auto scrollbar-thin scrollbar-hide text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white leading-relaxed"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(body) }}
            />
          )}

        </div>
        
      </div>
    </div>
  );
};