import React from 'react';
import { Agent } from '../types';

interface PixelAgentProps {
  agent: Agent;
  size?: number;
  showBalance?: boolean;
  isAttacking?: boolean;
  isHurt?: boolean;
  isDefending?: boolean;
}

// 超级马里奥风格的像素人 SVG
const PixelAgent: React.FC<PixelAgentProps> = ({ 
  agent, 
  size = 32, 
  showBalance = false,
  isAttacking = false,
  isHurt = false,
  isDefending = false,
}) => {
  const { color, balance, pixelStyle, image } = agent;
  const isDead = balance <= 0;
  
  // 根据 pixelStyle 选择不同的像素人造型
  const getPixelPattern = () => {
    // 基础像素人图案 - 16x16 网格
    // 0=透明, 1=主色, 2=深色(阴影), 3=浅色(高光), 4=皮肤色, 5=眼睛白, 6=眼睛黑
    const patterns = [
      // 样式0: 经典马里奥风格战士
      [
        [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
        [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
        [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
        [0,0,0,2,2,2,4,4,4,2,2,2,0,0,0,0],
        [0,0,2,4,2,4,4,4,4,4,2,4,2,0,0,0],
        [0,0,2,4,2,2,4,4,4,2,2,4,2,0,0,0],
        [0,0,0,4,4,4,4,4,4,4,4,4,0,0,0,0],
        [0,0,0,0,4,5,6,4,4,5,6,0,0,0,0,0],
        [0,0,0,0,4,4,4,2,4,4,4,0,0,0,0,0],
        [0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
        [0,0,1,1,1,3,1,1,1,3,1,1,1,0,0,0],
        [0,1,1,1,1,3,3,3,3,3,1,1,1,1,0,0],
        [0,4,4,1,1,1,1,1,1,1,1,1,4,4,0,0],
        [0,4,4,4,1,1,0,0,1,1,4,4,4,0,0,0],
        [0,0,2,2,2,2,0,0,2,2,2,2,0,0,0,0],
        [0,2,2,2,2,2,0,0,2,2,2,2,2,0,0,0],
      ],
      // 样式1: 忍者风格
      [
        [0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0],
        [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
        [0,0,0,2,2,2,2,2,2,2,2,2,2,0,0,0],
        [0,0,2,2,2,2,2,2,2,2,2,2,2,2,0,0],
        [0,0,2,2,5,6,2,2,2,5,6,2,2,2,0,0],
        [0,0,0,2,2,2,2,2,2,2,2,2,2,0,0,0],
        [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
        [0,0,0,0,0,2,4,4,4,2,0,0,0,0,0,0],
        [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0],
        [0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
        [0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
        [0,0,4,1,1,1,1,1,1,1,1,1,4,0,0,0],
        [0,0,4,4,1,1,0,0,1,1,4,4,0,0,0,0],
        [0,0,0,2,2,2,0,0,2,2,2,0,0,0,0,0],
        [0,0,2,2,2,2,0,0,2,2,2,2,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      ],
      // 样式2: 机器人风格
      [
        [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
        [0,0,0,3,1,1,1,1,1,1,1,1,3,0,0,0],
        [0,0,3,1,1,1,1,1,1,1,1,1,1,3,0,0],
        [0,0,3,1,5,6,1,1,1,5,6,1,1,3,0,0],
        [0,0,3,1,1,1,1,1,1,1,1,1,1,3,0,0],
        [0,0,3,1,1,3,3,3,3,3,1,1,1,3,0,0],
        [0,0,0,3,1,1,1,1,1,1,1,1,3,0,0,0],
        [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
        [0,0,0,0,2,1,1,1,1,1,1,2,0,0,0,0],
        [0,0,0,2,1,1,1,1,1,1,1,1,2,0,0,0],
        [0,0,2,1,1,1,1,1,1,1,1,1,1,2,0,0],
        [0,0,2,1,1,1,1,1,1,1,1,1,1,2,0,0],
        [0,0,0,2,1,1,0,0,1,1,1,2,0,0,0,0],
        [0,0,0,2,2,2,0,0,2,2,2,2,0,0,0,0],
        [0,0,2,2,2,2,0,0,2,2,2,2,2,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      ],
      // 样式3: 骑士风格
      [
        [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],
        [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0],
        [0,0,0,1,1,2,2,2,2,2,1,1,0,0,0,0],
        [0,0,1,1,2,2,2,2,2,2,2,1,1,0,0,0],
        [0,0,1,2,5,6,2,2,5,6,2,2,1,0,0,0],
        [0,0,1,2,2,2,2,2,2,2,2,2,1,0,0,0],
        [0,0,0,2,2,2,4,4,4,2,2,2,0,0,0,0],
        [0,0,0,0,2,4,4,4,4,4,2,0,0,0,0,0],
        [0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
        [0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
        [0,0,4,1,1,1,0,0,1,1,1,4,0,0,0,0],
        [0,0,4,4,1,1,0,0,1,1,4,4,0,0,0,0],
        [0,0,2,2,2,2,0,0,2,2,2,2,0,0,0,0],
        [0,2,2,2,2,2,0,0,2,2,2,2,2,0,0,0],
      ],
      // 样式4: 法师风格
      [
        [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0],
        [0,0,0,1,1,1,3,3,3,1,1,1,0,0,0,0],
        [0,0,1,1,1,3,3,3,3,3,1,1,1,0,0,0],
        [0,0,1,1,3,3,3,3,3,3,3,1,1,0,0,0],
        [0,0,0,4,4,4,4,4,4,4,4,4,0,0,0,0],
        [0,0,4,4,5,6,4,4,4,5,6,4,4,0,0,0],
        [0,0,4,4,4,4,4,4,4,4,4,4,4,0,0,0],
        [0,0,0,4,4,4,4,2,4,4,4,4,0,0,0,0],
        [0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
        [0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
        [0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
        [0,0,0,4,4,1,0,0,1,4,4,0,0,0,0,0],
        [0,0,0,4,4,4,0,0,4,4,4,0,0,0,0,0],
        [0,0,2,2,2,2,0,0,2,2,2,2,0,0,0,0],
      ],
      // 样式5: 枪手风格
      [
        [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],
        [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0],
        [0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
        [0,0,0,4,4,4,4,4,4,4,4,4,0,0,0,0],
        [0,0,4,4,5,6,4,4,4,5,6,4,4,0,0,0],
        [0,0,4,4,4,4,4,4,4,4,4,4,4,0,0,0],
        [0,0,0,4,4,4,4,2,4,4,4,4,0,0,0,0],
        [0,0,0,0,4,4,4,4,4,4,4,0,0,0,0,0],
        [0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
        [0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
        [0,0,1,1,1,1,1,1,1,1,1,1,1,2,2,0],
        [0,0,4,1,1,1,1,1,1,1,1,1,2,2,2,0],
        [0,0,4,4,1,1,0,0,1,1,4,4,0,0,0,0],
        [0,0,0,2,2,2,0,0,2,2,2,0,0,0,0,0],
        [0,0,2,2,2,2,0,0,2,2,2,2,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      ],
    ];
    
    return patterns[pixelStyle % patterns.length];
  };
  
  const pattern = getPixelPattern();
  
  // 颜色映射
  const getColor = (value: number) => {
    switch (value) {
      case 0: return 'transparent';
      case 1: return color;
      case 2: return adjustBrightness(color, -50);
      case 3: return adjustBrightness(color, 60);
      case 4: return '#fcd5b8'; // 皮肤色
      case 5: return '#ffffff'; // 眼睛白
      case 6: return '#1a1a2e'; // 眼睛黑
      default: return 'transparent';
    }
  };
  
  return (
    <div 
      className={`relative transition-transform duration-100
        ${isAttacking ? 'scale-110' : ''}
        ${isHurt ? 'animate-shake' : ''}`}
      style={{ 
        width: size, 
        height: size + (showBalance ? 12 : 0),
        opacity: isDead ? 0.4 : 1,
        filter: isDead ? 'grayscale(100%)' : 'none',
      }}
    >
      {/* 余额显示 - 在头像底部显示 */}
      {showBalance && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap z-20">
          <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border ${
            isDead ? 'bg-gray-900/80 border-gray-600/50' : 'bg-black/70 border-luxury-gold/50'
          }`}>
            <span className={`text-[8px] ${isDead ? 'text-gray-500' : 'text-luxury-gold'}`}>$</span>
            <span className={`text-[9px] font-mono font-bold ${isDead ? 'text-gray-400' : 'text-white'}`}>{balance}</span>
          </div>
        </div>
      )}
      
      {/* 优先显示用户上传的图片 */}
      {image ? (
        <div 
          className="relative overflow-hidden rounded-md border-2"
          style={{
            width: size,
            height: size,
            borderColor: color,
            filter: isHurt ? 'brightness(2) saturate(0.5)' : isDead ? 'grayscale(1)' : 'none',
            transform: isAttacking ? 'translateX(3px)' : 'none',
            transition: 'all 0.1s ease',
          }}
        >
          <img 
            src={image} 
            alt="agent" 
            className="w-full h-full object-cover pixelated"
          />
        </div>
      ) : (
        /* 像素人 SVG */
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 16 16"
          className="pixelated drop-shadow-lg"
          style={{ 
            filter: isHurt ? 'brightness(2) saturate(0.5)' : isDead ? 'grayscale(1)' : 'none',
            transform: isAttacking ? 'translateX(3px)' : 'none',
            transition: 'all 0.1s ease',
          }}
        >
          {pattern.map((row, y) => 
            row.map((cell, x) => 
              cell !== 0 && (
                <rect
                  key={`${x}-${y}`}
                  x={x}
                  y={y}
                  width={1.05}
                  height={1.05}
                  fill={getColor(cell)}
                />
              )
            )
          )}
        </svg>
      )}
      
      {/* 死亡标记 */}
      {isDead && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span className="text-2xl opacity-80">💀</span>
        </div>
      )}

      {/* 防御护盾特效 */}
      {isDefending && !isDead && (
        <div className="absolute -inset-1 z-10 pointer-events-none">
          {/* 护盾光环 */}
          <div className="absolute inset-0 border-2 border-blue-400/60 rounded-full animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.5)] bg-blue-500/10" />
          {/* 旋转的护盾图标 */}
          <div className="absolute -top-3 -right-3 animate-bounce">
             <div className="bg-blue-600/80 p-1 rounded-full border border-blue-400">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
             </div>
          </div>
        </div>
      )}
      
      {/* 攻击特效 */}
      {isAttacking && (
        <div 
          className="absolute -right-2 top-1/2 -translate-y-1/2 text-sm z-20"
          style={{ textShadow: `0 0 5px ${color}` }}
        >
          💥
        </div>
      )}
    </div>
  );
};

// 调整颜色亮度
function adjustBrightness(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export default PixelAgent;
