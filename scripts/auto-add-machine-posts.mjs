import { readFile, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

function getArgValue(args, name) {
  const idx = args.indexOf(name);
  if (idx === -1) return null;
  const v = args[idx + 1];
  if (!v || v.startsWith("--")) return null;
  return v;
}

function pad3(n) {
  return String(n).padStart(3, "0");
}

function todayJstYmd() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
  const jst = new Date(utc + 9 * 60 * 60_000);
  const y = jst.getFullYear();
  const m = String(jst.getMonth() + 1).padStart(2, "0");
  const d = String(jst.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function gitDiffAddedMachineIds(base, head) {
  const range = base && head ? `${base}..${head}` : null;

  const args = ["diff", "--unified=0"];
  if (range) args.push(range);
  args.push("--", "content/machines.ts");

  const { stdout } = await execFileAsync("git", args);

  const ids = new Set();
  for (const line of stdout.split("\n")) {
    if (!line.startsWith("+")) continue;
    if (line.startsWith("+++")) continue;

    const m = line.match(/^\+\s*id:\s*["']([^"']+)["']/);
    if (m) ids.add(m[1]);
  }

  return [...ids];
}

async function getMachineNameById(machineId) {
  const raw = await readFile("content/machines.ts", "utf8");
  const lines = raw.split(/\r?\n/);

  let seenId = false;
  for (const line of lines) {
    if (!seenId) {
      if (line.includes(`id: "${machineId}"`) || line.includes(`id: '${machineId}'`)) {
        seenId = true;
      }
      continue;
    }

    const nameMatch = line.match(/\bname:\s*["']([^"']+)["']/);
    if (nameMatch) return nameMatch[1];

    // stop scanning once we leave the object
    if (line.trim() === "},") break;
  }

  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const base = getArgValue(args, "--base");
  const head = getArgValue(args, "--head");

  const addedIds = await gitDiffAddedMachineIds(base, head);
  if (addedIds.length === 0) {
    console.log("No new machine ids detected.");
    return;
  }

  const postsPath = "content/posts.json";
  const postsRaw = await readFile(postsPath, "utf8");
  const postsJson = JSON.parse(postsRaw);
  const posts = Array.isArray(postsJson) ? postsJson : [];

  const date = todayJstYmd();
  const prefix = `${date}-`;
  const seqs = posts
    .map((p) => (p && typeof p === "object" ? p.id : null))
    .filter((id) => typeof id === "string" && id.startsWith(prefix))
    .map((id) => Number(id.slice(prefix.length)))
    .filter((n) => Number.isFinite(n) && n > 0);

  let nextSeq = (seqs.length ? Math.max(...seqs) : 0) + 1;

  let changed = false;
  for (const machineId of addedIds) {
    const href = `/tool?machine=${machineId}`;
    const exists = posts.some((p) => p && typeof p === "object" && p.href === href);
    if (exists) continue;

    const machineName = (await getMachineNameById(machineId)) ?? machineId;

    const id = `${date}-${pad3(nextSeq++)}`;
    const title = `${machineName}対応`;
    const body = `${machineName}を追加しました。`;

    posts.unshift({ id, date, title, href, body });
    changed = true;
  }

  if (!changed) {
    console.log("No new posts to add (all already exist).\n");
    return;
  }

  await writeFile(postsPath, JSON.stringify(posts, null, 2) + "\n", "utf8");
  console.log(`Updated ${postsPath} (${addedIds.length} machine ids checked).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
