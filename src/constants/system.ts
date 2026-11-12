export const THEMES = [
  { id: "system", name: "DEFAULT_SYSTEM", hex: "#49aeae" },
  { id: "grey", name: "GREY", hex: "#808080" },
  { id: "red", name: "RED", hex: "#f14949" },
  { id: "orange", name: "ORANGE", hex: "#f19d49" },
  { id: "yellow", name: "YELLOW", hex: "#f1f149" },
  { id: "green", name: "GREEN", hex: "#49f149" },
  { id: "turquoise", name: "TURQUOISE", hex: "#49f19d" },
  { id: "cyan", name: "CYAN", hex: "#49f1f1" },
  { id: "blue", name: "BLUE", hex: "#4949f1" },
  { id: "purple", name: "PURPLE", hex: "#9d49f1" },
  { id: "pink", name: "PINK", hex: "#f149f1" },
];

export const PRIVACY_CYBERPUNK = `### [ SECURITY CLEARANCE: LEVEL 4 ] - NODE DATA ARCHIVAL DIRECTIVE

**OVERSEER DIRECTIVE:** By synchronizing with Sequoia Nexus, the Entity (Node) accepts the following protocol for identity signaling and data archival.

#### 1. SIGNAL EXTRACTION (DATA COLLECTION):
- **Basic Identification:** Upon completion of the Initiation sequence, the system seals your Email, Display Name, Lifeform Identifier (Supabase UID), and - if you link a Google account - your avatar image.
- **Neural Footprints:** The Datapads you mark as DECODED and the cycles (dates) you were active are archived in the PostgreSQL Data Core to compute your Orbital Streak. Nothing else about your navigation is recorded.
- **Session Protocols:** Encrypted session tokens are stored as cookies to keep your uplink authenticated.
- **Local Buffers:** Code written in the Python Sandbox stays in your own terminal (browser storage) and is never transmitted to the Core.

#### 2. OFF-GRID RELAYS (THIRD-PARTY TRANSMISSION):
- **System AI Uplink:** Queries sent to the AI Assistant are relayed to Google Gemini to generate a response. The Nexus does not archive these transmissions.
- **Optical Sensors:** Camera feeds and images used in the Labs are decoded entirely on your device. They never leave your Node.
- **Asset Relays:** Datapad images are served from Cloudinary, and AI models and the Python runtime from jsDelivr / Hugging Face. These relays may observe your network signature (IP address) when delivering assets.

#### 3. ZERO-LEAK PROTOCOL:
- All transmissions are shielded by HTTPS/TLS encryption, and the Data Core is encrypted at rest.
- The system pledges to never sell, trade, or sacrifice your Signal Data to any external corporation or off-grid archival organization.

#### 4. ENTITY JURISDICTION (NODE RIGHTS):
- You reserve the right to request Total Obliteration. By transmitting this command to the Overseer, your entire Signal, Data, and History will be permanently vaporized from the Data Core, beyond recovery.`;

export const PRIVACY_LEGAL = `### PRIVACY POLICY

**Effective Date:** January 1, 2026
**Last Updated:** November 12, 2026

#### 1. INFORMATION WE COLLECT
- **Account Information:** When you register, we store your Email Address, Display Name, and a unique authentication identifier (Supabase UID). If you sign in with Google, we also store your Google profile picture URL.
- **Learning Progress:** The articles you mark as completed and the dates you were active, used to show your progress and streak.
- **Session Data:** Authentication cookies that keep you signed in.
- **Stored only on your device:** Code you write in the Python Sandbox is saved in your browser's local storage and is not sent to our servers.

We do not use analytics or advertising trackers.

#### 2. HOW WE USE YOUR INFORMATION
- **Service Provision:** To create and maintain your account and to sync your learning progress across sessions and devices.
- **Security:** To authenticate requests and protect administrative functions.

#### 3. DATA SHARING AND DISCLOSURE
- **Zero-Sell Policy:** We do not sell, rent, or trade your personal information to advertisers, data brokers, or any third party.
- **Service Providers:** We rely on the following providers to operate the Service:
  - **Supabase** - stores your account and learning progress.
  - **Google Gemini** - receives the messages you send to the AI Assistant in order to generate a reply. We do not store these conversations.
  - **Cloudinary** - hosts images used in articles.
  - **jsDelivr and Hugging Face** - deliver AI model files and the Python runtime to your browser.
  - Our hosting provider, which serves the website.

  These providers may process technical data such as your IP address when handling requests, under their own privacy policies.
- **On-Device Processing:** Camera feeds and images you use in the Model Playground are processed entirely in your browser and are never uploaded.
- **Legal Compliance:** We may disclose information if required to do so by law or in response to valid requests by public authorities.

#### 4. DATA SECURITY
Your data is encrypted in transit (via HTTPS/TLS) and stored with Supabase, which encrypts data at rest. While we implement commercially acceptable means to protect your personal information, no method of transmission over the Internet is 100% secure.

#### 5. YOUR RIGHTS
You may request access to, correction of, or complete deletion of your personal data at any time. To exercise these rights, please contact the platform administrators.`;

