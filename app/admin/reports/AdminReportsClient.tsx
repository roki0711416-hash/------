"use client";

import { useEffect, useState, useCallback } from "react";

// ── 型定義 ──

type Report = {
  id: string;
  reporter_user_id: string;
  target_type: "thread" | "post";
  target_id: string;
  reason: string;
  detail: string;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED";
  created_at: string;
  handled_at: string | null;
  handled_by: string | null;
  reporter_username: string | null;
  reporter_email: string | null;
  target_content: string | null;
  target_author_name: string | null;
  target_author_id: string | null;
  target_author_is_banned?: boolean;
};

type StatusFilter = "OPEN" | "IN_REVIEW" | "RESOLVED";

const REASON_LABELS: Record<string, string> = {
  spam: "スパム・宣伝",
  harassment: "嫌がらせ・誹謗中傷",
  hate: "ヘイトスピーチ・差別",
  sexual: "わいせつ・性的コンテンツ",
  violence: "暴力的な内容",
  other: "その他",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  OPEN: { label: "未対応", color: "bg-red-100 text-red-800" },
  IN_REVIEW: { label: "確認中", color: "bg-yellow-100 text-yellow-800" },
  RESOLVED: { label: "対応済み", color: "bg-green-100 text-green-800" },
};

// ── メインコンポーネント ──

