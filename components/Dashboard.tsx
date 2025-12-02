import React, { useEffect, useState, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Thermometer, Droplets, Wind, Zap, Users, AlertTriangle, Cpu, BrainCircuit, Lock, Globe, Shield, PlayCircle } from 'lucide-react';
import { SystemMetrics, LogEntry, AISystemAnalysis, ConnectionConfig, ConnectionType } from '../types';
import { analyzeSystemMetrics } from '../services/geminiService';

interface DashboardProps {
  metricsHistory: SystemMetrics[];
  currentMetric: SystemMetrics;
  logs: LogEntry[];
  config: ConnectionConfig;
  onDisconnect: () => void;
  onEnterAdMode: () => void;
}

const StatCard: React.FC<{ 
  title: string; 
  value: string | number; 
  unit?: string; 
  icon: React.ReactNode; 
  trend?: 'up' | 'down' | 'stable';
  color: string;
}> = ({ title, value, unit, icon, trend, color }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
      {React.cloneElement(icon as React.ReactElement, { size: 64 })}
    </div>
    <div className="flex items-center gap-3 mb-2">
      <div className={`p-2 rounded-lg bg-opacity-10 ${color} bg-white`}>
        {React.cloneElement(icon as React.ReactElement, { size: 20, className: color.replace('bg-', 'text-') })}
      </div>
      <span className="text-slate-400 text-sm font-medium uppercase tracking-wide">{title}</span>
    </div>
    <div className="flex items-baseline gap-1 relative z-10">
      <span className="text-3xl font-bold text-white">{value}</span>
      {unit && <span className="text-slate-500 text-sm font-medium">{unit}</span>}
    </div>
    {trend && (
      <div className="mt-2 text-xs text-slate-500">
        Trend: <span className="text-white">{trend}</span>
      </div>
    )}
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ metricsHistory, currentMetric, logs, config, onDisconnect, onEnterAdMode }) => {
  const [aiAnalysis, setAiAnalysis] = useState<AISystemAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    const analysis = await analyzeSystemMetrics(metricsHistory, currentMetric);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top Bar */}
      <header className="bg-slate-900 border-b border-slate-800 h-16 flex items-center justify-between px-6 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <Activity className="text-blue-500 animate-pulse" />
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Indoor Sys View</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${config.type === ConnectionType.CLOUD ? 'bg-purple-500' : 'bg-green-500'}`}></span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs text-slate-300 font-mono">
                {config.type === ConnectionType.CLOUD ? <Lock size={10} className="text-purple-400" /> : <Shield size={10} className="text-green-400" />}
                <span className="truncate max-w-[200px]">
                  {config.type === ConnectionType.CLOUD 
                    ? config.address.replace(/^https?:\/\//, '') 
                    : `${config.address}:${config.port}`}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onEnterAdMode}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
            title="Start Digital Signage Loop"
          >
            <PlayCircle size={16} />
            <span className="hidden sm:inline">Start Signage</span>
          </button>
          <div className="w-px h-6 bg-slate-700 mx-1"></div>
          <button 
            onClick={onDisconnect}
            className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-900/50"
          >
            Disconnect
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Temperature" 
              value={currentMetric.temperature.toFixed(1)} 
              unit="°C" 
              icon={<Thermometer />} 
              color="text-orange-500" 
            />
            <StatCard 
              title="Humidity" 
              value={currentMetric.humidity.toFixed(1)} 
              unit="%" 
              icon={<Droplets />} 
              color="text-cyan-500" 
            />
            <StatCard 
              title="Power Load" 
              value={currentMetric.powerUsage} 
              unit="W" 
              icon={<Zap />} 
              color="text-yellow-400" 
            />
            <StatCard 
              title="CO2 Level" 
              value={currentMetric.co2Level} 
              unit="ppm" 
              icon={<Wind />} 
              color={currentMetric.co2Level > 800 ? "text-red-500" : "text-emerald-500"} 
            />
          </div>

          {/* Charts & AI Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart Section */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Activity size={20} className="text-slate-400" />
                  Real-time Telemetry
                </h2>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1 text-xs text-orange-400">
                    <span className="w-3 h-1 bg-orange-400 rounded-full"></span> Temp
                  </div>
                  <div className="flex items-center gap-1 text-xs text-cyan-400">
                    <span className="w-3 h-1 bg-cyan-400 rounded-full"></span> Humidity
                  </div>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metricsHistory}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={formatTime} 
                      stroke="#64748b" 
                      fontSize={12} 
                      tickMargin={10}
                    />
                    <YAxis stroke="#64748b" fontSize={12} domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                      labelFormatter={(label) => formatTime(label)}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#f97316" 
                      fillOpacity={1} 
                      fill="url(#colorTemp)" 
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="humidity" 
                      stroke="#06b6d4" 
                      fillOpacity={1} 
                      fill="url(#colorHum)" 
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Assistant Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <BrainCircuit size={20} className="text-purple-400" />
                  System Assistant
                </h2>
                <button 
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold uppercase rounded-md transition-colors"
                >
                  {isAnalyzing ? 'Thinking...' : 'Analyze'}
                </button>
              </div>

              <div className="flex-1 bg-slate-950/50 rounded-lg border border-slate-800 p-4 overflow-y-auto">
                {!aiAnalysis ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm text-center">
                    <Cpu size={32} className="mb-2 opacity-20" />
                    <p>Click "Analyze" to generate insights based on current metrics.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs uppercase text-slate-500 font-bold mb-1">Status</h3>
                      <p className="text-white text-sm border-l-2 border-purple-500 pl-2">
                        {aiAnalysis.statusSummary}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xs uppercase text-slate-500 font-bold mb-1">Anomalies Detected</h3>
                      <ul className="space-y-1">
                        {aiAnalysis.anomalies.map((item, i) => (
                          <li key={i} className="text-sm text-red-300 flex items-start gap-2">
                            <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {item}
                          </li>
                        ))}
                        {aiAnalysis.anomalies.length === 0 && <li className="text-sm text-slate-400">None</li>}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xs uppercase text-slate-500 font-bold mb-1">Recommendations</h3>
                      <ul className="space-y-2">
                        {aiAnalysis.recommendations.map((item, i) => (
                          <li key={i} className="text-sm text-blue-300 bg-blue-900/20 p-2 rounded border border-blue-900/30">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Row: Logs & Secondary Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity size={20} className="text-slate-400" />
                System Logs
              </h2>
              <div 
                ref={scrollRef}
                className="h-48 overflow-y-auto scrollbar-thin border border-slate-800 rounded-lg bg-slate-950 p-2"
              >
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-900 sticky top-0">
                    <tr>
                      <th className="p-2">Time</th>
                      <th className="p-2">Level</th>
                      <th className="p-2">Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-2 text-slate-400 whitespace-nowrap font-mono text-xs">
                          {formatTime(log.timestamp)}
                        </td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.level === 'ERROR' ? 'bg-red-500/20 text-red-400' :
                            log.level === 'WARN' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {log.level}
                          </span>
                        </td>
                        <td className="p-2 text-slate-300">{log.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col justify-center">
               <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-800 mb-4 relative">
                    <Users size={40} className="text-slate-300" />
                    <span className="absolute top-0 right-0 bg-green-500 text-slate-950 text-xs font-bold px-2 py-1 rounded-full border-2 border-slate-900">
                      LIVE
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">{currentMetric.occupancy}</h3>
                  <p className="text-slate-400 text-sm">Active Occupants</p>
                  <div className="mt-6 flex justify-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Zone A</p>
                      <p className="font-mono text-white">{Math.floor(currentMetric.occupancy * 0.6)}</p>
                    </div>
                    <div className="w-px bg-slate-700"></div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Zone B</p>
                      <p className="font-mono text-white">{Math.ceil(currentMetric.occupancy * 0.4)}</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;