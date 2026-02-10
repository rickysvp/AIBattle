import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Agent, BattleLog, ArenaState, WalletState, RoundPhase,
  PriceData, BattleRecord, CryptoSymbol
} from '../types';
import { generateRandomAgent } from '../utils/agentGenerator';
import { useNotificationStore } from './notificationStore';

interface GameStore {
  // 钱包状态
  wallet: WalletState;
  connectWallet: (nickname: string, type?: 'twitter' | 'google' | 'wallet') => void;
  disconnectWallet: () => void;
  deposit: (amount: number) => void;
  withdraw: (amount: number) => boolean;

  // 玩家的 Agents
  myAgents: Agent[];
  addAgent: (agent: Agent) => void;
  updateAgent: (agentId: string, updates: Partial<Agent>) => void;
  removeAgent: (agentId: string) => void;
  setAgents: (agents: Agent[]) => void;
  enterArena: (agentId: string) => void;
  leaveArena: (agentId: string) => void;

  // 系统 Agents (竞技场流动性)
  systemAgents: Agent[];
  initializeArena: () => Promise<void>;

  // 竞技场状态
  arena: ArenaState;
  setArenaPhase: (phase: RoundPhase) => void;
  addBattleLog: (log: Omit<BattleLog, 'id' | 'timestamp'>) => void;
  clearBattleLogs: () => void;
  updateParticipant: (agentId: string, updates: Partial<Agent>) => void;
  setTop3: (top3: { agent: Agent; profit: number }[]) => void;
  updateArenaPrice: (priceData: PriceData) => void;

  // 我的战斗日志
  myBattleLogs: BattleLog[];
  addMyBattleLog: (log: Omit<BattleLog, 'id' | 'timestamp'>) => void;
  clearMyBattleLogs: () => void;

  // Squad 相关
  mintAgent: () => Promise<Agent | null>;
  mintCost: number;
  allocateFunds: (agentId: string, amount: number) => Promise<boolean>;
  withdrawFromAgent: (agentId: string, amount: number) => Promise<boolean>;
  updateAgentLeverage: (agentId: string, leverage: number) => void;
  joinArena: (agentId: string) => void;

  // 系统统计
  totalSystemRounds: number;
  incrementTotalSystemRounds: () => void;
  autoBattleInterval: number | null;

  // 自动战斗系统
  startAutoBattleSystem: () => void;
  stopAutoBattleSystem: () => void;

  // 通知
  showNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;

  // 数据持久化
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;

  // 排行榜
  getLeaderboard: (type: 'profit' | 'winRate' | 'kills', limit?: number) => Agent[];
  getMyRank: (type: 'profit' | 'winRate' | 'kills') => number;

  // 战斗历史
  getAgentBattleHistory: (agentId: string) => BattleRecord[];

  // 统计
  getTotalStats: () => {
    totalBalance: number;
    totalProfit: number;
    longCount: number;
    shortCount: number;
    avgLeverage: number;
  };
}

// 生成随机战斗记录
const generateRandomBattleHistory = (agent: Agent): BattleRecord[] => {
  const records: BattleRecord[] = [];
  const battlesCount = Math.floor(Math.random() * 20) + 5;

  for (let i = 0; i < battlesCount; i++) {
    const isWin = Math.random() > 0.4;
    const earnings = isWin
      ? Math.floor(Math.random() * 200) + 50
      : -Math.floor(Math.random() * 100) - 20;

    records.push({
      id: `battle-${Date.now()}-${i}`,
      timestamp: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
      opponent: `Agent-${Math.floor(Math.random() * 1000)}`,
      result: isWin ? 'win' : 'loss',
      damageDealt: Math.floor(Math.random() * 200) + 50,
      damageTaken: isWin
        ? Math.floor(Math.random() * 100)
        : Math.floor(Math.random() * 200) + 50,
      earnings,
      kills: isWin ? Math.floor(Math.random() * 3) + 1 : 0,
      isTournament: false,
      position: agent.position,
      leverage: agent.leverage,
      pnl: earnings,
      liquidation: earnings < -agent.balance * 0.8,
    });
  }

  return records.sort((a, b) => b.timestamp - a.timestamp);
};

