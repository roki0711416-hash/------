export type HintEffect =
  | { type: "none" }
  | { type: "minSetting"; min: number }
  | { type: "exactSetting"; exact: number };

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
};

export function getHintConfig(machineId: string): MachineHintConfig | null {
  return hintConfigs[machineId] ?? null;
}
