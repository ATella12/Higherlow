import { NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    id: "higher-lower-searches",
    name: "Higher / Lower Searches",
    description: "Guess which Google search term trends higher. Built for Farcaster Mini Apps.",
    icon: "/higherlow.jpg",
    start_url: "/",
    version: "1.0.0"
  });
}
