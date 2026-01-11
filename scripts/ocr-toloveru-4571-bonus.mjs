import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createWorker } from "tesseract.js";

const MACHINE_ID = 4571;
const IMAGE_URL = `https://p-town.dmm.com/upload/machines/${MACHINE_ID}/bonus.jpg`;

const TMP_DIR = path.join(process.cwd(), "scripts", ".tmp");
const IMAGE_PATH = path.join(TMP_DIR, `toloveru_${MACHINE_ID}_bonus.jpg`);
const UPSCALED_IMAGE_PATH = path.join(TMP_DIR, `toloveru_${MACHINE_ID}_bonus_upscaled.jpg`);
const OUT_PATH = path.join(TMP_DIR, `ocr_toloveru_${MACHINE_ID}_bonus.txt`);

const execFileAsync = promisify(execFile);

async function download(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download: ${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.writeFile(destPath, buf);
}

function extractCandidates(text) {
  const lines = text
    .split(/\r?\n/g)
    .map((l) => l.trim())
    .filter(Boolean);

  const denominators = [];
  const percents = [];

  for (const l of lines) {
    for (const m of l.matchAll(/(?:^|\D)(\d{2,5}(?:\.\d)?)(?:$|\D)/g)) {
      denominators.push(m[1]);
    }
    for (const m of l.matchAll(/(\d{2,3}(?:\.\d)?)\s*%/g)) {
      percents.push(m[1]);
    }
  }

  return { lines, denominators, percents };
}

async function main() {
  await fs.mkdir(TMP_DIR, { recursive: true });

  const logParts = [];
  logParts.push(`# OCR for p-town machine ${MACHINE_ID}`);
  logParts.push(`IMAGE_URL: ${IMAGE_URL}`);

  await download(IMAGE_URL, IMAGE_PATH);
  logParts.push(`Downloaded -> ${IMAGE_PATH}`);

  // Upscale for OCR (macOS built-in). Some p-town images are small-font and OCR improves a lot.
  let ocrImagePath = IMAGE_PATH;
  try {
    await execFileAsync("sips", ["-Z", "2400", IMAGE_PATH, "--out", UPSCALED_IMAGE_PATH]);
    ocrImagePath = UPSCALED_IMAGE_PATH;
    logParts.push(`Upscaled -> ${UPSCALED_IMAGE_PATH}`);
  } catch (e) {
    logParts.push(`Upscale skipped (sips not available?): ${String(e)}`);
  }

  const worker = await createWorker("eng");

  try {
    await worker.setParameters({
      tessedit_char_whitelist: "0123456789./%",
    });

    const psms = [6, 4, 11];

    for (const psm of psms) {
      await worker.setParameters({ tessedit_pageseg_mode: String(psm) });
      const { data } = await worker.recognize(ocrImagePath);
      const text = data.text || "";

      const { lines, denominators, percents } = extractCandidates(text);

      logParts.push("\n" + "=".repeat(80));
      logParts.push(`PSM=${psm}`);
      logParts.push("- Raw text (first 2000 chars):");
      logParts.push(text.slice(0, 2000));
      logParts.push("\n- Lines (filtered):");
      logParts.push(lines.slice(0, 160).join("\n"));
      logParts.push("\n- Denominator-like tokens (first 240):");
      logParts.push(denominators.slice(0, 240).join(", "));
      logParts.push("\n- Percent-like tokens:");
      logParts.push(percents.join(", "));
    }
  } finally {
    await worker.terminate();
  }

  await fs.writeFile(OUT_PATH, logParts.join("\n"), "utf8");
  console.log(`Saved OCR log -> ${OUT_PATH}`);
}

await main();
