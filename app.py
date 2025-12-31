import math
import random
import numpy as np
import pandas as pd
import streamlit as st

# ----------------------------
# Page
# ----------------------------
st.set_page_config(
    page_title="スロカスくん | JUGGLER DX",
    page_icon="🎰",
    layout="wide",
)

st.markdown("""
<style>
.main { background: #070707; color: #eaeaea; }
.block-container { padding-top: 1.0rem; padding-bottom: 3rem; max-width: 1100px; }
h1, h2, h3 { letter-spacing: 0.5px; }
.small { color: rgba(255,255,255,0.70); font-size: 0.92rem; }

.card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,215,0,0.22);
  border-radius: 18px;
  padding: 14px 16px;
}
.stButton > button {
  background: linear-gradient(to bottom, #ff4b4b, #8b0000);
  color: white;
  border: 2px solid #ffd700;
  border-radius: 18px;
  font-weight: 700;
  padding: 0.7rem 1.0rem;
  width: 100%;
}
.stButton > button:hover { filter: brightness(1.07); }
label, .stSelectbox label, .stNumberInput label { color: #ffd700 !important; font-weight: 700; }

div[data-testid="stMetric"] {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,215,0,0.22);
  padding: 14px 16px;
  border-radius: 18px;
}
</style>
""", unsafe_allow_html=True)

st.title("🎰 スロカスくん | JUGGLER DX")
st.markdown('<div class="small">スマホ最優先 / ベイズ推定で設定確率 / 未来の差枚レンジ予測（帯）</div>', unsafe_allow_html=True)
st.divider()

# ----------------------------
# Specs (MVP)
# big = 1/xxx
# reg_total = (BIG+REG) 1/xxx
# grape = 1/xxx
# ----------------------------
spec_data = {
    "マイジャグラーV": {
        "設定1": {"big": 273.1, "reg_total": 409.6, "grape": 5.90},
        "設定2": {"big": 270.8, "reg_total": 390.1, "grape": 5.86},
        "設定3": {"big": 266.3, "reg_total": 331.0, "grape": 5.82},
        "設定4": {"big": 254.0, "reg_total": 290.0, "grape": 5.78},
        "設定5": {"big": 240.9, "reg_total": 255.0, "grape": 5.74},
        "設定6": {"big": 229.1, "reg_total": 229.1, "grape": 5.66},
    },
    # 仮枠（後で差し替え）
    "アイムジャグラーEX": {
        "設定1": {"big": 273.1, "reg_total": 439.8, "grape": 6.02},
        "設定2": {"big": 269.7, "reg_total": 399.6, "grape": 6.02},
        "設定3": {"big": 269.7, "reg_total": 331.0, "grape": 6.02},
        "設定4": {"big": 259.0, "reg_total": 315.1, "grape": 6.02},
        "設定5": {"big": 259.0, "reg_total": 255.0, "grape": 6.02},
        "設定6": {"big": 255.0, "reg_total": 255.0, "grape": 5.78},
    },
    # 仮枠（後で差し替え）
    "ファンキージャグラー2": {
        "設定1": {"big": 273.1, "reg_total": 395.6, "grape": 5.90},
        "設定2": {"big": 270.8, "reg_total": 376.6, "grape": 5.86},
        "設定3": {"big": 266.3, "reg_total": 335.5, "grape": 5.82},
        "設定4": {"big": 254.0, "reg_total": 295.9, "grape": 5.78},
        "設定5": {"big": 240.9, "reg_total": 268.6, "grape": 5.74},
        "設定6": {"big": 229.1, "reg_total": 245.9, "grape": 5.66},
    },
}

# ----------------------------
# Bayes helpers
# ----------------------------
def log_binom_pmf(k: int, n: int, p: float) -> float:
    if n < 0 or k < 0 or k > n or p <= 0.0 or p >= 1.0:
        return -1e18
    return (math.lgamma(n + 1) - math.lgamma(k + 1) - math.lgamma(n - k + 1)
            + k * math.log(p) + (n - k) * math.log(1 - p))

def softmax_from_log(logits):
    m = max(logits)
    exps = [math.exp(x - m) for x in logits]
    s = sum(exps)
    return [e / s for e in exps]

