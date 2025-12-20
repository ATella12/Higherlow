import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  title: "Higher or Lower",
  description: "A quick higher-or-lower game using search results on Farcaster.",
  metadataBase: new URL("https://higherlow.vercel.app"),
  icons: {
    icon: "/manifest/icon.png",
    shortcut: "/manifest/icon.png",
    apple: "/manifest/icon.png"
  },
  openGraph: {
    title: "Higher or Lower",
    description: "A quick higher-or-lower game using search results on Farcaster.",
    url: "https://higherlow.vercel.app/share",
    images: ["https://higherlow.vercel.app/manifest/og.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "Higher or Lower",
    description: "A quick higher-or-lower game using search results on Farcaster.",
    images: ["https://higherlow.vercel.app/manifest/og.png"]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={spaceGrotesk.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
