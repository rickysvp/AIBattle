import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import AgentCard from '../components/AgentCard';
import PixelAgent from '../components/PixelAgent';
import { Users, Plus, Filter, Sparkles, TrendingUp, Skull, Swords, Wallet } from 'lucide-react';

const Squad: React.FC = () => {
  const { wallet, myAgents, mintAgent, mintCost } = useGameStore();
  const [mintCount, setMintCount] = useState(1);
  const [filter, setFilter] = useState<'all' | 'idle' | 'in_arena' | 'fighting'>('all');
  const [isMinting, setIsMinting] = useState(false);
  const [newAgent, setNewAgent] = useState<ReturnType<typeof mintAgent>>(null);
  
  const handleMint = async () => {
    if (!wallet.connected || wallet.balance < mintCost * mintCount) return;
    
    setIsMinting(true);
    setNewAgent(null);
    
    // 模拟铸造延迟
    for (let i = 0; i < mintCount; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const agent = mintAgent();
      if (i === mintCount - 1) {
        setNewAgent(agent);
      }
    }
    
    setIsMinting(false);
  };
  
  const filteredAgents = myAgents.filter(agent => {
    if (filter === 'all') return true;
    return agent.status === filter;
  });
  
  const totalBalance = myAgents.reduce((sum, a) => sum + a.balance, 0);
  const totalKills = myAgents.reduce((sum, a) => sum + a.kills, 0);
  const totalWins = myAgents.reduce((sum, a) => sum + a.wins, 0);

  const getFilterConfig = (key: string) => {
    switch (key) {
      case 'all': return { label: '全部', color: 'bg-luxury-purple', icon: Users };
      case 'idle': return { label: '空闲', color: 'bg-luxury-cyan', icon: Wallet };
      case 'in_arena': return { label: '待战', color: 'bg-luxury-gold', icon: Swords };
      case 'fighting': return { label: '战斗中', color: 'bg-luxury-rose', icon: Skull };
      default: return { label: '全部', color: 'bg-luxury-purple', icon: Users };
    }
  };

  return (
    <div className="min-h-screen bg-void pt-24 pb-24">
      <div className="max-w-screen-xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-luxury-cyan/20 to-luxury-purple/20 border border-luxury-cyan/30 flex items-center justify-center">
              <Users className="w-6 h-6 text-luxury-cyan" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-display">我的小队</h1>
              <p className="text-white/40">管理你的 AI Agents，铸造新的战士加入战斗</p>
            </div>
          </div>
        </div>
        
        {!wallet.connected ? (
          <div className="card-luxury rounded-2xl p-16 text-center">
            <div className="w-24 h-24 rounded-3xl bg-void-light/50 border border-white/5 flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-12 h-12 text-white/20" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">请先连接钱包</h2>
            <p className="text-white/40">连接钱包后即可铸造和管理你的 Agents</p>
          </div>
        ) : (
          <>
            {/* 统计概览 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="card-luxury rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-luxury-purple/10 border border-luxury-purple/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-luxury-purple" />
                  </div>
                  <span className="text-xs text-white/40 uppercase tracking-wider">Agents</span>
                </div>
                <p className="text-3xl font-bold text-white font-display">{myAgents.length}</p>
              </div>
              
              <div className="card-luxury rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 border border-luxury-gold/20 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-luxury-gold" />
                  </div>
                  <span className="text-xs text-white/40 uppercase tracking-wider">总余额</span>
                </div>
                <p className="text-3xl font-bold text-luxury-gold font-mono">{totalBalance.toLocaleString()}</p>
              </div>
              
              <div className="card-luxury rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-luxury-rose/10 border border-luxury-rose/20 flex items-center justify-center">
                    <Skull className="w-5 h-5 text-luxury-rose" />
                  </div>
                  <span className="text-xs text-white/40 uppercase tracking-wider">总击杀</span>
                </div>
                <p className="text-3xl font-bold text-luxury-rose font-mono">{totalKills}</p>
              </div>
              
              <div className="card-luxury rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-luxury-green/10 border border-luxury-green/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-luxury-green" />
                  </div>
                  <span className="text-xs text-white/40 uppercase tracking-wider">总胜场</span>
                </div>
                <p className="text-3xl font-bold text-luxury-green font-mono">{totalWins}</p>
              </div>
            </div>
            
            {/* 快速铸造区 */}
            <div className="card-luxury rounded-2xl overflow-hidden mb-8 border-luxury-purple/20">
              <div className="px-6 py-5 border-b border-white/5 bg-gradient-to-r from-luxury-purple/10 to-transparent">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-luxury-purple" />
                  <div>
                    <h2 className="text-lg font-semibold text-white">快速铸造</h2>
                    <p className="text-xs text-white/40">铸造费用: <span className="text-luxury-gold">{mintCost}</span> / 个</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    {/* 数量选择 */}
                    <div className="flex items-center gap-2">
                      {[1, 5, 10].map(count => (
                        <button
                          key={count}
                          onClick={() => setMintCount(count)}
                          className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                            mintCount === count 
                              ? 'bg-luxury-purple text-white shadow-lg shadow-luxury-purple/25' 
                              : 'bg-void-light text-white/60 hover:text-white border border-white/10'
                          }`}
                        >
                          {count}个
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* 铸造按钮 */}
                  <button
                    onClick={handleMint}
                    disabled={isMinting || wallet.balance < mintCost * mintCount}
                    className="group relative px-8 py-3.5 rounded-xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-luxury-purple via-luxury-purple-light to-luxury-cyan" />
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    
                    <span className="relative flex items-center gap-2 text-white font-semibold">
                      {isMinting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          铸造中...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          铸造 ({mintCost * mintCount})
                        </>
                      )}
                    </span>
                  </button>
                </div>
                
                {/* 新铸造的 Agent 展示 */}
                {newAgent && (
                  <div className="mt-6 p-5 bg-luxury-green/5 rounded-xl border border-luxury-green/20 animate-slide-up">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-luxury-green/20 blur-xl rounded-full" />
                        <PixelAgent agent={newAgent} size={64} />
                      </div>
                      <div>
                        <p className="text-luxury-green font-semibold flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          铸造成功！
                        </p>
                        <p className="text-white text-lg font-medium">{newAgent.name}</p>
                        <p className="text-xs text-white/40 mt-1">
                          攻击: <span className="text-luxury-rose">{newAgent.attack}</span> | 
                          防御: <span className="text-luxury-cyan">{newAgent.defense}</span> | 
                          HP: <span className="text-luxury-green">{newAgent.maxHp}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 筛选器 */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 text-white/40">
                <Filter className="w-4 h-4" />
                <span className="text-sm">筛选</span>
              </div>
              <div className="flex items-center gap-2">
                {(['all', 'idle', 'in_arena', 'fighting'] as const).map(key => {
                  const config = getFilterConfig(key);
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        filter === key 
                          ? `${config.color} text-white shadow-lg` 
                          : 'bg-void-light text-white/60 hover:text-white border border-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Agents 列表 */}
            {filteredAgents.length === 0 ? (
              <div className="card-luxury rounded-2xl p-16 text-center">
                <div className="w-24 h-24 rounded-3xl bg-void-light/50 border border-white/5 flex items-center justify-center mx-auto mb-6">
                  <Users className="w-12 h-12 text-white/20" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  {myAgents.length === 0 ? '还没有 Agent' : '没有符合条件的 Agent'}
                </h2>
                <p className="text-white/40">
                  {myAgents.length === 0 ? '点击上方按钮铸造你的第一个 Agent' : '尝试其他筛选条件'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredAgents.map(agent => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Squad;
