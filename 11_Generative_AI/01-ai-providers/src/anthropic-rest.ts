import { type Message } from '@anthropic-ai/sdk/resources';

export async function anthropicRest(prompt: string) {
	const res = await fetch('https://api.anthropic.com/v1/messages', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			'x-api-key': `${process.env.ANTHROPIC_API_KEY}`,
			'anthropic-version': '2023-06-01'
		},
		body: JSON.stringify({
			model: 'claude-3-haiku-20240307',
			max_tokens: 256,
			system: 'You are a helpful technical reviewer.',
			messages: [{ role: 'user', content: prompt }],
			temperature: 0.3
		})
	});
	const json = (await res.json()) as Message;
	return json;
}
