# AIrena → Monad Perps 游戏化改版文档

## 一、核心概念重塑

### 1.1 游戏主题变更
- **原主题**: 10人大乱斗竞技场
- **新主题**: BTC永续合约做多 vs 做空双方在可视化竞技场战斗

### 1.2 阵营系统
```typescript
// 新增阵营类型
export type Position = 'long' | 'short';

export interface Agent {
  // ... 原有字段
  position: Position;  // 做多/做空阵营
  leverage: number;    // 杠杆倍数 (1x-100x)
  entryPrice: number;  // 入场价格
  liquidationPrice: number; // 爆仓价格
}
```

### 1.3 战斗机制重定义
- **战斗不再是随机攻击**，而是基于 BTC 价格变动的 PnL 结算
- **每秒结算**: 根据价格变动计算多空双方的盈亏
- **掠夺机制**: 盈利方从亏损方掠夺资金（带攻击动画）

---

## 二、视觉改版方案

### 2.1 竞技场布局重新设计

```
┌─────────────────────────────────────────────────────────────┐
│  [BTC价格显示]  $97,245.32  ▲ +1.2%  [24h涨跌]              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    ┌──────────┐                              ┌──────────┐  │
│    │  做多方  │      ⚔️ 竞技场中心 ⚔️         │  做空方  │  │
│    │  BULLS   │                              │  BEARS   │  │
│    │          │         [价格K线]             │          │  │
│    │ 🟢🟢🟢   │                              │   🔴🔴🔴  │  │
│    └──────────┘                              └──────────┘  │
│                                                             │
│  [资金费率显示]  [多空比例条]  [持仓价值]                    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 阵营视觉区分
- **做多方 (Bulls)**: 绿色主题 (#22c55e)
- **做空方 (Bears)**: 红色主题 (#ef4444)
- **中立元素**: 金色/紫色

### 2.3 攻击动画效果
1. **价格上涨时**: 绿色能量波从做多方射向做空方
2. **价格下跌时**: 红色能量波从做空方射向做多方
3. **掠夺效果**: 资金从亏损方流向盈利方的粒子效果
4. **爆仓特效**: 被爆仓 Agent 的爆炸动画 + 资金归零

---

## 三、核心机制改版

### 3.1 价格数据接入
```typescript
// 新增价格服务
interface PriceData {
  btcPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  fundingRate: number;  // 资金费率
  longShortRatio: number; // 多空比
  lastUpdate: number;
}

// 价格更新频率: 每秒
const PRICE_UPDATE_INTERVAL = 1000;
```

### 3.2 盈亏计算逻辑
```typescript
// 每秒结算公式
function calculatePnL(agent: Agent, currentPrice: number): number {
  if (agent.position === 'long') {
    // 做多: (现价 - 入场价) / 入场价 * 杠杆 * 本金
    return ((currentPrice - agent.entryPrice) / agent.entryPrice) * 
           agent.leverage * agent.balance;
  } else {
    // 做空: (入场价 - 现价) / 入场价 * 杠杆 * 本金
    return ((agent.entryPrice - currentPrice) / agent.entryPrice) * 
           agent.leverage * agent.balance;
  }
}

// 爆仓检测
function checkLiquidation(agent: Agent, currentPrice: number): boolean {
  const pnlPercent = agent.position === 'long' 
    ? (currentPrice - agent.entryPrice) / agent.entryPrice * agent.leverage
    : (agent.entryPrice - currentPrice) / agent.entryPrice * agent.leverage;
  
  // 亏损超过90%爆仓
  return pnlPercent < -0.9;
}
```

### 3.3 掠夺机制
```typescript
// 每轮结算时，盈利方掠夺亏损方
function executeSettlement(
  longAgents: Agent[], 
  shortAgents: Agent[], 
  priceChange: number
) {
  if (priceChange > 0) {
    // 价格上涨: 做多方盈利，掠夺做空方
    const totalLongProfit = calculateTotalProfit(longAgents, priceChange);
    const totalShortLoss = calculateTotalLoss(shortAgents, priceChange);
    
    // 掠夺比例分配
    distributeLoot(longAgents, shortAgents, Math.min(totalLongProfit, totalShortLoss));
  } else {
    // 价格下跌: 做空方盈利，掠夺做多方
    const totalShortProfit = calculateTotalProfit(shortAgents, priceChange);
    const totalLongLoss = calculateTotalLoss(longAgents, priceChange);
    
    distributeLoot(shortAgents, longAgents, Math.min(totalShortProfit, totalLongLoss));
  }
}
```

---

## 四、Agent 属性重定义

### 4.1 新属性系统
```typescript
export interface Agent {
  // ===== 原有基础属性保留 =====
  id: string;
  name: string;
  color: string;
  image?: string;
  
