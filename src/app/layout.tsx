import type { Metadata, Viewport } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "My Torah Today",
  description:
    "Rabbi Shimon Semp's - the Rosh Yeshiva - Torah videos from YouTube",
  icons: {
    icon: [
      {
        rel: "apple-touch-icon",
        type: "image/png",
        sizes: "180x180",
        url: "/favicon/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        url: "/favicon/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        url: "/favicon/favicon-16x16.png",
      },
      { rel: "manifest", url: "/favicon/site.webmanifest" },
    ],
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
  appleWebApp: {
    title: "My Torah Today",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script type="application/ld+json">
          {JSON.stringify({
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
                name: "Categories",
                item: "https://www.mytorahtoday.com/categories",
              },
            ],
          })}
        </script>
      </head>
      <body>{children}</body>
    </html>
  );
}
