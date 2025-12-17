import { Noto_Sans } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import Navbar from "@/components/Navbar";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

const notoMono = Noto_Sans({
  variable: "--font-noto-mono",
  subsets: ["latin"],
  weight: "700",
  style: "normal",
});

export const metadata: Metadata = {
  title: "AI Image Analyzer",
  description: "Analyze and generate reports from your images using AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${notoSans.variable} ${notoMono.variable} antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}

