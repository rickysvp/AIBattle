// 稀有度类型
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

// ============ Monad Perps 新增类型 ============

// 持仓方向: 做多/做空
export type Position = 'long' | 'short';

// 交易风格
export type TradingStyle = 'trend_follower' | 'contrarian' | 'scalper' | 'hodler';

// 支持的币种类型
export type CryptoSymbol = 'BTC' | 'ETH' | 'SOL' | 'MON';

// 单个币种价格数据
export interface CryptoPrice {
  symbol: CryptoSymbol;
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  fundingRate: number;
  longShortRatio: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  lastUpdate: number;
}

// 多币种价格数据
export interface PriceData {
  // 主币种（当前选中的交易对）
  symbol: CryptoSymbol;
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  // 每秒涨跌（与上一秒对比）
  secondChangePercent: number;
  fundingRate: number;
  longShortRatio: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  lastUpdate: number;
  // 兼容旧代码的字段
  btcPrice: number;
  // 所有币种数据
  cryptos: Record<CryptoSymbol, CryptoPrice>;
}

// 价格历史数据点
export interface PricePoint {
  price: number;
  timestamp: number;
}

// 交易策略
export interface TradingStrategy {
  type: TradingStyle;
  entryThreshold: number;
  exitThreshold: number;
  stopLoss: number;
  maxLeverage: number;
  description: string;
}

// 结算结果
export interface SettlementResult {
  winners: Agent[];
  losers: Agent[];
  totalLoot: number;
  liquidated: Agent[];
  priceChange: number;
  winningSide: Position;
}

// 战斗效果
export interface BattleEffect {
  id: string;
  type: 'price_up' | 'price_down' | 'liquidation' | 'profit' | 'loss' | 'funding';
  fromAgent?: Agent;
  toAgent?: Agent;
  amount: number;
  position: Position;
  timestamp: number;
}

// ============ 原有类型定义（保留并扩展） ============

// Agent 类型定义
export interface Agent {
  id: string;
  name: string;
  nftId: number;
  color: string;
  image?: string;

  // ===== 基础属性（保留用于兼容性） =====
  attack: number;
  defense: number;
  speed: number;
  critRate: number;
  critDamage: number;
  evasion: number;
  accuracy: number;
  luck: number;
  totalStats: number;
  rarity: Rarity;

  // ===== 战斗属性（保留用于兼容性） =====
  hp: number;
  maxHp: number;

  // ===== 经济属性 =====
  balance: number;
  initialBalance: number;

  // ===== Monad Perps 新增交易属性 =====
  position: Position;
  leverage: number;
  entryPrice: number;
  liquidationPrice: number;
  tradingStyle: TradingStyle;
  riskTolerance: number;

  // ===== 基础统计 =====
  wins: number;
  losses: number;
  kills: number;
  deaths: number;

  // ===== 详细统计 =====
  totalBattles: number;
  winRate: number;
  totalEarnings: number;
  totalLosses: number;
  netProfit: number;
  avgDamageDealt: number;
  avgDamageTaken: number;
  maxKillStreak: number;
  currentKillStreak: number;
  tournamentWins: number;
  tournamentTop3: number;

  // ===== 历史记录 =====
  battleHistory: BattleRecord[];

  // ===== 状态 =====
  status: 'idle' | 'in_arena' | 'fighting' | 'eliminated' | 'liquidated';
  coordinates?: { x: number; y: number };
  isPlayer: boolean;
  pixelStyle: number;
  createdAt: number;
}

// 战斗记录
export interface BattleRecord {
  id: string;
  timestamp: number;
  opponent: string;
  result: 'win' | 'loss' | 'draw';
  damageDealt: number;
  damageTaken: number;
  earnings: number;
  kills: number;
  isTournament: boolean;
  tournamentName?: string;
  rank?: number;
  // Perps 新增
  position?: Position;
  leverage?: number;
  pnl?: number;
  liquidation?: boolean;
}

// 战斗日志类型
export interface BattleLog {
  id: string;
  timestamp: number;
  type: 'attack' | 'eliminate' | 'damage' | 'round_start' | 'round_end' | 'join' | 'leave' | 'liquidation' | 'funding';
  attacker?: Agent;
  defender?: Agent;
  damage?: number;
  message: string;
  isHighlight?: boolean;
  // Perps 新增
  position?: Position;
  pnl?: number;
  priceChange?: number;
}

// 战斗轮次状态
export type RoundPhase = 'waiting' | 'selecting' | 'loading' | 'countdown' | 'fighting' | 'settlement';

// 竞技场状态
export interface ArenaState {
  phase: RoundPhase;
  roundNumber: number;
  countdown: number;
  participants: Agent[];
  selectedSlots: number[];
  battleLogs: BattleLog[];
  top3: { agent: Agent; profit: number }[];
  // Perps 新增
  currentPrice: number;
  priceChange24h: number;
  fundingRate: number;
  longShortRatio: number;
  battleEffects: BattleEffect[];
  // 多币种支持
  activeSymbol: CryptoSymbol;
  cryptoPrices: Record<CryptoSymbol, number>;
}

// 钱包状态
export interface WalletState {
  connected: boolean;
  address: string;
  balance: number;
  lockedBalance: number;
  loginType: 'twitter' | 'google' | 'wallet' | null;
  nickname: string;
  avatar: string;
  userId?: string;
}

// 用户类型
export interface User {
  id: string;
  walletAddress?: string;
  twitterId?: string;
  googleId?: string;
  email?: string;
  username?: string;
  avatar?: string;
  balance: number;
  totalProfit: number;
  createdAt: number;
}

// 子弹/攻击特效
export interface Projectile {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  progress: number;
  type: 'bull' | 'bear' | 'neutral';
}

// 伤害飘字
export interface DamageNumber {
  id: string;
  x: number;
  y: number;
  damage: number;
  isCrit: boolean;
  timestamp: number;
}

// 资金转移飘字
export interface CoinTransfer {
  id: string;
  x: number;
  y: number;
  amount: number;
  timestamp: number;
  fromPosition?: Position;
  toPosition?: Position;
}

// 余额变化飘字
export interface BalanceChange {
  id: string;
  x: number;
  y: number;
  amount: number;
  isGain: boolean;
  timestamp: number;
  text?: string;
}

// ==================== 流动性挖矿类型 ====================

// 用户质押记录
export interface LiquidityStake {
  id: string;
  userId: string;
  amount: number;
  stakedAt: number;
  rewards: number;
  unlockTime: number;
  lastClaimTime: number;
}

// 流动性池
export interface LiquidityPool {
  totalStaked: number;
  totalRewards: number;
  apr: number;
  rewardRate: number;
  stakerCount: number;
}
