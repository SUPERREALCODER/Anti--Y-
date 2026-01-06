
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateActiveRecallQuiz(
  videoTitle: string, 
  videoDescription: string,
  durationSeconds: number
): Promise<QuizQuestion[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Analyze this educational video context for a 'DeepFocus' learning platform.
        Video Title: ${videoTitle}
        Context/Description: ${videoDescription}
        Total Duration: ${durationSeconds} seconds.

        GENERATE 4 "Active Recall" questions. These are not simple trivia; they must test deep conceptual mental models.
        
        RULES:
        1. Timestamps: Space them logically (e.g., 20%, 40%, 65%, 90% marks). Use seconds.
        2. Format: Multiple Choice (exactly 4 options).
        3. Difficulty: High. Assume the viewer is paying intense attention.
        4. Focus: Critical conceptual junctions where a student might get confused.

        Respond with a JSON array of QuizQuestion objects.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              timestamp: { type: Type.NUMBER, description: 'Seconds when the question triggers' },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctIndex: { type: Type.NUMBER },
              explanation: { type: Type.STRING }
            },
            required: ['id', 'timestamp', 'question', 'options', 'correctIndex', 'explanation']
          }
        }
      }
    });

    const jsonStr = response.text?.trim() || '[]';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Quiz Generation Error:", error);
    return [
      {
        id: 'fallback_1',
        timestamp: Math.floor(durationSeconds * 0.3),
        question: "Which foundational concept was just established as the core pillar of this lecture?",
        options: ["Structural Reductionism", "Emergent Complexity", "Linear Extrapolation", "Recursive Validation"],
        correctIndex: 0,
        explanation: "The introduction focuses on breaking down the subject into its smallest indivisible parts."
      }
    ];
  }
}
