import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Fito Agents | Custom AI Agents for Modern Businesses",
  description: "Fito Agents helps businesses launch AI-powered digital workers that answer questions, capture leads, support customers, and automate daily tasks.",
};

import { AuthProvider } from "@/context/AuthContext";
import { BusinessProvider } from "@/context/BusinessContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block"
        />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased bg-background text-on-background selection:bg-secondary-container selection:text-on-secondary-container`}
      >
        <AuthProvider>
          <BusinessProvider>
            {children}
          </BusinessProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
