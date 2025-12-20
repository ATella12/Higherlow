import { Difficulty, SearchTerm } from "@/lib/types";
import { computeDifficulty, DIFFICULTY_THRESHOLDS, isValidTermEntry } from "@/lib/utils";

const MANUAL_TERMS: Omit<SearchTerm, "difficulty">[] = [
  { id: "google", term: "Google", searches: 755_000_000, imageUrl: "https://picsum.photos/seed/google/900/1200", tags: ["search"], familiarity: "global" },
  { id: "youtube", term: "YouTube", searches: 705_000_000, imageUrl: "https://picsum.photos/seed/youtube/900/1200", tags: ["video"], familiarity: "global" },
  { id: "facebook", term: "Facebook", searches: 520_000_000, imageUrl: "https://picsum.photos/seed/facebook/900/1200", familiarity: "global" },
  { id: "amazon", term: "Amazon", searches: 310_000_000, imageUrl: "https://picsum.photos/seed/amazon/900/1200", familiarity: "global" },
  { id: "whatsapp", term: "WhatsApp", searches: 260_000_000, imageUrl: "https://picsum.photos/seed/whatsapp/900/1200", familiarity: "global" },
  { id: "instagram", term: "Instagram", searches: 240_000_000, imageUrl: "https://picsum.photos/seed/instagram/900/1200", familiarity: "global" },
  { id: "tiktok", term: "TikTok", searches: 215_000_000, imageUrl: "https://picsum.photos/seed/tiktok/900/1200", familiarity: "global" },
  { id: "gmail", term: "Gmail", searches: 195_000_000, imageUrl: "https://picsum.photos/seed/gmail/900/1200" },
  { id: "netflix", term: "Netflix", searches: 185_000_000, imageUrl: "https://picsum.photos/seed/netflix/900/1200" },
  { id: "wikipedia", term: "Wikipedia", searches: 180_000_000, imageUrl: "https://picsum.photos/seed/wikipedia/900/1200" },
  { id: "x", term: "X (Twitter)", searches: 165_000_000, imageUrl: "https://picsum.photos/seed/x/900/1200" },
  { id: "linkedin", term: "LinkedIn", searches: 150_000_000, imageUrl: "https://picsum.photos/seed/linkedin/900/1200" },
  { id: "pinterest", term: "Pinterest", searches: 132_000_000, imageUrl: "https://picsum.photos/seed/pinterest/900/1200" },
  { id: "reddit", term: "Reddit", searches: 125_000_000, imageUrl: "https://picsum.photos/seed/reddit/900/1200" },
  { id: "spotify", term: "Spotify", searches: 122_000_000, imageUrl: "https://picsum.photos/seed/spotify/900/1200" },
  { id: "zoom", term: "Zoom", searches: 110_000_000, imageUrl: "https://picsum.photos/seed/zoom/900/1200" },
  { id: "airbnb", term: "Airbnb", searches: 96_000_000, imageUrl: "https://picsum.photos/seed/airbnb/900/1200" },
  { id: "uber", term: "Uber", searches: 92_000_000, imageUrl: "https://picsum.photos/seed/uber/900/1200" },
  { id: "disney", term: "Disney+", searches: 85_000_000, imageUrl: "https://picsum.photos/seed/disney/900/1200" },
  { id: "tesla", term: "Tesla", searches: 80_000_000, imageUrl: "https://picsum.photos/seed/tesla/900/1200" },
  { id: "iphone", term: "iPhone 15", searches: 78_000_000, imageUrl: "https://picsum.photos/seed/iphone/900/1200" },
  { id: "ps5", term: "PlayStation 5", searches: 72_000_000, imageUrl: "https://picsum.photos/seed/ps5/900/1200" },
  { id: "fortnite", term: "Fortnite", searches: 70_000_000, imageUrl: "https://picsum.photos/seed/fortnite/900/1200" },
  { id: "minecraft", term: "Minecraft", searches: 68_000_000, imageUrl: "https://picsum.photos/seed/minecraft/900/1200" },
  { id: "roblox", term: "Roblox", searches: 66_000_000, imageUrl: "https://picsum.photos/seed/roblox/900/1200" },
  { id: "nba", term: "NBA", searches: 64_000_000, imageUrl: "https://picsum.photos/seed/nba/900/1200" },
  { id: "premier-league", term: "Premier League", searches: 63_000_000, imageUrl: "https://picsum.photos/seed/premierleague/900/1200" },
  { id: "bitcoin", term: "Bitcoin", searches: 60_000_000, imageUrl: "https://picsum.photos/seed/bitcoin/900/1200" },
  { id: "amazon-prime", term: "Amazon Prime", searches: 55_000_000, imageUrl: "https://picsum.photos/seed/amazonprime/900/1200" },
  { id: "paypal", term: "PayPal", searches: 58_000_000, imageUrl: "https://picsum.photos/seed/paypal/900/1200" },
  { id: "apple", term: "Apple", searches: 145_000_000, imageUrl: "https://picsum.photos/seed/apple/900/1200" },
  { id: "microsoft", term: "Microsoft", searches: 125_000_000, imageUrl: "https://picsum.photos/seed/microsoft/900/1200" },
  { id: "samsung", term: "Samsung", searches: 140_000_000, imageUrl: "https://picsum.photos/seed/samsung/900/1200" },
  { id: "playstore", term: "Google Play Store", searches: 95_000_000, imageUrl: "https://picsum.photos/seed/playstore/900/1200" },
  { id: "icloud", term: "iCloud", searches: 88_000_000, imageUrl: "https://picsum.photos/seed/icloud/900/1200" },
  { id: "prime-video", term: "Prime Video", searches: 74_000_000, imageUrl: "https://picsum.photos/seed/primevideo/900/1200" },
  { id: "spotify-premium", term: "Spotify Premium", searches: 66_000_000, imageUrl: "https://picsum.photos/seed/spotifypremium/900/1200" },
  { id: "psn", term: "PlayStation Network", searches: 64_000_000, imageUrl: "https://picsum.photos/seed/psn/900/1200" },
  { id: "nfl", term: "NFL", searches: 58_000_000, imageUrl: "https://picsum.photos/seed/nfl/900/1200" },
  { id: "fifa", term: "FIFA", searches: 62_000_000, imageUrl: "https://picsum.photos/seed/fifa/900/1200" },
  { id: "worldcup", term: "World Cup", searches: 80_000_000, imageUrl: "https://picsum.photos/seed/worldcup/900/1200" },
  { id: "uefa", term: "UEFA", searches: 70_000_000, imageUrl: "https://picsum.photos/seed/uefa/900/1200" },
  { id: "nasa", term: "NASA", searches: 52_000_000, imageUrl: "https://picsum.photos/seed/nasa/900/1200" },

  // Medium
  { id: "ethereum", term: "Ethereum", searches: 42_000_000, imageUrl: "https://picsum.photos/seed/ethereum/900/1200" },
  { id: "binance", term: "Binance", searches: 38_000_000, imageUrl: "https://picsum.photos/seed/binance/900/1200" },
  { id: "coinbase", term: "Coinbase", searches: 28_000_000, imageUrl: "https://picsum.photos/seed/coinbase/900/1200" },
  { id: "starbucks", term: "Starbucks", searches: 32_000_000, imageUrl: "https://picsum.photos/seed/starbucks/900/1200" },
  { id: "mcd", term: "McDonalds", searches: 35_000_000, imageUrl: "https://picsum.photos/seed/mcdonalds/900/1200" },
  { id: "kfc", term: "KFC", searches: 31_000_000, imageUrl: "https://picsum.photos/seed/kfc/900/1200" },
  { id: "subway", term: "Subway", searches: 29_000_000, imageUrl: "https://picsum.photos/seed/subway/900/1200" },
  { id: "nike", term: "Nike", searches: 30_000_000, imageUrl: "https://picsum.photos/seed/nike/900/1200" },
  { id: "adidas", term: "Adidas", searches: 27_000_000, imageUrl: "https://picsum.photos/seed/adidas/900/1200" },
  { id: "zara", term: "Zara", searches: 23_000_000, imageUrl: "https://picsum.photos/seed/zara/900/1200" },
  { id: "shein", term: "Shein", searches: 22_000_000, imageUrl: "https://picsum.photos/seed/shein/900/1200" },
  { id: "hm", term: "H&M", searches: 21_000_000, imageUrl: "https://picsum.photos/seed/hm/900/1200" },
  { id: "ikea", term: "IKEA", searches: 20_000_000, imageUrl: "https://picsum.photos/seed/ikea/900/1200" },
  { id: "costco", term: "Costco", searches: 19_000_000, imageUrl: "https://picsum.photos/seed/costco/900/1200" },
  { id: "walmart", term: "Walmart", searches: 18_000_000, imageUrl: "https://picsum.photos/seed/walmart/900/1200" },
  { id: "target", term: "Target", searches: 17_000_000, imageUrl: "https://picsum.photos/seed/target/900/1200" },
  { id: "bestbuy", term: "Best Buy", searches: 16_000_000, imageUrl: "https://picsum.photos/seed/bestbuy/900/1200" },
  { id: "homedepot", term: "Home Depot", searches: 15_000_000, imageUrl: "https://picsum.photos/seed/homedepot/900/1200" },
  { id: "lego", term: "Lego", searches: 14_000_000, imageUrl: "https://picsum.photos/seed/lego/900/1200" },
  { id: "openai", term: "OpenAI", searches: 14_500_000, imageUrl: "https://picsum.photos/seed/openai/900/1200", familiarity: "popular" },
  { id: "chatgpt", term: "ChatGPT", searches: 14_000_000, imageUrl: "https://picsum.photos/seed/chatgpt/900/1200", tags: ["ai"], familiarity: "popular" },
  { id: "claude", term: "Claude", searches: 12_000_000, imageUrl: "https://picsum.photos/seed/claude/900/1200", tags: ["ai"], familiarity: "popular" },
  { id: "vscode", term: "VS Code", searches: 12_500_000, imageUrl: "https://picsum.photos/seed/vscode/900/1200" },
  { id: "stackoverflow", term: "Stack Overflow", searches: 12_000_000, imageUrl: "https://picsum.photos/seed/stackoverflow/900/1200" },
  { id: "figma", term: "Figma", searches: 11_000_000, imageUrl: "https://picsum.photos/seed/figma/900/1200" },
  { id: "notion", term: "Notion", searches: 10_000_000, imageUrl: "https://picsum.photos/seed/notion/900/1200" },
  { id: "jira", term: "Jira", searches: 9_000_000, imageUrl: "https://picsum.photos/seed/jira/900/1200" },
  { id: "asana", term: "Asana", searches: 8_200_000, imageUrl: "https://picsum.photos/seed/asana/900/1200" },
  { id: "trello", term: "Trello", searches: 7_900_000, imageUrl: "https://picsum.photos/seed/trello/900/1200" },
  { id: "midjourney", term: "Midjourney", searches: 7_600_000, imageUrl: "https://picsum.photos/seed/midjourney/900/1200", tags: ["ai"] },
  { id: "dalle", term: "DALL-E", searches: 7_100_000, imageUrl: "https://picsum.photos/seed/dalle/900/1200", tags: ["ai"] },
  { id: "stable-diffusion", term: "Stable Diffusion", searches: 6_800_000, imageUrl: "https://picsum.photos/seed/stablediffusion/900/1200", tags: ["ai"] },
  { id: "runwayml", term: "Runway ML", searches: 6_300_000, imageUrl: "https://picsum.photos/seed/runwayml/900/1200", tags: ["ai"] },
  { id: "figjam", term: "FigJam", searches: 6_200_000, imageUrl: "https://picsum.photos/seed/figjam/900/1200" },
  { id: "capcut", term: "CapCut", searches: 6_500_000, imageUrl: "https://picsum.photos/seed/capcut/900/1200" },
  { id: "canva", term: "Canva", searches: 8_900_000, imageUrl: "https://picsum.photos/seed/canva/900/1200" },
  { id: "tradingview", term: "TradingView", searches: 9_800_000, imageUrl: "https://picsum.photos/seed/tradingview/900/1200" },
  { id: "robinhood", term: "Robinhood", searches: 8_500_000, imageUrl: "https://picsum.photos/seed/robinhood/900/1200" },
  { id: "stripe", term: "Stripe", searches: 10_500_000, imageUrl: "https://picsum.photos/seed/stripe/900/1200" },
  { id: "paypal-me", term: "PayPal Me", searches: 7_400_000, imageUrl: "https://picsum.photos/seed/paypalme/900/1200" },

  // Hard
  { id: "supabase", term: "Supabase", searches: 3_200_000, imageUrl: "https://picsum.photos/seed/supabase/900/1200", familiarity: "niche" },
  { id: "pocketbase", term: "PocketBase", searches: 850_000, imageUrl: "https://picsum.photos/seed/pocketbase/900/1200", familiarity: "niche" },
  { id: "remix", term: "Remix.run", searches: 780_000, imageUrl: "https://picsum.photos/seed/remix/900/1200", familiarity: "niche" },
  { id: "bun", term: "Bun runtime", searches: 2_400_000, imageUrl: "https://picsum.photos/seed/bun/900/1200", familiarity: "niche" },
  { id: "qdrant", term: "Qdrant", searches: 620_000, imageUrl: "https://picsum.photos/seed/qdrant/900/1200", tags: ["ai"] },
  { id: "pinecone", term: "Pinecone", searches: 1_600_000, imageUrl: "https://picsum.photos/seed/pinecone/900/1200", tags: ["ai"] },
  { id: "vectordb", term: "Vector DB", searches: 1_100_000, imageUrl: "https://picsum.photos/seed/vectordb/900/1200" },
  { id: "raycast", term: "Raycast", searches: 2_200_000, imageUrl: "https://picsum.photos/seed/raycast/900/1200" },
  { id: "arc", term: "Arc Browser", searches: 1_900_000, imageUrl: "https://picsum.photos/seed/arc/900/1200" },
  { id: "linear", term: "Linear", searches: 3_100_000, imageUrl: "https://picsum.photos/seed/linear/900/1200" },
  { id: "monday-dev", term: "Monday Dev", searches: 4_800_000, imageUrl: "https://picsum.photos/seed/mondaydev/900/1200" },
  { id: "obsidian", term: "Obsidian", searches: 4_200_000, imageUrl: "https://picsum.photos/seed/obsidian/900/1200" },
  { id: "zed", term: "Zed editor", searches: 1_400_000, imageUrl: "https://picsum.photos/seed/zed/900/1200" },
  { id: "lapce", term: "Lapce", searches: 520_000, imageUrl: "https://picsum.photos/seed/lapce/900/1200" },
  { id: "helix", term: "Helix editor", searches: 430_000, imageUrl: "https://picsum.photos/seed/helix/900/1200" },
  { id: "tldraw", term: "tldraw", searches: 670_000, imageUrl: "https://picsum.photos/seed/tldraw/900/1200" },
  { id: "soroban", term: "Soroban", searches: 390_000, imageUrl: "https://picsum.photos/seed/soroban/900/1200" },
  { id: "riverpod", term: "Riverpod", searches: 980_000, imageUrl: "https://picsum.photos/seed/riverpod/900/1200" },
  { id: "solidjs", term: "SolidJS", searches: 1_700_000, imageUrl: "https://picsum.photos/seed/solidjs/900/1200" },
  { id: "sveltekit", term: "SvelteKit", searches: 2_600_000, imageUrl: "https://picsum.photos/seed/sveltekit/900/1200" },
  { id: "astro", term: "Astro", searches: 1_000_000, imageUrl: "https://picsum.photos/seed/astro/900/1200" },
  { id: "vite", term: "Vite", searches: 3_800_000, imageUrl: "https://picsum.photos/seed/vite/900/1200" },
  { id: "pnpm", term: "pnpm", searches: 1_500_000, imageUrl: "https://picsum.photos/seed/pnpm/900/1200" },
  { id: "yew", term: "Yew", searches: 420_000, imageUrl: "https://picsum.photos/seed/yew/900/1200" },
  { id: "foundry", term: "Foundry", searches: 2_900_000, imageUrl: "https://picsum.photos/seed/foundry/900/1200" },
  { id: "wagmi", term: "Wagmi", searches: 1_200_000, imageUrl: "https://picsum.photos/seed/wagmi/900/1200" },
  { id: "ethers-v6", term: "Ethers v6", searches: 2_000_000, imageUrl: "https://picsum.photos/seed/ethersv6/900/1200" },
  { id: "hardhat", term: "Hardhat", searches: 1_900_000, imageUrl: "https://picsum.photos/seed/hardhat/900/1200" },
  { id: "forge", term: "Foundry Forge", searches: 1_700_000, imageUrl: "https://picsum.photos/seed/forge/900/1200" },
  { id: "dune", term: "Dune Analytics", searches: 2_200_000, imageUrl: "https://picsum.photos/seed/dune/900/1200" },
  { id: "flipside", term: "Flipside", searches: 1_050_000, imageUrl: "https://picsum.photos/seed/flipside/900/1200" },
  { id: "nansen", term: "Nansen", searches: 1_800_000, imageUrl: "https://picsum.photos/seed/nansen/900/1200" },
  { id: "dydx", term: "dYdX", searches: 4_100_000, imageUrl: "https://picsum.photos/seed/dydx/900/1200" }
];

