import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils"; // Import the cn utility

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QED.gg - Collaborative Document Editor",
  description: "Real-time collaborative document editing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={cn(
          "h-full flex flex-col antialiased",
          geistSans.variable,
          geistMono.variable
        )}
      >
        <header className="bg-ui-element p-4 shadow-md">
          <div className="container mx-auto">
            <h1 className="text-2xl font-semibold text-primary">QED.gg</h1>
          </div>
        </header>
        <main className="flex-grow container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
