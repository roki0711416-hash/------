This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### スマホでもローカル確認する（同一Wi‑Fi）

`npm run dev` は LAN からアクセスできるように `0.0.0.0` で起動します。

1) Mac の IP を確認

```bash
ipconfig getifaddr en0
```

2) スマホを Mac と同じ Wi‑Fi に繋いで、以下にアクセス

`http://<MacのIP>:3000/`

3) もし繋がらない場合

- macOS のファイアウォールで Node/Next の受信を許可
- ゲストWi‑Fiを避ける / VPN をOFFにする

ローカル（localhost）のみで起動したい場合は次を使います。

```bash
npm run dev:local
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 機種追加と新着情報（自動）

`content/machines.ts` に新しい機種（`id` を含むオブジェクト）を追加して `main` にpushすると、GitHub Actions が差分から新規 `machineId` を検出し、`content/posts.json` に新着投稿を自動で追加します。

- ワークフロー: `.github/workflows/auto-posts.yml`
- 生成スクリプト: `scripts/auto-add-machine-posts.mjs`

メモ:
- 既に同じ `href`（`/tool?machine=<id>`）の投稿が存在する場合は追加しません。
- `content/posts.json` のみを自動コミットするため、無限ループは起きません。

## サブスク（Stripe）

最小構成の会員登録/ログイン + Stripe Checkout + Webhook で、Premium判定（`active` / `trialing`）をDBに同期します。

### 必要な環境変数

- `DATABASE_URL`（または `POSTGRES_URL`）: Neon/Vercel Postgres の接続文字列
- `STRIPE_SECRET_KEY`: Stripe Secret Key
- `STRIPE_WEBHOOK_SECRET`: Stripe Webhook署名シークレット
- `STRIPE_PRICE_ID_YEARLY`: 年額6,800円（税込）のPrice ID（20%オフ）
- `STRIPE_PRICE_ID_MONTHLY`: 月額680円（税込）のPrice ID
- `STRIPE_PRICE_ID`: 互換用（未設定なら `STRIPE_PRICE_ID_MONTHLY` を参照）。既存の月額IDをここに入れてもOK
- `NEXT_PUBLIC_SITE_URL`（任意）: `https://example.com`（未設定ならローカル/`VERCEL_URL` を推測）

### DB初期化

```bash
npm run db:init-auth
```

### 画面

- `/signup`: 会員登録
- `/login`: ログイン（端末共有NG: 最後の1台のみ有効）
- `/account`: サブスク登録（初回48時間、全機能解放）/ 解約・プラン管理

### ローカルデモ手順

1) 環境変数を用意

```bash
cp .env.local.example .env.development.local
```

2) `.env.development.local` を編集して、少なくとも以下を設定

- `DATABASE_URL`（または `POSTGRES_URL`）
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID_MONTHLY`（または互換の `STRIPE_PRICE_ID`）
- `STRIPE_PRICE_ID_YEARLY`
- `STRIPE_WEBHOOK_SECRET`

※ `SLOKASU_PREMIUM_PREVIEW=1` になっていると常に有料会員扱いになり、Stripe/Webhookの反映確認ができません。テスト動作確認をしたい場合は未設定（空）か `0` にしてください。

3) DB初期化

```bash
npm run db:init-auth
```

4) dev起動

```bash
npm run dev
```

5) Stripe Webhook をローカル転送（別ターミナル）

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

表示された `whsec_...` を `STRIPE_WEBHOOK_SECRET` に入れてから、
`/signup` → `/account` で Checkout を実行すると、Webhook 経由で Premium が反映されます。

### Stripeダッシュボード設定チェックリスト（本番/テスト共通）

#### 1) Product / Price を作る

- Product: 会員（例: `スロカス会員`）
- Price（Recurring）を2つ作成
	- 月額: `¥680` / interval = month
	- 年額: `¥6,800` / interval = year（20%オフ）

作成したPrice IDを環境変数に設定します。

- 月額 → `STRIPE_PRICE_ID_MONTHLY`（または互換の `STRIPE_PRICE_ID`）
- 年額 → `STRIPE_PRICE_ID_YEARLY`

#### 2) Billing Portal（解約=期間末）

このアプリは「解約・プラン管理」を Stripe Billing Portal に委譲します。
Stripeダッシュボードの Customer Portal 設定で、少なくとも以下を有効にしてください。

- Subscription のキャンセルを許可
- キャンセル時の挙動: 期間末で終了（cancel at period end）
- 支払い方法の更新を許可（カード変更）

※この設定により、要件の「期間末で終了」を満たします。

#### 3) Webhook エンドポイント

Webhook URL:

- `https://<YOUR_DOMAIN>/api/stripe/webhook`

購読イベント（最低限）:

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

作成時に表示される Signing secret（`whsec_...`）を `STRIPE_WEBHOOK_SECRET` に設定します。

補足:
- `checkout.session.completed` は受けていますが、Premium同期は `customer.subscription.*` 側で行っています。

#### 4) トライアル中でもカード必須

トライアルはStripe側の設定に従い、かつカード登録必須です。これはCheckout作成時にアプリ側で `payment_method_collection: always` を指定して担保しています。

