import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store/gameStore';
import { Agent } from '../types';
import {
  Users, Plus, Filter, TrendingUp, TrendingDown, Wallet,
  Swords, CheckSquare, Square, ArrowUpRight, ArrowDownRight,
  Target, Zap, BarChart3, ChevronRight, Settings2, Trash2,
  ArrowRightLeft, LogOut
} from 'lucide-react';

const Squad: React.FC = () => {
  const { t } = useTranslation();
  const {
    wallet,
    myAgents,
    mintAgent,
    mintCost,
    allocateFunds,
    withdrawFromAgent,
    joinArena,
    leaveArena,
    updateAgentLeverage,
    removeAgent,
    getTotalStats
  } = useGameStore();

  const [mintCount, setMintCount] = useState(1);
  const [filter, setFilter] = useState<'all' | 'idle' | 'in_arena' | 'fighting' | 'liquidated'>('all');
  const [isMinting, setIsMinting] = useState(false);
  const [showMintModal, setShowMintModal] = useState(false);
  const [mintedAgents, setMintedAgents] = useState<Agent[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'balance' | 'profit' | 'leverage' | 'status'>('balance');
  const [showActionModal, setShowActionModal] = useState<string | null>(null);
  const [actionAmount, setActionAmount] = useState('');

  const stats = getTotalStats();

  const handleMint = async () => {
    if (!wallet.connected || wallet.balance < mintCost * mintCount) return;
    setShowMintModal(true);
    setIsMinting(true);
    setMintedAgents([]);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newAgents: Agent[] = [];
    for (let i = 0; i < mintCount; i++) {
      const agent = await mintAgent();
      if (agent) newAgents.push(agent);
    }
    setMintedAgents(newAgents);
    setIsMinting(false);
  };

  const toggleAgentSelection = (agentId: string) => {
    setSelectedAgents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(agentId)) newSet.delete(agentId);
      else newSet.add(agentId);
      return newSet;
    });
  };

  const handleBatchDeposit = () => {
    const amount = parseFloat(actionAmount);
    if (!amount || amount <= 0) return;
    const perAgent = Math.floor(amount / selectedAgents.size);
    selectedAgents.forEach(agentId => allocateFunds(agentId, perAgent));
    setSelectedAgents(new Set());
    setActionAmount('');
  };

  const handleBatchJoin = () => {
    selectedAgents.forEach(agentId => joinArena(agentId));
    setSelectedAgents(new Set());
  };

  const filteredAgents = myAgents
    .filter(agent => filter === 'all' ? true : agent.status === filter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'balance': return b.balance - a.balance;
        case 'profit': return b.netProfit - a.netProfit;
        case 'leverage': return b.leverage - a.leverage;
        case 'status':
          const order = { idle: 0, in_arena: 1, fighting: 2, liquidated: 3 };
          return order[a.status] - order[b.status];
        default: return 0;
      }
    });

  const idleAgents = myAgents.filter(a => a.status === 'idle');
  const inArenaAgents = myAgents.filter(a => a.status === 'in_arena');
  const longAgents = myAgents.filter(a => a.position === 'long');
  const shortAgents = myAgents.filter(a => a.position === 'short');

  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] to-[#050508] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">连接钱包</h2>
          <p className="text-white/40 mb-8">请先连接钱包以管理您的交易小队</p>
          <button className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-all">
            连接钱包
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] to-[#050508] pt-20 pb-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* 统计概览 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="总Agents"
            value={myAgents.length}
            color="purple"
          />
          <StatCard
            icon={Wallet}
            label="总余额"
            value={`$${stats.totalBalance.toLocaleString()}`}
            color="amber"
          />
          <StatCard
            icon={stats.totalProfit >= 0 ? TrendingUp : TrendingDown}
            label="总盈亏"
            value={`${stats.totalProfit >= 0 ? '+' : ''}$${stats.totalProfit.toLocaleString()}`}
            color={stats.totalProfit >= 0 ? 'green' : 'red'}
          />
          <StatCard
            icon={Zap}
            label="平均杠杆"
            value={`${stats.avgLeverage}x`}
            color="cyan"
          />
        </div>

        {/* 多空分布 */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">持仓分布</h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                做多 {longAgents.length}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                做空 {shortAgents.length}
              </span>
            </div>
          </div>
          <div className="h-4 bg-white/5 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all"
              style={{ width: `${myAgents.length ? (longAgents.length / myAgents.length) * 100 : 50}%` }}
            />
            <div
              className="h-full bg-gradient-to-r from-red-400 to-red-600 transition-all"
              style={{ width: `${myAgents.length ? (shortAgents.length / myAgents.length) * 100 : 50}%` }}
            />
          </div>
          <div className="flex justify-between mt-3 text-xs text-white/40">
            <span>竞技场中: {inArenaAgents.length}</span>
            <span>空闲: {idleAgents.length}</span>
          </div>
        </div>

        {/* 快速铸造 */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Plus className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">铸造新 Agent</h3>
                <p className="text-sm text-white/40">消耗 {mintCost} $MON 铸造一个交易 Agent</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-white/5 rounded-lg p-1">
                {[1, 5, 10].map(n => (
                  <button
                    key={n}
                    onClick={() => setMintCount(n)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      mintCount === n ? 'bg-purple-500 text-white' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button
                onClick={handleMint}
                disabled={isMinting || wallet.balance < mintCost * mintCount}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all disabled:opacity-50"
              >
                {isMinting ? '铸造中...' : `铸造 (${mintCost * mintCount} $MON)`}
              </button>
            </div>
          </div>
        </div>

        {/* 筛选和排序 */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
            {(['all', 'idle', 'in_arena', 'fighting', 'liquidated'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                {f === 'all' ? '全部' : f === 'idle' ? '空闲' : f === 'in_arena' ? '竞技场' : f === 'fighting' ? '战斗中' : '已爆仓'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-white/40">排序:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="balance">余额</option>
              <option value="profit">盈亏</option>
              <option value="leverage">杠杆</option>
              <option value="status">状态</option>
            </select>
          </div>
        </div>

        {/* 批量操作栏 */}
        {selectedAgents.size > 0 && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6 flex items-center justify-between">
            <span className="text-white font-medium">已选择 {selectedAgents.size} 个 Agent</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="金额"
                value={actionAmount}
                onChange={(e) => setActionAmount(e.target.value)}
                className="w-24 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
              />
              <button
                onClick={handleBatchDeposit}
                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-medium"
              >
                批量充值
              </button>
              <button
                onClick={handleBatchJoin}
                className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-sm font-medium"
              >
                批量入场
              </button>
              <button
                onClick={() => setSelectedAgents(new Set())}
                className="px-4 py-2 text-white/40 hover:text-white"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* Agent 列表 */}
        {filteredAgents.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <p className="text-white/40">暂无 Agent</p>
            <p className="text-sm text-white/20 mt-2">铸造您的第一个交易 Agent 开始游戏</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredAgents.map((agent, index) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                index={index}
                isSelected={selectedAgents.has(agent.id)}
                onToggle={() => toggleAgentSelection(agent.id)}
                onAction={() => setShowActionModal(agent.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 操作弹窗 */}
      {showActionModal && (
        <ActionModal
          agent={myAgents.find(a => a.id === showActionModal)!}
          onClose={() => setShowActionModal(null)}
        />
      )}
    </div>
  );
};

// 统计卡片
const StatCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) => {
  const colors: Record<string, string> = {
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30 text-green-400',
    red: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400',
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5`}>
      <Icon className="w-6 h-6 mb-3" />
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-white/50 mt-1">{label}</p>
    </div>
  );
};

// Agent 卡片
const AgentCard = ({ agent, index, isSelected, onToggle, onAction }: {
  agent: Agent;
  index: number;
  isSelected: boolean;
  onToggle: () => void;
  onAction: () => void;
}) => {
  const { joinArena, leaveArena, allocateFunds, withdrawFromAgent, updateAgentLeverage, removeAgent } = useGameStore();
  const [showDetail, setShowDetail] = useState(false);

  const pnlPercent = agent.initialBalance > 0
    ? ((agent.balance - agent.initialBalance) / agent.initialBalance) * 100
    : 0;

  const statusColors = {
    idle: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    in_arena: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    fighting: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    liquidated: 'bg-red-500/10 text-red-400 border-red-500/30',
  };

  const statusLabels = {
    idle: '空闲',
    in_arena: '竞技场',
    fighting: '战斗中',
    liquidated: '已爆仓',
  };

  return (
    <>
      <div
        className={`group bg-white/[0.02] hover:bg-white/[0.04] border ${
          isSelected ? 'border-purple-500/50' : 'border-white/[0.06] hover:border-white/[0.12]'
        } rounded-xl p-4 transition-all cursor-pointer`}
        onClick={onAction}
        style={{ animationDelay: `${index * 30}ms` }}
      >
        <div className="flex items-center gap-4">
          {/* 选择框 */}
          {agent.status === 'idle' && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggle(); }}
              className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                isSelected ? 'bg-purple-500 border-purple-500' : 'border-white/20 hover:border-purple-500'
              }`}
            >
              {isSelected && <CheckSquare className="w-3.5 h-3.5 text-white" />}
            </button>
          )}

          {/* 头像 */}
          <div className="relative">
            <div
              className="w-14 h-14 rounded-xl overflow-hidden"
              style={{ border: `2px solid ${agent.position === 'long' ? '#22c55e' : '#ef4444'}` }}
            >
              {agent.image ? (
                <img src={agent.image} alt={agent.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-white/5 flex items-center justify-center text-2xl">
                  {agent.position === 'long' ? '🐂' : '🐻'}
                </div>
              )}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
              agent.position === 'long' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {agent.position === 'long' ? 'L' : 'S'}
            </div>
          </div>

          {/* 信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-white">{agent.name}</h4>
              <span className={`px-2 py-0.5 rounded text-xs border ${statusColors[agent.status]}`}>
                {statusLabels[agent.status]}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm">
              <span className="font-mono text-amber-400">${agent.balance.toLocaleString()}</span>
              <span className={`font-mono ${pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}%
              </span>
              <span className="text-white/40">{agent.leverage}x 杠杆</span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {agent.status === 'idle' && agent.balance > 0 && (
              <button
                onClick={() => joinArena(agent.id)}
                className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-sm font-medium transition-colors"
              >
                入场
              </button>
            )}
            {agent.status === 'in_arena' && (
              <button
                onClick={() => leaveArena(agent.id)}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
              >
                退出
              </button>
            )}
            <button
              onClick={() => setShowDetail(true)}
              className="p-2 text-white/40 hover:text-white transition-colors"
            >
              <Settings2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 详情弹窗 */}
      {showDetail && (
        <AgentDetailModal
          agent={agent}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
};

// Agent 详情弹窗
const AgentDetailModal = ({ agent, onClose }: { agent: Agent; onClose: () => void }) => {
  const { allocateFunds, withdrawFromAgent, updateAgentLeverage, removeAgent } = useGameStore();
  const [amount, setAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');

  const leverages = [1, 2, 5, 10, 20, 50, 100];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0f0f14] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* 头部 */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-xl overflow-hidden"
              style={{ border: `2px solid ${agent.position === 'long' ? '#22c55e' : '#ef4444'}` }}
            >
              {agent.image ? (
                <img src={agent.image} alt={agent.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-white/5 flex items-center justify-center text-3xl">
                  {agent.position === 'long' ? '🐂' : '🐻'}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{agent.name}</h3>
              <p className="text-sm text-white/40">{agent.position === 'long' ? '做多' : '做空'} · {agent.leverage}x 杠杆</p>
            </div>
          </div>
        </div>

        {/* 标签页 */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'overview' ? 'text-white border-b-2 border-purple-500' : 'text-white/40 hover:text-white'
            }`}
          >
            概览
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'settings' ? 'text-white border-b-2 border-purple-500' : 'text-white/40 hover:text-white'
            }`}
          >
            设置
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          {activeTab === 'overview' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-white/40 mb-1">当前余额</p>
                  <p className="text-xl font-bold text-amber-400">${agent.balance.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-white/40 mb-1">总盈亏</p>
                  <p className={`text-xl font-bold ${agent.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {agent.netProfit >= 0 ? '+' : ''}${agent.netProfit.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-sm text-white/40 mb-3">资金操作</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="金额"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  />
                  <button
                    onClick={() => { allocateFunds(agent.id, parseFloat(amount)); setAmount(''); }}
                    disabled={!amount || parseFloat(amount) <= 0}
                    className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-medium disabled:opacity-50"
                  >
                    充值
                  </button>
                  <button
                    onClick={() => { withdrawFromAgent(agent.id, parseFloat(amount)); setAmount(''); }}
                    disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > agent.balance}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium disabled:opacity-50"
                  >
                    提现
                  </button>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-sm text-white/40 mb-3">交易统计</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-white">{agent.totalBattles}</p>
                    <p className="text-xs text-white/40">总场次</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{agent.winRate}%</p>
                    <p className="text-xs text-white/40">胜率</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{agent.kills}</p>
                    <p className="text-xs text-white/40">击杀</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-sm text-white/40 mb-3">调整杠杆</p>
                <div className="flex flex-wrap gap-2">
                  {leverages.map(l => (
                    <button
                      key={l}
                      onClick={() => updateAgentLeverage(agent.id, l)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        agent.leverage === l
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      {l}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-sm text-white/40 mb-3">危险操作</p>
                <button
                  onClick={() => { removeAgent(agent.id); onClose(); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  删除 Agent
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 操作弹窗
const ActionModal = ({ agent, onClose }: { agent: Agent; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0f0f14] border border-white/10 rounded-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-white mb-4">选择操作</h3>
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
            <ArrowUpRight className="w-5 h-5 text-green-400" />
            <span className="text-white">充值资金</span>
          </button>
          <button className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
            <ArrowDownRight className="w-5 h-5 text-red-400" />
            <span className="text-white">提取资金</span>
          </button>
          <button className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
            <Settings2 className="w-5 h-5 text-purple-400" />
            <span className="text-white">调整杠杆</span>
          </button>
          <button className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <span className="text-white">查看详情</span>
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-4 py-3 text-white/40 hover:text-white transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  );
};

export default Squad;
