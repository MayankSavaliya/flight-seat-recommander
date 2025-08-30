import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export const LoadingOverlay = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-900/90 via-blue-900/90 to-teal-900/90 backdrop-blur-sm z-50">
      <div className="bg-white/95 backdrop-blur-sm p-12 rounded-3xl shadow-2xl flex flex-col items-center border border-cyan-200 max-w-md mx-4">
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-3">Processing Your Request</h3>
        <p className="text-lg font-medium text-slate-600 text-center leading-relaxed">{message}</p>
        <div className="flex items-center gap-2 mt-6 text-slate-500 text-sm">
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
          <span>AI-powered analysis in progress</span>
        </div>
      </div>
    </div>
  );
};
