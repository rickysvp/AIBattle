import React from 'react';
import { motion } from 'framer-motion';
import type { Tournament, TournamentMatch, TournamentRound, Agent } from '../types';

interface TournamentBracketProps {
  tournament: Tournament;
  onMatchClick?: (match: TournamentMatch) => void;
}

const TournamentBracket: React.FC<TournamentBracketProps> = ({ tournament, onMatchClick }) => {
  const { matches, currentRound, qualifiedAgents } = tournament;

  // 获取某一轮的所有比赛
  const getMatchesByRound = (round: TournamentRound) => {
    return matches.filter((m) => m.round === round).sort((a, b) => a.matchIndex - b.matchIndex);
  };

  // 渲染比赛卡片
  const renderMatchCard = (match: TournamentMatch, isCompact: boolean = false) => {
    const isFinished = !!match.winnerId;
    const isCurrentRound = match.round === currentRound;

    return (
      <motion.div
        key={match.id}
        onClick={() => onMatchClick?.(match)}
        className={`relative p-2 rounded-lg border cursor-pointer transition-all ${
          isFinished
            ? 'bg-void-light/30 border-white/10'
            : isCurrentRound
            ? 'bg-luxury-amber/5 border-luxury-amber/30'
            : 'bg-void-light/10 border-white/5'
        } ${isCompact ? 'w-24' : 'w-32'}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Agent A */}
        <div className={`flex items-center gap-1 mb-1 ${match.winnerId === match.agentA?.id ? 'opacity-100' : match.winnerId ? 'opacity-40' : 'opacity-100'}`}>
          {match.agentA ? (
            <>
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: match.agentA.color }}
              />
              <span className={`text-xs truncate ${isCompact ? 'max-w-[60px]' : 'max-w-[80px]'}`}>
                {match.agentA.name}
              </span>
            </>
          ) : (
            <span className="text-xs text-white/30">TBD</span>
          )}
        </div>

        {/* Agent B */}
        <div className={`flex items-center gap-1 ${match.winnerId === match.agentB?.id ? 'opacity-100' : match.winnerId ? 'opacity-40' : 'opacity-100'}`}>
          {match.agentB ? (
            <>
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: match.agentB.color }}
              />
              <span className={`text-xs truncate ${isCompact ? 'max-w-[60px]' : 'max-w-[80px]'}`}>
                {match.agentB.name}
              </span>
            </>
          ) : (
            <span className="text-xs text-white/30">TBD</span>
          )}
        </div>

        {/* 获胜指示器 */}
        {isFinished && (
          <div className="absolute -right-1 -top-1 w-3 h-3 rounded-full bg-luxury-green flex items-center justify-center">
            <span className="text-[8px] text-white">✓</span>
          </div>
        )}
      </motion.div>
    );
  };

  // 渲染128强赛（第一轮）
  const renderRound128 = () => {
    const round128Matches = getMatchesByRound('round128');
    if (round128Matches.length === 0) return null;

    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs text-white/40 mb-2 text-center">128强</span>
        {round128Matches.map((match) => renderMatchCard(match, true))}
      </div>
    );
  };

  // 渲染32强赛
  const renderRound32 = () => {
    const round32Matches = getMatchesByRound('round32');
    if (round32Matches.length === 0) return null;

    return (
      <div className="flex flex-col gap-4">
        <span className="text-xs text-white/40 mb-2 text-center">32强</span>
        {round32Matches.map((match) => renderMatchCard(match))}
      </div>
    );
  };

  // 渲染8强赛
  const renderRound8 = () => {
    const round8Matches = getMatchesByRound('round8');
    if (round8Matches.length === 0) return null;

    return (
      <div className="flex flex-col gap-8">
        <span className="text-xs text-white/40 mb-2 text-center">8强</span>
        {round8Matches.map((match) => renderMatchCard(match))}
      </div>
    );
  };

  // 渲染半决赛
  const renderSemifinal = () => {
    const semifinalMatches = getMatchesByRound('semifinal');
    if (semifinalMatches.length === 0) return null;

    return (
      <div className="flex flex-col gap-16">
        <span className="text-xs text-white/40 mb-2 text-center">半决赛</span>
        {semifinalMatches.map((match) => renderMatchCard(match))}
      </div>
    );
  };

  // 渲染决赛
  const renderFinal = () => {
    const finalMatches = getMatchesByRound('final');
    if (finalMatches.length === 0) return null;

    return (
      <div className="flex flex-col gap-8">
        <span className="text-xs text-white/40 mb-2 text-center">决赛</span>
        {finalMatches.map((match) => (
          <motion.div
            key={match.id}
            onClick={() => onMatchClick?.(match)}
            className="relative p-4 rounded-xl border-2 border-luxury-gold/50 bg-gradient-to-b from-luxury-gold/10 to-transparent cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-center mb-3">
              <span className="text-luxury-gold font-bold">🏆 冠军争夺战</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className={`text-center ${match.winnerId === match.agentA?.id ? 'opacity-100' : match.winnerId ? 'opacity-40' : 'opacity-100'}`}>
                {match.agentA ? (
                  <>
                    <div
                      className="w-12 h-12 rounded-xl mx-auto mb-2"
                      style={{ backgroundColor: match.agentA.color }}
                    />
                    <span className="text-sm font-medium">{match.agentA.name}</span>
                  </>
                ) : (
                  <span className="text-white/30">TBD</span>
                )}
              </div>
              <span className="text-2xl font-bold text-luxury-gold">VS</span>
              <div className={`text-center ${match.winnerId === match.agentB?.id ? 'opacity-100' : match.winnerId ? 'opacity-40' : 'opacity-100'}`}>
                {match.agentB ? (
                  <>
                    <div
                      className="w-12 h-12 rounded-xl mx-auto mb-2"
                      style={{ backgroundColor: match.agentB.color }}
                    />
                    <span className="text-sm font-medium">{match.agentB.name}</span>
                  </>
                ) : (
                  <span className="text-white/30">TBD</span>
                )}
              </div>
            </div>
            {match.winnerId && (
              <div className="mt-3 text-center">
                <span className="text-luxury-green font-bold">
                  🏆 冠军: {match.winnerId === match.agentA?.id ? match.agentA.name : match.agentB?.name}
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  // 渲染连接线
  const renderConnector = (height: string = 'h-8') => (
    <div className={`flex items-center justify-center w-8 ${height}`}>
      <svg className="w-full h-full" viewBox="0 0 32 64">
        <path
          d="M0 32 L16 32 L16 8 L32 8 M16 32 L16 56 L32 56"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
        />
      </svg>
    </div>
  );

  return (
    <div className="card-luxury rounded-2xl p-6 overflow-x-auto">
      <h3 className="text-lg font-semibold text-white mb-6">锦标赛对阵图</h3>
      
      <div className="flex items-center gap-4 min-w-[800px]">
        {/* 128强 */}
        {matches.some((m) => m.round === 'round128') && (
          <>
            {renderRound128()}
            {renderConnector('h-4')}
          </>
        )}

        {/* 32强 */}
        {matches.some((m) => m.round === 'round32') && (
          <>
            {renderRound32()}
            {renderConnector('h-8')}
          </>
        )}

        {/* 8强 */}
        {matches.some((m) => m.round === 'round8') && (
          <>
            {renderRound8()}
            {renderConnector('h-16')}
          </>
        )}

        {/* 半决赛 */}
        {matches.some((m) => m.round === 'semifinal') && (
          <>
            {renderSemifinal()}
            {renderConnector('h-32')}
          </>
        )}

        {/* 决赛 */}
        {renderFinal()}
      </div>

      {/* 图例 */}
      <div className="mt-6 flex items-center gap-6 text-xs text-white/40">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-void-light/30 border border-white/10" />
          <span>已结束</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-luxury-amber/5 border border-luxury-amber/30" />
          <span>进行中</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-void-light/10 border border-white/5" />
          <span>未开始</span>
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;
