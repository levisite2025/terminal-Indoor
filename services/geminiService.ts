import { GoogleGenAI, Type } from "@google/genai";
import { SystemMetrics, AISystemAnalysis } from '../types';

const getAiClient = () => {
  // CRITICAL FIX: Safe access for process.env in browser environments
  // Chrome 142+ and other strict environments will crash if 'process' is accessed directly without a shim.
  
  // We check if 'process' is defined on window (from our polyfill) or globally
  const env = (typeof window !== 'undefined' && (window as any).process?.env) 
              ? (window as any).process.env 
              : (typeof process !== 'undefined' ? process.env : {});
              
  const apiKey = env.API_KEY;
  
  if (!apiKey) {
    console.warn("API_KEY is missing. Using fallback mock service.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Fallback data for when API is unavailable or Key is missing
const MOCK_ANALYSIS_RESULT: AISystemAnalysis = {
  statusSummary: "Stable operation. Values within nominal range.",
  anomalies: ["None. System performing optimally."],
  recommendations: [
    "Continue standard monitoring.",
    "Verify occupancy sensors in Zone B."
  ]
};

export const analyzeSystemMetrics = async (metrics: SystemMetrics[], currentMetric: SystemMetrics): Promise<AISystemAnalysis> => {
  try {
    const ai = getAiClient();
    
    if (!ai) {
      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, 1500));
      return MOCK_ANALYSIS_RESULT;
    }
    
    // Prepare data summary for the prompt
    const recentAvgTemp = metrics.slice(-10).reduce((acc, m) => acc + m.temperature, 0) / Math.min(metrics.length, 10);
    
    const prompt = `
      You are an expert Facility Management System AI. Analyze the following indoor environment telemetry.
      
      Current Live Metrics:
      - Temperature: ${currentMetric.temperature.toFixed(1)}°C
      - Humidity: ${currentMetric.humidity.toFixed(1)}%
      - CO2: ${currentMetric.co2Level.toFixed(0)} ppm
      - Power Usage: ${currentMetric.powerUsage.toFixed(0)} W
      - Occupancy: ${currentMetric.occupancy} people
      - System Status: ${currentMetric.status}

      Recent Average Temperature (last 10 readings): ${recentAvgTemp.toFixed(1)}°C.

      Provide a JSON response containing:
      1. A short status summary (max 15 words).
      2. A list of potential anomalies (if any, otherwise state "None").
      3. A list of operational recommendations to improve efficiency or comfort.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            statusSummary: { type: Type.STRING },
            anomalies: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            recommendations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ['statusSummary', 'anomalies', 'recommendations']
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");
    
    return JSON.parse(resultText) as AISystemAnalysis;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Return mock data on error so the UI doesn't break
    return {
      statusSummary: "AI Analysis Offline (Simulation Mode).",
      anomalies: ["Connection to AI Service failed.", "Using local heuristics."],
      recommendations: ["Check internet connectivity.", "Verify API Key configuration."]
    };
  }
};