const EXTRA_EASY_NAMES = [
  "Coca-Cola",
  "Pepsi",
  "Samsung Galaxy",
  "iPad",
  "WhatsApp Web",
  "Gmail Login",
  "YouTube Music",
  "Facebook Login",
  "Google Maps",
  "Google Drive",
  "Microsoft Teams",
  "Zoom App",
  "Netflix Login",
  "Disneyland",
  "Amazon Kindle",
  "Prime Day",
  "Best Buy Deals",
  "Walmart Grocery",
  "Target Online",
  "IKEA Store",
  "Nike Store",
  "Adidas Store",
  "H&M Online",
  "Zara Sale",
  "Shein Dresses",
  "Costco Travel",
  "Apple Music",
  "Spotify Wrapped",
  "AirPods",
  "Tesla Model 3"
];

const EXTRA_MEDIUM_NAMES = [
  "Adidas",
  "Spotify",
  "Uber Eats",
  "DoorDash",
  "Lyft",
  "Best Buy Credit",
  "IKEA Furniture",
  "Costco Membership",
  "Trader Joes",
  "Chipotle",
  "Chick-fil-A",
  "Five Guys",
  "Starbucks Rewards",
  "Panera Bread",
  "Dominos Pizza",
  "Little Caesars",
  "NBA Store",
  "Premier League Scores",
  "La Liga",
  "Bundesliga",
  "F1 Live",
  "MotoGP",
  "Cricket World Cup",
  "Rugby World Cup",
  "Valorant",
  "League of Legends",
  "Apex Legends",
  "Call of Duty",
  "Counter Strike 2",
  "Rocket League",
  "Pokemon Go",
  "Genshin Impact",
  "Starbucks Menu",
  "Krispy Kreme",
  "Subway Menu",
  "Lowes",
  "Home Depot Rental",
  "Wayfair",
  "Etsy",
  "Instacart"
];

