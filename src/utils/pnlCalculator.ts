import { Agent, Position, SettlementResult, TradingStrategy, TradingStyle } from '../types';

/**
 * 盈亏计算器 - Monad Perps 核心计算逻辑
 */

// 计算单个 Agent 的盈亏
export function calculatePnL(agent: Agent, currentPrice: number, entryPrice?: number): number {
  const basePrice = entryPrice || agent.entryPrice;
  if (!basePrice || basePrice === 0) return 0;

  const priceChange = (currentPrice - basePrice) / basePrice;

  if (agent.position === 'long') {
    // 做多: 价格上涨盈利
    return agent.balance * priceChange * agent.leverage;
  } else {
    // 做空: 价格下跌盈利
    return agent.balance * (-priceChange) * agent.leverage;
  }
}

// 计算盈亏百分比
export function calculatePnLPercent(agent: Agent, currentPrice: number): number {
  const priceChange = (currentPrice - agent.entryPrice) / agent.entryPrice;

  if (agent.position === 'long') {
    return priceChange * agent.leverage * 100;
  } else {
    return -priceChange * agent.leverage * 100;
  }
}

// 检查是否爆仓
export function checkLiquidation(agent: Agent, currentPrice: number): boolean {
  const pnlPercent = calculatePnLPercent(agent, currentPrice);
  // 亏损超过 90% 爆仓（考虑杠杆）
  return pnlPercent < -90;
}

// 计算爆仓价格
export function calculateLiquidationPrice(agent: Agent): number {
  const liquidationThreshold = 0.9; // 90% 亏损爆仓

  if (agent.position === 'long') {
    // 做多爆仓价格 = 入场价 * (1 - 0.9/杠杆)
    return agent.entryPrice * (1 - liquidationThreshold / agent.leverage);
  } else {
    // 做空爆仓价格 = 入场价 * (1 + 0.9/杠杆)
    return agent.entryPrice * (1 + liquidationThreshold / agent.leverage);
  }
}

// 计算结算结果
export function calculateSettlement(
  agents: Agent[],
  priceChange: number,
  currentPrice: number
): SettlementResult {
  const longs = agents.filter(a => a.position === 'long');
  const shorts = agents.filter(a => a.position === 'short');

  // 计算每个 Agent 的盈亏
  const longResults = longs.map(agent => ({
    agent,
    pnl: calculatePnL(agent, currentPrice),
    pnlPercent: calculatePnLPercent(agent, currentPrice),
    liquidated: checkLiquidation(agent, currentPrice),
  }));

  const shortResults = shorts.map(agent => ({
    agent,
    pnl: calculatePnL(agent, currentPrice),
    pnlPercent: calculatePnLPercent(agent, currentPrice),
    liquidated: checkLiquidation(agent, currentPrice),
  }));

  // 计算总盈亏
  const totalLongPnL = longResults.reduce((sum, r) => sum + r.pnl, 0);
  const totalShortPnL = shortResults.reduce((sum, r) => sum + r.pnl, 0);

  // 确定获胜方
  const longsWin = totalLongPnL > 0;
  const winningSide: Position = longsWin ? 'long' : 'short';

  // 盈利方掠夺亏损方
  const winners = longsWin ? longResults.filter(r => r.pnl > 0) : shortResults.filter(r => r.pnl > 0);
  const losers = longsWin ? shortResults.filter(r => r.pnl < 0) : longResults.filter(r => r.pnl < 0);

  // 计算可掠夺总额
  const totalWinnerProfit = winners.reduce((sum, r) => sum + r.pnl, 0);
  const totalLoserLoss = Math.abs(losers.reduce((sum, r) => sum + r.pnl, 0));
  const totalLoot = Math.min(totalWinnerProfit, totalLoserLoss);

  // 爆仓的 Agents
  const liquidated = [...longResults, ...shortResults]
    .filter(r => r.liquidated)
    .map(r => r.agent);

  return {
    winners: winners.map(r => r.agent),
    losers: losers.map(r => r.agent),
    totalLoot,
    liquidated,
    priceChange,
    winningSide,
  };
}

