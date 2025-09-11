import React, { useState, useEffect } from 'react';
import { Lightbulb, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

const tips = [
  "Place your script just before the closing </body> tag for best performance",
  "Test your widget on different devices and browsers before going live",
  "Use contrasting colors to make your widget stand out on your website",
  "Keep your widget text short and action-oriented for better conversions",
  "Consider your users' journey - place widgets where they're most likely to need help",
  "Monitor widget performance and adjust positioning based on user behavior",
  "Use A/B testing to optimize your widget's color and text for better results",
  "Ensure your widget doesn't conflict with other elements on your page"
];

export default function QuickTips() {
  const [currentTip, setCurrentTip] = useState(0);

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % tips.length);
  };

  useEffect(() => {
    const interval = setInterval(nextTip, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r h-full from-yellow-50 to-orange-50 border rounded-xl w-[60%] border-yellow-200 shadow-xl">
           <div className="p-2 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            <span>Quick Tips</span>
          </div>
          <div className="bg-yellow-100 text-yellow-800 rounded-xl p-1 border-yellow-200">
            Pro
          </div>
        </div>
      </div>
      <div className="p-6 pt-0">
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            {tips[currentTip]}
          </p>
          <div className="flex items-center justify-between gap-3">
            <div className="flex space-x-1">
              {tips.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentTip ? 'bg-yellow-500' : 'bg-yellow-200'
                  }`}
                />
              ))}
            </div>
            <button
              variant="ghost"
              size="sm"
              onClick={nextTip}
              className="text-yellow-700 hover:text-yellow-800 hover:bg-yellow-100 p-1 rounded-xl flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Next Tip
           
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}