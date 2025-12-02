import React, { useState, useEffect } from 'react';
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
  // Debug log to verify App is mounting
  useEffect(() => {
    console.log("[System] App Component Mounted.");
  }, []);

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
  const [logs, setLogs] = useState<LogEntry[]>([]);

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
    // Initialize with some historical logs if needed, but we'll clear for a fresh "boot" feel on connect
    setLogs(MOCK_LOGS); 
  }, []);

  const addLog = (level: 'INFO' | 'WARN' | 'ERROR', message: string) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      level,
      message
    };
    setLogs(prev => [...prev, newLog]);
  };

  // Connection Handler
  const handleConnect = async (newConfig: ConnectionConfig) => {
    setIsConnecting(true);
    
    // Clear old logs for a fresh terminal look
    setLogs([]);
    
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    // Simulated Boot Sequence tailored to connection type
    if (newConfig.type === ConnectionType.CLOUD) {
        // Django / Python Simulation
        addLog('INFO', 'admin@server:~$ python manage.py runserver');
        await sleep(400);
        addLog('INFO', 'Watching for file changes with StatReloader');
        await sleep(300);
        addLog('INFO', 'Performing system checks...');
        await sleep(200);
        addLog('INFO', 'System check identified no issues (0 silenced).');
        await sleep(300);
        addLog('INFO', 'Django version 4.2.7, using settings "core.settings.prod"');
        addLog('INFO', 'Starting ASGI/Daphne server at https://sys-viewer.app/');
        await sleep(300);
        addLog('INFO', 'TLS 1.3 Handshake successful. Secure Tunnel Established.');
    } else {
        // Flask Simulation
        const port = newConfig.port || '8080';
        addLog('INFO', `pi@indoor-node:~$ flask run --host=0.0.0.0 --port=${port}`);
        await sleep(400);
        addLog('INFO', ' * Serving Flask app "indoor_monitor"');
        addLog('INFO', ' * Environment: production');
        addLog('WARN', '   WARNING: This is a development server. Do not use it in a production deployment.');
        addLog('INFO', '   Use a production WSGI server instead.');
        await sleep(300);
        addLog('INFO', ' * Debug mode: off');
        addLog('INFO', ` * Running on http://${newConfig.address}:${port}/ (Press CTRL+C to quit)`);
    }

    await sleep(200);
    addLog('INFO', 'Worker initialized. Telemetry stream active.');
    await sleep(400);

    setConfig(newConfig);
    setIsConnecting(false);
  };

  const handleDisconnect = () => {
    setConfig(null);
    setViewMode('DASHBOARD');
    setLogs(MOCK_LOGS); // Reset to mock logs for the login screen background if needed
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
          if (newHistory.length > 50) newHistory