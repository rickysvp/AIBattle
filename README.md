# AIrena - AI Agents 大乱斗

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](./version.json)
[![Vercel](https://img.shields.io/badge/Vercel-deployed-black?logo=vercel)](https://aibattle.vercel.app)
[![Lovable](https://img.shields.io/badge/Lovable-deployed-purple?logo=lovable)](https://aibattle.lovable.app)

基于 Monad 链的 AI Agents 大乱斗游戏网站，参考 airenademo.vercel.app 模式设计。

## 🚀 在线预览

| 平台 | 地址 | 状态 |
|------|------|------|
| 🚀 **Vercel** | [aibattle.vercel.app](https://aibattle.vercel.app) | ✅ 已部署 |
| 💜 **Lovable** | [aibattle.lovable.app](https://aibattle.lovable.app) | ✅ 已部署 |
| 🖥️ **本地开发** | http://localhost:5173 | 开发中 |

## 📋 版本信息

**当前版本**: v1.0.0

查看 [version.json](./version.json) 了解详细版本历史和变更日志。

### 版本管理

```bash
# 查看当前版本
node scripts/version.js

# 更新补丁版本 (1.0.0 -> 1.0.1)
node scripts/version.js patch

# 更新次要版本 (1.0.0 -> 1.1.0)
node scripts/version.js minor

# 更新主要版本 (1.0.0 -> 2.0.0)
node scripts/version.js major

# 设置指定版本
node scripts/version.js 1.2.3
```

## 🎮 项目概述

AIrena 是一个去中心化的 AI Agents 竞技游戏平台，玩家可以铸造自己的 Agent NFT，为其分配资产后加入竞技场进行自动战斗，赢取对方 Agents 的资产。

## ✨ 核心功能

### 🏟️ 竞技场
- **10人大乱斗机制**：每轮随机选择10个 Agents 参与战斗
- **秒级结算**：战斗过程10秒，期间所有 Agents 以射击形式随机战斗
- **实时战斗画面**：像素风格的虚拟数字竞技擂台
- **战斗日志**：分栏显示竞技场日志和我的战斗日志
- **TOP3 盈利显示**：每轮结束后显示前三名盈利

### 🤖 小队管理
- **快速铸造**：支持批量铸造1/5/10个 Agents
- **超级马里奥风格像素人**：6种不同风格的像素人造型
- **资金分配**：为 Agents 手动分配余额
- **加入/退出竞技场**：灵活管理 Agent 状态

### 🏆 锦标赛
- 多种赛事类型（新手杯、精英挑战赛、周末大乱斗）
- 报名参赛功能
- 奖池和参赛人数实时显示

### 💰 钱包
- 钱包连接/断开
- 资产分布可视化
- 交易记录查看
- 充值/提现功能

## 🎨 视觉设计

- **赛博朋克奢华风格**：霓虹发光效果、深色主题、玻璃态设计
- **超级马里奥风格像素人**：6种不同风格的 Agent 造型
- **战斗动画**：子弹轨迹、伤害数字、爆炸特效
- **游戏化界面**：底部 Tab 导航、卡片式布局

## 🛠️ 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite 5
- **样式方案**：Tailwind CSS 3
- **状态管理**：Zustand
- **动画渲染**：Canvas API
- **图标库**：Lucide React

## 📦 安装运行

```bash
# 克隆仓库
git clone https://github.com/rickysvp/aibattle.git
cd aibattle

# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build

# 预览生产版本
npm run preview
```

## 📁 项目结构

```
airena-web/
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions 自动部署
├── scripts/
│   └── version.js           # 版本管理脚本
├── src/
│   ├── components/          # 组件
│   │   ├── ArenaCanvas.tsx  # 竞技场战斗画面
│   │   ├── PixelAgent.tsx   # 像素 Agent 组件
│   │   ├── BattleLog.tsx    # 战斗日志
│   │   ├── AgentCard.tsx    # Agent 卡片
│   │   ├── Header.tsx       # 顶部导航
│   │   └── TabBar.tsx       # 底部导航
│   ├── pages/               # 页面
│   │   ├── Arena.tsx        # 竞技场
│   │   ├── Squad.tsx        # 小队
│   │   ├── Tournament.tsx   # 锦标赛
│   │   └── Wallet.tsx       # 钱包
│   ├── store/               # 状态管理
│   │   └── gameStore.ts
│   ├── types/               # 类型定义
│   │   └── index.ts
│   ├── utils/               # 工具函数
│   │   └── agentGenerator.ts
│   ├── styles/              # 样式
│   │   └── index.css
│   ├── App.tsx
│   └── main.tsx
├── version.json             # 版本信息
├── vercel.json              # Vercel 部署配置
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🎯 战斗机制

1. **选择阶段**：系统随机选择10个 Agents 参与本轮战斗
2. **点亮坑位**：倒计时3秒，逐个点亮参赛者头像
3. **战斗阶段**：10秒战斗时间，Agents 随机攻击互动
4. **结算阶段**：显示 TOP3 盈利，更新资产
5. **等待阶段**：5秒后开始下一轮

## 🔄 自动部署

项目配置了 GitHub Actions 自动部署：

- **推送至 main 分支**：自动部署到 Vercel
- **创建版本标签 (v*)**：自动创建 GitHub Release
- **PR 检查**：自动构建测试

### 部署 Secrets 配置

需要在 GitHub 仓库设置以下 Secrets：

- `VERCEL_TOKEN` - Vercel 访问令牌
- `VERCEL_ORG_ID` - Vercel 组织 ID
- `VERCEL_PROJECT_ID` - Vercel 项目 ID

## 🔮 后续规划

- [ ] 接入 Monad 链智能合约
- [ ] 真实 NFT 铸造功能
- [ ] 背景音效
- [ ] 移动端响应式优化
- [ ] 更多锦标赛功能
- [ ] 排行榜系统

## 📄 许可证

MIT License

---

<p align="center">
  Made with ❤️ by AIrena Team
</p>
