import React, { useEffect, useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import ArenaCanvas from '../components/ArenaCanvas';
import PriceHeader from '../components/PriceHeader';
import { Agent, PriceData, CryptoSymbol } from '../types';
import { Trophy, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { priceService } from '../services/priceService';

// 生成 TOP 100 数据
const generateTop100 = () => {
  const names = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa'];
  const colors = ['text-luxury-gold', 'text-luxury-cyan', 'text-luxury-purple', 'text-luxury-rose', 'text-luxury-green'];
  return Array.from({ length: 100 }, (_, i) => ({
    rank: i + 1,
    name: `${names[Math.floor(Math.random() * names.length)]}-${Math.floor(Math.random() * 9999)}`,
    profit: Math.floor(Math.random() * 50000) + 1000,
    color: colors[Math.floor(Math.random() * colors.length)]
  })).sort((a, b) => b.profit - a.profit);
};

// 跑马灯
const LeaderboardMarquee: React.FC = () => {
  const top100 = useMemo(() => generateTop100(), []);
  const navigate = useNavigate();

  return (
    <div className="w-full bg-void-panel/80 border border-white/5 rounded-xl overflow-hidden mb-4">
      <div className="flex items-center">
        <div className="flex-shrink-0 px-4 py-2 bg-luxury-gold/10 border-r border-white/10 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-luxury-gold" />
          <span className="text-xs font-semibold text-luxury-gold">TOP Profit</span>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="flex animate-marquee whitespace-nowrap">
            {top100.map((agent, index) => (
              <div key={index} className="flex items-center gap-2 px-4 py-2">
                <span className="text-xs text-white/40 font-mono">#{agent.rank}</span>
                <span className={`text-xs font-medium ${agent.color}`}>{agent.name}</span>
                <span className="text-xs text-luxury-green font-mono">+{agent.profit.toLocaleString()}</span>
                <span className="text-xs text-white/20">$MON</span>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => navigate('/leaderboard')}
          className="flex-shrink-0 px-3 py-2 bg-luxury-gold/10 border-l border-white/10 hover:bg-luxury-gold/20 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-luxury-gold" />
        </button>
      </div>
    </div>
  );
};

// 阵营列表项
const SideAgentItem: React.FC<{ agent: Agent; side: 'long' | 'short' }> = ({ agent, side }) => {
  const isLong = side === 'long';
  const pnl = agent.netProfit;
  const isProfit = pnl >= 0;
  const isMyAgent = agent.isPlayer;

  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg ${
      isMyAgent ? 'bg-luxury-cyan/20 border border-luxury-cyan/40' : 'bg-white/5'
    }`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
        isLong ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
      }`}>
        {agent.name.slice(0, 2).toUpperCase()}
        {isMyAgent && <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-medium truncate ${isMyAgent ? 'text-luxury-cyan' : 'text-white'}`}>
          {agent.name}
        </div>
        <div className="text-[10px] text-white/40">{agent.leverage}x | ${agent.balance}</div>
      </div>
      <div className={`text-xs font-mono ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
        {isProfit ? '+' : ''}{pnl.toFixed(0)}
      </div>
    </div>
  );
};

const Arena: React.FC = () => {
  const {
    arena,
    myAgents,
    systemAgents,
    initializeArena,
    setArenaPhase,
    updateParticipant,
    updateArenaPrice,
  } = useGameStore();

  const [activeSymbol, setActiveSymbol] = useState<CryptoSymbol>('BTC');
  const [priceData, setPriceData] = useState<PriceData>({
    symbol: 'BTC',
    price: 97245.32,
    btcPrice: 97245.32,
    priceChange24h: 1234.56,
    priceChangePercent24h: 1.28,
    secondChangePercent: 0,
    fundingRate: 0.0001,
    longShortRatio: 1.25,
    high24h: 98500,
    low24h: 95800,
    volume24h: 28500,
    lastUpdate: Date.now(),
    cryptos: {
      BTC: { symbol: 'BTC', price: 97245.32, priceChange24h: 1234.56, priceChangePercent24h: 1.28, fundingRate: 0.0001, longShortRatio: 1.25, high24h: 98500, low24h: 95800, volume24h: 28500, lastUpdate: Date.now() },
      ETH: { symbol: 'ETH', price: 3856.78, priceChange24h: 45.23, priceChangePercent24h: 1.18, fundingRate: 0.0002, longShortRatio: 1.15, high24h: 3920, low24h: 3780, volume24h: 15000, lastUpdate: Date.now() },
      SOL: { symbol: 'SOL', price: 198.45, priceChange24h: 3.45, priceChangePercent24h: 1.77, fundingRate: 0.0003, longShortRatio: 1.35, high24h: 205, low24h: 192, volume24h: 8000, lastUpdate: Date.now() },
      MON: { symbol: 'MON', price: 2.35, priceChange24h: 0.08, priceChangePercent24h: 3.52, fundingRate: 0.0005, longShortRatio: 1.45, high24h: 2.45, low24h: 2.25, volume24h: 5000, lastUpdate: Date.now() },
    },
  });

  // 初始化
  useEffect(() => {
    if (systemAgents.length === 0) {
      initializeArena();
    }
  }, [initializeArena, systemAgents.length]);

  // 价格服务
  useEffect(() => {
    priceService.connect(false);
    const unsubscribe = priceService.subscribe((data: PriceData) => {
      setPriceData(data);
      updateArenaPrice(data);
    });
    return () => unsubscribe();
  }, [updateArenaPrice]);

  // 实时战斗模式 - 所有在竞技场的agent都参与
  useEffect(() => {
    // 设置战斗阶段
    setArenaPhase('fighting');
    
    // 获取所有在竞技场的agents作为参与者
    const allArenaAgents = [...myAgents, ...systemAgents]
      .filter(a => a.status === 'in_arena' || a.status === 'fighting')
      .slice(0, 20); // 最多20个
    
    // 更新参与者状态为fighting
    allArenaAgents.forEach(agent => {
      if (agent.status !== 'fighting') {
        updateParticipant(agent.id, { status: 'fighting' });
      }
    });
  }, [myAgents, systemAgents, setArenaPhase, updateParticipant]);

  // 获取所有在竞技场的agents
  const allAgents = useMemo(() => {
    return [...myAgents, ...systemAgents]
      .filter(a => a.status === 'in_arena' || a.status === 'fighting')
      .slice(0, 20);
  }, [myAgents, systemAgents]);

  const longAgents = useMemo(() => allAgents.filter(a => a.position === 'long'), [allAgents]);
  const shortAgents = useMemo(() => allAgents.filter(a => a.position === 'short'), [allAgents]);

  // 更新arena participants
  useEffect(() => {
    useGameStore.setState(state => ({
      arena: { ...state.arena, participants: allAgents }
    }));
  }, [allAgents]);

  return (
    <div className="h-screen bg-void pt-20 pb-16 flex flex-col">
      <div className="flex-1 max-w-screen-xl mx-auto px-4 w-full flex flex-col min-h-0">
        {/* 价格头部 */}
        <PriceHeader
          priceData={priceData}
          onSymbolChange={(symbol: CryptoSymbol) => setActiveSymbol(symbol)}
        />

        {/* 排行榜跑马灯 */}
        <LeaderboardMarquee />

        {/* 主内容区 */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* 左侧：多头列表 */}
          <div className="w-48 flex-shrink-0 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-bold text-green-500">BULLS</span>
              <span className="text-xs text-white/40">({longAgents.length})</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {longAgents.map(agent => (
                <SideAgentItem key={agent.id} agent={agent} side="long" />
              ))}
            </div>
          </div>

          {/* 中间：竞技场画布 */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 bg-void-panel/50 rounded-2xl border border-white/10 overflow-hidden relative">
              <ArenaCanvas
                phase="fighting"
                countdown={0}
                selectedSlots={[]}
                priceChange={priceData.secondChangePercent}
              />
            </div>
          </div>

          {/* 右侧：空头列表 */}
          <div className="w-48 flex-shrink-0 flex flex-col">
            <div className="flex items-center gap-2 mb-3 justify-end">
              <span className="text-xs text-white/40">({shortAgents.length})</span>
              <span className="text-sm font-bold text-red-500">BEARS</span>
              <TrendingDown className="w-4 h-4 text-red-500" />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {shortAgents.map(agent => (
                <SideAgentItem key={agent.id} agent={agent} side="short" />
              ))}
            </div>
          </div>
        </div>

        {/* 底部统计 */}
        <div className="mt-4 flex items-center justify-between text-xs text-white/40">
          <div>Total Agents: {allAgents.length}</div>
          <div>Long: {longAgents.length} | Short: {shortAgents.length}</div>
          <div>Real-time Battle</div>
        </div>
      </div>
    </div>
  );
};

export default Arena;
