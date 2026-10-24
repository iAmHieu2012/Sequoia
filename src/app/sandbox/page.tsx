import { Metadata } from "next";
import SandboxClient from "@/components/sandbox/SandboxClient";

export const metadata: Metadata = {
  title: "Python Sandbox",
  description: "On-device Python WebAssembly execution environment.",
};

export default function SandboxPage() {
  return <SandboxClient />;
}