export const TERMS_CYBERPUNK = `### [ SYSTEM WARNING ] - NEXUS CONNECTION & OPERATION PROTOCOLS

**WARNING:** By executing the INITIATE_SPAWN command and entering the Cosmos Space, you have forged a Digital Pact with the Sequoia Nexus System.

#### 1. ACCESS & IDENTITY:
- You are designated a unique Node ID. You bear absolute responsibility for any Data Streams originating from your Node.
- Leaking your decryption key (Password) to other Entities is a critical protocol violation.

#### 2. PROHIBITED PROTOCOLS:
- **Core Breach:** All attempts at Reverse Engineering, API exploitation, or malicious code injection (XSS/Payloads) into the System are strictly forbidden.
- **Bandwidth Saturation:** The deployment of bots, automated scripts, or mass query floods (DDoS) designed to overload the Server will be instantly neutralized by our defense grid.
- **Spatial Sabotage:** Erasing, corrupting, or destroying Anomalies (Articles) and Nebulas belonging to others (for Admin nodes) will result in permanent revocation of privileges.
- **PENALTY:** Any aforementioned violations will instantly trigger the Total Neutralization Protocol (Terminate Session & IP Ban) without prior warning.

#### 3. OVERSEER JURISDICTION (SYSTEM RIGHTS):
- The System reserves the right to demote, alter coordinates, or purge any content generated by you if it violates the Nexus Standard Codex.
- The Cosmos Space may experience partial or total collapse (Server Maintenance/Downtime) at any moment for Algorithmic Upgrades.

#### 4. LIMITATION OF LIABILITY:
- The System is provided "AS IS". The Overseer assumes no responsibility for temporary data loss, memory corruption, or psychological trauma induced by diving too deep into the Cosmos Space.`;

export const TERMS_LEGAL = `### TERMS OF SERVICE

**Effective Date:** January 1, 2026

#### 1. ACCEPTANCE OF TERMS
By accessing, registering, or using the Sequoia Nexus platform ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you may not access the Service.

#### 2. USER CONDUCT AND RESPONSIBILITIES
- **Account Security:** You are solely responsible for safeguarding your account credentials. You must notify us immediately of any unauthorized use of your account.
- **Acceptable Use:** You agree to use the Service only for lawful purposes. You shall not engage in any activity that disrupts, diminishes the quality of, or interferes with the performance of the Service.
- **Prohibited Actions:** You explicitly agree NOT to:
  - Use automated scripts, bots, or scrapers to access the API.
  - Attempt to reverse-engineer, decompile, or hack the platform's infrastructure.
  - Upload malicious code, viruses, or illegal content.

#### 3. INTELLECTUAL PROPERTY
All content, features, and functionality provided on the Service (including but not limited to design, text, graphics, and interactive elements) are owned by the Sequoia developers. You may not reproduce, distribute, or create derivative works without express written permission.

#### 4. TERMINATION
We reserve the right to suspend or permanently terminate your account and refuse any current or future use of the Service, at our sole discretion, without prior notice, if you breach these Terms of Service.

#### 5. LIMITATION OF LIABILITY
The Service is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind. In no event shall the developers or administrators be liable for any direct, indirect, incidental, or consequential damages resulting from your use of or inability to use the Service, including but not limited to data loss or server downtime.

#### 6. MODIFICATIONS TO TERMS
We reserve the right to modify these terms at any time. Continued use of the Service after any such changes shall constitute your consent to such changes.`;

export const ABOUT_CYBERPUNK = `### [ SYSTEM LOG: THE SEQUOIA INITIATIVE ]

- **PROJECT DESIGNATION:** SEQUOIA NEXUS V1.0.0
- **CHIEF ARCHITECT:** OVERSEER IAMHIEU2012
- **SYSTEM STATUS:** ONLINE // CONTINUOUS EXPANSION

The Sequoia Nexus was not forged to be a mere archival database. It is a living, breathing neural architecture, engineered to map the chaotic anomalies of human knowledge into navigable Cosmos structures.

Within this Grid, isolated fragments of information (Rogue Anomalies) are pulled into gravitational orbits, coalescing into brilliant Nebulas and interconnected Star Systems. By spatializing knowledge, the Nexus empowers Entities to traverse a boundless universe of data seamlessly.

> We do not merely store information; we forge neural pathways. 
> Welcome to the Cosmos.`;

export const ABOUT_LEGAL = `### ABOUT SEQUOIA

Sequoia is a comprehensive, highly interactive knowledge mapping platform engineered by Hieu (iamhieu2012). 
At its core, the project revolutionizes how we interact with information: transforming flat, static articles into an expansive, interconnected 2D spatial map (The Cosmos).

#### TECHNICAL ARCHITECTURE (TECH STACK):
- **Frontend:** Next.js, React, TailwindCSS, and native Canvas API for fluid spatial rendering and cyberpunk UI/UX.
- **Backend:** Next.js App Router (API Routes) handling robust API endpoints and full-stack integration.
- **Infrastructure:** Supabase Authentication & PostgreSQL ensuring seamless, real-time data synchronization.

Sequoia was built with a profound passion for Sci-Fi/Cyberpunk aesthetics, aiming to deliver a premium, game-like user experience within a functional, modern web application.`;
