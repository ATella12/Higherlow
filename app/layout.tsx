import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display"
});

const FC_EMBED_ROOT = JSON.stringify({
  version: "1",
  imageUrl: "https://higherlow.vercel.app/manifest/image.png",
  button: {
    title: "Play",
    action: {
      type: "launch_frame",
      name: "Higher / Lower",
      url: "https://higherlow.vercel.app/",
      splashImageUrl: "https://higherlow.vercel.app/manifest/splash.png",
      splashBackgroundColor: "#0b0b0b"
    }
  }
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
  },
  other: {
    "fc:miniapp": FC_EMBED_ROOT,
    "fc:frame": FC_EMBED_ROOT
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
