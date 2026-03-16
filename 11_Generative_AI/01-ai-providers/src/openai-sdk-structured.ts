import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const CustomSchema = z.object({
  originalPrompt: z.string(),
  generatedResponse: z.string(),
});

export async function openaiSdkStructured(prompt: string) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.responses.parse({
    model: 'gpt-4o-mini',
    input: prompt,
    text: {
      format: zodTextFormat(CustomSchema, 'CustomResponse'),
    },
  });
  return response.output;
}
