import { Metadata } from "next";
import UpdatePasswordClient from "@/components/auth/UpdatePasswordClient";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your Sequoia account.",
};

export default function UpdatePasswordPage() {
  return <UpdatePasswordClient />;
}
