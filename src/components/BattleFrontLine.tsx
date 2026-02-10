import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface BattleFrontLineProps {
  longShortRatio: number;
  priceChangePercent: number;
  isFighting: boolean;
}

const BattleFrontLine: React.FC<BattleFrontLineProps> = ({
  priceChangePercent,
  isFighting,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const targetPositionRef = useRef(50);
  const currentPositionRef = useRef(50);
  const velocityRef = useRef(0);

  // 实时更新战线目标位置
  useEffect(() => {
    const priceChange = priceChangePercent;
    const pushSpeed = priceChange * 5; // 增加推移速度
    
    let newTarget = targetPositionRef.current + pushSpeed;
    newTarget = Math.max(15, Math.min(85, newTarget));
    
    targetPositionRef.current = newTarget;
  }, [priceChangePercent]);

  // Canvas 动画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
      color: string;
    }

    const particles: Particle[] = [];

    const createParticle = (x: number, color: string, direction: number): Particle => ({
      x,
      y: Math.random() * canvas.height,
      vx: direction * (Math.random() * 3 + 2),
      vy: (Math.random() - 0.5) * 2,
      life: 0,
      maxLife: 60 + Math.random() * 40,
      size: Math.random() * 2 + 1,
      color,
    });

    let lastTime = 0;
    const animate = (time: number) => {
      // 限制帧率到30fps
      if (time - lastTime < 33) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 物理平滑移动 - 添加速度和阻尼
      const diff = targetPositionRef.current - currentPositionRef.current;
      velocityRef.current += diff * 0.05; // 加速度
      velocityRef.current *= 0.85; // 阻尼
      currentPositionRef.current += velocityRef.current;

      const frontX = currentPositionRef.current * canvas.width / 100;

      // 绘制势力范围背景
      const longGradient = ctx.createLinearGradient(0, 0, frontX, 0);
      longGradient.addColorStop(0, 'rgba(34, 197, 94, 0.12)');
      longGradient.addColorStop(1, 'rgba(34, 197, 94, 0.03)');
      ctx.fillStyle = longGradient;
      ctx.fillRect(0, 0, frontX, canvas.height);

      const shortGradient = ctx.createLinearGradient(frontX, 0, canvas.width, 0);
      shortGradient.addColorStop(0, 'rgba(239, 68, 68, 0.03)');
      shortGradient.addColorStop(1, 'rgba(239, 68, 68, 0.12)');
      ctx.fillStyle = shortGradient;
      ctx.fillRect(frontX, 0, canvas.width - frontX, canvas.height);

      // 绘制主战线 - 加粗发光
      const isPriceUp = priceChangePercent > 0;
      const lineColor = isPriceUp ? '#22c55e' : priceChangePercent < 0 ? '#ef4444' : '#ffffff';
      
      // 外发光
      ctx.shadowColor = lineColor;
      ctx.shadowBlur = 15;
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(frontX, 0);
      ctx.lineTo(frontX, canvas.height);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 内核心
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(frontX, 0);
      ctx.lineTo(frontX, canvas.height);
      ctx.stroke();

      // 生成推进粒子效果
      if (isFighting && Math.abs(velocityRef.current) > 0.1) {
        const particleCount = Math.min(3, Math.floor(Math.abs(velocityRef.current) * 2));
        const isMovingRight = velocityRef.current > 0;
        const spawnX = isMovingRight ? frontX - 10 : frontX + 10;
        const color = isMovingRight ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)';
        const direction = isMovingRight ? 1 : -1;
        
        for (let i = 0; i < particleCount; i++) {
          particles.push(createParticle(spawnX, color, direction));
        }
      }

      // 更新和绘制粒子
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95; // 粒子减速

        const alpha = 1 - (p.life / p.maxLife);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${alpha * 0.8})`);
        ctx.fill();

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }

      // 绘制战线推进箭头指示
      if (isFighting && Math.abs(velocityRef.current) > 0.5) {
        const arrowSize = 8;
        const arrowY = canvas.height / 2;
        const isMovingRight = velocityRef.current > 0;
        
        ctx.fillStyle = isMovingRight ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)';
        ctx.beginPath();
        if (isMovingRight) {
          ctx.moveTo(frontX + 15, arrowY);
          ctx.lineTo(frontX + 15 - arrowSize, arrowY - arrowSize/2);
          ctx.lineTo(frontX + 15 - arrowSize, arrowY + arrowSize/2);
        } else {
          ctx.moveTo(frontX - 15, arrowY);
          ctx.lineTo(frontX - 15 + arrowSize, arrowY - arrowSize/2);
          ctx.lineTo(frontX - 15 + arrowSize, arrowY + arrowSize/2);
        }
        ctx.closePath();
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isFighting, priceChangePercent]);

  const frontLinePosition = currentPositionRef.current;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.9 }}
      />

      {/* 战线指示器 */}
      <motion.div
        className="absolute top-0 bottom-0 w-1 z-10"
        style={{ left: `${frontLinePosition}%` }}
        animate={{
          boxShadow: isFighting
            ? priceChangePercent > 0
              ? '0 0 20px rgba(34, 197, 94, 0.6)'
              : priceChangePercent < 0
              ? '0 0 20px rgba(239, 68, 68, 0.6)'
              : '0 0 10px rgba(255,255,255,0.2)'
            : '0 0 5px rgba(255,255,255,0.1)',
        }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
};

export default BattleFrontLine;
