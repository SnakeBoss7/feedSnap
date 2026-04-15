import React, { useState, useEffect, useRef, useCallback } from "react";
import DOMPurify from 'dompurify';
import {
  LucideArrowUp,
  LucideBot,
  LucideCopy,
  LucideCheck,
  LucideSend,
  LucideMailCheck,
  LucideEdit,
  LucideEye,
  LucideMinimize2,
  LucideChevronDown,
  LucideUser,
  LucideTrash2,
  LucideFilter,
  LucideDatabase,
  LucideClock
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const apiUrl = process.env.REACT_APP_API_URL;

// Custom Dropdown Component with Tailwind dark mode support
const CustomDropdown = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-medium bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/20 focus:border-gray-200 dark:focus:border-white/20 focus:bg-white dark:focus:bg-black rounded-xl transition-all duration-200 outline-none"
      >
        <span className={value ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}>
          {value ? value.label : placeholder}
        </span>
        <LucideChevronDown
          size={16}
          className={`text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-[100] w-full mt-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="max-h-48 overflow-y-auto p-1 space-y-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm rounded-lg transition-colors ${value?.value === option.value
                    ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                >
                  <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                    <LucideUser size={12} className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <span className="truncate">{option.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

const EmailCard = ({ chat, index, teams, copiedIndex, onCopy, onSend }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [subject, setSubject] = useState(chat.subject);
  const [body, setBody] = useState(chat.body);
  const [isEditingBody, setIsEditingBody] = useState(false);


  return (
    <div className="w-full max-w-[95%] mx-auto my-4 bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/60 dark:hover:shadow-none">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-white dark:bg-black">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-gray-900 to-black dark:from-white dark:to-gray-200 rounded-md shadow-lg shadow-gray-200 dark:shadow-none">
            <LucideMailCheck size={14} className="text-white dark:text-black" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">Email</h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">AI-Drafted Content</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onCopy(body, index)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200 active:scale-95"
          >
            {copiedIndex === index ? <LucideCheck size={12} className="text-green-500" /> : <LucideCopy size={12} />}
            {copiedIndex === index ? "Copied" : "Copy"}
          </button>

        </div>
      </div>

      <div className="p-5 space-y-5 bg-white dark:bg-black">
        {/* Recipient */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">To</label>
          <CustomDropdown
            options={teams}
            value={selectedTeam}
            onChange={setSelectedTeam}
            placeholder="Select a recipient..."
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
              {isEditingBody ? <><LucideEye size={10} /> Preview Mode</> : <><LucideEdit size={10} /> Edit Mode</>}
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
        <div className="flex justify-end">
          <button
            onClick={() => onSend({ subject, body }, index, selectedTeam)}
            disabled={!selectedTeam}
            className={`flex items-center align-right gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 active:scale-95 ${selectedTeam
              ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 shadow-md shadow-gray-200 dark:shadow-none'
              : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed'
              }`}
          >
            <LucideSend size={12} />
            Send
          </button>
        </div>

      </div>
    </div>
  );
};

const CHAT_STORAGE_KEY = 'feedsnap_chat_history';
const SUGGESTIONS_STORAGE_KEY = 'feedsnap_chat_suggestions';

const DEFAULT_MESSAGE = {
  role: "assistant",
  content: "Hello! I'm your Feedback Assistant. How can I help you analyze your data today?"
};

const loadFromStorage = (key, fallback) => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed;
    }
  } catch (err) {
    console.warn(`Failed to load ${key} from localStorage:`, err);
  }
  return fallback;
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to save ${key} to localStorage:`, err);
  }
};

