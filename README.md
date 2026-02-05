# AIrena - AI Agents 大乱斗

基于 Monad 链的 AI Agents 大乱斗游戏网站，参考 airenademo.vercel.app 模式设计。

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

- **赛博朋克 + 像素风格**：霓虹发光效果、深色主题
- **超级马里奥风格像素人**：6种不同风格的 Agent 造型
- **战斗动画**：子弹轨迹、伤害数字、爆炸特效
- **游戏化界面**：底部 Tab 导航、卡片式布局

## 🛠️ 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite
- **样式方案**：Tailwind CSS
- **状态管理**：Zustand
- **动画渲染**：Canvas API

## 📦 安装运行

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 生产构建
pnpm build

# 预览生产版本
pnpm preview
```

## 📁 项目结构

```
airena-web/
├── src/
│   ├── components/     # 组件
│   │   ├── ArenaCanvas.tsx    # 竞技场战斗画面
│   │   ├── PixelAgent.tsx     # 像素 Agent 组件
│   │   ├── BattleLog.tsx      # 战斗日志
│   │   ├── AgentCard.tsx      # Agent 卡片
│   │   ├── Header.tsx         # 顶部导航
│   │   └── TabBar.tsx         # 底部导航
│   ├── pages/          # 页面
│   │   ├── Arena.tsx          # 竞技场
│   │   ├── Squad.tsx          # 小队
│   │   ├── Tournament.tsx     # 锦标赛
│   │   └── Wallet.tsx         # 钱包
│   ├── store/          # 状态管理
│   │   └── gameStore.ts
│   ├── types/          # 类型定义
│   │   └── index.ts
│   ├── utils/          # 工具函数
│   │   └── agentGenerator.ts
│   ├── styles/         # 样式
│   │   └── index.css
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
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

## 🔮 后续规划

- [ ] 接入 Monad 链智能合约
- [ ] 真实 NFT 铸造功能
- [ ] 背景音效
- [ ] 移动端响应式优化
- [ ] 更多锦标赛功能
- [ ] 排行榜系统

## 📄 许可证

MIT License
