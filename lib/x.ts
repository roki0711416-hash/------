import { readFile } from "node:fs/promises";
import path from "node:path";

export type XConfig = {
  profileUrl: string;
};

function getXConfigPath() {
  return path.join(process.cwd(), "content", "x.json");
}

export async function getXConfig(): Promise<XConfig> {
  const json = await readFile(getXConfigPath(), "utf8");
  const data = JSON.parse(json) as unknown;

  if (
    typeof data === "object" &&
    data !== null &&
    "profileUrl" in data &&
    typeof (data as { profileUrl: unknown }).profileUrl === "string"
  ) {
    return { profileUrl: (data as { profileUrl: string }).profileUrl };
  }

  return { profileUrl: "https://x.com/" };
}
