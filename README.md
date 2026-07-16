# VSite - 视频分享平台

以 B 站风格的前端视频网站，后端做第三方 API 聚合代理。

## 项目结构

```
vsite/
├── packages/
│   ├── server/    # Fastify 后端 API 代理
│   └── web/       # Next.js 前端
├── package.json   # monorepo 根配置
└── tsconfig.base.json
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API Key

复制并编辑 `packages/server/.env`:

| API | 注册地址 | 免费额度 |
|-----|---------|---------|
| Pexels | https://www.pexels.com/api/ | 200次/小时 |
| Pixabay | https://pixabay.com/api/docs/ | 基本无限制 |
| YouTube | https://console.cloud.google.com/ | 10000 units/天 |
| TMDB | https://www.themoviedb.org/settings/api | 免费 |

> 至少配置一个数据源即可运行。推荐 Pexels + Pixabay 组合。

### 3. 启动开发环境

```bash
npm run dev          # 同时启动前后端

npm run dev:server   # → http://localhost:3001
npm run dev:web      # → http://localhost:3000
```

## API 端点

| 端点 | 说明 |
|------|------|
| `GET /api/videos?page=1&perPage=24&q=` | 视频列表（主页推荐） |
| `GET /api/videos/:id` | 视频详情 |
| `GET /api/search?q=xxx` | 搜索 |
| `GET /api/categories` | 分类列表 |
| `GET /api/categories/:id` | 分类下的视频 |
| `GET /api/health` | 健康检查 |

## 数据流动

```
┌─ 前端 (Next.js :3000) ───────────────────────────────────┐
│                                                           │
│  page.tsx                     video/[id]/page.tsx         │
│  ├─ activeCat (state) ──────┐ ├─ useParams("id")         │
│  ├─ getVideos/getCategory → │ ├─ getVideoById(id)        │
│  └─ VideoGrid ← videos      │ └─ VideoPlayer ← video     │
│                              │                            │
│  SearchOverlay ──────────────┤                            │
│  └─ searchVideos(q) ─────────┘                            │
│                                                           │
│  lib/api.ts (fetcher)                                     │
│  └─ fetch("/api/...") ──── next.config rewrites ────┐     │
└──────────────────────────────────────────────────────┼─────┘
                                                       │
┌─ 后端 (Fastify :3001) ──────────────────────────────┼─────┐
│                                                      ▼     │
│  routes/                              services/            │
│  ├─ GET /api/videos         ──┬──→  pexels.ts ──→ Pexels   │
│  │    /api/categories/:id   ──┼──→  pixabay.ts ──→ Pixabay │
│  │    /api/search           ──┼──→  youtube.ts ──→ YouTube  │
│  │                            │                             │
│  ├─ GET /api/videos/:id      │    videoCache.ts            │
│  │   └─ 1. 查 videoCache ────┤    └─ Map<id, VideoItem>    │
│  │      2. 未命中 → 拉取 ────┤       ▲ 所有列表接口写入     │
│  │      3. 返回              │       └ 详情接口命中读取     │
│  │                            │                             │
│  └─ GET /api/categories       │    cache.ts (TTL)           │
│                               │    └─ 10min 内存缓存        │
└───────────────────────────────┴─────────────────────────────┘
```

### 三条核心链路

| 链路 | 触发 | 路径 |
|------|------|------|
| 首页列表 | 页面加载 / 点击分类 | state `activeCat` → `getVideos/category` → 代理 → Fastify → 3 方 API 聚合 → 写入 `videoCache` |
| 视频详情 | 点击卡片 | `useParams` → `getVideoById` → Fastify 先查 `videoCache` → 未命中则拉取 → 返回 |
| 搜索 | Navbar / SearchOverlay | `searchVideos(q)` → Fastify `/api/search` → 3 方 API → 写入 `videoCache` |

### 分类状态管理

分类选中状态由 React `useState` 管理，`sessionStorage` 持久化（刷新/返回保留），URL 保持干净的 `/`。

## 技术栈

- **后端**: Fastify + TypeScript, 内存缓存 (TTL + LRU)
- **前端**: Next.js 15 + React 19, Tailwind CSS, 原生 HTML5 Video
- **数据源**: Pexels / Pixabay / YouTube Data API / TMDB