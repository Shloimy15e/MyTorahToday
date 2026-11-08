import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "../styles/globals.css";
import { ToastProvider } from "@/context/ToastProvider";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { SessionProvider } from "@/context/SessionContext";
import { displayFont, sourceFont } from "@/styles/fonts";

const siteDescription = "Short Torah teachings with Rabbi Shimon Semp. Explore the parshah, Chassidus and more, with source texts and journals where available.";
const shareImage = { url: "/images/social-preview-v4.png", width: 1200, height: 630, alt: "My Torah Today — Torah teachings with Rabbi Shimon Semp" };

export const metadata: Metadata = {
  metadataBase: new URL("https://mytorahtoday.com"),
  title: "My Torah Today",
  description: siteDescription,
  applicationName: "My Torah Today",
  icons: {
    shortcut: "/favicon.ico?v=book-v2",
    icon: [
      { url: "/favicon.ico?v=book-v2", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { url: "/favicon.svg?v=book-v2", sizes: "any", type: "image/svg+xml" },
      { url: "/favicon-32x32.png?v=book-v2", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png?v=book-v2", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png?v=book-v2", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  appleWebApp: { title: "My Torah Today", statusBarStyle: "default" },
  other: { "msapplication-TileColor": "#264397", "msapplication-TileImage": "/mstile-144x144.png" },
  openGraph: {
    type: "website", locale: "en_US", url: "/", siteName: "My Torah Today",
    title: "My Torah Today", description: siteDescription, images: [shareImage],
  },
  twitter: {
    card: "summary_large_image", site: "@mytorahtoday", title: "My Torah Today",
    description: siteDescription, images: [shareImage],
  },
  robots: { index: true, follow: true },
  verification: { google: "AafcWLwSlqXAUwCFlyKLSnMg7WLhA2Ngc5kr6GuE68A" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "WebSite", name: "My Torah Today",
          url: "https://mytorahtoday.com/", description: siteDescription,
        }) }} />
      </head>
      <body className={`${displayFont.variable} ${sourceFont.variable}`}>
        <NextAuthSessionProvider>
          <SessionProvider>
            <ToastProvider>{children}</ToastProvider>
          </SessionProvider>
        </NextAuthSessionProvider>
        <Script src="https://www.youtube.com/iframe_api" />
      </body>
    </html>
  );
}
