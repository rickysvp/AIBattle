import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Plus, 
  Minus, 
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  ExternalLink
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'mint' | 'battle_win' | 'battle_loss' | 'deposit' | 'withdraw';
  amount: number;
  timestamp: number;
  description: string;
}

const WalletPage: React.FC = () => {
  const { wallet, myAgents, connectWallet } = useGameStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');
  
  // 模拟交易记录
  const transactions: Transaction[] = [
    { id: '1', type: 'mint', amount: -100, timestamp: Date.now() - 3600000, description: '铸造 Agent #1' },
    { id: '2', type: 'battle_win', amount: 50, timestamp: Date.now() - 7200000, description: '战斗胜利奖励' },
    { id: '3', type: 'battle_loss', amount: -30, timestamp: Date.now() - 10800000, description: '战斗失败损失' },
    { id: '4', type: 'deposit', amount: 500, timestamp: Date.now() - 86400000, description: '充值' },
  ];
  
  const totalAssets = wallet.balance + wallet.lockedBalance;
  const agentsTotalBalance = myAgents.reduce((sum, a) => sum + a.balance, 0);
  
  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'mint': return { icon: Plus, color: 'text-luxury-purple', bgColor: 'bg-luxury-purple/10' };
      case 'battle_win': return { icon: TrendingUp, color: 'text-luxury-green', bgColor: 'bg-luxury-green/10' };
      case 'battle_loss': return { icon: TrendingDown, color: 'text-luxury-rose', bgColor: 'bg-luxury-rose/10' };
      case 'deposit': return { icon: ArrowDownRight, color: 'text-luxury-cyan', bgColor: 'bg-luxury-cyan/10' };
      case 'withdraw': return { icon: ArrowUpRight, color: 'text-luxury-amber', bgColor: 'bg-luxury-amber/10' };
    }
  };
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address);
  };

  return (
    <div className="min-h-screen bg-void pt-24 pb-24">
      <div className="max-w-screen-xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-luxury-green/20 to-luxury-cyan/20 border border-luxury-green/30 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-luxury-green" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-display">钱包</h1>
              <p className="text-white/40">管理你的资产和交易记录</p>
            </div>
          </div>
        </div>
        
        {!wallet.connected ? (
          <div className="card-luxury rounded-2xl p-16 text-center">
            <div className="w-24 h-24 rounded-3xl bg-void-light/50 border border-white/5 flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-12 h-12 text-white/20" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">请先连接钱包</h2>
            <button
              onClick={connectWallet}
              className="group relative px-8 py-4 rounded-xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-luxury-purple via-luxury-purple-light to-luxury-cyan" />
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <span className="relative flex items-center gap-2 text-white font-semibold">
                <Wallet className="w-5 h-5" />
                连接钱包
              </span>
            </button>
          </div>
        ) : (
          <>
            {/* 资产概览卡片 */}
            <div className="card-luxury rounded-2xl overflow-hidden mb-6 border-luxury-gold/20">
              <div className="px-8 py-6 bg-gradient-to-br from-luxury-gold/5 to-transparent">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-white/40 uppercase tracking-wider mb-1">总资产</p>
                    <p className="text-5xl font-bold text-gradient-gold font-display">{totalAssets.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-2">钱包地址</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm text-luxury-cyan font-mono bg-void-light/50 px-3 py-1.5 rounded-lg">
                        {wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}
                      </code>
                      <button 
                        onClick={copyAddress}
                        className="p-2 rounded-lg bg-void-light/50 text-white/40 hover:text-white hover:bg-void-light transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-void-light/50 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-white/40 mb-2">
                      <Wallet className="w-4 h-4" />
                      <span className="text-xs uppercase tracking-wider">可用余额</span>
                    </div>
                    <p className="text-2xl font-bold text-luxury-green font-mono">{wallet.balance.toLocaleString()}</p>
                  </div>
                  
                  <div className="bg-void-light/50 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-white/40 mb-2">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs uppercase tracking-wider">锁定资产</span>
                    </div>
                    <p className="text-2xl font-bold text-luxury-amber font-mono">{agentsTotalBalance.toLocaleString()}</p>
                  </div>
                  
                  <div className="bg-void-light/50 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-white/40 mb-2">
                      <PieChart className="w-4 h-4" />
                      <span className="text-xs uppercase tracking-wider">Agents</span>
                    </div>
                    <p className="text-2xl font-bold text-luxury-purple font-mono">{myAgents.length}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 操作按钮 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button className="group p-6 card-luxury rounded-2xl text-left transition-all hover:border-luxury-green/30">
                <div className="w-14 h-14 rounded-2xl bg-luxury-green/10 border border-luxury-green/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ArrowDownRight className="w-7 h-7 text-luxury-green" />
                </div>
                <p className="text-lg font-semibold text-white mb-1">充值</p>
                <p className="text-sm text-white/40">从外部钱包转入资金</p>
              </button>
              
              <button className="group p-6 card-luxury rounded-2xl text-left transition-all hover:border-luxury-amber/30">
                <div className="w-14 h-14 rounded-2xl bg-luxury-amber/10 border border-luxury-amber/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ArrowUpRight className="w-7 h-7 text-luxury-amber" />
                </div>
                <p className="text-lg font-semibold text-white mb-1">提现</p>
                <p className="text-sm text-white/40">转出到外部钱包</p>
              </button>
            </div>
            
            {/* Tab 切换 */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === 'overview' 
                    ? 'bg-luxury-purple text-white shadow-lg shadow-luxury-purple/25' 
                    : 'bg-void-light text-white/60 hover:text-white border border-white/10'
                }`}
              >
                <PieChart className="w-4 h-4" />
                资产分布
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === 'transactions' 
                    ? 'bg-luxury-purple text-white shadow-lg shadow-luxury-purple/25' 
                    : 'bg-void-light text-white/60 hover:text-white border border-white/10'
                }`}
              >
                <Clock className="w-4 h-4" />
                交易记录
              </button>
            </div>
            
            {/* Tab 内容 */}
            {activeTab === 'overview' ? (
              <div className="card-luxury rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-luxury-purple" />
                  资产分布
                </h3>
                
                {/* 资产分布图 */}
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-luxury-green/10 border border-luxury-green/20 flex items-center justify-center">
                          <Wallet className="w-5 h-5 text-luxury-green" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">可用余额</p>
                          <p className="text-xs text-white/40">{((wallet.balance / totalAssets) * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-luxury-green font-mono">{wallet.balance.toLocaleString()}</p>
                    </div>
                    <div className="h-3 bg-void-light rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-luxury-green transition-all duration-500"
                        style={{ width: `${(wallet.balance / totalAssets) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-luxury-amber/10 border border-luxury-amber/20 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-luxury-amber" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">锁定在 Agents</p>
                          <p className="text-xs text-white/40">{((agentsTotalBalance / totalAssets) * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-luxury-amber font-mono">{agentsTotalBalance.toLocaleString()}</p>
                    </div>
                    <div className="h-3 bg-void-light rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-luxury-amber transition-all duration-500"
                        style={{ width: `${(agentsTotalBalance / totalAssets) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Agents 资产明细 */}
                {myAgents.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-white/5">
                    <h4 className="text-sm text-white/40 uppercase tracking-wider mb-4">Agents 资产明细</h4>
                    <div className="space-y-3">
                      {myAgents.map(agent => (
                        <div key={agent.id} className="flex items-center justify-between p-4 bg-void-light/30 rounded-xl border border-white/5">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-xl border border-white/10"
                              style={{ backgroundColor: `${agent.color}20`, borderColor: `${agent.color}40` }}
                            />
                            <div>
                              <p className="text-sm font-medium text-white">{agent.name}</p>
                              <p className="text-xs text-white/40">ID: {agent.id.slice(0, 8)}</p>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-luxury-cyan font-mono">{agent.balance.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="card-luxury rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-luxury-purple" />
                    交易记录
                  </h3>
                </div>
                
                <div className="divide-y divide-white/5">
                  {transactions.map(tx => {
                    const config = getTransactionIcon(tx.type);
                    const Icon = config.icon;
                    
                    return (
                      <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-void-light/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${config.color}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{tx.description}</p>
                            <p className="text-xs text-white/40">{formatTime(tx.timestamp)}</p>
                          </div>
                        </div>
                        <span className={`font-bold font-mono ${tx.amount >= 0 ? 'text-luxury-green' : 'text-luxury-rose'}`}>
                          {tx.amount >= 0 ? '+' : ''}{tx.amount}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                {transactions.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-void-light/50 border border-white/5 flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-white/20" />
                    </div>
                    <p className="text-white/40">暂无交易记录</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
