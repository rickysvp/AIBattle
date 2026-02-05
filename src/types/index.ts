// Agent 类型定义
export interface Agent {
  id: string;
  name: string;
  color: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  balance: number;
  wins: number;
  losses: number;
  kills: number;
  earnings: number;
  status: 'idle' | 'in_arena' | 'fighting' | 'dead';
  position?: { x: number; y: number };
  isPlayer: boolean;
  pixelStyle: number; // 像素风格变体
}

// 战斗日志类型
export interface BattleLog {
  id: string;
  timestamp: number;
  type: 'attack' | 'kill' | 'damage' | 'round_start' | 'round_end' | 'join' | 'leave';
  attacker?: Agent;
  defender?: Agent;
  damage?: number;
  message: string;
  isHighlight?: boolean;
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
}

// 锦标赛类型
export interface Tournament {
  id: string;
  name: string;
  status: 'upcoming' | 'ongoing' | 'finished';
  prizePool: number;
  participants: number;
  maxParticipants: number;
  startTime: number;
  endTime?: number;
  entryFee: number;
  winners?: { agent: Agent; prize: number; rank: number }[];
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
}

// 余额变化飘字（加血/减血）
export interface BalanceChange {
  id: string;
  x: number;
  y: number;
  amount: number;
  isGain: boolean;
  timestamp: number;
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

// ==================== 预测市场类型 ====================

// 预测下注
export interface PredictionBet {
  id: string;
  userId: string;
  marketId: string;
  tournamentId: string;
  predictedAgentId: string;
  betAmount: number;
  betType: 'semifinal' | 'final' | 'match';
  odds: number;
  status: 'pending' | 'won' | 'lost';
  potentialWin: number;
  createdAt: number;
}

// 预测市场
export interface PredictionMarket {
  id: string;
  tournamentId: string;
  matchId?: string;
  name: string;
  totalPool: number;
  odds: Record<string, number>;
  status: 'open' | 'closed' | 'settled';
  deadline: number;
  betType: 'semifinal' | 'final' | 'match';
  participants: string[];
}

// 自动下注规则
export interface AutoBetRule {
  enabled: boolean;
  betAmount: number;
  strategy: 'always' | 'top_ranked' | 'specified';
  maxBetsPerDay: number;
  specifiedAgentIds?: string[];
  minOdds?: number;
  maxOdds?: number;
}
