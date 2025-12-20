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
  title: "Higher / Lower | Farcaster Mini App",
  description: "Guess which search term trends higher with a fast, tactile higher/lower mini app.",
  metadataBase: new URL("http://localhost:3000"),
  icons: {
    icon: "/higherlow.jpg",
    shortcut: "/higherlow.jpg",
    apple: "/higherlow.jpg"
  },
  openGraph: {
    title: "Higher / Lower | Farcaster Mini App",
    description: "Guess which search term trends higher with a fast, tactile higher/lower mini app.",
    images: ["/higherlow.jpg"]
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
