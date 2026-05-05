import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Drunk Twitter | The Unfiltered Microblogging Platform",
  description: "The microblogging platform where your inner voice gets a megaphone. No algorithms, no vanity metrics. Just a straight pipe of human consciousness. Engineered by TeckGeekz.",
  keywords: ["microblogging", "social media", "drunk twitter", "no algorithm", "text only", "teckgeekz"],
  authors: [{ name: "TeckGeekz", url: "https://teckgeekz.com" }],
  openGraph: {
    title: "Drunk Twitter | The Unfiltered Microblogging Platform",
    description: "The microblogging platform where your inner voice gets a megaphone. No algorithms. No likes. Just raw thoughts.",
    siteName: "Drunk Twitter",
    type: "website",
    images: ["https://bhangbhosdha.com/og-d.jpg"],
    url: "https://bhangbhosdha.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Drunk Twitter",
    description: "No algorithms. No likes. Just raw thoughts.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-background text-text-main antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
