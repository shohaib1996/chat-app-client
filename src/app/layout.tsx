import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/QueryProvider/QueryProvider";
import { AuthSessionProvider } from "@/components/session-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NeoChat - Futuristic Messaging",
  description: "A next-generation chat application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthSessionProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange={false}
            >
              {children}
               <Toaster />
            </ThemeProvider>
          </QueryProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