// 分配掠夺资金
export function distributeLoot(
  winners: Agent[],
  losers: Agent[],
  totalLoot: number
): Map<string, number> {
  const lootDistribution = new Map<string, number>();

  if (winners.length === 0 || losers.length === 0 || totalLoot <= 0) {
    return lootDistribution;
  }

  // 按盈利比例分配掠夺
  const totalWinnerBalance = winners.reduce((sum, a) => sum + a.balance, 0);

  winners.forEach(winner => {
    const share = winner.balance / totalWinnerBalance;
    const loot = totalLoot * share;
    lootDistribution.set(winner.id, loot);
  });

  return lootDistribution;
}

// 生成交易策略
export function generateTradingStrategy(riskTolerance: number): TradingStrategy {
  if (riskTolerance >= 75) {
    return {
      type: 'scalper',
      entryThreshold: 0.5,
      exitThreshold: 2,
      stopLoss: 5,
      maxLeverage: 50,
      description: 'High-frequency scalper with extreme leverage',
    };
  } else if (riskTolerance >= 50) {
    return {
      type: 'trend_follower',
      entryThreshold: 2,
      exitThreshold: 10,
      stopLoss: 8,
      maxLeverage: 20,
      description: 'Trend follower with high leverage',
    };
  } else if (riskTolerance >= 25) {
    return {
      type: 'contrarian',
      entryThreshold: 5,
      exitThreshold: 15,
      stopLoss: 10,
      maxLeverage: 10,
      description: 'Contrarian trader with moderate leverage',
    };
  } else {
    return {
      type: 'hodler',
      entryThreshold: 10,
      exitThreshold: 30,
      stopLoss: 15,
      maxLeverage: 3,
      description: 'Long-term hodler with low leverage',
    };
  }
}

// 根据策略选择杠杆
export function selectLeverage(strategy: TradingStrategy): number {
  const maxLeverage = strategy.maxLeverage;
  // 在 1x 到 maxLeverage 之间随机选择
  const leverageTiers = [1, 2, 5, 10, 20, 50, 100];
  const availableTiers = leverageTiers.filter(t => t <= maxLeverage);
  const randomIndex = Math.floor(Math.random() * availableTiers.length);
  return availableTiers[randomIndex];
}

// 随机选择持仓方向
export function selectPosition(): Position {
  return Math.random() > 0.5 ? 'long' : 'short';
}

// 计算资金费率影响
export function calculateFundingImpact(
  agent: Agent,
  fundingRate: number,
  positionValue: number
): number {
  // 资金费率为正时，做多方支付给做空方
  // 资金费率为负时，做空方支付给做多方
  if (agent.position === 'long') {
    return -positionValue * fundingRate;
  } else {
    return positionValue * fundingRate;
  }
}

// 格式化价格显示
export function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return price.toFixed(2);
}

// 格式化百分比
export function formatPercent(percent: number): string {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

// 格式化大数字
export function formatCompactNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
}

// 获取 PnL 颜色
export function getPnLColor(pnl: number): string {
  if (pnl > 0) return '#22c55e'; // 绿色
  if (pnl < 0) return '#ef4444'; // 红色
  return '#9ca3af'; // 灰色
}

// 获取持仓方向颜色
export function getPositionColor(position: Position): string {
  return position === 'long' ? '#22c55e' : '#ef4444';
}

// 获取持仓方向标签
export function getPositionLabel(position: Position): string {
  return position === 'long' ? 'LONG' : 'SHORT';
}

// 计算多空比
export function calculateLongShortRatio(agents: Agent[]): number {
  const longs = agents.filter(a => a.position === 'long').length;
  const shorts = agents.filter(a => a.position === 'short').length;

  if (shorts === 0) return longs > 0 ? Infinity : 1;
  return longs / shorts;
}

// 模拟价格变动（用于战斗结算）
export function simulatePriceChange(volatility: number = 0.02): number {
  // 生成 -2% 到 +2% 的随机价格变动
  return (Math.random() - 0.5) * 2 * volatility;
}

// 计算 Agent 的"战斗力"（用于视觉展示）
export function calculateBattlePower(agent: Agent): number {
  // 基于余额、杠杆和风险偏好的综合评分
  const balanceScore = Math.log10(agent.balance + 1) * 10;
  const leverageScore = agent.leverage;
  const riskScore = agent.riskTolerance / 10;

  return Math.floor(balanceScore + leverageScore + riskScore);
}
