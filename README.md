# Memo Sharing Frontend

使用 React + Vite + HeroUI 构建的前端应用，可以从 Supabase 后端随机浏览你的读书摘抄，同时支持管理员登录后批量录入句子并管理点赞。

## 功能概览
- 🎴 随机展示摘抄卡片，支持左右箭头、键盘与触摸滑动切换。
- 💡 预取机制：一次获取 10 条，剩余 2 条时自动再取 10 条，体验更顺滑。
- ❤️ 点赞系统：
  - 游客点赞信息保存在本地并通过 `adjust_memo_like` 写入数据库。
  - 管理员可一键切换个人点赞状态，使用 `owner_toggle_memo_like` 保持计数一致。
- 🌓 深浅配色：跟随系统设置，可通过右上角按钮手动循环「系统 → 浅色 → 深色」。
- 🔐 管理面板：登录后填写书名、作者及多句文本（空行分隔）即可批量写入 `books` 与 `memos`。

## 环境准备
1. 克隆仓库并安装依赖：
   ```bash
   npm install
   ```
2. 复制 `.env.example` 为 `.env.local`（或 `.env`），填入 Supabase 项目的公开配置：
   ```ini
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=你的 anon key
   ```
3. 确认 Supabase 数据库中已执行提供的 SQL，确保表结构、RLS 策略及 RPC 函数可用。

> **提示**：若需要邮箱/密码登录，请在 Supabase Auth 中创建对应的用户账号。

## 开发与构建
- 本地开发：`npm run dev`
- 类型检查 + 构建：`npm run build`
- 预览生产构建：`npm run preview`

默认使用 Vite 开发服务器，端口为 5173。构建产物位于 `dist/` 目录，可直接部署到任意静态托管平台。

## 代码结构
```
src/
  components/
    MemoViewer.tsx        # 随机卡片视图与点赞控制
    ThemeToggle.tsx       # 主题切换按钮
    admin/AdminPanel.tsx  # 管理面板（登录后可批量录入）
    auth/AuthDialog.tsx   # 登录弹窗
  hooks/
    useVisitorLikes.ts    # 游客点赞本地缓存
  lib/
    supabaseClient.ts     # Supabase 初始化
  providers/
    theme.tsx             # 主题上下文与 HeroUI Provider
  services/
    auth.ts               # 登录 / 登出 / 会话订阅
    memos.ts              # 随机查询、点赞、写入逻辑
  utils/
    memoParser.ts         # 将文本块按空行拆分成句子
  App.tsx                 # 页面骨架
  main.tsx                # 应用入口
```

## 访客点赞说明
- 游客点赞会立即调用 `adjust_memo_like(memo_id, delta)` 更新 `like_count`，同时在浏览器 `localStorage` 中记住对应状态。
- 由于只有一个管理员账号，未对游客重复点赞做额外限制；如需更严格的控制，可结合 IP 或 Supabase Edge Functions 改造。

## 管理员操作流程
1. 点击右上角「登录」，输入在 Supabase Auth 中创建的邮箱与密码。
2. 登录成功后，管理面板会显示在页面下方：
   - 书名 & 作者字段用于定位或新建 `books` 记录；
   - 「摘抄内容」处粘贴多个句子，使用空行分隔；
   - 提交后会自动拆分并写入 `memos` 表。
3. 成功保存后相关句子会出现在随机卡片中，必要时可点击「重新随机」刷新。

## 进一步扩展的想法
- 增加书籍筛选或标签，让访客按书浏览。
- 为游客点赞添加节流或指纹标识。
- 接入 Supabase Edge Functions，对点赞等操作做 serverless 统计。
- 实现简单的多语言切换或英文界面。

欢迎继续按需扩展！
