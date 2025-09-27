import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/styles/toast.css";
import AppProvider from "@/components/providers/AppProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "مشرف - نظام إدارة المشاريع",
  description: "منصة مشرف - الحل الرقمي المتكامل لإدارة المشاريع والأنشطة المتعلقة بالمقاولات والإشراف الفني والمالي للمباني",
  keywords: "مشرف, إدارة المشاريع, تواصل الفرق, نظام إدارة, مقاولات, إشراف فني, إدارة مالية",
  authors: [{ name: "Moshrif Team" }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/favicon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2117fb",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" data-scroll-behavior="smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#2117fb" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProvider>
          {children}
        </AppProvider>
        <script dangerouslySetInnerHTML={{
          __html: `
            // Add Toast CSS animation
            const style = document.createElement('style');
            style.textContent = \`
              @keyframes fade-in {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
              }
              .animate-fade-in {
                animation: fade-in 0.3s ease-out;
              }
            \`;
            document.head.appendChild(style);
          `
        }} />
      </body>
    </html>
  );
}
