import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { cookies } from "next/headers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sequoia - The Neural Cosmos",
  description: "Explore AI/ML in the infinite universe.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get('sequoia_theme')?.value;

  const THEMES: Record<string, string> = {
    "grey": "#808080",
    "red": "#ff4242",
    "orange": "#ff9900",
    "yellow": "#ffff42",
    "green": "#42ff42",
    "turquoise": "#00ff99",
    "cyan": "#42ffff",
    "blue": "#4242ff",
    "purple": "#9900ff",
    "pink": "#ff42ff"
  };

  let themeStyle = '';
  if (theme && theme !== 'system' && THEMES[theme]) {
    const hex = THEMES[theme];
    themeStyle = `
      :root {
        --color-system: ${hex};
        --color-red: ${hex};
        --color-green: ${hex};
        --color-blue: ${hex};
        --color-yellow: ${hex};
        --color-pink: ${hex};
        --color-cyan: ${hex};
        --color-orange: ${hex};
        --color-turquoise: ${hex};
        --color-purple: ${hex};
        --color-grey: ${hex};
      }
    `;
  }

  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased font-sans bg-space-bg text-text-main`}>
        {themeStyle && <style dangerouslySetInnerHTML={{ __html: themeStyle }} />}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
