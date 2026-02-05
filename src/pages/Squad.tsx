import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import AgentCard from '../components/AgentCard';
import PixelAgent from '../components/PixelAgent';
import { 
  Users, 
  Plus, 
  Filter, 
  Sparkles, 
  TrendingUp, 
  Skull, 
  Swords, 
  Wallet,
  Zap,
  Coins,
  CheckSquare,
  Square,
  LogIn,
  ArrowRight,
  BatteryCharging,
  Rocket
} from 'lucide-react';

const Squad: React.FC = () => {
  const { 
    wallet, 
    myAgents, 
    mintAgent, 
    mintCost,
    allocateFunds,
    joinArena
  } = useGameStore();
  
  const [mintCount, setMintCount] = useState(1);
  const [filter, setFilter] = useState<'all' | 'idle' | 'in_arena' | 'fighting'>('all');
  const [isMinting, setIsMinting] = useState(false);
  const [newAgent, setNewAgent] = useState<ReturnType<typeof mintAgent>>(null);
  
  // 批量操作状态
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());
  const [batchAmount, setBatchAmount] = useState('');
  const [showBatchPanel, setShowBatchPanel] = useState(false);
  
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
  
  // 切换 Agent 选择
  const toggleAgentSelection = (agentId: string) => {
    setSelectedAgents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(agentId)) {
        newSet.delete(agentId);
      } else {
        newSet.add(agentId);
      }
      return newSet;
    });
  };
  
  // 全选/取消全选
  const toggleSelectAll = () => {
    const idleAgentIds = idleAgents.map(a => a.id);
    if (selectedAgents.size === idleAgentIds.length) {
      setSelectedAgents(new Set());
    } else {
      setSelectedAgents(new Set(idleAgentIds));
    }
  };
  
  // 批量充值
  const handleBatchRecharge = () => {
    const amount = parseFloat(batchAmount);
    if (!amount || amount <= 0) return;
    
    const totalNeeded = amount * selectedAgents.size;
    if (totalNeeded > wallet.balance) {
      alert(`余额不足，需要 ${totalNeeded}，当前余额 ${wallet.balance}`);
      return;
    }
    
    selectedAgents.forEach(agentId => {
      allocateFunds(agentId, amount);
    });
    
    setBatchAmount('');
    setSelectedAgents(new Set());
    alert(`成功为 ${selectedAgents.size} 个 Agent 充值 ${amount}`);
  };
  
  // 一键加入竞技场（选中）
  const handleBatchJoinArena = () => {
    const eligibleAgents = myAgents.filter(
      a => a.status === 'idle' && a.balance > 0 && !selectedAgents.has(a.id)
    );
    
    const agentsToJoin = [...eligibleAgents, ...myAgents.filter(a => selectedAgents.has(a.id))]
      .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i); // 去重
    
    if (agentsToJoin.length === 0) {
      alert('没有符合条件的 Agent（需要有余额且处于空闲状态）');
      return;
    }
    
    agentsToJoin.forEach(agent => {
      if (agent.status === 'idle' && agent.balance > 0) {
        joinArena(agent.id);
      }
    });
    
    setSelectedAgents(new Set());
    alert(`成功将 ${agentsToJoin.length} 个 Agent 加入竞技场`);
  };

  // 一键充值所有空闲 Agents
  const handleRechargeAll = () => {
    if (idleAgents.length === 0) {
      alert('没有空闲的 Agent');
      return;
    }
    
    const amount = parseFloat(batchAmount);
    if (!amount || amount <= 0) {
      alert('请输入有效的充值金额');
      return;
    }
    
    const totalNeeded = amount * idleAgents.length;
    if (totalNeeded > wallet.balance) {
      alert(`余额不足，需要 ${totalNeeded}，当前余额 ${wallet.balance}`);
      return;
    }
    
    idleAgents.forEach(agent => {
      allocateFunds(agent.id, amount);
    });
    
    setBatchAmount('');
    alert(`成功为所有 ${idleAgents.length} 个空闲 Agent 充值 ${amount}`);
  };

  // 一键让所有 Agents 加入竞技场
  const handleJoinAllArena = () => {
    const eligibleAgents = myAgents.filter(
      a => a.status === 'idle' && a.balance > 0
    );
    
    if (eligibleAgents.length === 0) {
      alert('没有符合条件的 Agent（需要有余额且处于空闲状态）');
      return;
    }
    
    eligibleAgents.forEach(agent => {
      joinArena(agent.id);
    });
    
    alert(`成功将 ${eligibleAgents.length} 个 Agent 加入竞技场`);
  };
  
  const filteredAgents = myAgents.filter(agent => {
    if (filter === 'all') return true;
    return agent.status === filter;
  });
  
  const idleAgents = myAgents.filter(a => a.status === 'idle');
  const canJoinArena = idleAgents.filter(a => a.balance > 0);
  
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
            
            {/* 批量操作面板 */}
            {myAgents.length > 0 && (
              <div className="card-luxury rounded-2xl overflow-hidden mb-8 border-luxury-cyan/20">
                <div className="px-6 py-4 border-b border-white/5 bg-gradient-to-r from-luxury-cyan/10 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Zap className="w-6 h-6 text-luxury-cyan" />
                      <div>
                        <h2 className="text-lg font-semibold text-white">批量操作</h2>
                        <p className="text-xs text-white/40">快速管理多个 Agents</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowBatchPanel(!showBatchPanel)}
                      className="text-sm text-luxury-cyan hover:text-luxury-cyan-light transition-colors"
                    >
                      {showBatchPanel ? '收起' : '展开'}
                    </button>
                  </div>
                </div>
                
                {showBatchPanel && (
                  <div className="p-6 space-y-6">
                    {/* 一键操作区域 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 一键充值所有 */}
                      <div className="p-4 bg-luxury-green/5 rounded-xl border border-luxury-green/20">
                        <div className="flex items-center gap-2 mb-3">
                          <BatteryCharging className="w-5 h-5 text-luxury-green" />
                          <span className="text-sm font-medium text-white">一键充值所有</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={batchAmount}
                            onChange={(e) => setBatchAmount(e.target.value)}
                            placeholder="金额"
                            className="flex-1 bg-void-light border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-luxury-green focus:outline-none"
                          />
                          <button
                            onClick={handleRechargeAll}
                            disabled={!batchAmount || parseFloat(batchAmount) <= 0 || idleAgents.length === 0}
                            className="px-4 py-2 rounded-lg bg-luxury-green/20 border border-luxury-green/40 text-luxury-green hover:bg-luxury-green/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium whitespace-nowrap"
                          >
                            充值全部 ({idleAgents.length})
                          </button>
                        </div>
                      </div>

                      {/* 一键加入竞技场 */}
                      <div className="p-4 bg-luxury-gold/5 rounded-xl border border-luxury-gold/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Rocket className="w-5 h-5 text-luxury-gold" />
                          <span className="text-sm font-medium text-white">一键加入竞技场</span>
                        </div>
                        <button
                          onClick={handleJoinAllArena}
                          disabled={canJoinArena.length === 0}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-luxury-gold/20 border border-luxury-gold/40 text-luxury-gold hover:bg-luxury-gold/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          <LogIn className="w-4 h-4" />
                          全部加入 ({canJoinArena.length})
                        </button>
                      </div>
                    </div>

                    {/* 分隔线 */}
                    <div className="h-px bg-white/10" />

                    {/* 选择操作区域 */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={toggleSelectAll}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-void-light border border-white/10 text-white/60 hover:text-white transition-colors"
                          >
                            {selectedAgents.size === idleAgents.length && idleAgents.length > 0 ? (
                              <CheckSquare className="w-4 h-4 text-luxury-cyan" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                            <span className="text-sm">
                              全选空闲 ({selectedAgents.size}/{idleAgents.length})
                            </span>
                          </button>
                        </div>
                        
                        {/* 选中加入竞技场 */}
                        <button
                          onClick={handleBatchJoinArena}
                          disabled={selectedAgents.size === 0}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-luxury-cyan/10 border border-luxury-cyan/30 text-luxury-cyan hover:bg-luxury-cyan/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <LogIn className="w-4 h-4" />
                          <span className="text-sm font-medium">加入竞技场</span>
                          <span className="text-xs bg-luxury-cyan/20 px-2 py-0.5 rounded-full">
                            {selectedAgents.size}
                          </span>
                        </button>
                      </div>
                      
                      {/* 批量充值（选中） */}
                      {selectedAgents.size > 0 && (
                        <div className="flex items-center gap-3 p-4 bg-void-light/50 rounded-xl border border-white/5 animate-slide-up">
                          <div className="flex items-center gap-2 text-white/60">
                            <Coins className="w-4 h-4" />
                            <span className="text-sm">为选中的 {selectedAgents.size} 个 Agent 充值:</span>
                          </div>
                          <div className="flex-1 relative">
                            <input
                              type="number"
                              value={batchAmount}
                              onChange={(e) => setBatchAmount(e.target.value)}
                              placeholder="金额"
                              className="w-32 bg-void-light border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-luxury-cyan focus:outline-none"
                            />
                          </div>
                          <button
                            onClick={handleBatchRecharge}
                            disabled={!batchAmount || parseFloat(batchAmount) <= 0}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-luxury-cyan/10 border border-luxury-cyan/30 text-luxury-cyan hover:bg-luxury-cyan/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ArrowRight className="w-4 h-4" />
                            确认充值
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
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
                  <div key={agent.id} className="relative">
                    {/* 选择框（仅空闲状态显示） */}
                    {agent.status === 'idle' && showBatchPanel && (
                      <button
                        onClick={() => toggleAgentSelection(agent.id)}
                        className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-lg bg-void-panel border border-white/20 flex items-center justify-center shadow-lg"
                      >
                        {selectedAgents.has(agent.id) ? (
                          <CheckSquare className="w-5 h-5 text-luxury-green" />
                        ) : (
                          <Square className="w-5 h-5 text-white/40" />
                        )}
                      </button>
                    )}
                    <AgentCard agent={agent} />
                  </div>
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
