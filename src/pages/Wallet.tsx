import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import {
  Wallet, TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight,
  History, PieChart, Target, Zap, Copy, CheckCircle, Clock
} from 'lucide-react';

const WalletPage: React.FC = () => {
  const { wallet, myAgents, deposit, withdraw, getTotalStats } = useGameStore();
  const [amount, setAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [copied, setCopied] = useState(false);

  const stats = getTotalStats();
  const totalAgentBalance = myAgents.reduce((sum, a) => sum + a.balance, 0);
  const totalValue = wallet.balance + totalAgentBalance;

  // 模拟交易历史
  const transactions = [
    { id: '1', type: 'deposit', amount: 10000, time: '2024-01-20 10:30', status: 'completed' },
    { id: '2', type: 'mint', amount: -100, time: '2024-01-20 11:15', status: 'completed' },
    { id: '3', type: 'allocate', amount: -500, time: '2024-01-20 11:20', status: 'completed' },
    { id: '4', type: 'profit', amount: 45, time: '2024-01-20 12:00', status: 'completed' },
    { id: '5', type: 'withdraw', amount: -200, time: '2024-01-20 14:30', status: 'pending' },
  ];

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeposit = () => {
    const value = parseFloat(amount);
    if (value > 0) {
      deposit(value);
      setAmount('');
    }
  };

  const handleWithdraw = () => {
    const value = parseFloat(amount);
    if (value > 0) {
      withdraw(value);
      setAmount('');
    }
  };

  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] to-[#050508] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">连接钱包</h2>
          <p className="text-white/40 mb-8">请先连接钱包以查看资产</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] to-[#050508] pt-20 pb-24">
      <div className="max-w-4xl mx-auto px-4">
        {/* 总资产卡片 */}
        <div className="bg-gradient-to-br from-purple-500/20 via-purple-600/10 to-transparent border border-purple-500/30 rounded-2xl p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/60">总资产估值</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/40">$MON</span>
              <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">+5.2%</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-white mb-2">
            ${totalValue.toLocaleString()}
          </div>
          <div className="flex items-center gap-4 text-sm text-white/40">
            <span>钱包: ${wallet.balance.toLocaleString()}</span>
            <span>·</span>
            <span>Agent持仓: ${totalAgentBalance.toLocaleString()}</span>
          </div>
        </div>

        {/* 充值提现 */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <input
              type="number"
              placeholder="输入金额"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30"
            />
            <button
              onClick={handleDeposit}
              disabled={!amount || parseFloat(amount) <= 0}
              className="flex items-center gap-2 px-6 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              <ArrowDownLeft className="w-5 h-5" />
              充值
            </button>
            <button
              onClick={handleWithdraw}
              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > wallet.balance}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              <ArrowUpRight className="w-5 h-5" />
              提现
            </button>
          </div>

          {/* 钱包地址 */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-white/40">钱包地址</p>
                <p className="text-white font-mono">{wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}</p>
              </div>
            </div>
            <button
              onClick={handleCopyAddress}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {copied ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-white/40" />}
            </button>
          </div>
        </div>

        {/* 统计网格 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatBox
            icon={stats.totalProfit >= 0 ? TrendingUp : TrendingDown}
            label="总盈亏"
            value={`${stats.totalProfit >= 0 ? '+' : ''}$${stats.totalProfit.toLocaleString()}`}
            color={stats.totalProfit >= 0 ? 'green' : 'red'}
          />
          <StatBox
            icon={Target}
            label="总Agents"
            value={myAgents.length}
            color="purple"
          />
          <StatBox
            icon={PieChart}
            label="多空比"
            value={`${stats.longCount}:${stats.shortCount}`}
            color="amber"
          />
          <StatBox
            icon={Zap}
            label="平均杠杆"
            value={`${stats.avgLeverage}x`}
            color="cyan"
          />
        </div>

        {/* 标签页 */}
        <div className="flex border-b border-white/10 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              activeTab === 'overview' ? 'text-white border-b-2 border-purple-500' : 'text-white/40 hover:text-white'
            }`}
          >
            资产分布
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              activeTab === 'history' ? 'text-white border-b-2 border-purple-500' : 'text-white/40 hover:text-white'
            }`}
          >
            交易记录
          </button>
        </div>

        {/* 内容 */}
        {activeTab === 'overview' ? (
          <div className="space-y-4">
            {/* 资产分布 */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">资产分布</h3>
              <div className="space-y-3">
                <AssetBar
                  label="钱包余额"
                  value={wallet.balance}
                  total={totalValue}
                  color="purple"
                />
                <AssetBar
                  label="Agent持仓"
                  value={totalAgentBalance}
                  total={totalValue}
                  color="amber"
                />
              </div>
            </div>

            {/* 多空分布 */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">持仓方向分布</h3>
              <div className="h-4 bg-white/5 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all"
                  style={{ width: `${myAgents.length ? (stats.longCount / myAgents.length) * 100 : 50}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-red-400 to-red-600 transition-all"
                  style={{ width: `${myAgents.length ? (stats.shortCount / myAgents.length) * 100 : 50}%` }}
                />
              </div>
              <div className="flex justify-between mt-3">
                <span className="flex items-center gap-2 text-sm text-green-400">
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  做多 {stats.longCount}
                </span>
                <span className="flex items-center gap-2 text-sm text-red-400">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  做空 {stats.shortCount}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">最近交易</h3>
            </div>
            <div className="divide-y divide-white/5">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      tx.type === 'deposit' || tx.type === 'profit'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {tx.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> :
                       tx.type === 'withdraw' ? <ArrowUpRight className="w-5 h-5" /> :
                       tx.type === 'profit' ? <TrendingUp className="w-5 h-5" /> :
                       <Wallet className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {tx.type === 'deposit' ? '充值' :
                         tx.type === 'withdraw' ? '提现' :
                         tx.type === 'mint' ? '铸造 Agent' :
                         tx.type === 'allocate' ? '资金分配' :
                         '战斗收益'}
                      </p>
                      <p className="text-sm text-white/40">{tx.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono font-medium ${
                      tx.amount > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount} $MON
                    </p>
                    <p className="text-xs text-white/40 flex items-center gap-1 justify-end">
                      {tx.status === 'completed' ? (
                        <><CheckCircle className="w-3 h-3" /> 已完成</>
                      ) : (
                        <><Clock className="w-3 h-3" /> 处理中</>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 统计盒子
const StatBox = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) => {
  const colors: Record<string, string> = {
    green: 'text-green-400 bg-green-500/10',
    red: 'text-red-400 bg-red-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    cyan: 'text-cyan-400 bg-cyan-500/10',
  };

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-white/40 mt-1">{label}</p>
    </div>
  );
};

// 资产条
const AssetBar = ({ label, value, total, color }: { label: string, value: number, total: number, color: string }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const colors: Record<string, string> = {
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    cyan: 'bg-cyan-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/60">{label}</span>
        <span className="text-white font-mono">${value.toLocaleString()} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${colors[color]} rounded-full transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

export default WalletPage;
