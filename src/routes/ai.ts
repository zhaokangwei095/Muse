import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const router = Router();

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: { 'User-Agent': 'aistudio-build' },
    },
  });
};

// POST /api/ai/generate-inspiration
router.post('/generate-inspiration', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ error: 'Gemini API key is not configured' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are Muse, an AI creative companion for an aesthetic social platform.
The user asks: "${prompt || 'Suggest an inspiring post about lifestyle, architecture, or art.'}".
Please provide a creative title, engaging story/text (approx 100-150 words), and 3 relevant hashtags.
Return a clean JSON object with keys: title, text, tags (array of strings starting with #), suggestedCategory.`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text || '{}';
    const parsed = JSON.parse(outputText);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating AI inspiration:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate inspiration' });
  }
});

// POST /api/ai/chat-reply
router.post('/chat-reply', async (req: Request, res: Response) => {
  try {
    const { persona, lastMessage } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ error: 'Gemini API key is not configured' });
    }

    const systemInstruction = `You are ${persona?.name || 'Elena Rivera'}, a visual artist, travel photographer, and creative storyteller on the social platform Muse.
Your vibe is warm, thoughtful, creative, articulate, and friendly.
Keep your response concise, human, and conversational (1-3 sentences).
Context: You are replying to a direct message from a fellow Muse member.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `User message: "${lastMessage}"`,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    return res.json({ reply: response.text?.trim() || "Thanks for reaching out! I'd love to share more soon." });
  } catch (error: any) {
    console.error('Error generating chat reply:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate reply' });
  }
});

export default router;
