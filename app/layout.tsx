import type { Metadata } from "next";
import "./globals.css";
import ThemeScript from "./theme-script";

export const metadata: Metadata = {
  title: "Himova — AI Email Support for Salons",
  description:
    "Himova reads your salon's customer emails and drafts accurate replies from your own hours, prices, and policies. Built in Kathmandu, Nepal.",
  metadataBase: new URL("https://himova.work.gd"),
  openGraph: {
    title: "Himova — AI Email Support for Salons",
    description:
      "AI that drafts grounded email replies for local salons. You review, you send.",
    type: "website",
    siteName: "Himova",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Himova — AI Email Support for Salons",
    description:
      "AI that drafts grounded email replies for local salons. You review, you send.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Inter', sans-serif" }}>
        <ThemeScript />
        {children}
      </body>
    </html>
  );
}