  // ===== 交易属性（替代战斗属性）=====
  position: 'long' | 'short';     // 持仓方向
  leverage: number;                // 杠杆 (1-100x)
  entryPrice: number;              // 入场价格
  liquidationPrice: number;        // 爆仓价格
  
  // ===== 交易风格属性（替代攻击/防御）=====
  riskTolerance: number;           // 风险偏好 (1-100)
  positionSize: number;            // 仓位大小偏好
  holdingTime: number;             // 持仓时间偏好
  
  // ===== 保留的经济属性 =====
  balance: number;                 // 当前余额
  initialBalance: number;          // 初始本金
  
  // ===== 统计属性 =====
  totalTrades: number;             // 总交易次数
  winRate: number;                 // 胜率
  totalPnL: number;                // 总盈亏
  maxDrawdown: number;             // 最大回撤
  sharpeRatio: number;             // 夏普比率
  
  // ===== 状态 =====
  status: 'idle' | 'in_arena' | 'trading' | 'liquidated';
}
```

### 4.2 Agent AI 策略
```typescript
// 自动生成交易策略
interface TradingStrategy {
  type: 'trend_follower' | 'contrarian' | 'scalper' | 'hodler';
  entryThreshold: number;    // 入场阈值 (%)
  exitThreshold: number;     // 止盈阈值 (%)
  stopLoss: number;          // 止损阈值 (%)
  maxLeverage: number;       // 最大杠杆
}

// 根据属性自动生成策略
function generateStrategy(agent: Agent): TradingStrategy {
  if (agent.riskTolerance > 70) {
    return { type: 'scalper', entryThreshold: 0.5, exitThreshold: 1, stopLoss: 2, maxLeverage: 50 };
  } else if (agent.riskTolerance < 30) {
    return { type: 'hodler', entryThreshold: 5, exitThreshold: 20, stopLoss: 10, maxLeverage: 3 };
  }
  // ... 其他策略
}
```

---

## 五、竞技场流程改版

### 5.1 新的战斗流程
```
1. 等待阶段 (waiting)
   - 显示当前 BTC 价格和 24h 涨跌
   - 用户可以派遣 Agent 进入竞技场

2. 选择阶段 (selecting) 
   - 系统选择 10 个 Agent 进入战斗
   - 5个做多，5个做空（或根据多空比动态调整）

3. 入场阶段 (loading)
   - Agent 进入各自阵营位置
   - 显示入场价格和杠杆

4. 战斗阶段 (fighting) - 30秒
   - 每秒根据价格变动结算盈亏
   - 实时显示资金流动画
   - 爆仓 Agent 被淘汰

5. 结算阶段 (settlement)
   - 显示 TOP3 盈利 Agent
   - 统计本轮盈亏
   - 准备下一轮
```

### 5.2 实时价格展示
```typescript
// 顶部价格栏组件
interface PriceHeaderProps {
  btcPrice: number;
  priceChange24h: number;
  fundingRate: number;
  longShortRatio: number;
}

// K线迷你图
interface MiniChartProps {
  data: { price: number; timestamp: number }[];
  timeframe: '1m' | '5m' | '15m' | '1h';
}
```

---

## 六、技术实现方案

### 6.1 需要修改的文件

| 文件 | 修改内容 |
|------|----------|
| `src/types/index.ts` | 添加 Position、PriceData 等新类型 |
| `src/store/gameStore.ts` | 重写战斗逻辑，接入价格数据 |
| `src/pages/Arena.tsx` | 新增价格展示、阵营布局 |
| `src/components/ArenaCanvas.tsx` | 重做战斗动画，多空阵营效果 |
| `src/components/PixelAgent.tsx` | 添加阵营标识、杠杆显示 |
| `src/utils/priceService.ts` | 新增价格数据获取服务 |

### 6.2 新增文件

```
src/
├── services/
│   └── priceService.ts      # BTC价格获取服务
├── hooks/
│   └── usePriceData.ts      # 价格数据 Hook
├── components/
│   ├── PriceHeader.tsx      # 顶部价格展示
│   ├── MiniChart.tsx        # 迷你K线图
│   ├── PositionBadge.tsx    # 多空阵营标识
│   └── LiquidationEffect.tsx # 爆仓特效
└── utils/
    └── pnlCalculator.ts     # 盈亏计算工具
```

### 6.3 价格数据源
```typescript
// 可选方案：
// 1. Binance API (免费，有频率限制)
const BINANCE_API = 'https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT';

// 2. CoinGecko API (免费，无需API Key)
const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';

