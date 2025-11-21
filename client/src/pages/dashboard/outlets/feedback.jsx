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
  const [isChatExpanded, setIsChatExpanded] = useState(true); // Desktop toggle
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
      <div className="h-screen w-full bg-gray-50 dark:bg-backgr flex flex-col overflow-hidden">
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
    <div className="h-screen w-full bg-gray-50 dark:bg-backgr flex flex-col overflow-hidden font-sans transition-colors duration-300">
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
             className="absolute bottom-6 right-6 p-4 bg-primary5 text-white rounded-full shadow-xl hover:shadow-2xl hover:bg-blue-600 transition-all z-50 flex items-center gap-2 group"
           >
             <LucideBot size={24} className="group-hover:rotate-12 transition-transform"/>
             <span className="font-medium pr-1 hidden group-hover:block transition-all">Ask AI</span>
           </motion.button>
          )}
        </AnimatePresence>

        {/* Chat Sidebar */}
        <div 
          className={`
            fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] lg:w-[450px] 
            bg-white dark:bg-secondary border-l border-gray-300 dark:border-gray-800 shadow-2xl lg:shadow-none
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen || (isChatExpanded && window.innerWidth >= 1024) ? 'translate-x-0' : 'translate-x-full'}
            lg:relative lg:flex flex-col
            ${!isChatExpanded && 'lg:hidden'}
          `}
        >
          {/* Chat Header */}
          <div className="flex-shrink-0 h-16 px-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-secondary">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary5/10 rounded-xl">
                <LucideBot size={20} className="text-primary5" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white text-sm">Feedback Assistant</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Powered by AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setIsSidebarOpen(false);
                  setIsChatExpanded(false);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 transition-colors"
              >
                {window.innerWidth >= 1024 ? <LucidePanelRightClose size={20}/> : <LucideX size={20}/>}
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div 
            ref={chatRefContainer}
            className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 p-4 space-y-6 bg-gray-50/80 dark:bg-[#151e2d]"
          >
            {displayedMessages.map((chat, idx) => (
              <div key={idx} className={`flex w-full ${chat.role === "assistant" ? "justify-start" : chat.role === "user" ? "justify-end" : "justify-center"}`}>
                {chat.role === "assistant" && (
                   <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center mr-3 flex-shrink-0 mt-1 shadow-sm">
                     <LucideSparkles size={14} className="text-primary5" />
                   </div>
                )}
                
                {(chat.role === "assistant" || chat.role === "user") && (
                  <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                    chat.role === "assistant" 
                      ? "bg-white dark:bg-secondary border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none" 
                      : "bg-primary5 text-white rounded-tr-none shadow-md shadow-blue-500/20"
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
                  <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-full shadow-sm">
                    <LucideMailCheck size={14} className="text-green-600 dark:text-green-400" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-300">{chat.content}</span>
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start w-full">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center mr-3 flex-shrink-0 mt-1 shadow-sm">
                  <LucideSparkles size={14} className="text-primary5" />
                </div>
                <div className="bg-white dark:bg-secondary border border-gray-200 dark:border-gray-700 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-primary5 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-primary5 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-primary5 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions & Input */}
          <div className="flex-shrink-0 bg-white dark:bg-secondary border-t border-gray-200 dark:border-gray-700 p-5 space-y-4 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)] z-10">
            {/* Suggestions */}
            {(promptSuggestion.sug1 || promptSuggestion.sug2 || (!displayedMessages.length || displayedMessages.length <= 1)) && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                <SuggestionButton 
                  text={promptSuggestion.sug1 || `Analyze feedback for ${state?.userTeams[0]?.label || 'my team'}`} 
                  onClick={setUserPrompt} 
                />
                <SuggestionButton 
                  text={promptSuggestion.sug2 || "Summarize critical issues"} 
                  onClick={setUserPrompt} 
                />
              </div>
            )}

            {/* Input Area */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl opacity-50 group-hover:opacity-100 transition duration-200 blur"></div>
              <div className="relative bg-white dark:bg-[#151e2d] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200">
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleInput();
                    }
                  }}
                  placeholder="Ask about your feedback..."
                  className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 min-h-[56px] max-h-[120px] resize-none py-4 pl-4 pr-14 rounded-xl"
                  rows={1}
                  disabled={isLoading}
                />
                <button
                  onClick={handleInput}
                  disabled={!userPrompt.trim() || isLoading}
                  className={`absolute right-2 bottom-2 p-2 rounded-lg transition-all duration-200 ${
                    userPrompt.trim() && !isLoading
                      ? "bg-primary5 text-white hover:bg-blue-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5" 
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
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
    className="whitespace-nowrap px-3 py-1.5 text-xs font-medium text-primary5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
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
      minHeight: '38px',
      fontSize: '13px',
      backgroundColor: 'transparent',
      borderColor: state.isFocused ? '#2563EB' : 'rgba(209, 213, 219, 0.5)',
      boxShadow: 'none',
      '&:hover': { borderColor: '#2563EB' },
      borderRadius: '0.5rem',
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '0.5rem',
      zIndex: 9999,
      fontSize: '13px',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? '#eff6ff' : 'transparent',
      color: state.isSelected ? 'white' : '#1f2937',
      cursor: 'pointer',
    }),
  };

  return (
    <div className="w-full max-w-[95%] mx-auto my-2 bg-white dark:bg-secondary border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-[#151e2d] px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
             <LucideMessageSquare size={14} className="text-blue-600 dark:text-blue-400"/>
          </div>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Email Draft</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onCopy(body, index)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {copiedIndex === index ? <LucideCheck size={12} className="text-green-500"/> : <LucideCopy size={12}/>}
            {copiedIndex === index ? "Copied" : "Copy"}
          </button>
          <button
            onClick={() => onSend({ subject, body }, index, selectedTeam)}
            disabled={!selectedTeam}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              selectedTeam
                ? 'bg-primary5 text-white hover:bg-blue-600 shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            <LucideSend size={12} />
            Send
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Recipient */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Recipient</label>
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
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full text-sm bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-primary5 dark:focus:border-primary5 text-gray-800 dark:text-gray-200"
          />
        </div>

        {/* Body */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Content</label>
            <button
              onClick={() => setIsEditingBody(!isEditingBody)}
              className="text-xs text-primary5 hover:underline flex items-center gap-1"
            >
              {isEditingBody ? <><LucideEye size={12}/> Preview</> : <><LucideEdit size={12}/> Edit</>}
            </button>
          </div>
          
          {isEditingBody ? (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full h-48 text-sm bg-gray-50 dark:bg-[#151e2d] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-primary5 dark:focus:border-primary5 text-gray-800 dark:text-gray-200 font-mono resize-none"
            />
          ) : (
            <div 
              className="w-full h-48 overflow-y-auto scrollbar-thin text-sm bg-gray-50 dark:bg-[#151e2d] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(body) }}
            />
          )}
        </div>
      </div>
    </div>
  );
};