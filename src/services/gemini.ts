import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateRouteSuggestions(query: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Genera una lista di 3-5 percorsi di trasporto reali basati sulla query: "${query}". 
      Includi coordinate precise (latitudine, longitudine) per partenza e arrivo.
      Assicurati di usare nomi di aeroporti reali per gli aerei (es. JFK, LHR) e porti reali per le navi (es. Rotterdam, Shanghai).
      Il campo "speed" deve essere compreso tra 0.0005 e 0.005 per simulare movimenti realistici.
      Ritorna solo JSON valido.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ["plane", "train", "ship"] },
              fromName: { type: Type.STRING },
              fromCoords: {
                type: Type.OBJECT,
                properties: {
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER }
                }
              },
              toName: { type: Type.STRING },
              toCoords: {
                type: Type.OBJECT,
                properties: {
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER }
                }
              },
              cargo: { type: Type.STRING },
              speed: { type: Type.NUMBER }
            },
            required: ["type", "fromName", "toName", "fromCoords", "toCoords"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
}
