import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SOURCE_IMAGE = path.resolve("public", "higherlow.jpg");
const OUTPUT_DIR = path.resolve("public", "manifest");

const assets = [
  { filename: "icon.png", width: 1024, height: 1024, flatten: true },
  { filename: "splash.png", width: 200, height: 200 },
  { filename: "hero.png", width: 1200, height: 630 },
  { filename: "og.png", width: 1200, height: 630 },
  { filename: "image.png", width: 1200, height: 800 },
  { filename: "screenshot1.png", width: 1284, height: 2778 },
  { filename: "screenshot2.png", width: 1284, height: 2778 },
  { filename: "screenshot3.png", width: 1284, height: 2778 }
];

async function main() {
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error(`Source image not found at ${SOURCE_IMAGE}`);
    process.exit(1);
  }

  await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });

  const stats = await sharp(SOURCE_IMAGE).stats();
  const background =
    stats?.dominant && typeof stats.dominant.r === "number"
      ? { r: stats.dominant.r, g: stats.dominant.g, b: stats.dominant.b, alpha: 1 }
      : { r: 255, g: 255, b: 255, alpha: 1 };

  for (const { filename, width, height, flatten } of assets) {
    let pipeline = sharp(SOURCE_IMAGE).resize(width, height, { fit: "cover", position: "center" });
    if (flatten) {
      pipeline = pipeline.flatten({ background });
    }
    await pipeline.png().toFile(path.join(OUTPUT_DIR, filename));
  }

  console.log("Generated manifest assets:");
  for (const { filename, width, height } of assets) {
    console.log(`- ${path.join("public", "manifest", filename)} (${width}x${height})`);
  }
}

main().catch((err) => {
  console.error("Failed to generate manifest assets:", err);
  process.exit(1);
});
