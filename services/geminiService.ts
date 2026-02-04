
import { GoogleGenAI, Modality } from "@google/genai";
import { MODEL_CONFIG } from "../constants";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  private async retryOperation<T>(operation: () => Promise<T>, retries = 3, initialDelay = 2000): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      if (retries > 0 && (error.status === 429 || error.status === 503 || error.code === 429)) {
        console.warn(`[SENTINEL] Resource Exhausted (429). Retrying in ${initialDelay}ms.`);
        await delay(initialDelay);
        return this.retryOperation(operation, retries - 1, initialDelay * 2);
      }
      throw error;
    }
  }

  // [GEMINI] Intelligence Logic
  // if isAdvanced = true: Use Pro + Thinking (Smarter, Slower)
  // if isAdvanced = false: Use Flash (Faster, Standard)
  async generateSnapshot(prompt: string, systemInstruction: string, isAdvanced: boolean = false) {
    return this.retryOperation(async () => {
      
      const modelName = isAdvanced ? MODEL_CONFIG.ADVANCED : MODEL_CONFIG.STANDARD;
      const thinkingBudget = isAdvanced ? 16000 : 0; 
      
      const config: any = {
        systemInstruction: isAdvanced 
          ? systemInstruction + " CRITICAL: You are operating in MIER MIRROR ADVANCED MODE. Use your maximum reasoning capacity. Critique your own assumptions before outputting. Prioritize elegance, security, and optimization above all else."
          : systemInstruction,
        temperature: isAdvanced ? 0.7 : 0.9, // Lower temp for precision in Advanced
      };

      // Only add thinking config if budget > 0 (Pro models)
      // When thinking is enabled, maxOutputTokens must be sufficient for BOTH thinking + response.
      if (thinkingBudget > 0) {
        config.thinkingConfig = { thinkingBudget };
        config.maxOutputTokens = 32768; 
      } else {
        config.maxOutputTokens = 8192;
      }

      const response = await this.ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: config
      });

      return response.text || "Mier Mirror yielded no output.";
    });
  }

  async generateImage(prompt: string) {
    return this.retryOperation(async () => {
      const response = await this.ai.models.generateContent({
        model: MODEL_CONFIG.IMAGE,
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: { aspectRatio: "1:1" }
        }
      });

      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      return part?.inlineData?.data ? `data:image/png;base64,${part.inlineData.data}` : null;
    });
  }

  async performPurificationRitual(contentToAnalyze: string): Promise<AudioBuffer> {
    return this.retryOperation(async () => {
      const scriptPrompt = `
        Analyze the following content. Create a dialogue between Kore (Security) and Puck (Design).
        They are judging the user's creation.
        Content: ${contentToAnalyze.substring(0, 500)}...
      `;

      const scriptResponse = await this.ai.models.generateContent({
        model: MODEL_CONFIG.TEXT,
        contents: scriptPrompt,
      });

      const script = scriptResponse.text || "Kore: Acceptable. Puck: Barely.";

      const audioResponse = await this.ai.models.generateContent({
        model: MODEL_CONFIG.TTS,
        contents: [{ parts: [{ text: script }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                { speaker: 'Kore', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                { speaker: 'Puck', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
              ]
            }
          }
        }
      });

      const base64Audio = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) throw new Error("Audio generation failed.");

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(decodeBase64(base64Audio).buffer);
      return audioBuffer;
    });
  }
}

export const gemini = new GeminiService();
