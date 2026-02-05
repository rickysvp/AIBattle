import React, { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import ArenaCanvas from '../components/ArenaCanvas';
import BattleLog from '../components/BattleLog';
import AgentCard from '../components/AgentCard';
import { Agent } from '../types';
import { Swords, Users, Trophy, Zap, TrendingUp } from 'lucide-react';

const Arena: React.FC = () => {
  const { 
    arena, 
    myAgents, 
    systemAgents,
    wallet,
    initializeArena, 
    startNewRound, 
    setArenaPhase,
    addBattleLog,
    updateParticipant,
    setTop3,
    myBattleLogs,
  } = useGameStore();
  
  const battleTimerRef = useRef<NodeJS.Timeout>();
  const roundTimerRef = useRef<NodeJS.Timeout>();
  
  // 初始化竞技场
  useEffect(() => {
    if (systemAgents.length === 0) {
      initializeArena();
    }
  }, [initializeArena, systemAgents.length]);
  
  // 自动开始战斗循环
  useEffect(() => {
    if (systemAgents.length === 0) return;
    
    const runBattleLoop = async () => {
      // 开始新一轮
      startNewRound();
      
      // 选择参赛者阶段 (3秒)
      setArenaPhase('selecting');
      
      // 随机选择10个参赛者
      const availableAgents: Agent[] = [
        ...myAgents.filter(a => a.status === 'in_arena'),
        ...systemAgents.filter(a => a.status === 'in_arena' && a.hp > 0),
      ];
      
      // 随机打乱并选择10个
      const shuffled = [...availableAgents].sort(() => Math.random() - 0.5);
      const participants = shuffled.slice(0, 10);
      
      // 重置参赛者HP
      participants.forEach(p => {
        updateParticipant(p.id, { hp: p.maxHp, status: 'fighting' });
      });
      
      // 更新竞技场参赛者
      useGameStore.setState(state => ({
        arena: { ...state.arena, participants }
      }));
      
      addBattleLog({
        type: 'round_start',
        message: `第 ${arena.roundNumber + 1} 轮开始！${participants.length} 名选手参战`,
        isHighlight: true,
      });
      
      // 逐个点亮坑位 (3秒)
      for (let i = 0; i < participants.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
        useGameStore.setState(state => ({
          arena: { ...state.arena, selectedSlots: [...state.arena.selectedSlots, i] }
        }));
      }
      
      // 倒计时阶段 (3秒)
      setArenaPhase('countdown');
      for (let i = 3; i > 0; i--) {
        useGameStore.setState(state => ({
          arena: { ...state.arena, countdown: i }
        }));
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // 战斗阶段 (10秒)
      setArenaPhase('fighting');
      useGameStore.setState(state => ({
        arena: { ...state.arena, countdown: 10 }
      }));
      
      // 战斗倒计时
      for (let i = 10; i > 0; i--) {
        useGameStore.setState(state => ({
          arena: { ...state.arena, countdown: i }
        }));
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // 结算阶段
      setArenaPhase('settlement');
      
      // 计算结果
      const currentParticipants = useGameStore.getState().arena.participants;
      const results = currentParticipants.map(p => {
        const originalAgent = [...myAgents, ...systemAgents].find(a => a.id === p.id);
        const survived = p.hp > 0;
        const profit = survived ? Math.floor(Math.random() * 100) : -Math.floor(Math.random() * 50);
        return { agent: p, profit, survived };
      });
      
      // 排序获取TOP3
      const top3 = results
        .filter(r => r.survived)
        .sort((a, b) => b.profit - a.profit)
        .slice(0, 3);
      
      setTop3(top3);
      
      addBattleLog({
        type: 'round_end',
        message: `第 ${arena.roundNumber + 1} 轮结束！冠军: ${top3[0]?.agent.name || '无'}`,
        isHighlight: true,
      });
      
      // 重置参赛者状态
      currentParticipants.forEach(p => {
        const newStatus = p.hp > 0 ? 'in_arena' : 'dead';
        updateParticipant(p.id, { status: newStatus, hp: p.maxHp });
      });
      
      // 等待5秒后开始下一轮
      setArenaPhase('waiting');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // 继续下一轮
      runBattleLoop();
    };
    
    // 启动战斗循环
    const timer = setTimeout(runBattleLoop, 2000);
    
    return () => {
      clearTimeout(timer);
      if (battleTimerRef.current) clearTimeout(battleTimerRef.current);
      if (roundTimerRef.current) clearTimeout(roundTimerRef.current);
    };
  }, [systemAgents.length]);
  
  // 我的在竞技场的 Agents
  const myArenaAgents = myAgents.filter(a => a.status === 'in_arena' || a.status === 'fighting');
  const myIdleAgents = myAgents.filter(a => a.status === 'idle');

  return (
    <div className="min-h-screen bg-void pt-24 pb-24">
      <div className="max-w-screen-xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-luxury-rose/20 to-luxury-purple/20 border border-luxury-rose/30 flex items-center justify-center">
              <Swords className="w-6 h-6 text-luxury-rose" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-display">竞技场</h1>
              <p className="text-white/40">观看 AI Agents 实时战斗，赢取丰厚奖励</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* 左侧：竞技场 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 战斗画面 */}
            <div className="card-luxury rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-luxury-purple/20 to-luxury-cyan/20 border border-luxury-purple/30 flex items-center justify-center">
                    <Swords className="w-5 h-5 text-luxury-purple-light" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">战斗舞台</h2>
                    <p className="text-xs text-white/40">实时战斗画面</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-luxury-green/10 border border-luxury-green/20">
                    <Users className="w-4 h-4 text-luxury-green" />
                    <span className="text-sm text-luxury-green font-mono">
                      {systemAgents.filter(a => a.status === 'in_arena').length + myArenaAgents.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-luxury-cyan/10 border border-luxury-cyan/20">
                    <TrendingUp className="w-4 h-4 text-luxury-cyan" />
                    <span className="text-sm text-luxury-cyan font-mono">#{arena.roundNumber}</span>
                  </div>
                </div>
              </div>
              <div className="aspect-video p-4">
                <ArenaCanvas 
                  participants={arena.participants}
                  phase={arena.phase}
                  countdown={arena.countdown}
                  selectedSlots={arena.selectedSlots}
                />
              </div>
            </div>
            
            {/* TOP3 结算 */}
            {arena.phase === 'settlement' && arena.top3.length > 0 && (
              <div className="card-luxury rounded-2xl overflow-hidden border-luxury-gold/30">
                <div className="px-6 py-4 border-b border-white/5 bg-gradient-to-r from-luxury-gold/10 to-transparent">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-luxury-gold" />
                    <h3 className="text-lg font-semibold text-luxury-gold">本轮 TOP3</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-center gap-8">
                    {arena.top3.map((item, index) => (
                      <div key={item.agent.id} className="text-center">
                        <div className="relative mb-3">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl ${
                            index === 0 
                              ? 'bg-gradient-to-br from-luxury-gold to-luxury-amber text-void' 
                              : index === 1 
                                ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-void'
                                : 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                          }`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </div>
                          {index === 0 && (
                            <div className="absolute -inset-1 bg-luxury-gold/30 rounded-2xl blur-md -z-10" />
                          )}
                        </div>
                        <div className="text-sm font-semibold text-white mb-1">{item.agent.name}</div>
                        <div className="text-xs text-luxury-green font-mono">+{item.profit}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* 战斗日志 */}
            <BattleLog 
              logs={arena.battleLogs} 
              title="竞技场战斗日志"
              maxHeight="280px"
            />
          </div>
          
          {/* 右侧：我的小队 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 小队概览 */}
            <div className="card-luxury rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-luxury-cyan/20 to-luxury-purple/20 border border-luxury-cyan/30 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-luxury-cyan" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">我的小队</h2>
                    <p className="text-xs text-white/40">管理你的 Agents</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {!wallet.connected ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-2xl bg-void-light/50 border border-white/5 flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-10 h-10 text-white/20" />
                    </div>
                    <p className="text-white/40 mb-2">请先连接钱包</p>
                    <p className="text-xs text-white/20">连接后即可管理你的 Agents</p>
                  </div>
                ) : myAgents.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-2xl bg-void-light/50 border border-white/5 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-10 h-10 text-white/20" />
                    </div>
                    <p className="text-white/40 mb-2">你还没有 Agent</p>
                    <p className="text-xs text-white/20">前往「小队」页面铸造你的第一个 Agent</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* 在竞技场的 Agents */}
                    {myArenaAgents.length > 0 && (
                      <div>
                        <h3 className="text-xs text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold" />
                          在竞技场 ({myArenaAgents.length})
                        </h3>
                        <div className="space-y-3">
                          {myArenaAgents.map(agent => (
                            <AgentCard key={agent.id} agent={agent} compact />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* 空闲的 Agents */}
                    {myIdleAgents.length > 0 && (
                      <div>
                        <h3 className="text-xs text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-luxury-cyan" />
                          空闲中 ({myIdleAgents.length})
                        </h3>
                        <div className="space-y-3">
                          {myIdleAgents.slice(0, 3).map(agent => (
                            <AgentCard key={agent.id} agent={agent} compact />
                          ))}
                          {myIdleAgents.length > 3 && (
                            <p className="text-xs text-white/30 text-center py-2">
                              还有 {myIdleAgents.length - 3} 个 Agent...
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* 我的战斗日志 */}
            <BattleLog 
              logs={myBattleLogs} 
              title="我的战斗日志"
              maxHeight="200px"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Arena;
