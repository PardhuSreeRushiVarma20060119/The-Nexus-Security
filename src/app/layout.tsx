import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from '@/components/providers/AuthProvider';
import { SearchProvider } from '@/contexts/SearchContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { Toaster } from 'react-hot-toast';
import { PageTransition } from '@/components/layout/PageTransition';
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexus Security Platform",
  description: "Enterprise-grade security monitoring and management platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-950 text-white`}>
        <AuthProvider>
          <SearchProvider>
            <SidebarProvider>
              <PageTransition>
                <div className="flex h-screen bg-black">
                  <Sidebar />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-6">
                      {children}
                    </main>
                  </div>
                </div>
              </PageTransition>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#1f2937',
                    color: '#fff',
                    border: '1px solid #374151',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </SidebarProvider>
          </SearchProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
