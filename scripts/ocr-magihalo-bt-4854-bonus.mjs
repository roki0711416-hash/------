import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createWorker } from "tesseract.js";

const MACHINE_ID = 4854;
const IMAGE_URL = `https://p-town.dmm.com/upload/machines/${MACHINE_ID}/bonus.jpg`;

const TMP_DIR = path.join(process.cwd(), "scripts", ".tmp");
const IMAGE_PATH = path.join(TMP_DIR, `magihalo_bt_${MACHINE_ID}_bonus.jpg`);
const UPSCALED_IMAGE_PATH = path.join(TMP_DIR, `magihalo_bt_${MACHINE_ID}_bonus_upscaled.jpg`);
const OUT_PATH = path.join(TMP_DIR, `ocr_magihalo_bt_${MACHINE_ID}_bonus.txt`);

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

  const numericLikeTokens = [];
  const percents = [];

  for (const l of lines) {
    for (const m of l.matchAll(/(?:^|\D)(\d{1,6}(?:\.\d)?)(?:$|\D)/g)) {
      numericLikeTokens.push(m[1]);
    }
    for (const m of l.matchAll(/(\d{1,3}(?:\.\d)?)\s*%/g)) {
      percents.push(m[1]);
    }
  }

  return { lines, numericLikeTokens, percents };
}

function extractWordRows(words, yThreshold = 40) {
  const cleaned = (words || [])
    .map((w) => {
      const t = String(w.text || "").trim();
      if (!t) return null;
      const text = t.replace(/[^0-9./%]/g, "");
      if (!/[0-9]/.test(text)) return null;
      const bbox = w.bbox || {};
      const x0 = Number(bbox.x0 ?? 0);
      const y0 = Number(bbox.y0 ?? 0);
      const x1 = Number(bbox.x1 ?? 0);
      const y1 = Number(bbox.y1 ?? 0);
      const yc = (y0 + y1) / 2;
      return { text, x0, y0, x1, y1, yc };
    })
    .filter(Boolean);

  cleaned.sort((a, b) => a.yc - b.yc || a.x0 - b.x0);

  const rows = [];
  for (const w of cleaned) {
    const last = rows[rows.length - 1];
    if (!last) {
      rows.push({ yc: w.yc, words: [w] });
      continue;
    }

    if (Math.abs(w.yc - last.yc) <= yThreshold) {
      last.words.push(w);
      last.yc = (last.yc * (last.words.length - 1) + w.yc) / last.words.length;
    } else {
      rows.push({ yc: w.yc, words: [w] });
    }
  }

  for (const r of rows) {
    r.words.sort((a, b) => a.x0 - b.x0);
  }

  return rows;
}

async function main() {
  await fs.mkdir(TMP_DIR, { recursive: true });

  const logParts = [];
  logParts.push(`# OCR for p-town machine ${MACHINE_ID}`);
  logParts.push(`IMAGE_URL: ${IMAGE_URL}`);

  await download(IMAGE_URL, IMAGE_PATH);
  logParts.push(`Downloaded -> ${IMAGE_PATH}`);

  let ocrImagePath = IMAGE_PATH;
  try {
    await execFileAsync("sips", ["-Z", "2400", IMAGE_PATH, "--out", UPSCALED_IMAGE_PATH]);
    ocrImagePath = UPSCALED_IMAGE_PATH;
    logParts.push(`Upscaled -> ${UPSCALED_IMAGE_PATH}`);
  } catch (e) {
    logParts.push(`Upscale skipped: ${String(e)}`);
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

      const { lines, numericLikeTokens, percents } = extractCandidates(text);

      logParts.push("\n" + "=".repeat(80));
      logParts.push(`PSM=${psm}`);
      logParts.push("- Raw text (first 2000 chars):");
      logParts.push(text.slice(0, 2000));
      logParts.push("\n- Lines (filtered):");
      logParts.push(lines.slice(0, 260).join("\n"));
      logParts.push("\n- Numeric-like tokens (first 420):");
      logParts.push(numericLikeTokens.slice(0, 420).join(", "));
      logParts.push("\n- Percent-like tokens:");
      logParts.push(percents.join(", "));

      const rows = extractWordRows(data.words, 55);
      logParts.push("\n- Word rows (digits only):");
      for (const r of rows.slice(0, 50)) {
        const line = r.words.map((w) => w.text).join(" ");
        logParts.push(line);
      }

      logParts.push("\n- Words with bbox (first 120):");
      for (const w of (data.words || []).slice(0, 120)) {
        const t = String(w.text || "").trim();
        if (!t) continue;
        const bbox = w.bbox || {};
        logParts.push(
          `${t}\t${bbox.x0 ?? ""},${bbox.y0 ?? ""},${bbox.x1 ?? ""},${bbox.y1 ?? ""}`,
        );
      }
    }

    // If the table OCR is messy, scan horizontal strips as single lines.
    // This often helps recover missing rows in dense tables.
    const stripHeight = 150;
    const startY = 180;
    const endY = 1250;
    const stepY = 110;

    logParts.push("\n" + "=".repeat(80));
    logParts.push("STRIP_OCR (PSM=7)");
    logParts.push(`imageSize: 2400x1324 (upscaled)`);
    logParts.push(`stripHeight=${stripHeight}, y=${startY}..${endY} step=${stepY}`);

    await worker.setParameters({ tessedit_pageseg_mode: "7" });
    for (let y = startY; y <= endY; y += stepY) {
      const { data } = await worker.recognize(ocrImagePath, {
        rectangle: { left: 0, top: y, width: 2400, height: stripHeight },
      });
      const text = (data.text || "").replace(/\s+/g, " ").trim();
      if (!text) continue;

      const { numericLikeTokens, percents } = extractCandidates(data.text || "");
      logParts.push(`\n[y=${y}..${y + stripHeight}] ${text}`);
      if (numericLikeTokens.length) {
        logParts.push(`tokens: ${numericLikeTokens.slice(0, 40).join(", ")}`);
      }
      if (percents.length) {
        logParts.push(`percents: ${percents.join(", ")}`);
      }
    }
  } finally {
    await worker.terminate();
  }

  await fs.writeFile(OUT_PATH, logParts.join("\n"), "utf8");
  console.log(`Saved OCR log -> ${OUT_PATH}`);
}

await main();
