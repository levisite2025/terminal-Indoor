export enum ConnectionType {
  LAN = 'LAN',
  CLOUD = 'CLOUD'
}

export interface ConnectionConfig {
  type: ConnectionType;
  address: string; // IP or URL
  port?: string; // Optional for LAN
  apiKey?: string; // Optional auth key
}

export interface SystemMetrics {
  temperature: number;
  humidity: number;
  co2Level: number;
  powerUsage: number;
  occupancy: number;
  timestamp: number;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
}

export interface AISystemAnalysis {
  statusSummary: string;
  anomalies: string[];
  recommendations: string[];
}

export interface AdContent {
  id: string;
  title: string;
  type: 'IMAGE' | 'VIDEO';
  url: string;
  duration: number; // seconds
}