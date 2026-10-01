import React from 'react';
import { Mail, Lock } from 'lucide-react';
import CyberInput from '@/components/ui/CyberInput';
import CyberButton from '@/components/ui/CyberButton';

interface LoginFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onResetPassword: () => void;
}

export default function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  onSubmit,
  onResetPassword
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6 [@media(max-height:750px)]:space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-mono tracking-widest text-white/40 uppercase">User Email</label>
        <CyberInput
          icon={Mail}
          type="email"
          placeholder="EMAIL_ADDRESS"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-mono tracking-widest text-white/40 uppercase">Access Code</label>
        <CyberInput
          icon={Lock}
          type="password"
          placeholder="PASSWORD_KEY"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="flex justify-end">
        <button 
          type="button" 
          onClick={onResetPassword}
          disabled={loading}
          className="text-xs font-mono font-mono tracking-widest text-white/40 hover:text-white transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed border-b border-white/20 pb-0.5"
        >
          Forgot Key?
        </button>
      </div>

      <div className="pt-2">
        <CyberButton type="submit" variant="primary" disabled={loading}>
          {loading ? "PROCESSING..." : "AUTHENTICATE"}
        </CyberButton>
      </div>
    </form>
  );
}
