
import { GoogleGenAI, Type } from "@google/genai";
import { Patient, Language } from "./types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function cleanJsonResponse(text: string): string {
  return text.replace(/```json\n?|```/g, '').trim();
}

export async function analyzeClinicalRisks(patient: Patient, lang: Language): Promise<any[]> {
  const languageName = lang === 'ar' ? 'Arabic' : 'English';
  const prompt = `Senior Clinical Safety Expert. Analyze this patient for risks and learning opportunities:
  Patient: ${patient.name}, Diagnosis: ${patient.isbar.current_complaints.diagnosis}
  Medications: ${JSON.stringify(patient.medications)}
  Shift Events: ${JSON.stringify(patient.isbar.shift_notes)}
  
  Format: JSON array of objects {title, message, category: "hazard"|"warning"|"tip"|"learning"}. 
  Language: MUST be strictly in ${languageName}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              message: { type: Type.STRING },
              category: { type: Type.STRING, enum: ["hazard", "warning", "tip", "learning"] }
            },
            required: ["title", "message", "category"]
          }
        }
      }
    });
    return JSON.parse(cleanJsonResponse(response.text || '[]'));
  } catch (e) { 
    console.error("AI Analysis Error:", e);
    return []; 
  }
}

export async function generateNurseCarePlan(patient: Patient, lang: Language): Promise<any> {
  const languageName = lang === 'ar' ? 'Arabic' : 'English';
  const prompt = `Generate a professional Nursing Care Plan (NANDA-I, NIC, NOC) in TABLE format for:
  Diagnosis: ${patient.isbar.current_complaints.diagnosis}
  Assessment: ${JSON.stringify(patient.isbar.assessment)}
  Language: MUST be in ${languageName}.
  Format: JSON object { "headers": ["...", "..."], "rows": [["...", "..."]] }.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJsonResponse(response.text));
  } catch (e) { 
    console.error("AI Care Plan Error:", e);
    return null; 
  }
}

export async function generateShiftSummary(patient: Patient, lang: Language): Promise<string> {
  const languageName = lang === 'ar' ? 'Arabic' : 'English';
  const prompt = `Write a professional shift handover summary (Nursing Progress Note) based on these shift events:
  Patient: ${patient.name}
  Diagnosis: ${patient.isbar.current_complaints.diagnosis}
  Events during shift: ${JSON.stringify(patient.isbar.shift_notes)}
  Vitals: ${patient.isbar.assessment.vitals}
  
  Provide a professional clinical narrative with interpretations and recommendations for the next shift.
  Language: MUST be in ${languageName}.`;
  
  try {
    const response = await ai.models.generateContent({ 
      model: 'gemini-3-flash-preview', 
      contents: prompt 
    });
    return response.text || "";
  } catch (e) { 
    console.error("AI Shift Summary Error:", e);
    return ""; 
  }
}

export async function generateSmartMedTableData(patient: Patient, lang: Language): Promise<any> {
  const languageName = lang === 'ar' ? 'Arabic' : 'English';
  const prompt = `Analyze these medications: ${JSON.stringify(patient.medications)}. 
  Required Columns: Drug Name, Active Ingredient, Clinical Use, Nursing Monitoring.
  Language: MUST be in ${languageName}.
  Format: JSON object { "headers": ["...", "..."], "rows": [["...", "..."]] }.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJsonResponse(response.text));
  } catch (e) { 
    console.error("AI Med Analysis Error:", e);
    return null; 
  }
}

export async function generateMedicalSummary(patient: Patient, lang: Language): Promise<string> {
  const languageName = lang === 'ar' ? 'Arabic' : 'English';
  const prompt = `Write a professional clinical ISBAR summary for patient ${patient.name}. 
  Current State: ${patient.isbar.current_complaints.diagnosis}.
  Language: MUST be in ${languageName}. 
  Tone: Professional Medical.`;
  
  try {
    const response = await ai.models.generateContent({ 
      model: 'gemini-3-pro-preview', 
      contents: prompt 
    });
    return response.text || "";
  } catch (e) { 
    console.error("AI Summary Error:", e);
    return ""; 
  }
}