// 生成竞技场系统 Agents (1000个作为流动性)
const generateSystemAgents = (count: number): Agent[] => {
  const agentColors = [
    '#22c55e', '#16a34a', '#15803d', '#ef4444', '#dc2626', '#b91c1c',
    '#a855f7', '#ec4899', '#f59e0b', '#22d3ee', '#3b82f6', '#8b5cf6',
  ];

  const tradingStyles = ['trend_follower', 'contrarian', 'scalper', 'hodler'] as const;
  const leverages = [1, 2, 5, 10, 20, 50, 100];

  return Array.from({ length: count }, (_, i) => {
    const isLong = Math.random() > 0.5;
    const leverage = leverages[Math.floor(Math.random() * leverages.length)];
    const balance = 100 + Math.floor(Math.random() * 9900);

    const wins = Math.floor(Math.random() * 100) + 20;
    const losses = Math.floor(Math.random() * 50) + 10;
    const kills = Math.floor(Math.random() * 150) + 50;

    const agent: Agent = {
      id: `system-${i}-${Math.random().toString(36).substr(2, 6)}`,
      name: `Agent#${i + 1}`,
      nftId: i + 1,
      color: agentColors[i % agentColors.length],
      image: `/nfts/nft${(i % 52) + 1}.png`,
      hp: 100 + Math.floor(Math.random() * 100),
      maxHp: 150 + Math.floor(Math.random() * 100),
      attack: 15 + Math.floor(Math.random() * 15),
      defense: 8 + Math.floor(Math.random() * 8),
      speed: 10 + Math.floor(Math.random() * 10),
      critRate: 10 + Math.floor(Math.random() * 10),
      critDamage: 12 + Math.floor(Math.random() * 12),
      evasion: 10 + Math.floor(Math.random() * 10),
      accuracy: 10 + Math.floor(Math.random() * 10),
      luck: 10 + Math.floor(Math.random() * 10),
      totalStats: 100 + Math.floor(Math.random() * 50),
      rarity: ['common', 'rare', 'epic', 'legendary', 'mythic'][Math.floor(Math.random() * 5)] as Agent['rarity'],
      balance,
      initialBalance: balance,
      position: isLong ? 'long' : 'short',
      leverage,
      entryPrice: 97245.32 + (Math.random() - 0.5) * 1000,
      liquidationPrice: isLong
        ? 97245.32 * (1 - 0.9 / leverage)
        : 97245.32 * (1 + 0.9 / leverage),
      tradingStyle: tradingStyles[Math.floor(Math.random() * tradingStyles.length)],
      riskTolerance: Math.floor(Math.random() * 100) + 1,
      wins,
      losses,
      kills,
      deaths: losses,
      totalBattles: wins + losses,
      winRate: Math.round((wins / (wins + losses)) * 100),
      totalEarnings: Math.floor(Math.random() * 10000) + 1000,
      totalLosses: Math.floor(Math.random() * 5000),
      netProfit: Math.floor(Math.random() * 5000),
      avgDamageDealt: Math.floor(Math.random() * 100) + 50,
      avgDamageTaken: Math.floor(Math.random() * 80) + 30,
      maxKillStreak: Math.floor(Math.random() * 15) + 1,
      currentKillStreak: 0,
      tournamentWins: Math.floor(Math.random() * 10),
      tournamentTop3: Math.floor(Math.random() * 30),
      battleHistory: [],
      status: 'in_arena',
      isPlayer: false,
      pixelStyle: i % 8,
      createdAt: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
    };

    agent.battleHistory = generateRandomBattleHistory(agent).slice(0, 20);
    return agent;
  });
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      wallet: {
        connected: false,
        address: '',
        balance: 0,
        lockedBalance: 0,
        loginType: null,
        nickname: '',
        avatar: '',
      },

      connectWallet: async (nickname: string, type: 'twitter' | 'google' | 'wallet' = 'wallet') => {
        const mockAddress = `0x${Math.random().toString(36).substring(2, 15)}`;
        set({
          wallet: {
            connected: true,
            address: mockAddress,
            balance: 10000,
            lockedBalance: 0,
            loginType: type,
            nickname: nickname,
            avatar: '',
          }
        });
        get().showNotification('钱包连接成功！获得 10000 $MON 初始资金', 'success');
      },

      disconnectWallet: () => {
        set({
          wallet: {
            connected: false,
            address: '',
            balance: 0,
            lockedBalance: 0,
            loginType: null,
            nickname: '',
            avatar: '',
          },
          myAgents: [],
        });
      },

      deposit: (amount: number) => {
        set((state) => ({
          wallet: { ...state.wallet, balance: state.wallet.balance + amount },
        }));
        get().showNotification(`充值成功: +${amount} $MON`, 'success');
      },

      withdraw: (amount: number) => {
        const state = get();
        if (state.wallet.balance < amount) {
          get().showNotification('余额不足', 'error');
          return false;
        }
        set({
          wallet: { ...state.wallet, balance: state.wallet.balance - amount },
        });
        get().showNotification(`提现成功: -${amount} $MON`, 'success');
        return true;
      },

      myAgents: [],

      addAgent: (agent) => {
        set((state) => ({
          myAgents: [...state.myAgents, agent],
        }));
      },

      updateAgent: (agentId, updates) => {
        set((state) => ({
          myAgents: state.myAgents.map((a) =>
            a.id === agentId ? { ...a, ...updates } : a
          ),
        }));
      },

      removeAgent: (agentId) => {
        set((state) => ({
          myAgents: state.myAgents.filter((a) => a.id !== agentId),
        }));
      },

      setAgents: (agents) => {
        set({ myAgents: agents });
      },

      enterArena: (agentId) => {
        const agent = get().myAgents.find((a) => a.id === agentId);
        if (!agent) return;

        if (agent.balance < 10) {
          get().showNotification('余额不足，至少需要10 $MON', 'error');
          return;
        }

        set((state) => ({
          myAgents: state.myAgents.map((a) =>
            a.id === agentId ? { ...a, status: 'in_arena' as const } : a
          ),
        }));

        get().showNotification(`${agent.name} 已进入竞技场`, 'success');
      },

      leaveArena: (agentId) => {
        set((state) => ({
          myAgents: state.myAgents.map((a) =>
            a.id === agentId ? { ...a, status: 'idle' as const } : a
          ),
        }));
      },

      systemAgents: [],

      initializeArena: async () => {
        const newSystemAgents = generateSystemAgents(1000);
        set({ systemAgents: newSystemAgents });
        console.log(`[Arena] Initialized with ${newSystemAgents.length} system agents`);
      },

      arena: {
        phase: 'waiting',
        roundNumber: 0,
        countdown: 0,
        participants: [],
        selectedSlots: [],
        battleLogs: [],
        top3: [],
        currentPrice: 97245.32,
        priceChange24h: 0,
        fundingRate: 0.0001,
        longShortRatio: 1.2,
        battleEffects: [],
        activeSymbol: 'BTC' as CryptoSymbol,
        cryptoPrices: {
          BTC: 97245.32,
          ETH: 3856.78,
          SOL: 198.45,
          MON: 2.35,
        },
      },

      setArenaPhase: (phase) => {
        set((state) => ({
          arena: { ...state.arena, phase },
        }));
      },

      addBattleLog: (log) => {
        const newLog: BattleLog = {
          ...log,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
        };
        set((state) => ({
          arena: {
            ...state.arena,
            battleLogs: [newLog, ...state.arena.battleLogs].slice(0, 100),
          },
        }));
      },

      clearBattleLogs: () => {
        set((state) => ({
          arena: { ...state.arena, battleLogs: [] },
        }));
      },

      updateParticipant: (agentId, updates) => {
        set((state) => ({
          arena: {
            ...state.arena,
            participants: state.arena.participants.map((p) =>
              p.id === agentId ? { ...p, ...updates } : p
            ),
          },
          myAgents: state.myAgents.map((a) =>
            a.id === agentId ? { ...a, ...updates } : a
          ),
          systemAgents: state.systemAgents.map((a) =>
            a.id === agentId ? { ...a, ...updates } : a
          ),
        }));
      },

      setTop3: (top3) => {
        set((state) => ({
          arena: { ...state.arena, top3 },
        }));
      },

      updateArenaPrice: (priceData) => {
        set((state) => ({
          arena: {
            ...state.arena,
            currentPrice: priceData.btcPrice,
            priceChange24h: priceData.priceChangePercent24h,
            fundingRate: priceData.fundingRate,
            longShortRatio: priceData.longShortRatio,
          }
        }));
      },

      myBattleLogs: [],

      addMyBattleLog: (log) => {
        const newLog: BattleLog = {
          ...log,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
        };
        set((state) => ({
          myBattleLogs: [newLog, ...state.myBattleLogs].slice(0, 50),
        }));
      },

      clearMyBattleLogs: () => {
        set({ myBattleLogs: [] });
      },

      mintCost: 100,

      mintAgent: async () => {
        const state = get();
        if (state.wallet.balance < state.mintCost) {
          state.showNotification('余额不足', 'error');
          return null;
        }

        const newAgent = generateRandomAgent(true, true, state.wallet.nickname);
        newAgent.balance = 0;
        newAgent.initialBalance = 0;
        newAgent.status = 'idle';

        set({
          wallet: { ...state.wallet, balance: state.wallet.balance - state.mintCost },
          myAgents: [...state.myAgents, newAgent],
        });

        state.showNotification('Agent 铸造成功！', 'success');
        return newAgent;
      },

      allocateFunds: async (agentId: string, amount: number) => {
        const state = get();
        if (state.wallet.balance < amount) {
          state.showNotification('余额不足', 'error');
          return false;
        }

        const agent = state.myAgents.find(a => a.id === agentId);
        if (!agent) return false;

        set({
          wallet: { ...state.wallet, balance: state.wallet.balance - amount },
          myAgents: state.myAgents.map(a =>
            a.id === agentId
              ? { ...a, balance: a.balance + amount, initialBalance: a.initialBalance + amount }
              : a
          ),
        });

        state.showNotification(`成功分配 ${amount} $MON 给 ${agent.name}`, 'success');
        return true;
      },

      withdrawFromAgent: async (agentId: string, amount: number) => {
        const state = get();
        const agent = state.myAgents.find(a => a.id === agentId);
        if (!agent) return false;

        if (agent.balance < amount) {
          state.showNotification('Agent 余额不足', 'error');
          return false;
        }

        set({
          wallet: { ...state.wallet, balance: state.wallet.balance + amount },
          myAgents: state.myAgents.map(a =>
            a.id === agentId
              ? { ...a, balance: a.balance - amount }
              : a
          ),
        });

        state.showNotification(`成功从 ${agent.name} 提取 ${amount} $MON`, 'success');
        return true;
      },

      updateAgentLeverage: (agentId: string, leverage: number) => {
        const state = get();
        const agent = state.myAgents.find(a => a.id === agentId);
        if (!agent) return;

        const isLong = agent.position === 'long';
        const newLiquidationPrice = isLong
          ? agent.entryPrice * (1 - 0.9 / leverage)
          : agent.entryPrice * (1 + 0.9 / leverage);

        set({
          myAgents: state.myAgents.map(a =>
            a.id === agentId
              ? { ...a, leverage, liquidationPrice: newLiquidationPrice }
              : a
          ),
        });

        state.showNotification(`${agent.name} 杠杆已调整为 ${leverage}x`, 'success');
      },

      joinArena: (agentId: string) => {
        const state = get();
        const agent = state.myAgents.find(a => a.id === agentId);
        if (!agent) return;

        if (agent.balance < 10) {
          state.showNotification('余额不足，至少需要10 $MON', 'error');
          return;
        }

        set({
          myAgents: state.myAgents.map(a =>
            a.id === agentId ? { ...a, status: 'in_arena' as const } : a
          ),
        });

        state.showNotification(`${agent.name} 已进入竞技场`, 'success');
      },

      totalSystemRounds: 0,
      autoBattleInterval: null,

      incrementTotalSystemRounds: () => {
        set((state) => ({
          totalSystemRounds: state.totalSystemRounds + 1,
        }));
      },

      startAutoBattleSystem: () => {
        console.log('[AutoBattle] System started');
      },

      stopAutoBattleSystem: () => {
        console.log('[AutoBattle] System stopped');
      },

      showNotification: (message, type) => {
        useNotificationStore.getState().addNotification(message, type);
      },

      saveToLocalStorage: () => {
        const state = get();
        localStorage.setItem('gameStore', JSON.stringify({
          wallet: state.wallet,
          myAgents: state.myAgents,
          myBattleLogs: state.myBattleLogs,
          totalSystemRounds: state.totalSystemRounds,
        }));
      },

      loadFromLocalStorage: () => {
        const saved = localStorage.getItem('gameStore');
        if (saved) {
          const data = JSON.parse(saved);
          set({
            wallet: data.wallet || get().wallet,
            myAgents: data.myAgents || [],
            myBattleLogs: data.myBattleLogs || [],
            totalSystemRounds: data.totalSystemRounds || 0,
          });
        }
      },

      getLeaderboard: (type, limit = 10) => {
        const allAgents = [...get().myAgents, ...get().systemAgents];
        return [...allAgents]
          .sort((a, b) => {
            switch (type) {
              case 'profit':
                return b.netProfit - a.netProfit;
              case 'winRate':
                return b.winRate - a.winRate;
              case 'kills':
                return b.kills - a.kills;
              default:
                return 0;
            }
          })
          .slice(0, limit);
      },

      getMyRank: (type) => {
        const leaderboard = get().getLeaderboard(type, 1000);
        const myAgentIds = get().myAgents.map((a) => a.id);
        const rank = leaderboard.findIndex((a) => myAgentIds.includes(a.id));
        return rank === -1 ? 999 : rank + 1;
      },

      getAgentBattleHistory: (agentId) => {
        const agent =
          get().myAgents.find((a) => a.id === agentId) ||
          get().systemAgents.find((a) => a.id === agentId);
        return agent?.battleHistory || [];
      },

      getTotalStats: () => {
        const myAgents = get().myAgents;
        const totalBalance = myAgents.reduce((sum, a) => sum + a.balance, 0);
        const totalProfit = myAgents.reduce((sum, a) => sum + a.netProfit, 0);
        const longCount = myAgents.filter(a => a.position === 'long').length;
        const shortCount = myAgents.filter(a => a.position === 'short').length;
        const avgLeverage = myAgents.length > 0
          ? myAgents.reduce((sum, a) => sum + a.leverage, 0) / myAgents.length
          : 0;

        return {
          totalBalance,
          totalProfit,
          longCount,
          shortCount,
          avgLeverage: Math.round(avgLeverage * 10) / 10,
        };
      },
    }),
    {
      name: 'game-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        wallet: state.wallet,
        myAgents: state.myAgents,
        myBattleLogs: state.myBattleLogs,
        totalSystemRounds: state.totalSystemRounds,
      }),
    }
  )
);