const EXTRA_HARD_NAMES = [
  "Parcel",
  "Linear Cycle",
  "Notion AI",
  "Reflect Notes",
  "Superhuman",
  "Cron",
  "Height",
  "Warp Terminal",
  "Figstack",
  "Copilot Studio",
  "Cursor IDE",
  "Tabnine",
  "Deepgram",
  "Replicate",
  "OctoAI",
  "Hugging Face",
  "Civitai",
  "Gradio",
  "LangChain",
  "LlamaIndex",
  "AutoGPT",
  "FastAPI",
  "tRPC",
  "HTMX",
  "Nhost",
  "Sanity CMS",
  "Contentful",
  "DatoCMS",
  "Prismic",
  "Clerk Auth",
  "Auth0",
  "Magic Link",
  "Liveblocks",
  "Ably",
  "Pusher",
  "Socket.io",
  "Temporal",
  "SST",
  "Begin",
  "Fly.io",
  "Railway",
  "Render",
  "Supabase Edge",
  "PlanetScale",
  "Neon DB",
  "Turso",
  "D1",
  "Convex",
  "PocketBase Cloud",
  "Upstash",
  "Inngest",
  "Trigger.dev",
  "Gleam Lang",
  "Zig",
  "Crystal Lang",
  "OCaml",
  "Elixir Phoenix",
  "Ballerina",
  "Haxe",
  "Godot Engine",
  "Unity 6",
  "Unreal 5",
  "Blender 4",
  "Cinema 4D",
  "DaVinci Resolve",
  "Ableton Live",
  "FL Studio",
  "Bitwig"
];

