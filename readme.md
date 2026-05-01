# CodeReader

移动端友好的代码阅读器，支持在手机/平板上浏览本地项目代码、查看 Git 变更、全局搜索。

## 功能

- 📂 **项目浏览** — 添加多个项目，浏览目录结构
- 📄 **代码查看** — 语法高亮（30+ 语言），行号显示
- 🔍 **全局搜索** — 文件名 / 代码内容 / 符号定义 / Git 提交记录
- 🔀 **Git 变更** — 查看暂存/未暂存变更，查看 diff 详情（含行号），暂存/取消暂存/提交
- 🌙 **深色模式** — 默认深色主题，一键切换
- 📱 **移动端优先** — 触控友好，局域网二维码扫描访问
- 🖥️ **目录选择器** — 浏览本地目录添加项目，名称自动填充

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm

### 安装

```bash
pnpm install
```

### 开发

```bash
# 同时启动前后端（推荐）
pnpm dev:all

# 或分别启动
pnpm server   # 后端 API :3001
pnpm dev      # 前端 Vite :5173
```

启动后会显示局域网 IP 和二维码，手机扫描即可访问。

### 生产部署

```bash
# 1. 构建前端
pnpm build

# 2. 启动生产服务
pnpm start
```

生产模式下 Express 同时服务前端静态文件和 API，只需运行一个进程。

可通过环境变量配置：

```bash
PORT=8080 pnpm start   # 自定义端口，默认 3001
```

### 使用 Docker 部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3001
CMD ["node", "server/index.js"]
```

```bash
docker build -t codereader .
docker run -d -p 3001:3001 -v /path/to/your/code:/code codereader
```

挂载卷后，在应用内添加项目路径 `/code/your-project` 即可浏览。

### 使用 PM2 部署

```bash
pnpm build
NODE_ENV=production pm2 start server/index.js --name codereader
```

## 项目配置

项目列表存储在 `server/config.json`：

```json
{
  "projects": [
    { "name": "MyProject", "path": "/home/user/projects/my-project" },
    { "name": "Another", "path": "../another-project" }
  ]
}
```

路径支持绝对路径和相对路径（相对于项目根目录）。也可以在应用内通过"添加项目"按钮操作。

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/projects` | 项目列表 |
| GET | `/api/projects/:id` | 项目详情 |
| POST | `/api/projects` | 添加项目 |
| DELETE | `/api/projects/:id` | 删除项目 |
| GET | `/api/projects/:id/files?path=` | 目录浏览 |
| GET | `/api/projects/:id/code?file=` | 读取文件内容 |
| GET | `/api/projects/:id/search?q=&type=` | 搜索（file/content/symbol/git） |
| GET | `/api/projects/:id/git/status` | Git 状态 |
| GET | `/api/projects/:id/git/diff?file=&type=` | 查看 diff |
| POST | `/api/projects/:id/git/stage` | 暂存文件 |
| POST | `/api/projects/:id/git/unstage` | 取消暂存 |
| POST | `/api/projects/:id/git/commit` | 提交 |
| GET | `/api/browse?path=` | 浏览本地目录 |

## 技术栈

- **前端**：React 18 + TypeScript + Tailwind CSS + Vite
- **后端**：Express + Node.js
- **语法高亮**：highlight.js
- **图标**：lucide-react

## 目录结构

```
├── codebase/src/          # 前端源码
│   ├── components/        # 通用组件（DirBrowser）
│   ├── lib/               # 工具函数、ThemeContext
│   └── pages/             # 页面组件
│       └── tabs/          # Workspace 子标签页
├── server/                # 后端源码
│   ├── index.js           # Express 入口
│   ├── projects.js        # 项目管理
│   ├── files.js           # 文件浏览
│   ├── search.js          # 搜索
│   ├── git.js             # Git 操作
│   ├── browse.js          # 目录选择器
│   └── config.json        # 项目配置
├── scripts/               # 脚本
│   └── dev.js             # 开发启动脚本（含二维码）
├── src/                   # Vite 入口
│   ├── main.tsx
│   └── index.css
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```
