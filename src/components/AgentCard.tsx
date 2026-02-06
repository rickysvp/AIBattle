import React, { useState } from 'react';
import { Agent } from '../types';
import { useGameStore } from '../store/gameStore';
import PixelAgent from './PixelAgent';
import { 
  Zap, 
  Shield, 
  Heart, 
  Coins, 
  TrendingUp, 
  Skull,
  Plus,
  Minus,
  LogIn,
  LogOut,
  ChevronDown,
  ChevronUp,
  Trophy,
  Target,
  Flame,
  BarChart3,
  History,
  Award
} from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  compact?: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, compact = false }) => {
  const [showActions, setShowActions] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  
  const { allocateFunds, withdrawFunds, joinArena, leaveArena, wallet } = useGameStore();
  
  const handleAllocate = () => {
    const amount = parseFloat(fundAmount);
    if (amount > 0 && amount <= wallet.balance) {
      allocateFunds(agent.id, amount);
      setFundAmount('');
    }
  };
  
  const handleWithdraw = () => {
    const amount = parseFloat(fundAmount);
    if (amount > 0 && amount <= agent.balance) {
      withdrawFunds(agent.id, amount);
      setFundAmount('');
    }
  };
  
  const getStatusConfig = () => {
    switch (agent.status) {
      case 'idle': 
        return { 
          label: '空闲', 
          color: 'text-luxury-cyan',
          bgColor: 'bg-luxury-cyan/10',
          borderColor: 'border-luxury-cyan/30',
          icon: Zap
        };
      case 'in_arena': 
        return { 
          label: '待战', 
          color: 'text-luxury-gold',
          bgColor: 'bg-luxury-gold/10',
          borderColor: 'border-luxury-gold/30',
          icon: Shield
        };
      case 'fighting': 
        return { 
          label: '战斗中', 
          color: 'text-luxury-rose',
          bgColor: 'bg-luxury-rose/10',
          borderColor: 'border-luxury-rose/30',
          icon: Heart,
          animate: true
        };
      case 'dead': 
        return { 
          label: '已阵亡', 
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/30',
          icon: Skull
        };
      default: 
        return { 
          label: '未知', 
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          borderColor: 'border-gray-400/30',
          icon: Zap
        };
    }
  };
  
  const status = getStatusConfig();
  const StatusIcon = status.icon;
  const hpPercent = (agent.hp / agent.maxHp) * 100;

  if (compact) {
    return (
      <div 
        className="card-luxury rounded-xl overflow-hidden cursor-pointer group"
        onClick={() => setShowActions(!showActions)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-4">
          <div className="flex items-center gap-4">
            {/* Agent 头像 */}
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-br from-${agent.color} to-${agent.color} opacity-20 blur-lg rounded-full transition-opacity duration-300 ${isHovered ? 'opacity-40' : 'opacity-20'}`} />
              <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-void-panel to-void-elevated border border-white/10 flex items-center justify-center overflow-hidden">
                <PixelAgent agent={agent} size={40} />
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{ backgroundColor: agent.color }}
                />
              </div>
              
              {/* 状态指示器 */}
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg ${status.bgColor} border ${status.borderColor} flex items-center justify-center`}>
                <StatusIcon className={`w-3 h-3 ${status.color} ${status.animate ? 'animate-pulse' : ''}`} />
              </div>
            </div>
            
            {/* 信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-semibold text-white truncate">{agent.name}</h4>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${status.bgColor} ${status.color} border ${status.borderColor}`}>
                  {status.label}
                </span>
              </div>
              
              {/* 属性条 */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-luxury-gold">
                  <Coins className="w-3 h-3" />
                  <span className="font-mono">{agent.balance.toFixed(0)}</span>
                </div>
                <div className="flex items-center gap-1 text-luxury-rose">
                  <TrendingUp className="w-3 h-3" />
                  <span className="font-mono">{agent.kills}</span>
                </div>
              </div>
            </div>
            
            {/* 展开图标 */}
            <div className="text-white/30 group-hover:text-white/60 transition-colors">
              {showActions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </div>
          
          {/* 快捷操作 */}
          {showActions && (
            <div className="mt-4 pt-4 border-t border-white/5 space-y-3 animate-slide-up">
              {/* 资金操作 */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    placeholder="金额"
                    className="w-full bg-void-light border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-luxury-purple focus:outline-none transition-colors"
                  />
                  <Coins className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                </div>
                <button
                  onClick={handleAllocate}
                  disabled={!fundAmount || parseFloat(fundAmount) > wallet.balance}
                  className="px-3 py-2 bg-luxury-green/10 border border-luxury-green/30 rounded-lg text-luxury-green hover:bg-luxury-green/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={!fundAmount || parseFloat(fundAmount) > agent.balance || agent.status !== 'idle'}
                  className="px-3 py-2 bg-luxury-amber/10 border border-luxury-amber/30 rounded-lg text-luxury-amber hover:bg-luxury-amber/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
              
              {/* 竞技场操作 */}
              <div className="flex gap-2">
                {agent.status === 'idle' && agent.balance > 0 && (
                  <button
                    onClick={() => joinArena(agent.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-luxury-purple/20 to-luxury-cyan/20 border border-luxury-purple/30 rounded-lg text-white hover:from-luxury-purple/30 hover:to-luxury-cyan/30 transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="text-sm font-medium">加入竞技场</span>
                  </button>
                )}
                {agent.status === 'in_arena' && (
                  <button
                    onClick={() => leaveArena(agent.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-luxury-rose/10 border border-luxury-rose/30 rounded-lg text-luxury-rose hover:bg-luxury-rose/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">退出竞技场</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* HP 条（战斗中显示） */}
        {(agent.status === 'fighting' || agent.hp < agent.maxHp) && (
          <div className="px-4 pb-4">
            <div className="h-1.5 bg-void-light rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  hpPercent > 60 ? 'bg-luxury-green' : hpPercent > 30 ? 'bg-luxury-amber' : 'bg-luxury-rose'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className="card-luxury rounded-2xl overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 头部 */}
      <div className="relative p-5">
        {/* 背景装饰 */}
        <div 
          className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl rounded-full transition-opacity duration-300"
          style={{ backgroundColor: agent.color }}
        />
        
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Agent 头像 */}
            <div className="relative">
              <div 
                className={`absolute inset-0 blur-xl rounded-full transition-all duration-300 ${isHovered ? 'opacity-50 scale-110' : 'opacity-30'}`}
                style={{ backgroundColor: agent.color }}
              />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-void-panel to-void-elevated border border-white/10 flex items-center justify-center overflow-hidden">
                <PixelAgent agent={agent} size={48} />
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{ backgroundColor: agent.color }}
                />
              </div>
              
              {/* 状态指示器 */}
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-xl ${status.bgColor} border ${status.borderColor} flex items-center justify-center`}>
                <StatusIcon className={`w-3.5 h-3.5 ${status.color} ${status.animate ? 'animate-pulse' : ''}`} />
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-white mb-1">{agent.name}</h4>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-lg ${status.bgColor} ${status.color} border ${status.borderColor} font-medium`}>
                  {status.label}
                </span>
                <span className="text-xs text-white/30 font-mono">ID: {agent.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>
          
          {/* HP 显示 */}
          <div className="text-right">
            <div className="flex items-center gap-1 text-luxury-rose mb-1">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-mono">{agent.hp}/{agent.maxHp}</span>
            </div>
            <div className="w-20 h-1.5 bg-void-light rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${hpPercent > 60 ? 'bg-luxury-green' : hpPercent > 30 ? 'bg-luxury-amber' : 'bg-luxury-rose'}`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* 属性网格 */}
      <div className="px-5 pb-5">
        {/* 主要统计 - 赢率和盈亏 */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gradient-to-br from-luxury-purple/10 to-luxury-cyan/10 rounded-xl p-3 border border-luxury-purple/20">
            <div className="flex items-center gap-1.5 text-white/40 mb-1">
              <Target className="w-3.5 h-3.5 text-luxury-purple" />
              <span className="text-[10px] uppercase tracking-wider">胜率</span>
            </div>
            <p className={`text-xl font-bold font-mono ${agent.winRate >= 60 ? 'text-luxury-green' : agent.winRate >= 40 ? 'text-luxury-amber' : 'text-luxury-rose'}`}>
              {agent.winRate}%
            </p>
            <p className="text-[10px] text-white/30 mt-0.5">{agent.wins}胜 {agent.losses}负</p>
          </div>
          
          <div className="bg-gradient-to-br from-luxury-green/10 to-luxury-cyan/10 rounded-xl p-3 border border-luxury-green/20">
            <div className="flex items-center gap-1.5 text-white/40 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-luxury-green" />
              <span className="text-[10px] uppercase tracking-wider">净利润</span>
            </div>
            <p className={`text-xl font-bold font-mono ${agent.netProfit >= 0 ? 'text-luxury-green' : 'text-luxury-rose'}`}>
              {agent.netProfit >= 0 ? '+' : ''}{agent.netProfit.toLocaleString()}
            </p>
            <p className="text-[10px] text-white/30 mt-0.5">收益: {agent.totalEarnings.toLocaleString()}</p>
          </div>
          
          <div className="bg-gradient-to-br from-luxury-gold/10 to-luxury-amber/10 rounded-xl p-3 border border-luxury-gold/20">
            <div className="flex items-center gap-1.5 text-white/40 mb-1">
              <Trophy className="w-3.5 h-3.5 text-luxury-gold" />
              <span className="text-[10px] uppercase tracking-wider">锦标赛</span>
            </div>
            <p className="text-xl font-bold text-luxury-gold font-mono">{agent.tournamentWins}</p>
            <p className="text-[10px] text-white/30 mt-0.5">前三: {agent.tournamentTop3}次</p>
          </div>
        </div>

        {/* 详细统计 */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-void-light/50 rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-1.5 text-white/40 mb-1">
              <Coins className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-wider">余额</span>
            </div>
            <p className="text-lg font-bold text-luxury-gold font-mono">{agent.balance.toFixed(0)}</p>
          </div>
          
          <div className="bg-void-light/50 rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-1.5 text-white/40 mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-wider">攻击</span>
            </div>
            <p className="text-lg font-bold text-luxury-rose font-mono">{agent.attack}</p>
          </div>
          
          <div className="bg-void-light/50 rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-1.5 text-white/40 mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-wider">防御</span>
            </div>
            <p className="text-lg font-bold text-luxury-cyan font-mono">{agent.defense}</p>
          </div>
          
          <div className="bg-void-light/50 rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-1.5 text-white/40 mb-1">
              <Flame className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-wider">连杀</span>
            </div>
            <p className="text-lg font-bold text-luxury-purple font-mono">{agent.maxKillStreak}</p>
          </div>
        </div>

        {/* 战斗统计 */}
        <div className="bg-void-light/30 rounded-xl p-4 border border-white/5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-luxury-cyan" />
            <span className="text-sm font-medium text-white">战斗统计</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-white/40 text-xs mb-1">总场次</p>
              <p className="text-white font-mono">{agent.totalBattles}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-1">场均伤害</p>
              <p className="text-luxury-rose font-mono">{agent.avgDamageDealt}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-1">场均承伤</p>
              <p className="text-luxury-cyan font-mono">{agent.avgDamageTaken}</p>
            </div>
          </div>
        </div>
        
        {/* 资金操作 */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="number"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                placeholder="输入金额"
                className="w-full bg-void-light border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-luxury-purple focus:outline-none transition-colors"
              />
              <Coins className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleAllocate}
              disabled={!fundAmount || parseFloat(fundAmount) > wallet.balance}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-luxury-green/10 border border-luxury-green/30 rounded-xl text-luxury-green hover:bg-luxury-green/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              充值
            </button>
            <button
              onClick={handleWithdraw}
              disabled={!fundAmount || parseFloat(fundAmount) > agent.balance || agent.status !== 'idle'}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-luxury-amber/10 border border-luxury-amber/30 rounded-xl text-luxury-amber hover:bg-luxury-amber/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Minus className="w-4 h-4" />
              提取
            </button>
          </div>
          
          {/* 竞技场操作 */}
          {agent.status === 'idle' && agent.balance > 0 && (
            <button
              onClick={() => joinArena(agent.id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-luxury-purple to-luxury-cyan rounded-xl text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-luxury-purple/25"
            >
              <LogIn className="w-5 h-5" />
              加入竞技场
            </button>
          )}
          {agent.status === 'in_arena' && (
            <button
              onClick={() => leaveArena(agent.id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-luxury-rose/10 border border-luxury-rose/30 rounded-xl text-luxury-rose hover:bg-luxury-rose/20 transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              退出竞技场
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentCard;
