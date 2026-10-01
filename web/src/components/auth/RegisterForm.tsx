import React from 'react';
import { Mail, Lock, User } from 'lucide-react';
import CyberInput from '@/components/ui/CyberInput';
import CyberButton from '@/components/ui/CyberButton';

interface RegisterFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  name: string;
  setName: (val: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function RegisterForm({
  email,
  setEmail,
  password,
  setPassword,
  name,
  setName,
  loading,
  onSubmit
}: RegisterFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5 [@media(max-height:750px)]:space-y-3">
      <div className="space-y-1">
        <label className="text-xs font-mono tracking-widest text-white/40 uppercase">Display Name</label>
        <CyberInput
          icon={User}
          type="text"
          placeholder="DISPLAY_NAME"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

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
        <label className="text-xs font-mono tracking-widest text-white/40 uppercase">Security Key</label>
        <CyberInput
          icon={Lock}
          type="password"
          placeholder="PASSWORD_KEY"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="pt-4 [@media(max-height:750px)]:pt-2">
        <CyberButton type="submit" variant="primary" disabled={loading}>
          {loading ? "PROCESSING..." : "ESTABLISH_LINK"}
        </CyberButton>
      </div>
    </form>
  );
}
