import { GoogleGenAI, Type } from "@google/genai";
import { DailyLog, Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes daily logs with 1% Standard Modules.
 */
export const analyzeDailyLog = async (log: DailyLog, questions: Question[], silentMode: boolean): Promise<{
    text: string, 
    dailyDirection: string, 
    realityCheck: string,
    thinkingQuality: 'Surface' | 'Practical' | 'Strategic' | 'Long-term'
}> => {
  
  // If silent mode, force bluntness
  const tone = "BLUNT, DATA-DRIVEN, UNCOMFORTABLE TRUTH. NO MOTIVATION.";

  const prompt = `
    Analyze my daily life data against Top 1% Performer Standards.
    Tone: ${tone}
    
    Data:
    - Creation Minutes: ${log.answers['creationMinutes']}
    - Consumption Minutes: ${log.answers['consumptionMinutes']} (Ratio: ${log.creationRatio})
    - Deep Thought: "${log.answers['thinkingContent']}"
    - Excuse: "${log.answers['excuseType']}"
    - Money Spent: ${log.answers['moneySpent']} (${log.answers['spendingCategory']})
    
    Identity:
    - Face Match: ${log.answers['faceMatch']}
    - Identity Match: ${log.answers['identityCheck']}

    Tasks:
    1. **DAILY DIRECTION**: Generate ONE single sentence directive for tomorrow. Must be an action command. No quotes. (e.g., "No phone until 1000 words are written.")
    2. **REALITY CHECK**: Compare my performance to a statistical standard. (e.g., "You consumed more than 90% of the population today.")
    3. **THINKING QUALITY**: Classify my "Deep Thought" as: Surface, Practical, Strategic, or Long-term.
    4. **ANALYSIS**: Provide a ruthless audit of my day. Identify the specific "Time Thief" and "Weakness".

    Response Format (JSON):
    {
        "dailyDirection": "string",
        "realityCheck": "string",
        "thinkingQuality": "Surface" | "Practical" | "Strategic" | "Long-term",
        "analysisText": "string"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 2048 }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
        text: result.analysisText || "Analysis failed.",
        dailyDirection: result.dailyDirection || "Do the work.",
        realityCheck: result.realityCheck || "You are average.",
        thinkingQuality: result.thinkingQuality || "Surface"
    };

  } catch (error) {
    console.error("Analysis failed", error);
    return {
        text: "Error generating analysis.",
        dailyDirection: "Resume discipline.",
        realityCheck: "Data unavailable.",
        thinkingQuality: "Surface"
    };
  }
};

/**
 * Generates the Weekly Truth Report.
 */
export const generateWeeklyReport = async (logs: DailyLog[]): Promise<string> => {
  const recentLogs = logs.slice(-7);
  const prompt = `
    Generate a WEEKLY TRUTH REPORT (Top 1% Standard).
    Tone: BLUNT.
    
    Data: ${JSON.stringify(recentLogs.map(l => ({
      date: l.date,
      ratio: l.creationRatio,
      pressure: l.pressureLevel,
      excuse: l.answers['excuseType']
    })))}

    Output Sections:
    1. **Environment Audit**: Who/What wasted time?
    2. **Weakness Mode**: What is being avoided?
    3. **Failure Archive**: Pattern of excuses.
    4. **Direction**: Upward, Flat, or Declining?
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text || "Report generation failed.";
  } catch (error) {
    return "Could not generate report.";
  }
};

export const chatWithAssistant = async (history: { role: string, parts: { text: string }[] }[], newMessage: string, useDeepThinking: boolean): Promise<string> => {
  try {
    const config: any = {};
    if (useDeepThinking) config.thinkingConfig = { thinkingBudget: 32768 };

    const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        history: history,
        config: config
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "No response generated.";
  } catch (error) {
    return "Connection error.";
  }
};

export const analyzeImage = async (base64Data: string, promptText: string): Promise<string> => {
  try {
    const cleanBase64 = base64Data.split(',')[1] || base64Data;
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: promptText || "Analyze this photo for signs of fatigue, weakness, or strength. Compare to Top 1% standard." }
        ]
      }
    });
    return response.text || "No analysis returned.";
  } catch (error) {
    return "Failed to analyze image.";
  }
};
