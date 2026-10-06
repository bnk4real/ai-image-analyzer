import { Noto_Sans } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import AppShell from "@/components/AppShell";
import { SIDEBAR_STORAGE_KEY, THEME_STORAGE_KEY } from "@/lib/preferences";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

// Local `dev` runs get a "DEV | " title prefix so they are not mistaken for the live site.
const titlePrefix = process.env.NODE_ENV === "development" ? "DEV | " : "";

export const metadata: Metadata = {
  title: `${titlePrefix}AI Image Analyzer`,
  description: "Analyze and generate reports from your images using AI.",
};

// Runs before first paint so saved preferences (theme, collapsed sidebar) never flash the default.
const prefsScript = `try{var d=document.documentElement,t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)});if(t==="light"||t==="dark")d.setAttribute("data-theme",t);if(localStorage.getItem(${JSON.stringify(
  SIDEBAR_STORAGE_KEY
)})==="collapsed")d.setAttribute("data-sidebar","collapsed")}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: prefsScript }} />
      </head>
      <body className={`${notoSans.variable} antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
