import { ConnectionType, AdContent } from './types';

export const DEFAULT_CONFIG = {
  type: ConnectionType.LAN,
  address: '192.168.1.100',
  port: '8080'
};

export const MOCK_LOGS = [
  { id: '1', timestamp: Date.now() - 100000, level: 'INFO', message: 'System initialized successfully.' },
  { id: '2', timestamp: Date.now() - 80000, level: 'INFO', message: 'Connected to HVAC controller.' },
  { id: '3', timestamp: Date.now() - 60000, level: 'WARN', message: 'Latency detected on Sensor Node 4.' },
];

export const MOCK_ADS: AdContent[] = [
  {
    id: '1',
    title: 'Energy Saving Initiative',
    type: 'IMAGE',
    url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=1920',
    duration: 10
  },
  {
    id: '2',
    title: 'Safety Protocols',
    type: 'IMAGE',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1920',
    duration: 8
  },
  {
    id: '3',
    title: 'Smart Workspace',
    type: 'IMAGE',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1920',
    duration: 12
  }
];