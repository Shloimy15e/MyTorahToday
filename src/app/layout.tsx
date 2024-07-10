import type { Metadata } from "next";
//import { Inter } from "next/font/google";
import "../styles/globals.css";

//const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Torah Today",
  description: "Rabbi Shimon Semp's - the Rosh Yeshiva - Torah videos from YouTube",
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
