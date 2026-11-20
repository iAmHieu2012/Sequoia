"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Lock } from "lucide-react";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import CyberGrid from "@/components/ui/CyberGrid";
import CyberPanel from "@/components/ui/CyberPanel";
import CyberInput from "@/components/ui/CyberInput";
import CyberButton from "@/components/ui/CyberButton";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { mapAuthError } from "@/hooks/auth/useAuthActions";

const MIN_LENGTH = 6; // Firebase's minimum password length

/**
 * Set a new password from the reset email. Firebase's link lands here with `?oobCode=...`
 * once the console's action URL points to /auth/update-password.
 * Same frame as the login page (AuthClient), single column.
 */
export default function UpdatePasswordClient({ oobCode }: { oobCode?: string }) {
  const router = useRouter();
  // null = still checking the code; "" = the code is invalid or expired.
  const [email, setEmail] = useState<string | null>(oobCode ? null : "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!oobCode) return;
    verifyPasswordResetCode(getFirebaseAuth(), oobCode)
      .then(setEmail)
      .catch(() => setEmail(""));
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!oobCode) return;
    if (password.length < MIN_LENGTH) return setError(`KEY_TOO_SHORT: MIN_${MIN_LENGTH}_CHARACTERS`);
    if (password !== confirm) return setError("KEYS_DO_NOT_MATCH");

    setSaving(true);
    try {
      await confirmPasswordReset(getFirebaseAuth(), oobCode, password);
      setDone(true);
      setTimeout(() => router.push("/auth"), 1500);
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-space-bg flex flex-col items-center justify-center p-4 py-8 relative overflow-hidden text-text-main font-sans select-none">
      <CyberGrid />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] rounded-full bg-white/5 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">

        {/* TOP MODULE - Solid White Decoration */}
        <div className="h-12 bg-white clip-mod-1 relative p-2 flex items-center justify-between mb-1">
          <span className="text-space-bg text-xs font-mono px-4 tracking-widest">SYS.KEY.RESET</span>
          <div className="w-16 h-2 bg-stripes-dark absolute bottom-2 right-4"></div>
        </div>

        {/* MAIN PANEL */}
        <CyberPanel variant="solid-dark" chamfer="tl-br" className="p-5 sm:p-8 [@media(max-height:750px)]:p-4 relative">

          {/* Main Logo & Title */}
          <div className="flex flex-col items-center justify-center text-center mb-6 sm:mb-8 [@media(max-height:750px)]:mb-4 relative">
            {/* Left accent dots */}
            <div className="absolute left-0 top-0 flex flex-col gap-1">
              <div className="w-1.5 h-1.5 bg-white"></div>
              <div className="w-1.5 h-1.5 bg-white"></div>
              <div className="w-1.5 h-1.5 bg-white"></div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 mb-3">
              <Image src="/bot.svg" alt="" width={40} height={40} unoptimized className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
              <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-[0.15em] m-0 leading-none">
                SEQUOIA
              </h1>
            </div>

            <p className="text-white/70 text-xs font-mono tracking-widest uppercase mt-2">RESET ACCESS KEY</p>
            {email && (
              <p className="text-white/40 text-xs font-mono tracking-wider mt-1 normal-case break-all">{email}</p>
            )}
          </div>

          {email === null ? (
            <p className="text-center text-white/40 font-mono text-xs tracking-widest animate-pulse">VERIFYING_RESET_LINK...</p>
          ) : email === "" ? (
            <div className="space-y-6">
              <div className="bg-coral/10 border border-coral text-coral p-3 text-xs font-mono flex items-center gap-2 clip-chamfer-tl-br">
                <AlertTriangle className="w-4 h-4 animate-pulse shrink-0" />
                RESET_LINK_INVALID_OR_EXPIRED. REQUEST_A_NEW_ONE FROM THE LOGIN PAGE.
              </div>
              <CyberButton href="/auth" variant="secondary">BACK_TO_LOGIN</CyberButton>
            </div>
          ) : done ? (
            <div className="bg-white/10 border border-white text-white p-3 text-xs font-mono flex items-center gap-2 clip-chamfer-tl-br">
              <CheckCircle2 className="w-4 h-4 animate-pulse shrink-0" />
              ACCESS_KEY_UPDATED. REDIRECTING TO LOGIN...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 [@media(max-height:750px)]:space-y-4">
              {error && (
                <div className="bg-coral/10 border border-coral text-coral p-3 text-xs font-mono flex items-center gap-2 clip-chamfer-tl-br">
                  <AlertTriangle className="w-4 h-4 animate-pulse shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-mono tracking-widest text-white/40 uppercase" htmlFor="new-password">New Access Code</label>
                <CyberInput id="new-password" icon={Lock} type="password" autoComplete="new-password" placeholder="NEW_PASSWORD_KEY"
                  value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono tracking-widest text-white/40 uppercase" htmlFor="confirm-password">Confirm Access Code</label>
                <CyberInput id="confirm-password" icon={Lock} type="password" autoComplete="new-password" placeholder="REPEAT_PASSWORD_KEY"
                  value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
              </div>

              <div className="pt-2 space-y-3">
                <CyberButton type="submit" variant="primary" disabled={saving}>{saving ? "PROCESSING..." : "UPDATE_KEY"}</CyberButton>
                <CyberButton href="/auth" variant="secondary">CANCEL</CyberButton>
              </div>
            </form>
          )}
        </CyberPanel>
      </div>
    </div>
  );
}
