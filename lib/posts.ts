import { readFile } from "node:fs/promises";
import path from "node:path";

export type Post = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  body: string;
};

function getPostsFilePath() {
  return path.join(process.cwd(), "content", "posts.json");
}

export async function getPosts(): Promise<Post[]> {
  const json = await readFile(getPostsFilePath(), "utf8");
  const data = JSON.parse(json) as unknown;

  if (!Array.isArray(data)) return [];

  const posts: Post[] = [];
  for (const item of data) {
    if (
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      "date" in item &&
      "title" in item &&
      "body" in item
    ) {
      const { id, date, title, body } = item as Record<string, unknown>;
      if (
        typeof id === "string" &&
        typeof date === "string" &&
        typeof title === "string" &&
        typeof body === "string"
      ) {
        posts.push({ id, date, title, body });
      }
    }
  }

  posts.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  return posts;
}

export async function getLatestPost(): Promise<Post | null> {
  const posts = await getPosts();
  return posts[0] ?? null;
}

export async function getRecentPosts(limit: number): Promise<Post[]> {
  const posts = await getPosts();
  return posts.slice(0, Math.max(0, limit));
}
