import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

// Define a comprehensive list of engaging loading messages
const defaultLoadingMessages = [
  'Processing your request...',
  'Analyzing your flight trajectory and route...',
  'Calculating precise sun angles for optimal viewing...',
  'Identifying spectacular landmarks along your path...',
  'Mapping weather patterns and cloud formations...',
  'Optimizing seat recommendations for best scenic views...',
  'Cross-referencing astronomical data with flight timing...',
  'Evaluating sunrise and sunset visibility windows...',
  'Processing geographical features and terrain data...',
  'Finalizing your personalized viewing experience...',
  'Almost ready with your perfect seat recommendation!'
];

// Add animation styles directly to the document head for the text transition
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .fade-in-text {
    animation: fadeIn 0.5s ease-in-out forwards;
  }
`;
document.head.appendChild(styleSheet);

export const LoadingOverlay = ({ messages = defaultLoadingMessages }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showFallbackMessage, setShowFallbackMessage] = useState(false);

  useEffect(() => {
    // Track elapsed time in seconds
    const timeInterval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    // Set an interval to cycle through the messages
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
    }, 8200); // Change message every ~8.2 seconds (90 seconds ÷ 11 messages = ~8.18 seconds each)

    // Clean up intervals when component unmounts
    return () => {
      clearInterval(messageInterval);
      clearInterval(timeInterval);
    };
  }, [messages.length]);

  // Show fallback message after 90 seconds (1.30 minutes)
  useEffect(() => {
    if (timeElapsed >= 90) {
      setShowFallbackMessage(true);
    }
  }, [timeElapsed]);

  const getEstimatedTime = () => {
    if (timeElapsed < 30) return "Expected wait: ~1.5 minutes";
    if (timeElapsed < 60) return "Processing... about 30 seconds remaining";
    if (timeElapsed < 90) return "Almost complete... just a few more seconds";
    return "Taking longer than expected... you'll get results very soon!";
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-900/90 via-blue-900/90 to-teal-900/90 backdrop-blur-sm z-50">
      <div className="bg-white/95 backdrop-blur-sm p-12 rounded-3xl shadow-2xl flex flex-col items-center border border-cyan-200 max-w-md mx-4 text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">
          {showFallbackMessage ? "Still Processing..." : "Processing Your Request"}
        </h3>
        
        {/* Expected time indicator */}
        <div className="text-sm text-slate-500 mb-6 flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
          <span>{getEstimatedTime()}</span>
        </div>
        
        {/* A container with a fixed height to prevent layout shifts when the text changes */}
        <div className="h-24 flex items-center justify-center">
          <p 
            key={currentMessageIndex} // The key forces a re-render, re-triggering the animation
            className="text-lg font-medium text-slate-600 leading-relaxed fade-in-text px-4"
          >
            {showFallbackMessage ? 
              "We're working hard to get your results ready. Thank you for your patience - you'll receive your seat recommendations very soon!" :
              messages[currentMessageIndex]
            }
          </p>
        </div>

        <div className="flex items-center gap-2 mt-6 text-slate-500 text-sm">
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
          <span>AI-powered flight analysis • Step {Math.min(currentMessageIndex + 1, messages.length)} of {messages.length}</span>
        </div>
        
        {/* Timer display */}
        <div className="mt-4 text-xs text-slate-400 flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
          <span>Elapsed: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</span>
        </div>
      </div>
    </div>
  );
};