import { GoogleGenAI, Type } from "@google/genai";
import { SystemMetrics, AISystemAnalysis } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeSystemMetrics = async (metrics: SystemMetrics[], currentMetric: SystemMetrics): Promise<AISystemAnalysis> => {
  try {
    const ai = getAiClient();
    
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
    return {
      statusSummary: "Analysis unavailable.",
      anomalies: ["Could not connect to AI service."],
      recommendations: ["Check internet connection.", "Verify API Key."]
    };
  }
};