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
  title: "منصة مشرف",
  description: "منصة مشرف - الحل الرقمي المتكامل لإدارة المشاريع والأنشطة المتعلقة بالمقاولات والإشراف الفني والمالي للمباني",
  keywords: "مشرف, إدارة المشاريع, تواصل الفرق, نظام إدارة, مقاولات, إشراف فني, إدارة مالية",
  authors: [{ name: "Moshrif Team" }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
      { url: '/logo-new.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: 'https://mushrf.co',
    siteName: 'منصة مشرف',
    title: 'منصة مشرف',
    description: 'منصة مشرف - الحل الرقمي المتكامل لإدارة المشاريع والأنشطة المتعلقة بالمقاولات والإشراف الفني والمالي للمباني',
    images: [
      {
        url: '/logo-new.png',
        width: 1200,
        height: 630,
        alt: 'منصة مشرف',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'منصة مشرف',
    description: 'منصة مشرف - الحل الرقمي المتكامل لإدارة المشاريع والأنشطة المتعلقة بالمقاولات والإشراف الفني والمالي للمباني',
    images: ['/logo-new.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
        <link rel="canonical" href="https://mushrf.co" />

        {/* Structured Data for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'منصة مشرف',
              alternateName: 'Moshrif Platform',
              url: 'https://mushrf.co',
              logo: 'https://mushrf.co/logo-new.png',
              description: 'منصة مشرف - الحل الرقمي المتكامل لإدارة المشاريع والأنشطة المتعلقة بالمقاولات والإشراف الفني والمالي للمباني',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'SAR',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '100',
              },
            }),
          }}
        />

        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'منصة مشرف',
              url: 'https://mushrf.co',
              logo: 'https://mushrf.co/logo-new.png',
              sameAs: [],
            }),
          }}
        />
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
