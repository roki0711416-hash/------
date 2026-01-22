import { createWorker } from "tesseract.js";
import fs from "node:fs/promises";
import path from "node:path";

const IMAGE_URL = "https://p-town.dmm.com/upload/machines/4741/bonus.jpg";
const OUT_DIR = path.resolve("scripts", ".tmp");
const OUT_IMAGE_PATH = path.join(OUT_DIR, "sister_quest_4741_bonus.jpg");

function extractNumbers(text) {
	const lines = text
		.split(/\r?\n/)
		.map((l) => l.trim())
		.filter(Boolean);

	const percents = [];
	const fractions = [];

	for (const line of lines) {
		for (const m of line.matchAll(/(\d{1,3}\.\d)%/g)) {
			percents.push(Number(m[1]));
		}
		for (const m of line.matchAll(/1\s*\/\s*(\d{2,5}\.\d)/g)) {
			fractions.push(Number(m[1]));
		}
		for (const m of line.matchAll(/1\s*\/\s*(\d{2,5})/g)) {
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

	const langsToTry = ["jpn+eng", "eng"];

	for (const lang of langsToTry) {
		const worker = await createWorker(lang);

		console.log(`\n\n--- OCR language: ${lang} ---`);

		await worker.setParameters({
			preserve_interword_spaces: "1",
		});

		const {
			data: { text },
		} = await worker.recognize(OUT_IMAGE_PATH);

		const { lines, percents, fractions } = extractNumbers(text);

		console.log("\n\n[RAW TEXT]\n" + text);

		console.log("\n[HEURISTICS]");
		console.log(`percent candidates (${percents.length}):`, percents.join(", "));
		console.log(`fraction candidates (${fractions.length}):`, fractions.join(", "));

		const uniquePercents = [...new Set(percents)].sort((a, b) => a - b);
		const uniqueFractions = [...new Set(fractions)].sort((a, b) => a - b);

		console.log("\n[UNIQUE SORTED]");
		console.log(`percents: ${uniquePercents.join(", ")}`);
		console.log(`fractions: ${uniqueFractions.join(", ")}`);

		console.log("\n[LINES]");
		for (const line of lines) console.log(line);

		await worker.terminate();
	}
}

await main();
