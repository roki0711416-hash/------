import streamlit as st

# --- ページ設定 ---
st.set_page_config(page_title="JUGGLER ANALYZER MAX", page_icon="🎰", layout="wide")

# --- 進化したカスタムCSS ---
st.markdown("""
    <style>
    .main { background-color: #050505; color: #e0e0e0; }
    h1 { color: #ff0000; text-shadow: 0 0 15px #ff0000; text-align: center; font-size: 3rem; }
    .stNumberInput label, .stSelectbox label { color: #ffd700 !important; font-weight: bold; }
    .stButton>button {
        background: linear-gradient(to bottom, #ff4b4b, #8b0000);
        color: white; border: 2px solid #ffd700; border-radius: 20px;
        font-size: 1.5rem; height: 4rem; box-shadow: 0 0 15px #ff4b4b;
    }
    .stProgress > div > div > div > div { background: linear-gradient(to right, #ff0000, #ffd700); }
    .reportview-container .main .subtitle { color: #ffd700; }
    </style>
    """, unsafe_allow_html=True)

st.title("🎰 JUGGLER ANALYZER MAX")

# --- 1. 超精密機種データ ---
# ※数値は一般的な解析値をベースにした期待値
spec_data = {
    "マイジャグラーV": {
        "設定1": {"big": 273.1, "reg_total": 409.6, "grape": 5.90},
        "設定2": {"big": 270.8, "reg_total": 390.1, "grape": 5.86},
        "設定3": {"big": 266.3, "reg_total": 331.0, "grape": 5.82},
        "設定4": {"big": 254.0, "reg_total": 290.0, "grape": 5.78},
        "設定5": {"big": 240.9, "reg_total": 255.0, "grape": 5.74},
        "設定6": {"big": 229.1, "reg_total": 229.1, "grape": 5.66},
    },
    "アイムジャグラーEX": {
        "設定1": {"big": 273.1, "reg_total": 439.8, "grape": 6.02},
        "設定2": {"big": 269.7, "reg_total": 399.6, "grape": 6.02},
        "設定3": {"big": 269.7, "reg_total": 331.0, "grape": 6.02},
        "設定4": {"big": 259.0, "reg_total": 315.1, "grape": 6.02},
        "設定5": {"big": 259.0, "reg_total": 255.0, "grape": 6.02},
        "設定6": {"big": 255.0, "reg_total": 255.0, "grape": 5.78},
    }
}

# --- 2. サイドバー入力エリア ---
with st.sidebar:
    st.image("https://img.icons8.com/fluent/96/000000/slot-machine.png")
    st.header("🎰 SETTINGS")
    selected_model = st.selectbox("機種選択", list(spec_data.keys()))
    
    st.divider()
    total_games = st.number_input("総回転数 (G)", min_value=1, value=2000, step=100)
    big_count = st.number_input("BIG回数", min_value=0, value=7, step=1)
    reg_count = st.number_input("REG回数 (合計)", min_value=0, value=5, step=1)
    grape_count = st.number_input("ぶどう回数 (任意)", min_value=0, value=0, step=1)

# --- 3. 高度なベイズ推定ロジック ---
def calculate_advanced_bayes(n, big, reg, grape, model_data):
    likelihoods = {}
    total_l = 0
    for s, v in model_data.items():
        # BIGの尤度
        p_big = 1 / v["big"]
        l_big = (p_big ** big) * ((1 - p_big) ** (n - big))
        
        # REGの尤度
        p_reg = 1 / v["reg_total"]
        l_reg = (p_reg ** reg) * ((1 - p_reg) ** (n - reg))
        
        # ぶどうの尤度
        l_grape = 1
        if grape > 0:
            p_grape = 1 / v["grape"]
            l_grape = (p_grape ** grape) * ((1 - p_grape) ** (n - grape))
            
        # 総合尤度
        l_total = l_big * l_reg * l_grape
        likelihoods[s] = l_total
        total_l += l_total
        
    return {s: (l / total_l) * 100 for s, l in likelihoods.items()}

# --- 4. メインコンテンツ ---
col_main, col_sub = st.columns([2, 1])

with col_main:
    st.markdown(f"### 🛡️ ANALYZING: {selected_model}")
    if st.button("⚡ 設定推測マトリックスを生成 ⚡"):
        results = calculate_advanced_bayes(total_games, big_count, reg_count, grape_count, spec_data[selected_model])
        sorted_res = dict(sorted(results.items(), key=lambda x: x[1], reverse=True))
        
        for setting, percent in sorted_res.items():
            st.write(f"**{setting}** : {percent:.2f}%")
            st.progress(int(percent))
        
        best_s = list(sorted_res.keys())[0]
        if "6" in best_s:
            st.balloons()
            st.success(f"🏆 最高設定【設定6】の可能性が最も高いです！")

with col_sub:
    st.markdown("### 📈 CURRENT STATUS")
    st.metric("BIG確率", f"1/{round(total_games/big_count, 1) if big_count > 0 else '---'}")
    st.metric("REG確率", f"1/{round(total_games/reg_count, 1) if reg_count > 0 else '---'}")
    if grape_count > 0:
        st.metric("ぶどう", f"1/{round(total_games/grape_count, 2)}")
    
    st.divider()
    st.write("合算確率")
    total_hits = big_count + reg_count
    st.write(f"## 1/{round(total_games/total_hits, 1) if total_hits > 0 else '---'}")

st.markdown("---")
st.caption("※この数値は統計上の推測であり、勝利を保証するものではありません。引き強に注意してください。")
