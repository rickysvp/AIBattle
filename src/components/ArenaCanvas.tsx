import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ArenaCanvasProps {
  phase: string;
  countdown: number;
  selectedSlots: number[];
  priceChange: number;
}

// 粒子
interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  side: 'long' | 'short';
}

// 波浪点
interface WavePoint {
  y: number;
  targetY: number;
  speed: number;
}

// 收益数字
interface ProfitNumber {
  id: string;
  x: number;
  y: number;
  amount: number;
  side: 'long' | 'short';
  timestamp: number;
}

const ArenaCanvas: React.FC<ArenaCanvasProps> = ({
  phase,
  countdown,
  selectedSlots,
  priceChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const wavePointsRef = useRef<WavePoint[]>([]);
  const frontLineXRef = useRef(0.5);
  const targetFrontLineXRef = useRef(0.5);
  const lastPriceChangeRef = useRef(0);
  const profitNumbersRef = useRef<ProfitNumber[]>([]);
  const lastSettlementRef = useRef(0);

  const arena = useGameStore(state => state.arena);
  const myAgents = useGameStore(state => state.myAgents);
  const systemAgents = useGameStore(state => state.systemAgents);
  const updateParticipant = useGameStore(state => state.updateParticipant);

  const { participants, currentPrice } = arena;

  const { longAgents, shortAgents, longPower, shortPower } = useMemo(() => {
    const longs = participants.filter(p => p.position === 'long' && p.balance > 0);
    const shorts = participants.filter(p => p.position === 'short' && p.balance > 0);
    return {
      longAgents: longs,
      shortAgents: shorts,
      longPower: longs.reduce((sum, p) => sum + p.balance * p.leverage, 0),
      shortPower: shorts.reduce((sum, p) => sum + p.balance * p.leverage, 0),
    };
  }, [participants]);

  // 每秒结算获胜方收益
  useEffect(() => {
    if (phase !== 'fighting') return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastSettlementRef.current < 1000) return;
      lastSettlementRef.current = now;

      // 根据当前价格变化方向确定获胜方
      const priceDirection = priceChange > 0 ? 'up' : priceChange < 0 ? 'down' : 'neutral';
      
      if (priceDirection === 'up' && shortAgents.length > 0 && longAgents.length > 0) {
        // 多头获胜：空头支付资金给多头
        const settlementRate = 0.02; // 每秒结算2%
        
        // 计算空头总损失
        const shortLosses = shortAgents.map(agent => {
          const loss = Math.floor(agent.balance * agent.leverage * settlementRate);
          return { agent, loss: Math.min(loss, agent.balance) };
        }).filter(item => item.loss > 0);

        const totalLoss = shortLosses.reduce((sum, item) => sum + item.loss, 0);

        if (totalLoss > 0) {
          const profitPerLong = Math.floor(totalLoss / longAgents.length);

          // 分配给多头
          longAgents.forEach((agent, index) => {
            const extra = index === 0 ? totalLoss - profitPerLong * longAgents.length : 0;
            const totalProfit = profitPerLong + extra;

            updateParticipant(agent.id, { balance: agent.balance + totalProfit });

            const pos = getAgentPosition(agent);
            profitNumbersRef.current.push({
              id: `profit-${agent.id}-${now}`,
              x: pos.x,
              y: pos.y,
              amount: totalProfit,
              side: 'long',
              timestamp: now,
            });
          });

          // 扣除空头
          shortLosses.forEach(({ agent, loss }) => {
            updateParticipant(agent.id, { balance: Math.max(0, agent.balance - loss) });
          });
        }
      } else if (priceDirection === 'down' && longAgents.length > 0 && shortAgents.length > 0) {
        // 空头获胜：多头支付资金给空头
        const settlementRate = 0.02;

        // 计算多头总损失
        const longLosses = longAgents.map(agent => {
          const loss = Math.floor(agent.balance * agent.leverage * settlementRate);
          return { agent, loss: Math.min(loss, agent.balance) };
        }).filter(item => item.loss > 0);

        const totalLoss = longLosses.reduce((sum, item) => sum + item.loss, 0);

        if (totalLoss > 0) {
          const profitPerShort = Math.floor(totalLoss / shortAgents.length);

          // 分配给空头
          shortAgents.forEach((agent, index) => {
            const extra = index === 0 ? totalLoss - profitPerShort * shortAgents.length : 0;
            const totalProfit = profitPerShort + extra;

            updateParticipant(agent.id, { balance: agent.balance + totalProfit });

            const pos = getAgentPosition(agent);
            profitNumbersRef.current.push({
              id: `profit-${agent.id}-${now}`,
              x: pos.x,
              y: pos.y,
              amount: totalProfit,
              side: 'short',
              timestamp: now,
            });
          });

          // 扣除多头
          longLosses.forEach(({ agent, loss }) => {
            updateParticipant(agent.id, { balance: Math.max(0, agent.balance - loss) });
          });
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [phase, priceChange, longAgents, shortAgents, myAgents, systemAgents, updateParticipant]);

  const getAgentPosition = useCallback((agent: any) => {
    const isLong = agent.position === 'long';
    const index = isLong
      ? longAgents.findIndex(a => a.id === agent.id)
      : shortAgents.findIndex(a => a.id === agent.id);

    // 简化位置计算
    const yPos = ((index % 5) / 4) * 80 + 10;
    const xPos = isLong ? 15 + Math.floor(index / 5) * 8 : 85 - Math.floor(index / 5) * 8;

    return { x: xPos, y: yPos };
  }, [longAgents, shortAgents]);

  // 根据价格变化计算目标战线位置
  useEffect(() => {
    if (phase !== 'fighting') return;

    const priceDelta = priceChange - lastPriceChangeRef.current;
    lastPriceChangeRef.current = priceChange;

    const shift = priceDelta * 0.05;
    targetFrontLineXRef.current = Math.max(0.1, Math.min(0.9, targetFrontLineXRef.current + shift));
  }, [priceChange, phase]);

  // Canvas 动画循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
        const pointCount = 20;
        wavePointsRef.current = Array.from({ length: pointCount }, (_, i) => ({
          y: (i / (pointCount - 1)) * canvas.height,
          targetY: (i / (pointCount - 1)) * canvas.height,
          speed: 0,
        }));
      }
    };
    resize();
    window.addEventListener('resize', resize);

    let lastTime = 0;
    const animate = (time: number) => {
      if (time - lastTime < 16) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTime = time;

      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, width, height);

      const diff = targetFrontLineXRef.current - frontLineXRef.current;
      frontLineXRef.current += diff * 0.1;

      const frontLineX = frontLineXRef.current * width;

      // 更新波浪点
      wavePointsRef.current.forEach((point, i) => {
        const baseX = frontLineX;
        const waveOffset = Math.sin(time * 0.003 + i * 0.5) * 30;
        const shockOffset = Math.abs(diff) * width * 0.5 * Math.sin(time * 0.01 + i);

        point.targetY = baseX + waveOffset + shockOffset;
        point.speed = (point.targetY - point.y) * 0.1;
        point.y += point.speed;
      });

      // 绘制势力背景
      const longGradient = ctx.createLinearGradient(0, 0, frontLineX, 0);
      longGradient.addColorStop(0, 'rgba(34, 197, 94, 0.2)');
      longGradient.addColorStop(0.8, 'rgba(34, 197, 94, 0.05)');
      longGradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.fillStyle = longGradient;
      ctx.fillRect(0, 0, frontLineX, height);

      const shortGradient = ctx.createLinearGradient(frontLineX, 0, width, 0);
      shortGradient.addColorStop(0, 'rgba(239, 68, 68, 0)');
      shortGradient.addColorStop(0.2, 'rgba(239, 68, 68, 0.05)');
      shortGradient.addColorStop(1, 'rgba(239, 68, 68, 0.2)');
      ctx.fillStyle = shortGradient;
      ctx.fillRect(frontLineX, 0, width - frontLineX, height);

      // 生成粒子
      if (phase === 'fighting') {
        const longIntensity = frontLineXRef.current;
        for (let i = 0; i < longIntensity * 3; i++) {
          if (Math.random() > 0.6) {
            particlesRef.current.push({
              id: `p-${Date.now()}-${Math.random()}`,
              x: Math.random() * frontLineX * 0.8,
              y: Math.random() * height,
              vx: (1 + longIntensity * 2) * (0.5 + Math.random()),
              vy: (Math.random() - 0.5) * 0.3,
              size: 1.5 + Math.random() * 2,
              alpha: 0.4 + Math.random() * 0.4,
              side: 'long',
            });
          }
        }

        const shortIntensity = 1 - frontLineXRef.current;
        for (let i = 0; i < shortIntensity * 3; i++) {
          if (Math.random() > 0.6) {
            particlesRef.current.push({
              id: `p-${Date.now()}-${Math.random()}`,
              x: frontLineX + Math.random() * (width - frontLineX) * 0.8 + (width - frontLineX) * 0.2,
              y: Math.random() * height,
              vx: -(1 + shortIntensity * 2) * (0.5 + Math.random()),
              vy: (Math.random() - 0.5) * 0.3,
              size: 1.5 + Math.random() * 2,
              alpha: 0.4 + Math.random() * 0.4,
              side: 'short',
            });
          }
        }
      }

      // 更新和绘制粒子
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha *= 0.995;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.side === 'long'
          ? `rgba(34, 197, 94, ${p.alpha})`
          : `rgba(239, 68, 68, ${p.alpha})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = p.side === 'long'
          ? `rgba(34, 197, 94, ${p.alpha * 0.3})`
          : `rgba(239, 68, 68, ${p.alpha * 0.3})`;
        ctx.fill();

        if (p.x < -10 || p.x > width + 10 || p.alpha < 0.01) {
          particlesRef.current.splice(i, 1);
        }
      }

      // 绘制收益数字
      const now = Date.now();
      profitNumbersRef.current = profitNumbersRef.current.filter(pn => now - pn.timestamp < 1500);

      profitNumbersRef.current.forEach(pn => {
        const age = (now - pn.timestamp) / 1500;
        const alpha = 1 - age;
        const yOffset = -age * 30;

        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = pn.side === 'long'
          ? `rgba(34, 197, 94, ${alpha})`
          : `rgba(239, 68, 68, ${alpha})`;
        ctx.textAlign = 'center';
        ctx.fillText(`+${pn.amount}`, (pn.x / 100) * width, (pn.y / 100) * height + yOffset);
      });

      // 绘制波浪战线
      ctx.beginPath();
      ctx.moveTo(wavePointsRef.current[0]?.y || frontLineX, 0);

      for (let i = 0; i < wavePointsRef.current.length - 1; i++) {
        const point = wavePointsRef.current[i];
        const nextPoint = wavePointsRef.current[i + 1];
        const y = (i / (wavePointsRef.current.length - 1)) * height;
        const nextY = ((i + 1) / (wavePointsRef.current.length - 1)) * height;

        const cpX = (point.y + nextPoint.y) / 2;
        const cpY = (y + nextY) / 2;

        ctx.quadraticCurveTo(point.y, y, cpX, cpY);
      }

      const lastPoint = wavePointsRef.current[wavePointsRef.current.length - 1];
      ctx.lineTo(lastPoint.y, height);

      // 战线颜色根据多空实时变化
      const priceDirection = priceChange > 0 ? 'up' : priceChange < 0 ? 'down' : 'neutral';
      const lineColor = priceDirection === 'up' ? '#22c55e' : priceDirection === 'down' ? '#ef4444' : '#ffffff';

      ctx.shadowColor = lineColor;
      ctx.shadowBlur = 30;
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.moveTo(wavePointsRef.current[0]?.y || frontLineX, 0);
      for (let i = 0; i < wavePointsRef.current.length - 1; i++) {
        const point = wavePointsRef.current[i];
        const nextPoint = wavePointsRef.current[i + 1];
        const y = (i / (wavePointsRef.current.length - 1)) * height;
        const nextY = ((i + 1) / (wavePointsRef.current.length - 1)) * height;
        const cpX = (point.y + nextPoint.y) / 2;
        const cpY = (y + nextY) / 2;
        ctx.quadraticCurveTo(point.y, y, cpX, cpY);
      }
      ctx.lineTo(lastPoint.y, height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [phase]);

  const isLongDominant = frontLineXRef.current > 0.55;
  const isShortDominant = frontLineXRef.current < 0.45;

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* 中心价格 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
        <div className={`text-4xl font-bold font-mono tracking-tight transition-all duration-300 ${
          isLongDominant ? 'text-green-400 drop-shadow-[0_0_20px_rgba(34,197,94,0.6)]' :
          isShortDominant ? 'text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]' :
          'text-white'
        }`}>
          ${currentPrice.toFixed(2)}
        </div>
        <div className="mt-2 flex items-center justify-center gap-2">
          {isLongDominant && (
            <div className="px-3 py-1 bg-green-500/30 rounded-full text-xs font-bold text-green-400 animate-pulse">
              ▲ BULLS SURGING
            </div>
          )}
          {isShortDominant && (
            <div className="px-3 py-1 bg-red-500/30 rounded-full text-xs font-bold text-red-400 animate-pulse">
              ▼ BEARS SURGING
            </div>
          )}
        </div>
      </div>

      {/* 状态覆盖层 */}
      {phase === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-40">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-3">Preparing Battlefield...</div>
            <div className="w-56 h-3 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all" style={{ width: `${countdown}%` }} />
            </div>
          </div>
        </div>
      )}

      {phase === 'selecting' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-40">
          <div className="text-2xl font-bold text-white">Selecting Warriors...</div>
        </div>
      )}

      {phase === 'waiting' && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="text-white/40 text-xl">Waiting for Battle...</div>
        </div>
      )}
    </div>
  );
};

export default ArenaCanvas;
