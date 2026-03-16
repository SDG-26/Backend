import { anthropicRest } from './anthropic-rest.ts';
import { anthropicSdkStructured } from './anthropic-sdk-structured.ts';
import { geminiRest } from './gemini-rest.ts';
import { geminiSdkStructured } from './gemini-sdk-structured.ts';
import { openaiChatRest } from './openai-chat-rest.ts';
import { openaiResponsesRest } from './openai-responses-rest.ts';
import { openaiSdkStructured } from './openai-sdk-structured.ts';

// get first user argument as provider or all and second as prompt
const args = process.argv.slice(2);
const provider = args[0];
const prompt = args.slice(1).join(' ') || 'What is the capital of Germany?';

async function main() {
	const sections: Array<[string, Promise<any>]> = [];
	switch (provider) {
		case 'openai': {
			sections.push(['OpenAI Chat REST', openaiChatRest(prompt)]);
			sections.push(['OpenAI Responses REST', openaiResponsesRest(prompt)]);
			sections.push(['OpenAI SDK Structured', openaiSdkStructured(prompt)]);
			break;
		}
		case 'anthropic': {
			sections.push(['Anthropic REST', anthropicRest(prompt)]);
			sections.push([
				'Anthropic SDK Structured',
				anthropicSdkStructured(prompt)
			]);
			break;
		}
		case 'google': {
			sections.push(['Gemini REST', geminiRest(prompt)]);
			sections.push(['Gemini SDK Structured', geminiSdkStructured(prompt)]);
			break;
		}
		default: {
			console.log(
				'You need to run the script passing a valid provider and a prompt...'
			);
		}
	}

	for (const [label, p] of sections) {
		try {
			const out = await p;
			console.log(`\n=== ${label} ===`);
			console.dir(out, { depth: null });
		} catch (err) {
			console.log(`\n=== ${label} (error) ===`);
			console.error(err);
		}
	}
}

main();
