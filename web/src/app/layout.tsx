import type { Metadata } from "next";
import { Inter, Patrick_Hand, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-logo",
});

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

const patrickHand = Patrick_Hand({
  weight: "400",
  subsets: ["latin", "vietnamese"],
  variable: "--font-patrick",
});

export const metadata: Metadata = {
  title: "Sequoia - Premium AI Education",
  description: "A structured, interactive AI/ML learning platform featuring on-device model playgrounds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} ${patrickHand.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col selection:bg-primary/30 transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <div className="fixed inset-0 z-[-1] bg-background-layer pointer-events-none transition-colors duration-300"></div>
          <div className="fixed inset-0 z-[-1] theme-bg pointer-events-none"></div>
          <div className="fixed inset-0 z-[-1] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none dark:opacity-20"></div>
          <Navbar />
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
