import { Metadata } from "next";
import PlaygroundClient from "@/components/playground/PlaygroundClient";

export const metadata: Metadata = {
  title: 'Labs',
  description: 'AI Model Inference Environment',
};

/**
 * Server Component for the Playground.
 * Passes the model ID to PlaygroundClient, which loads the model and runs inference in the browser.
 */
export default async function PlaygroundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlaygroundClient modelId={id} />;
}
