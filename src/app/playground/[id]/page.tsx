import { Metadata } from "next";
import PlaygroundClient from "@/components/playground/PlaygroundClient";

export const metadata: Metadata = {
  title: 'Labs',
  description: 'AI Model Inference Environment',
};

/**
 * Server Component for the Playground. 
 * Passes the ID down to the Client Component which handles all WebRTC/Canvas logic.
 */
export default async function PlaygroundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlaygroundClient modelId={id} />;
}
