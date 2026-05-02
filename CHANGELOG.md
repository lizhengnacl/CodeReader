# CodeReader 问题修复记录

## 原始问题列表

| # | 用户原始描述 | 修复内容 |
|---|-------------|----------|
| 1 | 以最少的改动，把项目跑起来 | 创建 package.json、vite.config.ts、tsconfig.json、tailwind.config.js、postcss.config.js、index.html、main.tsx、index.css，搭建 Vite + React + Tailwind 项目 |
| 2 | 实现对应的后端逻辑，确保所有功能符合预期 | 创建 Express 后端：projects.js（项目管理）、files.js（文件浏览+读取）、search.js（搜索）、git.js（Git 状态），修复 computeLanguages 递归 bug |
| 3 | 点击新增按钮，没反应 | 添加模态框表单 + POST /api/projects API + DELETE /api/projects/:id API |
| 4 | 添加项目时，项目路径支持选择本地目录，移动端友好；项目名称基于路径自动填充 | 创建 DirBrowser 组件 + /api/browse API，支持目录浏览、快捷路径、自动填充项目名 |
| 5 | 项目启动时，支持通过IP访问；支持二维码扫描快捷访问 | Vite/Express 监听 0.0.0.0，添加 qrcode-terminal 依赖，scripts/dev.js 显示 QR 码 |
| 6 | Git变更查看，支持查看变更内容细节；修复加减按钮功能 | 添加 git diff/git diff --cached API，GitTab 重写支持 diff 查看、stage/unstage/commit |
| 7 | 已暂存文件不对，并没有暂存；同时看不到文件变更具体内容 | git status --porcelain 输出 .trim() 移除了行首空格，导致 ` M file` 变为 `M file`，修复：移除 .trim() |
| 8 | git diff展示行号，不然没法对应起来 | 解析 @@ -n +m @@ 头部，追踪 oldLine/newLine，双列显示行号 |
| 9 | git diff的阅读体验不好，单行内容过长时，不会自动折行，需要滚动；滚动行数多了，体验很糟糕；git diff内容展示时，展示区域支持整体横向滚动 | 用 min-w-max 包裹实现整体横向滚动，行号 sticky left-0 固定 |
| 10 | 文件搜索功能异常 | 修复布局高度（minHeight）、Tab 切换保留搜索结果、文件路径用 lastIndexOf 替换 replace、添加搜索按钮 |
| 11 | 文件tab下的，搜索文件输入框，点击没反应 | 替换假 `<div>` + `<span>` 为真实 `<input>` + filter 功能 |
| 12 | 支持深色模式；深色模式切换按钮，点击没反应 | tailwind darkMode: 'class'，ThemeContext + localStorage 持久化，所有组件添加 dark: 变体 |
| 13 | 主页右上角的设置按钮，点击没反应 | 替换齿轮为 Moon/Sun 动态图标 + ThemeContext 切换 |
| 14 | 点击切换主题，没生效 | Vite 缓存了旧 CSS（@media prefers-color-scheme 而非 .dark class），清除 node_modules/.vite 缓存 |
| 15 | 代码高亮没生效 | 添加 highlight.js，按扩展名检测语言，双主题（github/github-dark） |
| 16 | 默认使用黑色主题 | ThemeContext 默认值从系统偏好改为 'dark' |
| 17 | 如何部署到正式环境；开发、部署说明，更新到readme中 | Express 静态文件服务、pnpm start 脚本、PORT 环境变量、Docker/PM2 部署说明 |
| 18 | 基于项目功能，解决的问题，设计Slogan 更新相关说明介绍 | Slogan "掌上代码，触手可及"，更新 index.html 标题和 ProjectList 副标题 |
| 19 | 截几张关键示意图，更新到readme中 | Playwright 截图 6 张（iPhone 14 Pro 尺寸），添加到 README |
| 20 | 使用不同的icon，区分不同的文件类型 | 创建 FileIconByType.tsx，60+ 扩展名映射不同图标和颜色，更新 FilesTab 和 SearchTab |
| 21 | 设置页面，字体大小、默认diff视图，功能异常，修复下 | 创建 SettingsContext + 底部选择面板 + 实时预览，CodeViewer 应用字体大小，GitTab 支持 unified/split 视图 |
| 22 | split视图样式异常，修复下 | 左右改为 w-1/2 等宽布局，移除 sticky，空白侧灰色背景，pre 用 flex-1 min-w-0 |
| 23 | Git变更，Commit信息支持AI生成 | 创建 server/ai.js，OpenAI 兼容 API 调用，GitTab 添加 AI 生成按钮，SettingsTab 添加 AI 配置 |
| 24 | AI相关配置信息，放在.env配置文件中维护；模型使用配置中的即可，不用提供那么多模型切换选择 | 迁移到 .env 文件，dotenv 加载，前端只读展示配置状态 + .env 配置说明 |
| 25 | 点击Commit信息生成icon，没有反应 | 按钮 absolute 定位在 textarea 内部，移动端触摸被拦截，改为独立行布局 `✨ AI 生成` |
| 26 | 点击Commit信息生成icon，没有生成对应的Commit信息 | DeepSeek 推理模型 max_tokens:200 太小，content 为空；增加到 1024，添加 reasoning_content 兜底 |
| 27 | 如果有暂存，则基于暂存内容生成Commit信息；如果没有，则基于为暂存内容生成Commit信息 | 先尝试 git diff --cached，再尝试 git diff，按钮禁用条件改为暂存和未暂存都为空 |
| 28 | 顶导的返回箭头有歧义，在文件详情页，是返回上一层；在其它页面，是返回项目列表页；统一返回上一层 | FilesTab 的 navigate('/projects') 改为 navigate(-1) |
| 29 | 收藏按钮、右上角菜单按钮，点击没反应 | FilesTab：收藏功能（localStorage）+ 下拉菜单（刷新/收藏列表/项目信息）；CodeViewer：搜索 + 菜单（复制路径/字体大小） |
| 30 | 复制路径，复制路径不对 | 只复制了相对路径，改为拼接项目根路径为绝对路径 |
| 31 | CodeViewer.tsx:101 Uncaught TypeError: Cannot read properties of undefined (reading 'writeText') | navigator.clipboard 在非 HTTPS 下为 undefined，添加 document.execCommand('copy') 降级方案 |
| 32 | URL参数怎么改造，方便与其它服务联动，通过URL打开对应项目文件 | 改为项目绝对路径 `/p/Users/bytedance/code/CodeReader/blob/src/App.tsx#L42`，支持行号定位 |
| 33 | FilesTab.tsx:44 GET .../api/projects/Users/bytedance/code/CodeReader/files 404 | 项目路径含 `/`，Express `:projectId` 只匹配一个路径段，改用通配符路由 + 最长前缀匹配 |
| 34 | /p/CodeReader 项目名还是不太好理解，是否可以直接使用项目绝对路径 | URL 改为 `/p/Users/bytedance/code/CodeReader`，后端 resolveProjectFromWildcard 最长前缀匹配 |
| 35 | FilesTab.tsx:61 Uncaught TypeError: Cannot read properties of undefined (reading 'filter') | data?.folders.filter() 改为 data?.folders?.filter() 可选链 |
| 36 | 支持图片文件预览 | 添加 getFileRaw API 返回文件流，前端用 `<img>` 渲染，支持 png/jpg/gif/svg/webp/bmp/ico |
| 37 | 顶导支持快捷返回项目列表页 | 返回箭头旁添加 Home 图标，点击跳转 /projects |
| 38 | 支持定位到具体行号 | 支持 `#L123` 和 `#L10-L20` 范围，点击行号更新 hash，目标行蓝色高亮 + 左侧边线 |
| 39 | 支持通过IP V6访问 | Vite/Express 监听 `::`（双栈），启动时显示 IPv4/IPv6 地址 |
| 40 | 启动后，为什么有4个V6地址，区别是什么 | 过滤 fe80/fd/fc 地址，优先显示稳定公网地址，只展示 1 个 IPv6 |
| 41 | 去掉ipv6相关逻辑 | 当前代码已全部为 IPv4-only，无需修改 |
| 42 | 扫描二维码，手机快捷访问；说明二维码对应的链接 | QR 码下方添加 `↗ http://...` 链接文字 |
