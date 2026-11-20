import { Metadata } from "next";
import UpdatePasswordClient from "@/components/auth/UpdatePasswordClient";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your Sequoia account.",
};

/** Target of Firebase's password reset email (`?mode=resetPassword&oobCode=...`). */
export default async function UpdatePasswordPage({ searchParams }: { searchParams: Promise<{ oobCode?: string }> }) {
  const { oobCode } = await searchParams;
  return <UpdatePasswordClient oobCode={oobCode} />;
}
