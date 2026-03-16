import { type Responses } from 'openai/resources';

export async function openaiResponsesRest(prompt: string) {
	const res = await fetch('https://api.openai.com/v1/responses', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
		},
		body: JSON.stringify({
			model: 'gpt-4o-mini',
			input: prompt
			// Optional: tools, tool_choice, response_format, input as structured blocks
		})
	});
	const response = (await res.json()) as Responses.Response;
	return response.output;
}
