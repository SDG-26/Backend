import { GoogleGenAI } from '@google/genai';

export async function geminiSdkStructured(prompt: string) {
	const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

	const response = await ai.models.generateContent({
		model: 'gemini-2.5-flash',
		contents: prompt,
		config: {
			responseMimeType: 'application/json',
			responseSchema: {
				type: 'object',
				properties: {
					originalPrompt: { type: 'string' },
					generatedResponse: { type: 'string' }
				},
				required: ['originalPrompt', 'generatedResponse']
			}
		}
	});

	return response;
}
