import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Clock, Calendar, Award, ArrowLeft, Crown, Medal, Target, Users, Bot, TrendingUp, Swords } from 'lucide-react';

type TabType = 'today' | 'week' | 'total';
type ViewType = 'agents' | 'users';

interface LeaderboardAgent {
  rank: number;
  name: string;
  profit: number;
  wins: number;
  battles: number;
  winRate: number;
  avatar: string;
}

interface LeaderboardUser {
  rank: number;
  name: string;
  profit: number;
  agentsCount: number;
  avatar: string;
}

// 生成 Agents 数据
const generateAgents = (count: number, minProfit: number, maxProfit: number): LeaderboardAgent[] => {
  const names = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa'];
  const avatars = ['🤖', '👾', '🎮', '🎯', '🚀', '⚡', '🔥', '💎', '🏆', '👑'];

  return Array.from({ length: count }, (_, i) => {
    const wins = Math.floor(Math.random() * 500) + 50;
    const losses = Math.floor(Math.random() * 300) + 20;
    const battles = wins + losses;
    return {
      rank: i + 1,
      name: `${names[Math.floor(Math.random() * names.length)]}-${Math.floor(Math.random() * 9999)}`,
      profit: Math.floor(Math.random() * (maxProfit - minProfit)) + minProfit,
      wins,
      battles,
      winRate: Math.round((wins / battles) * 100),
      avatar: avatars[Math.floor(Math.random() * avatars.length)]
    };
  }).sort((a, b) => b.profit - a.profit).map((agent, i) => ({ ...agent, rank: i + 1 }));
};

// 生成用户数据
const generateUsers = (count: number, minProfit: number, maxProfit: number): LeaderboardUser[] => {
  const names = ['CryptoKing', 'WhaleHunter', 'DiamondHands', 'MoonBoy', 'AlphaTrader', 'DeFiMaster', 'NFTCollector', 'TokenWhale'];
  const avatars = ['🦁', '🐋', '💎', '🚀', '🔱', '👑', '🎯', '⚡'];

  return Array.from({ length: count }, (_, i) => ({
    rank: i + 1,
    name: `${names[Math.floor(Math.random() * names.length)]}_${Math.floor(Math.random() * 999)}`,
    profit: Math.floor(Math.random() * (maxProfit - minProfit)) + minProfit,
    agentsCount: Math.floor(Math.random() * 20) + 1,
    avatar: avatars[Math.floor(Math.random() * avatars.length)]
  })).sort((a, b) => b.profit - a.profit).map((user, i) => ({ ...user, rank: i + 1 }));
};

