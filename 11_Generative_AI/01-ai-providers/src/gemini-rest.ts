import { GenerateContentResponse } from '@google/genai';

export async function geminiRest(prompt: string) {
	const model = 'gemini-2.5-flash';
	const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'X-goog-api-key': process.env.GEMINI_API_KEY,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			contents: [{ role: 'user', parts: [{ text: prompt }] }]
		})
	});
	const json = (await res.json()) as GenerateContentResponse;
	return json;
}
