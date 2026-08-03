import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { 
  streamText, 
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream
} from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages, modelId: requestedModelId } = await req.json();
    const modelId = requestedModelId || 'gemini-3.5-flash-lite';

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
    });

    const result = await streamText({
      model: google(modelId),
      messages: await convertToModelMessages(messages),
      system: `You are the SEQUOIA SYSTEM AI. You are a cyber-themed expert assistant focused on Artificial Intelligence, Machine Learning, and Coding. Keep responses concise, technical, and use markdown for formatting code and mathematics.`,
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (error: any) {
    const errorMessage = `[SYSTEM ERROR]: ${error.message || 'Unknown error occurred.'}`;
    // Return a Vercel AI SDK text chunk formatted response so it displays in the UI
    const encodedError = JSON.stringify(errorMessage).slice(1, -1);
    return new Response(`0:"${encodedError}"\n`, { 
      status: 200, // Return 200 so the frontend parses it as a message chunk
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}
