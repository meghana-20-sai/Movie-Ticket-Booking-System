import React from 'react';
import { Film } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading cinema experience...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-brand-600/20 border border-brand-500/40 flex items-center justify-center animate-pulse">
          <Film className="w-7 h-7 text-brand-500 animate-spin" />
        </div>
        <div className="absolute -inset-2 bg-brand-500/20 rounded-3xl blur-xl -z-10 animate-pulse"></div>
      </div>
      <p className="mt-4 text-xs font-semibold text-slate-400 tracking-wide">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
