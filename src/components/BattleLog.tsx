import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BattleLog as BattleLogType } from '../types';
import {
  Swords,
  Skull,
  Flame,
  Play,
  Flag,
  UserPlus,
  UserMinus,
  Clock,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BattleLogProps {
  logs: BattleLogType[];
  maxHeight?: string;
  isOverlay?: boolean;
}

const BattleLog: React.FC<BattleLogProps> = ({ logs, maxHeight = '300px', isOverlay = false }) => {
  const { t, i18n } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (scrollRef.current && isExpanded) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs.length, isExpanded]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const locale = i18n.language === 'zh-CN' ? 'zh-CN' : 'en-US';
    return date.toLocaleTimeString(locale, {
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

  if (isOverlay) {
    return (
      <div className="absolute bottom-4 left-4 right-4 z-40 flex flex-col items-center">
        <div className="w-full max-w-lg bg-black/60 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl transition-all duration-300">
          {/* Header / Toggle */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between px-4 py-2 bg-white/5 hover:bg-white/10 transition-colors border-b border-white/5"
          >
            <div className="flex items-center gap-2">
              <Swords className="w-4 h-4 text-luxury-gold" />
              <span className="text-xs font-bold text-white/80 tracking-wider">BATTLE LOG</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-white/40" />
            ) : (
              <ChevronUp className="w-4 h-4 text-white/40" />
            )}
          </button>

          {/* Logs */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  ref={scrollRef}
                  className="overflow-y-auto p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                  style={{ maxHeight: '160px' }}
                >
                  {logs.length === 0 ? (
                    <div className="py-4 text-center text-xs text-white/30">
                      {t('battleLog.noLogs')}
                    </div>
                  ) : (
                    logs.map((log) => {
                      const config = getLogConfig(log.type);
                      const Icon = config.icon;
                      return (
                        <div
                          key={log.id}
                          className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                            log.isHighlight
                              ? 'bg-luxury-gold/10 border border-luxury-gold/10'
                              : 'hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${config.color}`} />
                          <div className="flex-1 min-w-0">
                            <span className={`${log.isHighlight ? 'text-luxury-gold' : 'text-white/80'}`}>
                              {log.message}
                            </span>
                          </div>
                          <span className="text-[10px] text-white/20 font-mono whitespace-nowrap mt-0.5">
                            {formatTime(log.timestamp).split(' ')[0]}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Fallback to original layout if not overlay
  return (
    <div className="card-luxury rounded-2xl overflow-hidden font-apple">
      {/* ... original implementation ... */}
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
            <p className="text-sm text-white/40">{t('battleLog.noLogs')}</p>
            <p className="text-xs text-white/20 mt-1">{t('battleLog.logsWillAppear')}</p>
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
                  <p className={`text-sm ${log.isHighlight ? 'text-luxury-gold' : 'text-white/80'} leading-relaxed tracking-tight`}>
                    {log.message}
                  </p>
                  {log.damage && (
                    <span className="inline-flex items-center gap-1 mt-1 text-xs text-luxury-rose font-mono">
                      <Flame className="w-3 h-3" />
                      -{log.damage} {t('battleLog.damage')}
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