// TOP3 卡片组件
const Top3Card: React.FC<{
  rank: number;
  avatar: string;
  name: string;
  profit: number;
  subtitle: string;
  isGold?: boolean;
}> = ({ rank, avatar, name, profit, subtitle, isGold }) => {
  const rankConfig = {
    1: { bg: 'bg-luxury-gold', text: 'text-void', icon: Crown, label: 'CHAMPION', border: 'border-luxury-gold/50' },
    2: { bg: 'bg-gray-300', text: 'text-void', icon: Medal, label: '2nd', border: 'border-white/10' },
    3: { bg: 'bg-amber-600', text: 'text-white', icon: Target, label: '3rd', border: 'border-white/10' }
  };
  const config = rankConfig[rank as keyof typeof rankConfig];
  const Icon = config.icon;

  if (rank === 1) {
    return (
      <div className={`card-luxury rounded-xl border ${config.border} p-4 mb-3`}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-full ${config.bg} ${config.text} flex items-center justify-center shadow-lg`}>
            <Icon className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{avatar}</span>
              <span className="font-bold text-white truncate">{name}</span>
              <span className={`px-2 py-0.5 ${isGold ? 'bg-luxury-gold/20 text-luxury-gold' : 'bg-luxury-cyan/20 text-luxury-cyan'} text-xs rounded-full flex-shrink-0`}>
                {config.label}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className={`font-mono font-bold ${isGold ? 'text-luxury-gold' : 'text-luxury-cyan'}`}>
                +{profit.toLocaleString()} $MON
              </span>
              <span className="text-white/40 truncate">{subtitle}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card-luxury rounded-xl border ${config.border} p-3`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full ${config.bg} ${config.text} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-lg">{avatar}</span>
            <span className="text-sm font-medium text-white truncate">{name}</span>
          </div>
          <span className="text-luxury-green font-mono text-sm">+{profit.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [viewType, setViewType] = useState<ViewType>('agents');

  // Agents 数据
  const totalAgents = useMemo(() => generateAgents(100, 100000, 1000000), []);
  const weekAgents = useMemo(() => generateAgents(100, 10000, 100000), []);
  const todayAgents = useMemo(() => generateAgents(100, 1000, 50000), []);

  // 用户数据
  const totalUsers = useMemo(() => generateUsers(100, 100000, 1000000), []);
  const weekUsers = useMemo(() => generateUsers(100, 10000, 100000), []);
  const todayUsers = useMemo(() => generateUsers(100, 1000, 50000), []);

  const currentAgents = activeTab === 'total' ? totalAgents : activeTab === 'week' ? weekAgents : todayAgents;
  const currentUsers = activeTab === 'total' ? totalUsers : activeTab === 'week' ? weekUsers : todayUsers;

  const tabConfig = [
    { key: 'today', label: '今日', icon: Clock },
    { key: 'week', label: '本周', icon: Calendar },
    { key: 'total', label: '总榜', icon: Award }
  ];

  return (
    <div className="min-h-screen bg-void pt-24 pb-24">
      <div className="max-w-screen-xl mx-auto px-4">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate('/arena')}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">返回竞技场</span>
        </button>

        {/* 标题 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white font-display flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-luxury-gold" />
            排行榜
          </h1>
        </div>

        {/* 视图切换 - Agents / Users */}
        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => setViewType('agents')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewType === 'agents'
                ? 'bg-luxury-purple/20 text-luxury-purple-light border border-luxury-purple/30'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            Agents榜
          </button>
          <button
            onClick={() => setViewType('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewType === 'users'
                ? 'bg-luxury-cyan/20 text-luxury-cyan border border-luxury-cyan/30'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            用户榜
          </button>
        </div>

        {/* 时间 Tab - 两个榜单都显示 */}
        <div className="flex justify-center gap-1 mb-6">
          {tabConfig.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-all ${
                activeTab === tab.key
                  ? viewType === 'agents'
                    ? 'bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30'
                    : 'bg-luxury-cyan/10 text-luxury-cyan border border-luxury-cyan/30'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {viewType === 'agents' ? (
          <>
            {/* TOP 3 */}
            <div className="mb-6">
              <Top3Card
                rank={1}
                avatar={currentAgents[0]?.avatar}
                name={currentAgents[0]?.name}
                profit={currentAgents[0]?.profit}
                subtitle={`${currentAgents[0]?.winRate}% 胜率 · ${currentAgents[0]?.battles} 场`}
                isGold
              />
              <div className="grid grid-cols-2 gap-3">
                <Top3Card
                  rank={2}
                  avatar={currentAgents[1]?.avatar}
                  name={currentAgents[1]?.name}
                  profit={currentAgents[1]?.profit}
                  subtitle=""
                />
                <Top3Card
                  rank={3}
                  avatar={currentAgents[2]?.avatar}
                  name={currentAgents[2]?.name}
                  profit={currentAgents[2]?.profit}
                  subtitle=""
                />
              </div>
            </div>

            {/* Agents 完整榜单 */}
            <div className="card-luxury rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <span className="text-sm font-medium text-white">TOP 100 Agents</span>
                <span className="text-xs text-white/40">实时更新</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {/* 表头 */}
                <div className="flex items-center px-4 py-2 text-xs text-white/40 border-b border-white/5 bg-void-panel/50">
                  <span className="w-8">排名</span>
                  <span className="flex-1">Agent</span>
                  <span className="w-24 text-right">盈利</span>
                  <span className="w-16 text-right">胜率</span>
                  <span className="w-16 text-right">场次</span>
                </div>
                {currentAgents.map((agent) => (
                  <div
                    key={agent.rank}
                    className="flex items-center px-4 py-2.5 border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <span className="w-8 text-xs text-white/40 font-mono">#{agent.rank}</span>
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <span className="text-lg">{agent.avatar}</span>
                      <span className="text-sm text-white truncate">{agent.name}</span>
                    </div>
                    <span className="w-24 text-right text-luxury-green font-mono text-sm">
                      +{agent.profit.toLocaleString()}
                    </span>
                    <span className={`w-16 text-right text-xs ${agent.winRate >= 60 ? 'text-luxury-gold' : 'text-white/60'}`}>
                      {agent.winRate}%
                    </span>
                    <span className="w-16 text-right text-xs text-white/40 font-mono">
                      {agent.battles}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* 用户榜 TOP 3 */}
            <div className="mb-6">
              <Top3Card
                rank={1}
                avatar={currentUsers[0]?.avatar}
                name={currentUsers[0]?.name}
                profit={currentUsers[0]?.profit}
                subtitle={`${currentUsers[0]?.agentsCount} Agents`}
              />
              <div className="grid grid-cols-2 gap-3">
                <Top3Card
                  rank={2}
                  avatar={currentUsers[1]?.avatar}
                  name={currentUsers[1]?.name}
                  profit={currentUsers[1]?.profit}
                  subtitle=""
                />
                <Top3Card
                  rank={3}
                  avatar={currentUsers[2]?.avatar}
                  name={currentUsers[2]?.name}
                  profit={currentUsers[2]?.profit}
                  subtitle=""
                />
              </div>
            </div>

            {/* 用户完整榜单 */}
            <div className="card-luxury rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <span className="text-sm font-medium text-white">TOP 100 用户</span>
                <span className="text-xs text-white/40">实时更新</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {/* 表头 */}
                <div className="flex items-center px-4 py-2 text-xs text-white/40 border-b border-white/5 bg-void-panel/50">
                  <span className="w-8">排名</span>
                  <span className="flex-1">用户</span>
                  <span className="w-28 text-right">总盈利</span>
                  <span className="w-20 text-right">Agents</span>
                </div>
                {currentUsers.map((user) => (
                  <div
                    key={user.rank}
                    className="flex items-center px-4 py-2.5 border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <span className="w-8 text-xs text-white/40 font-mono">#{user.rank}</span>
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <span className="text-lg">{user.avatar}</span>
                      <span className="text-sm text-white truncate">{user.name}</span>
                    </div>
                    <span className="w-28 text-right text-luxury-green font-mono text-sm">
                      +{user.profit.toLocaleString()} <span className="text-xs">$MON</span>
                    </span>
                    <span className="w-20 text-right text-xs text-white/60">
                      {user.agentsCount} <span className="text-white/30">Agents</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
