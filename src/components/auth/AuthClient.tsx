"use client";

import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CyberGrid from '@/components/ui/CyberGrid';
import CyberPanel from '@/components/ui/CyberPanel';
import CyberButton from '@/components/ui/CyberButton';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useAuthActions } from '@/hooks/auth/useAuthActions';
import { useAuth } from '@/contexts/AuthContext';
import Image from "next/image";

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
    <div className="min-h-[100dvh] w-full bg-space-bg flex flex-col items-center justify-center p-4 py-8 relative overflow-hidden text-text-main font-sans select-none">
      <CyberGrid />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] rounded-full bg-white/5 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm md:max-w-4xl">
        
        {/* TOP MODULE - Solid White Decoration */}
        <div className="h-12 bg-white clip-mod-1 relative p-2 flex items-center justify-between mb-1">
          <span className="text-space-bg text-xs font-mono px-4 tracking-widest">
             {isLogin ? "SYS.AUTH.PROTOCOL" : "SYS.NODE.INITIALIZATION"}
          </span>
          <div className="w-16 h-2 bg-stripes-dark absolute bottom-2 right-4"></div>
        </div>

        {/* MAIN PANEL */}
        <CyberPanel variant="solid-dark" chamfer="tl-br" className="p-5 sm:p-8 [@media(max-height:750px)]:p-4 relative transition-all duration-300">
          
          {/* Main Logo & Title */}
          <div className="flex flex-col items-center justify-center text-center mb-6 sm:mb-8 [@media(max-height:750px)]:mb-4 relative">
            
            {/* Left accent dots */}
            <div className="absolute left-0 top-0 flex flex-col gap-1">
              <div className="w-1.5 h-1.5 bg-white"></div>
              <div className="w-1.5 h-1.5 bg-white"></div>
              <div className="w-1.5 h-1.5 bg-white"></div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 mb-3">
              <Image src="/bot-idle.gif" alt="Sequoia Bot" width={40} height={40} unoptimized className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
              <div className="text-left">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-white tracking-[0.15em] m-0 leading-none">
                  SEQUOIA
                </h1>
              </div>
            </div>
            
            <p className="text-white/70 text-xs font-mono tracking-widest uppercase mt-2">
              {isLogin ? "IDENTITY VERIFICATION REQUIRED" : "CREATE NEW USER IDENTIFIER"}
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {error && (
              <div className="bg-coral/10 border border-coral text-coral p-3 text-xs font-mono flex items-center gap-2 clip-chamfer-tl-br">
                <AlertTriangle className="w-4 h-4 animate-pulse shrink-0" />
                {error}
              </div>
            )}
            {message && (
              <div className="bg-white/10 border border-white text-white p-3 text-xs font-mono flex items-center gap-2 clip-chamfer-tl-br">
                <CheckCircle2 className="w-4 h-4 animate-pulse shrink-0" />
                {message}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 min-h-[320px] lg:min-h-[260px] [@media(max-height:550px)]:min-h-0">
            
            {/* Left Column: Form */}
            <div className="lg:pr-8 lg:border-r lg:border-white/40 lg:border-dashed flex flex-col justify-center">
              {isLogin ? (
                <LoginForm 
                  email={email} setEmail={setEmail}
                  password={password} setPassword={setPassword}
                  loading={loading} onSubmit={handleSubmit}
                  onResetPassword={() => handleResetPassword(email)}
                />
              ) : (
                <RegisterForm 
                  email={email} setEmail={setEmail}
                  password={password} setPassword={setPassword}
                  name={name} setName={setName}
                  loading={loading} onSubmit={handleSubmit}
                />
              )}
            </div>

            {/* Right Column: Google & Toggle */}
            <div className="lg:pl-8 flex flex-col justify-between">
              
              <div className="flex flex-col">
                <div className="flex items-center w-full mb-6">
                  <div className="flex-1 border-t border-white/40 border-dashed"></div>
                  <span className="px-4 text-xs font-mono tracking-widest text-white/40 uppercase">
                    EXTERNAL_AUTH
                  </span>
                  <div className="flex-1 border-t border-white/40 border-dashed"></div>
                </div>

                <div className="mb-4">
                  <CyberButton
                    onClick={handleGoogleSignIn}
                    type="button"
                    variant="secondary"
                    className="w-full"
                  >
                    <svg className="h-4 w-4 relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>{loading ? "PROCESSING..." : "CONNECT_GOOGLE"}</span>
                  </CyberButton>
                </div>
              </div>
              
              {/* Mode Toggle Area */}
              <div className="mt-8 flex flex-col items-center justify-center gap-3">
                <span className="text-xs font-mono tracking-[0.2em] text-white/40 uppercase">
                  {isLogin ? "NO_IDENTIFIER_FOUND?" : "IDENTIFIER_EXISTS?"}
                </span>
                <button
                  onClick={toggleAuthMode}
                  className="group relative px-6 py-2 text-xs font-mono font-bold tracking-[0.2em] text-white hover:text-space-bg transition-colors uppercase overflow-hidden clip-chamfer-tl-br bg-white/10 outline-none focus:outline-none transform-gpu"
                >
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 -z-10 transform-gpu"></div>
                  {isLogin ? 'INIT_REGISTRATION' : 'START_AUTH'}
                </button>
              </div>

            </div>
          </div>

        </CyberPanel>

      </div>
    </div>
  );
}
