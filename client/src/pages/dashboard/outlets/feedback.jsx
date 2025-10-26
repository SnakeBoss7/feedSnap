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
} from "lucide-react";
import axios from "axios";
import { SimpleHeader } from "../../../components/header/header";
import { FilterTable } from "../../../components/table/filterTable";
import Select from "react-select";
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
      content: "Hello! how can I help you today"
    }
  ]);
  
  const [state, dispatch] = useReducer(dashboardReducer, getCachedData());
  const [userPrompt, setUserPrompt] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [promptSuggestion, setPromptSuggestion] = useState({
    sug1:'',
    sug2:''
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
      container.scrollTop = container.scrollHeight;
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
      
      setTimeout(scrollToBottomContainer, 50);

      i++;
      if (i >= words.length) {
        clearInterval(interval);
        setTimeout(scrollToBottomContainer, 100);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [aiResponse]);

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

    if(state.isLoading) {
      fetchData();
    }
  }, [state.isLoading]);

  const handleInput = async () => {
    if (userPrompt.trim() === "") return;

    setAiResponse((prev) => [...prev, { role: "user", content: userPrompt }]);
    setUserPrompt("");
    setIsLoading(true);
    console.log(state?.data);

    setTimeout(scrollToBottomContainer, 100);

    const optimizedData = state?.data?.map(item => ({
      title: item.title,
      desc: item.description?.substring(0, 100),
      url: item.webUrl?.replace('http://localhost:3000', 'localhost')
    })) || [];

    try {
      let aiRes = await axios.post(`${apiUrl}/api/llm/askAI`, {
        aiResponse,
        userPrompt,
        feedbackData: optimizedData
      },{withCredentials:true});
      
      console.log(aiRes.data?.response);
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
  if (!selectedTeam) {
    alert('Please select a team to send the email');
    return;
  }

  try {
    // Call your API to send email
    let res = await axios.post(`${apiUrl}/api/mail/send`, {
      to: selectedTeam.value,
      subject: emailData.subject,
      body: emailData.body
    }, { withCredentials: true });
    console.log(res);
    
    // Remove emailPrep from BOTH aiResponse and displayedMessages
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

    // Also update displayedMessages immediately
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
      <SimpleHeader color="#2b5fceff" />

      <div className="flex flex-row overflow-y-auto scrollbar-hide max-h-screen">
        <div className="flex flex-col w-full lg:w-[75%]">
          <FilterTable data={state?.data}/>
        <div className={`absolute bottom-[70px] right-[30px] p-3 bg-[#2b5fceff] rounded-full shadow-lg cursor-pointer z-50 lg:hidden ${isSidebarOpen?'hidden':'block'} `} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <LucideBot size={26} className="text-white"/> </div>
        </div>

        <div
  className={` ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'} 
    transition-all ease-in-out duration-300 lg:w-[25%] bg-white w-full 
    fixed lg:relative top-0 right-0 bottom-0  overflow-hidden z-50`} 
  style={{
    borderLeft: '1px solid #eee',
    boxShadow: '-3px 0 15px rgba(0, 0, 0, 0.1), -1px 0 6px rgba(0, 0, 0, 0.06)'
  }}
>
  {/* Main container - use flex column with fixed height */}
  <div className="h-full w-full flex flex-col">
    
    {/* Header - fixed height */}
    <div className="flex-shrink-0 p-5 border-b border-gray-200">
      <div className="flex justify-between items-start">
        <div >
          <h1 className="text-2xl mb-1 tracking-tight text-black  flex items-center gap-2">
            <LucideBot size={30} /> Feedback Assistant
          </h1>
          <p className="text-sm text-gray-500">Get insights and help with your feedback data</p>
        </div>
        <div onClick={() => setIsSidebarOpen(prev => !prev)} className="mt-2 lg:hidden cursor-pointer">
          <LucidePanelRightClose size={25}/>
        </div>
      </div>
    </div>
    
    {/* Chat messages - scrollable area */}
    <div 
      ref={chatRefContainer}
      className="flex-1 overflow-y-auto scrollbar-hide px-5"
    >
      {displayedMessages.map((chat, idx) => {
        if (chat.role === "assistant" || chat.role === "user") {
          return (
            <div
              key={idx}
              className={`w-full my-2 flex text-md ${
                chat.role === "assistant" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
                  chat.role === "assistant"
                    ? "text-black bg-gray-100"
                    : "bg-primary5 text-white rounded-br-md"
                }`}
              >
                <div 
                  className="whitespace-pre-wrap text-sm break-words text-left"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(chat.content) }}
                />
              </div>
            </div>
          );
        } else if (chat.role === "emailPrep") {
          return (
            <EmailCard
              key={idx}
              chat={chat}
              index={idx}
              teams={state.userTeams}
              copiedIndex={copiedIndex}
              onCopy={handleCopyEmail}
              onSend={handleSendEmail}
            />
          );
        } else if (chat.role === "emailSent") {
          return (
            <div key={idx} className="w-full my-2 flex justify-center items-center gap-2">
              <LucideMailCheck className="text-sm text-green-500" size={20} />
              <div className="border italic text-gray-700 text-sm py-2 rounded-lg">
                {chat.content}
              </div>
            </div>
          );
        }
        return null;
      })}
      
      {isLoading && (
        <div className="w-full my-2 flex justify-start">
          <div className="max-w-[70%] p-3 rounded-2xl shadow-sm text-black bg-gray-100">
            <p className="text-gray-500">Typing...</p>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
    
    {/* Suggestions - fixed height */}
    <div className="flex-shrink-0 px-5 py-2 border-t border-gray-100">
      <div className="text-[12px] flex flex-col gap-2">
        <button 
          onClick={(e) => setUserPrompt(e.target.innerText)} 
          className="border border-gray-400 text-gray-600 hover:scale-[1.01] cursor-pointer transition-all ease-in-out duration-300 p-1 w-fit rounded-lg"
        >
          {promptSuggestion.sug1 ? promptSuggestion.sug1 : `Make a report for my ${state?.userTeams[0]?.label} team`}
        </button>

        <button 
          onClick={(e) => setUserPrompt(e.target.innerText)} 
          className="border border-gray-400 text-gray-600 hover:scale-[1.01] cursor-pointer transition-all ease-in-out duration-300 p-1 w-fit rounded-lg"
        >
          {promptSuggestion.sug2 ? promptSuggestion.sug2 : `How's the user response?`}
        </button>
      </div>
    </div>
    
    {/* Input box - fixed at bottom */}
    <div className="flex-shrink-0 px-5 pb-5 pt-3 border-t border-gray-200">
      <div className="w-full flex flex-col py-3 px-2 border border-black rounded-2xl">
        <div className="flex w-full items-end">
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleInput();
              }
            }}
            placeholder="Ask here"
            className="w-full border-0 min-h-[60px] overflow-y-auto scrollbar-hide outline-0 bg-transparent text-black resize-none rounded-md"
            disabled={isLoading}
            rows={1}
          />

          <LucideArrowUp 
            onClick={handleInput}
            className={`ml-2 hover:mb-1 hover:scale-[1.1] transition-all ease-in-out duration-300 flex-shrink-0 ${
              isLoading ? "cursor-not-allowed text-gray-400" : "cursor-pointer text-black"
            }`}
          />
        </div>
      </div>
          <div className="lg:hidden h-10"></div>
    </div>
  </div>
