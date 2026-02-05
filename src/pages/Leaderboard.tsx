import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Clock, Calendar, Award, ArrowLeft, Crown, Medal, Target, Users, Bot, Wallet } from 'lucide-react';

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
  totalProfit: number;
  agentsCount: number;
  bestAgent: string;
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
const generateUsers = (count: number): LeaderboardUser[] => {
  const names = ['CryptoKing', 'WhaleHunter', 'DiamondHands', 'MoonBoy', 'AlphaTrader', 'DeFiMaster', 'NFTCollector', 'TokenWhale'];
  const avatars = ['🦁', '🐋', '💎', '🚀', '🔱', '👑', '🎯', '⚡'];

  return Array.from({ length: count }, (_, i) => {
    const agentsCount = Math.floor(Math.random() * 20) + 1;
    return {
      rank: i + 1,
      name: `${names[Math.floor(Math.random() * names.length)]}_${Math.floor(Math.random() * 999)}`,
      totalProfit: Math.floor(Math.random() * 500000) + 10000,
      agentsCount,
      bestAgent: `Agent-${Math.floor(Math.random() * 9999)}`,
      avatar: avatars[Math.floor(Math.random() * avatars.length)]
    };
  }).sort((a, b) => b.totalProfit - a.totalProfit).map((user, i) => ({ ...user, rank: i + 1 }));
};

const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [viewType, setViewType] = useState<ViewType>('agents');

  // 生成数据
  const totalAgents = useMemo(() => generateAgents(100, 100000, 1000000), []);
  const weekAgents = useMemo(() => generateAgents(100, 10000, 100000), []);
  const todayAgents = useMemo(() => generateAgents(100, 1000, 50000), []);
  const users = useMemo(() => generateUsers(100), []);

  const currentAgents = activeTab === 'total' ? totalAgents : activeTab === 'week' ? weekAgents : todayAgents;

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

        {viewType === 'agents' ? (
          <>
            {/* 时间 Tab */}
            <div className="flex justify-center gap-1 mb-6">
              {tabConfig.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TabType)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-all ${
                    activeTab === tab.key
                      ? 'bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30'
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TOP 3 - 紧凑版 */}
            <div className="mb-6">
              {/* 第一名 */}
              {currentAgents[0] && (
                <div className="card-luxury rounded-xl border border-luxury-gold/50 p-4 mb-3">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-luxury-gold text-void flex items-center justify-center shadow-lg shadow-luxury-gold/20">
                      <Crown className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{currentAgents[0].avatar}</span>
                        <span className="font-bold text-white">{currentAgents[0].name}</span>
                        <span className="px-2 py-0.5 bg-luxury-gold/20 text-luxury-gold text-xs rounded-full">CHAMPION</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-luxury-gold font-mono font-bold">+{currentAgents[0].profit.toLocaleString()} $MON</span>
                        <span className="text-white/40">{currentAgents[0].winRate}% 胜率</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 第二、三名 */}
              <div className="grid grid-cols-2 gap-3">
                {currentAgents[1] && (
                  <div className="card-luxury rounded-xl border border-white/10 p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-300 text-void flex items-center justify-center">
                        <Medal className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-lg">{currentAgents[1].avatar}</span>
                          <span className="text-sm font-medium text-white truncate">{currentAgents[1].name}</span>
                        </div>
                        <span className="text-luxury-green font-mono text-sm">+{currentAgents[1].profit.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
                {currentAgents[2] && (
                  <div className="card-luxury rounded-xl border border-white/10 p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center">
                        <Target className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-lg">{currentAgents[2].avatar}</span>
                          <span className="text-sm font-medium text-white truncate">{currentAgents[2].name}</span>
                        </div>
                        <span className="text-luxury-green font-mono text-sm">+{currentAgents[2].profit.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 完整榜单 */}
            <div className="card-luxury rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <span className="text-sm font-medium text-white">TOP 100 Agents</span>
                <span className="text-xs text-white/40">实时更新</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {currentAgents.slice(3).map((agent) => (
                  <div
                    key={agent.rank}
                    className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <span className="w-6 text-center text-xs text-white/40 font-mono">#{agent.rank}</span>
                    <span className="text-lg">{agent.avatar}</span>
                    <span className="flex-1 text-sm text-white truncate">{agent.name}</span>
                    <span className="text-luxury-green font-mono text-sm">+{agent.profit.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* 用户榜 TOP 3 */}
            <div className="mb-6">
              {/* 第一名 */}
              {users[0] && (
                <div className="card-luxury rounded-xl border border-luxury-cyan/50 p-4 mb-3">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-luxury-cyan text-void flex items-center justify-center shadow-lg shadow-luxury-cyan/20">
                      <Crown className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{users[0].avatar}</span>
                        <span className="font-bold text-white">{users[0].name}</span>
                        <span className="px-2 py-0.5 bg-luxury-cyan/20 text-luxury-cyan text-xs rounded-full">KING</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-luxury-cyan font-mono font-bold">+{users[0].totalProfit.toLocaleString()} $MON</span>
                        <span className="text-white/40">{users[0].agentsCount} Agents</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 第二、三名 */}
              <div className="grid grid-cols-2 gap-3">
                {users[1] && (
                  <div className="card-luxury rounded-xl border border-white/10 p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-300 text-void flex items-center justify-center">
                        <Medal className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-lg">{users[1].avatar}</span>
                          <span className="text-sm font-medium text-white truncate">{users[1].name}</span>
                        </div>
                        <span className="text-luxury-green font-mono text-sm">+{users[1].totalProfit.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
                {users[2] && (
                  <div className="card-luxury rounded-xl border border-white/10 p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center">
                        <Target className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-lg">{users[2].avatar}</span>
                          <span className="text-sm font-medium text-white truncate">{users[2].name}</span>
                        </div>
                        <span className="text-luxury-green font-mono text-sm">+{users[2].totalProfit.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 用户完整榜单 */}
            <div className="card-luxury rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <span className="text-sm font-medium text-white">TOP 100 用户</span>
                <span className="text-xs text-white/40">实时更新</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {users.slice(3).map((user) => (
                  <div
                    key={user.rank}
                    className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <span className="w-6 text-center text-xs text-white/40 font-mono">#{user.rank}</span>
                    <span className="text-lg">{user.avatar}</span>
                    <span className="flex-1 text-sm text-white truncate">{user.name}</span>
                    <div className="text-right">
                      <span className="text-luxury-green font-mono text-sm block">+{user.totalProfit.toLocaleString()}</span>
                      <span className="text-xs text-white/40">{user.agentsCount} Agents</span>
                    </div>
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
