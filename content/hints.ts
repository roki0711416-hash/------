export type HintEffect =
  | { type: "none" }
  | { type: "minSetting"; min: number }
  | { type: "exactSetting"; exact: number }
  | { type: "excludeSetting"; exclude: number }
  | { type: "weight"; weights: Record<number, number> }
  | { type: "allOf"; effects: HintEffect[] };

export type HintItem = {
  id: string;
  label: string;
  effect: HintEffect;
};

export type HintGroup = {
  id: string;
  title: string;
  note?: string;
  defaultCollapsed?: boolean;
  // Optional: if set, total count is expected to be <= this input field.
  maxTotalFrom?: "bigCount" | "regCount";
  items: HintItem[];
};

export type MachineHintConfig = {
  machineId: string;
  helpUrl?: string;
  groups: HintGroup[];
};

function makePioneerHanahana6GoukiGroups(options: {
  featherRainbowEffect: HintEffect;
  featherNote: string;
}): HintGroup[] {
  return [
    {
      id: "big_in",
      title: "BIG中",
      note: "スイカはカウントのみ（判別には未反映）",
      items: [{ id: "big_in_suika", label: "スイカ", effect: { type: "none" } }],
    },
    {
      id: "reg_side",
      title: "REG中 ビタ押しスイカ揃い時：サイドランプ",
      note: "現状は表示のみ（判別に反映するには設定別の出現率が必要）",
      maxTotalFrom: "regCount",
      items: [
        { id: "reg_side_blue", label: "青（奇数）", effect: { type: "none" } },
        { id: "reg_side_yellow", label: "黄（偶数）", effect: { type: "none" } },
        { id: "reg_side_green", label: "緑（奇数 強）", effect: { type: "none" } },
        { id: "reg_side_red", label: "赤（偶数 強）", effect: { type: "none" } },
        { id: "reg_side_rainbow", label: "虹（高設定示唆）", effect: { type: "none" } },
      ],
    },
    {
      id: "feather",
      title: "BIG・REG後フェザーランプ",
      note: options.featherNote,
      maxTotalFrom: "regCount",
      items: [
        { id: "reg_feather_blue", label: "青", effect: { type: "minSetting", min: 2 } },
        { id: "reg_feather_yellow", label: "黄", effect: { type: "minSetting", min: 3 } },
        { id: "reg_feather_green", label: "緑", effect: { type: "minSetting", min: 4 } },
        { id: "reg_feather_red", label: "赤", effect: { type: "minSetting", min: 5 } },
        { id: "reg_feather_rainbow", label: "虹", effect: options.featherRainbowEffect },
      ],
    },
  ];
}

const pioneerHanahana6GoukiGroupsRainbow6 = makePioneerHanahana6GoukiGroups({
  featherRainbowEffect: { type: "exactSetting", exact: 6 },
  featherNote: "REG後フェザーの『設定◯以上/6確定』のみ判別に反映",
});

const pioneerHanahana6GoukiGroupsRainbow4Plus = makePioneerHanahana6GoukiGroups({
  featherRainbowEffect: { type: "minSetting", min: 4 },
  featherNote: "REG後フェザーの『設定◯以上』のみ判別に反映（虹は設定4以上として反映）",
});