function makeAdditionalTerms(names: string[], difficulty: Difficulty, start: number, step: number): SearchTerm[] {
  const items: SearchTerm[] = [];
  const min =
    difficulty === "easy"
      ? DIFFICULTY_THRESHOLDS.easy + 2_000_000
      : difficulty === "medium"
        ? DIFFICULTY_THRESHOLDS.medium + 200_000
        : 200_000;
  const max = difficulty === "hard" ? DIFFICULTY_THRESHOLDS.medium - 100_000 : undefined;

  names.forEach((name, idx) => {
    const searches = clampValue(start - idx * step, min, max ?? start);
    items.push({
      id: `${difficulty}-${name.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}`,
      term: name,
      searches,
      imageUrl: `https://picsum.photos/seed/${encodeURIComponent(name)}/900/1200`,
      difficulty
    });
  });
  return items;
}

function clampValue(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function categorizeTerm(term: Omit<SearchTerm, "difficulty">): SearchTerm {
  return {
    ...term,
    difficulty: computeDifficulty(term.searches)
  };
}

function ensureTargetCounts(base: SearchTerm[], targetPerDifficulty = 70): SearchTerm[] {
  const counts = countByDifficulty(base);
  const additions: SearchTerm[] = [];

  if (counts.easy < targetPerDifficulty) {
    const needed = targetPerDifficulty - counts.easy;
    additions.push(...makeAdditionalTerms(EXTRA_EASY_NAMES.slice(0, needed), "easy", 150_000_000, 2_000_000));
  }
  if (counts.medium < targetPerDifficulty) {
    const needed = targetPerDifficulty - counts.medium;
    additions.push(...makeAdditionalTerms(EXTRA_MEDIUM_NAMES.slice(0, needed), "medium", 42_000_000, 500_000));
  }
  if (counts.hard < targetPerDifficulty) {
    const needed = targetPerDifficulty - counts.hard;
    additions.push(...makeAdditionalTerms(EXTRA_HARD_NAMES.slice(0, needed), "hard", 4_500_000, 70_000));
  }

  const merged = [...base, ...additions];
  return dedupe(merged);
}

function dedupe(list: SearchTerm[]): SearchTerm[] {
  const seen = new Set<string>();
  return list.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function countByDifficulty(list: SearchTerm[]): Record<Difficulty, number> {
  return list.reduce<Record<Difficulty, number>>(
    (acc, term) => {
      acc[term.difficulty] += 1;
      return acc;
    },
    { easy: 0, medium: 0, hard: 0 }
  );
}

const withDifficulty: SearchTerm[] = MANUAL_TERMS.map(categorizeTerm);
const padded = ensureTargetCounts(withDifficulty, 70);

const cleaned = padded.filter(isValidTermEntry);
const counts = countByDifficulty(cleaned);

if (cleaned.length !== padded.length) {
  // eslint-disable-next-line no-console
  console.warn(`[terms] filtered invalid placeholder entries. before=${padded.length} after=${cleaned.length}`);
}

export const TERMS: SearchTerm[] = cleaned;

export const TERMS_BY_DIFFICULTY: Record<Difficulty, SearchTerm[]> = padded.reduce(
  (acc, term) => {
    acc[term.difficulty].push(term);
    return acc;
  },
  { easy: [] as SearchTerm[], medium: [] as SearchTerm[], hard: [] as SearchTerm[] }
);