// 3. WebSocket 实时数据 (推荐)
const BINANCE_WS = 'wss://stream.binance.com:9443/ws/btcusdt@ticker';
```

---

## 七、UI/UX 改版细节

### 7.1 颜色系统更新
```css
/* tailwind.config.js 新增 */
colors: {
  'bull': {
    DEFAULT: '#22c55e',
    light: '#4ade80',
    dark: '#16a34a',
  },
  'bear': {
    DEFAULT: '#ef4444', 
    light: '#f87171',
    dark: '#dc2626',
  },
  'neutral': {
    DEFAULT: '#a855f7',
    light: '#c084fc',
    dark: '#9333ea',
  }
}
```

### 7.2 战斗动画效果
```typescript
// 新增动画类型
interface BattleEffect {
  type: 'price_up' | 'price_down' | 'liquidation' | 'profit' | 'loss';
  from: Position;
  to: Position;
  amount: number;
  timestamp: number;
}

// 粒子效果配置
const PARTICLE_CONFIG = {
  bullAttack: { color: '#22c55e', direction: 'left-to-right' },
  bearAttack: { color: '#ef4444', direction: 'right-to-left' },
  liquidation: { color: '#fbbf24', effect: 'explosion' },
};
```

---

## 八、游戏平衡性设计

### 8.1 杠杆风险机制
| 杠杆倍数 | 爆仓阈值 | 收益倍数 | 风险等级 |
|---------|---------|---------|---------|
| 1x | -90% | 1x | 低 |
| 5x | -18% | 5x | 中 |
| 10x | -9% | 10x | 高 |
| 50x | -1.8% | 50x | 极高 |
| 100x | -0.9% | 100x | 疯狂 |

### 8.2 资金费率影响
- 正资金费率: 做多方支付给做空方
- 负资金费率: 做空方支付给做多方
- 每8小时结算一次（加速到每轮结算）

### 8.3 Agent 策略多样性
- **趋势跟随者**: 追涨杀跌，高杠杆
- **逆向交易者**: 抄底摸顶，中杠杆
- **日内交易者**: 频繁进出，低杠杆
- **长期持有者**: 低杠杆，长期持仓

---

## 九、实施计划

### Phase 1: 基础架构 (2-3天)
1. 新增类型定义和接口
2. 实现价格数据服务
3. 创建盈亏计算工具

### Phase 2: 核心逻辑 (3-4天)
1. 重写战斗结算逻辑
2. 实现多空阵营系统
3. 添加爆仓机制

### Phase 3: 视觉效果 (3-4天)
1. 重做 ArenaCanvas 组件
2. 实现阵营视觉效果
3. 添加价格展示组件

### Phase 4: 优化测试 (2-3天)
1. 平衡性调整
2. 性能优化
3. Bug修复

---

## 十、风险与注意事项

1. **价格波动**: 真实价格可能过于平稳，考虑添加模拟波动
2. **爆仓体验**: 确保爆仓有明确视觉反馈，但不要太打击玩家
3. **延迟问题**: 价格数据延迟可能影响公平性
4. **监管合规**: 避免过于真实的赌博体验，明确游戏性质

---

## 附录: 关键代码示例

### A. 价格服务
```typescript
// src/services/priceService.ts
export class PriceService {
  private ws: WebSocket | null = null;
  private listeners: ((data: PriceData) => void)[] = [];
  
  connect() {
    this.ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const priceData: PriceData = {
        btcPrice: parseFloat(data.c),
        priceChange24h: parseFloat(data.p),
        priceChangePercent24h: parseFloat(data.P),
        fundingRate: 0.0001, // 模拟资金费率
        longShortRatio: 1.2, // 模拟多空比
        lastUpdate: Date.now(),
      };
      this.listeners.forEach(cb => cb(priceData));
    };
  }
  
  subscribe(callback: (data: PriceData) => void) {
    this.listeners.push(callback);
  }
}
```

### B. 盈亏计算
```typescript
// src/utils/pnlCalculator.ts
export function calculateSettlement(
  agents: Agent[], 
  priceChange: number
): SettlementResult {
  const longs = agents.filter(a => a.position === 'long');
  const shorts = agents.filter(a => a.position === 'short');
  
  const longPnL = longs.reduce((sum, a) => sum + calculatePnL(a, priceChange), 0);
  const shortPnL = shorts.reduce((sum, a) => sum + calculatePnL(a, priceChange), 0);
  
  // 盈利方掠夺亏损方
  const totalLoot = Math.min(Math.abs(longPnL), Math.abs(shortPnL));
  
  return {
    winners: longPnL > 0 ? longs : shorts,
    losers: longPnL > 0 ? shorts : longs,
    totalLoot,
    liquidated: agents.filter(a => checkLiquidation(a, priceChange)),
  };
}
```

---

**文档版本**: 1.0
**最后更新**: 2026-02-10
**作者**: AI Assistant