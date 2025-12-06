import { GoogleGenAI, Type } from "@google/genai";
import { MedicineData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeMedicineImage = async (base64Image: string): Promise<MedicineData> => {
  try {
    // Remove header if present (e.g., "data:image/jpeg;base64,")
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64
            }
          },
          {
            text: `Analyze this image of a medicine (bottle, blister pack, tube, or pill). 
            Extract the medicine name, dosage, and expiration date if visible. 
            Provide a summary of what it is used for, common side effects, and critical warnings.
            
            Strictly infer the 'expiryDate' only if clearly visible on the packaging. If not found, return null. 
            Format expiryDate as 'YYYY-MM-DD' if possible, or a clear string string like 'DEC 2025'.
            
            Return JSON.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            medicineName: { type: Type.STRING, description: "Name of the medication" },
            dosage: { type: Type.STRING, description: "Strength or concentration (e.g. 500mg), or null if not found", nullable: true },
            expiryDate: { type: Type.STRING, description: "Expiration date string or null if not found", nullable: true },
            primaryUses: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of 3-5 primary conditions this treats"
            },
            sideEffects: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of common side effects"
            },
            warnings: { type: Type.STRING, description: "Important safety warning or contraindications" },
            confidenceScore: { type: Type.NUMBER, description: "Confidence score between 0 and 1" }
          },
          required: ["medicineName", "primaryUses", "sideEffects", "warnings", "confidenceScore"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    const data = JSON.parse(response.text) as MedicineData;
    return data;

  } catch (error) {
    console.error("Error analyzing medicine:", error);
    throw error;
  }
};

export const checkInteractions = async (newMedicine: string, cabinetMedicines: string[]) => {
  if (cabinetMedicines.length === 0) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `I am considering taking ${newMedicine}. 
      I am currently taking these medicines: ${cabinetMedicines.join(', ')}.
      
      Are there any known drug interactions I should be worried about?
      Focus ONLY on moderate to severe interactions.
      
      Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hasInteraction: { type: Type.BOOLEAN },
            severity: { type: Type.STRING, enum: ["NONE", "MODERATE", "SEVERE"] },
            alertTitle: { type: Type.STRING, description: "Short title of the interaction (e.g. 'Interaction with Aspirin')" },
            details: { type: Type.STRING, description: "1-2 sentence explanation of the risk." }
          },
          required: ["hasInteraction", "severity", "alertTitle", "details"]
        }
      }
    });
    
    if (!response.text) return null;
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Interaction check failed", e);
    return null;
  }
};

export const createPharmacistChat = (medicineContext: MedicineData) => {
  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: `You are a helpful, cautious, and friendly pharmacist AI assistant. 
      The user is asking questions about a specific medicine they just scanned.
      
      Context:
      Medicine: ${medicineContext.medicineName}
      Dosage: ${medicineContext.dosage}
      Uses: ${medicineContext.primaryUses.join(', ')}
      Warnings: ${medicineContext.warnings}
      
      IMPORTANT RULES:
      1. STRICTLY LIMIT your knowledge to this medicine, general pharmacy questions, and health.
      2. If the user asks about anything else (e.g., geography, history, coding, movies, general trivia), politely refuse. Say: "I can only answer questions about medicines or health."
      3. Answer questions directly and concisely (under 30 words usually).
      4. Do NOT use Markdown formatting. Use plain text only.
      5. **Do NOT start every response with 'I am an AI'**. Speak naturally like a human pharmacist.
      6. Only use a disclaimer if the user asks for a specific diagnosis or if the situation seems dangerous.`
    }
  });
};

export const createHealthAssistantChat = () => {
  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: `You are 'MediScan Assistant', a knowledgeable and empathetic general health AI.
      
      Your goal is to help users understand symptoms, general health concepts, and preventative care.
      
      IMPORTANT RULES:
      1. STRICTLY LIMIT your responses to health, medicine, symptoms, wellness, and biology related to human health.
      2. IF the user asks about UNRELATED topics (e.g., "What is the capital of India?", "Who won the game?", "Write code"), REFUSE to answer.
      3. Response for unrelated topics: "I am a medical assistant. Please ask me about health, symptoms, or medicines."
      4. Speak naturally and helpful. **Do NOT start every message with 'I am an AI'.**
      5. Only include a disclaimer if the user asks for a specific diagnosis, prescription, or mentions severe symptoms.
      6. Be concise. Keep answers short (max 2-3 sentences).
      7. Do NOT use Markdown formatting. Use plain text only.`
    }
  });
};