export default function AdminReportsClient() {
  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<StatusFilter>("OPEN");
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?status=${filter}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setReports(data.reports ?? []);
      setTotal(data.total ?? 0);
    } catch (e) {
      console.error("Fetch failed:", e);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // 30秒ポーリング
  useEffect(() => {
    const timer = setInterval(fetchReports, 30_000);
    return () => clearInterval(timer);
  }, [fetchReports]);

  // ── アクション実行 ──
  async function doAction(reportId: string, body: Record<string, unknown>) {
    setActionLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(`❌ エラー: ${data.error ?? res.statusText}`);
      } else {
        const actionLabel = body.action === "delete_content"
          ? "✅ 投稿を削除しました（アプリ側からも非表示になります）"
          : body.action === "ban_user"
            ? "✅ ユーザーをBANしました"
            : body.action === "unban_user"
              ? "✅ BANを解除しました"
              : "✅ 操作が完了しました";
        setMessage(actionLabel);
        setSelectedReport(null);
        fetchReports();
      }
    } catch (e) {
      setMessage(`❌ 通信エラー: ${e}`);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">🛡️ 通報管理</h1>
        <button
          onClick={fetchReports}
          className="rounded-lg bg-neutral-200 px-3 py-1.5 text-sm font-medium hover:bg-neutral-300"
        >
          🔄 更新
        </button>
      </div>

      {/* メッセージ */}
      {message && (
        <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm">{message}</div>
      )}

      {/* フィルタタブ */}
      <div className="mb-4 flex gap-2">
        {(["OPEN", "IN_REVIEW", "RESOLVED"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              filter === s
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {STATUS_LABELS[s].label}
          </button>
        ))}
      </div>

      {/* 件数 */}
      <p className="mb-4 text-sm text-neutral-500">
        {filter} の通報: {total}件
      </p>

      {/* ローディング */}
      {loading && (
        <div className="py-12 text-center text-neutral-400">読み込み中...</div>
      )}

      {/* 空状態 */}
      {!loading && reports.length === 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center">
          <p className="text-lg font-semibold text-neutral-400">✅ 通報はありません</p>
          <p className="mt-2 text-sm text-neutral-400">
            現在 {STATUS_LABELS[filter].label} の通報はありません。
          </p>
        </div>
      )}

      {/* 通報リスト */}
      {!loading && reports.length > 0 && (
        <div className="space-y-3">
          {reports.map((r) => (
            <div
              key={r.id}
              onClick={() => setSelectedReport(r)}
              className="cursor-pointer rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-neutral-300 hover:shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${STATUS_LABELS[r.status].color}`}
                    >
                      {STATUS_LABELS[r.status].label}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {r.target_type === "thread" ? "🧵 スレッド" : "💬 返信"}
                    </span>
                  </div>

                  <p className="mt-1 text-sm font-medium text-neutral-800">
                    理由: {REASON_LABELS[r.reason] ?? r.reason}
                  </p>

                  {r.target_content && (
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
                      「{r.target_content}」
                    </p>
                  )}

                  <p className="mt-1 text-xs text-neutral-400">
                    通報者: {r.reporter_username ?? r.reporter_user_id?.slice(0, 8) + "…"}{" "}
                    ・{new Date(r.created_at).toLocaleString("ja-JP")}
                  </p>
                </div>

                <span className="text-neutral-300">→</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 詳細モーダル ── */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">通報詳細</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <Row label="通報ID" value={selectedReport.id} />
              <Row label="ステータス" value={STATUS_LABELS[selectedReport.status].label} />
              <Row
                label="対象種別"
                value={selectedReport.target_type === "thread" ? "スレッド" : "返信"}
              />
              <Row
                label="通報理由"
                value={REASON_LABELS[selectedReport.reason] ?? selectedReport.reason}
              />
              <Row label="詳細" value={selectedReport.detail || "なし"} />
              <Row
                label="通報者"
                value={selectedReport.reporter_username ?? selectedReport.reporter_user_id}
              />
              <Row label="通報日時" value={new Date(selectedReport.created_at).toLocaleString("ja-JP")} />

              {selectedReport.target_content && (
                <div>
                  <p className="mb-1 font-medium text-neutral-500">通報対象の本文:</p>
                  <blockquote className="rounded-lg border-l-4 border-red-300 bg-red-50 p-3 text-neutral-800">
                    {selectedReport.target_content}
                  </blockquote>
                </div>
              )}

              {selectedReport.target_author_name && (
                <Row label="投稿者" value={selectedReport.target_author_name} />
              )}

              {selectedReport.target_author_is_banned && (
                <p className="font-semibold text-red-600">⛔ この投稿者は既にBANされています</p>
              )}
            </div>

            {/* アクションボタン */}
            <div className="mt-6 space-y-2">
              {selectedReport.status !== "RESOLVED" && (
                <>
                  {selectedReport.status === "OPEN" && (
                    <ActionButton
                      label="確認中に変更"
                      disabled={actionLoading}
                      onClick={() =>
                        doAction(selectedReport.id, { action: "update_status", status: "IN_REVIEW" })
                      }
                    />
                  )}
                  <ActionButton
                    label="対応済みに変更"
                    disabled={actionLoading}
                    onClick={() =>
                      doAction(selectedReport.id, { action: "update_status", status: "RESOLVED" })
                    }
                  />
                  <ActionButton
                    label="🗑️ 投稿/コメントを削除"
                    variant="danger"
                    disabled={actionLoading}
                    onClick={() => {
                      if (confirm("この投稿/コメントを削除（非表示化）しますか？\nアプリ側からも即座に非表示になります。")) {
                        doAction(selectedReport.id, { action: "delete_content" });
                      }
                    }}
                  />
                  {selectedReport.target_author_id && !selectedReport.target_author_is_banned && (
                    <ActionButton
                      label="⛔ 投稿者をBAN（利用停止）"
                      variant="danger"
                      disabled={actionLoading}
                      onClick={() => {
                        const reason = prompt("BAN理由を入力してください:", "コミュニティガイドライン違反");
                        if (reason !== null) {
                          doAction(selectedReport.id, {
                            action: "ban_user",
                            target_user_id: selectedReport.target_author_id,
                            reason,
                          });
                        }
                      }}
                    />
                  )}
                  {selectedReport.target_author_id && selectedReport.target_author_is_banned && (
                    <ActionButton
                      label="✅ BAN解除"
                      disabled={actionLoading}
                      onClick={() => {
                        if (confirm("このユーザーのBANを解除しますか？")) {
                          doAction(selectedReport.id, {
                            action: "unban_user",
                            target_user_id: selectedReport.target_author_id,
                          });
                        }
                      }}
                    />
                  )}
                </>
              )}

              <button
                onClick={() => setSelectedReport(null)}
                className="w-full rounded-lg bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 汎用コンポーネント ──

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="w-24 shrink-0 font-medium text-neutral-500">{label}</span>
      <span className="text-neutral-800">{value}</span>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  variant = "default",
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
}) {
  const base = "w-full rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:opacity-50";
  const styles =
    variant === "danger"
      ? `${base} bg-red-600 text-white hover:bg-red-700`
      : `${base} bg-neutral-800 text-white hover:bg-neutral-900`;

  return (
    <button className={styles} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
