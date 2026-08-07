"use client";

import React, { useState, useEffect } from 'react';
import { Orbit, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CyberBrackets from '@/components/ui/CyberBrackets';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useAuthActions } from '@/hooks/auth/useAuthActions';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthClient() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const router = useRouter();
  const { user } = useAuth();
  
  const { 
    error, 
    message, 
    loading, 
    handleEmailAuth, 
    handleGoogleSignIn, 
    handleResetPassword,
    clearMessages 
  } = useAuthActions();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    clearMessages();
    setName('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleEmailAuth(isLogin, email, password, name);
  };

  return (
    <div className="h-[100dvh] w-full bg-space-bg flex flex-col items-center justify-center p-2 sm:p-4 relative overflow-hidden text-text-main font-sans select-none fixed inset-0">
      {/* Cyber Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: 'linear-gradient(color-mix(in srgb, var(--color-system) 3%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-system) 3%, transparent) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* Center Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] rounded-full bg-system/5 blur-[100px] pointer-events-none" />

      {/* Header Logo */}
      <div className="relative z-10 flex items-center gap-2 sm:gap-3 mb-4 sm:mb-8 [@media(max-height:750px)]:mb-4">
        <Orbit className="w-8 h-8 text-system animate-[spin_20s_linear_infinite]" />
        <div>
          <div className="flex items-center gap-2 mb-1 text-system">
            <span className="font-mono text-[10px] tracking-[0.3em]">SYS.AUTH.PROTOCOL</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-white tracking-[0.15em] m-0 leading-none drop-shadow-[0_0_15px_var(--color-system)]">
            SEQUOIA
          </h1>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        
        {/* Main Panel */}
        <div className="bg-black/60 border border-panel-border p-5 sm:p-8 [@media(max-height:750px)]:p-4 relative group transition-all duration-300">
          <CyberBrackets color="border-system/40" />
          
          <div className="text-center mb-4 sm:mb-8 [@media(max-height:750px)]:mb-4">
            <h2 className="text-lg sm:text-xl [@media(max-height:750px)]:text-lg font-heading font-bold text-white tracking-widest uppercase mb-1 sm:mb-2">
              {isLogin ? "IDENTITY_VERIFICATION" : "INITIALIZE_USER_NODE"}
            </h2>
            <p className="text-text-dim text-[9px] sm:text-xs font-mono tracking-wider">
              {isLogin ? "ENTER CREDENTIALS TO ACCESS SYSTEM" : "CREATE NEW IDENTIFIER"}
            </p>
          </div>

          <div className="space-y-3 mb-4">
            {error && (
              <div className="bg-red/10 border border-red/50 text-red p-3 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 animate-pulse shrink-0" />
                {error}
              </div>
            )}
            {message && (
              <div className="bg-system/10 border border-system/50 text-system p-3 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 animate-pulse shrink-0" />
                {message}
              </div>
            )}
          </div>

          {isLogin ? (
            <LoginForm 
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              loading={loading}
              onSubmit={handleSubmit}
              onResetPassword={() => handleResetPassword(email)}
            />
          ) : (
            <RegisterForm 
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              name={name}
              setName={setName}
              loading={loading}
              onSubmit={handleSubmit}
            />
          )}

          <div className="mt-4 sm:mt-8 [@media(max-height:750px)]:mt-4">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-panel-border border-dashed"></div>
              </div>
              <div className="relative bg-space-bg px-4 text-[10px] font-mono tracking-widest text-text-dim uppercase">
                EXTERNAL_AUTH
              </div>
            </div>

            <div className="mt-4 sm:mt-6">
              <button
                onClick={handleGoogleSignIn}
                type="button"
                className="w-full flex justify-center items-center py-2.5 [@media(max-height:750px)]:py-1.5 px-4 border border-panel-border hover:border-white/30 bg-black/40 text-xs font-mono font-bold tracking-widest text-white/70 hover:text-white transition-all duration-300 relative group overflow-hidden"
              >
                <div className="absolute left-0 top-0 w-1 h-full bg-white scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out" />
                <svg className="h-4 w-4 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {loading ? "PROCESSING..." : "CONNECT_GOOGLE"}
              </button>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-8 [@media(max-height:750px)]:mt-4 text-center text-[9px] sm:text-[10px] font-mono tracking-widest text-text-dim uppercase flex items-center justify-center gap-2">
            {isLogin ? "NO_IDENTIFIER_FOUND?" : "IDENTIFIER_EXISTS?"}
            <button
              onClick={toggleAuthMode}
              className="text-system hover:text-system/80 transition-colors"
            >
              [{isLogin ? 'INIT_REGISTRATION' : 'START_AUTH'}]
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
