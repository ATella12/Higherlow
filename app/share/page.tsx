import { redirect } from "next/navigation";

type SearchParams = { [key: string]: string | string[] | undefined };

const FORWARDED_KEYS = ["castHash", "castFid", "viewerFid"];

export default function SharePage({ searchParams }: { searchParams: SearchParams }) {
  const params = new URLSearchParams();

  for (const key of FORWARDED_KEYS) {
    const value = searchParams[key];
    if (typeof value === "string" && value.length > 0) {
      params.set(key, value);
    }
  }

  const target = params.toString() ? `/?${params.toString()}` : "/";
  redirect(target);
}
