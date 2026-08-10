"use client";

import { useState, useEffect } from "react";
import { User, LogOut, Settings, Palette, GitBranch, Shield, FileText, ChevronRight, ChevronLeft, X, Cpu, Activity, Terminal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/utils/supabase/client";
import CyberBrackets from "@/components/ui/CyberBrackets";

interface CommandCenterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const THEMES = [
  { id: "system", name: "DEFAULT_SYSTEM", hex: "#49aeae" },
  { id: "grey", name: "GREY", hex: "#808080" },
  { id: "red", name: "RED", hex: "#ff4242" },
  { id: "orange", name: "ORANGE", hex: "#ff9900" },
  { id: "yellow", name: "YELLOW", hex: "#ffff42" },
  { id: "green", name: "GREEN", hex: "#42ff42" },
  { id: "turquoise", name: "TURQUOISE", hex: "#00ff99" },
  { id: "cyan", name: "CYAN", hex: "#42ffff" },
  { id: "blue", name: "BLUE", hex: "#4242ff" },
  { id: "purple", name: "PURPLE", hex: "#9900ff" },
  { id: "pink", name: "PINK", hex: "#ff42ff" },
];

const PRIVACY_CYBERPUNK = `[ SECURITY CLEARANCE: LEVEL 4 ] - NODE DATA ARCHIVAL DIRECTIVE

OVERSEER DIRECTIVE: By synchronizing with Sequoia Nexus, the Entity (Node) automatically accepts the protocol for biometric data extraction and identity signaling to maintain the integrity of The Grid.

1. SIGNAL EXTRACTION (DATA COLLECTION):
- Basic Biometric Identification: The system automatically extracts and seals your Email, Display Name, and Lifeform Identifier (Firebase UID) upon completion of the Initiation sequence.
- Neural Footprints: Every interaction within the Cosmos Space (Viewed Articles, Saved Coordinates, Query History) is tracked and continuously overwritten into the Firestore Data Core to optimize your personalized experience.
- Session Protocols: We archive cryptographic tokens and Browser Fingerprints to intercept and neutralize any hijacking attempts.

2. DATA STANDARDIZATION (DATA UTILIZATION):
- Environment Reconstruction: Your data is utilized to maintain the state of the Nexus (Themes, Layouts, History), ensuring that when you disconnect and return, the Cosmos Space remains exactly as you left it.
- Algorithmic Optimization: The System AI processes your reading history to train and navigate Anomalies tailored to your cognitive capacity.

3. ZERO-LEAK & THIRD-PARTY PROTOCOL:
- All data is fortified by military-grade 256-bit encryption barriers.
- The system pledges to never sell, trade, or sacrifice your Signal Data to any external Third-Party Corporations or off-grid archival organizations.

4. ENTITY JURISDICTION (NODE RIGHTS):
- You reserve the right to request Total Obliteration. By transmitting this command to the Overseer, your entire Signal, Data, and History will be permanently vaporized from the Data Core, beyond recovery.`;

const PRIVACY_LEGAL = `PRIVACY POLICY

Effective Date: January 1, 2026

1. INFORMATION WE COLLECT
- Personal Information: When you register for an account, we collect strictly necessary personal details including your Email Address, Display Name, and a unique authentication identifier (Firebase UID).
- Usage Data: We log your interactions within the platform, including saved articles, spatial coordinates in the Cosmos map, UI preferences, and session timestamps.
- Technical Data: For security purposes, we may collect browser type, device identifiers, and encrypted session tokens.

2. HOW WE USE YOUR INFORMATION
- Service Provision: To create and maintain your account, and synchronize your progress and preferences across multiple sessions and devices.
- Personalization: To dynamically adjust the content, layout, and recommendations based on your interaction history.
- Security: To monitor for unauthorized access, malicious activities, and to enforce our Terms of Service.

3. DATA SHARING AND DISCLOSURE
- Zero-Sell Policy: We absolutely do not sell, rent, or trade your personal information to advertisers, data brokers, or any third-party corporations.
- Third-Party Infrastructure: We utilize industry-standard cloud providers (such as Google Firebase) solely for the purpose of hosting and securing your data. These providers are strictly bound by their own enterprise privacy agreements.
- Legal Compliance: We may disclose information if required to do so by law or in response to valid requests by public authorities.

4. DATA SECURITY
Your data is encrypted both in transit (via HTTPS/TLS) and at rest. While we implement commercially acceptable means to protect your personal information, no method of transmission over the Internet is 100% secure.

5. YOUR RIGHTS
You reserve the right to request access to, modification, or complete deletion of your personal data at any time. To exercise these rights, please contact the platform administrators.`;

const TERMS_CYBERPUNK = `[ SYSTEM WARNING ] - NEXUS CONNECTION & OPERATION PROTOCOLS

WARNING: By executing the INITIATE_SPAWN command and entering the Cosmos Space, you have forged a Digital Pact with the Sequoia Nexus System.

1. ACCESS & IDENTITY:
- You are designated a unique Node ID. You bear absolute responsibility for any Data Streams originating from your Node.
- Leaking your decryption key (Password) to other Entities is a critical protocol violation.

2. PROHIBITED PROTOCOLS:
- Core Breach: All attempts at Reverse Engineering, API exploitation, or malicious code injection (XSS/Payloads) into the System are strictly forbidden.
- Bandwidth Saturation: The deployment of bots, automated scripts, or mass query floods (DDoS) designed to overload the Server will be instantly neutralized by our defense grid.
- Spatial Sabotage: Erasing, corrupting, or destroying Anomalies (Articles) and Nebulas belonging to others (for Admin nodes) will result in permanent revocation of privileges.
=> PENALTY: Any aforementioned violations will instantly trigger the Total Neutralization Protocol (Terminate Session & IP Ban) without prior warning.

3. OVERSEER JURISDICTION (SYSTEM RIGHTS):
- The System reserves the right to demote, alter coordinates, or purge any content generated by you if it violates the Nexus Standard Codex.
- The Cosmos Space may experience partial or total collapse (Server Maintenance/Downtime) at any moment for Algorithmic Upgrades.

4. LIMITATION OF LIABILITY:
- The System is provided "AS IS". The Overseer assumes no responsibility for temporary data loss, memory corruption, or psychological trauma induced by diving too deep into the Cosmos Space.`;

const TERMS_LEGAL = `TERMS OF SERVICE

Effective Date: January 1, 2026

1. ACCEPTANCE OF TERMS
By accessing, registering, or using the Sequoia Nexus platform ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you may not access the Service.

2. USER CONDUCT AND RESPONSIBILITIES
- Account Security: You are solely responsible for safeguarding your account credentials. You must notify us immediately of any unauthorized use of your account.
- Acceptable Use: You agree to use the Service only for lawful purposes. You shall not engage in any activity that disrupts, diminishes the quality of, or interferes with the performance of the Service.
- Prohibited Actions: You explicitly agree NOT to:
  a. Use automated scripts, bots, or scrapers to access the API.
  b. Attempt to reverse-engineer, decompile, or hack the platform's infrastructure.
  c. Upload malicious code, viruses, or illegal content.

3. INTELLECTUAL PROPERTY
All content, features, and functionality provided on the Service (including but not limited to design, text, graphics, and interactive elements) are owned by the Sequoia developers. You may not reproduce, distribute, or create derivative works without express written permission.

4. TERMINATION
We reserve the right to suspend or permanently terminate your account and refuse any current or future use of the Service, at our sole discretion, without prior notice, if you breach these Terms of Service.

5. LIMITATION OF LIABILITY
The Service is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind. In no event shall the developers or administrators be liable for any direct, indirect, incidental, or consequential damages resulting from your use of or inability to use the Service, including but not limited to data loss or server downtime.

6. MODIFICATIONS TO TERMS
We reserve the right to modify these terms at any time. Continued use of the Service after any such changes shall constitute your consent to such changes.`;

const ABOUT_CYBERPUNK = `[ SYSTEM LOG: THE SEQUOIA INITIATIVE ]

PROJECT DESIGNATION: SEQUOIA NEXUS V1.0.0
CHIEF ARCHITECT: OVERSEER IAMHIEU2012
SYSTEM STATUS: ONLINE // CONTINUOUS EXPANSION

The Sequoia Nexus was not forged to be a mere archival database. It is a living, breathing neural architecture, engineered to map the chaotic anomalies of human knowledge into navigable Cosmos structures.

Within this Grid, isolated fragments of information (Rogue Anomalies) are pulled into gravitational orbits, coalescing into brilliant Nebulas and interconnected Star Systems. By spatializing knowledge, the Nexus empowers Entities to traverse a boundless universe of data seamlessly.

We do not merely store information; we forge neural pathways. 
Welcome to the Cosmos.`;

const ABOUT_LEGAL = `ABOUT SEQUOIA

Sequoia is a comprehensive, highly interactive knowledge mapping platform engineered by Hieu (iamhieu2012). 
At its core, the project revolutionizes how we interact with information: transforming flat, static articles into an expansive, interconnected 2D spatial map (The Cosmos).

TECHNICAL ARCHITECTURE (TECH STACK):
- Frontend: Next.js, React, TailwindCSS, and native Canvas API for fluid spatial rendering and cyberpunk UI/UX.
- Backend: Kotlin / Ktor framework handling robust, high-speed API routing and business logic.
- Infrastructure: Firebase Authentication & Firestore ensuring seamless, real-time data synchronization.

Sequoia was built with a profound passion for Sci-Fi/Cyberpunk aesthetics, aiming to deliver a premium, game-like user experience within a functional, modern web application.`;

export default function CommandCenterPanel({ isOpen, onClose }: CommandCenterPanelProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTheme, setActiveTheme] = useState(() => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|; )sequoia_theme=([^;]*)/);
      if (match) return decodeURIComponent(match[1]);
    }
    return "system";
  });
  const [wheelRotation, setWheelRotation] = useState(0);
  const [activeView, setActiveView] = useState<'main' | 'privacy' | 'terms' | 'about'>('main');
  const [isDecrypted, setIsDecrypted] = useState(false);

  useEffect(() => {
    setIsDecrypted(false);
  }, [activeView]);

  useEffect(() => {
    const root = document.documentElement;
    const colorVars = [
      '--color-system',
      '--color-red',
      '--color-green',
      '--color-blue',
      '--color-yellow',
      '--color-pink',
      '--color-cyan',
      '--color-orange',
      '--color-turquoise',
      '--color-purple',
      '--color-grey'
    ];

    if (activeTheme === "system") {
      colorVars.forEach(v => root.style.removeProperty(v));
      document.cookie = "sequoia_theme=system; path=/; max-age=31536000";
    } else {
      const selectedHex = THEMES.find(t => t.id === activeTheme)?.hex;
      if (selectedHex) {
        colorVars.forEach(v => root.style.setProperty(v, selectedHex));
        document.cookie = `sequoia_theme=${activeTheme}; path=/; max-age=31536000`;
      }
    }
    router.refresh();
  }, [activeTheme, router]);

  // Calculate shortest path for wheel rotation
  useEffect(() => {
    const activeIndex = THEMES.filter(t => t.id !== "system" && t.id !== "grey").findIndex(t => t.id === activeTheme);
    if (activeIndex === -1) return;
    
    const targetAngle = -(activeIndex * 360) / 9;
    
    setWheelRotation(prev => {
      const currentMod = prev % 360;
      let diff = targetAngle - currentMod;
      
      // Normalize difference to [-180, 180] for shortest path
      if (diff > 180) diff -= 360;
      else if (diff < -180) diff += 360;
      
      return prev + diff;
    });
  }, [activeTheme]);

  if (!isOpen) return null;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-opacity"
        onClick={onClose}
      />
      
      {/* Sliding Panel */}
      <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden">
        
        {/* Scanline overlay for full screen */}
        <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(to_bottom,transparent_50%,#fff_50%)] bg-[length:100%_4px]" />
        
        {/* Universal Header */}
        <header className="flex-shrink-0 relative z-50 flex items-center justify-between px-6 py-4 border-b border-system/20 bg-black/80 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <button 
              onClick={onClose}
              className="inline-flex items-center text-[10px] font-mono tracking-widest uppercase bg-system/5 text-system px-4 py-2 hover:bg-system/20 hover:text-white transition-all duration-300 relative group overflow-hidden"
            >
              <CyberBrackets color="border-system/30 group-hover:border-system transition-colors duration-300" />
              <div className="absolute left-0 top-0 w-1 h-full bg-system scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-system)]" />
              <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-system/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
              <span className="relative z-10 flex items-center gap-1 group-hover:drop-shadow-[0_0_8px_var(--color-system)]">
                <X className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                [ ESC ] CLOSE_PANEL
              </span>
            </button>

            <div className="flex-col hidden sm:flex">
              <span className="text-[9px] font-mono text-system/60 tracking-widest uppercase">COMMAND_CENTER</span>
              <span className="text-sm font-heading font-bold text-white tracking-widest uppercase flex items-center gap-2">
                <Terminal className="w-4 h-4 text-system" />
                IDENTITY_CONFIG
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-mono text-system/60 tracking-widest uppercase">SYS_STATUS</span>
              <span className="text-xs font-mono text-system tracking-widest uppercase flex items-center gap-2">
                PANEL_ACTIVE
                <span className="w-2 h-2 bg-system shadow-[0_0_8px_var(--color-system)] animate-pulse" />
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Grid or Document Viewer */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 relative z-10 flex flex-col justify-center">
          {activeView === 'main' ? (
            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono animate-in fade-in duration-500">
          
            {/* Column 1: User Profile & Logout */}
            <div className="flex flex-col gap-6">
              <section className="space-y-4">
                <h3 className="text-xs text-text-dim tracking-[0.3em] uppercase border-b border-white/10 pb-2">Active_User_Node</h3>
                <div className="flex flex-col gap-4 bg-system/5 border border-system/20 p-4 relative group">
                  <CyberBrackets color="border-system/40" />
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-system/10 border border-system flex items-center justify-center shrink-0 shadow-[0_0_10px_var(--color-system)]">
                      {user?.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-system" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1 overflow-hidden py-1">
                      <span className="text-white font-bold truncate text-lg">
                        {user?.user_metadata?.name || user?.email?.split('@')[0] || "GUEST_USER"}
                      </span>
                      <span className="text-system/70 text-xs truncate">
                        {user?.email || "NO_AUTH_EMAIL"}
                      </span>
                      <span className="inline-block mt-2 bg-system text-black font-bold text-[10px] px-2 py-0.5 w-fit border border-system uppercase tracking-widest shadow-[0_0_10px_var(--color-system)]">
                        Level: EXPLORER
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mt-4">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 p-3 border border-coral/30 hover:border-coral bg-coral/5 hover:bg-coral/20 text-coral text-xs font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_transparent] hover:shadow-[0_0_15px_var(--color-coral)]"
                >
                  <LogOut className="w-4 h-4" />
                  Terminate_Session
                </button>
              </section>
            </div>

            {/* Column 2: Theme Personalization */}
            <section className="space-y-4">
              <h3 className="text-xs text-text-dim tracking-[0.3em] uppercase border-b border-white/10 pb-2 flex items-center gap-2">
                <Palette className="w-4 h-4" /> System_Theme
              </h3>
              
              <div className="flex flex-col items-center justify-center bg-black/60 border border-white/10 py-6 px-4 relative overflow-hidden group">
                <CyberBrackets color="border-white/10 group-hover:border-system/40 transition-colors" />
                
                {/* Cyberpunk Dial Color Picker */}
                <div className="relative w-48 h-48 flex items-center justify-center mb-6 mt-2">
                  {/* Radar decorations */}
                  <div className="absolute inset-0 border border-white/10 rounded-full animate-[spin_60s_linear_infinite]" />
                  <div className="absolute inset-6 border border-white/20 border-dashed rounded-full animate-[spin_40s_linear_infinite_reverse]" />
                  
                  {/* Crosshairs */}
                  <div className="absolute w-full h-[1px] bg-white/10 pointer-events-none" />
                  <div className="absolute h-full w-[1px] bg-white/10 pointer-events-none" />
                  
                  {/* Center Visual Core (Indicator Only) */}
                  <div className="relative z-20 w-14 h-14 rounded-full flex items-center justify-center">
                    {activeTheme === "system" ? (
                      <>
                        <div 
                          className="absolute inset-0 rounded-full animate-[spin_10s_linear_infinite]"
                          style={{
                            background: "conic-gradient(#ff4242, #ff9900, #ffff42, #42ff42, #00ff99, #42ffff, #4242ff, #9900ff, #ff42ff, #ff4242)",
                            boxShadow: "0 0 20px rgba(255,255,255,0.3)"
                          }}
                        />
                        <div className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center bg-[#111] shadow-[inset_0_0_10px_rgba(0,0,0,1)]">
                          <div className="w-3 h-3 rounded-full bg-white/20" />
                        </div>
                      </>
                    ) : (
                      <div 
                        className="absolute inset-0 rounded-full transition-all duration-500 flex items-center justify-center"
                        style={{ 
                          backgroundColor: THEMES.find(t => t.id === activeTheme)?.hex || "#808080",
                          boxShadow: `0 0 20px ${THEMES.find(t => t.id === activeTheme)?.hex || "#808080"}`
                        }}
                      >
                        <div className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-white/70" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rotating Wheel Container */}
                  <div 
                    className="absolute w-full h-full flex items-center justify-center transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ transform: `rotate(${wheelRotation}deg)` }}
                  >
                    {/* 9 Outer Radial Ticks */}
                    {THEMES.filter(t => t.id !== "system" && t.id !== "grey").map((theme, index) => {
                      const angle = (index * 360) / 9; // 9 items
                      const physicalAngle = angle - 90; // Start at -90 degrees (12 o'clock)
                      const radian = physicalAngle * (Math.PI / 180); 
                      const radius = 68; // px distance from center (scaled down for fit)
                      const x = Math.cos(radian) * radius;
                      const y = Math.sin(radian) * radius;
                      
                      const isSelected = activeTheme === theme.id;
                      
                      return (
                        <button
                          key={theme.id}
                          onClick={() => setActiveTheme(theme.id)}
                          className={`absolute transition-all duration-300 z-10 flex items-center justify-center ${isSelected ? "w-10 h-3 z-30" : "w-6 h-1.5 hover:w-8 hover:h-2"}`}
                          style={{ 
                            backgroundColor: theme.hex,
                            // Rotate by physicalAngle to ensure it points radially towards the center
                            transform: `translate(${x}px, ${y}px) rotate(${physicalAngle}deg)`,
                            boxShadow: isSelected ? `0 0 15px ${theme.hex}` : `0 0 5px ${theme.hex}`,
                            border: isSelected ? "1px solid white" : "none",
                            clipPath: "polygon(10% 0, 100% 0, 90% 100%, 0 100%)" // Slanted edges for cyberpunk feel
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Active Theme Display */}
                <div className="text-center relative z-10 bg-black/80 px-4 py-1.5 border border-white/10 w-full max-w-[240px]">
                  <div className="text-[9px] text-white/40 uppercase tracking-[0.4em] mb-1">Active_Frequency</div>
                  <div 
                    className="text-sm font-heading font-black tracking-[0.3em] uppercase transition-colors duration-300 truncate"
                    style={{ 
                      color: THEMES.find(t => t.id === activeTheme)?.hex,
                      textShadow: `0 0 8px ${THEMES.find(t => t.id === activeTheme)?.hex}`
                    }}
                  >
                    [{THEMES.find(t => t.id === activeTheme)?.name}]
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-4 relative z-10 w-full">
                  <button 
                    onClick={() => setActiveTheme("grey")}
                    className={`flex-1 min-w-[100px] px-3 py-1.5 border text-[9px] font-bold tracking-[0.15em] uppercase transition-all flex justify-center items-center gap-2
                      ${activeTheme === 'grey' 
                        ? 'bg-[#808080]/20 border-[#808080] text-[#808080] shadow-[0_0_10px_#808080]' 
                        : 'bg-white/5 border-white/20 text-white/50 hover:text-white hover:border-white/50'
                      }`}
                  >
                    <Activity className="w-3 h-3 shrink-0" />
                    Grayscale
                  </button>

                  <button 
                    onClick={() => setActiveTheme("system")}
                    className={`flex-1 min-w-[100px] px-3 py-1.5 border text-[9px] font-bold tracking-[0.15em] uppercase transition-all flex justify-center items-center gap-2
                      ${activeTheme === 'system' 
                        ? 'bg-system/20 border-system text-system shadow-[0_0_10px_var(--color-system)]' 
                        : 'bg-white/5 border-white/20 text-white/50 hover:text-white hover:border-white/50'
                      }`}
                  >
                    <Activity className="w-3 h-3 shrink-0" />
                    Colorful
                  </button>
                </div>
              </div>
            </section>

            {/* Column 3: System Info & Links */}
            <section className="space-y-4">
              <h3 className="text-xs text-text-dim tracking-[0.3em] uppercase border-b border-white/10 pb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Core_Protocols
              </h3>
              <div className="flex flex-col gap-2">
                <a href="https://github.com/iamhieu2012/Sequoia" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 transition-all group">
                  <div className="flex items-center gap-4 text-white/50 group-hover:text-white">
                    <GitBranch className="w-5 h-5" />
                    <span className="text-xs uppercase tracking-[0.1em]">Source Repository</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-system group-hover:translate-x-1 transition-all" />
                </a>
                <button onClick={() => setActiveView('privacy')} className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 transition-all group">
                  <div className="flex items-center gap-4 text-white/50 group-hover:text-white">
                    <Shield className="w-5 h-5" />
                    <span className="text-xs uppercase tracking-[0.1em]">Privacy Directive</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-system group-hover:translate-x-1 transition-all" />
                </button>
                <button onClick={() => setActiveView('terms')} className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 transition-all group">
                  <div className="flex items-center gap-4 text-white/50 group-hover:text-white">
                    <FileText className="w-5 h-5" />
                    <span className="text-xs uppercase tracking-[0.1em]">Terms of Service</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-system group-hover:translate-x-1 transition-all" />
                </button>
                <button onClick={() => setActiveView('about')} className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 transition-all group">
                  <div className="flex items-center gap-4 text-white/50 group-hover:text-white">
                    <Cpu className="w-5 h-5" />
                    <span className="text-xs uppercase tracking-[0.1em]">About Sequoia</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-system group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </section>
            
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full flex flex-col font-mono h-full animate-in slide-in-from-right-8 fade-in duration-500">
              <div className="flex items-center justify-between mb-8 border-b border-white/20 pb-4">
                <button 
                  onClick={() => setActiveView('main')}
                  className="flex items-center gap-2 text-system hover:text-white transition-colors uppercase tracking-[0.2em] text-xs group"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Return to Main Node
                </button>
                <button 
                  onClick={() => setIsDecrypted(!isDecrypted)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase tracking-widest border transition-all ${
                    isDecrypted 
                      ? "bg-coral/20 border-coral text-coral shadow-[0_0_10px_rgba(255,100,100,0.5)]" 
                      : "bg-system/10 border-system/50 text-system hover:border-system"
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  {isDecrypted ? "[ DECRYPT PROTOCOL: ON ]" : "[ ENCRYPTED MODE ]"}
                </button>
              </div>
              <div className="flex-1 bg-black/60 border border-white/10 p-8 relative overflow-y-auto group">
                <CyberBrackets color="border-system/30 transition-colors duration-500" />
                <div className="relative z-10 text-sm leading-loose tracking-wider text-white/80 whitespace-pre-wrap">
                  {activeView === 'privacy' 
                    ? (isDecrypted ? PRIVACY_LEGAL : PRIVACY_CYBERPUNK)
                    : activeView === 'terms'
                      ? (isDecrypted ? TERMS_LEGAL : TERMS_CYBERPUNK)
                      : (isDecrypted ? ABOUT_LEGAL : ABOUT_CYBERPUNK)
                  }
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
