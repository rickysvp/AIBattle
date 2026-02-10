import React, { useState } from 'react';
import { PriceData, CryptoSymbol } from '../types';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, ChevronDown } from 'lucide-react';
import { formatPrice, formatPercent } from '../utils/pnlCalculator';
import { priceService } from '../services/priceService';
import { motion, AnimatePresence } from 'framer-motion';

interface PriceHeaderProps {
  priceData: PriceData;
  onSymbolChange?: (symbol: CryptoSymbol) => void;
}

// 币种配置
const CRYPTO_ICONS: Record<CryptoSymbol, { bg: string; icon: string; name: string; color: string }> = {
  BTC: { bg: 'from-orange-500 to-yellow-500', icon: '₿', name: 'Bitcoin', color: '#f7931a' },
  ETH: { bg: 'from-blue-500 to-purple-500', icon: 'Ξ', name: 'Ethereum', color: '#627eea' },
  SOL: { bg: 'from-green-400 to-teal-500', icon: '◎', name: 'Solana', color: '#00ffa3' },
  MON: { bg: 'from-purple-500 to-pink-500', icon: '◈', name: 'Monad', color: '#a855f7' },
};

const PriceHeader: React.FC<PriceHeaderProps> = ({ priceData, onSymbolChange }) => {
  const [showSelector, setShowSelector] = useState(false);
  const isPositive = priceData.priceChangePercent24h >= 0;
  const currentSymbol = priceData.symbol || 'BTC';
  const cryptoConfig = CRYPTO_ICONS[currentSymbol];

  const handleSymbolSelect = (symbol: CryptoSymbol) => {
    if (onSymbolChange) {
      onSymbolChange(symbol);
    }
    priceService.switchSymbol(symbol);
    setShowSelector(false);
  };

  return (
    <div className="w-full bg-void-panel/80 border border-white/5 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        {/* 左侧: 币种选择和价格 */}
        <div className="flex items-center gap-4">
          {/* 币种选择器 */}
          <div className="relative">
            <button
              onClick={() => setShowSelector(!showSelector)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${cryptoConfig.bg} flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">{cryptoConfig.icon}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-white">{currentSymbol}</span>
                <ChevronDown className={`w-4 h-4 text-white/60 transition-transform ${showSelector ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* 币种下拉菜单 */}
            <AnimatePresence>
              {showSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 w-48 bg-void-panel border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl"
                >
                  {(Object.keys(CRYPTO_ICONS) as CryptoSymbol[]).map((symbol) => {
                    const config = CRYPTO_ICONS[symbol];
                    const cryptoData = priceData.cryptos?.[symbol];
                    const isActive = symbol === currentSymbol;

                    return (
                      <button
                        key={symbol}
                        onClick={() => handleSymbolSelect(symbol)}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors ${
                          isActive ? 'bg-white/10' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${config.bg} flex items-center justify-center`}>
                          <span className="text-white font-bold text-xs">{config.icon}</span>
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-bold text-white">{symbol}</div>
                          <div className="text-xs text-white/40">{config.name}</div>
                        </div>
                        {cryptoData && (
                          <div className={`text-xs font-mono ${
                            cryptoData.priceChangePercent24h >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {cryptoData.priceChangePercent24h >= 0 ? '+' : ''}
                            {cryptoData.priceChangePercent24h.toFixed(1)}%
                          </div>
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 当前价格 */}
          <div>
            <div className="text-xs text-white/40">{currentSymbol}/USDT</div>
            <div className="text-xl font-bold text-white font-mono">
              ${formatPrice(priceData.price)}
            </div>
          </div>

          {/* 24h 涨跌幅 */}
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
            isPositive ? 'bg-green-500/10' : 'bg-red-500/10'
          }`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm font-bold font-mono ${
              isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              {formatPercent(priceData.priceChangePercent24h)}
            </span>
          </div>
        </div>

        {/* 中间: 24h 高低价 */}
        <div className="hidden md:flex items-center gap-6">
          <div className="text-center">
            <div className="text-xs text-white/40 mb-0.5">24h High</div>
            <div className="text-sm font-mono text-white/80">
              ${formatPrice(priceData.high24h)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-white/40 mb-0.5">24h Low</div>
            <div className="text-sm font-mono text-white/80">
              ${formatPrice(priceData.low24h)}
            </div>
          </div>
        </div>

        {/* 右侧: 资金费率和多空比 */}
        <div className="flex items-center gap-4">
          {/* 资金费率 */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
            <DollarSign className="w-4 h-4 text-luxury-gold" />
            <div>
              <div className="text-[10px] text-white/40">Funding</div>
              <div className={`text-xs font-mono font-bold ${
                priceData.fundingRate >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {priceData.fundingRate >= 0 ? '+' : ''}{(priceData.fundingRate * 100).toFixed(4)}%
              </div>
            </div>
          </div>

          {/* 多空比 */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
            <BarChart3 className="w-4 h-4 text-luxury-cyan" />
            <div>
              <div className="text-[10px] text-white/40">Long/Short</div>
              <div className="text-xs font-mono font-bold text-white">
                {priceData.longShortRatio.toFixed(2)}
              </div>
            </div>
          </div>

          {/* 实时指示器 */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-lg">
            <Activity className="w-4 h-4 text-green-500 animate-pulse" />
            <span className="text-xs text-green-500 font-medium">LIVE</span>
          </div>
        </div>
      </div>

      {/* 多空比例条 */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between text-[10px] text-white/40 mb-1">
          <span>Bulls (Long)</span>
          <span>Bears (Short)</span>
        </div>
        <div className="h-2 bg-void rounded-full overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500"
            style={{
              width: `${(priceData.longShortRatio / (priceData.longShortRatio + 1)) * 100}%`
            }}
          />
          <div
            className="h-full bg-gradient-to-r from-red-400 to-red-600 transition-all duration-500"
            style={{
              width: `${(1 / (priceData.longShortRatio + 1)) * 100}%`
            }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] mt-1">
          <span className="text-green-500 font-mono">
            {((priceData.longShortRatio / (priceData.longShortRatio + 1)) * 100).toFixed(1)}%
          </span>
          <span className="text-red-500 font-mono">
            {((1 / (priceData.longShortRatio + 1)) * 100).toFixed(1)}%
          </span>
        </div>
      </div>

    </div>
  );
};

export default PriceHeader;
