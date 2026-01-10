export type MachineCategory = "JUG" | "HANAHANA" | string;

export type MachineMetricsLabels = {
  bigLabel?: string;
  regLabel?: string | null;
  totalLabel?: string | null;
  extraLabel?: string;
  extraMetrics?: { id: string; label: string }[];
  suikaTrialsLabel?: string;
  suikaCzHitsLabel?: string;
  suikaCzRateLabel?: string;
  uraAtTrialsLabel?: string;
  uraAtHitsLabel?: string;
  uraAtRateLabel?: string;
};

export type MachineOddsSetting = {
  s: number | string;
  big: number;
  reg: number;
  total: number;
  rate: number;
  extra?: number;
  extras?: Record<string, number>;
  suikaCzRate?: number;
  uraAtRate?: number;
};

export type Machine = {
  id: string;
  name: string;
  maker: string;
  series?: string;
  inHall: boolean;
  category: MachineCategory;
  description?: string;
  image?: string;
  metricsLabels?: MachineMetricsLabels;
  toolMode?: "odds-only";
  odds: {
    settings: MachineOddsSetting[];
  };
};

export const machines = [
  {
    id: "neo-im-juggler-ex",
    name: "ネオアイムジャグラーEX",
    maker: "北電子",
    series: "ジャグラー",
    inHall: true,
    category: "JUG",
    description: "最新のアイム系ジャグラー。",
    image: "/machines/neo-im-juggler-ex.jpg",
    odds: {
      settings: [
        { s: 1, big: 273.1, reg: 439.8, total: 168.5, rate: 97.0 },
        { s: 2, big: 269.7, reg: 399.6, total: 161.0, rate: 98.0 },
        { s: 3, big: 269.7, reg: 331.0, total: 148.6, rate: 99.5 },
        { s: 4, big: 259.0, reg: 315.1, total: 142.2, rate: 101.1 },
        { s: 5, big: 259.0, reg: 255.0, total: 128.5, rate: 103.3 },
        { s: 6, big: 255.0, reg: 255.0, total: 127.5, rate: 105.5 },
      ],
    },
  },

  {
    id: "s-im-juggler-ex-6",
    name: "SアイムジャグラーEX (6号機)",
    maker: "北電子",
    series: "ジャグラー",
    inHall: true,
    category: "JUG",
    description: "6号機ジャグラー第一弾。定番。",
    odds: {
      settings: [
        { s: 1, big: 273.1, reg: 439.8, total: 168.5, rate: 97.0 },
        { s: 2, big: 269.7, reg: 399.6, total: 161.0, rate: 98.0 },
        { s: 3, big: 269.7, reg: 331.0, total: 148.6, rate: 99.5 },
        { s: 4, big: 259.0, reg: 315.1, total: 142.2, rate: 101.1 },
        { s: 5, big: 259.0, reg: 255.0, total: 128.5, rate: 103.3 },
        { s: 6, big: 255.0, reg: 255.0, total: 127.5, rate: 105.5 },
      ],
    },
  },

  {
    id: "my-juggler-v",
    name: "マイジャグラーV",
    maker: "北電子",
    series: "ジャグラー",
    inHall: true,
    category: "JUG",
    description: "マイジャグ系の人気機種。",
    odds: {
      settings: [
        { s: 1, big: 273.1, reg: 409.6, total: 163.8, rate: 97.0 },
        { s: 2, big: 270.8, reg: 385.5, total: 159.1, rate: 98.0 },
        { s: 3, big: 266.4, reg: 336.1, total: 148.6, rate: 99.9 },
        { s: 4, big: 254.0, reg: 290.0, total: 135.4, rate: 102.8 },
        { s: 5, big: 240.1, reg: 268.6, total: 126.8, rate: 105.3 },
        { s: 6, big: 229.1, reg: 229.1, total: 114.6, rate: 109.4 },
      ],
    },
  },

  {
    id: "funky-juggler-2",
    name: "ファンキージャグラー2",
    maker: "北電子",
    series: "ジャグラー",
    inHall: true,
    category: "JUG",
    description: "ファンキー系の6号機版。",
    odds: {
      settings: [
        { s: 1, big: 266.4, reg: 439.8, total: 165.9, rate: 97.0 },
        { s: 2, big: 259.0, reg: 407.1, total: 158.3, rate: 98.5 },
        { s: 3, big: 256.0, reg: 366.1, total: 150.7, rate: 99.8 },
        { s: 4, big: 249.2, reg: 322.8, total: 140.6, rate: 102.0 },
        { s: 5, big: 240.1, reg: 299.3, total: 133.2, rate: 104.3 },
        { s: 6, big: 219.9, reg: 262.1, total: 119.6, rate: 109.0 },
      ],
    },
  },

  {
    id: "ultra-miracle-juggler",
    name: "ウルトラミラクルジャグラー",
    maker: "北電子",
    series: "ジャグラー",
    inHall: true,
    category: "JUG",
    description: "ミラクル系の新しめ機種。",
    odds: {
      settings: [
        { s: 1, big: 267.5, reg: 425.6, total: 164.3, rate: 97.0 },
        { s: 2, big: 261.1, reg: 402.1, total: 158.3, rate: 98.1 },
        { s: 3, big: 256.0, reg: 350.5, total: 147.9, rate: 99.8 },
        { s: 4, big: 242.7, reg: 322.8, total: 138.6, rate: 102.1 },
        { s: 5, big: 233.2, reg: 297.9, total: 130.8, rate: 104.5 },
        { s: 6, big: 216.3, reg: 277.7, total: 121.6, rate: 108.1 },
      ],
    },
  },

  {
    id: "juggler-girls-ss",
    name: "ジャグラーガールズSS",
    maker: "北電子",
    series: "ジャグラー",
    inHall: true,
    category: "JUG",
    description: "ガールズ系。",
    odds: {
      settings: [
        { s: 1, big: 273.1, reg: 381.0, total: 159.1, rate: 97.0 },
        { s: 2, big: 270.8, reg: 350.5, total: 152.8, rate: 97.9 },
        { s: 3, big: 260.1, reg: 316.6, total: 142.8, rate: 99.9 },
        { s: 4, big: 250.1, reg: 281.3, total: 132.4, rate: 102.1 },
        { s: 5, big: 243.6, reg: 270.8, total: 128.3, rate: 104.4 },
        { s: 6, big: 226.0, reg: 252.1, total: 119.2, rate: 107.5 },
      ],
    },
  },

  {
    id: "new-king-hanahana-v-bt",
    name: "ニューキングハナハナV（BT）",
    maker: "パイオニア",
    series: "ハナハナ",
    category: "HANAHANA",
    inHall: true,
    description: "BT搭載のニューキングハナハナV。",
    // image: "/machines/new-king-hanahana-v-bt.jpg",
    odds: {
      settings: [
        { s: 1, big: 299, reg: 496, total: 186, rate: 97 },
        { s: 2, big: 291, reg: 471, total: 180, rate: 99 },
        { s: 3, big: 281, reg: 442, total: 172, rate: 101 },
        { s: 4, big: 268, reg: 409, total: 162, rate: 104 },
        { s: "V", big: 253, reg: 372, total: 150, rate: 108 },
      ],
    },
  },

  // --- パイオニア 6号機追加 ---
  {
    id: "star-hanahana-30-6gouki",
    name: "スターハナハナ-30",
    maker: "パイオニア",
    series: "ハナハナ",
    category: "HANAHANA",
    inHall: true,
    description: "6号機ハナハナシリーズ。",
    odds: {
      settings: [
        { s: 1, big: 270, reg: 387, total: 159, rate: 97 },
        { s: 2, big: 262, reg: 354, total: 150, rate: 99 },
        { s: 3, big: 252, reg: 322, total: 141, rate: 101 },
        { s: 4, big: 240, reg: 293, total: 132, rate: 104 },
        { s: 5, big: 229, reg: 267, total: 123, rate: 107 },
        { s: 6, big: 218, reg: 242, total: 114, rate: 110 },
      ],
    },
  },
  {
    id: "dragon-hanahana-senkou-30-6gouki",
    name: "ドラゴンハナハナ～閃光～-30",
    maker: "パイオニア",
    series: "ハナハナ",
    category: "HANAHANA",
    inHall: true,
    description: "6号機ハナハナシリーズ。",
    odds: {
      settings: [
        { s: 1, big: 256, reg: 642, total: 183, rate: 97 },
        { s: 2, big: 246, reg: 585, total: 173, rate: 99 },
        { s: 3, big: 235, reg: 537, total: 163, rate: 101 },
        { s: 4, big: 224, reg: 489, total: 153, rate: 104 },
        { s: 5, big: 212, reg: 442, total: 143, rate: 107 },
        { s: 6, big: 199, reg: 399, total: 133, rate: 110 },
      ],
    },
  },

  {
    id: "s-king-hanahana-30-6gouki",
    name: "Sキングハナハナ-30",
    maker: "パイオニア",
    series: "ハナハナ",
    category: "HANAHANA",
    inHall: true,
    description: "6号機ハナハナシリーズ。",
    odds: {
      settings: [
        { s: 1, big: 292, reg: 489, total: 183, rate: 97 },
        { s: 2, big: 280, reg: 452, total: 172, rate: 99 },
        { s: 3, big: 268, reg: 420, total: 163, rate: 101 },
        { s: 4, big: 257, reg: 390, total: 154, rate: 104 },
        { s: 5, big: 244, reg: 360, total: 145, rate: 107 },
        { s: 6, big: 232, reg: 332, total: 136, rate: 110 },
      ],
    },
  },
  {
    id: "hanahana-houou-tenshou-6gouki",
    name: "ハナハナホウオウ～天翔～",
    maker: "パイオニア",
    series: "ハナハナ",
    category: "HANAHANA",
    inHall: true,
    description: "6号機ハナハナシリーズ。",
    odds: {
      settings: [
        { s: 1, big: 297, reg: 496, total: 186, rate: 97 },
        { s: 2, big: 284, reg: 458, total: 175, rate: 99 },
        { s: 3, big: 273, reg: 425, total: 166, rate: 101 },
        { s: 4, big: 262, reg: 397, total: 157, rate: 103 },
        { s: 5, big: 249, reg: 366, total: 148, rate: 106 },
        { s: 6, big: 236, reg: 337, total: 139, rate: 109 },
      ],
    },
  },

  // --- UNIVERSAL スマスロ追加 ---
  {
    id: "smart-magireco",
    name: "スマスロ マギアレコード 魔法少女まどか☆マギカ外伝",
    maker: "ユニバーサル",
    series: "まどマギ",
    category: "SMART",
    inHall: true,
    description: "スマスロ（ボーナス初当り/AT初当り）ベースの簡易判別。",
    metricsLabels: {
      bigLabel: "ボーナス初当り",
      regLabel: "AT初当り",
      totalLabel: null,
      extraLabel: "弱チェリー",
      suikaTrialsLabel: "スイカ回数",
      suikaCzHitsLabel: "CZ当選(スイカ)",
      suikaCzRateLabel: "スイカCZ当選率",
    },
    odds: {
      settings: [
        {
          s: 1,
          big: 240.6,
          reg: 654.6,
          total: 175.9,
          rate: 97.6,
          extra: 60.0,
          suikaCzRate: 0.203,
        },
        {
          s: 2,
          big: 236.1,
          reg: 633.4,
          total: 172.0,
          rate: 98.9,
          extra: 57.7,
          suikaCzRate: 0.227,
        },
        {
          s: 3,
          big: 222.8,
          reg: 571.8,
          total: 160.3,
          rate: 102.0,
          extra: 55.5,
          suikaCzRate: 0.25,
        },
        {
          s: 4,
          big: 208.5,
          reg: 516.6,
          total: 148.5,
          rate: 106.0,
          extra: 53.5,
          suikaCzRate: 0.281,
        },
        {
          s: 5,
          big: 195.1,
          reg: 456.5,
          total: 136.7,
          rate: 110.4,
          extra: 51.7,
          suikaCzRate: 0.309,
        },
        {
          s: 6,
          big: 184.3,
          reg: 416.7,
          total: 127.8,
          rate: 114.9,
          extra: 50.0,
          suikaCzRate: 0.336,
        },
      ],
    },
  },

  // --- SPIKY スマスロ追加 ---
  {
    id: "smart-tokyo-ghoul",
    name: "スマスロ 東京喰種",
    maker: "スパイキー",
    series: "東京喰種",
    category: "SMART",
    inHall: true,
    description: "スマスロ（初当り）ベースの簡易判別。",
    metricsLabels: {
      bigLabel: "初当り",
      regLabel: null,
      totalLabel: null,
      extraMetrics: [
        { id: "lowerReplay", label: "下段リプレイ" },
        { id: "reminiscence", label: "レミニセンス" },
        { id: "bigEaterRize", label: "大喰いの利世" },
        { id: "episodeBonus", label: "エピソードボーナス" },
      ],
      uraAtTrialsLabel: "AT当選(有馬J非経由)",
      uraAtHitsLabel: "裏AT突入(直行)",
      uraAtRateLabel: "裏AT直行率",
    },
    odds: {
      settings: [
        {
          s: 1,
          big: 394.4,
          reg: 1_000_000_000,
          total: 394.4,
          rate: 97.5,
          uraAtRate: 0.011,
          extras: {
            lowerReplay: 1260.3,
            reminiscence: 300.5,
            bigEaterRize: 2079.1,
            episodeBonus: 6620.2,
          },
        },
        {
          s: 2,
          big: 380.5,
          reg: 1_000_000_000,
          total: 380.5,
          rate: 99.0,
          uraAtRate: 0.0132,
          extras: {
            lowerReplay: 1213.6,
            reminiscence: 295.1,
            bigEaterRize: 1906.5,
            episodeBonus: 5879.7,
          },
        },
        {
          s: 3,
          big: 357.0,
          reg: 1_000_000_000,
          total: 357.0,
          rate: 101.6,
          uraAtRate: 0.0163,
          extras: {
            lowerReplay: 1170.3,
            reminiscence: 287.6,
            bigEaterRize: 1722.8,
            episodeBonus: 5114.5,
          },
        },
        {
          s: 4,
          big: 325.9,
          reg: 1_000_000_000,
          total: 325.9,
          rate: 105.6,
          uraAtRate: 0.0219,
          extras: {
            lowerReplay: 1129.9,
            reminiscence: 276.7,
            bigEaterRize: 1478.9,
            episodeBonus: 4062.5,
          },
        },
        {
          s: 5,
          big: 291.2,
          reg: 1_000_000_000,
          total: 291.2,
          rate: 110.3,
          uraAtRate: 0.0285,
          extras: {
            lowerReplay: 1092.3,
            reminiscence: 262.7,
            bigEaterRize: 1226.6,
            episodeBonus: 3166.7,
          },
        },
        {
          s: 6,
          big: 261.3,
          reg: 1_000_000_000,
          total: 261.3,
          rate: 114.9,
          uraAtRate: 0.0332,
          extras: {
            lowerReplay: 1024.0,
            reminiscence: 251.2,
            bigEaterRize: 1074.9,
            episodeBonus: 2639.5,
          },
        },
      ],
    },
  },

  {
    id: "smart-darling-in-the-franxx",
    name: "スマスロ ダーリン・イン・ザ・フランキス",
    maker: "スパイキー",
    series: "ダーリン・イン・ザ・フランキス",
    category: "SMART",
    inHall: true,
    description: "スマスロ（ボーナス初当り/ボーナス高確率）ベースの簡易判別。",
    metricsLabels: {
      bigLabel: "ボーナス初当り",
      regLabel: "ボーナス高確率",
      totalLabel: null,
    },
    odds: {
      settings: [
        { s: 1, big: 229.8, reg: 343.0, total: 137.6, rate: 97.8 },
        { s: 2, big: 224.1, reg: 334.1, total: 134.1, rate: 98.9 },
        { s: 3, big: 214.9, reg: 320.1, total: 128.6, rate: 100.6 },
        { s: 4, big: 207.3, reg: 298.9, total: 122.4, rate: 105.4 },
        { s: 5, big: 190.3, reg: 270.3, total: 111.7, rate: 110.5 },
        { s: 6, big: 180.3, reg: 252.3, total: 105.2, rate: 114.5 },
      ],
    },
  },

  // --- SAMMY スマスロ追加 ---
  {
    id: "smart-hokuto-no-ken",
    name: "スマスロ北斗の拳",
    maker: "サミー",
    series: "北斗の拳",
    category: "SMART",
    inHall: true,
    description: "スマスロ（BB初当り）ベースの簡易判別。",
    metricsLabels: {
      bigLabel: "BB初当り",
      regLabel: null,
      totalLabel: null,
      extraMetrics: [
        { id: "weakSuika", label: "弱スイカ" },
        { id: "strongSuikaSum", label: "強スイカ合算" },
        { id: "chudanCherrySum", label: "中段チェリー合算" },
        { id: "reachmeYaku", label: "リーチ目役" },
      ],
    },
    odds: {
      settings: [
        {
          s: 1,
          big: 383.4,
          reg: 1_000_000_000,
          total: 383.4,
          rate: 98.0,
          extras: {
            weakSuika: 109.0,
            strongSuikaSum: 409.6,
            chudanCherrySum: 210.1,
            reachmeYaku: 16384.0,
          },
        },
        {
          s: 2,
          big: 370.5,
          reg: 1_000_000_000,
          total: 370.5,
          rate: 98.9,
          extras: {
            weakSuika: 108.7,
            strongSuikaSum: 404.5,
            chudanCherrySum: 204.8,
            reachmeYaku: 13107.2,
          },
        },
        {
          s: 4,
          big: 297.8,
          reg: 1_000_000_000,
          total: 297.8,
          rate: 105.7,
          extras: {
            weakSuika: 105.9,
            strongSuikaSum: 376.6,
            chudanCherrySum: 199.8,
            reachmeYaku: 10922.7,
          },
        },
        {
          s: 5,
          big: 258.7,
          reg: 1_000_000_000,
          total: 258.7,
          rate: 110.0,
          extras: {
            weakSuika: 100.7,
            strongSuikaSum: 352.3,
            chudanCherrySum: 195.0,
            reachmeYaku: 9362.3,
          },
        },
        {
          s: 6,
          big: 235.1,
          reg: 1_000_000_000,
          total: 235.1,
          rate: 113.0,
          extras: {
            weakSuika: 98.3,
            strongSuikaSum: 337.8,
            chudanCherrySum: 190.5,
            reachmeYaku: 8192.0,
          },
        },
      ],
    },
  },

  // --- YAMASA スマスロ追加 ---
  {
    id: "smart-god-eater-resurrection",
    name: "スマスロ ゴッドイーター リザレクション",
    maker: "山佐",
    series: "ゴッドイーター",
    category: "SMART",
    inHall: true,
    description: "スマスロ（初当り/CZ/AT直撃）ベースの簡易判別。",
    metricsLabels: {
      bigLabel: "初当り",
      regLabel: null,
      totalLabel: null,
      extraMetrics: [{ id: "cz", label: "CZ確率(合算)" }],
      suikaTrialsLabel: "弱チェ/スイカ成立回数",
      suikaCzHitsLabel: "CZ当選(弱チェ/スイカ)",
      suikaCzRateLabel: "弱チェ/スイカCZ当選率",
      uraAtTrialsLabel: "強チェリー成立回数",
      uraAtHitsLabel: "AT直撃当選回数",
      uraAtRateLabel: "強チェAT直撃当選率",
    },
    odds: {
      settings: [
        {
          s: 1,
          big: 351.9,
          reg: 1_000_000_000,
          total: 351.9,
          rate: 97.9,
          suikaCzRate: 0.002,
          uraAtRate: 0.004,
          extras: { cz: 392.0 },
        },
        {
          s: 2,
          big: 344.5,
          reg: 1_000_000_000,
          total: 344.5,
          rate: 98.9,
          suikaCzRate: 0.004,
          uraAtRate: 0.012,
          extras: { cz: 378.3 },
        },
        {
          s: 3,
          big: 330.1,
          reg: 1_000_000_000,
          total: 330.1,
          rate: 101.1,
          suikaCzRate: 0.006,
          uraAtRate: 0.024,
          extras: { cz: 359.1 },
        },
        {
          s: 4,
          big: 317.0,
          reg: 1_000_000_000,
          total: 317.0,
          rate: 105.6,
          suikaCzRate: 0.008,
          uraAtRate: 0.043,
          extras: { cz: 343.4 },
        },
        {
          s: 5,
          big: 302.2,
          reg: 1_000_000_000,
          total: 302.2,
          rate: 110.0,
          suikaCzRate: 0.01,
          uraAtRate: 0.051,
          extras: { cz: 324.3 },
        },
        {
          s: 6,
          big: 290.3,
          reg: 1_000_000_000,
          total: 290.3,
          rate: 114.9,
          suikaCzRate: 0.012,
          uraAtRate: 0.059,
          extras: { cz: 310.6 },
        },
      ],
    },
  },

  {
    id: "smart-neo-planet",
    name: "スマスロ ネオプラネット",
    maker: "山佐",
    series: "ネオプラネット",
    category: "SMART",
    inHall: true,
    description: "スマスロ（ボーナス出現率）ベースの簡易判別。",
    metricsLabels: {
      bigLabel: "BIG+SBIG合算",
      regLabel: "REG",
      totalLabel: "ボーナス合算",
    },
    odds: {
      settings: [
        { s: 1, big: 280.4, reg: 596.7, total: 190.8, rate: 97.7 },
        { s: 2, big: 273.4, reg: 584.1, total: 186.2, rate: 99.0 },
        { s: 4, big: 247.3, reg: 553.6, total: 171.0, rate: 104.2 },
        { s: 5, big: 232.2, reg: 526.4, total: 161.1, rate: 107.9 },
        { s: 6, big: 210.5, reg: 504.2, total: 148.5, rate: 114.2 },
      ],
    },
  },

  {
    id: "smart-super-blackjack",
    name: "スマスロ スーパーブラックジャック",
    maker: "山佐",
    series: "スーパーブラックジャック",
    category: "SMART",
    inHall: true,
    description: "スマスロ（ボーナス初当り）ベースの簡易判別。",
    metricsLabels: {
      bigLabel: "ボーナス初当り",
      regLabel: null,
      totalLabel: null,
      extraMetrics: [{ id: "suika", label: "スイカ" }],
      suikaTrialsLabel: "スイカ回数",
      suikaCzHitsLabel: "ストックタイム直撃回数",
      suikaCzRateLabel: "スイカのストックタイム直撃当選率",
    },
    odds: {
      settings: [
        {
          s: 1,
          big: 241.7,
          reg: 1_000_000_000,
          total: 241.7,
          rate: 97.8,
          suikaCzRate: 0.004,
          extras: { suika: 99.9 },
        },
        {
          s: 2,
          big: 238.8,
          reg: 1_000_000_000,
          total: 238.8,
          rate: 98.7,
          suikaCzRate: 0.004,
          extras: { suika: 91.1 },
        },
        {
          s: 3,
          big: 235.9,
          reg: 1_000_000_000,
          total: 235.9,
          rate: 100.1,
          suikaCzRate: 0.005,
          extras: { suika: 87.7 },
        },
        {
          s: 4,
          big: 201.8,
          reg: 1_000_000_000,
          total: 201.8,
          rate: 105.7,
          suikaCzRate: 0.007,
          extras: { suika: 86.7 },
        },
        {
          s: 5,
          big: 194.9,
          reg: 1_000_000_000,
          total: 194.9,
          rate: 110.0,
          suikaCzRate: 0.014,
          extras: { suika: 85.0 },
        },
        {
          s: 6,
          big: 181.3,
          reg: 1_000_000_000,
          total: 181.3,
          rate: 112.7,
          suikaCzRate: 0.016,
          extras: { suika: 83.9 },
        },
      ],
    },
  },

  {
    id: "smart-monkey-v",
    name: "スマスロ モンキーターンV",
    maker: "山佐",
    series: "モンキーターン",
    category: "SMART",
    inHall: true,
    description: "AT終了時即優出・AT直撃（強チェ/強チャンス目）・5枚役・黒メダルベースの簡易判別。",
    metricsLabels: {
      bigLabel: "AT初当り",
      regLabel: null,
      totalLabel: null,
      extraMetrics: [
        { id: "fiveCoin", label: "5枚役" },
        { id: "blackMedal", label: "黒メダル" },
      ],
      suikaTrialsLabel: "AT終了回数",
    suikaCzHitsLabel: "即優出突入回数",
    suikaCzRateLabel: "即優出突入率",
    uraAtTrialsLabel: "強チェ/強チャンス目成立回数",
    uraAtHitsLabel: "AT直撃回数",
    uraAtRateLabel: "AT直撃当選率",
  },
  odds: {
    settings: [
      {
        s: 1,
        big: 389.9,
        reg: 1_000_000_000,
        total: 389.9,
        rate: 97.6,
        suikaCzRate: 0.016,
        uraAtRate: 0.004,
        extras: {
          fiveCoin: 38.15,
          blackMedal: 8000,
        },
      },
      {
        s: 2,
        big: 370.7,
        reg: 1_000_000_000,
        total: 370.7,
        rate: 98.7,
        suikaCzRate: 0.017,
        uraAtRate: 0.012,
        extras: {
          fiveCoin: 36.86,
          blackMedal: 6666.7,
        },
      },
      {
        s: 4,
        big: 334.2,
        reg: 1_000_000_000,
        total: 334.2,
        rate: 104.1,
        suikaCzRate: 0.022,
        uraAtRate: 0.02,
        extras: {
          fiveCoin: 30.27,
          blackMedal: 2500,
        },
      },
      {
        s: 5,
        big: 312.2,
        reg: 1_000_000_000,
        total: 312.2,
        rate: 108.2,
        suikaCzRate: 0.03,
        uraAtRate: 0.02,
        extras: {
          fiveCoin: 24.51,
          blackMedal: 2222.2,
        },
      },
      {
        s: 6,
        big: 292.2,
        reg: 1_000_000_000,
        total: 292.2,
        rate: 113.0,
        suikaCzRate: 0.037,
        uraAtRate: 0.02,
        extras: {
          fiveCoin: 22.53,
          blackMedal: 2222.2,
        },
      },
    ],
  },
  },
] satisfies readonly Machine[];