</div>
      </div>
    </div>
  );
};

// Email Card Component
// Email Card Component
// Replace the EmailCard component with this:
const EmailCard = ({ chat, index, teams, copiedIndex, onCopy, onSend }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [subject, setSubject] = useState(chat.subject);
  const [body, setBody] = useState(chat.body);
  const [isEditingBody, setIsEditingBody] = useState(false);

  const handleBodyChange = (e) => {
    setBody(e.target.value);
  };

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '38px',
      fontSize: '14px',
      borderColor: state.isFocused ? '#2563EB' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px #2563EB' : 'none',
      '&:hover': {
        borderColor: '#2563EB'
      },
      borderRadius: '7px',
    }),
    option: (base, state) => ({
      ...base,
       borderRadius: '7px',
      backgroundColor: state.isSelected 
        ? '#2563EB' 
        : state.isFocused 
        ? '#f3e8ff' 
        : 'white',
      color: state.isSelected ? 'white' : '#1f2937',
      cursor: 'pointer',
      
      fontSize: '14px',
      padding: '10px 12px',
      '&:active': {
        backgroundColor: '#91b2f8ff'
      }
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '7px',
       border: '1px solid #2563EB',
      zIndex: 9999,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: '1px solid #e5e7eb'
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999
    }),
    placeholder: (base) => ({
      ...base,
      color: '#9ca3af',
      fontSize: '14px'
    }),
    singleValue: (base) => ({
      ...base,
      color: '#1f2937',
      fontSize: '14px'
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: state.isFocused ? '#2563EB' : '#6b7280',
      '&:hover': {
        color: '#2563EB'
      }
    }),
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: '#e5e7eb'
    })
  };

  return (
    <div className="w-full my-3 bg-white border border-gray-200 rounded-lg shadow-md overflow-visible">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">📧 Email Draft</h3>
          <div className="flex gap-2">
            <button
              onClick={() => onCopy(body, index)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="Copy to clipboard"
            >
              {copiedIndex === index ? (
                <>
                  <LucideCheck size={14} className="text-green-600" />
                  <span className="text-green-600">Copied</span>
                </>
              ) : (
                <>
                  <LucideCopy size={14} />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              onClick={() => onSend({ subject, body }, index, selectedTeam)}
              disabled={!selectedTeam}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition-all ${
                selectedTeam
                  ? 'bg-primary5 text-white hover:bg-purple-700 hover:shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <LucideSend size={14} />
              Send
            </button>
          </div>
        </div>
      </div>

      {/* To Field */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <p className="text-xs text-gray-500 mb-2 font-medium">To:</p>
        <Select
          options={teams}
          value={selectedTeam}
          onChange={setSelectedTeam}
          placeholder="Select recipient team..."
          isDisabled={teams.length === 0}
          styles={customSelectStyles}
          menuPortalTarget={document.body}
          menuPosition="fixed"
          noOptionsMessage={() => "No teams available"}
        />
      </div>

      {/* Subject */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <p className="text-xs text-gray-500 mb-2 font-medium">Subject:</p>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full text-sm font-medium text-gray-800 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
          placeholder="Enter email subject..."
        />
      </div>

      {/* Body */}
      <div className="px-4 py-3 bg-white">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-500 font-medium">Body:</p>
          <button
            onClick={() => setIsEditingBody(!isEditingBody)}
            className="text-xs text-primary5 hover:text-primary5 font-semibold px-2 flex items-center gap-2 py-1 hover:bg-blue-50 rounded transition-all"
          >
            {isEditingBody ? <><LucideEye size={12}/>Preview</> : <><LucideEdit size={12}/>Edit</> }
          </button>
        </div>
        
        {isEditingBody ? (
          <textarea
            value={body}
            onChange={handleBodyChange}
            className="w-full h-[280px] text-sm text-gray-700 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-primary5 focus:ring-2 focus:ring-blue-200 transition-all resize-none font-mono"
            placeholder="Enter email body..."
          />
        ) : (
          <div 
            className="text-sm text-gray-700 leading-relaxed email-body max-h-[280px] overflow-y-auto scrollbar-thin border border-gray-200 rounded-md p-3 bg-gray-50"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(body) }}
          />
        )}
      </div>
    </div>
  );
};
// Add this CSS to your global styles or style tag
const style = document.createElement('style');
style.textContent = `
  .email-body p {
    margin-bottom: 0.75rem;
  }
  .email-body ul {
    margin: 0.75rem 0;
    padding-left: 1.5rem;
  }
  .email-body li {
    margin-bottom: 0.5rem;
  }
  .email-body strong {
    font-weight: 600;
    color: #1f2937;
  }
  .email-body a {
    color: #2563EB;
    text-decoration: underline;
  }
  .email-body div[style*="border-top"] {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb !important;
  }
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;
document.head.appendChild(style);   