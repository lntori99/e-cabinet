import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/core/providers";
import { SITE } from "@/core/app-constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — Secretariat console`,
    template: `%s | ${SITE.name}`,
  },
  description:
    "Administrative console for the sovereign, Malawi-hosted e-Cabinet platform. Restricted to named accounts.",
  robots: { index: false, follow: false },
};

const themeInit = `(function(){try{var t=localStorage.getItem("ecab-theme");var d=t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className={`${inter.variable} font-body`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
