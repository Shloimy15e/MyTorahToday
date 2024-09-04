import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "../styles/globals.css";
import { ToastProvider } from "@/context/ToastProvider";
import ClientWrapper from "./ClientWrapper";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { SessionProvider } from "@/context/SessionContext";
import { GoogleTagManager } from '@next/third-parties/google'

export const metadata: Metadata = {
  title: "My Torah Today",
  description: "Rabbi Shimon Semp's Torah videos from YouTube",
  applicationName: "My Torah Today",
  keywords: [
    "Torah",
    "Jewish",
    "Judaism",
    "Reb Shimon Semp",
    "Rabbi Shimon Semp",
    "Reb Shimon",
    "Rabbi",
    "Shimon",
    "Semp",
    "Rosh Yeshiva Talpios",
    "Rosh Yeshiva",
    "Yeshiva Talpios",
    "Rosh",
    "Yeshiva",
    "Talpios",
    "Jewish understanding",
    "understanding",
    "Meditation",
    "Smart",
    "Self-help",
    "YouTube",
    "Shteinwurtzel",
    "Airmont",
    "Parshah",
    "Neviim",
    "Chassidic",
    "Chassidus",
    "Hasidic",
    "Hassidic",
    "hasidus",
    "Hassidus",
    "Hassidut",
    "Chassidut",
    "Chassid",
    "Besht",
    "Baal Shem Tov",
  ],
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-194x194.png", sizes: "194x194", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "My Torah Today",
    statusBarStyle: "default",
  },
  other: {
    "msapplication-TileColor": "#2b5797",
    "msapplication-TileImage": "/mstile-144x144.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mytorahtoday.com",
    title: "My Torah Today",
    description:
      "R' Shimon Semp's Torah videos from over the years, posted on YouTube, brought to you in an organized and accessible manner.",
    images: [
      {
        url: "https://mytorahtoday.com/images/og-image.jpg",
        width: 1200,
        height: 612,
        alt: "My Torah Today",
      },
    ],
    siteName: "My Torah Today",
  },
  robots: "index, follow",
  generator: "Next.js",
  twitter: {
    card: "summary_large_image",
    site: "@mytorahtoday",
    title: "My Torah Today",
    description:
      "R' Shimon Semp's Torah videos from over the years, posted on YouTube, brought to you in an organized and accessible manner.",
    images: [
      {
        url: "https://mytorahtoday.com/images/og-image.jpg",
        width: 1200,
        height: 612,
        alt: "My Torah Today",
      },
    ],
  },
  verification: {
    google: "AafcWLwSlqXAUwCFlyKLSnMg7WLhA2Ngc5kr6GuE68A",
  },
  creator: "Shloimy Elbaum",
  authors: [
    {
      name: "Shloimy Elbaum",
    },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: true,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://www.mytorahtoday.com",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Topics",
                  item: "https://www.mytorahtoday.com/topics",
                },
              ],
            }),
          }}
        />
      </head>
      <GoogleTagManager gtmId="G-GECPXF5SDS" />
      <body>
        <NextAuthSessionProvider>
          <SessionProvider>
            <ClientWrapper>
              <ToastProvider>{children}</ToastProvider>
            </ClientWrapper>
          </SessionProvider>
        </NextAuthSessionProvider>
        <Script src="https://www.youtube.com/iframe_api" />
      </body>
    </html>
  );
}
