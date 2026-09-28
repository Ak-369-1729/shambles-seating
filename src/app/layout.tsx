import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://shambles-seating.vercel.app"),
  title: "SHAMBLES SEATING | Your Berth. Your Crew. Your Voyage.",
  description:
    "Smart Event RSVP, Capacity Enforcement & Deterministic Waitlist System for Frontend Roulette 1.0. Gran Tesoro VIP Gala × World Government Reverie Summit.",
  keywords: [
    "Shambles Seating",
    "Frontend Roulette",
    "Event RSVP",
    "Waitlist Management",
    "Poneglyph Queue",
    "Grand Line Access",
  ],
  authors: [{ name: "Grand Line Fleet Admiralty" }],
  openGraph: {
    title: "SHAMBLES SEATING — Frontend Roulette 1.0",
    description:
      "Exclusive berth allocation and deterministic queue for 50 pirate developer crews.",
    url: "https://shambles-seating.vercel.app",
    siteName: "Shambles Seating",
    images: [
      {
        url: "/assets/landing-bg.png",
        width: 1376,
        height: 768,
        alt: "Gran Tesoro VIP Gala",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SHAMBLES SEATING | Your Berth. Your Crew. Your Voyage.",
    description: "Exclusive berth allocation and deterministic queue for Frontend Roulette 1.0.",
    images: ["/assets/landing-bg.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="bg-marine-950 text-[#F4E8C1] min-h-screen selection:bg-tesoro-gold selection:text-marine-950 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
