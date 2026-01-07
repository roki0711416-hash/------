import { readFile } from "node:fs/promises";
import path from "node:path";

export type XConfig = {
  profileUrl: string;
  latestThreadUrl?: string;
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
    const latestThreadUrl =
      "latestThreadUrl" in data &&
      typeof (data as { latestThreadUrl: unknown }).latestThreadUrl === "string"
        ? (data as { latestThreadUrl: string }).latestThreadUrl
        : undefined;

    return {
      profileUrl: (data as { profileUrl: string }).profileUrl,
      latestThreadUrl,
    };
  }

  return { profileUrl: "https://x.com/" };
}
