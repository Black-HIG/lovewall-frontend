# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Geetest 验证接入

- 环境变量（见 `.env` 示例）：
  - `NUXT_PUBLIC_GEETEST_ID`：极验验证 ID（前端使用）
  - `NUXT_GEETEST_KEY`：极验验证 KEY（仅服务端使用）
  - 可选：`NUXT_PUBLIC_JSDELIVR_ORIGIN` 用于在需要拼接 jsDelivr 链接时使用中国大陆镜像，默认 `https://fastly.jsdelivr.net`
- 验证后端：`server/api/geetest/validate.post.ts`（Nuxt Server API）负责向极验官方验证。
- 前端：`components/security/GeetestV4.vue` 渲染验证框；登录/注册页已接入并在提交前校验。
