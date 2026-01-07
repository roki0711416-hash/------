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
  // Optional: if set, total count is expected to be <= this input field.
  maxTotalFrom?: "bigCount" | "regCount";
  items: HintItem[];
};

export type MachineHintConfig = {
  machineId: string;
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
    groups: [
      {
        id: "ending_cards",
        title: "エンディング：カードごとの示唆",
        note: "エンディング中のレア役成立時は、サブ液晶にタッチ。引用: https://p-town.dmm.com/machines/4745#anc-point",
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
