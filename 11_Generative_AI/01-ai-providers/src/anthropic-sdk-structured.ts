import Anthropic from '@anthropic-ai/sdk';

export async function anthropicSdkStructured(prompt: string) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 256,
    system:
      'Respond in a structured JSON format with originalPrompt (string) and generatedResponse (string) fields. Do not include any other fields or markdown artifacts.',
    messages: [{ role: 'user', content: prompt }],
  });

  return msg;
}
