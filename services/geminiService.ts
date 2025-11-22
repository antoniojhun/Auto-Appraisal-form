import { GoogleGenAI, Type } from "@google/genai";
import { VehicleDetails } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeVehicleImage = async (base64Image: string): Promise<Partial<VehicleDetails>> => {
  try {
    // Remove header if present (e.g., "data:image/jpeg;base64,")
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: "Analyze this image of a vehicle. Extract the Make, Model, Colour, and Registration Number (Reg No) if they are clearly visible. Return the data in JSON format."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            make: { type: Type.STRING },
            model: { type: Type.STRING },
            colour: { type: Type.STRING },
            regNo: { type: Type.STRING },
          }
        }
      }
    });

    const text = response.text;
    if (!text) return {};
    
    const data = JSON.parse(text);
    return data as Partial<VehicleDetails>;

  } catch (error) {
    console.error("Error analyzing vehicle image:", error);
    return {};
  }
};

export const decodeVin = async (vin: string): Promise<Partial<VehicleDetails>> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            text: `Decode this VIN: ${vin}. This is for an Australian market vehicle.
                   
                   CRITICAL RULES:
                   1. **Year**: Identify the year using the 10th character of the VIN (Standard ISO 3779). 
                      - L = 2020, M = 2021, N = 2022, P = 2023, R = 2024, S = 2025.
                   2. **Make/Model**: Use the WMI (first 3 chars) and VDS (next 5) to identify Make and Model reliably.
                   3. **Trim**: If the specific Trim level (e.g. 'Touring') isn't clear, use the Body Type (e.g. 'Wagon', 'SUV', 'Sedan').
                   
                   Return JSON with fields: make, model, year, trim.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            make: { type: Type.STRING },
            model: { type: Type.STRING },
            year: { type: Type.STRING },
            trim: { type: Type.STRING },
          }
        }
      }
    });

    const text = response.text;
    if (!text) return {};
    
    const data = JSON.parse(text);
    return data as Partial<VehicleDetails>;

  } catch (error) {
    console.error("Error decoding VIN:", error);
    return {};
  }
};