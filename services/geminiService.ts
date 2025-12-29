
import { GoogleGenAI } from "@google/genai";
import { VibraMetrics } from "../types";

export const getEmotionalAnalysisAsync = async (metrics: VibraMetrics): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    请分析以下实时“Vibraimage（振动图像）”生物识别指标。
    Vibraimage 通过计算机视觉捕获与前庭-情感反射相关的头部微振动。
    
    指标（0-100 刻度）：
    - 压力值 (Stress): ${metrics.stress.toFixed(1)}
    - 焦虑感 (Anxiety): ${metrics.anxiety.toFixed(1)}
    - 攻击性 (Aggression): ${metrics.aggression.toFixed(1)}
    - 能量水平 (Energy): ${metrics.energy.toFixed(1)}
    - 心理生理平衡 (Balance): ${metrics.balance.toFixed(1)}

    请提供一个专业的、简明的心理生理学解释（限 100 字以内）。
    重点关注当前的心理状态和潜在的紧张程度，并使用中文回答。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });
    return response.text || "无法生成分析结果。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "与智能引擎通信时出错。";
  }
};
