import React from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';

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
    <form onSubmit={onSubmit} className="space-y-3 sm:space-y-5 [@media(max-height:750px)]:space-y-3">
      {/* Email Input */}
      <div className="relative group/input">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Mail className="h-4 w-4 text-text-dim group-focus-within/input:text-system transition-colors" />
        </div>
        <input
          type="email"
          placeholder="EMAIL_ADDRESS"
          className="w-full pl-10 pr-4 py-3 [@media(max-height:750px)]:py-2 bg-black/40 border border-panel-border focus:border-system/50 outline-none transition-all placeholder:text-text-dim/50 text-sm font-mono tracking-wider text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {/* Password Input */}
      <div className="relative group/input">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock className="h-4 w-4 text-text-dim group-focus-within/input:text-system transition-colors" />
        </div>
        <input
          type="password"
          placeholder="PASSWORD_KEY"
          className="w-full pl-10 pr-4 py-3 [@media(max-height:750px)]:py-2 bg-black/40 border border-panel-border focus:border-system/50 outline-none transition-all placeholder:text-text-dim/50 text-sm font-mono tracking-wider text-white"
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
          className="text-[10px] font-mono tracking-widest text-system/70 hover:text-system transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Forgot Key?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 [@media(max-height:750px)]:py-2 px-4 relative group overflow-hidden bg-system/10 border border-system/30 transition-all duration-300 mt-4 [@media(max-height:750px)]:mt-2 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-system/20'}`}
      >
        <div className="absolute left-0 top-0 w-1 h-full bg-system scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out" />
        <span className="relative z-10 flex items-center justify-center font-heading font-bold tracking-[0.2em] text-system text-sm uppercase">
          {loading ? "PROCESSING..." : "AUTHENTICATE"}
          {!loading && <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />}
        </span>
        {!loading && <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-system/20 to-transparent transition-transform duration-700 ease-out pointer-events-none" />}
      </button>
    </form>
  );
}
