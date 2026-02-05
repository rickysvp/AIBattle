import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Swords, Trophy, Users, Wallet } from 'lucide-react';

interface TabItem {
  path: string;
  label: string;
  icon: React.ElementType;
  activeIcon: React.ElementType;
  gradient: string;
}

const tabs: TabItem[] = [
  { 
    path: '/', 
    label: '竞技场', 
    icon: Swords, 
    activeIcon: Swords,
    gradient: 'from-luxury-rose to-luxury-purple'
  },
  { 
    path: '/tournament', 
    label: '锦标赛', 
    icon: Trophy, 
    activeIcon: Trophy,
    gradient: 'from-luxury-gold to-luxury-amber'
  },
  { 
    path: '/squad', 
    label: '小队', 
    icon: Users, 
    activeIcon: Users,
    gradient: 'from-luxury-cyan to-luxury-purple'
  },
  { 
    path: '/wallet', 
    label: '钱包', 
    icon: Wallet, 
    activeIcon: Wallet,
    gradient: 'from-luxury-green to-luxury-cyan'
  },
];

const TabBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/95 to-transparent h-24 -top-8" />
      
      {/* 玻璃态背景 */}
      <div className="absolute inset-0 glass-strong border-t border-white/5" />
      
      {/* 顶部光线 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-luxury-purple/30 to-transparent" />
      
      <div className="relative max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            const Icon = isActive ? tab.activeIcon : tab.icon;
            
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="relative flex flex-col items-center justify-center w-20 h-full group"
              >
                {/* 激活背景 */}
                {isActive && (
                  <>
                    {/* 发光背景 */}
                    <div className={`absolute inset-x-2 -top-1 h-14 bg-gradient-to-b ${tab.gradient} opacity-20 blur-xl rounded-full`} />
                    
                    {/* 顶部指示器 */}
                    <div className={`absolute -top-px left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r ${tab.gradient} rounded-full`} />
                    
                    {/* 底部光晕 */}
                    <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-8 bg-gradient-to-t ${tab.gradient} opacity-10 blur-lg rounded-full`} />
                  </>
                )}
                
                {/* 图标容器 */}
                <div className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? `bg-gradient-to-br ${tab.gradient} shadow-lg scale-110` 
                    : 'bg-white/5 group-hover:bg-white/10'
                }`}>
                  <Icon 
                    className={`w-5 h-5 transition-all duration-300 ${
                      isActive 
                        ? 'text-white drop-shadow-lg' 
                        : 'text-white/50 group-hover:text-white/80'
                    }`} 
                  />
                  
                  {/* 激活时的光晕 */}
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${tab.gradient} blur-md -z-10 opacity-50`} />
                  )}
                </div>
                
                {/* 标签文字 */}
                <span className={`mt-1 text-[10px] font-medium tracking-wide transition-all duration-300 ${
                  isActive 
                    ? 'text-white font-semibold' 
                    : 'text-white/40 group-hover:text-white/60'
                }`}>
                  {tab.label}
                </span>
                
                {/* 悬停效果 */}
                {!isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-t ${tab.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg`} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default TabBar;
