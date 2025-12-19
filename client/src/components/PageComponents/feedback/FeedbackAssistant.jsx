import React, { useState, useEffect, useRef } from "react";
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
  LucideMessageSquare,
  LucideX
} from "lucide-react";
import axios from "axios";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";

const apiUrl = process.env.REACT_APP_API_URL;

const SuggestionButton = ({ text, onClick }) => (
  <button 
    onClick={() => onClick(text)}
    className="whitespace-nowrap px-4 py-2 text-xs w-fit font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-200"
  >
    {text}
  </button>
);

const EmailCard = ({ chat, index, teams, copiedIndex, onCopy, onSend }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [subject, setSubject] = useState(chat.subject);
  const [body, setBody] = useState(chat.body);
  const [isEditingBody, setIsEditingBody] = useState(false);

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '40px',
      fontSize: '13px',
      backgroundColor: state.isFocused ? '#ffffff' : '#f9fafb', // gray-50
      borderColor: state.isFocused ? '#e5e7eb' : 'transparent',
      boxShadow: state.isFocused ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' : 'none',
      '&:hover': { borderColor: '#e5e7eb' },
      borderRadius: '0.75rem',
      paddingLeft: '4px',
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
    singleValue: (base) => ({
      ...base,
      color: '#111827', // gray-900
      fontWeight: 500
    }),
    placeholder: (base) => ({
      ...base,
      color: '#6b7280', // gray-500
    })
  };

  return (
    <div className="w-full max-w-[95%] mx-auto my-4 bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/60 dark:hover:shadow-none">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-white dark:bg-black">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-gray-900 to-black dark:from-white dark:to-gray-200 rounded-xl shadow-lg shadow-gray-200 dark:shadow-none">
             <LucideMessageSquare size={14} className="text-white dark:text-black"/>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">Email Generator</h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">AI-Drafted Content</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onCopy(body, index)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200 active:scale-95"
          >
            {copiedIndex === index ? <LucideCheck size={12} className="text-green-500"/> : <LucideCopy size={12}/>}
            {copiedIndex === index ? "Copied" : "Copy"}
          </button>
          <button
            onClick={() => onSend({ subject, body }, index, selectedTeam)}
            disabled={!selectedTeam}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 active:scale-95 ${
              selectedTeam
                ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 shadow-md shadow-gray-200 dark:shadow-none'
                : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            <LucideSend size={12} />
            Send
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5 bg-white dark:bg-black">
        {/* Recipient */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">To</label>
          <Select
            options={teams}
            value={selectedTeam}
            onChange={setSelectedTeam}
            placeholder="Select a recipient..."
            styles={customSelectStyles}
            className="text-sm"
            classNamePrefix="react-select"
          />
        </div>

        {/* Subject */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject..."
            className="w-full text-sm font-medium bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/20 focus:bg-white dark:focus:bg-black rounded-xl px-4 py-2.5 focus:outline-none focus:shadow-sm focus:shadow-gray-100 dark:focus:shadow-none text-gray-900 dark:text-white transition-all duration-200 placeholder:text-gray-400"
          />
        </div>

        {/* Body */}
        <div className="space-y-1.5 ">
          <div className="flex items-center justify-between ml-1">
            <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Message Body</label>
            <button
              onClick={() => setIsEditingBody(!isEditingBody)}
              className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-md"
            >
              {isEditingBody ? <><LucideEye size={10}/> Preview Mode</> : <><LucideEdit size={10}/> Edit Mode</>}
            </button>
          </div>
          
          <div className="relative group">
            {isEditingBody ? (
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full h-72 text-sm bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/20 focus:bg-white dark:focus:bg-black rounded-xl px-4 py-4 focus:outline-none focus:shadow-sm focus:shadow-gray-100 dark:focus:shadow-none text-gray-900 dark:text-white font-mono resize-none leading-relaxed transition-all duration-200"
              />
            ) : (
              <div 
                className="w-full h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10 text-sm bg-gray-50 dark:bg-white/5 border border-transparent rounded-xl px-4 py-4 text-gray-900 dark:text-white leading-relaxed prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(body) }}
              />
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export const FeedbackAssistant = ({ 
  userTeams, 
  selectedData, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  isChatExpanded, 
  setIsChatExpanded 
}) => {
  const [aiResponse, setAiResponse] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your Feedback Assistant. How can I help you analyze your data today?"
    },
  ]);
  
  const [userPrompt, setUserPrompt] = useState("");
  const [promptSuggestion, setPromptSuggestion] = useState({
    sug1: '',
    sug2: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const chatRefContainer = useRef(null);
  const messagesEndRef = useRef(null);

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
    }, 30); 

    return () => clearInterval(interval);
  }, [aiResponse]); 

  useEffect(() => {
    setTimeout(scrollToBottomContainer, 100);
  }, [displayedMessages]);

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

  return (
    <>
      {/* Floating Chat Toggle Button */}
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
           className="absolute lg:bottom-6 bottom-24 right-6 p-4 bg-black text-white dark:bg-white dark:text-black rounded-full shadow-xl hover:shadow-2xl transition-all ease-in-out duration-500 z-50 flex items-center gap-0 hover:gap-2 group overflow-hidden"
         >
           <LucideBot size={24} className="group-hover:rotate-12 transition-all ease-in-out duration-300"/>
           <span className="font-medium whitespace-nowrap max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all ease-in-out duration-300">Ask AI</span>
         </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Sidebar */}
      <div 
        className={` overflow-y-scroll scrollbar-hide
          fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] lg:w-[400px] 
          bg-white dark:bg-black border-l border-gray-300 dark:border-white/10 shadow-2xl lg:shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen || (isChatExpanded && window.innerWidth >= 1024) ? 'translate-x-0' : 'translate-x-full'}
          lg:relative lg:flex flex-col
          ${!isChatExpanded && 'lg:hidden'}
        `}
      >
        {/* Chat Header */}
        <div className="flex-shrink-0 h-16 border-b border-gray-300 dark:border-white/10 flex items-center justify-between bg-white dark:bg-black px-6 shadow-sm z-10">
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
                    ? "bg-white dark:bg-black border border-gray-300 dark:border-white/10 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm" 
                    : "bg-black dark:bg-white text-white dark:text-black rounded-tr-none shadow-md"
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
                  teams={userTeams}
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
                text={promptSuggestion.sug1 || `Analyze feedback for ${userTeams[0]?.label || 'my team'}`} 
                onClick={setUserPrompt} 
              />
            </div>
          )}

          {/* Input Area */}
          <div className="relative group ">
            <div className="relative bg-white dark:bg-black rounded-2xl border border-gray-300 dark:border-white/10 focus-within:border-black dark:focus-within:border-white transition-all duration-200 shadow-sm hover:shadow-md focus-within:shadow-lg">
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!isLoading) handleInput();
                  }
                }}
                placeholder="Ask anything..."
                className="w-full scrollbar-hide p-3 bg-transparent border-none focus:ring-0 focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 min-h-[52px] max-h-[120px] resize-none py-4 pl-4 pr-12 rounded-2xl"
                rows={1}
              />
              <button
                onClick={handleInput}
                disabled={!userPrompt.trim() || isLoading}
                className={`absolute right-2 bottom-2 p-2 rounded-xl transition-all duration-200 ${
                  userPrompt.trim() && !isLoading
                    ? "bg-black dark:bg-white text-white dark:text-black hover:scale-105 shadow-md" 
                    : "bg-gray-500 dark:bg-white/5 text-gray-300 dark:text-white/20 cursor-not-allowed"
                }`}
              >
                <LucideArrowUp size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
