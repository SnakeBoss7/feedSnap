"use client"

import { useState } from "react"

export const Selectors = ({ websites, selectedWebsite, onWebsiteChange, selectedTimeframe, onTimeframeChange }) => {
  const [isOpen, setIsOpen] = useState(false)

  const timeframes = [
    { label: "7 Days", value: 7 },
    { label: "30 Days", value: 30 },
    { label: "All Time", value: "all" },
  ]

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between bg-white p-5 border border-blue-100 rounded-lg gap-6 mb-4 mt-4 md:mt-14 items-start sm:items-end">
      {/* Website Selector */}
      <div className="w-full sm:w-64">
        <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-900 font-medium truncate">
                {selectedWebsite === "all" ? "All Websites" : selectedWebsite}
              </span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {isOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsOpen(false)}
              />
              
              <div className="absolute z-20 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                <button
                  onClick={() => {
                    onWebsiteChange("all")
                    setIsOpen(false)
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors first:rounded-t-lg ${
                    selectedWebsite === "all" ? "bg-purple-50 text-purple-700 font-medium" : "text-gray-900"
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
                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors border-t border-gray-200 last:rounded-b-lg ${
                      selectedWebsite === website ? "bg-purple-50 text-purple-700 font-medium" : "text-gray-900"
                    }`}
                  >
                    {website}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="w-full sm:w-auto">
        <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
        <div className="flex flex-wrap gap-2">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => onTimeframeChange(tf.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTimeframe === tf.value
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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