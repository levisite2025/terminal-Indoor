import React, { useState, useEffect } from 'react';
import { AdContent, SystemMetrics } from '../types';
import { X, Clock, Thermometer, Wind, Droplets, Zap } from 'lucide-react';

interface AdPlayerProps {
  ads: AdContent[];
  metrics: SystemMetrics;
  onExit: () => void;
}

const AdPlayer: React.FC<AdPlayerProps> = ({ ads, metrics, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const currentAd = ads[currentIndex];
    const duration = currentAd.duration * 1000;
    const intervalTime = 100; // Update every 100ms
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCurrentIndex(current => (current + 1) % ads.length);
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentIndex, ads]);

  // Handle manual navigation on click/key if needed, but auto-loop is standard for signage
  
  const currentAd = ads[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col overflow-hidden">
      {/* Main Content Area */}
      <div className="relative flex-1 bg-black flex items-center justify-center">
        {currentAd.type === 'IMAGE' ? (
          <img 
            key={currentAd.id}
            src={currentAd.url} 
            alt={currentAd.title}
            className="w-full h-full object-cover animate-in fade-in duration-1000"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-slate-900">
            <span className="text-slate-500">Video Playback Placeholder</span>
          </div>
        )}
        
        {/* Progress Bar Top */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/20">
          <div 
            className="h-full bg-blue-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Exit Button (Hidden unless hovered at top right) */}
        <button 
          onClick={onExit}
          className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-red-600/80 rounded-full backdrop-blur-sm transition-all opacity-0 hover:opacity-100 group"
          title="Exit Signage Mode"
        >
          <X className="text-white" size={24} />
        </button>
      </div>

      {/* Info Ticker Footer */}
      <div className="h-20 bg-slate-950 border-t border-slate-800 flex items-center px-8 justify-between shadow-2xl relative z-10">
        <div className="flex items-center gap-6">
           <div className="flex flex-col">
             <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Current Status</span>
             <span className={`text-xl font-bold ${
               metrics.status === 'OPTIMAL' ? 'text-emerald-400' : 
               metrics.status === 'WARNING' ? 'text-yellow-400' : 'text-red-400'
             }`}>
               {metrics.status}
             </span>
           </div>
           <div className="w-px h-10 bg-slate-800"></div>
           <div className="flex items-center gap-2">
             <Thermometer className="text-orange-500" size={20} />
             <div>
                <span className="text-xs text-slate-400 block">Temp</span>
                <span className="text-lg font-mono font-medium">{metrics.temperature.toFixed(1)}°C</span>
             </div>
           </div>
           <div className="flex items-center gap-2 ml-4">
             <Droplets className="text-cyan-500" size={20} />
             <div>
                <span className="text-xs text-slate-400 block">Humidity</span>
                <span className="text-lg font-mono font-medium">{metrics.humidity.toFixed(1)}%</span>
             </div>
           </div>
           <div className="flex items-center gap-2 ml-4">
             <Wind className="text-emerald-500" size={20} />
             <div>
                <span className="text-xs text-slate-400 block">CO2</span>
                <span className="text-lg font-mono font-medium">{metrics.co2Level} ppm</span>
             </div>
           </div>
        </div>

        {/* Brand / Title / Clock */}
        <div className="flex items-center gap-4">
           <div className="text-right hidden md:block">
             <h2 className="text-sm font-bold text-white uppercase tracking-wider">{currentAd.title}</h2>
             <p className="text-xs text-slate-500">System Advertisement • {currentIndex + 1}/{ads.length}</p>
           </div>
           <div className="w-px h-10 bg-slate-800 hidden md:block"></div>
           <div className="flex items-center gap-2 text-slate-300">
              <Clock size={18} />
              <span className="text-xl font-mono">{new Date(metrics.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdPlayer;