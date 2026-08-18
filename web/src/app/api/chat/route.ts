import { NextResponse } from 'next/server';
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
    
    console.log(`[API CHAT] Processing request with model: ${modelId}`);

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
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
