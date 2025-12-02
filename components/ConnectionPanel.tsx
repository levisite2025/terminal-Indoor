import React, { useState, useEffect } from 'react';
import { ConnectionConfig, ConnectionType } from '../types';
import { ShieldCheck, Globe, Wifi, Lock, MonitorDown, CheckCircle, Download, Monitor } from 'lucide-react';

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

  const handleDownloadLauncher = () => {
    setDownloading(true);
    
    // Generates a Windows Batch file that launches the browser in App Mode (Kiosk feel)
    const batContent = `@echo off
title Indoor System Visualizer Launcher
color 0B
cls
echo ====================================================
echo   INDOOR SYSTEM VISUALIZER - WINDOWS CLIENT
echo ====================================================
echo.
echo [INFO] Loading system drivers...
echo [INFO] Detecting display resolution...
echo [INFO] Launching in Application Mode...
echo.
echo Please wait...
timeout /t 2 >nul

:: Try to launch Edge in App Mode
start msedge --app=https://sys-viewer.app --start-maximized 2>nul
if %errorlevel% neq 0 (
    :: Fallback to Chrome
    start chrome --app=https://sys-viewer.app --start-maximized 2>nul
)

exit
`;

    const blob = new Blob([batContent], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "IndoorSystem_Launcher.bat"; 
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600"></div>

        <div className="bg-slate-800/50 p-6 text-center border-b border-slate-700">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">System Login</h1>
          <p className="text-slate-400 text-xs mt-1">Indoor Environment Monitoring Suite v2.1</p>
          
          {/* Platform Badge */}
          <div className="mt-3 flex justify-center gap-2">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-medium text-blue-400">
              <Monitor size={10} />
              <span>Windows 11 Compatible</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-medium text-emerald-400">
              <CheckCircle size={10} />
              <span>Secure Boot</span>
            </div>
          </div>
        </div>

        <div className="p-8 pb-6">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate autoComplete="off">
            
            {/* Connection Type Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setType(ConnectionType.LAN)}
                className={`flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all duration-200 ${
                  type === ConnectionType.LAN 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Wifi size={14} />
                Local Network
              </button>
              <button
                type="button"
                onClick={() => setType(ConnectionType.CLOUD)}
                className={`flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all duration-200 ${
                  type === ConnectionType.CLOUD 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Globe size={14} />
                Cloud Link
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 font-bold">
                  {type === ConnectionType.LAN ? 'Device IP Address' : (
                    <>
                      <Globe size={10} /> Secure Web Link
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
                    className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-lg px-4 py-2.5 pl-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-700 font-mono"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors">
                    {type === ConnectionType.LAN ? <Wifi size={14} /> : <Lock size={14} />}
                  </div>
                </div>
              </div>

              {type === ConnectionType.LAN && (
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 font-bold">
                    Port
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="8080"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isConnecting}
              className={`w-full py-3 rounded-lg font-semibold text-sm text-white shadow-lg transition-all transform hover:translate-y-[-1px] active:translate-y-[0px] ${
                isConnecting 
                  ? 'bg-slate-800 cursor-wait text-slate-400' 
                  : type === ConnectionType.CLOUD
                    ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20'
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
              }`}
            >
              {isConnecting ? 'Authenticating...' : 'Connect to System'}
            </button>
          </form>
        </div>
        
        {/* Footer for Client Download */}
        <div className="bg-slate-950 p-4 border-t border-slate-800">
             <button 
               onClick={handleDownloadLauncher}
               disabled={downloading}
               className="group w-full flex items-center justify-between px-4 py-2 rounded border border-slate-800 hover:border-slate-600 hover:bg-slate-900 transition-all"
             >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-slate-800 rounded group-hover:bg-slate-800 text-slate-400 group-hover:text-white transition-colors">
                    <MonitorDown size={16} />
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-bold text-slate-300 group-hover:text-white">Download Desktop Launcher</span>
                    <span className="block text-[10px] text-slate-500">Windows Executable (.bat) • v1.0.4</span>
                  </div>
                </div>
                <Download size={14} className="text-slate-600 group-hover:text-white" />
             </button>
        </div>
      </div>
      <div className="mt-6 text-slate-600 text-[10px] font-mono">
        Server Status: ONLINE | Region: US-EAST-1
      </div>
    </div>
  );
};

export default ConnectionPanel;