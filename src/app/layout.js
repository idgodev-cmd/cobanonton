import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/layout/Header";
import BottomNav from "../components/layout/BottomNav";
import Container from "../components/layout/Container";
import { ThemeProvider } from "../lib/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export const metadata = {
  metadataBase: new URL("https://cobanonton.com"),
  title: {
    default: "COBANONTON",
    template: "%s • COBANONTON",
  },
  applicationName: "COBANONTON",
  description:
    "COBANONTON - Platform streaming terlengkap untuk nonton drama Korea, drama Mandarin, film, dan anime subtitle Indonesia. Nikmati koleksi serial terbaru, film populer, dan anime trending dengan kualitas HD.",
  keywords: [
    "nonton drama korea",
    "streaming anime sub indo",
    "drama mandarin subtitle indonesia",
    "nonton film online",
    "drama korea terbaru",
    "anime subtitle indonesia",
    "streaming drama gratis",
    "kdrama sub indo",
    "nonton anime",
    "series korea",
    "drakor terbaru",
    "film bioskop online",
    "cobanonton",
  ],
  openGraph: {
    type: "website",
    url: "https://cobanonton.com/",
    title: "COBANONTON - Streaming Drama Korea, Anime & Film Sub Indo",
    description:
      "Platform streaming terlengkap untuk nonton drama Korea, drama Mandarin, film, dan anime subtitle Indonesia. Koleksi serial terbaru dengan kualitas HD.",
    siteName: "COBANONTON",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "COBANONTON hero",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@cobanonton",
    creator: "@cobanonton",
    title: "COBANONTON - Streaming Drama Korea, Anime & Film Sub Indo",
    description:
      "Platform streaming terlengkap untuk nonton drama Korea, drama Mandarin, film, dan anime subtitle Indonesia. Koleksi serial terbaru dengan kualitas HD.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://cobanonton.com/",
    languages: {
      "x-default": "https://cobanonton.com/",
      id: "https://cobanonton.com/",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <Header />
          <main className="pt-16 pb-24">
            {children}
          </main>
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
