import React, { useState } from 'react';
import { Agent, Rarity } from '../types';
import { useGameStore } from '../store/gameStore';
import PixelAgent from './PixelAgent';
import { 
  Zap, 
  Shield, 
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
  Crosshair,
  Wind,
  Sparkles,
  Gem,
  Swords,
  TrendingUp,
  Wallet
} from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  compact?: boolean;
}

// 稀有度配置
const rarityConfig: Record<Rarity, { name: string; color: string; bgColor: string; borderColor: string; icon: React.ElementType }> = {
  common: { 
    name: '普通', 
    color: '#9ca3af', 
    bgColor: 'bg-gray-500/10', 
    borderColor: 'border-gray-500/30',
    icon: Sparkles
  },
  rare: { 
    name: '稀有', 
    color: '#3b82f6', 
    bgColor: 'bg-blue-500/10', 
    borderColor: 'border-blue-500/30',
    icon: Gem
  },
  epic: { 
    name: '史诗', 
    color: '#a855f7', 
    bgColor: 'bg-purple-500/10', 
    borderColor: 'border-purple-500/30',
    icon: Zap
  },
  legendary: { 
    name: '传说', 
    color: '#f59e0b', 
    bgColor: 'bg-amber-500/10', 
    borderColor: 'border-amber-500/30',
    icon: Trophy
  },
  mythic: { 
    name: '神话', 
    color: '#ef4444', 
    bgColor: 'bg-red-500/10', 
    borderColor: 'border-red-500/30',
    icon: Flame
  },
};

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
        };
      case 'in_arena': 
        return { 
          label: '待战', 
          color: 'text-luxury-gold',
          bgColor: 'bg-luxury-gold/10',
          borderColor: 'border-luxury-gold/30',
        };
      case 'fighting': 
        return { 
          label: '战斗中', 
          color: 'text-luxury-rose',
          bgColor: 'bg-luxury-rose/10',
          borderColor: 'border-luxury-rose/30',
        };
      case 'dead': 
        return { 
          label: '阵亡', 
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/30',
        };
      default: 
        return { 
          label: '未知', 
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          borderColor: 'border-gray-400/30',
        };
    }
  };
  
  const status = getStatusConfig();
  const rarity = rarityConfig[agent.rarity];
  const RarityIcon = rarity.icon;

  if (compact) {
    return (
      <div 
        className="card-luxury rounded-xl overflow-hidden cursor-pointer group"
        onClick={() => setShowActions(!showActions)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-3">
          <div className="flex items-center gap-3">
            {/* Agent 头像 */}
            <div className="relative">
              <div 
                className="absolute inset-0 blur-lg rounded-full transition-opacity duration-300"
                style={{ 
                  backgroundColor: rarity.color,
                  opacity: isHovered ? 0.5 : 0.3 
                }}
              />
              <div 
                className="relative w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
                style={{ 
                  background: `linear-gradient(135deg, ${rarity.color}20, ${rarity.color}40)`,
                  border: `2px solid ${rarity.color}`
                }}
              >
                <PixelAgent agent={agent} size={36} />
              </div>
              
              {/* 稀有度指示器 */}
              <div 
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: rarity.color }}
              >
                <RarityIcon className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            
            {/* 信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-white truncate">{agent.name}</h4>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span 
                  className="text-xs font-medium"
                  style={{ color: rarity.color }}
                >
                  {rarity.name}
                </span>
                <span className="text-xs text-white/30">
                  {agent.totalStats}pts
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${status.bgColor} ${status.color}`}>
                  {status.label}
                </span>
              </div>
            </div>
            
            {/* 展开图标 */}
            <div className="text-white/30 group-hover:text-white/60 transition-colors">
              {showActions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
          
          {/* 快捷操作 */}
          {showActions && (
            <div className="mt-3 pt-3 border-t border-white/5 space-y-2 animate-slide-up">
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
              {agent.status === 'idle' && agent.balance > 0 && (
                <button
                  onClick={() => joinArena(agent.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-luxury-purple/20 to-luxury-cyan/20 border border-luxury-purple/30 rounded-lg text-white text-sm hover:from-luxury-purple/30 hover:to-luxury-cyan/30 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  加入竞技场
                </button>
              )}
              {agent.status === 'in_arena' && (
                <button
                  onClick={() => leaveArena(agent.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-luxury-rose/10 border border-luxury-rose/30 rounded-lg text-luxury-rose text-sm hover:bg-luxury-rose/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  退出
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="card-luxury rounded-2xl overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderColor: isHovered ? rarity.color : undefined,
        borderWidth: isHovered ? '2px' : '1px',
      }}
    >
      {/* 头部 - 稀有度 */}
      <div 
        className="px-4 py-1.5 flex items-center justify-between"
        style={{ 
          background: `linear-gradient(90deg, ${rarity.color}20, ${rarity.color}05)`,
        }}
      >
        <div className="flex items-center gap-1.5">
          <RarityIcon className="w-3.5 h-3.5" style={{ color: rarity.color }} />
          <span className="text-xs font-medium" style={{ color: rarity.color }}>
            {rarity.name}
          </span>
          <span className="text-xs text-white/30">
            {agent.totalStats}pts
          </span>
        </div>
        <span className={`text-xs px-1.5 py-0.5 rounded ${status.bgColor} ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Agent信息 */}
      <div className="p-4">
        <div className="flex items-center gap-4 mb-4">
          {/* Agent 头像 */}
          <div className="relative">
            <div 
              className="absolute inset-0 blur-xl rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: rarity.color,
                opacity: isHovered ? 0.6 : 0.3,
                transform: isHovered ? 'scale(1.2)' : 'scale(1)'
              }}
            />
            <div 
              className="relative w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden"
              style={{ 
                background: `linear-gradient(135deg, ${rarity.color}30, ${rarity.color}50)`,
                border: `2px solid ${rarity.color}`
              }}
            >
              <PixelAgent agent={agent} size={44} />
            </div>
          </div>
          
          <div className="flex-1">
            <h4 className="text-lg font-bold text-white">{agent.name}</h4>
            
            {/* 核心数据 - 图标化 */}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1" title="余额">
                <Wallet className="w-3.5 h-3.5 text-luxury-gold" />
                <span className="text-sm font-mono text-white">{agent.balance.toFixed(0)}</span>
              </div>
              <div className="flex items-center gap-1" title="利润">
                <TrendingUp className={`w-3.5 h-3.5 ${agent.netProfit >= 0 ? 'text-luxury-green' : 'text-luxury-rose'}`} />
                <span className={`text-sm font-mono ${agent.netProfit >= 0 ? 'text-luxury-green' : 'text-luxury-rose'}`}>
                  {agent.netProfit >= 0 ? '+' : ''}{agent.netProfit.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1" title="胜率">
                <Target className={`w-3.5 h-3.5 ${agent.winRate >= 60 ? 'text-luxury-green' : agent.winRate >= 40 ? 'text-luxury-amber' : 'text-luxury-rose'}`} />
                <span className={`text-sm font-mono ${agent.winRate >= 60 ? 'text-luxury-green' : agent.winRate >= 40 ? 'text-luxury-amber' : 'text-luxury-rose'}`}>
                  {agent.winRate}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 战斗统计 - 简化 */}
        <div className="flex items-center justify-between bg-void-light/20 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-1.5" title="总场次">
            <Swords className="w-4 h-4 text-luxury-cyan" />
            <span className="text-sm font-mono text-white">{agent.totalBattles}</span>
          </div>
          <div className="flex items-center gap-1.5" title="锦标赛冠军">
            <Trophy className="w-4 h-4 text-luxury-gold" />
            <span className="text-sm font-mono text-luxury-gold">{agent.tournamentWins}</span>
          </div>
          <div className="flex items-center gap-1.5" title="击杀">
            <Skull className="w-4 h-4 text-luxury-rose" />
            <span className="text-sm font-mono text-luxury-rose">{agent.kills}</span>
          </div>
        </div>

        {/* 属性展示 - 紧凑 */}
        <div className="bg-void-light/10 rounded-xl p-3 mb-4">
          <div className="grid grid-cols-5 gap-2">
            <div className="text-center" title="攻击">
              <Zap className="w-4 h-4 mx-auto text-luxury-rose mb-1" />
              <p className="text-xs font-mono text-luxury-rose">{agent.attack}</p>
            </div>
            <div className="text-center" title="防御">
              <Shield className="w-4 h-4 mx-auto text-luxury-cyan mb-1" />
              <p className="text-xs font-mono text-luxury-cyan">{agent.defense}</p>
            </div>
            <div className="text-center" title="暴击">
              <Flame className="w-4 h-4 mx-auto text-luxury-amber mb-1" />
              <p className="text-xs font-mono text-luxury-amber">{agent.crit}</p>
            </div>
            <div className="text-center" title="命中">
              <Crosshair className="w-4 h-4 mx-auto text-luxury-purple mb-1" />
              <p className="text-xs font-mono text-luxury-purple">{agent.hit}</p>
            </div>
            <div className="text-center" title="敏捷">
              <Wind className="w-4 h-4 mx-auto text-luxury-green mb-1" />
              <p className="text-xs font-mono text-luxury-green">{agent.agility}</p>
            </div>
          </div>
        </div>
        
        {/* 资金操作 - 简化 */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="number"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              placeholder="金额"
              className="flex-1 bg-void-light border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-luxury-purple focus:outline-none transition-colors"
            />
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
          {agent.status === 'idle' && agent.balance > 0 && (
            <button
              onClick={() => joinArena(agent.id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ 
                background: `linear-gradient(90deg, ${rarity.color}, ${rarity.color}dd)`,
              }}
            >
              <LogIn className="w-4 h-4" />
              加入竞技场
            </button>
          )}
          {agent.status === 'in_arena' && (
            <button
              onClick={() => leaveArena(agent.id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-luxury-rose/10 border border-luxury-rose/30 rounded-lg text-luxury-rose text-sm font-medium hover:bg-luxury-rose/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              退出竞技场
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentCard;
