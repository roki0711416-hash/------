export type MachineCategory = "JUG" | "HANAHANA" | string;

export type MachineMetricsLabels = {
  bigLabel?: string;
  regLabel?: string | null;
  totalLabel?: string | null;
  extraLabel?: string;
  extraMetrics?: { id: string; label: string }[];
  binomialMetrics?: {
    id: string;
    trialsLabel: string;
    hitsLabel: string;
    rateLabel?: string;
  }[];
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
  rate?: number;
  extra?: number;
  extras?: Record<string, number>;
  binomialRates?: Record<string, number>; // { metricId: probability(0..1) }
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
    id: "gogo-juggler-3",
    name: "ゴーゴージャグラー3",
    maker: "北電子",
    series: "ジャグラー",
    inHall: true,
    category: "JUG",
    description: "ゴーゴージャグラーシリーズ第3弾。",
    odds: {
      settings: [
        { s: 1, big: 259.0, reg: 354.2, total: 149.6, rate: 97.2 },
        { s: 2, big: 258.0, reg: 332.7, total: 145.3, rate: 98.2 },
        { s: 3, big: 257.0, reg: 306.2, total: 139.7, rate: 99.4 },
        { s: 4, big: 254.0, reg: 268.6, total: 130.5, rate: 101.6 },
        { s: 5, big: 247.3, reg: 247.3, total: 123.7, rate: 103.8 },
        { s: 6, big: 234.9, reg: 234.9, total: 117.4, rate: 106.5 },
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

  // --- UNIVERSAL L追加 ---
  {
    id: "okidoki-gold",
    name: "沖ドキ！GOLD",
    maker: "ユニバーサル",
    series: "沖ドキ！",
    category: "OTHER",
    inHall: true,
    description: "ボーナス確率ベースの簡易判別。",
    odds: {
      settings: [
        { s: 1, big: 299.6, reg: 175.3, total: 368.7, rate: 97.2 },
        { s: 2, big: 287.3, reg: 168.3, total: 346.2, rate: 98.7 },
        { s: 4, big: 266.7, reg: 157.7, total: 324.0, rate: 101.3 },
        { s: 5, big: 247.6, reg: 143.0, total: 297.9, rate: 104.7 },
        { s: 6, big: 237.0, reg: 134.0, total: 276.5, rate: 108.1 },
      ],
    },
  },
  {
    id: "okidoki-black",
    name: "沖ドキ！BLACK",
    maker: "ユニバーサル",
    series: "沖ドキ！",
    category: "OTHER",
    inHall: true,
    description: "ボーナス確率ベースの簡易判別。",
    odds: {
      settings: [
        { s: 1, big: 288.7, reg: 214.1, total: 292.5, rate: 97.2 },
        { s: 2, big: 277.9, reg: 205.6, total: 283.8, rate: 98.7 },
        { s: 4, big: 265.8, reg: 188.5, total: 267.0, rate: 101.9 },
        { s: 5, big: 254.1, reg: 173.3, total: 251.7, rate: 104.8 },
        { s: 6, big: 243.1, reg: 160.8, total: 239.0, rate: 108.6 },
      ],
    },
  },
  {
    id: "okidoki-duo-encore",
    name: "スマスロ 沖ドキ！DUOアンコール",
    maker: "ユニバーサル",
    series: "沖ドキ！",
    category: "SMART",
    inHall: true,
    description: "ボーナス初当りベースの簡易判別。",
    metricsLabels: {
      bigLabel: "ボーナス初当り",
      regLabel: null,
      totalLabel: null,
    },
    odds: {
      settings: [
        { s: 1, big: 240.1, reg: 1_000_000_000, total: 240.1, rate: 97.2 },
        { s: 2, big: 230.2, reg: 1_000_000_000, total: 230.2, rate: 98.6 },
        { s: 3, big: 215.8, reg: 1_000_000_000, total: 215.8, rate: 102.4 },
        { s: 5, big: 192.1, reg: 1_000_000_000, total: 192.1, rate: 106.8 },
        { s: 6, big: 181.0, reg: 1_000_000_000, total: 181.0, rate: 110.0 },
      ],
    },
  },
  {
    id: "smart-guilty-crown-2",
    name: "スマスロ ギルティクラウン2",
    maker: "ユニバーサル",
    series: "ギルティクラウン",
    category: "SMART",
    inHall: true,
    description: "ボーナス/AT/合算確率ベースの簡易判別。",
    metricsLabels: {
      bigLabel: "ボーナス",
      regLabel: "AT",
      totalLabel: "ボーナス&AT合算",
    },
    odds: {
      settings: [
        { s: 1, big: 315.1, reg: 596.4, total: 206.2, rate: 97.9 },
        { s: 2, big: 312.1, reg: 571.6, total: 201.9, rate: 98.9 },
        { s: 3, big: 309.1, reg: 528.8, total: 195.1, rate: 101.4 },
        { s: 4, big: 297.9, reg: 447.0, total: 178.8, rate: 105.4 },
        { s: 5, big: 284.9, reg: 410.5, total: 168.2, rate: 110.0 },
        { s: 6, big: 273.1, reg: 375.5, total: 158.1, rate: 113.6 },
      ],
    },
  },
  {
    id: "smart-magireco",
    name: "L マギアレコード 魔法少女まどか☆マギカ外伝",
    maker: "ユニバーサル",
    series: "まどマギ",
    category: "SMART",
    inHall: true,
    description: "L（ボーナス初当り/AT初当り）ベースの簡易判別。",
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

  // --- ELECO L追加 ---
  {
    id: "smart-shaman-king",
    name: "スマスロ シャーマンキング",
    maker: "ユニバーサル",
    series: "シャーマンキング",
    category: "SMART",
    inHall: true,
    description: "初当り/AT初当り/機械割 + 共通ベルAで簡易判別。",
    metricsLabels: {
      bigLabel: "初当り合算",
      regLabel: "AT初当り",
      totalLabel: null,
      extraMetrics: [{ id: "commonBellA", label: "共通ベルA" }],
      binomialMetrics: [
        {
          id: "episodeBonus",
          trialsLabel: "初当り回数",
          hitsLabel: "EPボーナス回数",
          rateLabel: "EPボーナス当選率",
        },
      ],
    },
    odds: {
      settings: [
        {
          s: 1,
          big: 288.8,
          reg: 573.6,
          total: 288.8,
          rate: 98.0,
          extras: { commonBellA: 48.0 },
          binomialRates: { episodeBonus: 0.004 },
        },
        {
          s: 2,
          big: 280.0,
          reg: 553.2,
          total: 280.0,
          rate: 98.9,
          extras: { commonBellA: 47.2 },
          binomialRates: { episodeBonus: 0.004 },
        },
        {
          s: 3,
          big: 268.4,
          reg: 523.0,
          total: 268.4,
          rate: 101.2,
          extras: { commonBellA: 44.8 },
          binomialRates: { episodeBonus: 0.008 },
        },
        {
          s: 4,
          big: 248.1,
          reg: 461.2,
          total: 248.1,
          rate: 105.9,
          extras: { commonBellA: 40.7 },
          binomialRates: { episodeBonus: 0.016 },
        },
        {
          s: 5,
          big: 227.6,
          reg: 412.8,
          total: 227.6,
          rate: 109.8,
          extras: { commonBellA: 38.1 },
          binomialRates: { episodeBonus: 0.02 },
        },
        {
          s: 6,
          big: 207.1,
          reg: 367.3,
          total: 207.1,
          rate: 114.3,
          extras: { commonBellA: 31.8 },
          binomialRates: { episodeBonus: 0.027 },
        },
      ],
    },
  },

  // --- SPIKY L追加 ---
  {
    id: "smart-tokyo-ghoul",
    name: "L 東京喰種",
    maker: "スパイキー",
    series: "東京喰種",
    category: "SMART",
    inHall: true,
    description: "L（初当り）ベースの簡易判別。",
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
    name: "L ダーリン・イン・ザ・フランキス",
    maker: "スパイキー",
    series: "ダーリン・イン・ザ・フランキス",
    category: "SMART",
    inHall: true,
    description: "L（ボーナス初当り/ボーナス高確率）ベースの簡易判別。",
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

  // --- SAMMY L追加 ---
  {
    id: "smart-bakemonogatari",
    name: "L 化物語",
    maker: "サミー",
    series: "化物語",
    category: "SMART",
    inHall: true,
    description: "L（AT初当り）ベースの簡易判別。",
    metricsLabels: {
      bigLabel: "AT初当り",
      regLabel: null,
      totalLabel: null,
      extraMetrics: [{ id: "suika", label: "スイカ" }],
      uraAtTrialsLabel: "弱チェリー回数",
      uraAtHitsLabel: "AT直撃回数",
      uraAtRateLabel: "弱チェAT直撃率",
    },
    odds: {
      settings: [
        {
          s: 1,
          big: 265.1,
          reg: 1_000_000_000,
          total: 265.1,
          rate: 97.9,
          uraAtRate: 0.004,
          extras: { suika: 87.4 },
        },
        {
          s: 2,
          big: 260.7,
          reg: 1_000_000_000,
          total: 260.7,
          rate: 98.9,
          uraAtRate: 0.008,
          extras: { suika: 85.8 },
        },
        {
          s: 3,
          big: 252.1,
          reg: 1_000_000_000,
          total: 252.1,
          rate: 100.9,
          uraAtRate: 0.013,
          extras: { suika: 84.9 },
        },
        {
          s: 4,
          big: 238.8,
          reg: 1_000_000_000,
          total: 238.8,
          rate: 105.0,
          uraAtRate: 0.021,
          extras: { suika: 79.7 },
        },
        {
          s: 5,
          big: 230.8,
          reg: 1_000_000_000,
          total: 230.8,
          rate: 107.8,
          uraAtRate: 0.029,
          extras: { suika: 74.8 },
        },
        {
          s: 6,
          big: 219.6,
          reg: 1_000_000_000,
          total: 219.6,
          rate: 112.1,
          uraAtRate: 0.038,
          extras: { suika: 69.9 },
        },
      ],
    },
  },

  {
    id: "smart-tokyo-revengers",
    name: "L 東京リベンジャーズ",
    maker: "サミー",
    series: "東京リベンジャーズ",
    category: "SMART",
    inHall: true,
    description: "L（初当り/AT）ベースの簡易判別。",
    metricsLabels: {
      bigLabel: "初当り",
      regLabel: null,
      totalLabel: null,
      extraMetrics: [
        { id: "at", label: "AT" },
        { id: "commonBell", label: "共通ベル" },
        { id: "chudanCherry", label: "中段チェリー" },
      ],
    },
    odds: {
      settings: [
        {
          s: 1,
          big: 282.4,
          reg: 1_000_000_000,
          total: 282.4,
          rate: 97.8,
          extras: { at: 482.2, commonBell: 99.3, chudanCherry: 16384.0 },
        },
        {
          s: 2,
          big: 279.5,
          reg: 1_000_000_000,
          total: 279.5,
          rate: 98.8,
          extras: { at: 474.7, commonBell: 96.4, chudanCherry: 16384.0 },
        },
        {
          s: 3,
          big: 272.2,
          reg: 1_000_000_000,
          total: 272.2,
          rate: 101.4,
          extras: { at: 456.9, commonBell: 89.8, chudanCherry: 16384.0 },
        },
        {
          s: 4,
          big: 255.8,
          reg: 1_000_000_000,
          total: 255.8,
          rate: 106.3,
          extras: { at: 414.0, commonBell: 84.0, chudanCherry: 13107.2 },
        },
        {
          s: 5,
          big: 249.1,
          reg: 1_000_000_000,
          total: 249.1,
          rate: 111.2,
          extras: { at: 393.8, commonBell: 79.0, chudanCherry: 13107.2 },
        },
        {
          s: 6,
          big: 240.1,
          reg: 1_000_000_000,
          total: 240.1,
          rate: 114.9,
          extras: { at: 373.1, commonBell: 77.1, chudanCherry: 10922.7 },
        },
      ],
    },
  },

  {
    id: "smart-hokuto-no-ken",
    name: "L北斗の拳",
    maker: "サミー",
    series: "北斗の拳",
    category: "SMART",
    inHall: true,
    description: "L（BB初当り）ベースの簡易判別。",
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

  {
    id: "smart-hokuto-no-ken-tensei-2",
    name: "L北斗の拳 転生の章2",
    maker: "サミー",
    series: "北斗の拳",
    category: "SMART",
    inHall: true,
    description: "L（AT初当り）ベースの簡易判別。50枚あたり約31.5G（独自調査値）",
    metricsLabels: {
      bigLabel: "AT初当り",
      regLabel: null,
      totalLabel: null,
    },
    odds: {
      settings: [
        { s: 1, big: 366.0, reg: 1_000_000_000, total: 366.0, rate: 97.6 },
        { s: 2, big: 357.0, reg: 1_000_000_000, total: 357.0, rate: 98.4 },
        { s: 3, big: 336.3, reg: 1_000_000_000, total: 336.3, rate: 100.7 },
        { s: 4, big: 298.7, reg: 1_000_000_000, total: 298.7, rate: 106.2 },
        { s: 5, big: 283.2, reg: 1_000_000_000, total: 283.2, rate: 111.1 },
        { s: 6, big: 273.1, reg: 1_000_000_000, total: 273.1, rate: 114.9 },
      ],
    },
  },

  // --- SAMMY 追加（p-town 4160） ---
  {
    id: "kabaneri-of-the-iron-fortress",
    name: "パチスロ甲鉄城のカバネリ",
    maker: "サミー",
    series: "甲鉄城のカバネリ",
    category: "OTHER",
    inHall: true,
    description:
      "ボーナス合算/ST合算ベースの簡易判別。確率・機械割はp-town（4160）参照。50枚あたり約33G（独自調査値）。",
    metricsLabels: {
      bigLabel: "ボーナス合算",
      regLabel: "ST合算",
      totalLabel: null,
      binomialMetrics: [
        {
          id: "commonBell6",
          trialsLabel: "総ゲーム数",
          hitsLabel: "共通6枚ベル回数",
          rateLabel: "共通6枚ベル確率",
        },
      ],
    },
    odds: {
      settings: [
        { s: 1, big: 237.0, reg: 407.9, total: 237.0, rate: 97.8, binomialRates: { commonBell6: 1 / 26.6 } },
        { s: 2, big: 230.7, reg: 393.2, total: 230.7, rate: 98.8, binomialRates: { commonBell6: 1 / 26.6 } },
        { s: 3, big: 214.0, reg: 372.4, total: 214.0, rate: 100.7, binomialRates: { commonBell6: 1 / 25.9 } },
        { s: 4, big: 186.5, reg: 327.2, total: 186.5, rate: 105.9, binomialRates: { commonBell6: 1 / 25.4 } },
        { s: 5, big: 171.3, reg: 307.3, total: 171.3, rate: 108.4, binomialRates: { commonBell6: 1 / 24.9 } },
        { s: 6, big: 151.3, reg: 290.6, total: 151.3, rate: 110.0, binomialRates: { commonBell6: 1 / 24.2 } },
      ],
    },
  },

  // --- ENTERRISE L追加 ---
  {
    id: "smart-onimusha-3",
    name: "L鬼武者3",
    maker: "エンターライズ",
    series: "鬼武者",
    category: "SMART",
    inHall: true,
    description: "L（AT初当り）ベースの簡易判別。50枚あたり約33G（独自調査値）",
    metricsLabels: {
      bigLabel: "AT初当り",
      regLabel: null,
      totalLabel: null,
    },
    odds: {
      settings: [
        { s: 1, big: 379.7, reg: 1_000_000_000, total: 379.7, rate: 97.5 },
        { s: 2, big: 372.7, reg: 1_000_000_000, total: 372.7, rate: 98.3 },
        { s: 3, big: 352.8, reg: 1_000_000_000, total: 352.8, rate: 100.2 },
        { s: 4, big: 306.5, reg: 1_000_000_000, total: 306.5, rate: 105.2 },
        { s: 5, big: 297.9, reg: 1_000_000_000, total: 297.9, rate: 109.2 },
        { s: 6, big: 293.1, reg: 1_000_000_000, total: 293.1, rate: 113.0 },
      ],
    },
  },

  // --- Daiichi L追加 ---
  {
    id: "smart-shin-ikkitousen",
    name: "L 真・一騎当千",
    maker: "Daiichi",
    series: "一騎当千",
    category: "SMART",
    inHall: true,
    description:
      "L（AT初当り）ベースの簡易判別。確率・機械割はp-town（4650）参照（bonus.jpg OCR）。",
    metricsLabels: {
      bigLabel: "AT初当り",
      regLabel: null,
      totalLabel: null,
      binomialMetrics: [
        {
          id: "bell",
          trialsLabel: "通常時ゲーム数",
          hitsLabel: "1枚or11枚ベル回数",
          rateLabel: "1枚or11枚ベル確率",
        },
      ],
    },
    odds: {
      settings: [
        { s: 1, big: 321.3, reg: 1_000_000_000, total: 321.3, rate: 97.6, binomialRates: { bell: 1 / 5.12 } },
        { s: 2, big: 310.8, reg: 1_000_000_000, total: 310.8, rate: 99.0, binomialRates: { bell: 1 / 5.08 } },
        { s: 3, big: 291.6, reg: 1_000_000_000, total: 291.6, rate: 101.0, binomialRates: { bell: 1 / 5.04 } },
        { s: 4, big: 245.7, reg: 1_000_000_000, total: 245.7, rate: 105.8, binomialRates: { bell: 1 / 4.99 } },
        { s: 5, big: 232.3, reg: 1_000_000_000, total: 232.3, rate: 109.5, binomialRates: { bell: 1 / 4.94 } },
        { s: 6, big: 222.1, reg: 1_000_000_000, total: 222.1, rate: 112.0, binomialRates: { bell: 1 / 4.89 } },
      ],
    },
  },

  {
    id: "smart-zettai-shogeki-4",
    name: "L 絶対衝激Ⅳ",
    maker: "Daiichi",
    series: "絶対衝激",
    category: "SMART",
    inHall: true,
    description:
      "ボーナス/AT初当りベースの簡易判別。確率・機械割はp-town（4903）参照。ボーナス直撃は（直撃確率：日曜日以外）を二項で反映。",
    metricsLabels: {
      bigLabel: "ボーナス",
      regLabel: "AT",
      totalLabel: null,
      binomialMetrics: [
        {
          id: "bonusDirect",
          trialsLabel: "通常時ゲーム数",
          hitsLabel: "ボーナス直撃回数",
          rateLabel: "ボーナス直撃率",
        },
      ],
    },
    odds: {
      settings: [
        {
          s: 1,
          big: 270.0,
          reg: 543.0,
          total: 270.0,
          rate: 97.2,
          binomialRates: { bonusDirect: 1 / 5738.6 },
        },
        {
          s: 2,
          big: 261.0,
          reg: 501.0,
          total: 261.0,
          rate: 98.6,
          binomialRates: { bonusDirect: 1 / 4456.9 },
        },
        {
          s: 3,
          big: 254.0,
          reg: 450.0,
          total: 254.0,
          rate: 100.6,
          binomialRates: { bonusDirect: 1 / 3872.6 },
        },
        {
          s: 4,
          big: 241.0,
          reg: 357.0,
          total: 241.0,
          rate: 105.8,
          binomialRates: { bonusDirect: 1 / 3328.6 },
        },
        {
          s: 5,
          big: 231.0,
          reg: 304.0,
          total: 231.0,
          rate: 109.0,
          binomialRates: { bonusDirect: 1 / 2819.5 },
        },
        {
          s: 6,
          big: 225.0,
          reg: 266.0,
          total: 225.0,
          rate: 112.5,
          binomialRates: { bonusDirect: 1 / 1921.2 },
        },
      ],
    },
  },

  // --- KONAMI L追加 ---
  {
    id: "konami_tenseiken",
    name: "パチスロ 転生したら剣でした",
    maker: "コナミアミューズメント",
    series: "転生したら剣でした",
    category: "SMART",
    inHall: true,
    description: "L（AT初当り）ベースの簡易判別。確率・機械割はp-town（4843）参照。",
    metricsLabels: {
      bigLabel: "AT",
      regLabel: null,
      totalLabel: null,
      binomialMetrics: [
        {
          id: "franSleepAt",
          trialsLabel: "フランおやすみ中開始回数",
          hitsLabel: "AT当選回数",
          rateLabel: "フランおやすみ中開始時AT当選率",
        },
      ],
    },
    odds: {
      settings: [
        {
          s: 1,
          big: 403.8,
          reg: 1_000_000_000,
          total: 403.8,
          rate: 97.9,
          binomialRates: { franSleepAt: 0.09 },
        },
        {
          s: 2,
          big: 396.0,
          reg: 1_000_000_000,
          total: 396.0,
          rate: 99.0,
          binomialRates: { franSleepAt: 0.1 },
        },
        {
          s: 3,
          big: 373.4,
          reg: 1_000_000_000,
          total: 373.4,
          rate: 101.2,
          binomialRates: { franSleepAt: 0.11 },
        },
        {
          s: 4,
          big: 340.7,
          reg: 1_000_000_000,
          total: 340.7,
          rate: 105.7,
          binomialRates: { franSleepAt: 0.12 },
        },
        {
          s: 5,
          big: 325.9,
          reg: 1_000_000_000,
          total: 325.9,
          rate: 109.1,
          binomialRates: { franSleepAt: 0.13 },
        },
        {
          s: 6,
          big: 312.8,
          reg: 1_000_000_000,
          total: 312.8,
          rate: 112.1,
          binomialRates: { franSleepAt: 0.14 },
        },
      ],
    },
  },

  {
    id: "konami_ginei_denethese",
    name: "パチスロ 銀河英雄伝説 Die Neue These",
    maker: "コナミアミューズメント",
    series: "銀河英雄伝説",
    category: "SMART",
    inHall: true,
    description: "L（ボーナス/ST）ベースの簡易判別。確率・機械割はp-town（4895）参照。",
    metricsLabels: {
      bigLabel: "ボーナス",
      regLabel: "ST",
      totalLabel: null,
    },
    odds: {
      settings: [
        { s: 1, big: 256.8, reg: 393.7, total: 256.8, rate: 97.9 },
        { s: 2, big: 253.6, reg: 388.5, total: 253.6, rate: 98.9 },
        { s: 3, big: 249.0, reg: 372.8, total: 249.0, rate: 100.2 },
        { s: 4, big: 217.8, reg: 306.2, total: 217.8, rate: 105.6 },
        { s: 5, big: 200.4, reg: 274.2, total: 200.4, rate: 108.4 },
        { s: 6, big: 191.9, reg: 259.9, total: 191.9, rate: 111.0 },
      ],
    },
  },

  {
    id: "konami_watakon",
    name: "わたしの幸せな結婚",
    maker: "コナミアミューズメント",
    series: "わたしの幸せな結婚",
    category: "SMART",
    inHall: true,
    description: "L（ボーナス/AT初当り）ベースの簡易判別。確率・機械割はp-town（4803）参照。",
    metricsLabels: {
      bigLabel: "ボーナス",
      regLabel: "AT初当り",
      totalLabel: null,
    },
    odds: {
      settings: [
        { s: 1, big: 290.8, reg: 594.3, total: 290.8, rate: 97.9 },
        { s: 2, big: 286.5, reg: 583.4, total: 286.5, rate: 98.7 },
        { s: 3, big: 277.3, reg: 558.8, total: 277.3, rate: 100.4 },
        { s: 4, big: 255.3, reg: 494.7, total: 255.3, rate: 105.1 },
        { s: 5, big: 251.4, reg: 484.3, total: 251.4, rate: 108.0 },
        { s: 6, big: 249.4, reg: 479.4, total: 249.4, rate: 112.0 },
      ],
    },
  },

  {
    id: "konami_magihalo8",
    name: "マジカルハロウィン8",
    maker: "コナミアミューズメント",
    series: "マジカルハロウィン",
    category: "SMART",
    inHall: true,
    description:
      "L（ボーナス合算/ART初当り）ベースの簡易判別。確率・機械割はp-town（4423）参照（bonus.jpg OCR）。BIG内訳（赤7/白7/異色）やREG確率も掲載されているが、判別は合算系の値のみ反映。",
    metricsLabels: {
      bigLabel: "ボーナス合算",
      regLabel: "ART初当り",
      totalLabel: "BIG合算",
    },
    odds: {
      settings: [
        { s: 1, big: 177.1, reg: 352.2, total: 334.4, rate: 97.7 },
        { s: 2, big: 175.7, reg: 335.5, total: 332.7, rate: 98.8 },
        { s: 3, big: 174.3, reg: 297.1, total: 331.0, rate: 101.3 },
        { s: 4, big: 171.6, reg: 269.3, total: 327.7, rate: 105.2 },
        { s: 5, big: 170.2, reg: 254.4, total: 326.1, rate: 107.3 },
        { s: 6, big: 167.6, reg: 226.8, total: 322.8, rate: 109.2 },
      ],
    },
  },

  {
    id: "konami_magihalo_bt",
    name: "マジカルハロウィン ボーナストリガー",
    maker: "コナミアミューズメント",
    series: "マジカルハロウィン",
    category: "SMART",
    inHall: true,
    description: "L（BIG/REG/合算）ベースの簡易判別。確率・機械割はp-town（4854）参照。ボーナス出現率（bonus.jpg）はOCR抽出。",
    metricsLabels: {
      bigLabel: "BIG",
      regLabel: "REG",
      totalLabel: "合算",
    },
    odds: {
      settings: [
        { s: 1, big: 299.3, reg: 390.1, total: 169.9, rate: 97.5 },
        { s: 2, big: 295.3, reg: 347.1, total: 159.9, rate: 99.3 },
        { s: 5, big: 273.3, reg: 301.1, total: 143.1, rate: 104.2 },
        { s: 6, big: 262.2, reg: 262.1, total: 131.0, rate: 108.1 },
      ],
    },
  },

  {
    id: "sankyo_enen",
    name: "Lパチスロ炎炎ノ消防隊",
    maker: "SANKYO",
    series: "炎炎ノ消防隊",
    category: "SMART",
    inHall: true,
    description: "L（初当り/ボーナス/炎炎ループ）ベースの簡易判別。50枚あたり約33.8G（独自調査値）。確率・機械割はp-town（4555）参照（bonus.jpg OCR）。",
    metricsLabels: {
      bigLabel: "初当り",
      regLabel: "ボーナス",
      totalLabel: "炎炎ループ",
      binomialMetrics: [
        {
          id: "adra_burst",
          trialsLabel: "通常時ゲーム数（目安）",
          hitsLabel: "アドラバースト回数",
          rateLabel: "出現率",
        },
      ],
    },
    odds: {
      settings: [
        { s: 1, big: 197, reg: 291, total: 790, rate: 97.7, binomialRates: { adra_burst: 1 / 15000 } },
        { s: 2, big: 194, reg: 282, total: 756, rate: 99.2, binomialRates: { adra_burst: 1 / 14000 } },
        { s: 4, big: 182, reg: 257, total: 669, rate: 104.4, binomialRates: { adra_burst: 1 / 12000 } },
        { s: 5, big: 173, reg: 239, total: 611, rate: 110.1, binomialRates: { adra_burst: 1 / 10000 } },
        { s: 6, big: 169, reg: 230, total: 573, rate: 114.9, binomialRates: { adra_burst: 1 / 9000 } },
      ],
    },
  },

  {
    id: "sankyo_kaguya",
    name: "パチスロかぐや様は告らせたい",
    maker: "SANKYO",
    series: "かぐや様は告らせたい",
    category: "SMART",
    inHall: true,
    description: "L（ボーナス）ベースの簡易判別。50枚あたり約31.0G（独自調査値）。確率・機械割はp-town（4618）参照（bonus.jpg OCR）。",
    metricsLabels: {
      bigLabel: "ボーナス",
      regLabel: null,
      totalLabel: null,
    },
    odds: {
      settings: [
        { s: 1, big: 362, reg: 1_000_000_000, total: 362, rate: 97.7 },
        { s: 2, big: 360, reg: 1_000_000_000, total: 360, rate: 98.8 },
        { s: 3, big: 357, reg: 1_000_000_000, total: 357, rate: 101.2 },
        { s: 4, big: 349, reg: 1_000_000_000, total: 349, rate: 105.8 },
        { s: 5, big: 343, reg: 1_000_000_000, total: 343, rate: 110.8 },
        { s: 6, big: 335, reg: 1_000_000_000, total: 335, rate: 114.9 },
      ],
    },
  },

  {
    id: "sankyo_karakuri",
    name: "パチスロからくりサーカス",
    maker: "SANKYO",
    series: "からくりサーカス",
    category: "SMART",
    inHall: true,
    description:
      "L（AT初当り）ベースの簡易判別。50枚あたり約33.7G（独自調査値）。確率・機械割はp-town（4360）参照（bonus.jpg OCR）。幕間チャンス当選率は binomial で加味（※設定1:約1/3000、設定6:約1/1000のみ反映）。",
    metricsLabels: {
      bigLabel: "AT初当り",
      regLabel: null,
      totalLabel: null,
      binomialMetrics: [
        {
          id: "makuma_chance",
          trialsLabel: "通常時ゲーム数（目安）",
          hitsLabel: "幕間チャンス回数",
          rateLabel: "当選率",
        },
      ],
    },
    odds: {
      settings: [
        { s: 1, big: 564, reg: 1_000_000_000, total: 564, rate: 97.5, binomialRates: { makuma_chance: 1 / 3000 } },
        { s: 2, big: 543, reg: 1_000_000_000, total: 543, rate: 98.7 },
        { s: 4, big: 469, reg: 1_000_000_000, total: 469, rate: 103.0 },
        { s: 5, big: 451, reg: 1_000_000_000, total: 451, rate: 108.1 },
        { s: 6, big: 447, reg: 1_000_000_000, total: 447, rate: 114.9, binomialRates: { makuma_chance: 1 / 1000 } },
      ],
    },
  },

  {
    id: "sankyo_valvrave",
    name: "パチスロ 革命機ヴァルヴレイヴ",
    maker: "SANKYO",
    series: "革命機ヴァルヴレイヴ",
    category: "SMART",
    inHall: true,
    description:
      "L（CZ/ボーナス初当り）ベースの簡易判別。確率・機械割はp-town（4244）参照（bonus.jpg OCR）。革命ボーナス当選時の革命ラッシュ当選率（設定差）は binomial で加味。",
    metricsLabels: {
      bigLabel: "ボーナス初当り",
      regLabel: null,
      totalLabel: "CZ",
      binomialMetrics: [
        {
          id: "rev_bonus_to_rev_rush",
          trialsLabel: "革命ボーナス回数",
          hitsLabel: "革命ラッシュ当選回数",
          rateLabel: "当選率",
        },
      ],
    },
    odds: {
      settings: [
        { s: 1, big: 519, reg: 1_000_000_000, total: 277, rate: 97.3, binomialRates: { rev_bonus_to_rev_rush: 0.05 } },
        { s: 2, big: 516, reg: 1_000_000_000, total: 275, rate: 98.3, binomialRates: { rev_bonus_to_rev_rush: 0.06 } },
        { s: 3, big: 514, reg: 1_000_000_000, total: 274, rate: 100.8, binomialRates: { rev_bonus_to_rev_rush: 0.07 } },
        { s: 4, big: 507, reg: 1_000_000_000, total: 269, rate: 103.2, binomialRates: { rev_bonus_to_rev_rush: 0.09 } },
        { s: 5, big: 499, reg: 1_000_000_000, total: 264, rate: 107.9, binomialRates: { rev_bonus_to_rev_rush: 0.10 } },
        { s: 6, big: 490, reg: 1_000_000_000, total: 258, rate: 114.9, binomialRates: { rev_bonus_to_rev_rush: 0.13 } },
      ],
    },
  },

  {
    id: "sankyo_valvrave2",
    name: "Lパチスロ 革命機ヴァルヴレイヴ2",
    maker: "SANKYO",
    series: "革命機ヴァルヴレイヴ",
    category: "SMART",
    inHall: true,
    description:
      "L（初当り）ベースの簡易判別。確率はp-town（4885）の bonus.jpg OCR抽出（初当り（ボーナス・AT直撃の合算））。機械割はページ基本情報のレンジ（97.7%〜114.9%）のみ確認できたため、未確定の設定は '-' 表示。",
    metricsLabels: {
      bigLabel: "初当り（ボーナス＋AT直撃）",
      regLabel: null,
      totalLabel: null,
    },
    odds: {
      settings: [
        { s: 1, big: 476, reg: 1_000_000_000, total: 476, rate: 97.7 },
        { s: 2, big: 473, reg: 1_000_000_000, total: 473, rate: Number.NaN },
        { s: 4, big: 464, reg: 1_000_000_000, total: 464, rate: Number.NaN },
        { s: 5, big: 459, reg: 1_000_000_000, total: 459, rate: Number.NaN },
        { s: 6, big: 456, reg: 1_000_000_000, total: 456, rate: 114.9 },
      ],
    },
  },

  // --- YAMASA L追加 ---
  {
    id: "smart-god-eater-resurrection",
    name: "L ゴッドイーター リザレクション",
    maker: "山佐",
    series: "ゴッドイーター",
    category: "SMART",
    inHall: true,
    description: "L（初当り/CZ/AT直撃）ベースの簡易判別。",
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
    name: "L ネオプラネット",
    maker: "山佐",
    series: "ネオプラネット",
    category: "SMART",
    inHall: true,
    description: "L（ボーナス出現率）ベースの簡易判別。",
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
    id: "smart-tekken-6",
    name: "L 鉄拳6",
    maker: "山佐",
    series: "鉄拳",
    category: "SMART",
    inHall: true,
    description: "L（ボーナス/AT初当り）ベースの簡易判別。",
    metricsLabels: {
      bigLabel: "ボーナス",
      regLabel: "AT",
      totalLabel: null,
    },
    odds: {
      settings: [
        { s: 1, big: 264.7, reg: 497.0, total: 264.7, rate: 97.9 },
        { s: 2, big: 261.5, reg: 484.1, total: 261.5, rate: 98.9 },
        { s: 3, big: 255.3, reg: 456.8, total: 255.3, rate: 100.5 },
        { s: 4, big: 227.6, reg: 397.6, total: 227.6, rate: 105.2 },
        { s: 5, big: 220.3, reg: 366.4, total: 220.3, rate: 110.3 },
        { s: 6, big: 218.5, reg: 358.5, total: 218.5, rate: 114.9 },
      ],
    },
  },

  {
    id: "smart-super-blackjack",
    name: "L スーパーブラックジャック",
    maker: "山佐",
    series: "スーパーブラックジャック",
    category: "SMART",
    inHall: true,
    description: "L（ボーナス初当り）ベースの簡易判別。",
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
    name: "L モンキーターンV",
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

  // --- ENTER RISE L追加 ---
  {
    id: "smart-monster-hunter-rise",
    name: "L モンスターハンターライズ",
    maker: "エンターライズ",
    series: "モンスターハンター",
    category: "SMART",
    inHall: true,
    description: "L（ボーナス初当り）ベースの簡易判別。50枚あたり約32.7G（独自調査値）",
    metricsLabels: {
      bigLabel: "ボーナス初当り",
      regLabel: null,
      totalLabel: null,
    },
    odds: {
      settings: [
        { s: 1, big: 309.5, reg: 1_000_000_000, total: 309.5, rate: 97.9 },
        { s: 2, big: 301.4, reg: 1_000_000_000, total: 301.4, rate: 98.8 },
        { s: 3, big: 290.8, reg: 1_000_000_000, total: 290.8, rate: 100.3 },
        { s: 4, big: 256.4, reg: 1_000_000_000, total: 256.4, rate: 105.4 },
        { s: 5, big: 237.1, reg: 1_000_000_000, total: 237.1, rate: 110.1 },
        { s: 6, big: 230.8, reg: 1_000_000_000, total: 230.8, rate: 114.3 },
      ],
    },
  },

  // --- ENTERRISE DMC5 追加 --- 
  {
    id: "enterrise_dmc5",
    name: "L デビル メイ クライ5",
    maker: "エンターライズ",
    series: "デビル メイ クライ",
    inHall: true,
    category: "SMART",
    description: "L（AT初当り）ベースの簡易判別。50枚あたり約33G（独自調査値）",
    metricsLabels: {
      bigLabel: "AT初当り",
      regLabel: null,
      totalLabel: null,
    },
    odds: {
      settings: [
        { s: 1, big: 389.9, reg: 1_000_000_000, total: 389.9, rate: 97.5 },
        { s: 2, big: 376.2, reg: 1_000_000_000, total: 376.2, rate: 98.7 },
        { s: 3, big: 358.2, reg: 1_000_000_000, total: 358.2, rate: 100.6 },
        { s: 4, big: 319.2, reg: 1_000_000_000, total: 319.2, rate: 105.1 },
        { s: 5, big: 299.7, reg: 1_000_000_000, total: 299.7, rate: 110.0 },
        { s: 6, big: 287.6, reg: 1_000_000_000, total: 287.6, rate: 114.9 },
      ],
    },
  },

  // --- ENTERRISE BIO5 追加 ---
  {
    id: "enterrise_bio5",
    name: "L バイオハザード5",
    maker: "エンターライズ",
    series: "バイオハザード",
    inHall: true,
    category: "SMART",
    description: "L（AT初当り）ベースの簡易判別。50枚あたり約33.0G（独自調査値）",
    metricsLabels: {
      bigLabel: "AT初当り",
      regLabel: null,
      totalLabel: null,
    },
    odds: {
      settings: [
        { s: 1, big: 325.8, reg: 1_000_000_000, total: 325.8, rate: 97.8 },
        { s: 2, big: 314.4, reg: 1_000_000_000, total: 314.4, rate: 98.8 },
        { s: 3, big: 298.2, reg: 1_000_000_000, total: 298.2, rate: 100.6 },
        { s: 4, big: 271.4, reg: 1_000_000_000, total: 271.4, rate: 104.6 },
        { s: 5, big: 249.6, reg: 1_000_000_000, total: 249.6, rate: 108.9 },
        { s: 6, big: 236.2, reg: 1_000_000_000, total: 236.2, rate: 114.9 },
      ],
    },
  },

  // --- NEWGIN 無職転生 追加 ---
  {
    id: "newgin_mushoku_tensei",
    name: "L 無職転生～異世界行ったら本気だす～",
    maker: "ニューギン",
    series: "無職転生",
    inHall: true,
    category: "SMART",
    description: "L（AT初当り）ベースの簡易判別。50枚あたり約33G（独自調査値）",
    metricsLabels: {
      bigLabel: "AT初当り",
      regLabel: null,
      totalLabel: null,
    },
    odds: {
      settings: [
        { s: 1, big: 416, reg: 1_000_000_000, total: 416, rate: 97.7 },
        { s: 2, big: 406, reg: 1_000_000_000, total: 406, rate: 99.1 },
        { s: 3, big: 394, reg: 1_000_000_000, total: 394, rate: 100.9 },
        { s: 4, big: 361, reg: 1_000_000_000, total: 361, rate: 105.4 },
        { s: 5, big: 327, reg: 1_000_000_000, total: 327, rate: 109.5 },
        { s: 6, big: 292, reg: 1_000_000_000, total: 292, rate: 113.7 },
      ],
    },
  },

  // --- KYORAKU アズレン 追加 ---
  {
    id: "kyoraku_azuren",
    name: "L アズールレーン THE ANIMATION",
    maker: "京楽",
    series: "アズールレーン",
    inHall: true,
    category: "SMART",
    description: "L（初当り合算）ベースの簡易判別。初当り合算は参考値。",
    metricsLabels: {
      bigLabel: "初当り合算",
      regLabel: null,
      totalLabel: null,
    },
    odds: {
      settings: [
        { s: 1, big: 167.4, reg: 1_000_000_000, total: 167.4, rate: 97.9 },
        { s: 2, big: 166.5, reg: 1_000_000_000, total: 166.5, rate: 98.6 },
        { s: 3, big: 164.3, reg: 1_000_000_000, total: 164.3, rate: 100.7 },
        { s: 4, big: 161.3, reg: 1_000_000_000, total: 161.3, rate: 105.3 },
        { s: 5, big: 158.9, reg: 1_000_000_000, total: 158.9, rate: 110.6 },
        { s: 6, big: 156.0, reg: 1_000_000_000, total: 156.0, rate: 114.9 },
      ],
    },
  },

  // --- オーイズミ レヴュースタァライト（p-town 4706）追加 ---
  {
    id: "oizumi_revue_starlight",
    name: "L 少女☆歌劇 レヴュースタァライト -The SLOT-",
    maker: "オーイズミ",
    series: "レヴュースタァライト",
    inHall: true,
    category: "SMART",
    description: "L（ボーナス合算・純粋確率）ベースの簡易判別。",
    metricsLabels: {
      bigLabel: "BIG合算",
      regLabel: "REG",
      totalLabel: "ボーナス合算",
      extraMetrics: [
        { id: "aka7Big", label: "赤7BIG" },
        { id: "ao7Big", label: "青7BIG" },
      ],
    },
    odds: {
      settings: [
        {
          s: 1,
          big: 255.0,
          reg: 601.2,
          total: 179.1,
          rate: 97.8,
          extras: { aka7Big: 565.0, ao7Big: 464.8 },
        },
        {
          s: 2,
          big: 253.0,
          reg: 584.8,
          total: 176.6,
          rate: 98.8,
          extras: { aka7Big: 458.3, ao7Big: 585.1 },
        },
        {
          s: 4,
          big: 242.7,
          reg: 508.6,
          total: 164.3,
          rate: 104.6,
          extras: { aka7Big: 425.6, ao7Big: 508.0 },
        },
        {
          s: 5,
          big: 239.2,
          reg: 482.3,
          total: 159.9,
          rate: 106.9,
          extras: { aka7Big: 414.8, ao7Big: 481.9 },
        },
        {
          s: 6,
          big: 236.6,
          reg: 448.6,
          total: 154.9,
          rate: 110.0,
          extras: { aka7Big: 407.1, ao7Big: 448.9 },
        },
      ],
    },
  },

  // --- 藤商事 L とある科学の超電磁砲2（p-town 4892）追加 ---
  {
    id: "fujishoji_railgun2",
    name: "スマスロ とある科学の超電磁砲2",
    maker: "藤商事",
    series: "とある",
    inHall: true,
    category: "SMART",
    description: "L（AT初当り）ベースの簡易判別。50枚あたり約31.8G（独自調査値）",
    metricsLabels: {
      bigLabel: "AT初当り",
      regLabel: null,
      totalLabel: null,
      suikaTrialsLabel: "超電磁砲コイン揃い回数",
      suikaCzHitsLabel: "CZ当選回数",
      suikaCzRateLabel: "超電磁砲コイン揃い時 CZ当選率",
    },
    odds: {
      settings: [
        { s: 1, big: 317.8, reg: 1_000_000_000, total: 317.8, rate: 97.7, suikaCzRate: 0.25 },
        { s: 2, big: 311.8, reg: 1_000_000_000, total: 311.8, rate: 98.9, suikaCzRate: 0.2539 },
        { s: 3, big: 304.4, reg: 1_000_000_000, total: 304.4, rate: 100.3, suikaCzRate: 0.2578 },
        { s: 4, big: 272.4, reg: 1_000_000_000, total: 272.4, rate: 105.4, suikaCzRate: 0.2813 },
        { s: 5, big: 248.1, reg: 1_000_000_000, total: 248.1, rate: 110.0, suikaCzRate: 0.3086 },
        { s: 6, big: 235.3, reg: 1_000_000_000, total: 235.3, rate: 112.9, suikaCzRate: 0.332 },
      ],
    },
  },

  // --- SABOHANI いざ！番長 追加 ---
  {
    id: "sabohani_iza_bancho",
    name: "L いざ！番長",
    maker: "大都技研",
    series: "番長",
    inHall: true,
    category: "SMART",
    description: "L（AT初当り）ベースの簡易判別。",
    metricsLabels: {
      bigLabel: "AT初当り",
      regLabel: null,
      totalLabel: null,
      extraMetrics: [
        { id: "bonusDirectRed7", label: "ボーナス直撃(赤7)" },
        { id: "bonusDirectBlue7", label: "ボーナス直撃(青7)" },
      ],
      suikaTrialsLabel: "刺客ゾーン(青枠) 終了回数",
      suikaCzHitsLabel: "刺客ゾーン(青枠) AT当選回数",
      suikaCzRateLabel: "刺客ゾーン(青枠) AT当選率",
      uraAtTrialsLabel: "刺客ゾーン(黄枠) 終了回数",
      uraAtHitsLabel: "刺客ゾーン(黄枠) AT当選回数",
      uraAtRateLabel: "刺客ゾーン(黄枠) AT当選率",
    },
    odds: {
      settings: [
        {
          s: 1,
          big: 386.9,
          reg: 1_000_000_000,
          total: 386.9,
          rate: 97.6,
          suikaCzRate: 0.01,
          uraAtRate: 0.1,
          extras: {
            bonusDirectRed7: 8156.2,
            bonusDirectBlue7: 220772.4,
          },
        },
        {
          s: 2,
          big: 368.5,
          reg: 1_000_000_000,
          total: 368.5,
          rate: 98.9,
          suikaCzRate: 0.01,
          uraAtRate: 0.1,
          extras: {
            bonusDirectRed7: 7387.3,
            bonusDirectBlue7: 110027.0,
          },
        },
        {
          s: 3,
          big: 375.8,
          reg: 1_000_000_000,
          total: 375.8,
          rate: 101.3,
          suikaCzRate: 0.01,
          uraAtRate: 0.1,
          extras: {
            bonusDirectRed7: 6694.4,
            bonusDirectBlue7: 55196.3,
          },
        },
        {
          s: 4,
          big: 332.4,
          reg: 1_000_000_000,
          total: 332.4,
          rate: 106.0,
          suikaCzRate: 0.01,
          uraAtRate: 0.1,
          extras: {
            bonusDirectRed7: 2940.1,
            bonusDirectBlue7: 27930.0,
          },
        },
        {
          s: 5,
          big: 351.6,
          reg: 1_000_000_000,
          total: 351.6,
          rate: 112.1,
          suikaCzRate: 0.01,
          uraAtRate: 0.1,
          extras: {
            bonusDirectRed7: 3697.3,
            bonusDirectBlue7: 24606.5,
          },
        },
        {
          s: 6,
          big: 312.1,
          reg: 1_000_000_000,
          total: 312.1,
          rate: 114.9,
          suikaCzRate: 0.03,
          uraAtRate: 0.15,
          extras: {
            bonusDirectRed7: 2495.8,
            bonusDirectBlue7: 22560.5,
          },
        },
      ],
    },
  },

  // --- SABOHANI 吉宗 追加 ---
  {
    id: "sabohani_yoshimune",
    name: "L 吉宗",
    maker: "大都技研",
    series: "吉宗",
    inHall: true,
    category: "SMART",
    description: "L（初当り）ベースの簡易判別。初当り・機械割は独自調査値。",
    metricsLabels: {
      bigLabel: "初当り",
      regLabel: null,
      totalLabel: null,
      extraMetrics: [{ id: "commonHyo", label: "共通俵" }],
    },
    odds: {
      settings: [
        {
          s: 1,
          big: 378.9,
          reg: 1_000_000_000,
          total: 378.9,
          rate: 97.8,
          extras: {
            commonHyo: 819.2,
          },
        },
        {
          s: 2,
          big: 369.6,
          reg: 1_000_000_000,
          total: 369.6,
          rate: 99.1,
          extras: {
            commonHyo: 744.7,
          },
        },
        {
          s: 3,
          big: 358.8,
          reg: 1_000_000_000,
          total: 358.8,
          rate: 100.6,
          extras: {
            commonHyo: 682.7,
          },
        },
        {
          s: 4,
          big: 335.1,
          reg: 1_000_000_000,
          total: 335.1,
          rate: 104.1,
          extras: {
            commonHyo: 585.1,
          },
        },
        {
          s: 5,
          big: 318.5,
          reg: 1_000_000_000,
          total: 318.5,
          rate: 107.1,
          extras: {
            commonHyo: 512.0,
          },
        },
        {
          s: 6,
          big: 292.4,
          reg: 1_000_000_000,
          total: 292.4,
          rate: 112.0,
          extras: {
            commonHyo: 455.1,
          },
        },
      ],
    },
  },

  // --- L 秘宝伝（p-town 4929）追加 ---
  {
    id: "paon_hihouden",
    name: "L 秘宝伝",
    maker: "大都技研",
    series: "秘宝伝",
    inHall: true,
    category: "SMART",
    description:
      "ボーナス合算（1/○○）とチェリー確率での簡易判別。数値はp-townの解析より。",
    metricsLabels: {
      bigLabel: "ボーナス合算",
      regLabel: null,
      totalLabel: null,
      extraMetrics: [{ id: "cherry", label: "チェリー" }],
    },
    odds: {
      settings: [
        {
          s: 1,
          big: 292.5,
          reg: 1_000_000_000,
          total: 292.5,
          rate: 97.8,
          extras: { cherry: 54.7 },
        },
        {
          s: 2,
          big: 271.4,
          reg: 1_000_000_000,
          total: 271.4,
          rate: 99.0,
          extras: { cherry: 52.9 },
        },
        {
          s: 3,
          big: 283.6,
          reg: 1_000_000_000,
          total: 283.6,
          rate: 101.5,
          extras: { cherry: 51.1 },
        },
        {
          s: 4,
          big: 257.5,
          reg: 1_000_000_000,
          total: 257.5,
          rate: 105.1,
          extras: { cherry: 49.5 },
        },
        {
          s: 5,
          big: 264.0,
          reg: 1_000_000_000,
          total: 264.0,
          rate: 110.1,
          extras: { cherry: 48.0 },
        },
        {
          s: 6,
          big: 246.0,
          reg: 1_000_000_000,
          total: 246.0,
          rate: 114.7,
          extras: { cherry: 46.5 },
        },
      ],
    },
  },

  // --- 大都 SHAKE BONUS TRIGGER（p-town 4893）追加 ---
  {
    id: "daito_shake_bonus_trigger",
    name: "SHAKE BONUS TRIGGER",
    maker: "大都技研",
    series: "SHAKE",
    inHall: true,
    category: "SMART",
    description:
      "ボーナス確率（設定1/2/5/6）＋同時当選（スイカ/ベル/特殊役I）での簡易判別。数値はp-townの解析より。機械割はbonus.jpg(OCR)から抽出（完全攻略時の列を採用）。",
    metricsLabels: {
      extraMetrics: [
        { id: "suikaNadiaBig", label: "スイカ+ナディアBIG" },
        { id: "bellReg", label: "ベル+REG" },
        { id: "specialRoleIAnyBonus", label: "特殊役I+ボーナス" },
      ],
    },
    odds: {
      settings: [
        {
          s: 1,
          big: 350.5,
          reg: 425.6,
          total: 192.2,
          rate: 100.4,
          extras: {
            suikaNadiaBig: 16384.0,
            bellReg: 8192.0,
            specialRoleIAnyBonus: 3276.8,
          },
        },
        {
          s: 2,
          big: 327.7,
          reg: 332.7,
          total: 165.1,
          rate: 102.4,
          extras: {
            suikaNadiaBig: 16384.0,
            bellReg: 6553.6,
            specialRoleIAnyBonus: 2259.9,
          },
        },
        {
          s: 5,
          big: 341.3,
          reg: 409.6,
          total: 186.2,
          rate: 104.9,
          extras: {
            suikaNadiaBig: 8192.0,
            bellReg: 8192.0,
            specialRoleIAnyBonus: 3120.8,
          },
        },
        {
          s: 6,
          big: 297.9,
          reg: 297.9,
          total: 148.9,
          rate: 108.1,
          extras: {
            suikaNadiaBig: 5461.3,
            bellReg: 5041.2,
            specialRoleIAnyBonus: 1872.5,
          },
        },
      ],
    },
  },

  // --- 大都 クレアの秘宝伝BT（p-town 4860）追加 ---
  {
    id: "daito_crea_hihouden_bt",
    name: "クレアの秘宝伝 〜はじまりの扉と太陽の石〜 ボーナストリガーver.",
    maker: "大都技研",
    series: "クレアの秘宝伝",
    inHall: true,
    category: "SMART",
    description:
      "ボーナス確率（設定1〜6）＋確定チェリー/ピラミッド揃いでの簡易判別。数値はp-townの解析より。ボーナス確率・機械割はbonus.jpg(OCR)から抽出し、機械割は『完全攻略時』の列を採用。",
    metricsLabels: {
      extraMetrics: [
        { id: "kakuteiCherry", label: "確定チェリー" },
        { id: "pyramid", label: "ピラミッド揃い" },
      ],
    },
    odds: {
      settings: [
        {
          s: 1,
          big: 299.3,
          reg: 383.3,
          total: 168.0,
          rate: 99.3,
          extras: {
            kakuteiCherry: 21845.3,
            pyramid: 8192.0,
          },
        },
        {
          s: 2,
          big: 293.9,
          reg: 376.6,
          total: 165.1,
          rate: 100.5,
          extras: {
            kakuteiCherry: 21845.3,
            pyramid: 8192.0,
          },
        },
        {
          s: 3,
          big: 284.9,
          reg: 358.1,
          total: 158.7,
          rate: 102.5,
          extras: {
            kakuteiCherry: 21845.3,
            pyramid: 5461.3,
          },
        },
        {
          s: 4,
          big: 274.2,
          reg: 334.4,
          total: 150.7,
          rate: 105.0,
          extras: {
            kakuteiCherry: 13107.2,
            pyramid: 4096.0,
          },
        },
        {
          s: 5,
          big: 262.1,
          reg: 299.3,
          total: 139.7,
          rate: 108.0,
          extras: {
            kakuteiCherry: 13107.2,
            pyramid: 2730.7,
          },
        },
        {
          s: 6,
          big: 240.1,
          reg: 247.3,
          total: 121.8,
          rate: 114.0,
          extras: {
            kakuteiCherry: 5461.3,
            pyramid: 2048.0,
          },
        },
      ],
    },
  },

  // --- オリンピアエステート L ToLOVEるダークネス（p-town 4571）追加 ---
  {
    id: "olympia_toloveru_darkness",
    name: "L ToLOVEるダークネス",
    maker: "平和",
    series: "ToLOVEる",
    inHall: true,
    category: "SMART",
    description:
      "初当り確率と機械割での簡易判別。数値はp-townより。実質5段階設定（設定2〜6）。",
    metricsLabels: {
      bigLabel: "初当り",
      regLabel: null,
      totalLabel: null,
    },
    odds: {
      settings: [
        { s: 2, big: 352.0, reg: 1_000_000_000, total: 352.0, rate: 98.0 },
        { s: 3, big: 345.7, reg: 1_000_000_000, total: 345.7, rate: 99.0 },
        { s: 4, big: 328.4, reg: 1_000_000_000, total: 328.4, rate: 102.5 },
        { s: 5, big: 311.3, reg: 1_000_000_000, total: 311.3, rate: 105.8 },
        { s: 6, big: 300.6, reg: 1_000_000_000, total: 300.6, rate: 110.1 },
      ],
    },
  },

  // --- オリンピアエステート L麻雀物語（p-town 4777）追加 ---
  {
    id: "olympia_mahjong_monogatari",
    name: "L麻雀物語",
    maker: "平和",
    series: "麻雀物語",
    inHall: true,
    category: "SMART",
    description:
      "AT初当りと（通常時）AT直撃での簡易判別。AT直撃は通常時G数を母数にした二項（trials/hits）で反映。数値はp-townより。50枚あたりのゲーム数は約32.0G（設定1、独自調査値）。",
    metricsLabels: {
      bigLabel: "AT初当り",
      regLabel: null,
      totalLabel: null,
      binomialMetrics: [
        {
          id: "atDirect",
          trialsLabel: "通常時ゲーム数（前兆中除く）",
          hitsLabel: "AT直撃回数",
          rateLabel: "AT直撃率",
        },
        {
          id: "kotei",
          trialsLabel: "総ゲーム数",
          hitsLabel: "煌帝出現回数",
          rateLabel: "煌帝出現率",
        },
      ],
    },
    odds: {
      settings: [
        {
          s: 1,
          big: 354.1,
          reg: 1_000_000_000,
          total: 354.1,
          rate: 98.0,
          binomialRates: { atDirect: 1 / 7945.6, kotei: 1 / 891.5 },
        },
        {
          s: 2,
          big: 349.2,
          reg: 1_000_000_000,
          total: 349.2,
          rate: 98.8,
          binomialRates: { atDirect: 1 / 6529.1, kotei: 1 / 887.0 },
        },
        {
          s: 3,
          big: 342.1,
          reg: 1_000_000_000,
          total: 342.1,
          rate: 100.1,
          binomialRates: { atDirect: 1 / 5649.1, kotei: 1 / 868.7 },
        },
        {
          s: 4,
          big: 328.8,
          reg: 1_000_000_000,
          total: 328.8,
          rate: 104.9,
          binomialRates: { atDirect: 1 / 4012.7, kotei: 1 / 808.1 },
        },
        {
          s: 5,
          big: 326.0,
          reg: 1_000_000_000,
          total: 326.0,
          rate: 108.9,
          binomialRates: { atDirect: 1 / 3859.1, kotei: 1 / 754.6 },
        },
        {
          s: 6,
          big: 323.8,
          reg: 1_000_000_000,
          total: 323.8,
          rate: 114.6,
          binomialRates: { atDirect: 1 / 3707.4, kotei: 1 / 747.9 },
        },
      ],
    },
  },

  // --- 平和 L ToLOVEるダークネス TRANCE ver.8.7（p-town 4806）追加 ---
  {
    id: "heiwa_toloveru_darkness_trance_v87",
    name: "L ToLOVEるダークネス TRANCE ver.8.7",
    maker: "平和",
    series: "ToLOVEる",
    inHall: true,
    category: "SMART",
    description:
      "初当り確率と機械割での簡易判別。数値はp-townより。実質5段階設定（設定2〜6）。",
    metricsLabels: {
      bigLabel: "初当り",
      regLabel: null,
      totalLabel: null,
    },
    odds: {
      settings: [
        { s: 2, big: 353.3, reg: 1_000_000_000, total: 353.3, rate: 98.0 },
        { s: 3, big: 346.3, reg: 1_000_000_000, total: 346.3, rate: 99.0 },
        { s: 4, big: 328.9, reg: 1_000_000_000, total: 328.9, rate: 103.1 },
        { s: 5, big: 312.3, reg: 1_000_000_000, total: 312.3, rate: 110.3 },
        { s: 6, big: 307.6, reg: 1_000_000_000, total: 307.6, rate: 112.0 },
      ],
    },
  },

  // --- 平和 L主役は銭形5（p-town 4877）追加 ---
  {
    id: "heiwa_zenigata5",
    name: "L主役は銭形5",
    maker: "平和",
    series: "銭形",
    inHall: true,
    category: "SMART",
    description:
      "初当り確率・機械割・通常時デカ目での簡易判別。数値はp-townより。実質5段階設定（設定2〜6）。",
    metricsLabels: {
      bigLabel: "初当り",
      regLabel: null,
      totalLabel: null,
      extraMetrics: [{ id: "dekaMe", label: "通常時デカ目" }],
    },
    odds: {
      settings: [
        {
          s: 2,
          big: 424.5,
          reg: 1_000_000_000,
          total: 424.5,
          rate: 97.9,
          extras: { dekaMe: 21580.7 },
        },
        {
          s: 3,
          big: 416.4,
          reg: 1_000_000_000,
          total: 416.4,
          rate: 99.0,
          extras: { dekaMe: 19209.1 },
        },
        {
          s: 4,
          big: 388.1,
          reg: 1_000_000_000,
          total: 388.1,
          rate: 103.2,
          extras: { dekaMe: 10964.8 },
        },
        {
          s: 5,
          big: 375.9,
          reg: 1_000_000_000,
          total: 375.9,
          rate: 107.1,
          extras: { dekaMe: 7249.1 },
        },
        {
          s: 6,
          big: 300.5,
          reg: 1_000_000_000,
          total: 300.5,
          rate: 112.1,
          extras: { dekaMe: 5561.8 },
        },
      ],
    },
  },

  // --- 平和 Lルパン三世 大航海者の秘宝（p-town 4689）追加 ---
  {
    id: "heiwa_lupin_daikoukai_hihou",
    name: "Lルパン三世 大航海者の秘宝",
    maker: "平和",
    series: "ルパン三世",
    inHall: true,
    category: "SMART",
    description: "初当り確率と機械割での簡易判別。数値はp-townより。",
    metricsLabels: {
      bigLabel: "初当り",
      regLabel: null,
      totalLabel: null,
    },
    odds: {
      settings: [
        { s: 1, big: 289.1, reg: 1_000_000_000, total: 289.1, rate: 97.7 },
        { s: 2, big: 275.6, reg: 1_000_000_000, total: 275.6, rate: 99.1 },
        { s: 3, big: 262.6, reg: 1_000_000_000, total: 262.6, rate: 101.4 },
        { s: 4, big: 233.9, reg: 1_000_000_000, total: 233.9, rate: 106.1 },
        { s: 5, big: 223.6, reg: 1_000_000_000, total: 223.6, rate: 110.1 },
        { s: 6, big: 216.3, reg: 1_000_000_000, total: 216.3, rate: 114.3 },
      ],
    },
  },

  // --- 平和 L不二子BT（p-town 4921）追加 ---
  {
    id: "heiwa_fujiko_bt",
    name: "L不二子BT",
    maker: "平和",
    series: "ルパン三世",
    inHall: true,
    category: "SMART",
    description: "BIG/REG/合算と機械割での簡易判別。数値はp-townより。実質5段階設定（設定1/2/4/5/6）。",
    metricsLabels: {
      bigLabel: "BIG",
      regLabel: "REG",
      totalLabel: "合算",
    },
    odds: {
      settings: [
        { s: 1, big: 394.8, reg: 321.3, total: 141.2, rate: 97.6 },
        { s: 2, big: 364.1, reg: 304.8, total: 134.0, rate: 99.4 },
        { s: 4, big: 319.7, reg: 278.9, total: 122.7, rate: 102.9 },
        { s: 5, big: 291.3, reg: 252.1, total: 113.2, rate: 105.4 },
        { s: 6, big: 229.1, reg: 227.6, total: 98.1, rate: 107.4 },
      ],
    },
  },

  // --- 平和 L戦国乙女4 戦乱に閃く炯眼の軍師（p-town 4395）追加 ---
  {
    id: "heiwa_sengoku_otome4",
    name: "L戦国乙女4 戦乱に閃く炯眼の軍師",
    maker: "平和",
    series: "戦国乙女",
    inHall: true,
    category: "SMART",
    description:
      "ボーナス確率と機械割での簡易判別。追加で、AT直撃/ゾーン外ボーナス/乙女アタック当選/オウガイバトル1戦目勝率の設定差も反映。数値はp-townより。",
    metricsLabels: {
      bigLabel: "ボーナス",
      regLabel: null,
      totalLabel: null,
      extraMetrics: [
        { id: "normalAtDirect", label: "通常時AT直撃" },
        { id: "zoneOutBonus", label: "ゾーン外ボーナス" },
      ],
      binomialMetrics: [
        {
          id: "otomeAttackDirect",
          trialsLabel: "チャンス目/強チェリー回数",
          hitsLabel: "乙女アタック直撃当選回数",
          rateLabel: "乙女アタック直撃当選率",
        },
      ],
      suikaTrialsLabel: "OPt到達回数",
      suikaCzHitsLabel: "乙女アタック当選回数",
      suikaCzRateLabel: "乙女アタック当選率",
      uraAtTrialsLabel: "オウガイバトル1戦目回数",
      uraAtHitsLabel: "1戦目勝利回数",
      uraAtRateLabel: "1戦目勝利期待度",
    },
    odds: {
      settings: [
        {
          s: 1,
          big: 272.7,
          reg: 1_000_000_000,
          total: 272.7,
          rate: 98.2,
          suikaCzRate: 0.203,
          uraAtRate: 0.249,
          binomialRates: {
            otomeAttackDirect: 0.012,
          },
          extras: {
            normalAtDirect: 10922.7,
            zoneOutBonus: 24288,
          },
        },
        {
          s: 2,
          big: 267.3,
          reg: 1_000_000_000,
          total: 267.3,
          rate: 99.0,
          suikaCzRate: 0.209,
          uraAtRate: 0.25,
          binomialRates: {
            otomeAttackDirect: 0.013,
          },
          extras: {
            normalAtDirect: 9362.3,
            zoneOutBonus: 23210,
          },
        },
        {
          s: 3,
          big: 255.3,
          reg: 1_000_000_000,
          total: 255.3,
          rate: 101.2,
          suikaCzRate: 0.218,
          uraAtRate: 0.255,
          binomialRates: {
            otomeAttackDirect: 0.015,
          },
          extras: {
            normalAtDirect: 8192.0,
            zoneOutBonus: 16836,
          },
        },
        {
          s: 4,
          big: 238.2,
          reg: 1_000_000_000,
          total: 238.2,
          rate: 105.2,
          suikaCzRate: 0.229,
          uraAtRate: 0.274,
          binomialRates: {
            otomeAttackDirect: 0.018,
          },
          extras: {
            normalAtDirect: 6553.6,
            zoneOutBonus: 13666,
          },
        },
        {
          s: 5,
          big: 223.2,
          reg: 1_000_000_000,
          total: 223.2,
          rate: 110.2,
          suikaCzRate: 0.238,
          uraAtRate: 0.307,
          binomialRates: {
            otomeAttackDirect: 0.021,
          },
          extras: {
            normalAtDirect: 5957.8,
            zoneOutBonus: 12024,
          },
        },
        {
          s: 6,
          big: 217.1,
          reg: 1_000_000_000,
          total: 217.1,
          rate: 113.0,
          suikaCzRate: 0.244,
          uraAtRate: 0.317,
          binomialRates: {
            otomeAttackDirect: 0.025,
          },
          extras: {
            normalAtDirect: 5461.3,
            zoneOutBonus: 9819,
          },
        },
      ],
    },
  },
] satisfies readonly Machine[];