export const hintConfigs: Record<string, MachineHintConfig> = {
  "s-king-hanahana-30-6gouki": {
    machineId: "s-king-hanahana-30-6gouki",
    groups: pioneerHanahana6GoukiGroupsRainbow6,
  },
  "dragon-hanahana-senkou-30-6gouki": {
    machineId: "dragon-hanahana-senkou-30-6gouki",
    groups: pioneerHanahana6GoukiGroupsRainbow6,
  },
  "star-hanahana-30-6gouki": {
    machineId: "star-hanahana-30-6gouki",
    groups: pioneerHanahana6GoukiGroupsRainbow4Plus,
  },
  "hanahana-houou-tenshou-6gouki": {
    machineId: "hanahana-houou-tenshou-6gouki",
    groups: pioneerHanahana6GoukiGroupsRainbow4Plus,
  },

  "new-king-hanahana-v-bt": {
    machineId: "new-king-hanahana-v-bt",
    groups: [
      {
        id: "bonus_in",
        title: "ボーナス中",
        note: "スイカはカウントのみ（判別には未反映）",
        items: [
          {
            id: "bonus_in_suika",
            label: "スイカ",
            effect: { type: "none" },
          },
        ],
      },
      {
        id: "big_side",
        title: "BIG中 ビタ押しスイカ揃い時：サイドランプ",
        note: "現状は表示のみ（判別に反映するには設定別の出現率が必要）",
        maxTotalFrom: "bigCount",
        items: [
          { id: "big_side_blue", label: "青（奇数）", effect: { type: "none" } },
          { id: "big_side_yellow", label: "黄（偶数）", effect: { type: "none" } },
          { id: "big_side_green", label: "緑（奇数 強）", effect: { type: "none" } },
          { id: "big_side_purple", label: "紫（偶数 強）", effect: { type: "none" } },
          { id: "big_side_rainbow", label: "虹（高設定示唆）", effect: { type: "none" } },
        ],
      },
      {
        id: "hibiscus",
        title: "BIG・REG後ハイビスカスランプ",
        note: "ハイビスカスランプの『設定◯以上』のみ判別に反映（虹は設定4以上として反映）",
        maxTotalFrom: "regCount",
        items: [
          { id: "hibiscus_blue", label: "青", effect: { type: "minSetting", min: 2 } },
          { id: "hibiscus_yellow", label: "黄", effect: { type: "minSetting", min: 3 } },
          { id: "hibiscus_green", label: "緑", effect: { type: "minSetting", min: 4 } },
          { id: "hibiscus_purple", label: "紫", effect: { type: "minSetting", min: 5 } },
          { id: "hibiscus_rainbow", label: "虹", effect: { type: "minSetting", min: 4 } },
        ],
      },
    ],
  },

  "smart-magireco": {
    machineId: "smart-magireco",
    helpUrl: "https://p-town.dmm.com/machines/4745#anc-point",
    groups: [
      {
        id: "big_end_screens",
        title: "BIGボーナス終了画面",
        note: "BIGボーナス終了時に表示。",
        defaultCollapsed: true,
        maxTotalFrom: "bigCount",
        items: [
          { id: "big_end_default", label: "楽曲対応画面（デフォルト）", effect: { type: "none" } },
          { id: "big_end_iroha_felicia", label: "いろは＆フェリシア（設定3・5・6示唆）", effect: { type: "none" } },
          { id: "big_end_iroha_sana", label: "いろは＆さな（設定2・4・6示唆）", effect: { type: "none" } },
          { id: "big_end_team_3", label: "いろは＆やちよ＆鶴乃（高設定示唆［弱］）", effect: { type: "none" } },
          { id: "big_end_team_momoko", label: "いろは＆やちよ＆ももこチーム（高設定示唆［強］）", effect: { type: "none" } },
          { id: "big_end_mikazuki", label: "みかづき荘バケーション（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "big_end_keyvisual_s2", label: "2nd Season キービジュアル（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "big_end_keyvisual_s1", label: "1st Season キービジュアル（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "big_end_small_kyubey", label: "小さいキュゥべえ（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "at_end_screens",
        title: "AT終了画面",
        note: "AT終了時に表示。",
        defaultCollapsed: true,
        items: [
          { id: "at_end_default", label: "背景（デフォルト）", effect: { type: "none" } },
          { id: "at_end_magius", label: "マギウス（設定3・5・6示唆）", effect: { type: "none" } },
          { id: "at_end_team_mikazuki", label: "チームみかづき荘（設定2・4・6示唆）", effect: { type: "none" } },
          { id: "at_end_madoka_iroha", label: "まどか＆いろは（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "univa_plate",
        title: "ユニバプレート",
        note: "実戦上の示唆。",
        defaultCollapsed: true,
        items: [
          { id: "univa_plate_copper", label: "銅（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "univa_plate_silver", label: "銀（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "univa_plate_gold", label: "金（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "univa_plate_fireworks", label: "花火柄（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "univa_plate_rainbow", label: "虹（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "story_intro_chars",
        title: "ストーリー中：キャラ紹介（パターン）",
        note:
          "ストーリーコンプリート後／エンブリオ・イブ覚醒中のストーリー中に出現。パターン5〜8はソフト示唆（高設定寄りの重み付け）として判別に反映。パターン9は設定5以上として反映。",
        defaultCollapsed: true,
        items: [
          {
            id: "story_intro_p1",
            label: "パターン1：いろは→やちよ→鶴乃→フェリシア→さな",
            effect: { type: "none" },
          },
          {
            id: "story_intro_p2",
            label: "パターン2：ももこ→レナ→かえで→みたま→黒江",
            effect: { type: "none" },
          },
          {
            id: "story_intro_p3",
            label: "パターン3：灯花→ねむ→天音姉妹→みふゆ→アリナ",
            effect: { type: "none" },
          },
          {
            id: "story_intro_p4",
            label: "パターン4：まどか→さやか→マミ→杏子→ほむら",
            effect: { type: "none" },
          },
          {
            id: "story_intro_p5",
            label: "パターン5：パターン1〜4のいずれかの逆順（高設定示唆［弱］）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.2, 6: 1.3 } },
          },
          {
            id: "story_intro_p6",
            label: "パターン6：ももこ→やちよ→鶴乃→みふゆ→みたま（高設定示唆［強］）",
            effect: { type: "weight", weights: { 4: 1.2, 5: 1.35, 6: 1.5 } },
          },
          {
            id: "story_intro_p7",
            label: "パターン7：いろは→うい→灯花→ねむ→アリナ（高設定示唆［強］）",
            effect: { type: "weight", weights: { 4: 1.2, 5: 1.35, 6: 1.5 } },
          },
          {
            id: "story_intro_p8",
            label: "パターン8：まどか→さやか→マミ→杏子（高設定示唆［強］）",
            effect: { type: "weight", weights: { 4: 1.2, 5: 1.35, 6: 1.5 } },
          },
          {
            id: "story_intro_p9",
            label: "パターン9：パターン1〜7の最後に小さいキュゥべえ（設定5以上!?）",
            effect: { type: "minSetting", min: 5 },
          },
        ],
      },
      {
        id: "story_order",
        title: "ストーリーの順番",
        note: "奇数/偶数/高設定示唆はソフト示唆（重み付け）として反映。否定・濃厚系は制約として反映。",
        defaultCollapsed: true,
        items: [
          { id: "story_order_12345", label: "1スタート：1→2→3→4→5（やや奇数設定示唆）", effect: { type: "weight", weights: { 1: 1.05, 3: 1.05, 5: 1.05 } } },
          { id: "story_order_12354", label: "1スタート：1→2→3→5→4（奇数かつ高設定示唆）", effect: { type: "weight", weights: { 1: 1.08, 3: 1.08, 4: 1.15, 5: 1.25, 6: 1.2 } } },
          { id: "story_order_13245", label: "1スタート：1→3→2→4→5（奇数設定示唆）", effect: { type: "weight", weights: { 1: 1.12, 3: 1.12, 5: 1.12 } } },
          { id: "story_order_13254", label: "1スタート：1→3→2→5→4（奇数かつ高設定示唆）", effect: { type: "weight", weights: { 1: 1.08, 3: 1.08, 4: 1.15, 5: 1.25, 6: 1.2 } } },

          { id: "story_order_21345", label: "2スタート：2→1→3→4→5（やや偶数設定示唆）", effect: { type: "weight", weights: { 2: 1.05, 4: 1.05, 6: 1.05 } } },
          { id: "story_order_21354", label: "2スタート：2→1→3→5→4（偶数かつ高設定示唆）", effect: { type: "weight", weights: { 2: 1.08, 4: 1.15, 5: 1.2, 6: 1.25 } } },
          { id: "story_order_24135", label: "2スタート：2→4→1→3→5（偶数設定示唆）", effect: { type: "weight", weights: { 2: 1.12, 4: 1.12, 6: 1.12 } } },
          { id: "story_order_24153", label: "2スタート：2→4→1→5→3（偶数かつ高設定示唆）", effect: { type: "weight", weights: { 2: 1.08, 4: 1.15, 5: 1.2, 6: 1.25 } } },

          { id: "story_order_31245", label: "3スタート：3→1→2→4→5（奇数設定示唆）", effect: { type: "weight", weights: { 1: 1.12, 3: 1.12, 5: 1.12 } } },
          { id: "story_order_31254", label: "3スタート：3→1→2→5→4（奇数かつ高設定示唆）", effect: { type: "weight", weights: { 1: 1.08, 3: 1.08, 4: 1.15, 5: 1.25, 6: 1.2 } } },

          { id: "story_order_41235", label: "4スタート：4→1→2→3→5（偶数設定示唆）", effect: { type: "weight", weights: { 2: 1.12, 4: 1.12, 6: 1.12 } } },
          { id: "story_order_41253", label: "4スタート：4→1→2→5→3（偶数かつ高設定示唆）", effect: { type: "weight", weights: { 2: 1.08, 4: 1.15, 5: 1.2, 6: 1.25 } } },

          { id: "story_order_51234", label: "5スタート：5→1→2→3→4（設定1否定）", effect: { type: "excludeSetting", exclude: 1 } },
          { id: "story_order_52134", label: "5スタート：5→2→1→3→4（設定2否定）", effect: { type: "excludeSetting", exclude: 2 } },
          { id: "story_order_53124", label: "5スタート：5→3→1→2→4（設定3否定）", effect: { type: "excludeSetting", exclude: 3 } },
          { id: "story_order_54213", label: "5スタート：5→4→2→1→3（設定2否定）", effect: { type: "excludeSetting", exclude: 2 } },
          {
            id: "story_order_54312",
            label: "5スタート：5→4→3→1→2（設定1否定かつ高設定示唆）",
            effect: {
              type: "allOf",
              effects: [
                { type: "excludeSetting", exclude: 1 },
                { type: "weight", weights: { 4: 1.15, 5: 1.25, 6: 1.2 } },
              ],
            },
          },
          { id: "story_order_54321", label: "5スタート：5→4→3→2→1（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
        ],
      },
      {
        id: "ending_cards",
        title: "エンディング：カードごとの示唆",
        note: "エンディング中のレア役成立時は、サブ液晶にタッチ。",
        defaultCollapsed: true,
        items: [
          { id: "ending_card_zekkou", label: "絶交階段のウワサ（奇数示唆 弱）", effect: { type: "none" } },
          { id: "ending_card_machibito", label: "マチビト馬のウワサ（偶数示唆 弱）", effect: { type: "none" } },
          { id: "ending_card_fukurou", label: "フクロウ幸運水のウワサ（奇数示唆 強）", effect: { type: "none" } },
          { id: "ending_card_saihate", label: "ひとりぼっちの最果てのウワサ（偶数示唆 強）", effect: { type: "none" } },
          { id: "ending_card_museum", label: "記憶ミュージアムのウワサ（高設定示唆 弱）", effect: { type: "none" } },
          { id: "ending_card_mannen", label: "万年桜のウワサ（高設定示唆 強）", effect: { type: "none" } },
          { id: "ending_card_ishinaka", label: "石中魚の魔女（設定2否定）", effect: { type: "none" } },
          { id: "ending_card_tachimimi", label: "立ち耳の魔女（設定3否定）", effect: { type: "none" } },
          { id: "ending_card_saruko", label: "猿子の魔女（設定4否定）", effect: { type: "none" } },
          { id: "ending_card_iinchou", label: "委員長の魔女（設定1否定かつ高設定示唆）", effect: { type: "none" } },
          { id: "ending_card_yodaka", label: "ヨダカの魔女（設定4否定かつ高設定示唆）", effect: { type: "none" } },
          { id: "ending_card_butai", label: "舞台装置の魔女（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
        ],
      },
    ],
  },

  "smart-hokuto-no-ken": {
    machineId: "smart-hokuto-no-ken",
    helpUrl: "https://p-town.dmm.com/machines/4301",
    groups: [
      {
        id: "sammy_trophy",
        title: "サミートロフィー",
        defaultCollapsed: true,
        items: [
          { id: "trophy_gold", label: "金（設定4以上）", effect: { type: "minSetting", min: 4 } },
          { id: "trophy_kirin", label: "キリン柄（設定5以上）", effect: { type: "minSetting", min: 5 } },
          { id: "trophy_rainbow", label: "虹（設定6）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "bb_end_voice",
        title: "BB終了時のボイス",
        note:
          "BB終了画面から通常ステージ移行ゲームでサブ液晶をタッチ。『高設定示唆』は重み付けで反映（確定ではないため）。",
        defaultCollapsed: true,
        items: [
          {
            id: "voice_shin",
            label: "シン『おまえが思っているほど 北斗神拳は無敵ではない』（高設定示唆［弱］）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.2, 6: 1.3 } },
          },
          {
            id: "voice_souther",
            label: "サウザー『退かぬ！媚びぬ！省みぬ！』（高設定示唆［弱］）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.2, 6: 1.3 } },
          },
          {
            id: "voice_jagi",
            label: "ジャギ『ケンシロウ おれの名を言ってみろ！』（高設定示唆［中］）",
            effect: { type: "weight", weights: { 4: 1.2, 5: 1.4, 6: 1.6 } },
          },
          {
            id: "voice_amiba",
            label: "アミバ『ふむ…この秘孔ではないらしい…』（高設定示唆［強］）",
            effect: { type: "weight", weights: { 4: 1.4, 5: 1.7, 6: 2.0 } },
          },
          {
            id: "voice_kenshiro_a",
            label: "ケンシロウA『戦うのが 北斗神拳伝承者としての宿命だ!!』（設定4以上の期待大）",
            effect: { type: "weight", weights: { 4: 2.0, 5: 2.5, 6: 3.0 } },
          },
          {
            id: "voice_yuria",
            label: "ユリア『まちつづけるのがわたしの宿命 そしてケンとの約束』（設定5以上の期待大）",
            effect: { type: "weight", weights: { 5: 2.5, 6: 3.0 } },
          },
          {
            id: "voice_kenshiro_b",
            label: "ケンシロウB『おまえは もう死んでいる！』（1G連）",
            effect: { type: "none" },
          },
        ],
      },
      {
        id: "kodaigamen",
        title: "初代の画面が表示",
        note: "通常時の連続演出やBB中の復活演出で表示されれば設定5以上確定。",
        defaultCollapsed: true,
        items: [{ id: "kodaigamen_seen", label: "初代の画面が表示（設定5以上確定）", effect: { type: "minSetting", min: 5 } }],
      },
      {
        id: "payout_milestone",
        title: "特定枚数表示",
        defaultCollapsed: true,
        items: [
          { id: "payout_over_456", label: "456枚突破（設定4以上）", effect: { type: "minSetting", min: 4 } },
          { id: "payout_over_666", label: "666枚突破（設定6）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
    ],
  },

  "smart-tokyo-ghoul": {
    machineId: "smart-tokyo-ghoul",
    helpUrl: "https://p-town.dmm.com/machines/4742",
    groups: [
      {
        id: "tg_at_end_screens",
        title: "AT終了画面",
        note: "AT終了画面で設定を示唆。",
        defaultCollapsed: true,
        items: [
          { id: "tg_at_end_default", label: "金木研（デフォルト）", effect: { type: "none" } },
          {
            id: "tg_at_end_odd",
            label: "亜門鋼太朗＆真戸暁（奇数設定示唆）",
            effect: { type: "weight", weights: { 1: 1.06, 3: 1.06, 5: 1.06 } },
          },
          {
            id: "tg_at_end_even",
            label: "鈴屋什造＆篠原幸紀（偶数設定示唆）",
            effect: { type: "weight", weights: { 2: 1.06, 4: 1.06, 6: 1.06 } },
          },
          {
            id: "tg_at_end_exclude_1",
            label: "神代利世（設定1否定）",
            effect: { type: "excludeSetting", exclude: 1 },
          },
          {
            id: "tg_at_end_high_weak",
            label: "笛口雛実＆笛口リョーコ（高設定示唆［弱］）",
            effect: { type: "weight", weights: { 4: 1.05, 5: 1.1, 6: 1.15 } },
          },
          {
            id: "tg_at_end_high_strong",
            label: "四方蓮示＆イトリ＆ウタ（高設定示唆［強］）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.2, 6: 1.3 } },
          },
          {
            id: "tg_at_end_min_4",
            label: "金木研＆霧嶋董香（設定4以上濃厚）",
            effect: { type: "minSetting", min: 4 },
          },
          {
            id: "tg_at_end_exact_6",
            label: "あんていく全員集合（設定6濃厚）",
            effect: { type: "exactSetting", exact: 6 },
          },
        ],
      },
      {
        id: "tg_cz_end_cards",
        title: "CZ終了画面：エンドカード（設定示唆）",
        note: "CZ終了時にPUSHで表示。モード示唆は判別に未反映。",
        defaultCollapsed: true,
        items: [
          {
            id: "tg_cz_end_even_strong",
            label: "鈴屋什造（偶数設定濃厚）",
            effect: {
              type: "allOf",
              effects: [
                { type: "excludeSetting", exclude: 1 },
                { type: "excludeSetting", exclude: 3 },
                { type: "excludeSetting", exclude: 5 },
              ],
            },
          },
          {
            id: "tg_cz_end_min_4",
            label: "梟（設定4以上濃厚）",
            effect: { type: "minSetting", min: 4 },
          },
          {
            id: "tg_cz_end_exact_6",
            label: "有馬貴将（設定6濃厚）",
            effect: { type: "exactSetting", exact: 6 },
          },
        ],
      },
      {
        id: "tg_cz_end_cards_mode",
        title: "CZ終了画面：エンドカード（モード示唆・表示のみ）",
        note: "滞在モード示唆です（設定判別には反映しません）。",
        defaultCollapsed: true,
        items: [
          { id: "tg_cz_mode_kaneki_a", label: "金木研A（デフォルト）", effect: { type: "none" } },
          { id: "tg_cz_mode_kaneki_b", label: "金木研B（デフォルト）", effect: { type: "none" } },
          { id: "tg_cz_mode_touka", label: "霧嶋董香（通常B以上示唆）", effect: { type: "none" } },
          { id: "tg_cz_mode_hinami", label: "笛口雛実（通常B以上示唆）", effect: { type: "none" } },
          { id: "tg_cz_mode_amon", label: "亜門鋼太朗（通常B以上濃厚）", effect: { type: "none" } },
          { id: "tg_cz_mode_mado", label: "真戸呉緒（通常C以上濃厚）", effect: { type: "none" } },
          { id: "tg_cz_mode_kaneki_ghoul", label: "金木研（喰種）（チャンス以上濃厚）", effect: { type: "none" } },
          { id: "tg_cz_mode_touka_ghoul", label: "霧嶋董香（喰種）（チャンス以上濃厚）", effect: { type: "none" } },
          { id: "tg_cz_mode_tsukiyama", label: "月山習（天国準備以上濃厚）", effect: { type: "none" } },
          { id: "tg_cz_mode_rize", label: "神代利世（天国濃厚）", effect: { type: "none" } },
        ],
      },
      {
        id: "tg_trophy",
        title: "ナミちゃんトロフィー（AT終了画面）",
        note: "AT終了画面で出現。黒は次回トロフィー出現濃厚（設定判別には未反映）。",
        defaultCollapsed: true,
        items: [
          { id: "tg_trophy_black", label: "黒（次回トロフィー出現濃厚）", effect: { type: "none" } },
          { id: "tg_trophy_copper", label: "銅（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "tg_trophy_silver", label: "銀（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "tg_trophy_gold", label: "金（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "tg_trophy_ghoul", label: "喰種柄（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "tg_trophy_rainbow", label: "虹（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "tg_invitation",
        title: "月山招待状（設定示唆）",
        note: "50G消化ごとに表示。色付き文字は残りG数示唆（設定判別には未反映）。",
        defaultCollapsed: true,
        items: [
          {
            id: "tg_inv_even",
            label: "偶にはディナーでもどうだい？（偶数設定示唆）",
            effect: { type: "weight", weights: { 2: 1.06, 4: 1.06, 6: 1.06 } },
          },
          {
            id: "tg_inv_exclude_1",
            label: "不思議な香りだ…（設定1否定）",
            effect: { type: "excludeSetting", exclude: 1 },
          },
          {
            id: "tg_inv_exclude_2",
            label: "君はなかなかの活字中毒らしいね（設定2否定）",
            effect: { type: "excludeSetting", exclude: 2 },
          },
          {
            id: "tg_inv_exclude_3",
            label: "本は良いよね…（設定3否定）",
            effect: { type: "excludeSetting", exclude: 3 },
          },
          {
            id: "tg_inv_exclude_4",
            label: "僕としたことがすまない（設定4否定）",
            effect: { type: "excludeSetting", exclude: 4 },
          },
          {
            id: "tg_inv_min_4",
            label: "存分に楽しもうじゃないか（設定4以上濃厚）",
            effect: { type: "minSetting", min: 4 },
          },
          {
            id: "tg_inv_exact_6",
            label: "特別な夜を楽しもうじゃないか（設定6濃厚）",
            effect: { type: "exactSetting", exact: 6 },
          },
        ],
      },
      {
        id: "tg_payout_display",
        title: "獲得枚数表示（特定表示）",
        note: "獲得枚数表示で設定を示唆。",
        defaultCollapsed: true,
        items: [
          { id: "tg_payout_456", label: "456 OVER（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "tg_payout_666", label: "666 OVER（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
          { id: "tg_payout_1000_7", label: "1000-7 OVER（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "tg_ending_cards",
        title: "エンディング中：レア役時の示唆カード",
        note:
          "エンディング中にレア役成立で示唆カードが出現。『示唆（弱/強）』は重み付け、『否定/濃厚』は制約として反映。",
        defaultCollapsed: true,
        items: [
          {
            id: "tg_endcard_odd_weak",
            label: "白（奇数設定示唆［弱］）",
            effect: { type: "weight", weights: { 1: 1.04, 3: 1.04, 5: 1.04 } },
          },
          {
            id: "tg_endcard_odd_strong",
            label: "白（奇数設定示唆［強］）",
            effect: { type: "weight", weights: { 1: 1.08, 3: 1.08, 5: 1.08 } },
          },
          {
            id: "tg_endcard_even_weak",
            label: "青（偶数設定示唆［弱］）",
            effect: { type: "weight", weights: { 2: 1.04, 4: 1.04, 6: 1.04 } },
          },
          {
            id: "tg_endcard_even_strong",
            label: "青（偶数設定示唆［強］）",
            effect: { type: "weight", weights: { 2: 1.08, 4: 1.08, 6: 1.08 } },
          },
          {
            id: "tg_endcard_high_weak",
            label: "赤（高設定示唆［弱］）",
            effect: { type: "weight", weights: { 4: 1.05, 5: 1.1, 6: 1.15 } },
          },
          {
            id: "tg_endcard_high_strong",
            label: "赤（高設定示唆［強］）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.2, 6: 1.3 } },
          },
          { id: "tg_endcard_excl_1", label: "銅：鈴屋什造（設定1否定）", effect: { type: "excludeSetting", exclude: 1 } },
          { id: "tg_endcard_excl_2", label: "銅：高槻泉（設定2否定）", effect: { type: "excludeSetting", exclude: 2 } },
          { id: "tg_endcard_excl_3", label: "銅：梟（設定3否定）", effect: { type: "excludeSetting", exclude: 3 } },
          { id: "tg_endcard_excl_4", label: "銅：エト（設定4否定）", effect: { type: "excludeSetting", exclude: 4 } },
          { id: "tg_endcard_min_3", label: "銀：金木研（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "tg_endcard_min_4", label: "金：神代利世（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "tg_endcard_min_5", label: "隻眼の梟（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "tg_endcard_exact_6", label: "虹：有馬貴将（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
    ],
  },
};

  hintConfigs["smart-neo-planet"] = {
    machineId: "smart-neo-planet",
    groups: [
      {
        id: "neo_planet_kerot_trophy",
        title: "ケロットトロフィー",
        note: "ボーナス終了時などに出現。『設定◯以上』は制約として反映。",
        defaultCollapsed: true,
        maxTotalFrom: "bigCount",
        items: [
          { id: "neo_planet_trophy_copper", label: "銅（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "neo_planet_trophy_gold", label: "金（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "neo_planet_trophy_kerot", label: "ケロット柄（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "neo_planet_trophy_rainbow", label: "虹（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "neo_planet_bonus_end",
        title: "ボーナス終了画面",
        note:
          "ボーナス終了画面に登場するキャラで示唆。偶数/高設定示唆はソフト示唆（重み付け）として反映。『設定◯以上』は制約として反映。",
        defaultCollapsed: true,
        maxTotalFrom: "bigCount",
        items: [
          { id: "neo_planet_bonus_end_default", label: "キャラなし（デフォルト）", effect: { type: "none" } },
          {
            id: "neo_planet_bonus_end_satellite",
            label: "衛星（偶数設定示唆）",
            effect: { type: "weight", weights: { 2: 1.08, 4: 1.08, 6: 1.08 } },
          },
          {
            id: "neo_planet_bonus_end_astronaut",
            label: "宇宙飛行士（設定2以上濃厚 かつ 高設定示唆）",
            effect: {
              type: "allOf",
              effects: [
                { type: "minSetting", min: 2 },
                { type: "weight", weights: { 4: 1.08, 5: 1.15, 6: 1.22 } },
              ],
            },
          },
          { id: "neo_planet_bonus_end_win", label: "ウィンちゃん（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
          { id: "neo_planet_bonus_end_rocket", label: "ロケット通過（1G連濃厚）", effect: { type: "none" } },
        ],
      },
    ],
  };

  hintConfigs["smart-monkey-v"] = {
    machineId: "smart-monkey-v",
    helpUrl: "https://p-town.dmm.com/machines/4450",
    groups: [
      {
        id: "monkeyv_payout_display",
        title: "獲得枚数表示（特定表示）",
        note: "獲得枚数表示で設定を示唆。",
        defaultCollapsed: true,
        items: [
          { id: "monkeyv_payout_456", label: "456 OVER（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "monkeyv_payout_666", label: "666 OVER（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
          { id: "monkeyv_payout_803", label: "803 OVER（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
        ],
      },
      {
        id: "monkeyv_at_end_item",
        title: "AT終了画面：アイテム別示唆",
        note: "AT終了時に出現するアイテムで設定を示唆。",
        defaultCollapsed: true,
        items: [
          {
            id: "monkeyv_at_sgmedal_blue",
            label: "SGメダル 青（偶数設定示唆）",
            effect: { type: "weight", weights: { 2: 1.1, 4: 1.1, 6: 1.1 } },
          },
          {
            id: "monkeyv_at_sgmedal_yellow",
            label: "SGメダル 黄（高設定示唆［弱］）",
            effect: { type: "weight", weights: { 4: 1.08, 5: 1.12, 6: 1.15 } },
          },
          {
            id: "monkeyv_at_sgmedal_black",
            label: "SGメダル 黒（高設定示唆［強］）",
            effect: { type: "weight", weights: { 4: 1.2, 5: 1.3, 6: 1.35 } },
          },
          {
            id: "monkeyv_at_trophy_silver",
            label: "ケロットトロフィー 銀（設定2以上）",
            effect: { type: "minSetting", min: 2 },
          },
          {
            id: "monkeyv_at_trophy_gold",
            label: "ケロットトロフィー 金（設定4以上）",
            effect: { type: "minSetting", min: 4 },
          },
          {
            id: "monkeyv_at_trophy_kerot",
            label: "ケロットトロフィー ケロット柄（設定5以上）",
            effect: { type: "minSetting", min: 5 },
          },
          {
            id: "monkeyv_at_trophy_rainbow",
            label: "ケロットトロフィー 虹（設定6）",
            effect: { type: "exactSetting", exact: 6 },
          },
        ],
      },
      {
        id: "monkeyv_enoki",
        title: "榎木（赤/紫）出現",
        note: "榎木紫は設定4以上、赤は2/4/6で出現。",
        defaultCollapsed: true,
        items: [
          { id: "monkeyv_enoki_purple", label: "榎木 紫（設定4以上）", effect: { type: "minSetting", min: 4 } },
          { id: "monkeyv_enoki_red", label: "榎木 赤（設定2/4/6）", effect: { type: "weight", weights: { 2: 1.2, 4: 1.2, 6: 1.2 } } },
        ],
      },
      {
        id: "monkeyv_hatano_ratio",
        title: "波多野A/B比率（参考表示）",
        note: "設定判別には未反映。A/B比率は参考用。",
        defaultCollapsed: true,
        items: [
          { id: "monkeyv_hatano_a", label: "波多野A", effect: { type: "none" } },
          { id: "monkeyv_hatano_b", label: "波多野B", effect: { type: "none" } },
        ],
      },
    ],
  };

  hintConfigs["smart-super-blackjack"] = {
    machineId: "smart-super-blackjack",
    helpUrl: "https://p-town.dmm.com/machines/4712",
    groups: [
      {
        id: "sbj_bonus_end_sublcd",
        title: "ボーナス終了時：サブ液晶キャラ",
        note: "ボーナス終了時に表示。『設定◯以上』は制約として反映。偶数/高設定示唆はソフト示唆（重み付け）として反映。",
        defaultCollapsed: true,
        maxTotalFrom: "bigCount",
        items: [
          { id: "sbj_bonus_end_tiffany", label: "ティファニー（デフォルト）", effect: { type: "none" } },
          { id: "sbj_bonus_end_il_el", label: "イル＆エル（設定2以上）", effect: { type: "minSetting", min: 2 } },
          {
            id: "sbj_bonus_end_rosa",
            label: "ローザ（偶数設定示唆）",
            effect: { type: "weight", weights: { 2: 1.08, 4: 1.08, 6: 1.08 } },
          },
          {
            id: "sbj_bonus_end_mint",
            label: "ミント（高設定示唆［弱］）",
            effect: { type: "weight", weights: { 4: 1.08, 5: 1.12, 6: 1.15 } },
          },
          {
            id: "sbj_bonus_end_rio",
            label: "リオ（高設定示唆［中］）",
            effect: { type: "weight", weights: { 4: 1.12, 5: 1.2, 6: 1.28 } },
          },
          {
            id: "sbj_bonus_end_lina",
            label: "リナ（高設定示唆［強］）",
            effect: { type: "weight", weights: { 4: 1.2, 5: 1.35, 6: 1.5 } },
          },
          { id: "sbj_bonus_end_rio_lina", label: "リオ＆リナ（設定5以上）", effect: { type: "minSetting", min: 5 } },
          { id: "sbj_bonus_end_rio_lina_mint", label: "リオ＆リナ＆ミント（設定6）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "sbj_kerot_trophy",
        title: "ケロットトロフィー",
        note: "ボーナス終了時などに出現。",
        defaultCollapsed: true,
        maxTotalFrom: "bigCount",
        items: [
          { id: "sbj_trophy_copper", label: "銅（設定2以上）", effect: { type: "minSetting", min: 2 } },
          { id: "sbj_trophy_silver", label: "銀（設定3以上）", effect: { type: "minSetting", min: 3 } },
          { id: "sbj_trophy_gold", label: "金（設定4以上）", effect: { type: "minSetting", min: 4 } },
          { id: "sbj_trophy_kerot", label: "ケロット柄（設定5以上）", effect: { type: "minSetting", min: 5 } },
          { id: "sbj_trophy_rainbow", label: "虹（設定6）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "sbj_11coin_trump",
        title: "11枚役入賞時：トランプ",
        note: "11枚役入賞時にトランプが出現。ハート=1〜3、スペード=4〜6。",
        defaultCollapsed: true,
        items: [
          { id: "sbj_trump_h_a", label: "ハートA（設定1）", effect: { type: "exactSetting", exact: 1 } },
          { id: "sbj_trump_h_7", label: "ハート7（設定2）", effect: { type: "exactSetting", exact: 2 } },
          { id: "sbj_trump_h_k", label: "ハートK（設定3）", effect: { type: "exactSetting", exact: 3 } },
          { id: "sbj_trump_s_a", label: "スペードA（設定4）", effect: { type: "exactSetting", exact: 4 } },
          { id: "sbj_trump_s_7", label: "スペード7（設定5）", effect: { type: "exactSetting", exact: 5 } },
          { id: "sbj_trump_s_k", label: "スペードK（設定6）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "sbj_hawaii_oddity",
        title: "ハワイステージ中：違和感演出",
        note: "違和感が発生した場合に設定を示唆。",
        defaultCollapsed: true,
        items: [
          { id: "sbj_hawaii_lower_off", label: "下パネル消灯（設定2以上）", effect: { type: "minSetting", min: 2 } },
          { id: "sbj_hawaii_lower_flash", label: "下パネル点滅（設定3以上）", effect: { type: "minSetting", min: 3 } },
          { id: "sbj_hawaii_lower_off_on", label: "下パネル消灯→点灯（設定5以上）", effect: { type: "minSetting", min: 5 } },
          { id: "sbj_hawaii_lower_disappear", label: "下パネル消失（設定6）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "sbj_dice_check",
        title: "サイコロ出目ごとの示唆",
        note: "通常時150G/450G/750G消化時などに発生するダイスチェック。2〜6のゾロ目が出た場合、示唆される『スイカ規定回数』を超えてもストックタイムが直撃しないと『設定◯以上濃厚』。\n※このツールでは『条件達成後の確定示唆』として反映します。",
        defaultCollapsed: true,
        items: [
          { id: "sbj_dice_2", label: "2のゾロ目（条件達成で設定2以上）", effect: { type: "minSetting", min: 2 } },
          { id: "sbj_dice_3", label: "3のゾロ目（条件達成で設定3以上）", effect: { type: "minSetting", min: 3 } },
          { id: "sbj_dice_4", label: "4のゾロ目（条件達成で設定4以上）", effect: { type: "minSetting", min: 4 } },
          { id: "sbj_dice_5", label: "5のゾロ目（条件達成で設定5以上）", effect: { type: "minSetting", min: 5 } },
          { id: "sbj_dice_6", label: "6のゾロ目（条件達成で設定6）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
    ],
  };

  hintConfigs["smart-god-eater-resurrection"] = {
    machineId: "smart-god-eater-resurrection",
    helpUrl: "https://p-town.dmm.com/machines/4602#anc-point",
    groups: [
      {
        id: "ger_at_end_screens",
        title: "AT終了画面",
        note: "AT終了時に表示。『濃厚/否定』系は判別に反映。示唆［弱/強］はソフト示唆（重み付け）として反映。",
        defaultCollapsed: true,
        items: [
          { id: "ger_at_end_default", label: "キャラなし（デフォルト）", effect: { type: "none" } },
          {
            id: "ger_at_end_kouta",
            label: "コウタ（高設定示唆［弱］）",
            effect: { type: "weight", weights: { 4: 1.05, 5: 1.1, 6: 1.15 } },
          },
          {
            id: "ger_at_end_alisa",
            label: "アリサ（偶数設定示唆［弱］）",
            effect: { type: "weight", weights: { 2: 1.05, 4: 1.05, 6: 1.05 } },
          },
          {
            id: "ger_at_end_yuu_excl_234",
            label: "ユウ（設定2・3・4否定）",
            effect: {
              type: "allOf",
              effects: [
                { type: "excludeSetting", exclude: 2 },
                { type: "excludeSetting", exclude: 3 },
                { type: "excludeSetting", exclude: 4 },
              ],
            },
          },
          {
            id: "ger_at_end_soma",
            label: "ソーマ（高設定示唆［強］）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.2, 6: 1.3 } },
          },
          {
            id: "ger_at_end_sakuya",
            label: "サクヤ（偶数設定示唆［強］）",
            effect: { type: "weight", weights: { 2: 1.1, 4: 1.1, 6: 1.1 } },
          },
          { id: "ger_at_end_lindow", label: "リンドウ（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "ger_at_end_shio", label: "シオ（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          {
            id: "ger_at_end_cafe",
            label: "カフェ（偶数設定濃厚）",
            effect: { type: "weight", weights: { 2: 1.25, 4: 1.25, 6: 1.25 } },
          },
          { id: "ger_at_end_all", label: "キャラ集合（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "ger_at_end_mini", label: "ミニキャラ（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "ger_story_touch_voice",
        title: "ストーリーパート終了時：サブ液晶タッチ（ボイス示唆）",
        note: "ストーリーパート終了時にサブ液晶へタッチするとボイスで示唆。『濃厚/否定』系は判別に反映。示唆［弱/強］はソフト示唆（重み付け）として反映。",
        defaultCollapsed: true,
        items: [
          { id: "ger_story_touch_kouta_default", label: "コウタ（デフォルト）", effect: { type: "none" } },
          { id: "ger_story_touch_alisa_default", label: "アリサ（デフォルト）", effect: { type: "none" } },
          {
            id: "ger_story_touch_hibari",
            label: "ヒバリ（偶数設定示唆［弱］）",
            effect: { type: "weight", weights: { 2: 1.05, 4: 1.05, 6: 1.05 } },
          },
          {
            id: "ger_story_touch_sakuya",
            label: "サクヤ（偶数設定示唆［強］）",
            effect: { type: "weight", weights: { 2: 1.1, 4: 1.1, 6: 1.1 } },
          },
          {
            id: "ger_story_touch_soma",
            label: "ソーマ（高設定示唆［弱］）",
            effect: { type: "weight", weights: { 4: 1.05, 5: 1.1, 6: 1.15 } },
          },
          {
            id: "ger_story_touch_ren",
            label: "レン（高設定示唆［強］）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.2, 6: 1.3 } },
          },
          {
            id: "ger_story_touch_yuu_excl_23",
            label: "ユウ（設定2・3否定）",
            effect: {
              type: "allOf",
              effects: [
                { type: "excludeSetting", exclude: 2 },
                { type: "excludeSetting", exclude: 3 },
              ],
            },
          },
          {
            id: "ger_story_touch_erina",
            label: "エリナ（偶数設定濃厚）",
            effect: { type: "weight", weights: { 2: 1.25, 4: 1.25, 6: 1.25 } },
          },
          { id: "ger_story_touch_lindow", label: "リンドウ（設定2以上）", effect: { type: "minSetting", min: 2 } },
          { id: "ger_story_touch_shio", label: "シオ（設定5以上）", effect: { type: "minSetting", min: 5 } },
        ],
      },
      {
        id: "ger_payout_display",
        title: "獲得枚数表示（特定枚数表示）",
        note: "AT中などの獲得枚数表示で設定を示唆。",
        defaultCollapsed: true,
        items: [
          {
            id: "ger_payout_246",
            label: "246 OVER（偶数設定濃厚）",
            effect: { type: "weight", weights: { 2: 1.25, 4: 1.25, 6: 1.25 } },
          },
          { id: "ger_payout_456", label: "456 OVER（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "ger_payout_555", label: "555 OVER（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "ger_payout_666", label: "666 OVER（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "ger_yuu_timer",
        title: "ユウタイマー演出（作戦区域）",
        note: "作戦区域中のリール左タイマー。『6から開始→AT非当選』は設定6濃厚。",
        defaultCollapsed: true,
        items: [
          { id: "ger_timer_6start_miss", label: "6スタートでAT非当選（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
    ],
  };

export function getHintConfig(machineId: string): MachineHintConfig | null {
  return hintConfigs[machineId] ?? null;
}
