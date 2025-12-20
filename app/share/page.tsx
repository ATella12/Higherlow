import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const OG_TITLE = "Higher or Lower";
const OG_DESCRIPTION = "A quick higher-or-lower game using search results on Farcaster.";
const OG_IMAGE = "https://higherlow.vercel.app/manifest/og.png";
const OG_URL = "https://higherlow.vercel.app/share";
const FORWARDED_KEYS = ["castHash", "castFid", "viewerFid"];

type SearchParams = { [key: string]: string | string[] | undefined };

const toStringParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export function generateMetadata({ searchParams }: { searchParams: SearchParams }): Metadata {
  const castHash = toStringParam(searchParams.castHash);
  const castFid = toStringParam(searchParams.castFid);

  const castLabel = castHash ? `${castHash.slice(0, 8)}…` : castFid ? `Cast from fid ${castFid}` : null;
  const description = castLabel ? `${castLabel} shared on Higher or Lower.` : OG_DESCRIPTION;

  return {
    title: OG_TITLE,
    description,
    metadataBase: new URL("https://higherlow.vercel.app"),
    alternates: { canonical: OG_URL },
    openGraph: {
      title: OG_TITLE,
      description,
      url: OG_URL,
      images: [OG_IMAGE]
    },
    twitter: {
      card: "summary_large_image",
      title: OG_TITLE,
      description,
      images: [OG_IMAGE]
    }
  };
}

export default function SharePage({ searchParams }: { searchParams: SearchParams }) {
  const params = new URLSearchParams();
  for (const key of FORWARDED_KEYS) {
    const value = toStringParam(searchParams[key]);
    if (value) params.set(key, value);
  }
  const target = params.toString() ? `/?${params.toString()}` : "/";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#0b0f19",
        color: "#f5f5f5",
        textAlign: "center"
      }}
    >
      <div style={{ maxWidth: 640 }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "12px" }}>{OG_TITLE}</h1>
        <p style={{ marginBottom: "16px", lineHeight: 1.5 }}>{OG_DESCRIPTION}</p>
        <p style={{ marginBottom: "24px", color: "#cfd2dc" }}>
          Opening your shared Higher or Lower cast. If you are not redirected automatically, use the
          button below.
        </p>
        <a
          href={target}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 18px",
            background: "#6b8bff",
            color: "#0b0f19",
            borderRadius: "999px",
            textDecoration: "none",
            fontWeight: 700
          }}
        >
          Play Higher or Lower
        </a>
      </div>
    </main>
  );
}
