import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { Wallet, LogOut, Zap, Sparkles } from 'lucide-react';
import ConnectWalletModal from './ConnectWalletModal';

const Header: React.FC = () => {
  const { wallet, connectWallet, disconnectWallet } = useGameStore();
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);

  const handleConnect = (type: 'twitter' | 'google' | 'wallet') => {
    connectWallet(type);
    setShowConnectModal(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass-strong shadow-luxury'
          : 'bg-transparent'
      }`}
    >
        <div className="max-w-screen-xl mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-4 group cursor-pointer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="relative">
            {/* 发光背景 */}
            <div className={`absolute inset-0 bg-gradient-to-br from-luxury-purple to-luxury-cyan rounded-xl blur-xl transition-opacity duration-300 ${hovered ? 'opacity-60' : 'opacity-40'}`} />

            {/* Logo 图标 */}
            <div className="relative w-12 h-12 bg-gradient-to-br from-void-panel to-void-elevated rounded-xl border border-luxury-purple/30 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-luxury-purple/20 to-luxury-cyan/20" />
              <span className="relative text-2xl font-bold text-gradient font-display">A</span>

              {/* 装饰角标 */}
              <div className="absolute top-0 right-0 w-3 h-3 bg-luxury-gold rounded-bl-lg" />
            </div>

            {/* 脉冲动画 */}
            <div className="absolute -inset-1 bg-gradient-to-r from-luxury-purple via-luxury-cyan to-luxury-purple rounded-xl opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-300" />
          </div>

          <div>
            <h1 className="text-2xl font-bold font-display text-white tracking-wider">
              AI<span className="text-gradient">rena</span>
            </h1>
            <p className="text-xs text-white/40 font-mono tracking-widest uppercase">Agent 2 Earn</p>
          </div>
        </div>

        {/* 钱包连接 */}
        <div className="flex items-center gap-4">
          {wallet.connected ? (
            <>
              {/* 余额显示卡片 */}
              <div className="hidden md:flex items-center gap-1 glass rounded-xl px-4 py-2 border border-white/5">
                <div className="flex items-center gap-3 pr-4 border-r border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-luxury-gold/20 to-luxury-amber/20 border border-luxury-gold/30 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-luxury-gold" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Balance</p>
                    <p className="text-sm font-bold text-luxury-gold font-mono">{wallet.balance.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pl-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-luxury-purple/20 to-luxury-rose/20 border border-luxury-purple/30 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-luxury-purple-light" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Locked</p>
                    <p className="text-sm font-bold text-luxury-purple-light font-mono">{wallet.lockedBalance.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* 用户信息下拉菜单 */}
              <div className="relative">
                <button
                  onClick={() => setShowWalletMenu(!showWalletMenu)}
                  className="flex items-center gap-3 glass rounded-xl px-3 py-2 border border-white/10 hover:border-white/20 transition-colors"
                >
                  <img
                    src={wallet.avatar}
                    alt="avatar"
                    className="w-8 h-8 rounded-full border border-white/20"
                  />
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">{wallet.nickname}</p>
                    <p className="text-[10px] text-white/40">
                      {wallet.loginType === 'wallet' ? `0x...${wallet.address.slice(-6)}` : wallet.loginType}
                    </p>
                  </div>
                </button>

                {/* 下拉菜单 */}
                {showWalletMenu && (
                  <div className="absolute top-full right-0 mt-2 w-56 glass-strong rounded-xl border border-white/10 p-4 z-50 animate-scale-in">
                    {/* 用户信息 */}
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                      <img
                        src={wallet.avatar}
                        alt="avatar"
                        className="w-12 h-12 rounded-full border border-white/20"
                      />
                      <div>
                        <p className="font-bold text-white">{wallet.nickname}</p>
                        <p className="text-xs text-white/40">
                          {wallet.loginType === 'wallet' ? `Wallet: 0x...${wallet.address.slice(-6)}` : `Login: ${wallet.loginType}`}
                        </p>
                      </div>
                    </div>

                    {/* 余额信息 */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/40">Balance</span>
                        <span className="text-luxury-gold font-mono">{wallet.balance.toLocaleString()} $MON</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/40">Locked</span>
                        <span className="text-luxury-purple-light font-mono">{wallet.lockedBalance.toLocaleString()} $MON</span>
                      </div>
                    </div>

                    {/* 断开连接按钮 - 放在最下面 */}
                    <button
                      onClick={() => {
                        disconnectWallet();
                        setShowWalletMenu(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-luxury-rose/10 border border-luxury-rose/30 text-luxury-rose hover:bg-luxury-rose/20 transition-colors text-sm font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => setShowConnectModal(true)}
              className="group relative px-8 py-3 overflow-hidden rounded-xl transition-all duration-300"
            >
              {/* 背景渐变 */}
              <div className="absolute inset-0 bg-gradient-to-r from-luxury-purple via-luxury-purple-light to-luxury-cyan opacity-90 group-hover:opacity-100 transition-opacity" />

              {/* 闪光效果 */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

              {/* 内容 */}
              <span className="relative flex items-center gap-2 text-white font-semibold font-display tracking-wide">
                <Wallet className="w-5 h-5" />
                Connect
              </span>
            </button>
          )}

      {/* 连接钱包弹窗 */}
      <ConnectWalletModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onConnect={handleConnect}
      />
        </div>
      </div>

      {/* 底部渐变线 */}
      <div className={`h-px bg-gradient-to-r from-transparent via-luxury-purple/50 to-transparent transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0'}`} />
    </header>
  );
};

export default Header;
