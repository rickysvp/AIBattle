import React from 'react';
import { Position } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { getPositionColor, getPositionLabel } from '../utils/pnlCalculator';

interface PositionBadgeProps {
  position: Position;
  leverage?: number;
  size?: 'sm' | 'md' | 'lg';
  showLeverage?: boolean;
  className?: string;
}

const PositionBadge: React.FC<PositionBadgeProps> = ({
  position,
  leverage,
  size = 'md',
  showLeverage = true,
  className = '',
}) => {
  const color = getPositionColor(position);
  const label = getPositionLabel(position);

  const sizeClasses = {
    sm: {
      container: 'px-1.5 py-0.5 text-[10px]',
      icon: 'w-3 h-3',
    },
    md: {
      container: 'px-2 py-1 text-xs',
      icon: 'w-3.5 h-3.5',
    },
    lg: {
      container: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
    },
  };

  return (
    <div
      className={`
        inline-flex items-center gap-1 rounded-lg font-bold
        ${sizeClasses[size].container}
        ${className}
      `}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      {position === 'long' ? (
        <TrendingUp className={sizeClasses[size].icon} />
      ) : (
        <TrendingDown className={sizeClasses[size].icon} />
      )}
      <span>{label}</span>
      {showLeverage && leverage && (
        <span className="opacity-80">{leverage}x</span>
      )}
    </div>
  );
};

// 爆仓标记组件
export const LiquidationBadge: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <div
      className={`
        inline-flex items-center gap-1 rounded-lg font-bold
        bg-red-500/20 text-red-500 border border-red-500/40
        ${sizeClasses[size]}
      `}
    >
      <span>💥 LIQUIDATED</span>
    </div>
  );
};

// PnL 显示组件
interface PnLDisplayProps {
  pnl: number;
  pnlPercent?: number;
  size?: 'sm' | 'md' | 'lg';
  showSign?: boolean;
}

export const PnLDisplay: React.FC<PnLDisplayProps> = ({
  pnl,
  pnlPercent,
  size = 'md',
  showSign = true,
}) => {
  const isPositive = pnl >= 0;
  const color = isPositive ? '#22c55e' : '#ef4444';

  const sizeClasses = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  const formatPnL = (value: number) => {
    const sign = showSign && value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}`;
  };

  return (
    <div className={`font-mono font-bold ${sizeClasses[size]}`} style={{ color }}>
      <span>{formatPnL(pnl)}</span>
      {pnlPercent !== undefined && (
        <span className="opacity-80 ml-1">({formatPnL(pnlPercent)}%)</span>
      )}
    </div>
  );
};

// 爆仓价格显示
interface LiquidationPriceProps {
  price: number;
  currentPrice: number;
  size?: 'sm' | 'md' | 'lg';
}

export const LiquidationPriceDisplay: React.FC<LiquidationPriceProps> = ({
  price,
  currentPrice,
  size = 'md',
}) => {
  const isNear = Math.abs(currentPrice - price) / price < 0.05; // 5% 以内警告

  const sizeClasses = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <div
      className={`font-mono ${sizeClasses[size]} ${
        isNear ? 'text-red-500 animate-pulse' : 'text-white/40'
      }`}
    >
      <span className="text-white/40">Liq: </span>
      <span>${price.toFixed(2)}</span>
      {isNear && <span className="ml-1">⚠️</span>}
    </div>
  );
};

export default PositionBadge;
