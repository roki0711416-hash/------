export type MachineCategory = "JUG" | "HANAHANA" | string;

export type MachineOddsSetting = {
  s: number | string;
  big: number;
  reg: number;
  total: number;
  rate: number;
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
] satisfies readonly Machine[];
