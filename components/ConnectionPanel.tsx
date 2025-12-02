import React, { useState, useEffect } from 'react';
import { ConnectionConfig, ConnectionType } from '../types';
import { ShieldCheck, Globe, Wifi, Lock, MonitorDown, CheckCircle } from 'lucide-react';

interface ConnectionPanelProps {
  onConnect: (config: ConnectionConfig) => void;
  isConnecting: boolean;
}

const ConnectionPanel: React.FC<ConnectionPanelProps> = ({ onConnect, isConnecting }) => {
  const [type, setType] = useState<ConnectionType>(ConnectionType.LAN);
  const [address, setAddress] = useState('192.168.1.100');
  const [port, setPort] = useState('8080');
  const [downloading, setDownloading] = useState(false);

  // Smart default switching
  useEffect(() => {
    if (type === ConnectionType.LAN) {
      if (address.includes('sys-viewer')) setAddress('192.168.1.100');
    } else {
      if (address.includes('192.168')) setAddress('https://sys-viewer.app/remote/login');
    }
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect({ 
      type, 
      address: address || (type === ConnectionType.LAN ? '192.168.1.100' : 'https://sys-viewer.app/remote/login'), 
      port: type === ConnectionType.LAN ? port : undefined
    });
  };

  const handleDownloadSim = () => {
    setDownloading(true);
    
    // Create a dummy file to make the download feel real
    const blob = new Blob(["[System Installer]\nVersion=1.0.4\nPlatform=Windows x64\n\nThis is a simulation file. In a real deployment, this would be the binary executable."], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "Setup_IndoorSys_v1.0.txt"; // Using .txt to avoid browser security warnings in preview
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
        setDownloading(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-4 font-sans select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden relative">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>

        <div className="bg-slate-800/50 p-6 text-center border-b border-slate-700">
          <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Access</h1>
          <p className="text-slate-400 text-sm mt-2">Indoor Environment Monitoring Unit</p>
          
          {/* Browser Compatibility Badge */}
          <div className="mt-3 flex justify-center">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-700/50 text-[10px] font-medium text-emerald-400 shadow-sm">
              <CheckCircle size={10} />
              <span>Verified for Chrome & Edge</span>
            </div>
          </div>
        </div>

        <div className="p-8 pb-4">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate autoComplete="off">
            
            {/* Connection Type Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setType(ConnectionType.LAN)}
                className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  type === ConnectionType.LAN 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Wifi size={16} />
                LAN (IP)
              </button>
              <button
                type="button"
                onClick={() => setType(ConnectionType.CLOUD)}
                className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  type === ConnectionType.CLOUD 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Globe size={16} />
                Cloud Link
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500 mb-1.5 font-semibold">
                  {type === ConnectionType.LAN ? 'Device IP Address' : (
                    <>
                      <Globe size={12} /> Secure Web Link
                    </>
                  )}
                </label>
                <div className="relative group">
                  <input
                    type="text" 
                    required
                    placeholder={type === ConnectionType.LAN ? "192.168.1.100" : "sys-viewer.app/..."}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-600"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                    {type === ConnectionType.LAN ? <Wifi size={16} /> : <Lock size={16} />}
                  </div>
                </div>
              </div>

              {type === ConnectionType.LAN && (
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5 font-semibold">
                    Port
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="8080"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isConnecting}
              className={`w-full py-3.5 rounded-lg font-semibold text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                isConnecting 
                  ? 'bg-slate-700 cursor-not-allowed opacity-75' 
                  : type === ConnectionType.CLOUD
                    ? 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-purple-500/20'
                    : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-blue-500/20'
              }`}
            >
              {isConnecting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Establishing Connection...
                </span>
              ) : (
                'Connect to System'
              )}
            </button>
          </form>
        </div>
        
        {/* Footer for Client Download */}
        <div className="bg-slate-900/80 p-4 border-t border-slate-800 text-center">
             <button 
               onClick={handleDownloadSim}
               disabled={downloading}
               className="text-slate-500 hover:text-white text-xs flex items-center justify-center gap-2 mx-auto transition-colors"
             >
                <MonitorDown size={14} />
                {downloading ? 'Downloading installer...' : 'Download Windows Client (v1.0.4)'}
             </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionPanel;