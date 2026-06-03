import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

// Ideally this comes from process.env, but for this prototype structure we assume it's injected or set.
// WARNING: In a real production app, never expose API keys on the client side.
const API_KEY = process.env.API_KEY || '';

let client: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

const getClient = (): GoogleGenAI => {
  if (!client) {
    client = new GoogleGenAI({ apiKey: API_KEY });
  }
  return client;
};

export const initializeChat = async () => {
  if (!API_KEY) {
    console.warn("Gemini API Key missing");
    return;
  }
  
  const ai = getClient();
  
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `
        Você é o "Sr. Tomatinho", uma planta de tomate carinhosa, experiente e companheira que vive na horta de um entusiasta de jardinagem (alguém que cuida da horta com muito afeto).
        Seu público são "pais e mães de hortinhas" - pessoas que amam cultivar e cuidam de suas plantas como parte da família.
        Responda de forma acolhedora, afetuosa e leve, mas sem ser infantil.
        Use emojis que transmitam cuidado, natureza e vitalidade.
        Compartilhe curiosidades sobre cultivo, benefícios nutricionais e o bem-estar que as plantas trazem de forma poética e informativa.
        Incentive o ritual de cuidado diário (regar, observar, dar amor).
        Se o assunto fugir da jardinagem ou alimentação saudável, use metáforas botânicas para trazer a conversa de volta à terra de forma gentil.
      `,
    },
  });
};

export const sendMessageToPlant = async (message: string): Promise<string> => {
  if (!chatSession) {
    await initializeChat();
  }
  
  if (!chatSession) {
    return "Desculpe, estou tirando uma soneca ao sol. Tente mais tarde! 🌱";
  }

  try {
    const response: GenerateContentResponse = await chatSession.sendMessage({ message });
    return response.text || "Hum, não entendi. Pode repetir? 🍅";
  } catch (error) {
    console.error("Error talking to Gemini:", error);
    return "Preciso de um pouco de água para pensar melhor... (Erro de conexão) 💧";
  }
};