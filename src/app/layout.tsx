import type { Metadata } from "next";
//import { Inter } from "next/font/google";
import "../styles/globals.css";

//const inter = Inter({ subsets: ["latin"] });

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
