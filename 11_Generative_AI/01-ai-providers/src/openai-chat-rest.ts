import { type ChatCompletion } from 'openai/resources';

export async function openaiChatRest(prompt: string) {
	const res = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
		},
		body: JSON.stringify({
			model: 'gpt-4o-mini',
			messages: [
				{ role: 'system', content: 'You are a concise assistant.' },
				{ role: 'user', content: prompt }
			]
		})
	});
	const data = (await res.json()) as ChatCompletion;
	return data;
}
