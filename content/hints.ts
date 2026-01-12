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
  items: HintItem[];
};

export type MachineHintConfig = {
  machineId: string;
  helpUrl?: string;
  groups: HintGroup[];
};

function makePioneerHanahana6GoukiGroups(): HintGroup[] {
  return [
    {
      id: "big_in",
      title: "BIG中",
      note: "スイカはカウントのみ（判別には未反映）",
      items: [{ id: "big_in_suika", label: "スイカ", effect: { type: "none" } }],
    },
    {
      id: "oni3_voice",
      title: "レア役成立時のボイス",
      items: [
        { id: "oni3_voice_soki_min5", label: "蒼鬼（設定5以上）", effect: { type: "minSetting", min: 5 } },
        {
          id: "oni3_voice_tenkai_odd_strong",
          label: "天海（奇数示唆［強］）",
          effect: { type: "weight", weights: { 1: 1.08, 3: 1.08, 5: 1.08 } },
        },
        {
          id: "oni3_voice_roberto_odd_weak",
          label: "ロベルト（奇数示唆［弱］）",
          effect: { type: "weight", weights: { 1: 1.05, 3: 1.05, 5: 1.05 } },
        },
        {
          id: "oni3_voice_akane_even_strong",
          label: "茜（偶数示唆［強］）",
          effect: { type: "weight", weights: { 2: 1.08, 4: 1.08, 6: 1.08 } },
        },
            {
              id: "oni3_voice_ohatsu_even_weak",
              label: "お初（偶数示唆［弱］）",
              effect: { type: "weight", weights: { 2: 1.05, 4: 1.05, 6: 1.05 } },
            },
            { id: "oni3_voice_minokichi_excl2", label: "みの吉（設定2否定）", effect: { type: "excludeSetting", exclude: 2 } },
            { id: "oni3_voice_minokichi_excl3", label: "みの吉（設定3否定）", effect: { type: "excludeSetting", exclude: 3 } },
            { id: "oni3_voice_minokichi_excl4", label: "みの吉（設定4否定）", effect: { type: "excludeSetting", exclude: 4 } },
            { id: "oni3_voice_orin_min2", label: "阿倫（設定2以上）", effect: { type: "minSetting", min: 2 } },
            { id: "oni3_voice_orin_min3", label: "阿倫（設定3以上）", effect: { type: "minSetting", min: 3 } },
            { id: "oni3_voice_orin_min4", label: "阿倫（設定4以上）", effect: { type: "minSetting", min: 4 } },
            { id: "oni3_voice_entaraion_exact6", label: "エンタライオン（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
              ],
        },
      ];
    }
    const pioneerHanahana6GoukiGroupsRainbow4Plus = makePioneerHanahana6GoukiGroups();

export const hintConfigs: Record<string, MachineHintConfig> = {
  "s-king-hanahana-30-6gouki": {
    machineId: "s-king-hanahana-30-6gouki",
    groups: pioneerHanahana6GoukiGroupsRainbow4Plus,
  },
  "dragon-hanahana-senkou-30-6gouki": {
    machineId: "dragon-hanahana-senkou-30-6gouki",
    groups: pioneerHanahana6GoukiGroupsRainbow4Plus,
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

  "enterrise_dmc5": {
    machineId: "enterrise_dmc5",
    helpUrl: "https://p-town.dmm.com/machines/4814",
    groups: [
      {
        id: "dmc5_trophy",
        title: "エンタトロフィーの示唆",
        note: "ST終了画面でエンタトロフィーが出現すれば設定2以上濃厚。色でさらに上位設定を示唆。",
        items: [
          { id: "dmc5_trophy_bronze", label: "銅", effect: { type: "minSetting", min: 2 } },
          { id: "dmc5_trophy_silver", label: "銀", effect: { type: "minSetting", min: 3 } },
          { id: "dmc5_trophy_gold", label: "金", effect: { type: "minSetting", min: 4 } },
          { id: "dmc5_trophy_momiji", label: "紅葉柄", effect: { type: "minSetting", min: 5 } },
          { id: "dmc5_trophy_rainbow", label: "虹", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "dmc5_dante_quote",
        title: "上位ST勝利後：ダンテのセリフ",
        note: "セリフは『◯点リードだ！』形式。表示された回数をカウント。",
        items: [
          { id: "dmc5_dante_lead2", label: "2点リードだ！（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "dmc5_dante_lead3", label: "3点リードだ！（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "dmc5_dante_lead4", label: "4点リードだ！（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "dmc5_dante_lead5", label: "5点リードだ！（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "dmc5_dante_lead6", label: "6点リードだ！（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "dmc5_bonus_end_screen",
        title: "DMCボーナス終了画面",
        note: "奇数/偶数/高設定示唆はソフト示唆（重み付け）として反映。否定・濃厚系は制約として反映。",
        items: [
          { id: "dmc5_bonus_end_default", label: "ニコトレーラー内（デフォルト）", effect: { type: "none" } },
          {
            id: "dmc5_bonus_end_library",
            label: "ライブラリー（奇数設定示唆）",
            effect: { type: "weight", weights: { 1: 1.05, 3: 1.05, 5: 1.05 } },
          },
          {
            id: "dmc5_bonus_end_market",
            label: "マーケット（偶数設定示唆）",
            effect: { type: "weight", weights: { 2: 1.05, 4: 1.05, 6: 1.05 } },
          },
          {
            id: "dmc5_bonus_end_street",
            label: "ストリート（高設定示唆［弱］）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
          },
          {
            id: "dmc5_bonus_end_catacombs",
            label: "カタコンベ（高設定示唆［強］）",
            effect: { type: "weight", weights: { 4: 1.2, 5: 1.35, 6: 1.5 } },
          },
          { id: "dmc5_bonus_end_bp_low", label: "ブラッディパレス（低層）（設定3否定）", effect: { type: "excludeSetting", exclude: 3 } },
          { id: "dmc5_bonus_end_bp_mid", label: "ブラッディパレス（中層）（設定2否定）", effect: { type: "excludeSetting", exclude: 2 } },
          { id: "dmc5_bonus_end_bp_high", label: "ブラッディパレス（上層）（設定1否定）", effect: { type: "excludeSetting", exclude: 1 } },
          { id: "dmc5_bonus_end_makai", label: "魔界（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "dmc5_bonus_end_all", label: "全員集合（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "dmc5_bonus_end_entaraion", label: "エンタライオン（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
          { id: "dmc5_bonus_end_totsu_dnc", label: "突Devils Never Cry移行演出（上位ST直行時に発生）", effect: { type: "none" } },
        ],
      },
      {
        id: "dmc5_payout_display",
        title: "特定の獲得枚数表示",
        note: "トータル獲得枚数が規定枚数を超えた際に表示。",
        items: [
          { id: "dmc5_payout_222_over", label: "222枚OVER（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "dmc5_payout_456_over", label: "456枚OVER（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "dmc5_payout_555_over", label: "555枚OVER（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "dmc5_payout_666_over", label: "666枚OVER（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "dmc5_trump",
        title: "トランプ示唆",
        note: "JOKERは次回ST終了時にエンタトロフィーが出現（実質 設定2以上濃厚）。",
        items: [{ id: "dmc5_trump_joker", label: "JOKER（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } }],
      },
    ],
  },

  "enterrise_bio5": {
    machineId: "enterrise_bio5",
    helpUrl: "https://p-town.dmm.com/machines/4754",
    groups: [
      {
        id: "bio5_trophy",
        title: "エンタトロフィーの示唆",
        note: "AT終了画面で液晶右側にエンタトロフィーが出現すれば設定2以上濃厚。色でさらに上位設定を示唆。",
        items: [
          { id: "bio5_trophy_bronze", label: "銅（設定2以上）", effect: { type: "minSetting", min: 2 } },
          { id: "bio5_trophy_silver", label: "銀（設定3以上）", effect: { type: "minSetting", min: 3 } },
          { id: "bio5_trophy_gold", label: "金（設定4以上）", effect: { type: "minSetting", min: 4 } },
          { id: "bio5_trophy_momiji", label: "紅葉柄（設定5以上）", effect: { type: "minSetting", min: 5 } },
          { id: "bio5_trophy_rainbow", label: "虹（設定6）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "bio5_at_end_screen",
        title: "AT終了画面",
        note: "奇数/偶数/高設定示唆はソフト示唆（重み付け）として反映。否定・濃厚系は制約として反映。",
        items: [
          { id: "bio5_at_end_default", label: "キャラなし（デフォルト）", effect: { type: "none" } },
          {
            id: "bio5_at_end_wesker_a",
            label: "ウェスカーA（高設定示唆［弱］）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
          },
          {
            id: "bio5_at_end_wesker_b",
            label: "ウェスカーB（高設定示唆［強］）",
            effect: { type: "weight", weights: { 4: 1.2, 5: 1.35, 6: 1.5 } },
          },
          {
            id: "bio5_at_end_chris",
            label: "クリス（奇数設定示唆）",
            effect: { type: "weight", weights: { 1: 1.05, 3: 1.05, 5: 1.05 } },
          },
          {
            id: "bio5_at_end_sheva",
            label: "シェバ（偶数設定示唆）",
            effect: { type: "weight", weights: { 2: 1.05, 4: 1.05, 6: 1.05 } },
          },
          { id: "bio5_at_end_josh", label: "ジョッシュ（設定1否定）", effect: { type: "excludeSetting", exclude: 1 } },
          { id: "bio5_at_end_irving", label: "アーヴィング（設定2否定）", effect: { type: "excludeSetting", exclude: 2 } },
          { id: "bio5_at_end_excella", label: "エクセラ（設定3否定）", effect: { type: "excludeSetting", exclude: 3 } },
          { id: "bio5_at_end_majini", label: "マジニ（設定3以上）", effect: { type: "minSetting", min: 3 } },
          { id: "bio5_at_end_chris_sheva", label: "クリス＆シェバ（設定4以上）", effect: { type: "minSetting", min: 4 } },
          { id: "bio5_at_end_all", label: "全員集合（設定5以上）", effect: { type: "minSetting", min: 5 } },
          { id: "bio5_at_end_entaraion", label: "エンタライオン（設定6）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "bio5_ending_quote",
        title: "エンディング中：レア役成立時のセリフ",
        note: "キャラで設定を示唆。",
        items: [
          { id: "bio5_ending_quote_chris", label: "クリス（デフォルト）", effect: { type: "none" } },
          {
            id: "bio5_ending_quote_sheva",
            label: "シェバ（奇数設定示唆）",
            effect: { type: "weight", weights: { 1: 1.05, 3: 1.05, 5: 1.05 } },
          },
          {
            id: "bio5_ending_quote_josh",
            label: "ジョッシュ（偶数設定示唆）",
            effect: { type: "weight", weights: { 2: 1.05, 4: 1.05, 6: 1.05 } },
          },
          {
            id: "bio5_ending_quote_irving",
            label: "アーヴィング（高設定示唆［弱］）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
          },
          {
            id: "bio5_ending_quote_excella",
            label: "エクセラ（高設定示唆［強］）",
            effect: { type: "weight", weights: { 4: 1.2, 5: 1.35, 6: 1.5 } },
          },
          { id: "bio5_ending_quote_wesker", label: "ウェスカー（設定4以上）", effect: { type: "minSetting", min: 4 } },
          { id: "bio5_ending_quote_majini", label: "マジニ（設定5以上）", effect: { type: "minSetting", min: 5 } },
          { id: "bio5_ending_quote_entaraion", label: "エンタライオン（設定6）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "bio5_medals",
        title: "特定の獲得枚数表示",
        note: "トータル獲得枚数が規定枚数を超えた際に表示。",
        items: [
          {
            id: "bio5_medals_256",
            label: "256 MedalsOVER（設定2or5or6）",
            effect: { type: "weight", weights: { 2: 1.2, 5: 1.2, 6: 1.2 } },
          },
          { id: "bio5_medals_456", label: "456 MedalsOVER（設定4以上）", effect: { type: "minSetting", min: 4 } },
          { id: "bio5_medals_810", label: "810 MedalsOVER（設定5以上）", effect: { type: "minSetting", min: 5 } },
          { id: "bio5_medals_666", label: "666 MedalsOVER（設定6）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
    ],
  },

  "olympia_mahjong_monogatari": {
    machineId: "olympia_mahjong_monogatari",
    helpUrl: "https://p-town.dmm.com/machines/4777",
    groups: [
      {
        id: "mahjong_monogatari_at_end_screen",
        title: "AT終了画面（スタンプ）",
        note: "スタンプは『設定◯以上濃厚』系のみ判別に反映（p-town 4777）",
        items: [
          { id: "mahjong_monogatari_at_end_default", label: "三姉妹（デフォルト）", effect: { type: "none" } },
          { id: "mahjong_monogatari_at_end_stamp_k", label: "可スタンプ（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "mahjong_monogatari_at_end_stamp_ryo", label: "良スタンプ（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "mahjong_monogatari_at_end_stamp_yu", label: "優スタンプ（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "mahjong_monogatari_at_end_stamp_kiwami", label: "極スタンプ（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
    ],
  },

  "konami_tenseiken": {
    machineId: "konami_tenseiken",
    helpUrl: "https://p-town.dmm.com/machines/4843",
    groups: [
      {
        id: "tenseiken_curry",
        title: "寸胴カレー演出",
        note: "3個揃い時の辛さで示唆（p-town 4843）",
        items: [
          { id: "tenseiken_curry_default", label: "中辛（デフォルト）", effect: { type: "none" } },
          { id: "tenseiken_curry_spicy", label: "辛口（チャンスアップ）", effect: { type: "none" } },
          { id: "tenseiken_curry_sweet_min2", label: "甘口（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
        ],
      },
      {
        id: "tenseiken_at_end_screen",
        title: "AT終了画面",
        note: "高設定示唆はソフト示唆（重み付け）として反映。濃厚系は制約として反映（p-town 4843）",
        items: [
          { id: "tenseiken_at_end_default", label: "デフォルト", effect: { type: "none" } },
          {
            id: "tenseiken_at_end_white",
            label: "白背景（高設定示唆［弱］）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
          },
          {
            id: "tenseiken_at_end_black",
            label: "黒背景（高設定示唆［強］）",
            effect: { type: "weight", weights: { 4: 1.2, 5: 1.35, 6: 1.5 } },
          },
          { id: "tenseiken_at_end_swimsuit_min2", label: "水着（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "tenseiken_at_end_kimono_min4", label: "和服（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "tenseiken_at_end_all_exact6", label: "全員集合（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "tenseiken_trophy",
        title: "アリストロフィー",
        note: "AT終了画面で出現（p-town 4843）",
        items: [
          { id: "tenseiken_trophy_bronze", label: "銅（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "tenseiken_trophy_silver", label: "銀（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "tenseiken_trophy_gold", label: "金（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "tenseiken_trophy_clover", label: "クローバー柄（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "tenseiken_trophy_rainbow", label: "虹（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "tenseiken_payout_display",
        title: "特定の獲得枚数表示",
        note: "トータル獲得枚数が規定枚数を超えた際に表示（p-town 4843）",
        items: [
          { id: "tenseiken_payout_456_over", label: "456枚OVER（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "tenseiken_payout_666_over", label: "666枚OVER（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "tenseiken_goblin_stampede_lamp",
        title: "ゴブリンスタンピード終了画面：ランプ色",
        note: "チャンスボタン押下時のリール左右ランプ色で示唆（p-town 4843）",
        items: [
          { id: "tenseiken_goblin_lamp_white", label: "白（デフォルト）", effect: { type: "none" } },
          {
            id: "tenseiken_goblin_lamp_blue_odd",
            label: "青（奇数設定示唆）",
            effect: { type: "weight", weights: { 1: 1.05, 3: 1.05, 5: 1.05 } },
          },
          {
            id: "tenseiken_goblin_lamp_yellow_even",
            label: "黄（偶数設定示唆）",
            effect: { type: "weight", weights: { 2: 1.05, 4: 1.05, 6: 1.05 } },
          },
          {
            id: "tenseiken_goblin_lamp_green_high",
            label: "緑（高設定示唆）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
          },
          { id: "tenseiken_goblin_lamp_red_min2", label: "赤（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "tenseiken_goblin_lamp_purple_min4", label: "紫（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "tenseiken_goblin_lamp_rainbow_exact6", label: "虹（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "tenseiken_x_bonus_issen",
        title: "X転剣ボーナス：一閃乗せ時の表示ゲーム数",
        note: "表示ゲーム数が特定なら上位設定濃厚（p-town 4843）",
        items: [
          { id: "tenseiken_issen_22_min2", label: "＋22G（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "tenseiken_issen_33_min3", label: "＋33G（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "tenseiken_issen_4_min4", label: "＋4G（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "tenseiken_issen_5_min5", label: "＋5G（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "tenseiken_issen_6_exact6", label: "＋6G（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "tenseiken_curry_eating",
        title: "転剣ラッシュ：カレー実食演出",
        note: "連打中の特定上乗せゲーム数で高設定濃厚（p-town 4843）",
        items: [
          { id: "tenseiken_curry_eat_4_min4", label: "＋4G（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "tenseiken_curry_eat_5_min5", label: "＋5G（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "tenseiken_curry_eat_6_exact6", label: "＋6G（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "tenseiken_fran_bonus_char",
        title: "フランボーナス中：キャラ紹介",
        note: "キャラ（色）で設定を示唆（p-town 4843）",
        items: [
          { id: "tenseiken_fran_char_default", label: "デフォルトキャラ（青）（示唆なし）", effect: { type: "none" } },
          {
            id: "tenseiken_fran_char_nell_weak",
            label: "ネル（ピンク）（高設定示唆［弱］）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
          },
          {
            id: "tenseiken_fran_char_amanda_strong",
            label: "アマンダ（緑）（高設定示唆［強］）",
            effect: { type: "weight", weights: { 4: 1.2, 5: 1.35, 6: 1.5 } },
          },
          { id: "tenseiken_fran_char_urushi_min2", label: "ウルシ（赤）（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "tenseiken_fran_char_fenrir_min4", label: "フェンリル（紫）（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "tenseiken_fran_char_chaos_exact6", label: "混沌の女神（金）（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "tenseiken_x_bonus_episode",
        title: "X転剣ボーナス：話数紹介",
        note: "特定話数で上位設定濃厚（p-town 4843）",
        items: [
          { id: "tenseiken_x_episode_12_min4", label: "第12話（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
        ],
      },
    ],
  },

  "konami_ginei_denethese": {
    machineId: "konami_ginei_denethese",
    helpUrl: "https://p-town.dmm.com/machines/4895",
    groups: [
      {
        id: "ginei_trophy",
        title: "アリストロフィー",
        note: "色で設定を示唆（p-town 4895）",
        items: [
          { id: "ginei_trophy_bronze", label: "銅（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "ginei_trophy_silver", label: "銀（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "ginei_trophy_gold", label: "金（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "ginei_trophy_clover", label: "クローバー柄（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "ginei_trophy_rainbow", label: "虹（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "ginei_galaxy_bonus_end",
        title: "ギャラクシーボーナス終了画面",
        note: "表示キャラで設定を示唆（p-town 4895）。一部は特定日（誕生日/4月1日）で示唆が変わるため注意。",
        items: [
          { id: "ginei_end_none", label: "キャラなし（デフォルト）", effect: { type: "none" } },
          { id: "ginei_end_other_min2", label: "ヤン・ラインハルト以外（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "ginei_end_yang_or_reinhardt_min3", label: "ヤン or ラインハルト（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "ginei_end_birthday_min4", label: "誕生日のキャラ（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "ginei_end_all_exact6", label: "キャラ集合（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "ginei_galaxy_bonus_char_alliance",
        title: "ギャラクシーボーナス中：キャラ紹介（同盟陣営）",
        note: "開始キャラと最後のキャラで示唆（p-town 4895）",
        items: [
          {
            id: "ginei_char_alliance_yang_odd",
            label: "ヤンからスタート（奇数設定示唆）",
            effect: { type: "weight", weights: { 1: 1.05, 3: 1.05, 5: 1.05 } },
          },
          {
            id: "ginei_char_alliance_frederica_even",
            label: "フレデリカからスタート（偶数設定示唆）",
            effect: { type: "weight", weights: { 2: 1.05, 4: 1.05, 6: 1.05 } },
          },
          { id: "ginei_char_alliance_last_merkatz_min3", label: "最後がメルカッツ（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
        ],
      },
      {
        id: "ginei_galaxy_bonus_char_empire",
        title: "ギャラクシーボーナス中：キャラ紹介（帝国陣営）",
        note: "開始キャラと最後のキャラで示唆（p-town 4895）",
        items: [
          {
            id: "ginei_char_empire_reinhardt_odd",
            label: "ラインハルトからスタート（奇数設定示唆）",
            effect: { type: "weight", weights: { 1: 1.05, 3: 1.05, 5: 1.05 } },
          },
          {
            id: "ginei_char_empire_hildegard_even",
            label: "ヒルデガルドからスタート（偶数設定示唆）",
            effect: { type: "weight", weights: { 2: 1.05, 4: 1.05, 6: 1.05 } },
          },
          { id: "ginei_char_empire_last_anneliese_min3", label: "最後がアンネローゼ（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
        ],
      },
      {
        id: "ginei_story_intro",
        title: "ギャラクシーボーナス開始時：ストーリー紹介",
        note: "シーズン/章で示唆（p-town 4895）",
        items: [
          {
            id: "ginei_story_s3_ch1_weak",
            label: "サードシーズン：第一章（高設定示唆［弱］）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
          },
          { id: "ginei_story_s3_ch2_min2", label: "サードシーズン：第二章（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "ginei_story_s3_ch3_min3", label: "サードシーズン：第三章（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "ginei_story_s4_min4", label: "フォースシーズン（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
        ],
      },
    ],
  },

  "konami_magihalo8": {
    machineId: "konami_magihalo8",
    helpUrl: "https://p-town.dmm.com/machines/4423",
    groups: [
      {
        id: "magihalo8_bonus_confirm_end",
        title: "ボーナス確定画面＆終了画面",
        note: "確定画面/終了画面の『アリスインワンダーランド』で示唆（p-town 4423）",
        items: [
          {
            id: "magihalo8_bonus_confirm_alice_high",
            label: "確定画面でアリスインワンダーランド（高設定示唆）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
          },
          {
            id: "magihalo8_bonus_end_alice_excl1",
            label: "終了画面でアリスインワンダーランド（設定1否定）",
            effect: { type: "excludeSetting", exclude: 1 },
          },
          {
            id: "magihalo8_bonus_both_alice_min5",
            label: "両方でアリスインワンダーランド（設定5以上濃厚）",
            effect: { type: "minSetting", min: 5 },
          },
        ],
      },
      {
        id: "magihalo8_art_end",
        title: "ART終了画面",
        note: "人数で示唆（p-town 4423）",
        items: [
          { id: "magihalo8_art_end_1", label: "キャラ1人（デフォルト）", effect: { type: "none" } },
          { id: "magihalo8_art_end_2_min2", label: "キャラ2人（設定2以上）", effect: { type: "minSetting", min: 2 } },
          { id: "magihalo8_art_end_4_min4", label: "キャラ4人（設定4以上）", effect: { type: "minSetting", min: 4 } },
          { id: "magihalo8_art_end_6_exact6", label: "キャラ6人（設定6）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "magihalo8_trophy",
        title: "アリストロフィー",
        note: "BIG終了画面で出現（p-town 4423）",
        items: [
          { id: "magihalo8_trophy_bronze", label: "銅（設定2以上）", effect: { type: "minSetting", min: 2 } },
          { id: "magihalo8_trophy_silver", label: "銀（設定3以上）", effect: { type: "minSetting", min: 3 } },
          { id: "magihalo8_trophy_gold", label: "金（設定4以上）", effect: { type: "minSetting", min: 4 } },
          { id: "magihalo8_trophy_clover", label: "クローバー柄（設定5以上）", effect: { type: "minSetting", min: 5 } },
          { id: "magihalo8_trophy_rainbow", label: "虹（設定6）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
    ],
  },

  "konami_magihalo_bt": {
    machineId: "konami_magihalo_bt",
    helpUrl: "https://p-town.dmm.com/machines/4854",
    groups: [
      {
        id: "magihalo_bt_trophy",
        title: "ボーナス終了画面：アリストロフィー",
        note: "ボーナス終了画面で出現（p-town 4854）",
        items: [
          { id: "magihalo_bt_trophy_bronze", label: "銅（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "magihalo_bt_trophy_silver", label: "銀（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "magihalo_bt_trophy_gold", label: "金（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "magihalo_bt_trophy_clover", label: "クローバー柄（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "magihalo_bt_trophy_rainbow", label: "虹（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "magihalo_bt_bonus_minichara",
        title: "ボーナス中：ミニキャラのアクション（台座）",
        note: "ミニキャラ出現時の台座色で設定示唆（p-town 4854）",
        items: [
          {
            id: "magihalo_bt_minichara_white_a_odd",
            label: "白-A（奇数設定示唆）",
            effect: { type: "weight", weights: { 1: 1.05, 3: 1.05, 5: 1.05 } },
          },
          {
            id: "magihalo_bt_minichara_white_b_even",
            label: "白-B（偶数設定示唆）",
            effect: { type: "weight", weights: { 2: 1.05, 4: 1.05, 6: 1.05 } },
          },
          {
            id: "magihalo_bt_minichara_blue_a_1or6",
            label: "青-A（設定1or6示唆）",
            effect: { type: "weight", weights: { 1: 1.2, 6: 1.2 } },
          },
          {
            id: "magihalo_bt_minichara_blue_b_2or5",
            label: "青-B（設定2or5示唆）",
            effect: { type: "weight", weights: { 2: 1.2, 5: 1.2 } },
          },
          {
            id: "magihalo_bt_minichara_green_mid",
            label: "緑（高設定示唆［中］）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
          },
          {
            id: "magihalo_bt_minichara_red_strong",
            label: "赤（高設定示唆［強］）",
            effect: { type: "weight", weights: { 4: 1.2, 5: 1.35, 6: 1.5 } },
          },
          { id: "magihalo_bt_minichara_gold_min5", label: "金（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "magihalo_bt_minichara_purple_excl1", label: "紫（キャラ瞳）（設定1否定）", effect: { type: "excludeSetting", exclude: 1 } },
        ],
      },
    ],
  },

  "sankyo_enen": {
    machineId: "sankyo_enen",
    helpUrl: "https://p-town.dmm.com/machines/4555",
    groups: [
      {
        id: "enen_bonus_end",
        title: "ボーナス終了画面",
        note: "炎炎ボーナス（状況不問）とREG（通常時）の終了画面で設定示唆（p-town 4555）。A/Bは重み付け（ソフト示唆）、C/D/Eは濃厚系として反映。",
        items: [
          {
            id: "enen_bonus_end_pattern_a_high_weak",
            label: "パターンA（高設定示唆［弱］）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
          },
          {
            id: "enen_bonus_end_pattern_b_high_strong",
            label: "パターンB（高設定示唆［強］）",
            effect: { type: "weight", weights: { 4: 1.2, 5: 1.35, 6: 1.5 } },
          },
          { id: "enen_bonus_end_pattern_c_min4", label: "パターンC（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "enen_bonus_end_pattern_d_min5", label: "パターンD（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "enen_bonus_end_pattern_e_exact6", label: "パターンE（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "enen_axel_bonus_voice",
        title: "アクセルボーナス終了画面のボイス",
        note: "アクセルボーナス終了画面で特定ボイス発生で残りストック示唆（p-town 4555 / 設定示唆ではないため判別には未反映）",
        items: [{ id: "enen_axel_bonus_voice_full_throttle", label: "『アクセル全開〜』発生（炎炎激闘の残りストック3個以上濃厚）", effect: { type: "none" } }],
      },
      {
        id: "enen_enen_bonus_stock_hint",
        title: "炎炎ボーナス終了画面の残りストック数示唆",
        note: "炎炎激闘中に引いた炎炎ボーナス終了画面で残りストック数を示唆（p-town 4555 / 設定示唆ではないため判別には未反映）",
        items: [
          { id: "enen_enen_bonus_stock_a", label: "ストック示唆A（残りストック2個以上濃厚）", effect: { type: "none" } },
          { id: "enen_enen_bonus_stock_b", label: "ストック示唆B（残りストック3個以上濃厚）", effect: { type: "none" } },
          { id: "enen_enen_bonus_stock_c", label: "ストック示唆C（残りストック5個以上濃厚）", effect: { type: "none" } },
        ],
      },
      {
        id: "enen_enen_battle_stock_hint",
        title: "炎炎激闘ストック示唆",
        note: "特定演出で炎炎激闘の残りストック示唆（p-town 4555 / 設定示唆ではないため判別には未反映）",
        items: [
          {
            id: "enen_enen_battle_stock_10plus",
            label: "炎炎激闘突入時にショウ画面切り裂き発生（残りストック10個以上濃厚）",
            effect: { type: "none" },
          },
          {
            id: "enen_enen_battle_stock_3plus_blue_pillarlamp",
            label: "レバーON時に青柱ランプ発光（レア役からのボーナス当選かつ残りストック3個以上濃厚）",
            effect: { type: "none" },
          },
          {
            id: "enen_enen_battle_stock_3plus_blue_pillarlamp_3rd",
            label: "第3停止時に青柱ランプ発光（1枚役からボーナス濃厚のバトル発展かつ残りストック3個以上濃厚）",
            effect: { type: "none" },
          },
        ],
      },
    ],
  },

  "konami_watakon": {
    machineId: "konami_watakon",
    helpUrl: "https://p-town.dmm.com/machines/4803",
    groups: [
      {
        id: "watakon_at_end",
        title: "AT終了画面（コナミコマンド後）",
        note: "AT終了画面でコナミコマンド入力後の画面で示唆（p-town 4803）",
        items: [
          { id: "watakon_at_end_spring_a", label: "春A（着物）（デフォルト）", effect: { type: "none" } },
          {
            id: "watakon_at_end_summer_even",
            label: "夏（偶数設定示唆）",
            effect: { type: "weight", weights: { 2: 1.05, 4: 1.05, 6: 1.05 } },
          },
          {
            id: "watakon_at_end_spring_b_high",
            label: "春B（軍服）（高設定示唆）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
          },
          { id: "watakon_at_end_autumn_min2", label: "秋（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "watakon_at_end_winter_min4", label: "冬（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "watakon_at_end_newyear_exact6", label: "お正月（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "watakon_bonus_end_mode",
        title: "ボーナス終了画面（モード示唆）",
        note: "通常モード示唆（設定示唆ではないため判別には未反映 / p-town 4803）",
        items: [
          { id: "watakon_bonus_end_kudo", label: "久堂家（デフォルト）", effect: { type: "none" } },
          { id: "watakon_bonus_end_army", label: "陸軍屯所（通常B以上示唆）", effect: { type: "none" } },
          { id: "watakon_bonus_end_usuba", label: "薄刃家（通常B以上濃厚かつ通常Cに期待）", effect: { type: "none" } },
          { id: "watakon_bonus_end_sunset", label: "夕焼け（通常C以上濃厚）", effect: { type: "none" } },
          { id: "watakon_bonus_end_sakura", label: "桜（天国orAT当選濃厚）", effect: { type: "none" } },
        ],
      },
      {
        id: "watakon_bonus_character",
        title: "わた婚ボーナス中：キャラ紹介",
        note: "わた婚メドレー選択時などに発生するキャラ紹介で示唆（p-town 4803）",
        items: [
          { id: "watakon_char_default", label: "下記以外（デフォルト）", effect: { type: "none" } },
          {
            id: "watakon_char_tatsuishi_minoru_odd_high",
            label: "辰石実（奇数かつ高設定示唆）",
            effect: {
              type: "allOf",
              effects: [
                { type: "weight", weights: { 1: 1.05, 3: 1.05, 5: 1.05 } },
                { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
              ],
            },
          },
          {
            id: "watakon_char_hana_odd_high",
            label: "花（奇数かつ高設定示唆）",
            effect: {
              type: "allOf",
              effects: [
                { type: "weight", weights: { 1: 1.05, 3: 1.05, 5: 1.05 } },
                { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
              ],
            },
          },
          {
            id: "watakon_char_oomitobe_masayuki_odd_high",
            label: "大海渡征（奇数かつ高設定示唆）",
            effect: {
              type: "allOf",
              effects: [
                { type: "weight", weights: { 1: 1.05, 3: 1.05, 5: 1.05 } },
                { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
              ],
            },
          },
          {
            id: "watakon_char_takaito_even_high",
            label: "堯人（偶数かつ高設定示唆）",
            effect: {
              type: "allOf",
              effects: [
                { type: "weight", weights: { 2: 1.05, 4: 1.05, 6: 1.05 } },
                { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
              ],
            },
          },
          {
            id: "watakon_char_saimori_shinichi_even_high",
            label: "斎森真一（偶数かつ高設定示唆）",
            effect: {
              type: "allOf",
              effects: [
                { type: "weight", weights: { 2: 1.05, 4: 1.05, 6: 1.05 } },
                { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
              ],
            },
          },
          {
            id: "watakon_char_usuba_sumi_even_high",
            label: "薄刃澄美（偶数かつ高設定示唆）",
            effect: {
              type: "allOf",
              effects: [
                { type: "weight", weights: { 2: 1.05, 4: 1.05, 6: 1.05 } },
                { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
              ],
            },
          },
          { id: "watakon_char_usuba_yoshinari", label: "薄刃義浪", effect: { type: "none" } },
          { id: "watakon_char_kudo_kiyoka_red_min4", label: "久堂清霞（赤）（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "watakon_char_mikado_purple_min5", label: "帝（紫）（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "watakon_char_miyo_gold_exact6", label: "斎森美世（金）（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
    ],
  },

  "newgin_mushoku_tensei": {
    machineId: "newgin_mushoku_tensei",
    helpUrl: "https://p-town.dmm.com/machines/4924",
    groups: [
      {
        id: "mushoku_end_screens",
        title: "ボーナス・AT終了画面",
        note: "枠色などで設定を示唆。奇数/偶数/高設定示唆はソフト示唆（重み付け）として反映。",
        items: [
          { id: "mushoku_end_shitei_even", label: "師弟（白枠・偶数設定示唆）", effect: { type: "weight", weights: { 2: 1.05, 4: 1.05, 6: 1.05 } } },
          { id: "mushoku_end_buena_weak", label: "ブエナ村（青枠・高設定示唆［弱］）", effect: { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } } },
          { id: "mushoku_end_madairiku_strong", label: "魔大陸（赤枠・高設定示唆［強］）", effect: { type: "weight", weights: { 4: 1.2, 5: 1.35, 6: 1.5 } } },
          { id: "mushoku_end_deadend_min2", label: "デッドエンド（銅枠・設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "mushoku_end_kizuna_min4", label: "絆（銀枠・設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "mushoku_end_orsted_exact6", label: "オルステッド（金枠・設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "mushoku_payout",
        title: "特定の獲得枚数表示",
        note: "トータル獲得枚数が規定枚数を超えた際に表示。",
        items: [
          { id: "mushoku_payout_222_over", label: "222枚OVER（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          {
            id: "mushoku_payout_246_over",
            label: "246枚OVER（偶数設定濃厚）",
            effect: { type: "weight", weights: { 2: 1.2, 4: 1.2, 6: 1.2 } },
          },
          { id: "mushoku_payout_333_over", label: "333枚OVER（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "mushoku_payout_444_over", label: "444枚OVER（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "mushoku_payout_456_over", label: "456枚OVER（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "mushoku_payout_555_over", label: "555枚OVER（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "mushoku_payout_666_over", label: "666枚OVER（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "mushoku_cz_zorome_percent",
        title: "無職チャンス中：ゾロ目パーセント",
        note: "押し順ナビ演出時のパーセント表示がゾロ目なら高設定濃厚。",
        items: [
          { id: "mushoku_cz_44", label: "44%（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "mushoku_cz_55", label: "55%（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "mushoku_cz_66", label: "66%（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "mushoku_magic_bonus_story",
        title: "魔術ボーナス中：ストーリー紹介（背景色）",
        note: "話数ごとの背景色で設定を示唆。色別のまとめのみ判別に反映。",
        items: [
          { id: "mushoku_story_white", label: "白（デフォルト）", effect: { type: "none" } },
          { id: "mushoku_story_blue", label: "青（高設定示唆［弱］）", effect: { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } } },
          { id: "mushoku_story_red", label: "赤（高設定示唆［強］）", effect: { type: "weight", weights: { 4: 1.2, 5: 1.35, 6: 1.5 } } },
          { id: "mushoku_story_copper", label: "銅（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "mushoku_story_silver", label: "銀（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "mushoku_story_gold", label: "金（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "mushoku_ending_chars",
        title: "エンディング中：ヒロイン役成立時の出現キャラ",
        note: "スペシャルエピソード中にヒロイン役成立で表示。",
        items: [
          {
            id: "mushoku_ending_rudeus_odd",
            label: "ルーデウス（白/アクアハーティア装備・奇数設定示唆）",
            effect: { type: "weight", weights: { 1: 1.05, 3: 1.05, 5: 1.05 } },
          },
          {
            id: "mushoku_ending_rudeus_even",
            label: "ルーデウス（白/ロキシーの杖装備・偶数設定示唆）",
            effect: { type: "weight", weights: { 2: 1.05, 4: 1.05, 6: 1.05 } },
          },
          { id: "mushoku_ending_roxy_min2", label: "ロキシー（青・設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "mushoku_ending_sylphy_excl2", label: "シルフィ（青・設定2否定）", effect: { type: "excludeSetting", exclude: 2 } },
          { id: "mushoku_ending_eris_excl3", label: "エリス（青・設定3否定）", effect: { type: "excludeSetting", exclude: 3 } },
          { id: "mushoku_ending_zenith_weak", label: "ゼニス（緑・高設定示唆［弱］）", effect: { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } } },
          { id: "mushoku_ending_paul_strong", label: "パウロ（緑・高設定示唆［強］）", effect: { type: "weight", weights: { 4: 1.2, 5: 1.35, 6: 1.5 } } },
          { id: "mushoku_ending_kishirika_min3", label: "キシリカ（赤・設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "mushoku_ending_hitogami_min4", label: "ヒトガミ（赤・設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "mushoku_ending_man_min5", label: "無職の男（赤・設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "mushoku_ending_orsted_exact6", label: "オルステッド（虹・設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "mushoku_round_start_red",
        title: "ラウンド開始画面（赤背景）",
        note: "赤背景はVストックあり濃厚＋設定示唆。設定示唆部分のみ判別に反映。",
        items: [
          {
            id: "mushoku_round_red_heroines_even",
            label: "ヒロイン3人（偶数設定濃厚）",
            effect: { type: "weight", weights: { 2: 1.2, 4: 1.2, 6: 1.2 } },
          },
          { id: "mushoku_round_red_hitogami_min4", label: "ヒトガミ（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "mushoku_round_red_zense_man_min5", label: "前世の男（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "mushoku_round_red_orsted_exact6", label: "オルステッド（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
    ],
  },

  "kyoraku_azuren": {
    machineId: "kyoraku_azuren",
    helpUrl: "https://p-town.dmm.com/machines/4847",
    groups: [
      {
        id: "azuren_trophy",
        title: "玉ちゃんトロフィー",
        note: "AT終了画面などで出現する可能性あり。",
        items: [
          { id: "azuren_trophy_bronze", label: "銅（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "azuren_trophy_silver", label: "銀（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "azuren_trophy_gold", label: "金（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "azuren_trophy_zebra", label: "ゼブラ柄（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "azuren_trophy_rainbow", label: "虹（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "azuren_end_screens",
        title: "海戦ボーナス・AT終了画面（設定示唆）",
        note: "高設定示唆［弱/強］はソフト示唆（重み付け）として反映。",
        items: [
          { id: "azuren_end_default", label: "エンタープライズ/ベルファスト（デフォルト）", effect: { type: "none" } },
          {
            id: "azuren_end_emp_belfast_weak",
            label: "エンタープライズ＆ベルファスト（高設定示唆［弱］）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
          },
          {
            id: "azuren_end_akagi_strong",
            label: "赤城（高設定示唆［強］）",
            effect: { type: "weight", weights: { 4: 1.2, 5: 1.35, 6: 1.5 } },
          },
          { id: "azuren_end_all_min2", label: "全員集合（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "azuren_end_kaga_akagi_min4", label: "加賀＆赤城（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "azuren_end_party_exact6", label: "パーティ（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "azuren_payout",
        title: "特定の獲得枚数表示",
        note: "トータル獲得枚数が規定枚数を超えた際に表示。",
        items: [
          {
            id: "azuren_payout_246_over",
            label: "246 OVER（設定2・4・6濃厚）",
            effect: { type: "weight", weights: { 2: 1.2, 4: 1.2, 6: 1.2 } },
          },
          { id: "azuren_payout_456_over", label: "456 OVER（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "azuren_payout_555_over", label: "555 OVER（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "azuren_payout_666_over", label: "666 OVER（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "azuren_push_voice",
        title: "PUSHボイス",
        note: "発生したボイスをカウント。",
        items: [
          { id: "azuren_voice_none", label: "発生しない（自力でのAT当選）", effect: { type: "none" } },
          { id: "azuren_voice_default", label: "『勝利だ！』（デフォルト）", effect: { type: "none" } },
          { id: "azuren_voice_min5", label: "『たぁーのしいなぁー！』（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "azuren_voice_exact6", label: "『赤城の愛、受け止めてくださるかしら？』（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
    ],
  },

  "sabohani_iza_bancho": {
    machineId: "sabohani_iza_bancho",
    helpUrl: "https://p-town.dmm.com/machines/4805#anc-point",
    groups: [
      {
        id: "iza_at_end_screens",
        title: "AT終了画面",
        note: "偶数/高設定示唆はソフト示唆（重み付け）として反映。『設定◯以上濃厚』や『◯濃厚』は制約として反映。",
        items: [
          { id: "iza_at_end_default", label: "夕焼け（デフォルト）", effect: { type: "none" } },
          {
            id: "iza_at_end_even",
            label: "子育て奮闘（偶数設定示唆）",
            effect: { type: "weight", weights: { 2: 1.08, 4: 1.08, 6: 1.08 } },
          },
          {
            id: "iza_at_end_high",
            label: "護摩行（高設定示唆）",
            effect: { type: "weight", weights: { 4: 1.05, 5: 1.1, 6: 1.15 } },
          },
          { id: "iza_at_end_min2", label: "刺客襲来（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },

          { id: "iza_at_end_min4", label: "小太郎日記（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          {
            id: "iza_at_end_346",
            label: "青龍（武蔵）（設定3・4・6濃厚）",
            effect: {
              type: "allOf",
              effects: [
                { type: "excludeSetting", exclude: 1 },
                { type: "excludeSetting", exclude: 2 },
                { type: "excludeSetting", exclude: 5 },
              ],
            },
          },
          {
            id: "iza_at_end_256",
            label: "朱雀（小次郎）（設定2・5・6濃厚）",
            effect: {
              type: "allOf",
              effects: [
                { type: "excludeSetting", exclude: 1 },
                { type: "excludeSetting", exclude: 3 },
                { type: "excludeSetting", exclude: 4 },
              ],
            },
          },
          { id: "iza_at_end_exact6", label: "秘湯（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
    ],
  },

  "sabohani_yoshimune": {
    machineId: "sabohani_yoshimune",
    helpUrl: "https://p-town.dmm.com/machines/4778",
    groups: [
      {
        id: "yoshimune_bonus_end_hanafuda",
        title: "ボーナス終了画面（花札）",
        note: "高設定示唆［弱/強］はソフト示唆（重み付け）として反映。『設定◯以上濃厚』『設定6濃厚』は制約として反映。",
        items: [
          { id: "yoshi_hanafuda_default", label: "なし（デフォルト）", effect: { type: "none" } },
          {
            id: "yoshi_hanafuda_black_blue_weak",
            label: "黒枠（青短）（高設定示唆［弱］）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
          },
          {
            id: "yoshi_hanafuda_black_red_strong",
            label: "黒枠（赤短）（高設定示唆［強］）",
            effect: { type: "weight", weights: { 4: 1.2, 5: 1.35, 6: 1.5 } },
          },
          { id: "yoshi_hanafuda_bronze_yanagi", label: "銅枠（柳）（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "yoshi_hanafuda_silver_matsu", label: "銀枠（松）（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "yoshi_hanafuda_gold_susuki", label: "金枠（芒）（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "yoshi_hanafuda_pink_sakura", label: "ピンク枠（桜）（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "yoshi_hanafuda_rainbow_kiri", label: "虹枠（桐）（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "yoshimune_bonus_end_push_voice",
        title: "ボーナス終了画面（PUSHボイス）",
        note: "通常モード/鷹狩りモードなどの示唆。設定示唆ではないため現状は表示のみ（判別に未反映）。",
        items: [
          { id: "yoshi_voice_default", label: "吉宗『よっしゃ！』（デフォルト）", effect: { type: "none" } },
          { id: "yoshi_voice_normalb_chance", label: "吉宗『まだまだこれからじゃ！』（通常B以上のチャンス）", effect: { type: "none" } },
          { id: "yoshi_voice_normalb_confirm", label: "吉宗『む！？風向きが変わったぞ…！』（通常B以上濃厚）", effect: { type: "none" } },
          { id: "yoshi_voice_heaven_chance", label: "吉宗『嵐の予感がするぞ！』（天国以上のチャンス）", effect: { type: "none" } },
          { id: "yoshi_voice_heaven_confirm", label: "チビ姫『わくわくだぁー！！』（天国以上濃厚）", effect: { type: "none" } },
          { id: "yoshi_voice_heavenb_bigchance", label: "チビ姫『すごく！すごぉーく楽しみだね！』（天国Bの大チャンス）", effect: { type: "none" } },
          { id: "yoshi_voice_takagari_c_plus", label: "吉宗『鷹の鳴き声が聞こえたぞ！』（鷹狩りモードC以上濃厚）", effect: { type: "none" } },
          { id: "yoshi_voice_takagari_e", label: "吉宗『鷹狩りの準備は万端じゃ！』（鷹狩りモードE濃厚）", effect: { type: "none" } },
          { id: "yoshi_voice_1gren", label: "吉宗『振る舞いもう一丁！』（1G連濃厚）", effect: { type: "none" } },
          { id: "yoshi_voice_ura_takagari", label: "吉宗『鷹狩りの真髄、見せてやる!!』（裏鷹狩り濃厚）", effect: { type: "none" } },
        ],
      },
    ],
  },

  "daito_shake_bonus_trigger": {
    machineId: "daito_shake_bonus_trigger",
    helpUrl: "https://p-town.dmm.com/machines/4893",
    groups: [
      {
        id: "shake_big_end",
        title: "BIG終了画面",
        note: "p-town特集(4566)ではモード/天井示唆が中心。設定判別には使わない前提（表示のみ）。",
        items: [
          { id: "shake_big_end_blue", label: "青", effect: { type: "none" } },
          { id: "shake_big_end_green", label: "緑", effect: { type: "none" } },
          { id: "shake_big_end_red", label: "赤", effect: { type: "none" } },
          { id: "shake_big_end_gold", label: "金", effect: { type: "none" } },
          { id: "shake_big_end_black", label: "黒", effect: { type: "none" } },
        ],
      },
      {
        id: "shake_trophy",
        title: "コパンダトロフィー",
        note: "色で設定を示唆（濃厚系は判別に反映）。",
        items: [
          { id: "shake_trophy_bronze", label: "銅（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "shake_trophy_silver", label: "銀（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "shake_trophy_gold", label: "金（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "shake_trophy_momiji", label: "紅葉柄（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "shake_trophy_rainbow", label: "虹（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "shake_reg_voice",
        title: "REG中（技術介入成功時）ボイス",
        note: "ボイス文言が複数あるため、判別への反映は濃厚/強示唆のみ。",
        items: [
          { id: "shake_reg_voice_default", label: "デフォルト/不明", effect: { type: "none" } },
          {
            id: "shake_reg_voice_high_strong",
            label: "高設定示唆［強］",
            effect: { type: "weight", weights: { 4: 1.2, 5: 1.35, 6: 1.5 } },
          },
          { id: "shake_reg_voice_min4", label: "設定4以上濃厚", effect: { type: "minSetting", min: 4 } },
          { id: "shake_reg_voice_exact6", label: "設定6濃厚", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
    ],
  },

  "daito_crea_hihouden_bt": {
    machineId: "daito_crea_hihouden_bt",
    helpUrl: "https://p-town.dmm.com/machines/4860",
    groups: [
      {
        id: "crea_big_end_stamp",
        title: "BIG終了画面（スタンプ）",
        note: "偶数/高設定示唆はソフト示唆（重み付け）として反映。",
        items: [
          { id: "crea_stamp_default", label: "なし（デフォルト）", effect: { type: "none" } },
          {
            id: "crea_stamp_leon_even",
            label: "レオン（偶数設定示唆）",
            effect: { type: "weight", weights: { 2: 1.08, 4: 1.08, 6: 1.08 } },
          },
          {
            id: "crea_stamp_kodomo_crea_high_weak",
            label: "子供クレア（高設定示唆［弱］）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
          },
          {
            id: "crea_stamp_sharon_high_strong",
            label: "シャロン（高設定示唆［強］）",
            effect: { type: "weight", weights: { 4: 1.2, 5: 1.35, 6: 1.5 } },
          },
        ],
      },
      {
        id: "crea_trophy",
        title: "コパンダトロフィーの示唆",
        note: "BIG終了画面で出現。色で設定を示唆（濃厚系は判別に反映）。",
        items: [
          { id: "crea_trophy_bronze", label: "銅（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "crea_trophy_silver", label: "銀（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "crea_trophy_gold", label: "金（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "crea_trophy_inazuma", label: "イナズマ柄（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "crea_trophy_rainbow", label: "虹（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "crea_reg_card",
        title: "REG中のカード",
        note: "単体のカード色はソフト示唆（重み付け）として反映。濃厚パターンは制約として反映。",
        items: [
          { id: "crea_reg_card_bronze", label: "銅カード（デフォルト）", effect: { type: "none" } },
          {
            id: "crea_reg_card_silver_high_weak",
            label: "銀カード（高設定示唆［弱］）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
          },
          {
            id: "crea_reg_card_gold_high_strong",
            label: "金カード（高設定示唆［強］）",
            effect: { type: "weight", weights: { 4: 1.2, 5: 1.35, 6: 1.5 } },
          },
          { id: "crea_reg_card_red_min4", label: "赤カード（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          {
            id: "crea_reg_card_all_silver_gold_min4",
            label: "オール銀・金カード（設定4以上濃厚）",
            effect: { type: "minSetting", min: 4 },
          },
          {
            id: "crea_reg_card_red_twice_exact6",
            label: "赤カードが2回出現（設定6濃厚）",
            effect: { type: "exactSetting", exact: 6 },
          },
        ],
      },
    ],
  },

  "olympia_toloveru_darkness": {
    machineId: "olympia_toloveru_darkness",
    helpUrl: "https://p-town.dmm.com/machines/4571",
    groups: [
      {
        id: "toloveru_st_end_screen",
        title: "ST（楽園計画）終了画面",
        note: "スタンプは濃厚/強示唆として判別に反映。『美柑』は高設定示唆としてソフト示唆（重み付け）。",
        items: [
          { id: "toloveru_st_end_default", label: "下記以外（示唆ナシ）", effect: { type: "none" } },
          {
            id: "toloveru_st_end_mikan_high_weak",
            label: "美柑（高設定示唆）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
          },
          { id: "toloveru_st_end_kichi_stamp_min3", label: "吉スタンプ（設定3以上）", effect: { type: "minSetting", min: 3 } },
          { id: "toloveru_st_end_ryo_stamp_min4", label: "良スタンプ（設定4以上）", effect: { type: "minSetting", min: 4 } },
          { id: "toloveru_st_end_yu_stamp_min5", label: "優スタンプ（設定5以上）", effect: { type: "minSetting", min: 5 } },
          { id: "toloveru_st_end_kiwami_stamp_exact6", label: "極スタンプ（設定6）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "toloveru_payout_display",
        title: "獲得枚数表示",
        note: "特定の獲得枚数を超えた際に表示。",
        items: [
          { id: "toloveru_payout_456_over", label: "456枚OVER（設定4以上）", effect: { type: "minSetting", min: 4 } },
          { id: "toloveru_payout_555_over", label: "555枚OVER（設定5以上）", effect: { type: "minSetting", min: 5 } },
          { id: "toloveru_payout_666_over", label: "666枚OVER（設定6）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "toloveru_harem_zone_ratio",
        title: "［ハーレムモード中］枚数決定ゾーンの比率",
        note: "発生したゾーンをカウント。解析の選択比率をソフト示唆（重み付け）として反映（確定系ではありません）。",
        items: [
          {
            id: "toloveru_harem_zone_whisper",
            label: "ウィスパー演出",
            effect: { type: "weight", weights: { 2: 0.489, 3: 0.568, 4: 0.946, 5: 1.12, 6: 1.877 } },
          },
          {
            id: "toloveru_harem_zone_aisupu",
            label: "愛すぷラッシュ",
            effect: { type: "weight", weights: { 2: 1.035, 3: 1.029, 4: 1.004, 5: 0.992, 6: 0.94 } },
          },
        ],
      },
    ],
  },

  "heiwa_toloveru_darkness_trance_v87": {
    machineId: "heiwa_toloveru_darkness_trance_v87",
    helpUrl: "https://p-town.dmm.com/machines/4806",
    groups: [
      {
        id: "toloveru_trance_st_end_screen",
        title: "ST（楽園計画）終了画面",
        note: "スタンプは濃厚/強示唆として判別に反映。『美柑』は高設定示唆としてソフト示唆（重み付け）。『メア』は設定5示唆として重み付け。",
        items: [
          { id: "toloveru_trance_st_end_default", label: "下記以外（示唆ナシ）", effect: { type: "none" } },
          {
            id: "toloveru_trance_st_end_mikan_high_weak",
            label: "美柑（高設定示唆）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
          },
          {
            id: "toloveru_trance_st_end_mea_setting5_hint",
            label: "メア（設定5示唆）",
            effect: { type: "weight", weights: { 5: 1.25, 6: 1.05 } },
          },
          {
            id: "toloveru_trance_st_end_kichi_stamp_min3",
            label: "吉スタンプ（設定3以上）",
            effect: { type: "minSetting", min: 3 },
          },
          {
            id: "toloveru_trance_st_end_ryo_stamp_min4",
            label: "良スタンプ（設定4以上）",
            effect: { type: "minSetting", min: 4 },
          },
          {
            id: "toloveru_trance_st_end_yu_stamp_min5",
            label: "優スタンプ（設定5以上）",
            effect: { type: "minSetting", min: 5 },
          },
          {
            id: "toloveru_trance_st_end_kiwami_stamp_exact6",
            label: "極スタンプ（設定6）",
            effect: { type: "exactSetting", exact: 6 },
          },
        ],
      },
      {
        id: "toloveru_trance_payout_display",
        title: "獲得枚数表示",
        note: "特定の獲得枚数を超えた際に表示。",
        items: [
          { id: "toloveru_trance_payout_456_over", label: "456枚OVER（設定4以上）", effect: { type: "minSetting", min: 4 } },
          { id: "toloveru_trance_payout_555_over", label: "555枚OVER（設定5以上）", effect: { type: "minSetting", min: 5 } },
          { id: "toloveru_trance_payout_666_over", label: "666枚OVER（設定6）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "toloveru_trance_upperst_zone_ratio",
        title: "［上位ST中］枚数決定ゾーンの比率",
        note: "発生したゾーンをカウント。解析の選択比率をソフト示唆（重み付け）として反映（確定系ではありません）。",
        items: [
          {
            id: "toloveru_trance_upperst_zone_whisper",
            label: "ウィスパー演出",
            effect: { type: "weight", weights: { 2: 0.452, 3: 0.537, 4: 0.876, 5: 1.13, 6: 2.006 } },
          },
          {
            id: "toloveru_trance_upperst_zone_aisupu",
            label: "愛すぷラッシュ",
            effect: { type: "weight", weights: { 2: 1.042, 3: 1.036, 4: 1.009, 5: 0.99, 6: 0.923 } },
          },
        ],
      },
    ],
  },

  "heiwa_zenigata5": {
    machineId: "heiwa_zenigata5",
    helpUrl: "https://p-town.dmm.com/machines/4877",
    groups: [
      {
        id: "zenigata5_bonus_end_stamp",
        title: "ボーナス終了画面（スタンプ）",
        note: "吉/良/優/極スタンプで設定を示唆。濃厚系のみ判別に反映。",
        items: [
          { id: "zenigata5_bonus_end_default", label: "下記以外（示唆ナシ）", effect: { type: "none" } },
          { id: "zenigata5_bonus_end_kichi_min3", label: "吉スタンプ（設定3以上）", effect: { type: "minSetting", min: 3 } },
          { id: "zenigata5_bonus_end_ryo_min4", label: "良スタンプ（設定4以上）", effect: { type: "minSetting", min: 4 } },
          { id: "zenigata5_bonus_end_yu_min5", label: "優スタンプ（設定5以上）", effect: { type: "minSetting", min: 5 } },
          { id: "zenigata5_bonus_end_kiwami_exact6", label: "極スタンプ（設定6）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
    ],
  },

  "heiwa_lupin_daikoukai_hihou": {
    machineId: "heiwa_lupin_daikoukai_hihou",
    helpUrl: "https://p-town.dmm.com/machines/4689",
    groups: [
      {
        id: "lupin_daikoukai_at_end_screen",
        title: "AT終了画面",
        note: "スタンプは濃厚系として判別に反映。『ルパン一味』は高設定示唆としてソフト示唆（重み付け）。",
        items: [
          { id: "lupin_daikoukai_at_end_default", label: "ルパン逃走（デフォルト）", effect: { type: "none" } },
          {
            id: "lupin_daikoukai_at_end_party_high_weak",
            label: "ルパン一味（高設定示唆）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
          },
          { id: "lupin_daikoukai_at_end_ka_min2", label: "可スタンプ（設定2以上）", effect: { type: "minSetting", min: 2 } },
          { id: "lupin_daikoukai_at_end_kichi_min3", label: "吉スタンプ（設定3以上）", effect: { type: "minSetting", min: 3 } },
          { id: "lupin_daikoukai_at_end_ryo_min4", label: "良スタンプ（設定4以上）", effect: { type: "minSetting", min: 4 } },
          { id: "lupin_daikoukai_at_end_yu_min5", label: "優スタンプ（設定5以上）", effect: { type: "minSetting", min: 5 } },
          { id: "lupin_daikoukai_at_end_kiwami_exact6", label: "極スタンプ（設定6）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "lupin_daikoukai_at_round_premium",
        title: "特殊なラウンド開始画面",
        note: "AT中にプレミアム画面が表示されると設定5以上/設定6濃厚。",
        items: [
          { id: "lupin_daikoukai_round_premium_none", label: "なし", effect: { type: "none" } },
          { id: "lupin_daikoukai_round_premium_zenigata_min5", label: "主役は銭形（設定5以上）", effect: { type: "minSetting", min: 5 } },
          { id: "lupin_daikoukai_round_premium_fujiko2_exact6", label: "不二子2（設定6）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "lupin_daikoukai_bonus_end_voice",
        title: "初当りボーナス終了時のボイス",
        note: "ボーナス終了時にPUSHボタンで発生。示唆内容に合わせて選択。",
        items: [
          { id: "lupin_daikoukai_bonus_voice_default", label: "デフォルト", effect: { type: "none" } },
          {
            id: "lupin_daikoukai_bonus_voice_high_weak",
            label: "高設定示唆［弱］",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
          },
          {
            id: "lupin_daikoukai_bonus_voice_high_strong",
            label: "高設定示唆［強］",
            effect: { type: "weight", weights: { 4: 1.2, 5: 1.35, 6: 1.5 } },
          },
          { id: "lupin_daikoukai_bonus_voice_min4", label: "設定4以上", effect: { type: "minSetting", min: 4 } },
          { id: "lupin_daikoukai_bonus_voice_exact6", label: "設定6", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
    ],
  },

  "heiwa_fujiko_bt": {
    machineId: "heiwa_fujiko_bt",
    helpUrl: "https://p-town.dmm.com/machines/4921",
    groups: [
      {
        id: "fujiko_bt_bonus_end_stamp",
        title: "BIG・スーパーBIG終了画面（スタンプ）",
        note: "可/良/優/極スタンプで設定を示唆。濃厚系のみ判別に反映。",
        items: [
          { id: "fujiko_bt_bonus_end_default", label: "デフォルト（示唆ナシ）", effect: { type: "none" } },
          { id: "fujiko_bt_bonus_end_ka_min2", label: "可（設定2以上）", effect: { type: "minSetting", min: 2 } },
          { id: "fujiko_bt_bonus_end_ryo_min4", label: "良（設定4以上）", effect: { type: "minSetting", min: 4 } },
          { id: "fujiko_bt_bonus_end_yu_min5", label: "優（設定5以上）", effect: { type: "minSetting", min: 5 } },
          { id: "fujiko_bt_bonus_end_kiwami_exact6", label: "極（設定6）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "fujiko_bt_judge",
        title: "ジャッジ演出（連続演出）",
        note: "発生した場合は濃厚系として判別に反映。",
        items: [
          { id: "fujiko_bt_judge_none", label: "なし", effect: { type: "none" } },
          { id: "fujiko_bt_judge_pachinko_8_min2", label: "パチンコジャッジ：8絵柄揃い（設定2以上）", effect: { type: "minSetting", min: 2 } },
          { id: "fujiko_bt_judge_card_haruruna_min4", label: "カードジャッジ：ハルルナPUSH（設定4以上）", effect: { type: "minSetting", min: 4 } },
        ],
      },
      {
        id: "fujiko_bt_adjust_voice",
        title: "枚数調整成功時のボイス",
        note: "ボイスの示唆内容に合わせて選択。",
        items: [
          { id: "fujiko_bt_adjust_voice_default", label: "ルパン『狙った獲物は逃がさねぇぜ』（示唆ナシ）", effect: { type: "none" } },
          {
            id: "fujiko_bt_adjust_voice_jigen_odd",
            label: "次元『ド派手にぶっ放すぜ』（奇数示唆）",
            effect: { type: "weight", weights: { 1: 1.05, 3: 1.05, 5: 1.05 } },
          },
          {
            id: "fujiko_bt_adjust_voice_zenigata_even",
            label: "銭形『がっはっはっは～年貢の納め時だな～』（偶数示唆）",
            effect: { type: "weight", weights: { 2: 1.05, 4: 1.05, 6: 1.05 } },
          },
          {
            id: "fujiko_bt_adjust_voice_goemon_high",
            label: "五ェ門『斬鉄剣に斬れぬものはない』（高設定示唆）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
          },
          { id: "fujiko_bt_adjust_voice_fujiko_min5", label: "不二子『さすがだわ』（設定5以上）", effect: { type: "minSetting", min: 5 } },
        ],
      },
      {
        id: "fujiko_bt_reg_scenario",
        title: "REG中のキャラ紹介シナリオ",
        note: "奇数/偶数/高設定示唆はソフト示唆（重み付け）。『設定◯以上』は濃厚系として判別に反映。",
        items: [
          { id: "fujiko_bt_reg_scenario_default", label: "下記以外", effect: { type: "none" } },
          {
            id: "fujiko_bt_reg_scenario_odd_basic",
            label: "ルパン→次元→五エ門→不二子（奇数示唆）",
            effect: { type: "weight", weights: { 1: 1.05, 3: 1.05, 5: 1.05 } },
          },
          {
            id: "fujiko_bt_reg_scenario_even_basic",
            label: "ルパン→銭形→五エ門→不二子（偶数示唆）",
            effect: { type: "weight", weights: { 2: 1.05, 4: 1.05, 6: 1.05 } },
          },
          {
            id: "fujiko_bt_reg_scenario_even_jigen_zenigata",
            label: "ルパン→次元→銭形→不二子（偶数示唆）",
            effect: { type: "weight", weights: { 2: 1.05, 4: 1.05, 6: 1.05 } },
          },
          {
            id: "fujiko_bt_reg_scenario_high_weak_odd",
            label: "ルパン→次元→五エ門→赤不二子（高設定示唆［弱］＋奇数示唆）",
            effect: {
              type: "allOf",
              effects: [
                { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
                { type: "weight", weights: { 1: 1.03, 3: 1.03, 5: 1.03 } },
              ],
            },
          },
          {
            id: "fujiko_bt_reg_scenario_high_weak_even_zenigata",
            label: "ルパン→銭形→五エ門→赤不二子（高設定示唆［弱］＋偶数示唆）",
            effect: {
              type: "allOf",
              effects: [
                { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
                { type: "weight", weights: { 2: 1.03, 4: 1.03, 6: 1.03 } },
              ],
            },
          },
          {
            id: "fujiko_bt_reg_scenario_high_weak_even_jigen",
            label: "ルパン→次元→銭形→赤不二子（高設定示唆［弱］＋偶数示唆）",
            effect: {
              type: "allOf",
              effects: [
                { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
                { type: "weight", weights: { 2: 1.03, 4: 1.03, 6: 1.03 } },
              ],
            },
          },
          {
            id: "fujiko_bt_reg_scenario_high_strong",
            label: "赤ルパン→次元→五エ門→不二子（高設定示唆［強］）",
            effect: { type: "weight", weights: { 4: 1.2, 5: 1.35, 6: 1.5 } },
          },
          {
            id: "fujiko_bt_reg_scenario_min2_odd",
            label: "ルパン→次元→五エ門→赤3人（設定2以上＋奇数示唆）",
            effect: {
              type: "allOf",
              effects: [{ type: "minSetting", min: 2 }, { type: "weight", weights: { 1: 1.03, 3: 1.03, 5: 1.03 } }],
            },
          },
          {
            id: "fujiko_bt_reg_scenario_min2_even_zenigata",
            label: "ルパン→銭形→五エ門→赤3人（設定2以上＋偶数示唆）",
            effect: {
              type: "allOf",
              effects: [{ type: "minSetting", min: 2 }, { type: "weight", weights: { 2: 1.03, 4: 1.03, 6: 1.03 } }],
            },
          },
          {
            id: "fujiko_bt_reg_scenario_min2_even_jigen_zenigata",
            label: "ルパン→次元→銭形→赤3人（設定2以上＋偶数示唆）",
            effect: {
              type: "allOf",
              effects: [{ type: "minSetting", min: 2 }, { type: "weight", weights: { 2: 1.03, 4: 1.03, 6: 1.03 } }],
            },
          },
          {
            id: "fujiko_bt_reg_scenario_min4_odd",
            label: "赤ルパン→次元→五エ門→赤不二子（設定4以上＋奇数示唆）",
            effect: {
              type: "allOf",
              effects: [{ type: "minSetting", min: 4 }, { type: "weight", weights: { 1: 1.03, 3: 1.03, 5: 1.03 } }],
            },
          },
          {
            id: "fujiko_bt_reg_scenario_min5_even",
            label: "赤ルパン→次元→五エ門→赤3人（設定5以上＋偶数示唆）",
            effect: {
              type: "allOf",
              effects: [{ type: "minSetting", min: 5 }, { type: "weight", weights: { 2: 1.03, 4: 1.03, 6: 1.03 } }],
            },
          },
        ],
      },
    ],
  },

  "heiwa_sengoku_otome4": {
    machineId: "heiwa_sengoku_otome4",
    helpUrl: "https://p-town.dmm.com/machines/4395",
    groups: [
      {
        id: "sengoku_otome4_at_end_screen",
        title: "AT終了画面（スタンプ）",
        note: "スタンプは濃厚系として判別に反映。キャラ構成による示唆はソフト示唆（重み付け）として反映。",
        items: [
          { id: "sengoku_otome4_at_end_default", label: "下記以外（デフォルト）", effect: { type: "none" } },
          {
            id: "sengoku_otome4_at_end_s35",
            label: "ヒデヨシ＆カンスケ＆シンゲン＆ノブナガ（設定3・5示唆）",
            effect: { type: "weight", weights: { 3: 1.08, 5: 1.08 } },
          },
          {
            id: "sengoku_otome4_at_end_s24",
            label: "ヨシモト＆ケンシン＆ウジマサ＆イエヤス（設定2・4示唆）",
            effect: { type: "weight", weights: { 2: 1.08, 4: 1.08 } },
          },
          {
            id: "sengoku_otome4_at_end_high_weak",
            label: "モトチカ＆ソウリン＆ドウセツ＆モトナリ（高設定示唆［弱］）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
          },
          { id: "sengoku_otome4_at_end_ka_min2", label: "可スタンプ（設定2以上）", effect: { type: "minSetting", min: 2 } },
          { id: "sengoku_otome4_at_end_kichi_min3", label: "吉スタンプ（設定3以上）", effect: { type: "minSetting", min: 3 } },
          { id: "sengoku_otome4_at_end_ryo_min4", label: "良スタンプ（設定4以上）", effect: { type: "minSetting", min: 4 } },
          { id: "sengoku_otome4_at_end_yu_min5", label: "優スタンプ（設定5以上）", effect: { type: "minSetting", min: 5 } },
          { id: "sengoku_otome4_at_end_kiwami_exact6", label: "極スタンプ（設定6）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "sengoku_otome4_payout_display",
        title: "特定の獲得枚数表示",
        note: "獲得枚数が規定枚数を超えた際に表示。",
        items: [
          { id: "sengoku_otome4_payout_222_over", label: "222枚OVER（設定2以上）", effect: { type: "minSetting", min: 2 } },
          { id: "sengoku_otome4_payout_333_over", label: "333枚OVER（設定3以上）", effect: { type: "minSetting", min: 3 } },
          { id: "sengoku_otome4_payout_444_over", label: "444枚OVER（設定4以上）", effect: { type: "minSetting", min: 4 } },
          { id: "sengoku_otome4_payout_555_over", label: "555枚OVER（設定5以上）", effect: { type: "minSetting", min: 5 } },
          { id: "sengoku_otome4_payout_666_over", label: "666枚OVER（設定6）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "sengoku_otome4_episode_type",
        title: "エピソードボーナス：エピソードの種類",
        note: "奇数/偶数/高設定示唆はソフト示唆（重み付け）として反映。",
        items: [
          { id: "sengoku_otome4_episode_default", label: "下記以外", effect: { type: "none" } },
          {
            id: "sengoku_otome4_episode_kansuke_odd",
            label: "カンスケ（奇数設定示唆）",
            effect: { type: "weight", weights: { 1: 1.05, 3: 1.05, 5: 1.05 } },
          },
          {
            id: "sengoku_otome4_episode_sourin_even",
            label: "ソウリン（偶数設定示唆）",
            effect: { type: "weight", weights: { 2: 1.05, 4: 1.05, 6: 1.05 } },
          },
          {
            id: "sengoku_otome4_episode_ujimasa_high",
            label: "ウジマサ（高設定示唆）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
          },
          {
            id: "sengoku_otome4_episode_hideaki_high",
            label: "ヒデアキ（高設定示唆）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.15, 6: 1.2 } },
          },
        ],
      },
      {
        id: "sengoku_otome4_otome_attack_direct",
        title: "乙女アタック直撃（通常時）",
        note:
          "直撃当選率は設定差あり。フォームの『チャンス目/強チェリー回数』『乙女アタック直撃当選回数』を入力すると、設定別の当選率で判別に反映されます（この示唆カウントは記録用）。",
        items: [
          { id: "sengoku_otome4_oa_direct_none", label: "直撃なし/未確認", effect: { type: "none" } },
          {
            id: "sengoku_otome4_oa_direct_by_chance_or_strong",
            label: "直撃当選（チャンス目/強チェリー経由）",
            effect: { type: "none" },
          },
          {
            id: "sengoku_otome4_oa_direct_reel_lock2",
            label: "直撃（リールロック2段階）※当選率50%（設定差なし）",
            effect: { type: "none" },
          },
        ],
      },
    ],
  },

  "paon_hihouden": {
    machineId: "paon_hihouden",
    helpUrl: "https://p-town.dmm.com/machines/4929",
    groups: [
      {
        id: "hihouden_trophy",
        title: "コパンダトロフィーの示唆",
        note: "ボーナス終了画面で出現。色で設定を示唆（濃厚系のみ判別に反映）。",
        items: [
          { id: "hihouden_trophy_bronze", label: "銅（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "hihouden_trophy_silver", label: "銀（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "hihouden_trophy_gold", label: "金（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "hihouden_trophy_inazuma", label: "稲妻柄（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "hihouden_trophy_rainbow", label: "虹（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "hihouden_payout_display",
        title: "特定の獲得枚数表示",
        note: "獲得枚数が規定枚数を超えた際に表示。",
        items: [
          {
            id: "hihouden_payout_246_over",
            label: "246 OVER（偶数設定濃厚）",
            effect: { type: "weight", weights: { 2: 1.08, 4: 1.08, 6: 1.08 } },
          },
          { id: "hihouden_payout_456_over", label: "456 OVER（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "hihouden_payout_666_over", label: "666 OVER（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "hihouden_news",
        title: "秘宝伝ニュース（時刻）",
        note: "リール下部のニュース演出の放送開始時間で示唆。",
        items: [
          {
            id: "hihouden_news_246",
            label: "2時46分（偶数設定濃厚）",
            effect: { type: "weight", weights: { 2: 1.08, 4: 1.08, 6: 1.08 } },
          },
          { id: "hihouden_news_456", label: "4時56分（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
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
        items: [{ id: "kodaigamen_seen", label: "初代の画面が表示（設定5以上確定）", effect: { type: "minSetting", min: 5 } }],
      },
      {
        id: "payout_milestone",
        title: "特定枚数表示",
        items: [
          { id: "payout_over_456", label: "456枚突破（設定4以上）", effect: { type: "minSetting", min: 4 } },
          { id: "payout_over_666", label: "666枚突破（設定6）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
    ],
  },

  "smart-hokuto-no-ken-tensei-2": {
    machineId: "smart-hokuto-no-ken-tensei-2",
    helpUrl: "https://p-town.dmm.com/machines/4909#anc-point",
    groups: [
      {
        id: "lamp_b",
        title: "100G消化ごとの筐体上部ランプB（設定示唆）",
        note:
          "通常時を100G消化するごとに点灯。ATの前兆中や天破の刻中に100G到達した場合は持ち越され、当該状態終了後に示唆が発生。",
        items: [
          { id: "lamp_b_white_on", label: "白点灯（設定2・4示唆）", effect: { type: "weight", weights: { 2: 1.3, 4: 1.3 } } },
          { id: "lamp_b_white_flash", label: "白点滅（設定3・5示唆）", effect: { type: "weight", weights: { 3: 1.3, 5: 1.3 } } },
          { id: "lamp_b_lightblue_on", label: "水色点灯（高設定示唆［弱］）", effect: { type: "weight", weights: { 4: 1.1, 5: 1.2, 6: 1.3 } } },
          { id: "lamp_b_lightblue_flash", label: "水色点滅（高設定示唆［強］）", effect: { type: "weight", weights: { 4: 1.2, 5: 1.35, 6: 1.5 } } },
          { id: "lamp_b_yellowgreen_on", label: "黄緑点灯（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "lamp_b_yellowgreen_flash", label: "黄緑点滅（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "lamp_b_gold_on", label: "金点灯（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "sammy_trophy",
        title: "サミートロフィー",
        note: "AT終了画面で出現。",
        items: [
          { id: "trophy_gold", label: "金（設定4以上）", effect: { type: "minSetting", min: 4 } },
          { id: "trophy_kirin", label: "キリン柄（設定5以上）", effect: { type: "minSetting", min: 5 } },
          { id: "trophy_rainbow", label: "虹（設定6）", effect: { type: "exactSetting", exact: 6 } },
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

  "smart-darling-in-the-franxx": {
    machineId: "smart-darling-in-the-franxx",
    helpUrl: "https://p-town.dmm.com/machines/4855",
    groups: [
      {
        id: "dinfranxx_bonus_high_end",
        title: "ボーナス高確終了画面",
        note:
          "ボーナス高確終了画面で示唆。『復活』はリザルト画面でのボーナス当選を指す想定。復活時の示唆は“復活時のみ”の項目にカウント。",
        items: [
          { id: "dinfranxx_end_default", label: "後ろ姿（デフォルト）", effect: { type: "none" } },
          {
            id: "dinfranxx_end_ehon_even",
            label: "絵本（偶数設定濃厚）",
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
            id: "dinfranxx_end_ehon_shima_excl_124",
            label: "絵本の島（設定1・2・4否定）",
            effect: {
              type: "allOf",
              effects: [
                { type: "excludeSetting", exclude: 1 },
                { type: "excludeSetting", exclude: 2 },
                { type: "excludeSetting", exclude: 4 },
              ],
            },
          },
          {
            id: "dinfranxx_end_child_02_min4",
            label: "幼少期ゼロツー（設定4以上濃厚）",
            effect: { type: "minSetting", min: 4 },
          },
          {
            id: "dinfranxx_end_child_02_excl1_on_revive",
            label: "幼少期ゼロツー（復活時のみ：設定1否定）",
            effect: { type: "excludeSetting", exclude: 1 },
          },
          {
            id: "dinfranxx_end_hiro_02_exact6",
            label: "ヒロ＆ゼロツー（設定6濃厚）",
            effect: { type: "exactSetting", exact: 6 },
          },
          {
            id: "dinfranxx_end_hiro_02_min4_on_revive",
            label: "ヒロ＆ゼロツー（復活時のみ：設定4以上濃厚）",
            effect: { type: "minSetting", min: 4 },
          },
        ],
      },
      {
        id: "dinfranxx_nami_trophy",
        title: "ナミちゃんトロフィー",
        note: "ボーナス高確終了画面で出現。",
        items: [
          {
            id: "dinfranxx_trophy_black",
            label: "黒（次回：銅以上が出現）",
            effect: { type: "minSetting", min: 2 },
          },
          { id: "dinfranxx_trophy_copper", label: "銅（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "dinfranxx_trophy_silver", label: "銀（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "dinfranxx_trophy_gold", label: "金（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "dinfranxx_trophy_franxx", label: "フランクス柄（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "dinfranxx_trophy_rainbow", label: "虹（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "dinfranxx_connect_chance_initial_level",
        title: "コネクトチャンス（CZ）初期レベル",
        note:
          "CZ開始時の初期レベル。表の『初期レベル振り分け』をそのまま重み付けに変換して判別に反映（レベル4・5ほど高設定寄り）。",
        items: [
          {
            id: "dinfranxx_cz_lv1",
            label: "レベル1（白）",
            effect: {
              type: "weight",
              weights: { 1: 1.028, 2: 1.028, 3: 1.028, 4: 1.002, 5: 0.978, 6: 0.937 },
            },
          },
          {
            id: "dinfranxx_cz_lv2",
            label: "レベル2（青）",
            effect: {
              type: "weight",
              weights: { 1: 0.991, 2: 0.991, 3: 0.991, 4: 0.999, 5: 1.007, 6: 1.019 },
            },
          },
          {
            id: "dinfranxx_cz_lv3",
            label: "レベル3（黄）",
            effect: {
              type: "weight",
              weights: { 1: 0.834, 2: 0.834, 3: 0.834, 4: 0.994, 5: 1.118, 6: 1.385 },
            },
          },
          {
            id: "dinfranxx_cz_lv4",
            label: "レベル4（緑）",
            effect: {
              type: "weight",
              weights: { 1: 0.667, 2: 0.667, 3: 0.667, 4: 1.0, 5: 1.25, 6: 1.75 },
            },
          },
          {
            id: "dinfranxx_cz_lv5",
            label: "レベル5（赤）",
            effect: {
              type: "weight",
              weights: { 1: 0.571, 2: 0.571, 3: 0.571, 4: 1.0, 5: 1.286, 6: 2.0 },
            },
          },
        ],
      },
      {
        id: "dinfranxx_bonus_hit_level",
        title: "ボーナス当選レベル（表示のみ）",
        note:
          "レベルごとの当選率は『各レベルでの試行回数』が分からないと設定判別へ厳密に反映できないため、ここはメモ用途（判別に未反映）。精度優先のため反映を外しています。",
        items: [
          { id: "dinfranxx_bonus_lv1", label: "レベル1（白）", effect: { type: "none" } },
          { id: "dinfranxx_bonus_lv2", label: "レベル2（青）", effect: { type: "none" } },
          { id: "dinfranxx_bonus_lv3", label: "レベル3（黄）", effect: { type: "none" } },
          { id: "dinfranxx_bonus_lv4", label: "レベル4（緑）", effect: { type: "none" } },
          { id: "dinfranxx_bonus_lv5", label: "レベル5（赤）", effect: { type: "none" } },
          { id: "dinfranxx_bonus_lvmax", label: "レベルMAX（虹）", effect: { type: "none" } },
        ],
      },
      {
        id: "dinfranxx_ending_rare_card",
        title: "レア役成立時：カード（エンディング中）",
        note:
          "エンディング中のレア役成立時にPUSHで出現するカードで設定を示唆。ゼロツー（赤）は“1回につきどちらか片方”にカウント（両方に入れない）。",
        items: [
          { id: "dinfranxx_card_ikuno_default", label: "イクノ（白：デフォルト）", effect: { type: "none" } },
          {
            id: "dinfranxx_card_miku_odd_weak",
            label: "ミク（青：奇数設定示唆［弱］）",
            effect: { type: "weight", weights: { 1: 1.06, 3: 1.06, 5: 1.06 } },
          },
          {
            id: "dinfranxx_card_kokoro_high_weak",
            label: "ココロ（黄：高設定示唆［弱］）",
            effect: { type: "weight", weights: { 4: 1.06, 5: 1.1, 6: 1.14 } },
          },
          {
            id: "dinfranxx_card_ichigo_high_mid",
            label: "イチゴ（緑：高設定示唆［中］）",
            effect: { type: "weight", weights: { 4: 1.12, 5: 1.2, 6: 1.28 } },
          },
          {
            id: "dinfranxx_card_02_red_min2",
            label: "ゼロツー（赤：設定2以上濃厚）※どちらか一方",
            effect: { type: "minSetting", min: 2 },
          },
          {
            id: "dinfranxx_card_02_red_even_strong",
            label: "ゼロツー（赤：偶数設定示唆［強］）※どちらか一方",
            effect: { type: "weight", weights: { 2: 1.08, 4: 1.08, 6: 1.08 } },
          },
          {
            id: "dinfranxx_card_strelizia_rainbow_exact6",
            label: "ストレリチア（虹：設定6濃厚）",
            effect: { type: "exactSetting", exact: 6 },
          },
        ],
      },
    ],
  },
};

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
  hintConfigs["smart-neo-planet"] = {
    machineId: "smart-neo-planet",
    groups: [
      {
        id: "neo_planet_kerot_trophy",
        title: "ケロットトロフィー",
        note: "ボーナス終了時などに出現。『設定◯以上』は制約として反映。",
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
  },



  hintConfigs["smart-monkey-v"] = {
    machineId: "smart-monkey-v",
    helpUrl: "https://p-town.dmm.com/machines/4450",
    groups: [
      {
        id: "monkeyv_payout_display",
        title: "獲得枚数表示（特定表示）",
        note: "獲得枚数表示で設定を示唆。",
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
        items: [
          { id: "monkeyv_enoki_purple", label: "榎木 紫（設定4以上）", effect: { type: "minSetting", min: 4 } },
          { id: "monkeyv_enoki_red", label: "榎木 赤（設定2/4/6）", effect: { type: "weight", weights: { 2: 1.2, 4: 1.2, 6: 1.2 } } },
        ],
      },
      {
        id: "monkeyv_hatano_ratio",
        title: "波多野A/B比率（参考表示）",
        note: "設定判別には未反映。A/B比率は参考用。",
        items: [
          { id: "monkeyv_hatano_a", label: "波多野A", effect: { type: "none" } },
          { id: "monkeyv_hatano_b", label: "波多野B", effect: { type: "none" } },
        ],
      },
    ],
  };

  hintConfigs["smart-monster-hunter-rise"] = {
    machineId: "smart-monster-hunter-rise",
    helpUrl: "https://p-town.dmm.com/machines/4676",
    groups: [
      {
        id: "mhrise_bonus_voice",
        title: "ボーナス揃い時のボイス",
        note: "『設定◯以上/濃厚/否定』は制約として反映。奇数/偶数/高設定示唆はソフト示唆（重み付け）として反映。",
        items: [
          { id: "mhrise_voice_default", label: "その他（デフォルト/不明）", effect: { type: "none" } },
          { id: "mhrise_voice_entaraion", label: "紫7の1確ボイスがエンタライオン（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
          { id: "mhrise_voice_utsushi", label: "仲間ボイスがウツシ（設定5以上）", effect: { type: "minSetting", min: 5 } },
          { id: "mhrise_voice_hinoe", label: "仲間ボイスがヒノエ（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "mhrise_entara_trophy",
        title: "エンタトロフィー",
        note: "AT中などに出現。『設定◯以上/6濃厚』は制約として反映。",
        items: [
          { id: "mhrise_trophy_none", label: "なし/不明", effect: { type: "none" } },
          { id: "mhrise_trophy_copper", label: "銅（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "mhrise_trophy_silver", label: "銀（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "mhrise_trophy_gold", label: "金（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "mhrise_trophy_momiji", label: "紅葉柄（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "mhrise_trophy_rainbow", label: "虹（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "mhrise_bonus_confirm",
        title: "ボーナス確定画面（キャラ）",
        note: "ボーナス確定画面に登場するキャラで設定を示唆。",
        items: [
          { id: "mhrise_confirm_default", label: "その他（デフォルト/不明）", effect: { type: "none" } },
          { id: "mhrise_confirm_wadoumaru", label: "MG-滅-ワドウ丸（奇数設定示唆）", effect: { type: "weight", weights: { 1: 1.1, 3: 1.1, 5: 1.1 } } },
          { id: "mhrise_confirm_luke", label: "ルーク（奇数設定示唆）", effect: { type: "weight", weights: { 1: 1.1, 3: 1.1, 5: 1.1 } } },
          { id: "mhrise_confirm_haruto", label: "HARUTO（奇数設定示唆）", effect: { type: "weight", weights: { 1: 1.1, 3: 1.1, 5: 1.1 } } },
          { id: "mhrise_confirm_ash", label: "アッシュ（偶数設定示唆）", effect: { type: "weight", weights: { 2: 1.1, 4: 1.1, 6: 1.1 } } },
          { id: "mhrise_confirm_mimi", label: "Mimi★chan（偶数設定示唆）", effect: { type: "weight", weights: { 2: 1.1, 4: 1.1, 6: 1.1 } } },
          { id: "mhrise_confirm_tsubaki", label: "つばき（偶数設定示唆）", effect: { type: "weight", weights: { 2: 1.1, 4: 1.1, 6: 1.1 } } },
          { id: "mhrise_confirm_you", label: "YOU（高設定示唆）", effect: { type: "weight", weights: { 4: 1.12, 5: 1.2, 6: 1.28 } } },
          { id: "mhrise_confirm_lara_miranda", label: "Lara&ミランダ&隊長（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
        ],
      },
      {
        id: "mhrise_bonus_end",
        title: "ボーナス終了画面（キャラ）",
        note: "ボーナス終了画面に登場するキャラで設定を示唆。天国系の示唆は現状は表示のみ（判別には未反映）。",
        items: [
          { id: "mhrise_end_default", label: "その他（デフォルト/不明）", effect: { type: "none" } },

          { id: "mhrise_end_wadoumaru", label: "MG-滅-ワドウ丸（奇数設定示唆）", effect: { type: "weight", weights: { 1: 1.1, 3: 1.1, 5: 1.1 } } },
          { id: "mhrise_end_luke", label: "ルーク（奇数設定示唆）", effect: { type: "weight", weights: { 1: 1.1, 3: 1.1, 5: 1.1 } } },
          { id: "mhrise_end_haruto", label: "HARUTO（奇数設定示唆）", effect: { type: "weight", weights: { 1: 1.1, 3: 1.1, 5: 1.1 } } },

          { id: "mhrise_end_ash", label: "アッシュ（偶数設定示唆）", effect: { type: "weight", weights: { 2: 1.1, 4: 1.1, 6: 1.1 } } },
          { id: "mhrise_end_mimi", label: "Mimi★chan（偶数設定示唆）", effect: { type: "weight", weights: { 2: 1.1, 4: 1.1, 6: 1.1 } } },

          { id: "mhrise_end_tsubaki_1456", label: "つばき（設定1・4・5・6示唆）", effect: { type: "weight", weights: { 1: 1.15, 4: 1.15, 5: 1.15, 6: 1.15 } } },
          { id: "mhrise_end_you_otomo", label: "YOU&オトモ（高設定示唆［弱］）", effect: { type: "weight", weights: { 4: 1.08, 5: 1.12, 6: 1.15 } } },
          { id: "mhrise_end_lara_miranda_strong", label: "Lara&ミランダ&隊長（装備有り）（高設定示唆［強］）", effect: { type: "weight", weights: { 4: 1.2, 5: 1.35, 6: 1.5 } } },

          { id: "mhrise_end_ioli_yomogi", label: "イオリ&ヨモギ（設定2否定）", effect: { type: "excludeSetting", exclude: 2 } },
          { id: "mhrise_end_utsushi_fugen", label: "ウツシ&フゲン（設定3否定）", effect: { type: "excludeSetting", exclude: 3 } },
          { id: "mhrise_end_all", label: "全員集合（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "mhrise_end_hinoe_minoto_entaraion", label: "ヒノエ&ミノト&エンタライオン（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },

          { id: "mhrise_end_inner_50", label: "ルーク&HARUTO&Mimi（インナー）（天国期待度約50%）", effect: { type: "none" } },
          { id: "mhrise_end_inner_80", label: "ワドウ丸&アッシュ&つばき（インナー）（天国期待度約80%）", effect: { type: "none" } },
          { id: "mhrise_end_inner_heaven", label: "Lara&ミランダ&隊長（インナー）（天国濃厚）", effect: { type: "none" } },
        ],
      },
      {
        id: "mhrise_omikuji_color",
        title: "おみくじの色",
        note: "エンディング中のレア役成立時に色で示唆。『設定◯以上/6濃厚』は制約、奇数/偶数/高設定示唆はソフト示唆（重み付け）として反映。",
        items: [
          { id: "mhrise_omikuji_unknown", label: "不明/未確認", effect: { type: "none" } },
          {
            id: "mhrise_omikuji_blue",
            label: "青（奇数設定示唆）",
            effect: { type: "weight", weights: { 1: 1.1, 3: 1.1, 5: 1.1 } },
          },
          {
            id: "mhrise_omikuji_green",
            label: "緑（偶数設定示唆）",
            effect: { type: "weight", weights: { 2: 1.1, 4: 1.1, 6: 1.1 } },
          },
          {
            id: "mhrise_omikuji_red",
            label: "赤（高設定示唆［強］）",
            effect: { type: "weight", weights: { 4: 1.2, 5: 1.35, 6: 1.5 } },
          },
          { id: "mhrise_omikuji_copper", label: "銅（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "mhrise_omikuji_silver", label: "銀（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "mhrise_omikuji_gold", label: "金（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "mhrise_omikuji_momiji", label: "紅葉柄（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "mhrise_omikuji_rainbow", label: "虹（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "mhrise_bonus_direct_hit",
        title: "ボーナス直撃当選（弱/強レア役）",
        note:
          "通常・非前兆中のレア役でボーナス直撃が発生した回数を入力。設定別の直撃率の比率を、ソフト示唆（重み付け）として反映。",
        items: [
          {
            id: "mhrise_direct_weak",
            label: "弱レア役で直撃",
            // 比率: (設定別直撃率) / (設定1直撃率)
            // 設定1: 0.031%, 2: 0.046%, 3: 0.076%, 4: 0.098%, 5: 0.146%, 6: 0.195%
            effect: { type: "weight", weights: { 2: 1.48, 3: 2.45, 4: 3.16, 5: 4.71, 6: 6.29 } },
          },
          {
            id: "mhrise_direct_strong",
            label: "強レア役で直撃",
            // 設定1: 1.56%, 2: 3.13%, 3: 3.91%, 4: 4.69%, 5: 5.47%, 6: 6.25%
            effect: { type: "weight", weights: { 2: 2.01, 3: 2.51, 4: 3.01, 5: 3.51, 6: 4.01 } },
          },
        ],
      },
      {
        id: "mhrise_long_freeze",
        title: "ロングフリーズ",
        note: "ロングフリーズが発生した場合のみ入力。設定別の発生率の比率を、ソフト示唆（重み付け）として反映。",
        items: [
          { id: "mhrise_long_freeze_none", label: "未発生", effect: { type: "none" } },
          {
            id: "mhrise_long_freeze_hit",
            label: "発生",
            // 比率: (設定別発生率) / (設定1発生率) = 986413 / denom
            // 設定1: 1/986413, 2: 1/830587, 3: 1/717259, 4: 1/631130, 5: 1/563458, 6: 1/492965
            effect: { type: "weight", weights: { 2: 1.19, 3: 1.38, 4: 1.56, 5: 1.75, 6: 2.0 } },
          },
        ],
      },
    ],
  };

  hintConfigs["smart-tekken-6"] = {
    machineId: "smart-tekken-6",
    helpUrl: "https://p-town.dmm.com/machines/4913",
    groups: [
      {
        id: "tekken6_kerotto_trophy",
        title: "ケロットトロフィー",
        note: "出現時のみ入力。『設定◯以上/濃厚』は制約として反映。",
        items: [
          { id: "tekken6_trophy_copper", label: "銅（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "tekken6_trophy_silver", label: "銀（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "tekken6_trophy_gold", label: "金（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          {
            id: "tekken6_trophy_kerotto",
            label: "ケロット柄（設定5or6）",
            effect: {
              type: "allOf",
              effects: [
                { type: "excludeSetting", exclude: 1 },
                { type: "excludeSetting", exclude: 2 },
                { type: "excludeSetting", exclude: 3 },
                { type: "excludeSetting", exclude: 4 },
              ],
            },
          },
          { id: "tekken6_trophy_rainbow", label: "レインボー（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "tekken6_at_big_end_screen_non_tc",
        title: "AT中ビッグ終了画面（非鉄拳チャンス中）",
        note: "鉄拳チャンス当選期待度の示唆。現状は表示のみ（判別には未反映）。",
        items: [
          { id: "tekken6_at_big_end_blue", label: "青背景（デフォルト）", effect: { type: "none" } },
          { id: "tekken6_at_big_end_green_jin", label: "緑背景：仁（期待度アップ）", effect: { type: "none" } },
          { id: "tekken6_at_big_end_red_kazuya", label: "赤背景：一八（鉄拳チャンス濃厚）", effect: { type: "none" } },
          {
            id: "tekken6_at_big_end_red_heihachi",
            label: "赤背景：平八（鉄拳チャンス濃厚＋赤タイトル期待度アップ）",
            effect: { type: "none" },
          },
          { id: "tekken6_at_big_end_red_kazumi", label: "赤背景：一美（赤タイトルの鉄拳チャンス濃厚）", effect: { type: "none" } },
        ],
      },
      {
        id: "tekken6_first_big_end_screen_mode_point",
        title: "初当りビッグ終了画面／鉄拳ラッシュ終了時（モード＆規定鉄拳ポイント示唆）",
        note: "滞在モードや規定鉄拳ポイントの示唆。現状は表示のみ（判別には未反映）。",
        items: [
          { id: "tekken6_end_lars", label: "ラース", effect: { type: "none" } },
          { id: "tekken6_end_xiaoyu", label: "シャオユウ", effect: { type: "none" } },
          { id: "tekken6_end_king", label: "キング", effect: { type: "none" } },
          { id: "tekken6_end_jin", label: "仁", effect: { type: "none" } },
          { id: "tekken6_end_kazuya", label: "一八", effect: { type: "none" } },
          { id: "tekken6_end_heihachi_green", label: "平八（緑）", effect: { type: "none" } },
          { id: "tekken6_end_kazumi", label: "一美", effect: { type: "none" } },
          { id: "tekken6_end_heihachi_red", label: "平八（赤）", effect: { type: "none" } },
          { id: "tekken6_end_kazuya_heihachi", label: "一八＆平八", effect: { type: "none" } },
          { id: "tekken6_end_devil_jin", label: "デビル仁", effect: { type: "none" } },
          { id: "tekken6_end_devil_kazumi", label: "デビル一美", effect: { type: "none" } },
        ],
      },
      {
        id: "tekken6_at_direct_hit",
        title: "AT直撃当選",
        note:
          "通常時にAT直撃が発生した回数を入力。設定別の直撃確率の比率を、ソフト示唆（重み付け）として反映。",
        items: [
          {
            id: "tekken6_at_direct_hit_count",
            label: "AT直撃",
            // 比率: (設定別直撃率) / (設定1直撃率)
            // 設定1: 1/12580.4, 2: 1/10774.5, 3: 1/7471.1, 4: 1/5347.4, 5: 1/3840.1, 6: 1/3565.2
            // 比率 = 12580.4 / denom
            effect: { type: "weight", weights: { 2: 1.17, 3: 1.68, 4: 2.35, 5: 3.28, 6: 3.53 } },
          },
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

  hintConfigs["smart-bakemonogatari"] = {
    machineId: "smart-bakemonogatari",
    helpUrl: "https://p-town.dmm.com/machines/4898",
    groups: [
      {
        id: "bake_at_end",
        title: "AT終了画面（PUSHキャラ）",
        note: "AT終了画面でPUSHボタンを押したときに表示されるキャラ画像で示唆。",
        items: [
          { id: "bake_end_araragi_default", label: "阿良々木（デフォルト）", effect: { type: "none" } },

          {
            id: "bake_end_hitagi_high_strong",
            label: "ひたぎ（高設定示唆［強］）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.2, 6: 1.3 } },
          },
          {
            id: "bake_end_nadeko_high_weak",
            label: "撫子（高設定示唆［弱］）",
            effect: { type: "weight", weights: { 4: 1.05, 5: 1.1, 6: 1.15 } },
          },

          {
            id: "bake_end_mayoi_even_weak",
            label: "真宵（偶数設定示唆［弱］）",
            effect: { type: "weight", weights: { 2: 1.04, 4: 1.04, 6: 1.04 } },
          },
          {
            id: "bake_end_tsubasa_even_strong",
            label: "翼（偶数設定示唆［強］）",
            effect: { type: "weight", weights: { 2: 1.08, 4: 1.08, 6: 1.08 } },
          },

          {
            id: "bake_end_suruga_odd_and_high",
            label: "駿河（奇数かつ高設定示唆）",
            effect: {
              type: "allOf",
              effects: [
                { type: "weight", weights: { 1: 1.04, 3: 1.04, 5: 1.04 } },
                { type: "weight", weights: { 4: 1.05, 5: 1.1, 6: 1.15 } },
              ],
            },
          },

          {
            id: "bake_end_shinobu_even",
            label: "忍（偶数設定濃厚）",
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
            id: "bake_end_oshino_356",
            label: "忍野（設定3/5/6濃厚）",
            effect: {
              type: "allOf",
              effects: [
                { type: "excludeSetting", exclude: 1 },
                { type: "excludeSetting", exclude: 2 },
                { type: "excludeSetting", exclude: 4 },
              ],
            },
          },

          {
            id: "bake_end_first_panel_araragi_shinobu_oshino_min4",
            label: "初代パネル：阿良々木・忍・忍野（設定4以上濃厚）",
            effect: { type: "minSetting", min: 4 },
          },
          {
            id: "bake_end_first_panel_heroine_min5",
            label: "初代パネル：ヒロイン（設定5以上濃厚）",
            effect: { type: "minSetting", min: 5 },
          },
          {
            id: "bake_end_i_love_you_exact6",
            label: "I LOVE YOU（設定6濃厚）",
            effect: { type: "exactSetting", exact: 6 },
          },
        ],
      },
      {
        id: "bake_sammy_trophy",
        title: "サミートロフィー",
        note: "AT終了画面・エンディング終了画面でサブ液晶に出現。",
        items: [
          { id: "bake_trophy_copper", label: "銅（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "bake_trophy_silver", label: "銀（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "bake_trophy_gold", label: "金（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "bake_trophy_kirin", label: "キリン柄（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "bake_trophy_rainbow", label: "虹（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "bake_fixed_payout",
        title: "特定獲得枚数表示",
        note: "表示された獲得枚数で示唆。",
        items: [
          { id: "bake_payout_174_min2", label: "174枚（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "bake_payout_543_min3", label: "543枚（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "bake_payout_331_exact6", label: "331枚（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
    ],
  };

  hintConfigs["smart-tokyo-revengers"] = {
    machineId: "smart-tokyo-revengers",
    helpUrl: "https://p-town.dmm.com/machines/4849#anc-point",
    groups: [
      {
        id: "tokrev_at_end_screens",
        title: "AT終了画面（枠）",
        note:
          "東卍チャンス／東卍ラッシュ終了画面で設定を示唆。エピソード（ロングフリーズ後含む）とエンディングの終了画面は固定なので設定示唆なし。※エンディング後は固定で金枠が表示されるため、示唆の金枠と混同しないよう注意。",
        items: [
          { id: "tokrev_at_end_red1", label: "赤枠①（デフォルト）", effect: { type: "none" } },
          {
            id: "tokrev_at_end_blue1",
            label: "青枠①（奇数設定示唆）",
            effect: { type: "weight", weights: { 1: 1.08, 3: 1.08, 5: 1.08 } },
          },
          {
            id: "tokrev_at_end_red2",
            label: "赤枠②（偶数設定示唆）",
            effect: { type: "weight", weights: { 2: 1.08, 4: 1.08, 6: 1.08 } },
          },
          {
            id: "tokrev_at_end_blue2",
            label: "青枠②（高設定示唆［弱］）",
            effect: { type: "weight", weights: { 4: 1.05, 5: 1.1, 6: 1.15 } },
          },
          {
            id: "tokrev_at_end_red3",
            label: "赤枠③（高設定示唆［強］）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.2, 6: 1.3 } },
          },
          { id: "tokrev_at_end_blue3", label: "青枠③（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "tokrev_at_end_yellow", label: "黄枠（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "tokrev_at_end_red4", label: "赤枠④（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "tokrev_at_end_purple", label: "紫枠（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "tokrev_at_end_gold", label: "金枠（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },

          { id: "tokrev_at_end_after_episode", label: "エピソード後（固定／示唆なし）", effect: { type: "none" } },
          {
            id: "tokrev_at_end_after_episode_lf",
            label: "ロングフリーズ後のエピソード後（固定／示唆なし）",
            effect: { type: "none" },
          },
          { id: "tokrev_at_end_after_ending", label: "エンディング後（固定の金枠／示唆なし）", effect: { type: "none" } },
        ],
      },
      {
        id: "tokrev_episode_hints",
        title: "エピソード示唆",
        note: "エピソード種別ごとの示唆。奇数/偶数/高設定示唆はソフト示唆（重み付け）として反映。※天国濃厚など設定以外の示唆は判別に反映しません。",
        items: [
          {
            id: "tokrev_episode_zero",
            label: "Zero（奇数かつ高設定示唆）",
            effect: {
              type: "allOf",
              effects: [
                { type: "weight", weights: { 1: 1.08, 3: 1.08, 5: 1.08 } },
                { type: "weight", weights: { 4: 1.05, 5: 1.1, 6: 1.15 } },
              ],
            },
          },
          {
            id: "tokrev_episode_in_those_days",
            label: "In those days（偶数かつ高設定示唆）",
            effect: {
              type: "allOf",
              effects: [
                { type: "weight", weights: { 2: 1.08, 4: 1.08, 6: 1.08 } },
                { type: "weight", weights: { 4: 1.05, 5: 1.1, 6: 1.15 } },
              ],
            },
          },
          {
            id: "tokrev_episode_man_crush_min4",
            label: "Man-crush（設定4以上濃厚）",
            effect: { type: "minSetting", min: 4 },
          },
        ],
      },
      {
        id: "tokrev_at_start_screen_from_attack",
        title: "AT開始画面（東卍アタック→東卍ラッシュ復帰時）",
        note:
          "開始画面で設定を示唆。示唆［弱/強］はソフト示唆（重み付け）として反映。※天国濃厚/特殊モード濃厚など設定以外の示唆は判別に反映しません。",
        items: [
          { id: "tokrev_at_start_from_attack_default", label: "デフォルト（設定示唆なし）", effect: { type: "none" } },
          {
            id: "tokrev_at_start_from_attack_all_p1",
            label: "キャラ集合：パターン1（高設定示唆［弱］）",
            effect: { type: "weight", weights: { 4: 1.05, 5: 1.1, 6: 1.15 } },
          },
          {
            id: "tokrev_at_start_from_attack_all_p2",
            label: "キャラ集合：パターン2（高設定示唆［強］）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.2, 6: 1.3 } },
          },
          {
            id: "tokrev_at_start_from_attack_all_p3_min2",
            label: "キャラ集合：パターン3（設定2以上濃厚）",
            effect: { type: "minSetting", min: 2 },
          },
          {
            id: "tokrev_at_start_from_attack_all_p4_exact6",
            label: "キャラ集合：パターン4（設定6濃厚）",
            effect: { type: "exactSetting", exact: 6 },
          },
          {
            id: "tokrev_at_start_from_attack_ichitora_min4",
            label: "一虎（緑背景）（設定4以上濃厚）",
            effect: { type: "minSetting", min: 4 },
          },
          {
            id: "tokrev_at_start_from_attack_baji_exact6",
            label: "場地（設定6濃厚）",
            effect: { type: "exactSetting", exact: 6 },
          },
          {
            id: "tokrev_at_start_from_attack_kisaki_mode",
            label: "稀咲（特殊モード示唆／設定示唆なし）",
            effect: { type: "none" },
          },
        ],
      },
      {
        id: "tokrev_at_start_screen_tenjotenge",
        title: "AT開始画面（天上天下唯我独尊成功時）",
        note: "開始画面で設定を示唆。示唆［弱/強］はソフト示唆（重み付け）として反映。",
        items: [
          { id: "tokrev_at_start_tenjotenge_default", label: "デフォルト（設定示唆なし）", effect: { type: "none" } },
          {
            id: "tokrev_at_start_tenjotenge_all_p1",
            label: "キャラ集合：パターン1（高設定示唆［弱］）",
            effect: { type: "weight", weights: { 4: 1.05, 5: 1.1, 6: 1.15 } },
          },
          {
            id: "tokrev_at_start_tenjotenge_all_p2",
            label: "キャラ集合：パターン2（高設定示唆［強］）",
            effect: { type: "weight", weights: { 4: 1.1, 5: 1.2, 6: 1.3 } },
          },
          {
            id: "tokrev_at_start_tenjotenge_all_p3_min2",
            label: "キャラ集合：パターン3（設定2以上濃厚）",
            effect: { type: "minSetting", min: 2 },
          },
          {
            id: "tokrev_at_start_tenjotenge_all_p4_exact6",
            label: "キャラ集合：パターン4（設定6濃厚）",
            effect: { type: "exactSetting", exact: 6 },
          },
        ],
      },
      {
        id: "tokrev_sammy_trophy",
        title: "サミートロフィー",
        note:
          "東卍チャンス終了時・東卍ラッシュ終了時・リベンジチャンス終了時・天上天下唯我独尊終了後の1回転目にサブ液晶へ出現する可能性あり。",
        items: [
          { id: "tokrev_trophy_copper", label: "銅（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "tokrev_trophy_silver", label: "銀（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "tokrev_trophy_gold", label: "金（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "tokrev_trophy_kirin", label: "キリン柄（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "tokrev_trophy_rainbow", label: "虹（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "tokrev_payout_display",
        title: "特定の獲得枚数表示",
        note: "表示された獲得枚数で設定を示唆。",
        items: [
          { id: "tokrev_payout_222", label: "222 OVER（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          {
            id: "tokrev_payout_246",
            label: "246 OVER（偶数設定濃厚）",
            effect: {
              type: "allOf",
              effects: [
                { type: "excludeSetting", exclude: 1 },
                { type: "excludeSetting", exclude: 3 },
                { type: "excludeSetting", exclude: 5 },
              ],
            },
          },
          { id: "tokrev_payout_456", label: "456 OVER（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "tokrev_payout_555", label: "555 OVER（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
        ],
      },
      {
        id: "tokrev_ending_top_lamp",
        title: "エンディング中：レア役成立時のトップランプ色",
        note: "エンディング中にレア役成立→PUSHで筐体トップランプが点灯。奇数/偶数/高設定示唆はソフト示唆（重み付け）として反映。",
        items: [
          {
            id: "tokrev_lamp_white",
            label: "白（奇数設定示唆）",
            effect: { type: "weight", weights: { 1: 1.08, 3: 1.08, 5: 1.08 } },
          },
          {
            id: "tokrev_lamp_yellow",
            label: "黄（偶数設定示唆）",
            effect: { type: "weight", weights: { 2: 1.08, 4: 1.08, 6: 1.08 } },
          },
          {
            id: "tokrev_lamp_green",
            label: "緑（奇数かつ高設定示唆）",
            effect: {
              type: "allOf",
              effects: [
                { type: "weight", weights: { 1: 1.08, 3: 1.08, 5: 1.08 } },
                { type: "weight", weights: { 4: 1.05, 5: 1.1, 6: 1.15 } },
              ],
            },
          },
          {
            id: "tokrev_lamp_red",
            label: "赤（偶数かつ高設定示唆）",
            effect: {
              type: "allOf",
              effects: [
                { type: "weight", weights: { 2: 1.08, 4: 1.08, 6: 1.08 } },
                { type: "weight", weights: { 4: 1.05, 5: 1.1, 6: 1.15 } },
              ],
            },
          },
          { id: "tokrev_lamp_rainbow", label: "虹（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
    ],
  };

  hintConfigs["smart-onimusha-3"] = {
    machineId: "smart-onimusha-3",
    helpUrl: "https://p-town.dmm.com/machines/4880#anc-point",
    groups: [
      {
        id: "oni3_entara_trophy",
        title: "エンタトロフィー（AT終了画面）",
        note: "出現時のみ入力。『設定◯以上/濃厚』は制約として反映。",
        items: [
          { id: "oni3_trophy_none", label: "なし/不明", effect: { type: "none" } },
          { id: "oni3_trophy_copper", label: "銅（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "oni3_trophy_silver", label: "銀（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "oni3_trophy_gold", label: "金（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "oni3_trophy_momiji", label: "紅葉柄（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "oni3_trophy_rainbow", label: "虹（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "oni3_at_end_screens",
        title: "AT終了画面",
        note: "奇数/偶数/高設定示唆はソフト示唆（重み付け）として反映。『設定◯以上濃厚』は制約として反映。",
        items: [
          { id: "oni3_at_end_default", label: "デフォルト/不明", effect: { type: "none" } },
          {
            id: "oni3_at_end_odd",
            label: "蒼鬼＆ロベルト＆天海（奇数設定示唆）",
            effect: { type: "weight", weights: { 1: 1.08, 3: 1.08, 5: 1.08 } },
          },
          {
            id: "oni3_at_end_even",
            label: "茜＆お初（偶数設定示唆）",
            effect: { type: "weight", weights: { 2: 1.08, 4: 1.08, 6: 1.08 } },
          },
          {
            id: "oni3_at_end_high",
            label: "阿倫＆みの吉（高設定示唆）",
            effect: { type: "weight", weights: { 4: 1.05, 5: 1.1, 6: 1.15 } },
          },

          { id: "oni3_at_end_min2", label: "蒼鬼＆茜（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "oni3_at_end_min3", label: "鬼武者 Way of the Sword（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "oni3_at_end_min4", label: "幻魔集合（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "oni3_at_end_min5", label: "極限覚醒鬼武者（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "oni3_at_end_exact6", label: "デフォルメキャラ集合（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "oni3_special_add",
        title: "特殊上乗せ（+4G/+5G/+6G）",
        note: "『設定◯以上濃厚』は制約として反映。",
        items: [
          { id: "oni3_add4", label: "+4G（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "oni3_add5", label: "+5G（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "oni3_add6", label: "+6G（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "oni3_fixed_payout",
        title: "特定獲得枚数表示",
        note: "表示された獲得枚数で示唆。『2・5・6濃厚』などは否定（exclude）として反映。",
        items: [
          {
            id: "oni3_payout_256",
            label: "256枚OVER（設定2・5・6濃厚）",
            effect: {
              type: "allOf",
              effects: [
                { type: "excludeSetting", exclude: 1 },
                { type: "excludeSetting", exclude: 3 },
                { type: "excludeSetting", exclude: 4 },
              ],
            },
          },
          { id: "oni3_payout_456", label: "456枚OVER（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "oni3_payout_555", label: "555枚OVER（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "oni3_payout_666", label: "666枚OVER（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "oni3_bonus_char_intro",
        title: "鬼ボーナス中：キャラ紹介",
        note: "奇数/偶数/高設定示唆はソフト示唆（重み付け）。『設定◯以上濃厚』は制約として反映。",
        items: [
          {
            id: "oni3_intro_friend",
            label: "味方キャラ（奇数設定示唆）",
            effect: { type: "weight", weights: { 1: 1.08, 3: 1.08, 5: 1.08 } },
          },
          {
            id: "oni3_intro_enemy",
            label: "敵キャラ（偶数設定示唆）",
            effect: { type: "weight", weights: { 2: 1.08, 4: 1.08, 6: 1.08 } },
          },
          {
            id: "oni3_intro_910_high",
            label: "9・10G目：阿倫＆みの吉（高設定示唆）",
            effect: { type: "weight", weights: { 4: 1.05, 5: 1.1, 6: 1.15 } },
          },

          { id: "oni3_intro_min2", label: "幻魔（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "oni3_intro_min3", label: "無間地獄の幻魔（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "oni3_intro_min4", label: "フォーティンブラス（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "oni3_intro_min5", label: "覚醒鬼武者（設定5以上濃厚）", effect: { type: "minSetting", min: 5 } },
          { id: "oni3_intro_exact6", label: "エンタライオン（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "oni3_voice",
        title: "レア役成立時のボイス（要点のみ）",
        note: "台詞本文は省略し、キャラ＋示唆のみ入力。『否定/濃厚』は制約、奇数/偶数/高設定示唆はソフト示唆（重み付け）。",
        items: [

          { id: "oni3_voice_soki_min5", label: "蒼鬼（設定5以上）", effect: { type: "minSetting", min: 5 } },
          {
            id: "oni3_voice_tenkai_odd_strong",
            label: "天海（奇数示唆［強］）",
            effect: { type: "weight", weights: { 1: 1.08, 3: 1.08, 5: 1.08 } },
          },
          {
            id: "oni3_voice_roberto_odd_weak",
            label: "ロベルト（奇数示唆［弱］）",
            effect: { type: "weight", weights: { 1: 1.05, 3: 1.05, 5: 1.05 } },
          },
          {
            id: "oni3_voice_akane_even_strong",
            label: "茜（偶数示唆［強］）",
            effect: { type: "weight", weights: { 2: 1.08, 4: 1.08, 6: 1.08 } },
          },
          {
            id: "oni3_voice_ohatsu_even_weak",
            label: "お初（偶数示唆［弱］）",
            effect: { type: "weight", weights: { 2: 1.05, 4: 1.05, 6: 1.05 } },
          },

          { id: "oni3_voice_minokichi_excl2", label: "みの吉（設定2否定）", effect: { type: "excludeSetting", exclude: 2 } },
          { id: "oni3_voice_minokichi_excl3", label: "みの吉（設定3否定）", effect: { type: "excludeSetting", exclude: 3 } },
          { id: "oni3_voice_minokichi_excl4", label: "みの吉（設定4否定）", effect: { type: "excludeSetting", exclude: 4 } },

          { id: "oni3_voice_orin_min2", label: "阿倫（設定2以上濃厚）", effect: { type: "minSetting", min: 2 } },
          { id: "oni3_voice_orin_min3", label: "阿倫（設定3以上濃厚）", effect: { type: "minSetting", min: 3 } },
          { id: "oni3_voice_orin_min4", label: "阿倫（設定4以上濃厚）", effect: { type: "minSetting", min: 4 } },
          { id: "oni3_voice_entaraion_exact6", label: "エンタライオン（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
      {
        id: "oni3_navi_voice",
        title: "ナビボイス",
        note: "高設定示唆のみソフト示唆（重み付け）として反映。",
        items: [
          {
            id: "oni3_navi_allcast",
            label: "オールキャスト（高設定示唆）",
            effect: { type: "weight", weights: { 4: 1.05, 5: 1.1, 6: 1.15 } },
          },
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
        items: [
          { id: "ger_timer_6start_miss", label: "6スタートでAT非当選（設定6濃厚）", effect: { type: "exactSetting", exact: 6 } },
        ],
      },
    ],
  };

export function getHintConfig(machineId: string): MachineHintConfig | null {
  return hintConfigs[machineId] ?? null;
}
