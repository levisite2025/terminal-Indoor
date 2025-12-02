import React, { useEffect, useState, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Thermometer, Droplets, Wind, Zap, Users, AlertTriangle, Cpu, BrainCircuit, Lock, Globe, Shield, PlayCircle, Terminal, ChevronRight, Search, Filter } from 'lucide-react';
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
      {React.cloneElement(icon as React.ReactElement<any>, { size: 64 })}
    </div>
    <div className="flex items-center gap-3 mb-2">
      <div className={`p-2 rounded-lg bg-opacity-10 ${color} bg-white`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 20, className: color.replace('bg-', 'text-') })}
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
  
  // Filter states
  const [logSearchTerm, setLogSearchTerm] = useState('');
  const [logLevelFilter, setLogLevelFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');

  const scrollRef = useRef<HTMLDivElement>(null);

  // Derived filtered logs
  const filteredLogs = logs.filter(log => {
    const matchesLevel = logLevelFilter === 'ALL' || log.level === logLevelFilter;
    const matchesSearch = log.message.toLowerCase().includes(logSearchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredLogs, logs]); 

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
    <div className="flex flex-col h-full bg-slate-950 font-sans">
      {/* Top Bar */}
      <header className="bg-slate-900 border-b border-slate-800 h-14 flex shrink-0 items-center justify-between px-6 shadow-md select-none">
        <div className="flex items-center gap-3">
          <Activity className="text-blue-500 animate-pulse" size={20} />
          <div>
            <h1 className="text-sm font-bold text-white leading-tight uppercase tracking-wider">Indoor Sys Visualizer</h1>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${config.type === ConnectionType.CLOUD ? 'bg-purple-500' : 'bg-green-500'}`}></span>
              <span className="text-[10px] text-slate-400 font-mono uppercase">
                {config.type === ConnectionType.CLOUD ? 'Secure Cloud' : 'Local Network'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onEnterAdMode}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wide rounded transition-colors shadow-lg shadow-indigo-500/20"
            title="Start Digital Signage Loop"
          >
            <PlayCircle size={14} />
            <span className="hidden sm:inline">Signage Mode</span>
          </button>
          <div className="w-px h-6 bg-slate-700 mx-1"></div>
          <button 
            onClick={onDisconnect}
            className="px-3 py-1.5 text-xs font-bold text-red-400 hover:text-white hover:bg-red-600 rounded transition-colors"
          >
            EXIT
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        <div className="max-w-7xl mx-auto space-y-4">
          
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Chart Section */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg min-h-[300px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wide text-white flex items-center gap-2">
                  <Activity size={16} className="text-slate-400" />
                  Telemetry Graph
                </h2>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1 text-[10px] text-orange-400 font-mono">
                    <span className="w-2 h-2 bg-orange-400 rounded-sm"></span> TEMP
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-mono">
                    <span className="w-2 h-2 bg-cyan-400 rounded-sm"></span> HUM
                  </div>
                </div>
              </div>
              <div className="h-[250px] w-full">
                {metricsHistory && metricsHistory.length > 0 ? (
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
                        fontSize={10} 
                        tickMargin={8}
                      />
                      <YAxis stroke="#64748b" fontSize={10} domain={['auto', 'auto']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', fontSize: '12px' }}
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
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    Loading telemetry data...
                  </div>
                )}
              </div>
            </div>

            {/* AI Assistant Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col h-[300px] lg:h-auto">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h2 className="text-sm font-bold uppercase tracking-wide text-white flex items-center gap-2">
                  <BrainCircuit size={16} className="text-purple-400" />
                  AI Diagnostics
                </h2>
                <button 
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-[10px] font-bold uppercase rounded transition-colors"
                >
                  {isAnalyzing ? 'Scanning...' : 'Run Scan'}
                </button>
              </div>

              <div className="flex-1 bg-slate-950/50 rounded-lg border border-slate-800 p-4 overflow-y-auto scrollbar-thin">
                {!aiAnalysis ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs text-center">
                    <Cpu size={24} className="mb-2 opacity-20" />
                    <p>System Idle.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-[10px] uppercase text-slate-500 font-bold mb-1">Status</h3>
                      <p className="text-white text-xs border-l-2 border-purple-500 pl-2">
                        {aiAnalysis.statusSummary}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-[10px] uppercase text-slate-500 font-bold mb-1">Anomalies Detected</h3>
                      <ul className="space-y-1">
                        {aiAnalysis.anomalies.map((item, i) => (
                          <li key={i} className="text-xs text-red-300 flex items-start gap-2">
                            <AlertTriangle size={12} className="mt-0.5 shrink-0" /> {item}
                          </li>
                        ))}
                        {aiAnalysis.anomalies.length === 0 && <li className="text-xs text-slate-400">None</li>}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-[10px] uppercase text-slate-500 font-bold mb-1">Recommendations</h3>
                      <ul className="space-y-1">
                        {aiAnalysis.recommendations.map((item, i) => (
                          <li key={i} className="text-xs text-blue-300 bg-blue-900/20 p-1.5 rounded border border-blue-900/30">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold uppercase tracking-wide text-white flex items-center gap-2">
                  <Terminal size={16} className="text-slate-400" />
                  System Console
                </h2>
                
                {/* Log Filters */}
                <div className="flex gap-2">
                   <div className="relative">
                      <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="Search..." 
                        value={logSearchTerm}
                        onChange={(e) => setLogSearchTerm(e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded py-0.5 pl-6 pr-2 text-[10px] text-slate-200 focus:outline-none focus:border-blue-500 w-24 placeholder:text-slate-600"
                      />
                   </div>
                   <select 
                     value={logLevelFilter}
                     onChange={(e) => setLogLevelFilter(e.target.value as any)}
                     className="bg-slate-950 border border-slate-700 rounded py-0.5 px-2 text-[10px] text-slate-200 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer hover:bg-slate-900"
                   >
                     <option value="ALL">ALL</option>
                     <option value="INFO">INFO</option>
                     <option value="WARN">WARN</option>
                     <option value="ERROR">ERR</option>
                   </select>
                </div>
              </div>

              <div 
                className="flex-1 bg-black rounded border border-slate-800 p-2 font-mono text-sm relative overflow-hidden flex flex-col h-[200px]"
              >
                <div ref={scrollRef} className="overflow-y-auto flex-1 scrollbar-thin pr-1">
                   {filteredLogs.length > 0 ? (
                     filteredLogs.map((log) => (
                       <div key={log.id} className="mb-1 flex items-start group hover:bg-slate-900/30 -mx-1 px-1 rounded">
                          <span className="text-slate-600 mr-2 select-none shrink-0 text-[10px] pt-0.5 w-[50px] text-right">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute:"2-digit", second:"2-digit"})}
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[9px] font-bold px-1 rounded-sm uppercase tracking-wide select-none ${
                              log.level === 'ERROR' ? 'bg-red-900/50 text-red-500' :
                              log.level === 'WARN' ? 'bg-yellow-900/50 text-yellow-500' :
                              'bg-blue-900/50 text-blue-500'
                            }`}>
                              {log.level}
                            </span>
                            <span className={`text-xs break-all ${
                              log.level === 'ERROR' ? 'text-red-300' :
                              log.level === 'WARN' ? 'text-yellow-100' :
                              'text-slate-300'
                            }`}>
                              {log.message}
                            </span>
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="h-full flex items-center justify-center text-slate-700 italic text-[10px]">
                       No output.
                     </div>
                   )}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-center">
               <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800 mb-4 relative">
                    <Users size={32} className="text-slate-300" />
                    <span className="absolute top-0 right-0 bg-green-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-slate-900">
                      LIVE
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">{currentMetric.occupancy}</h3>
                  <p className="text-slate-400 text-xs uppercase tracking-wide font-bold">Occupancy</p>
                  <div className="mt-6 flex justify-center gap-4">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 uppercase">Zone A</p>
                      <p className="font-mono text-white text-sm">{Math.floor(currentMetric.occupancy * 0.6)}</p>
                    </div>
                    <div className="w-px bg-slate-700"></div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 uppercase">Zone B</p>
                      <p className="font-mono text-white text-sm">{Math.ceil(currentMetric.occupancy * 0.4)}</p>
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