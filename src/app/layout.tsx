import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://sandevex.com";

export const metadata: Metadata = {
  // ── Core ──────────────────────────────────────────────────────────────
  title: {
    default: "Sandevex – Training, Development & Internship Programs",
    template: "%s | Sandevex",
  },
  description:
    "Sandevex, powered by Sand-Hut, offers hands-on training, skill development, and internship programs that bridge the gap between education and employment. Build real-world skills and career confidence.",

  // ── Canonical & Indexing ──────────────────────────────────────────────
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  // ── Keywords ─────────────────────────────────────────────────────────
  keywords: [
    "Sandevex",
    "training and development",
    "internship programs India",
    "skill development",
    "career training",
    "Sand-Hut",
    "professional internships",
    "industry training Bengaluru",
    "practical learning",
    "sandevex.com",
  ],

  // ── Authors & Brand ───────────────────────────────────────────────────
  authors: [{ name: "Sand-Hut", url: "https://sandhut.in" }],
  creator: "Sand-Hut",
  publisher: "Sandevex by Sand-Hut",

  // ── Open Graph ────────────────────────────────────────────────────────
  openGraph: {
    type: "website",
    url: "https://sandevex.com",
    siteName: "Sandevex",
    title: "Sandevex – Training, Development & Internship Programs",
    description:
      "Sandevex, powered by Sand-Hut, offers hands-on training, skill development, and internship programs that bridge the gap between education and employment.",
    locale: "en_IN",
    images: [
      {
        url: "https://sandevex.com/og-image.png", // 1200×630px
        width: 1200,
        height: 630,
        alt: "Sandevex – Training, Development & Internship Brand by Sand-Hut",
      },
    ],
  },

  // ── Twitter / X Card ──────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "Sandevex – Training, Development & Internship Programs",
    description:
      "Hands-on training, skill development, and internship programs powered by Sand-Hut. Learn. Build. Grow.",
    images: ["https://sandevex.com/og-image.png"],
    site: "@sandevex",
    creator: "@sandhut",
  },

  // ── App / PWA ─────────────────────────────────────────────────────────
  applicationName: "Sandevex",
  category: "education",
};

// ── JSON-LD Structured Data ────────────────────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Sandevex",
  url: "https://sandevex.com",
  logo: "https://sandevex.com/logo.png",
  description:
    "Sandevex, powered by Sand-Hut, is a training, development, and internship brand dedicated to helping students and professionals build practical skills and career confidence.",
  foundingOrganization: {
    "@type": "Organization",
    name: "Sand-Hut",
    url: "https://sandhut.in",
  },
  sameAs: [
    "https://www.linkedin.com/company/sandevex",
    "https://www.instagram.com/sandevex",
  ],
  offers: {
    "@type": "Offer",
    description:
      "Training programs, skill development courses, and guided internship opportunities.",
    category: "Education & Career Development",
  },
};

import MainLayoutWrapper from "../components/MainLayoutWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#01696f" />
      </head>
      <body className="min-h-full flex flex-col">
        <MainLayoutWrapper>{children}</MainLayoutWrapper>
      </body>
    </html>
  );
}