import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AuthProvider from "@/context/authProvider";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";
import './globals.css'
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Anonymous Baatein",
  description: "Send Message Anonymously",
};

interface RootLayoutProps {
  children: React.ReactNode;
}


export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="en">
      <AuthProvider>
        <body className={`${inter.className}`}>
            {children}
            <Toaster/>
        </body>
      </AuthProvider>
    </html>
  );
}
