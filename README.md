## meomeo 工作台（桌面壁纸版）

它既是你的实时桌面壁纸，也能记录「任务与每日发现」并与本地 JSON 同步。

### 你会看到什么（前端设计）
- 柔和动画背景（跟随鼠标轻微视差）
- 可爱日期条（翻页数字、周几、天气图标）
- 任务卡片（完成小庆祝、果冻加号按钮）
- 每日发现（新增自动滚动可见、展开收起）
- 无滚动条样式，整洁清爽
- 右上角数据同步按钮（连接状态、手动/自动同步）

---

## 与 Lively Wallpaper 联动（重要）
- 由于 Lively 的 WebView 输入焦点与 IME 限制，作为壁纸运行时目前**无法输入中文**，只能输入英文。这是 Lively 的已知限制。若需要中文输入，请在普通浏览器窗口中打开页面进行输入。
- 必须将 Lively 的壁纸输入方式设置为**键盘（Keyboard）**：
  1. 打开 Lively → Settings → Wallpaper Input。
  2. 选择 Keyboard。
  3. 重新应用壁纸。
- 如何把本项目作为 Lively 壁纸（开发模式）：
  1. 先启动项目（见下一节），确保前端运行在 `http://localhost:3000`。
  2. Lively → Add Wallpaper → URL → 输入 `http://localhost:3000` → Add。
- 常见现象：切换到中文输入法后仍然无法在壁纸中输入中文，属于预期行为；请改为在浏览器中输入。

---

## 一键脚本启动（日常用这个）
脚本都在项目根目录。

- 同时启动前后端（会弹出两个 PowerShell 窗口）
```powershell
.\run.ps1
```
- 只启动后端（Flask，5000）
```powershell
.\run-back.ps1
```
- 只启动前端（Next.js，3000）
```powershell
.\run-front.ps1
```

脚本做了什么（原理简述）
- `run-back.ps1`：用项目内 `\.venv\Scripts\python.exe` 直接运行后端（无需激活 venv、不依赖系统 PATH），并自动安装 `requirements.txt` 后启动 `server.py`。
- `run-front.ps1`：进入 `v0/`，检测 `package-lock.json` 后执行 `npm ci` 或 `npm install`，再 `npm run dev`。
- `run.ps1`：分别以新窗口运行上述两个脚本，并带 `-ExecutionPolicy Bypass` 以保证脚本能执行。

为什么稳定：不依赖全局 Python/pyenv 状态，固定使用项目自己的 venv 中的 `python.exe`。

访问地址
- 前端开发页：`http://localhost:3000`
- 后端 API：`http://localhost:5000`
- 数据文件：`data/tasks.json`、`data/discoveries.json`

---

## 首次安装（只做一次）
如果还没有 `\.venv/`：
```powershell
# 能用 python 命令：
python -m venv .venv
# 或指定 pyenv 安装的具体版本路径：
& "$env:USERPROFILE\.pyenv\pyenv-win\versions\3.11.9\python.exe" -m venv .venv
```
前端依赖（Node 18+）：
```powershell
cd .\v0
npm ci
```

---

## 常见问题（简）
- 脚本无法执行：管理员 PowerShell 执行一次
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```
- 仅在浏览器全屏当壁纸：按 F11；或（独立窗）
```powershell
Start-Process msedge '--app=http://localhost:3000','--start-fullscreen'
```
- 前端显示 Offline：确认后端已运行（`server.py`），需要时查看 `v0/lib/data-sync.ts` 的 `SERVER_URL`（默认 `http://localhost:5000`）。 
- 在 Lively 壁纸中无法输入中文：属于 Lively 限制，当前只能输入英文；请在 Lively → Settings → Wallpaper Input 选择 Keyboard。若要中文输入，请在普通浏览器中打开 `http://localhost:3000`。