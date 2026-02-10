import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Swords, Users, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

interface TabItem {
  path: string;
  icon: React.ElementType;
  label: string;
}

const TabBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const tabs: TabItem[] = [
    {
      path: '/',
      icon: Swords,
      label: t('nav.arena'),
    },
    {
      path: '/squad',
      icon: Users,
      label: t('nav.squad'),
    },
    {
      path: '/wallet',
      icon: Wallet,
      label: t('nav.wallet'),
    }
  ];

  const activeIndex = tabs.findIndex(tab => tab.path === location.pathname);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* 顶部渐变遮罩 */}
      <div className="absolute bottom-full left-0 right-0 h-12 bg-gradient-to-t from-[#0a0a10] via-[#0a0a10]/80 to-transparent pointer-events-none" />

      {/* TabBar容器 - 新主题风格 */}
      <div className="relative bg-[#0a0a10]/90 backdrop-blur-xl border-t border-white/5">
        {/* 顶部霓虹光线 */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-cyan-500/50" />

        <div className="max-w-screen-lg mx-auto">
          {/* 桌面端 */}
          <div className="hidden sm:flex items-center justify-around py-2 px-4">
            {tabs.map((tab, index) => {
              const isActive = index === activeIndex;
              const isHovered = index === hoveredIndex;
              const Icon = tab.icon;

              return (
                <motion.button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="relative flex flex-col items-center justify-center py-3 px-6 min-w-[100px]"
                  whileTap={{ scale: 0.95 }}
                >
                  {/* 激活背景光晕 */}
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: isActive 
                        ? 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%)'
                        : 'transparent'
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isActive ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* 悬停背景 */}
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-white/[0.03]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: !isActive && isHovered ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                  />

                  {/* 图标容器 */}
                  <motion.div
                    className="relative mb-1"
                    animate={{
                      y: isActive ? -2 : 0,
                      scale: isActive ? 1.1 : 1
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    {/* 激活图标背景 */}
                    <motion.div
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: isActive 
                          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%)'
                          : 'transparent',
                        border: isActive ? '1px solid rgba(59, 130, 246, 0.5)' : 'none'
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: isActive ? 1 : 0,
                        scale: isActive ? 1 : 0.8
                      }}
                      transition={{ duration: 0.3 }}
                    />

                    <div className="relative p-2">
                      <Icon
                        className="w-5 h-5 transition-all duration-300"
                        style={{
                          color: isActive 
                            ? '#60a5fa' 
                            : isHovered 
                              ? '#93c5fd' 
                              : 'rgba(255,255,255,0.4)'
                        }}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </div>

                    {/* 激活发光效果 */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-lg"
                        style={{
                          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
                          filter: 'blur(10px)'
                        }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1.5 }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                  </motion.div>

                  {/* 标签文字 */}
                  <motion.span
                    className="text-[11px] font-medium tracking-wide uppercase transition-colors duration-300"
                    style={{
                      color: isActive 
                        ? '#60a5fa' 
                        : isHovered 
                          ? '#93c5fd' 
                          : 'rgba(255,255,255,0.4)'
                    }}
                  >
                    {tab.label}
                  </motion.span>
                </motion.button>
              );
            })}
          </div>

          {/* 移动端 */}
          <div className="flex sm:hidden items-center justify-around py-2 px-4">
            {tabs.map((tab, index) => {
              const isActive = index === activeIndex;
              const Icon = tab.icon;

              return (
                <motion.button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className="relative flex flex-col items-center justify-center py-2 px-4 min-w-[70px]"
                  whileTap={{ scale: 0.9 }}
                >
                  {/* 激活指示器 */}
                  <motion.div
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      scaleX: isActive ? 1 : 0
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />

                  {/* 激活背景 */}
                  <motion.div
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: isActive 
                        ? 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.2) 0%, transparent 70%)'
                        : 'transparent'
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isActive ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* 图标 */}
                  <motion.div
                    className="relative"
                    animate={{
                      y: isActive ? -1 : 0,
                      scale: isActive ? 1.1 : 1
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <Icon
                      className="w-5 h-5 transition-colors duration-300"
                      style={{
                        color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.4)'
                      }}
                      strokeWidth={isActive ? 2.5 : 2}
                    />

                    {/* 激活发光 */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-md"
                        style={{
                          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, transparent 70%)',
                          filter: 'blur(8px)'
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </motion.div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* 底部安全区域 */}
        <div className="h-safe-area-inset-bottom bg-[#0a0a10]/90" />
      </div>
    </nav>
  );
};

export default TabBar;
