"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Lock } from "lucide-react";
import CyberGrid from "@/components/ui/CyberGrid";
import CyberPanel from "@/components/ui/CyberPanel";
import CyberInput from "@/components/ui/CyberInput";
import CyberButton from "@/components/ui/CyberButton";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/utils/supabase/client";

const MIN_LENGTH = 6; // Supabase's default minimum password length

/**
 * Set a new password after opening the reset link from the email.
 * The link goes through /auth/callback, which signs the user in before landing here.
 */
export default function UpdatePasswordClient() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < MIN_LENGTH) return setError(`KEY_TOO_SHORT: MIN_${MIN_LENGTH}_CHARACTERS`);
    if (password !== confirm) return setError("KEYS_DO_NOT_MATCH");

    setSaving(true);
    const { error: updateError } = await createClient().auth.updateUser({ password });
    setSaving(false);
    if (updateError) return setError(updateError.message || "FAILED_TO_UPDATE_KEY");

    setDone(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-space-bg flex items-center justify-center p-4 relative overflow-hidden text-text-main font-sans">
      <CyberGrid />
      <CyberPanel variant="solid-dark" chamfer="tl-br" className="relative z-10 w-full max-w-sm p-6 sm:p-8 flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-display font-black text-white tracking-[0.15em]">RESET_ACCESS_KEY</h1>
          <p className="text-white/70 text-xs font-mono tracking-widest uppercase mt-2">Set a new password for your account</p>
        </div>

        {authLoading ? (
          <p className="text-white/40 font-mono text-xs tracking-widest animate-pulse">VERIFYING_RESET_LINK...</p>
        ) : !user ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-2 text-coral bg-coral/10 border border-coral/30 p-3 font-mono text-xs tracking-widest">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              RESET_LINK_INVALID_OR_EXPIRED. REQUEST_A_NEW_ONE FROM THE LOGIN PAGE.
            </div>
            <CyberButton href="/auth" variant="secondary">BACK_TO_LOGIN</CyberButton>
          </div>
        ) : done ? (
          <div className="flex items-start gap-2 text-teal bg-teal/10 border border-teal/30 p-3 font-mono text-xs tracking-widest">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            ACCESS_KEY_UPDATED. REDIRECTING...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="flex items-start gap-2 text-coral bg-coral/10 border border-coral/30 p-3 font-mono text-xs tracking-widest">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            <label className="text-xs font-mono tracking-widest text-white/40 uppercase" htmlFor="new-password">New Access Code</label>
            <CyberInput id="new-password" icon={Lock} type="password" autoComplete="new-password" placeholder="NEW_PASSWORD_KEY"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
            <label className="text-xs font-mono tracking-widest text-white/40 uppercase" htmlFor="confirm-password">Confirm Access Code</label>
            <CyberInput id="confirm-password" icon={Lock} type="password" autoComplete="new-password" placeholder="REPEAT_PASSWORD_KEY"
              value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            <CyberButton type="submit" variant="primary" disabled={saving}>{saving ? "PROCESSING..." : "UPDATE_KEY"}</CyberButton>
            <Link href="/dashboard" className="text-center text-xs font-mono tracking-widest text-white/40 hover:text-white uppercase">Skip</Link>
          </form>
        )}
      </CyberPanel>
    </div>
  );
}
