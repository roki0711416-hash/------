import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

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

function getPostsPath() {
  return path.join(process.cwd(), "content", "posts.json");
}

function getXPath() {
  return path.join(process.cwd(), "content", "x.json");
}

function isValidYmd(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function isLikelyUrl(s) {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);

  const machineName = getArgValue(args, "--machineName") ?? getArgValue(args, "--name");
  const xThreadUrl = getArgValue(args, "--xThreadUrl") ?? getArgValue(args, "--threadUrl");
  const date = getArgValue(args, "--date") ?? todayJstYmd();

  if (!machineName) {
    console.error("Missing --machineName. Example: node scripts/publish-machine-update.mjs --machineName \"SアイムジャグラーEX\"");
    process.exit(1);
  }

  if (!isValidYmd(date)) {
    console.error("Invalid --date. Use YYYY-MM-DD.");
    process.exit(1);
  }

  if (xThreadUrl && !isLikelyUrl(xThreadUrl)) {
    console.error("Invalid --xThreadUrl (must be a URL).");
    process.exit(1);
  }

  // Update posts.json
  const postsPath = getPostsPath();
  const postsRaw = await readFile(postsPath, "utf8");
  const postsJson = JSON.parse(postsRaw);
  const posts = Array.isArray(postsJson) ? postsJson : [];

  const prefix = `${date}-`;
  const seqs = posts
    .map((p) => (p && typeof p === "object" ? p.id : null))
    .filter((id) => typeof id === "string" && id.startsWith(prefix))
    .map((id) => Number(id.slice(prefix.length)))
    .filter((n) => Number.isFinite(n) && n > 0);

  const nextSeq = (seqs.length ? Math.max(...seqs) : 0) + 1;
  const id = `${date}-${pad3(nextSeq)}`;

  const title = `${machineName}の設定判別ツールをアップしました。`;
  const body = xThreadUrl
    ? `${machineName}の設定判別ツールをアップしました。\n\nXスレッド：${xThreadUrl}`
    : `${machineName}の設定判別ツールをアップしました。`;

  posts.unshift({ id, date, title, body });
  await writeFile(postsPath, JSON.stringify(posts, null, 2) + "\n", "utf8");

  // Update x.json (optional)
  if (xThreadUrl) {
    const xPath = getXPath();
    const xRaw = await readFile(xPath, "utf8");
    const xJson = JSON.parse(xRaw);
    const nextX = {
      profileUrl: typeof xJson?.profileUrl === "string" ? xJson.profileUrl : "https://x.com/",
      latestThreadUrl: xThreadUrl,
    };
    await writeFile(xPath, JSON.stringify(nextX, null, 2) + "\n", "utf8");
  }

  console.log("Updated:");
  console.log(`- content/posts.json: added ${id}`);
  if (xThreadUrl) console.log("- content/x.json: updated latestThreadUrl");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
