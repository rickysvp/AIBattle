import React, { useState } from 'react';
import { Agent, Rarity } from '../types';
import PixelAgent from './PixelAgent';
import AgentDetailModal from './AgentDetailModal';
import { useGameStore } from '../store/gameStore';
import { 
  Zap, 
  Shield, 
  Trophy,
  Target,
  Flame,
  Wind,
  Sparkles,
  Gem,
  Swords,
  TrendingUp,
  Wallet,
  Info,
  LogOut
} from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  compact?: boolean;
  viewMode?: 'card' | 'list';
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

const AgentCard: React.FC<AgentCardProps> = ({ agent, compact = false, viewMode = 'card' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { joinArena, leaveArena } = useGameStore();
  
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
  const rarity = rarityConfig[agent.rarity] || rarityConfig['common'];
  const RarityIcon = rarity?.icon || Sparkles;

  if (compact) {
    return (
      <>
        <div 
          className="card-luxury rounded-xl overflow-hidden cursor-pointer group"
          onClick={() => setIsDetailOpen(true)}
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
                  {agent.image ? (
                    <img 
                      src={agent.image} 
                      alt={agent.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PixelAgent agent={agent} size={36} />
                  )}
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
                  <span className="text-xs text-white/30">#{agent.nftId}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span 
                    className="text-xs font-medium"
                    style={{ color: rarity.color }}
                  >
                    {rarity.name}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${status.bgColor} ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </div>
              
              {/* 详情图标 */}
              <div className="text-white/30 group-hover:text-white/60 transition-colors">
                <Info className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* 详情弹窗 */}
        <AgentDetailModal 
          agent={agent} 
          isOpen={isDetailOpen} 
          onClose={() => setIsDetailOpen(false)} 
        />
      </>
    );
  }

  // 列表视图 - 极简紧凑版 (Updated for user request: Status dot, Combined info)
  if (viewMode === 'list') {
    return (
      <>
        <div 
          className={`flex items-center gap-2 px-2 py-1.5 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all cursor-pointer group ${compact ? 'text-xs' : 'text-sm'}`}
          onClick={() => setIsDetailOpen(true)}
        >
          {/* Agent 头像 */}
          <div className="relative flex-shrink-0">
            <div 
              className="w-8 h-8 rounded-lg overflow-hidden border border-white/10"
              style={{ borderColor: rarity.color }}
            >
              {agent.image ? (
                <img 
                  src={agent.image} 
                  alt={agent.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-black/20 flex items-center justify-center">
                   <PixelAgent agent={agent} size={20} />
                </div>
              )}
            </div>
            {/* 状态小圆点 */}
            <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-black ${
               agent.status === 'in_arena' ? 'bg-green-500' : 
               agent.status === 'fighting' ? 'bg-red-500' : 'bg-gray-500'
            }`} />
          </div>
          
          {/* 名称和稀有度 */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
               <span className="font-medium text-white/90 truncate max-w-[80px]" style={{ color: rarity.color }}>{agent.name}</span>
               <span className="text-[9px] px-1 rounded-sm bg-white/5 text-white/40">#{agent.nftId}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className={agent.balance > 0 ? 'text-luxury-gold' : 'text-red-400'}>
                 ${agent.balance.toFixed(0)}
              </span>
              <span className={`font-mono ${agent.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ({agent.netProfit >= 0 ? '+' : ''}{agent.netProfit})
              </span>
            </div>
          </div>

          {/* 状态文字 (替代盈亏列) */}
          {/* <div className="text-right mr-1"> ... </div>  Removed separate profit column, moved to subtext */}
          
          {/* 极简操作按钮 */}
          <div className="flex items-center gap-1">
            {agent.status === 'idle' && (
               <button
                  onClick={(e) => { e.stopPropagation(); joinArena(agent.id); }}
                  className="p-1.5 rounded-md bg-white/5 hover:bg-green-500/20 text-white/40 hover:text-green-400 transition-colors"
                  title="加入"
               >
                 <Swords className="w-3.5 h-3.5" />
               </button>
            )}
            {agent.status === 'in_arena' && (
               <button
                  onClick={(e) => { e.stopPropagation(); leaveArena(agent.id); }}
                  className="p-1.5 rounded-md bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                  title="退出"
               >
                 <LogOut className="w-3.5 h-3.5" />
               </button>
            )}
            {/* 状态文本提示 */}
            {agent.status === 'fighting' && <span className="text-[10px] text-red-400">Fighting</span>}
            {agent.status === 'dead' && <span className="text-[10px] text-gray-500">Dead</span>}
          </div>
        </div>

        {/* 详情弹窗 */}
        <AgentDetailModal 
          agent={agent} 
          isOpen={isDetailOpen} 
          onClose={() => setIsDetailOpen(false)} 
        />
      </>
    );
  }

  return (
    <>
      <div 
        className="card-luxury rounded-2xl overflow-hidden group cursor-pointer"
        onClick={() => setIsDetailOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          borderColor: isHovered ? rarity.color : undefined,
          borderWidth: isHovered ? '2px' : '1px',
        }}
      >
        {/* 头部 - 稀有度 + NFT编号 */}
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
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/30">
              #{agent.nftId}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${status.bgColor} ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Agent信息 */}
        <div className="p-4">
          {/* 头部：头像 + 名称/编号 + 核心数据 */}
          <div className="flex items-start gap-3 mb-4">
            {/* Agent 头像 */}
            <div className="relative flex-shrink-0">
              <div 
                className="absolute inset-0 blur-xl rounded-full transition-all duration-300"
                style={{ 
                  backgroundColor: rarity.color,
                  opacity: isHovered ? 0.6 : 0.3,
                  transform: isHovered ? 'scale(1.2)' : 'scale(1)'
                }}
              />
              <div 
                className="relative w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden"
                style={{ 
                  background: `linear-gradient(135deg, ${rarity.color}30, ${rarity.color}50)`,
                  border: `2px solid ${rarity.color}`
                }}
              >
                {agent.image ? (
                  <img 
                    src={agent.image} 
                    alt={agent.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('[AgentCard] Image failed to load:', agent.image);
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.querySelector('.pixel-fallback')?.classList.remove('hidden');
                    }}
                  />
                ) : (
                  <PixelAgent agent={agent} size={40} />
                )}
                {/* 图片加载失败时的备用显示 */}
                <div className="pixel-fallback hidden absolute inset-0 flex items-center justify-center">
                  <PixelAgent agent={agent} size={40} />
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              {/* 名称和编号 */}
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-base font-bold text-white truncate">{agent.name}</h4>
                <span className="text-xs text-white/40 font-mono">#{agent.nftId}</span>
              </div>
              
              {/* 余额和盈亏 - 突出显示 */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-luxury-gold/10 rounded-lg border border-luxury-gold/20" title="钱包余额">
                  <Wallet className="w-3.5 h-3.5 text-luxury-gold" />
                  <span className="text-sm font-mono font-bold text-luxury-gold">{agent.balance.toFixed(0)}</span>
                  <span className="text-xs text-luxury-gold/60">MON</span>
                </div>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${agent.netProfit >= 0 ? 'bg-luxury-green/10 border-luxury-green/20' : 'bg-luxury-rose/10 border-luxury-rose/20'}`} title="累计盈亏">
                  <TrendingUp className={`w-3.5 h-3.5 ${agent.netProfit >= 0 ? 'text-luxury-green' : 'text-luxury-rose'}`} />
                  <span className={`text-sm font-mono font-bold ${agent.netProfit >= 0 ? 'text-luxury-green' : 'text-luxury-rose'}`}>
                    {agent.netProfit >= 0 ? '+' : ''}{agent.netProfit.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 关键战绩数据 - 网格布局更突出 */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-void-light/30 rounded-xl p-2.5 text-center border border-white/5 hover:border-luxury-cyan/30 transition-colors" title="参与场数">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Swords className="w-3.5 h-3.5 text-luxury-cyan" />
                <span className="text-xs text-white/50">场数</span>
              </div>
              <span className="text-lg font-mono font-bold text-white">{agent.totalBattles}</span>
            </div>
            <div className="bg-void-light/30 rounded-xl p-2.5 text-center border border-white/5 hover:border-luxury-amber/30 transition-colors" title="胜率">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className={`w-3.5 h-3.5 ${agent.winRate >= 60 ? 'text-luxury-green' : agent.winRate >= 40 ? 'text-luxury-amber' : 'text-luxury-rose'}`} />
                <span className="text-xs text-white/50">胜率</span>
              </div>
              <span className={`text-lg font-mono font-bold ${agent.winRate >= 60 ? 'text-luxury-green' : agent.winRate >= 40 ? 'text-luxury-amber' : 'text-luxury-rose'}`}>
                {agent.winRate}%
              </span>
            </div>
            <div className="bg-void-light/30 rounded-xl p-2.5 text-center border border-white/5 hover:border-luxury-gold/30 transition-colors" title="锦标赛冠军">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="w-3.5 h-3.5 text-luxury-gold" />
                <span className="text-xs text-white/50">冠军</span>
              </div>
              <span className="text-lg font-mono font-bold text-luxury-gold">{agent.tournamentWins}</span>
            </div>
          </div>

          {/* 属性展示 - 更紧凑 */}
          <div className="bg-void-light/10 rounded-xl p-2.5">
            <div className="grid grid-cols-5 gap-1">
              <div className="text-center" title="攻击">
                <Zap className="w-3.5 h-3.5 mx-auto text-luxury-rose mb-0.5" />
                <p className="text-xs font-mono text-luxury-rose">{agent.attack}</p>
              </div>
              <div className="text-center" title="防御">
                <Shield className="w-3.5 h-3.5 mx-auto text-luxury-cyan mb-0.5" />
                <p className="text-xs font-mono text-luxury-cyan">{agent.defense}</p>
              </div>
              <div className="text-center" title="暴击率">
                <Flame className="w-3.5 h-3.5 mx-auto text-luxury-amber mb-0.5" />
                <p className="text-xs font-mono text-luxury-amber">{agent.critRate}</p>
              </div>
              <div className="text-center" title="速度">
                <Wind className="w-3.5 h-3.5 mx-auto text-luxury-green mb-0.5" />
                <p className="text-xs font-mono text-luxury-green">{agent.speed}</p>
              </div>
              <div className="text-center" title="幸运">
                <Sparkles className="w-3.5 h-3.5 mx-auto text-luxury-purple mb-0.5" />
                <p className="text-xs font-mono text-luxury-purple">{agent.luck}</p>
              </div>
            </div>
          </div>
          
          {/* 操作提示 */}
          <div className="flex items-center justify-center gap-2 text-white/30 text-xs">
            <Info className="w-3 h-3" />
            <span>点击查看详情</span>
          </div>
        </div>
      </div>

      {/* 详情弹窗 */}
      <AgentDetailModal 
        agent={agent} 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
      />
    </>
  );
};

export default AgentCard;