def normalize_prior(prior: dict, settings: list[str]) -> dict:
    vals = [max(float(prior.get(s, 0.0)), 0.0) for s in settings]
    total = sum(vals)
    if total <= 0:
        return {s: 1.0 / len(settings) for s in settings}
    return {s: v / total for s, v in zip(settings, vals)}

def estimate_setting_probs(
    spec_by_setting: dict,
    games: int,
    big_count: int | None,
    total_count: int | None,
    grape_count: int | None,
    prior: dict | None,
    weights: dict | None = None
):
    if games <= 0:
        return []

    settings = list(spec_by_setting.keys())

    if prior is None:
        prior = {s: 1.0 / len(settings) for s in settings}
    prior = normalize_prior(prior, settings)

    # reg_totalが主役 / BIGは補助（相関対策で弱め） / ブドウは数えてれば強い
    if weights is None:
        weights = {"total": 1.0, "big": 0.35, "grape": 0.85}

    log_posts = []
    rows = []

    for s in settings:
        spec = spec_by_setting[s]
        lp = math.log(max(prior.get(s, 0.0), 1e-12))
        parts = {}

        if total_count is not None and "reg_total" in spec:
            p = 1.0 / float(spec["reg_total"])
            ll = log_binom_pmf(int(total_count), int(games), p) * float(weights["total"])
            lp += ll
            parts["ll_total"] = ll

        if big_count is not None and "big" in spec:
            p = 1.0 / float(spec["big"])
            ll = log_binom_pmf(int(big_count), int(games), p) * float(weights["big"])
            lp += ll
            parts["ll_big"] = ll

        if grape_count is not None and "grape" in spec:
            p = 1.0 / float(spec["grape"])
            ll = log_binom_pmf(int(grape_count), int(games), p) * float(weights["grape"])
            lp += ll
            parts["ll_grape"] = ll

        log_posts.append(lp)
        rows.append({"setting": s, "logp": lp, **parts})

    probs = softmax_from_log(log_posts)
    best = max(log_posts)

    out = []
    for r, p in zip(rows, probs):
        r["prob"] = float(p)
        r["gap"] = float(r["logp"] - best)
        out.append(r)

    out.sort(key=lambda x: x["prob"], reverse=True)

    top = out[0]
    keys = ["ll_total", "ll_big", "ll_grape"]
    contrib = {k: abs(top.get(k, 0.0)) for k in keys}
    ssum = sum(contrib.values()) or 1.0
    top["contrib_pct"] = {k: (v / ssum) * 100 for k, v in contrib.items() if v > 0}

    return out

# ----------------------------
# Forecast (simple MVP)
# diff ≈ BB*252 + RB*96 - 3*G
# RB is approximated by total - BB (clipped)
# ----------------------------
def forecast_diff_medal(
    posterior: list[dict],
    spec_by_setting: dict,
    games_future: int,
    n_sims: int = 2500,
    avg_big_payout: int = 252,
    avg_reg_payout: int = 96,
    bet_per_game: int = 3
):
    settings = [r["setting"] for r in posterior]
    probs = [r["prob"] for r in posterior]

    diffs = []
    for _ in range(n_sims):
        s = random.choices(settings, weights=probs, k=1)[0]
        spec = spec_by_setting[s]

        p_big = 1.0 / float(spec["big"])
        p_total = 1.0 / float(spec["reg_total"])

        bb = np.random.binomial(games_future, p_big)
        tot = np.random.binomial(games_future, p_total)
        rb = int(max(0, tot - bb))

        payout = bb * avg_big_payout + rb * avg_reg_payout
        cost = games_future * bet_per_game
        diffs.append(int(payout - cost))

    arr = np.array(diffs)
    return {
        "mean": float(arr.mean()),
        "median": float(np.median(arr)),
        "p05": float(np.percentile(arr, 5)),
        "p25": float(np.percentile(arr, 25)),
        "p75": float(np.percentile(arr, 75)),
        "p95": float(np.percentile(arr, 95)),
        "diffs": diffs,
    }

# ----------------------------
# UI
# ----------------------------
st.subheader("① 機種を選ぶ")
machine = st.selectbox("機種", list(spec_data.keys()))

