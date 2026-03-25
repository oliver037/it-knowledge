# IT 知识库（可公开访问）

一个可直接上线的简易 IT 知识库：
- 前端：React + Vite（公开浏览）
- 后端：Express + Prisma（写接口受 `ADMIN_KEY` 保护）
- 数据库：PostgreSQL
- 部署：Docker Compose + Nginx 反向代理

## 本地开发

1. 安装依赖

```bash
npm install
npm install --prefix apps/api
npm install --prefix apps/web
```

2. 配置环境变量

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

`apps/api/.env` 里至少配置：
- `DATABASE_URL`
- `ADMIN_KEY`（务必改成强密码，仅你自己知道）

3. 初始化数据库

```bash
npm run db:push
npm run db:seed
```

4. 启动

```bash
npm run dev
```

- 前端：`http://localhost:5173`
- 后端健康检查：`http://localhost:4000/api/health`

## 生产部署

1. 配置部署变量

```bash
cp deploy/.env.example deploy/.env
```

修改 `deploy/.env`：
- `POSTGRES_PASSWORD`
- `CORS_ORIGIN`
- `ADMIN_KEY`

2. 配置域名

修改 `deploy/nginx/site.conf` 的 `server_name`。

3. 启动容器

```bash
cd deploy
docker compose --env-file .env up -d --build
```

## API 说明

公开读接口：
- `GET /api/articles`
- `GET /api/articles/:slug`
- `GET /api/tags`

管理写接口（需请求头 `x-admin-key`）：
- `POST /api/articles`
- `PUT /api/articles/:id`
- `DELETE /api/articles/:id`
