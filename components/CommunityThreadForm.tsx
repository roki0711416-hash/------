"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  boardLabel,
  needsHall,
  needsMachine,
  needsPrefecture,
  PREFECTURES,
  type BoardId,
} from "../lib/community";

type Preset = {
  prefecture?: string;
  hall?: string;
  machine?: string;
};

export default function CommunityThreadForm({
  boardId,
  username,
  preset,
}: {
  boardId: BoardId;
  username?: string;
  preset?: Preset;
}) {
  const router = useRouter();

  const [prefecture, setPrefecture] = useState(preset?.prefecture ?? "");
  const [hall, setHall] = useState(preset?.hall ?? "");
  const [machine, setMachine] = useState(preset?.machine ?? "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const needPref = needsPrefecture(boardId);
  const needHall = needsHall(boardId);
  const needMachine = needsMachine(boardId);

  const fixedPrefecture = (preset?.prefecture ?? "").trim();
  const fixedHall = (preset?.hall ?? "").trim();
  const fixedMachine = (preset?.machine ?? "").trim();

  const help = useMemo(() => {
    if (needPref) return "都道府県を選んでスレを立ててください。";
    if (needHall) return "ホール名を入れてスレを立ててください。";
    if (needMachine) return "機種名を入れてスレを立ててください。";
    return "";
  }, [needPref, needHall, needMachine]);

  async function submit() {
    setError(null);
    setDone(false);

    const t = title.trim();
    const b = body.trim();
    if (!t) return setError("タイトルを入力してください。");
    if (t.length > 60) return setError("タイトルは60文字以内で入力してください。");
    if (!b) return setError("本文（1レス目）を入力してください。");
    if (b.length > 1000) return setError("本文は1000文字以内で入力してください。");

    const pref = prefecture.trim();
    const h = hall.trim();
    const m = machine.trim();

    const finalPref = fixedPrefecture || pref;
    const finalHall = fixedHall || h;
    const finalMachine = fixedMachine || m;

    if (needPref && !finalPref) return setError("都道府県を選んでください。");
    if (needHall && !finalHall) return setError("ホール名を入力してください。");
    if (needMachine && !finalMachine) return setError("機種名を入力してください。");

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/community/threads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          boardId,
          prefecture: finalPref || undefined,
          hall: finalHall || undefined,
          machine: finalMachine || undefined,
          title: t,
          body: b,
        }),
      });

      const json = (await res.json().catch(() => null)) as
        | { ok: true; threadId: string }
        | { error: string }
        | null;

      if (!res.ok) {
        const msg = json && typeof json === "object" && "error" in json ? String(json.error) : "投稿に失敗しました。";
        setError(msg);
        return;
      }

      const threadId = json && typeof json === "object" && "ok" in json && json.ok ? json.threadId : null;

      setTitle("");
      setBody("");
      setDone(true);
      if (threadId) {
        router.push(`/community/${boardId}/${threadId}`);
        return;
      }
      router.refresh();
    } catch {
      setError("投稿に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <p className="text-sm font-semibold">スレを立てる（{boardLabel(boardId)}）</p>
      {username ? <p className="mt-1 text-xs text-neutral-600">投稿者: {username}</p> : null}
      {help ? <p className="mt-1 text-xs text-neutral-500">{help}</p> : null}

      <div className="mt-3 grid gap-3">
        {needPref ? (
          <label className="block">
            <span className="text-xs font-semibold text-neutral-600">都道府県</span>
            {fixedPrefecture ? (
              <p className="mt-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800">
                {fixedPrefecture}
              </p>
            ) : (
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
            )}
          </label>
        ) : null}

        {needHall ? (
          <label className="block">
            <span className="text-xs font-semibold text-neutral-600">ホール名</span>
            {fixedHall ? (
              <p className="mt-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800">
                {fixedHall}
              </p>
            ) : (
              <input
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
                value={hall}
                onChange={(e) => setHall(e.target.value)}
                placeholder="例: ○○ホール新宿店"
                maxLength={50}
              />
            )}
          </label>
        ) : null}

        {needMachine ? (
          <label className="block">
            <span className="text-xs font-semibold text-neutral-600">機種名</span>
            {fixedMachine ? (
              <p className="mt-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800">
                {fixedMachine}
              </p>
            ) : (
              <input
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
                value={machine}
                onChange={(e) => setMachine(e.target.value)}
                placeholder="例: L北斗の拳"
                maxLength={50}
              />
            )}
          </label>
        ) : null}

        <label className="block">
          <span className="text-xs font-semibold text-neutral-600">タイトル</span>
          <input
            className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: 東京の稼働状況どう？"
            maxLength={60}
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-neutral-600">本文（1レス目）</span>
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
        {done ? <p className="text-sm font-medium text-neutral-700">スレを作成しました。</p> : null}

        <button
          type="button"
          onClick={submit}
          disabled={isSubmitting}
          className="rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          スレを立てる
        </button>

        <p className="text-xs text-neutral-500">
          ※有料会員限定。ユーザーネーム固定で投稿されます。
        </p>
      </div>
    </div>
  );
}
