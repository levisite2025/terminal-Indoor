import React, { useState, useEffect, useCallback } from 'react';
import ConnectionPanel from './components/ConnectionPanel';
import Dashboard from './components/Dashboard';
import AdPlayer from './components/AdPlayer';
import { ConnectionConfig, SystemMetrics, LogEntry, ConnectionType } from './types';
import { MOCK_LOGS, MOCK_ADS } from './constants';

const generateRandomMetric = (prev: SystemMetrics): SystemMetrics => {
  const newTemp = prev.temperature + (Math.random() - 0.5) * 0.5;
  const newHum = prev.humidity + (Math.random() - 0.5) * 1;
  const newCo2 = Math.max(400, prev.co2Level + (Math.random() - 0.5) * 20);
  const newPower = Math.max(0, prev.powerUsage + (Math.random() - 0.5) * 50);
  
  let status: 'OPTIMAL' | 'WARNING' | 'CRITICAL' = 'OPTIMAL';
  if (newTemp > 28 || newCo2 > 1000) status = 'WARNING';
  if (newTemp > 35 || newCo2 > 1500) status = 'CRITICAL';

  return {
    temperature: Number(newTemp.toFixed(2)),
    humidity: Math.max(0, Math.min(100, Number(newHum.toFixed(2)))),
    co2Level: Math.floor(newCo2),
    powerUsage: Math.floor(newPower),
    occupancy: prev.occupancy, 
    timestamp: Date.now(),
    status
  };
};

const App: React.FC = () => {
  const [config, setConfig] = useState<ConnectionConfig | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [viewMode, setViewMode] = useState<'DASHBOARD' | 'ADS'>('DASHBOARD');

  const [currentMetric, setCurrentMetric] = useState<SystemMetrics>({
    temperature: 22.5,
    humidity: 45,
    co2Level: 420,
    powerUsage: 1250,
    occupancy: 42,
    timestamp: Date.now(),
    status: 'OPTIMAL'
  });
  const [history, setHistory] = useState<SystemMetrics[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS);

  // Initialize history
  useEffect(() => {
    const initialHistory = [];
    let tempMetric = { ...currentMetric, timestamp: Date.now() - 1000 * 60 * 10 }; // Start 10 mins ago
    for (let i = 0; i < 60; i++) {
      tempMetric = generateRandomMetric(tempMetric);
      tempMetric.timestamp = Date.now() - (60 - i) * 10000; // Spread over time
      initialHistory.push(tempMetric);
    }
    setHistory(initialHistory);
  }, []);

  // Connection Handler
  const handleConnect = (newConfig: ConnectionConfig) => {
    setIsConnecting(true);
    // Simulate network handshake
    setTimeout(() => {
      setConfig(newConfig);
      setIsConnecting(false);
      addLog('INFO', `Successfully connected to system via ${newConfig.type} (${newConfig.address})`);
      if (newConfig.type === ConnectionType.CLOUD) {
        addLog('INFO', 'Secure handshake completed. TLS 1.3 encryption active.');
      }
    }, 1500);
  };

  const handleDisconnect = () => {
    setConfig(null);
    setHistory([]);
    setLogs([]);
    setViewMode('DASHBOARD');
  };

  const addLog = (level: 'INFO' | 'WARN' | 'ERROR', message: string) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      level,
      message
    };
    setLogs(prev => [...prev, newLog]);
  };

  // Simulation Loop
  useEffect(() => {
    if (!config) return;

    const interval = setInterval(() => {
      setCurrentMetric(prev => {
        const next = generateRandomMetric(prev);
        
        // Occasional occupancy shift
        if (Math.random() > 0.95) {
          next.occupancy = Math.max(0, prev.occupancy + (Math.random() > 0.5 ? 1 : -1));
        }

        // Add to history
        setHistory(h => {
          const newHistory = [...h, next];
          if (newHistory.length > 50) newHistory.shift(); // Keep last 50 points
          return newHistory;
        });

        // Occasional Random System Logs
        if (Math.random() > 0.98) {
           const warnings = [
             "HVAC compressor cycle extended",
             "Packet loss detected on Zone C",
             "Slight voltage fluctuation detected"
           ];
           addLog('WARN', warnings[Math.floor(Math.random() * warnings.length)]);
        }

        return next;
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [config]);

  if (!config) {
    return <ConnectionPanel onConnect={handleConnect} isConnecting={isConnecting} />;
  }

  if (viewMode === 'ADS') {
    return (
      <AdPlayer 
        ads={MOCK_ADS} 
        metrics={currentMetric} 
        onExit={() => setViewMode('DASHBOARD')} 
      />
    );
  }

  return (
    <Dashboard 
      metricsHistory={history}
      currentMetric={currentMetric}
      logs={logs}
      config={config}
      onDisconnect={handleDisconnect}
      onEnterAdMode={() => setViewMode('ADS')}
    />
  );
};

export default App;