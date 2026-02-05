import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Tournament as TournamentType } from '../types';
import { Trophy, Clock, Users, Wallet, ChevronRight, Star, Zap } from 'lucide-react';

const Tournament: React.FC = () => {
  const { tournaments, wallet } = useGameStore();
  
  const getStatusConfig = (status: TournamentType['status']) => {
    switch (status) {
      case 'ongoing':
        return { 
          label: '进行中', 
          color: 'text-luxury-green',
          bgColor: 'bg-luxury-green/10',
          borderColor: 'border-luxury-green/20',
          badge: 'bg-luxury-green'
        };
      case 'upcoming':
        return { 
          label: '即将开始', 
          color: 'text-luxury-cyan',
          bgColor: 'bg-luxury-cyan/10',
          borderColor: 'border-luxury-cyan/20',
          badge: 'bg-luxury-cyan'
        };
      case 'finished':
        return { 
          label: '已结束', 
          color: 'text-white/40',
          bgColor: 'bg-white/5',
          borderColor: 'border-white/10',
          badge: 'bg-white/20'
        };
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
  
  const getTimeRemaining = (timestamp: number) => {
    const diff = timestamp - Date.now();
    if (diff <= 0) return '已开始';
    
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    
    if (hours > 0) return `${hours}小时${minutes}分钟后`;
    return `${minutes}分钟后`;
  };

  return (
    <div className="min-h-screen bg-void pt-24 pb-24">
      <div className="max-w-screen-xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-luxury-gold/20 to-luxury-amber/20 border border-luxury-gold/30 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-luxury-gold" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-display">锦标赛</h1>
              <p className="text-white/40">参加锦标赛，赢取丰厚奖励</p>
            </div>
          </div>
        </div>
        
        {/* 赛事统计 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card-luxury rounded-2xl p-5 text-center">
            <div className="w-12 h-12 rounded-xl bg-luxury-green/10 border border-luxury-green/20 flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-luxury-green" />
            </div>
            <p className="text-3xl font-bold text-luxury-green font-display mb-1">
              {tournaments.filter(t => t.status === 'ongoing').length}
            </p>
            <p className="text-xs text-white/40 uppercase tracking-wider">进行中</p>
          </div>
          
          <div className="card-luxury rounded-2xl p-5 text-center">
            <div className="w-12 h-12 rounded-xl bg-luxury-cyan/10 border border-luxury-cyan/20 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-luxury-cyan" />
            </div>
            <p className="text-3xl font-bold text-luxury-cyan font-display mb-1">
              {tournaments.filter(t => t.status === 'upcoming').length}
            </p>
            <p className="text-xs text-white/40 uppercase tracking-wider">即将开始</p>
          </div>
          
          <div className="card-luxury rounded-2xl p-5 text-center">
            <div className="w-12 h-12 rounded-xl bg-luxury-gold/10 border border-luxury-gold/20 flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-luxury-gold" />
            </div>
            <p className="text-3xl font-bold text-luxury-gold font-display mb-1">
              {tournaments.reduce((sum, t) => sum + t.prizePool, 0).toLocaleString()}
            </p>
            <p className="text-xs text-white/40 uppercase tracking-wider">总奖池</p>
          </div>
        </div>
        
        {/* 赛事列表 */}
        <div className="space-y-5">
          {tournaments.map(tournament => {
            const status = getStatusConfig(tournament.status);
            const progress = (tournament.participants / tournament.maxParticipants) * 100;
            
            return (
              <div 
                key={tournament.id}
                className="card-luxury rounded-2xl overflow-hidden group"
              >
                {/* 赛事头部 */}
                <div className="px-6 py-5 border-b border-white/5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${status.bgColor} ${status.borderColor} border flex items-center justify-center`}>
                        <Trophy className={`w-6 h-6 ${status.color}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">{tournament.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-white/40">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(tournament.startTime)}
                          </span>
                          {tournament.status === 'upcoming' && (
                            <span className="text-luxury-cyan">{getTimeRemaining(tournament.startTime)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${status.bgColor} ${status.color} ${status.borderColor} border`}>
                      {status.label}
                    </span>
                  </div>
                </div>
                
                {/* 赛事信息 */}
                <div className="px-6 py-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-5">
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider mb-2">奖池</p>
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-luxury-gold" />
                        <p className="text-2xl font-bold text-luxury-gold font-mono">{tournament.prizePool.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider mb-2">参赛人数</p>
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-luxury-purple" />
                        <p className="text-2xl font-bold text-white font-mono">
                          {tournament.participants}
                          <span className="text-base text-white/40 font-normal">/{tournament.maxParticipants}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider mb-2">报名费</p>
                      <div className="flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-luxury-cyan" />
                        <p className="text-2xl font-bold text-luxury-cyan font-mono">{tournament.entryFee}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-end">
                      {tournament.status === 'upcoming' && (
                        <button
                          disabled={!wallet.connected}
                          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-luxury-purple to-luxury-cyan rounded-xl text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-luxury-purple/20"
                        >
                          报名参赛
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                      {tournament.status === 'ongoing' && (
                        <button
                          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-luxury-green/10 border border-luxury-green/30 rounded-xl text-luxury-green font-semibold hover:bg-luxury-green/20 transition-colors"
                        >
                          查看详情
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                      {tournament.status === 'finished' && (
                        <button
                          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-void-light border border-white/10 rounded-xl text-white/60 font-semibold hover:text-white hover:border-white/20 transition-colors"
                        >
                          查看结果
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* 进度条 */}
                  {tournament.status !== 'finished' && (
                    <div>
                      <div className="h-2 bg-void-light rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-luxury-purple to-luxury-cyan transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-xs text-white/40">报名进度</span>
                        <span className="text-xs text-luxury-cyan font-mono">{progress.toFixed(0)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* 空状态 */}
        {tournaments.length === 0 && (
          <div className="card-luxury rounded-2xl p-16 text-center">
            <div className="w-24 h-24 rounded-3xl bg-void-light/50 border border-white/5 flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-12 h-12 text-white/20" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">暂无锦标赛</h2>
            <p className="text-white/40">敬请期待更多精彩赛事</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tournament;
