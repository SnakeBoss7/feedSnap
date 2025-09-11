import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "../ui/card";
import { Quote, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

const quotes = [
  {
    text: "Code is like humor. When you have to explain it, it's bad.",
    author: "Cory House"
  },
  {
    text: "First, solve the problem. Then, write the code.",
    author: "John Johnson"
  },
  {
    text: "Experience is the name everyone gives to their mistakes.",
    author: "Oscar Wilde"
  },
  {
    text: "In order to be irreplaceable, one must always be different.",
    author: "Coco Chanel"
  },
  {
    text: "The best error message is the one that never shows up.",
    author: "Thomas Fuchs"
  }
];

export default function MotivationalQuote() {
  const [currentQuote, setCurrentQuote] = useState(0);

  const nextQuote = () => {
    setCurrentQuote((prev) => (prev + 1) % quotes.length);
  };

  useEffect(() => {
    const interval = setInterval(nextQuote, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r  w-[40%] h-full from-indigo-50 rounded-lg to-purple-50 border border-indigo-200 shadow-xl">
      <div className="p-2 pt-2">
        <div className="text-center space-y-4">
          <Quote className="w-8 h-8 text-indigo-500 mx-auto" />
          <blockquote className="text-gray-700 italic leading-relaxed">
            "{quotes[currentQuote].text}"
          </blockquote>
          <div className="flex items-center justify-between">
            <cite className="text-sm text-indigo-600 font-medium">
              — {quotes[currentQuote].author}
            </cite>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextQuote}
              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}