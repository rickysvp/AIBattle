## 实施计划

### 1. 删除 TabBar 的流动性挖矿模块
- **文件**: `src/components/TabBar.tsx`
- **操作**: 删除 mining 导航项，只保留：竞技场、小队、钱包

### 2. 初始化竞技场 - 1000 个系统 Agents
- **文件**: `src/store/gameStore.ts`
- **修改**:
  - 修改 `initializeArena()` 生成 1000 个系统 Agents
  - 这些 Agents 作为流动性在竞技场内
  - 设置初始余额、交易属性（多空方向、杠杆等）
  - 状态设为 'in_arena'

### 3. 优化 UI 界面
- **全局样式优化**:
  - 统一 Monad 品牌色系（紫色/青色主题）
  - 优化卡片、按钮、动画效果
  - 添加价格走势图表组件

### 4. 重构小队模块 (Squad)
- **文件**: `src/pages/Squad.tsx`
- **新功能**:
  - 显示用户拥有的 Agents 列表
  - 每个 Agent 显示：持仓方向、杠杆、盈亏、状态
  - 操作：存入资金、提取资金、调整杠杆
  - 批量操作支持
  - 进入/退出竞技场

### 5. 重构钱包模块 (Wallet)
- **文件**: `src/pages/Wallet.tsx`
- **新功能**:
  - 账户总览：余额、总盈亏、持仓价值
  - 充值/提现功能
  - 交易历史记录
  - 持仓分布图表（多空比例）

### 6. 删除流动性挖矿相关代码
- **文件**: `src/store/gameStore.ts`, `src/App.tsx`
- **操作**: 移除 LiquidityMining 页面引用和 store 中的流动性挖矿逻辑

### 7. 更新路由
- **文件**: `src/App.tsx`
- **操作**: 删除 `/mining` 路由

### 8. 更新类型定义
- **文件**: `src/types/index.ts`
- **操作**: 清理未使用的 LiquidityPool 类型（如不再需要）

## 实施顺序
1. 删除 TabBar 挖矿导航 + 删除路由
2. 更新 gameStore - 初始化 1000 个系统 Agents
3. 重构 Squad 页面
4. 重构 Wallet 页面
5. 优化全局 UI 样式
6. 清理未使用的代码

请确认后我将开始实施。