st.subheader("② データ入力（最短30秒）")
c1, c2, c3 = st.columns(3)
with c1:
    games = st.number_input("総ゲーム数", min_value=0, value=2000, step=1)
with c2:
    big = st.number_input("BIG回数", min_value=0, value=7, step=1)
with c3:
    reg = st.number_input("REG回数", min_value=0, value=5, step=1)

total = int(big) + int(reg)

st.markdown('<div class="card">', unsafe_allow_html=True)
st.write(f"✅ 合算回数（BIG+REG）： **{total}**")
if games > 0 and total > 0:
    st.write(f"・合算確率： 1/{games/total:.1f}（自動計算）")
st.markdown('</div>', unsafe_allow_html=True)

with st.expander("③ 小役入力（数えてる人向け）", expanded=False):
    use_grape = st.toggle("ブドウ回数を入力する", value=False)
    grape_count = None
    if use_grape:
        grape_count = st.number_input("ブドウ回数", min_value=0, value=0, step=1)

st.subheader("④ ホール傾向（設定配分）")
st.caption("※わからなければ触らなくてOK（自動で均等に扱います）")
settings = list(spec_data[machine].keys())
prior_cols = st.columns(len(settings))
prior = {}
for i, s in enumerate(settings):
    with prior_cols[i]:
        prior[s] = st.number_input(s, min_value=0.0, value=1.0, step=0.5)

st.divider()

if st.button("🚀 判別する（DX）"):
    if games <= 0:
        st.error("総ゲーム数が0です")
        st.stop()

    posterior = estimate_setting_probs(
        spec_data[machine],
        games=int(games),
        big_count=int(big) if big > 0 else None,
        total_count=int(total) if total > 0 else None,
        grape_count=int(grape_count) if (use_grape and grape_count is not None and grape_count > 0) else None,
        prior=prior,
    )

    st.subheader("🏆 結果（上位3）")
    top3 = posterior[:3]
    m1, m2, m3 = st.columns(3)
    for col, r in zip([m1, m2, m3], top3):
        with col:
            st.metric(r["setting"], f"{r['prob']*100:.1f}%")

    conf = min(1.0, math.log10(max(int(games), 1)) / 4.0)
    st.metric("信頼度目安", f"{conf*100:.0f}%")
    st.progress(conf)

    st.subheader("🔍 決め手（寄与）")
    contrib = posterior[0].get("contrib_pct", {})
    label_map = {"ll_total": "合算", "ll_big": "BIG", "ll_grape": "ブドウ"}
    if contrib:
        for k, v in sorted(contrib.items(), key=lambda x: -x[1]):
            st.write(f"・{label_map.get(k, k)}： **{v:.0f}%**")

    st.subheader("📊 設定ランキング")
    df = pd.DataFrame([{
        "設定": r["setting"],
        "可能性(%)": r["prob"] * 100,
        "差(トップ比logp)": r["gap"],
    } for r in posterior])
    st.dataframe(df, use_container_width=True, hide_index=True)

    st.subheader("🤖 AI予想（未来の差枚レンジ）")
    st.caption("※“当てる”のではなく、いまの状況から起こりやすい未来のレンジ（帯）を出します")

    horizon = st.radio("未来の追加ゲーム数", [500, 1000, 2000], horizontal=True)
    fo = forecast_diff_medal(
        posterior=posterior,
        spec_by_setting=spec_data[machine],
        games_future=int(horizon),
        n_sims=3000,
    )

    a, b, c = st.columns(3)
    with a:
        st.metric("中央値", f"{fo['median']:.0f}枚")
    with b:
        st.metric("50%レンジ", f"{fo['p25']:.0f}〜{fo['p75']:.0f}枚")
    with c:
        st.metric("90%レンジ", f"{fo['p05']:.0f}〜{fo['p95']:.0f}枚")

    hist = pd.Series(fo["diffs"]).clip(-3000, 3000)
    st.bar_chart(hist.value_counts().sort_index())

    st.info("次のDX：📷 写真から「総G/BB/RB/差枚」を自動入力 → そのまま判別＆予測まで一気通貫にします。")
