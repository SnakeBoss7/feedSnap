"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

export const Selectors = ({ websites, selectedWebsite, onWebsiteChange, selectedTimeframe, onTimeframeChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const timeframes = [
    { label: "7 Days", value: 7 },
    { label: "30 Days", value: 30 },
    { label: "All Time", value: "all" },
  ]

  return (
    <div className="flex justify-between lg:flex-row flex-col items-start  gap-6 w-full">
      {/* Website Selector */}
      <div className="w-full lg:w-64 relative" ref={dropdownRef}>
        <label className="block text-xs font-semibold text-gray-500 dark:text-dark-text-muted uppercase tracking-wider mb-2">
          Website
        </label>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2.5 text-left bg-white dark:bg-dark-bg-tertiary border border-gray-200 dark:border-dark-border-subtle rounded-xl shadow-sm hover:border-purple-400 dark:hover:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 flex items-center justify-between group"
        >
          <span className="text-gray-900 dark:text-dark-text-primary font-medium truncate">
            {selectedWebsite === "all" ? "All Websites" : selectedWebsite}
          </span>
          <ChevronDown 
            size={16} 
            className={`text-gray-400 dark:text-gray-500 transition-transform duration-200 group-hover:text-purple-500 ${isOpen ? "rotate-180" : ""}`} 
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-dark-bg-tertiary border border-gray-100 dark:border-dark-border-subtle rounded-xl shadow-xl max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
            <button
              onClick={() => {
                onWebsiteChange("all")
                setIsOpen(false)
              }}
              className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-dark-bg-hover transition-colors ${
                selectedWebsite === "all" 
                  ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium" 
                  : "text-gray-700 dark:text-dark-text-secondary"
              }`}
            >
              All Websites
            </button>
            {websites.map((website) => (
              <button
                key={website}
                onClick={() => {
                  onWebsiteChange(website)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-dark-bg-hover transition-colors border-t border-gray-50 dark:border-dark-border-subtle ${
                  selectedWebsite === website 
                    ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium" 
                    : "text-gray-700 dark:text-dark-text-secondary"
                }`}
              >
                {website}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Timeframe Selector */}
      <div className="w-full lg:w-auto">
        <label className="block text-xs font-semibold text-gray-500 dark:text-dark-text-muted uppercase tracking-wider mb-2">
          Timeframe
        </label>
        <div className="flex justify-between gap-2 bg-gray-100 dark:bg-dark-bg-tertiary p-1 rounded-xl border border-gray-200 dark:border-dark-border-subtle">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => onTimeframeChange(tf.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedTimeframe === tf.value
                  ? "bg-white dark:bg-dark-bg-secondary text-purple-700 dark:text-purple-300 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                  : "text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary hover:bg-gray-200/50 dark:hover:bg-dark-bg-hover"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}