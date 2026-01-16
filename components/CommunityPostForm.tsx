"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "地域別（都道府県）",
  "ホール別",
  "機種別",
  "雑談",
  "実践報告",
  "初心者質問",
] as const;

type Category = (typeof CATEGORIES)[number];

const PREFECTURES = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
] as const;

function isCategory(v: string): v is Category {
  return (CATEGORIES as readonly string[]).includes(v);
}

export default function CommunityPostForm() {
  const router = useRouter();

  const [category, setCategory] = useState<Category>("雑談");
  const [prefecture, setPrefecture] = useState<string>("");
  const [hall, setHall] = useState<string>("");
  const [machine, setMachine] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const needPrefecture = category === "地域別（都道府県）";
  const needHall = category === "ホール別";
  const needMachine = category === "機種別";

  const help = useMemo(() => {
    if (needPrefecture) return "都道府県を選んで投稿してください。";
    if (needHall) return "ホール名を入れて投稿してください。";
    if (needMachine) return "機種名を入れて投稿してください。";
    return "";
  }, [needPrefecture, needHall, needMachine]);

  async function submit() {
    setError(null);
    setDone(false);

    const cat = category;
    if (!isCategory(cat)) {
      setError("カテゴリが不正です。");
      return;
    }

    const t = title.trim();
    const b = body.trim();
    if (!t) {
      setError("タイトルを入力してください。");
      return;
    }
    if (t.length > 60) {
      setError("タイトルは60文字以内で入力してください。");
      return;
    }
    if (!b) {
      setError("本文を入力してください。");
      return;
    }
    if (b.length > 1000) {
      setError("本文は1000文字以内で入力してください。");
      return;
    }

    const pref = prefecture.trim();
    const h = hall.trim();
    const m = machine.trim();

    if (needPrefecture && !pref) {
      setError("都道府県を選んでください。");
      return;
    }
    if (needHall && !h) {
      setError("ホール名を入力してください。");
      return;
    }
    if (needMachine && !m) {
      setError("機種名を入力してください。");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          category: cat,
          prefecture: pref || undefined,
          hall: h || undefined,
          machine: m || undefined,
          title: t,
          body: b,
        }),
      });

      const json = (await res.json().catch(() => null)) as
        | { ok: true; id: string }
        | { error: string }
        | null;

      if (!res.ok) {
        const msg = json && typeof json === "object" && "error" in json ? String(json.error) : "投稿に失敗しました。";
        setError(msg);
        return;
      }

      setTitle("");
      setBody("");
      setDone(true);
      router.refresh();
    } catch {
      setError("投稿に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <p className="text-sm font-semibold">投稿する</p>
      <p className="mt-1 text-xs text-neutral-500">※有料会員限定の掲示板です。</p>

      <div className="mt-3 grid gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-neutral-600">カテゴリ</span>
          <select
            className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {help ? <p className="mt-1 text-xs text-neutral-500">{help}</p> : null}
        </label>

        {needPrefecture ? (
          <label className="block">
            <span className="text-xs font-semibold text-neutral-600">都道府県</span>
            <select
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
              value={prefecture}
              onChange={(e) => setPrefecture(e.target.value)}
            >
              <option value="">選択してください</option>
              {PREFECTURES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {needHall ? (
          <label className="block">
            <span className="text-xs font-semibold text-neutral-600">ホール名</span>
            <input
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
              value={hall}
              onChange={(e) => setHall(e.target.value)}
              placeholder="例: ○○ホール新宿店"
              maxLength={50}
            />
          </label>
        ) : null}

        {needMachine ? (
          <label className="block">
            <span className="text-xs font-semibold text-neutral-600">機種名</span>
            <input
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
              value={machine}
              onChange={(e) => setMachine(e.target.value)}
              placeholder="例: L北斗の拳"
              maxLength={50}
            />
          </label>
        ) : null}

        <label className="block">
          <span className="text-xs font-semibold text-neutral-600">タイトル</span>
          <input
            className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: 東京の稼働状況どうですか？"
            maxLength={60}
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-neutral-600">本文</span>
          <textarea
            className="mt-1 min-h-24 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="例: 最近の状況、狙い目、注意点など"
            maxLength={1000}
          />
          <p className="mt-1 text-xs text-neutral-500">1000文字まで</p>
        </label>

        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        {done ? <p className="text-sm font-medium text-neutral-700">投稿しました。</p> : null}

        <button
          type="button"
          onClick={submit}
          disabled={isSubmitting}
          className="rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          投稿する
        </button>
      </div>
    </div>
  );
}