export const FeedbackAssistant = ({
  userTeams,
  selectedData,
  isSidebarOpen,
  setIsSidebarOpen,
  isChatExpanded,
  setIsChatExpanded
}) => {
  const [aiResponse, setAiResponse] = useState(() =>
    loadFromStorage(CHAT_STORAGE_KEY, [DEFAULT_MESSAGE])
  );

  const [userPrompt, setUserPrompt] = useState("");
  const [promptSuggestion, setPromptSuggestion] = useState(() =>
    loadFromStorage(SUGGESTIONS_STORAGE_KEY, { sug1: '', sug2: '' })
  );
  const [isLoading, setIsLoading] = useState(false);
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  // Initialize to cover all messages already loaded from storage (they've "already typed")
  const [typingCompletedUpTo, setTypingCompletedUpTo] = useState(() => {
    const stored = loadFromStorage(CHAT_STORAGE_KEY, [DEFAULT_MESSAGE]);
    return stored.length - 1;
  });
  const chatRefContainer = useRef(null);
  const messagesEndRef = useRef(null);

  // Persist chat history to localStorage whenever it changes
  useEffect(() => {
    saveToStorage(CHAT_STORAGE_KEY, aiResponse);
  }, [aiResponse]);

  // Persist prompt suggestions to localStorage whenever they change
  useEffect(() => {
    saveToStorage(SUGGESTIONS_STORAGE_KEY, promptSuggestion);
  }, [promptSuggestion]);

  // Clear chat handler
  const handleClearChat = useCallback(() => {
    setAiResponse([DEFAULT_MESSAGE]);
    setDisplayedMessages([DEFAULT_MESSAGE]);
    setPromptSuggestion({ sug1: '', sug2: '' });
    localStorage.removeItem(CHAT_STORAGE_KEY);
    localStorage.removeItem(SUGGESTIONS_STORAGE_KEY);
  }, []);

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
    const lastIdx = aiResponse.length - 1;

    if (lastMessage.role !== "assistant") {
      setDisplayedMessages(aiResponse);
      // Non-assistant message: mark all previous as done
      setTypingCompletedUpTo(lastIdx);
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
        tempMessages.push({ role: "assistant", content: "", meta: lastMessage.meta });
      }

      tempMessages[tempMessages.length - 1].content +=
        (i === 0 ? "" : " ") + words[i];
      setDisplayedMessages([...tempMessages]);
      scrollToBottomContainer();

      i++;
      if (i >= words.length) {
        clearInterval(interval);
        // Typing done — sync full message and mark this index complete
        setDisplayedMessages([...aiResponse]);
        setTypingCompletedUpTo(lastIdx);
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

    // Snapshot the current history BEFORE appending the new user message
    const historySnapshot = aiResponse;

    setAiResponse((prev) => [...prev, { role: "user", content: userPrompt }]);
    setUserPrompt("");
    setIsLoading(true);

    setTimeout(scrollToBottomContainer, 100);

    try {
      // Build a clean, trimmed history for the server:
      // - exclude emailPrep / emailSent UI-only messages
      // - strip internal meta fields (they're large and not needed by the AI)
      // - cap at last 10 messages to prevent token overflow
      const MAX_HISTORY = 10;
      const cleanHistory = historySnapshot
        .filter((c) => c.role === "user" || c.role === "assistant")
        .map((c) => ({ role: c.role, content: String(c.content || "") }))
        .slice(-MAX_HISTORY);

      const aiRes = await axios.post(`${apiUrl}/api/llm/askAI`, {
        aiResponse: cleanHistory,
        userPrompt,
        feedbackData: selectedData
      }, { withCredentials: true });

      const meta = aiRes.data?.meta || null;

      setAiResponse((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiRes.data?.response.response,
          meta,
        },
      ]);

      if (aiRes.data?.response.reports_or_emails?.mail) {
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
      console.error("[FeedbackAssistant] askAI error:", error);
      console.error("[FeedbackAssistant] Error response status:", error.response?.status);
      console.error("[FeedbackAssistant] Error response data:", JSON.stringify(error.response?.data, null, 2));
      if (error.response?.data?.debug) {
        console.error("[FeedbackAssistant] Server debug info:", error.response.data.debug);
      }
      const serverMsg = error.response?.data?.response?.response || "Sorry, I encountered an error. Please try again.";
      setAiResponse((prev) => [
        ...prev,
        { role: "assistant", content: serverMsg },
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
      await axios.post(`${apiUrl}/api/mail/send`, {
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
      {/* Collapsed State - Floating Toggle Button (right edge, vertically centered) */}
      <AnimatePresence>
        {!isChatExpanded && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-30 pointer-events-none"
          >
            <button
              onClick={() => {
                setIsSidebarOpen(true);
                setIsChatExpanded(true);
              }}
              className="pointer-events-auto flex items-center gap-2 pl-3 pr-2.5 py-2.5 bg-gray-900/90 text-white dark:bg-white/90 dark:text-gray-900 rounded-l-2xl shadow-lg shadow-black/10 dark:shadow-white/10 hover:shadow-xl hover:pl-4 transition-all ease-out duration-300 active:scale-95 backdrop-blur-sm border border-r-0 border-white/10 dark:border-black/10"
            >
              <LucideBot size={18} className="flex-shrink-0" />
              <span className="text-xs font-semibold tracking-wide">AI</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded State - Chat Panel */}
      <AnimatePresence>
        {isChatExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed lg:absolute inset-0 lg:inset-auto lg:bottom-4 lg:right-4 z-50 w-full lg:w-[400px] h-full lg:h-[calc(100%-2rem)] lg:max-h-[750px] bg-white dark:bg-black border-0 lg:border border-gray-200 dark:border-white/10 lg:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Chat Header */}
            <div className="flex-shrink-0 h-14 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-white dark:bg-black px-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center">
                  <LucideBot size={16} className="text-white dark:text-black" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white text-sm">Co-Pilot</h2>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearChat}
                  title="Clear chat"
                  className="p-2 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-xl text-gray-400 dark:text-gray-500 transition-colors"
                >
                  <LucideTrash2 size={16} />
                </button>
                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    setIsChatExpanded(false);
                  }}
                  className="p-2 hover:bg-gray-100 hover:text-black dark:hover:bg-white/10 dark:hover:text-white rounded-xl text-gray-500 dark:text-gray-400 transition-colors"
                >
                  <LucideMinimize2 size={18} />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div
              ref={chatRefContainer}
              className="flex-1 overflow-y-auto scrollbar-hide p-5 space-y-6 bg-white dark:bg-black"
            >
              {displayedMessages.map((chat, idx) => (
                <div key={idx} className={`flex w-full ${chat.role === "assistant" ? "justify-start" : chat.role === "user" ? "justify-end" : "justify-center"}`}>


                  {(chat.role === "assistant" || chat.role === "user") && (
                    <div className="max-w-[85%]">
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${chat.role === "assistant"
                        ? "bg-white dark:bg-black border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 rounded-tl-none"
                        : "bg-black dark:bg-white text-white dark:text-black rounded-tr-none shadow-md"
                        }`}>
                        <div
                          className="whitespace-pre-wrap break-words"
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(chat.content) }}
                        />
                      </div>
                      {/* AI meta: badges + time — show only after this message's typing is done */}
                      {chat.role === "assistant" && idx > 0 && chat.meta && idx <= typingCompletedUpTo && (
                        <div className="flex items-center gap-1.5 mt-1.5 ml-1 flex-wrap opacity-0 animate-[fadeIn_0.4s_ease-out_forwards]">
                          {/* Data Mode Badge */}
                          {chat.meta.mode === "filtered" ? (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/40 rounded-full" title={chat.meta.filterSummary}>
                              <LucideFilter size={10} className="text-violet-500 dark:text-violet-400" />
                              <span className="text-[10px] font-medium text-violet-600 dark:text-violet-400">Filtered</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-full">
                              <LucideDatabase size={10} className="text-blue-500 dark:text-blue-400" />
                              <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">Full Analysis</span>
                            </div>
                          )}

                          {/* Response Time */}
                          {chat.meta.responseTime && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full">
                              <LucideClock size={9} className="text-gray-400 dark:text-gray-500" />
                              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                                {(chat.meta.responseTime / 1000).toFixed(1)}s
                              </span>
                              {chat.meta.tokens && (
                                <span className="text-[9px] text-gray-400 dark:text-gray-500">
                                  · {chat.meta.tokens.total} tokens
                                </span>
                              )}
                            </div>
                          )}

                          {/* Filter Summary */}
                          {chat.meta.mode === "filtered" && chat.meta.filterSummary && (
                            <span className="text-[9px] text-gray-400 dark:text-gray-500 truncate max-w-[180px]" title={chat.meta.filterSummary}>
                              {chat.meta.filterSummary}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Copy — only for USER messages */}
                      {chat.role === "user" && (
                        <div className="flex justify-end mt-1 mr-1">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(chat.content).then(() => {
                                setCopiedIndex(idx);
                                setTimeout(() => setCopiedIndex(null), 2000);
                              });
                            }}
                            className="flex items-center gap-1 text-[10px] font-medium text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                            title="Copy prompt"
                          >
                            {copiedIndex === idx
                              ? <LucideCheck size={10} className="text-green-500" />
                              : <LucideCopy size={10} />}
                            {copiedIndex === idx ? "Copied" : "Copy"}
                          </button>
                        </div>
                      )}
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
            <div className="flex-shrink-0 bg-white dark:bg-black border-t border-gray-200 dark:border-white/10 p-4 space-y-3">
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
              <div className="relative">
                <div className="relative bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-white/10 focus-within:border-black dark:focus-within:border-white transition-all duration-200 shadow-sm">
                  <textarea
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (!isLoading) handleInput();
                      }
                    }}
                    placeholder="Ask Co-Pilot anything..."
                    className="w-full scrollbar-hide bg-transparent border-none focus:ring-0 focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 min-h-[44px] max-h-[100px] resize-none py-3 pl-4 pr-12 rounded-xl"
                    rows={1}
                  />
                  <button
                    onClick={handleInput}
                    disabled={!userPrompt.trim() || isLoading}
                    className={`absolute right-2 bottom-2 p-2 rounded-full transition-all duration-200 ${userPrompt.trim() && !isLoading
                      ? "bg-black dark:bg-white text-white dark:text-black hover:scale-105"
                      : "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/20 cursor-not-allowed"
                      }`}
                  >
                    <LucideArrowUp size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
