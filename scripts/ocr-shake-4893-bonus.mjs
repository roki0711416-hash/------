import { createWorker } from "tesseract.js";
import fs from "node:fs/promises";
import path from "node:path";

const IMAGE_URL = "https://p-town.dmm.com/upload/machines/4893/bonus.jpg";
const OUT_DIR = path.resolve("scripts", ".tmp");
const OUT_IMAGE_PATH = path.join(OUT_DIR, "shake_4893_bonus.jpg");

function extractCandidates(text) {
	const lines = text
		.split(/\r?\n/)
		.map((l) => l.trim())
		.filter(Boolean);

	const percents = [];
	const fractions = [];

	for (const line of lines) {
		for (const m of line.matchAll(/(\d{2,3}\.\d)%/g)) {
			percents.push(Number(m[1]));
		}
		for (const m of line.matchAll(/1\s*\/\s*(\d{2,6}\.\d)/g)) {
			fractions.push(Number(m[1]));
		}
		for (const m of line.matchAll(/1\s*\/\s*(\d{2,6})/g)) {
			fractions.push(Number(m[1]));
		}
	}

	return { lines, percents, fractions };
}

async function main() {
	await fs.mkdir(OUT_DIR, { recursive: true });

	console.log(`Downloading: ${IMAGE_URL}`);
	const res = await fetch(IMAGE_URL);
	if (!res.ok) {
		throw new Error(`Failed to download image: ${res.status} ${res.statusText}`);
	}
	const arrayBuffer = await res.arrayBuffer();
	await fs.writeFile(OUT_IMAGE_PATH, Buffer.from(arrayBuffer));
	console.log(`Saved: ${OUT_IMAGE_PATH}`);

	// Numeric-heavy; use eng to avoid missing jpn traineddata.
	const worker = await createWorker("eng");

	const psmToTry = [6, 4, 11];
	for (const psm of psmToTry) {
		console.log(`\n\n--- OCR attempt: PSM=${psm} ---`);
		await worker.setParameters({
			preserve_interword_spaces: "1",
			user_defined_dpi: "300",
			tessedit_pageseg_mode: String(psm),
			tessedit_char_whitelist: "0123456789./%",
		});

		const {
			data: { text },
		} = await worker.recognize(OUT_IMAGE_PATH);

		const { lines, percents, fractions } = extractCandidates(text);

		console.log("\n[RAW TEXT]\n" + text);
		console.log("\n[CANDIDATES]");
		console.log(`percents (${percents.length}):`, percents.join(", "));
		console.log(`fractions (${fractions.length}):`, fractions.join(", "));

		console.log("\n[LINES]");
		for (const line of lines) console.log(line);
	}

	await worker.terminate();
}

await main();
