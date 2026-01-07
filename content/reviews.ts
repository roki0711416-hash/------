export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export type Review = {
  id: string;
  machineId: string;
  date: string; // YYYY-MM-DD
  rating: ReviewRating;
  author?: string;
  body: string;
};

// MVP: 口コミは手動でここに追加（後でDB/投稿フォームに差し替え可能）
export const reviews: Review[] = [];

export function getReviewsForMachine(machineId: string): Review[] {
  return reviews
    .filter((r) => r.machineId === machineId)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}
