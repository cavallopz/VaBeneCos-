import React from 'react';
import { Smile } from 'lucide-react';

export const ComingSoonPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 bg-[#00B14F] rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-green-500/20">
        <Smile className="text-white w-10 h-10" />
      </div>
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
        Stiamo Arrivando
      </h1>
      <p className="text-xl text-gray-600 max-w-xl mx-auto leading-relaxed">
        Il nuovo portale VaBeneCosi sarà presto online. Stiamo lavorando dietro le quinte per offrirti la migliore esperienza di risparmio su assicurazioni, luce, gas e molto altro.
      </p>
      
      <div className="mt-12 flex items-center space-x-2 text-sm font-bold text-[#00B14F] bg-green-50 px-4 py-2 rounded-full">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00B14F]"></span>
        </span>
        <span>Lavori in corso</span>
      </div>
    </div>
  );
};
