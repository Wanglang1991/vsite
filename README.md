# VSite - 视频分享平台

仿 B 站风格的前端视频网站，后端做第三方 API 聚合代理。

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

```bash
cp packages/server/.env.example packages/server/.env
```

填入你的免费 API Key:

| API | 注册地址 | 免费额度 |
|-----|---------|---------|
| Pexels | https://www.pexels.com/api/ | 200次/小时 |
| Pixabay | https://pixabay.com/api/docs/ | 基本无限制 |
| YouTube | https://console.cloud.google.com/ | 10000 units/天 |
| TMDB | https://www.themoviedb.org/settings/api | 免费 |

> 至少配置一个数据源即可运行。推荐 Pexels + Pixabay 组合。

### 3. 启动开发环境

```bash
# 同时启动前后端
npm run dev

# 或分别启动
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

## 技术栈

- **后端**: Fastify + TypeScript, Zod 校验, 内存缓存
- **前端**: Next.js 15 + React 19, Tailwind CSS, Video.js
- **数据源**: Pexels / Pixabay / YouTube Data API / TMDB