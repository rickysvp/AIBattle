import React, { useRef, useEffect } from 'react';
import { BattleLog as BattleLogType } from '../types';
import { 
  Swords, 
  Skull, 
  Flame, 
  Play, 
  Flag, 
  UserPlus, 
  UserMinus,
  Clock
} from 'lucide-react';

interface BattleLogProps {
  logs: BattleLogType[];
  title: string;
  maxHeight?: string;
}

const BattleLog: React.FC<BattleLogProps> = ({ logs, title, maxHeight = '300px' }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs.length]);
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };
  
  const getLogConfig = (type: string) => {
    switch (type) {
      case 'attack': 
        return { 
          icon: Swords, 
          color: 'text-luxury-amber',
          bgColor: 'bg-luxury-amber/10',
          borderColor: 'border-luxury-amber/20'
        };
      case 'kill': 
        return { 
          icon: Skull, 
          color: 'text-luxury-rose',
          bgColor: 'bg-luxury-rose/10',
          borderColor: 'border-luxury-rose/20'
        };
      case 'damage': 
        return { 
          icon: Flame, 
          color: 'text-orange-400',
          bgColor: 'bg-orange-400/10',
          borderColor: 'border-orange-400/20'
        };
      case 'round_start': 
        return { 
          icon: Play, 
          color: 'text-luxury-cyan',
          bgColor: 'bg-luxury-cyan/10',
          borderColor: 'border-luxury-cyan/20'
        };
      case 'round_end': 
        return { 
          icon: Flag, 
          color: 'text-luxury-purple',
          bgColor: 'bg-luxury-purple/10',
          borderColor: 'border-luxury-purple/20'
        };
      case 'join': 
        return { 
          icon: UserPlus, 
          color: 'text-luxury-green',
          bgColor: 'bg-luxury-green/10',
          borderColor: 'border-luxury-green/20'
        };
      case 'leave': 
        return { 
          icon: UserMinus, 
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          borderColor: 'border-gray-400/20'
        };
      default: 
        return { 
          icon: Swords, 
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          borderColor: 'border-gray-400/20'
        };
    }
  };

  return (
    <div className="card-luxury rounded-2xl overflow-hidden">
      {/* 标题栏 */}
      <div className="px-5 py-4 border-b border-white/5 bg-gradient-to-r from-void-panel/50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-luxury-purple/20 to-luxury-cyan/20 border border-luxury-purple/30 flex items-center justify-center">
            <Clock className="w-4 h-4 text-luxury-purple-light" />
          </div>
          <h3 className="text-sm font-semibold text-white tracking-wide">{title}</h3>
          <div className="flex-1" />
          <span className="text-xs text-white/30 font-mono">{logs.length} 条记录</span>
        </div>
      </div>
      
      {/* 日志列表 */}
      <div 
        ref={scrollRef}
        className="overflow-y-auto p-3 space-y-2"
        style={{ maxHeight }}
      >
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-void-light/50 border border-white/5 flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-sm text-white/40">暂无战斗记录</p>
            <p className="text-xs text-white/20 mt-1">战斗记录将在这里显示</p>
          </div>
        ) : (
          logs.map((log, index) => {
            const config = getLogConfig(log.type);
            const Icon = config.icon;
            
            return (
              <div 
                key={log.id}
                className={`group flex items-start gap-3 p-3 rounded-xl transition-all duration-300 ${
                  log.isHighlight 
                    ? 'bg-gradient-to-r from-luxury-gold/10 to-transparent border border-luxury-gold/20' 
                    : 'bg-void-light/30 hover:bg-void-light/50 border border-transparent hover:border-white/5'
                }`}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                {/* 图标 */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${config.bgColor} border ${config.borderColor} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                
                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${log.isHighlight ? 'text-luxury-gold' : 'text-white/80'} leading-relaxed`}>
                    {log.message}
                  </p>
                  {log.damage && (
                    <span className="inline-flex items-center gap-1 mt-1 text-xs text-luxury-rose font-mono">
                      <Flame className="w-3 h-3" />
                      -{log.damage} 伤害
                    </span>
                  )}
                </div>
                
                {/* 时间戳 */}
                <span className="flex-shrink-0 text-[10px] text-white/30 font-mono">
                  {formatTime(log.timestamp)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BattleLog;
