import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Swords, Trophy, Users, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

interface TabItem {
  path: string;
  icon: React.ElementType;
  label: string;
  color: string;
  gradient: string;
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
      color: '#f43f5e',
      gradient: 'from-rose-500 via-pink-500 to-purple-500'
    },
    {
      path: '/tournament',
      icon: Trophy,
      label: t('nav.tournament'),
      color: '#f59e0b',
      gradient: 'from-amber-400 via-orange-500 to-red-500'
    },
    {
      path: '/squad',
      icon: Users,
      label: t('nav.squad'),
      color: '#06b6d4',
      gradient: 'from-cyan-400 via-blue-500 to-indigo-500'
    },
    {
      path: '/wallet',
      icon: Wallet,
      label: t('nav.wallet'),
      color: '#10b981',
      gradient: 'from-emerald-400 via-teal-500 to-cyan-500'
    }
  ];

  const activeIndex = tabs.findIndex(tab => tab.path === location.pathname);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* 顶部渐变遮罩 - 降低高度 */}
      <div className="absolute bottom-full left-0 right-0 h-8 bg-gradient-to-t from-void via-void/60 to-transparent pointer-events-none" />

      {/* TabBar容器 */}
      <div className="relative bg-void-panel/80 backdrop-blur-md border-t border-white/5">
        {/* 顶部光线 - 全宽 */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="max-w-screen-lg mx-auto px-4">
          <div className="flex items-center justify-around py-1">
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
                  className="relative flex flex-col items-center justify-center py-2 px-4 min-w-[80px] flex-1"
                  whileTap={{ scale: 0.95 }}
                >
                  {/* 激活指示器 - 顶部光条 - 全宽 */}
                  <motion.div
                    className="absolute -top-2 left-0 right-0 h-1 rounded-full"
                    style={{ backgroundColor: tab.color }}
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      scaleX: isActive ? 1 : 0
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />

                  {/* 激活背景光晕 */}
                  <motion.div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${tab.gradient}`}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: isActive ? 0.15 : 0
                    }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* 悬停背景 */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-white/5"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: !isActive && isHovered ? 1 : 0
                    }}
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
                    {/* 图标背景 */}
                    <motion.div
                      className={`absolute inset-0 rounded-xl bg-gradient-to-br ${tab.gradient}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: isActive ? 1 : 0,
                        scale: isActive ? 1 : 0.8
                      }}
                      transition={{ duration: 0.3 }}
                      style={{ padding: '8px' }}
                    />

                    <div className="relative p-2">
                      <Icon
                        className="w-6 h-6 transition-colors duration-300"
                        style={{
                          color: isActive ? '#ffffff' : isHovered ? tab.color : 'rgba(255,255,255,0.5)'
                        }}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </div>

                    {/* 激活发光效果 */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: `radial-gradient(circle, ${tab.color}40 0%, transparent 70%)`,
                          filter: 'blur(8px)'
                        }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1.5 }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                  </motion.div>

                  {/* 标签文字 */}
                  <motion.span
                    className="text-xs font-medium transition-colors duration-300"
                    style={{
                      color: isActive ? '#ffffff' : isHovered ? tab.color : 'rgba(255,255,255,0.5)'
                    }}
                    animate={{
                      y: isActive ? 0 : 0
                    }}
                  >
                    {tab.label}
                  </motion.span>

                  {/* 未读红点 */}
                  {index === 3 && (
                    <motion.div
                      className="absolute top-2 right-3 w-2 h-2 rounded-full"
                      style={{ backgroundColor: tab.color }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* 底部安全区域（移动端） */}
        <div className="h-safe-area-inset-bottom bg-void-panel/80" />
      </div>
    </nav>
  );
};

export default TabBar;
