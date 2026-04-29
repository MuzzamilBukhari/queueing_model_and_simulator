"use client";

import { Settings, BarChart3, Home as HomeIcon, Calculator } from 'lucide-react';
import Image from 'next/image';

export type AppTab = 'home' | 'models' | 'simulator' | 'mathengine';

interface SidebarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ activeTab, onTabChange, isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { id: 'home' as const, label: 'Home', icon: HomeIcon },
    { id: 'models' as const, label: 'Queueing Models', icon: BarChart3 },
    { id: 'simulator' as const, label: 'Simulator', icon: Settings },
    { id: 'mathengine' as const, label: 'Math Engine', icon: Calculator },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed left-0 top-0 h-screen w-72 bg-white dark:bg-slate-900 
        border-r border-slate-200 dark:border-slate-800 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)] flex flex-col z-50
        transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* App Title & Logo */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-500 overflow-hidden flex items-center justify-center p-1 shadow-lg shadow-brand-500/20">
            <Image src="/logo.png" alt="OptiQueue Logo" width={32} height={32} className="object-contain" priority />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-400 dark:from-brand-400 dark:to-brand-200 tracking-tight">
              OptiQueue
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">ADVANCED SIMULATION</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
               <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3.5 rounded-xl
                  transition-all duration-300 font-semibold text-sm group relative overflow-hidden
                  ${
                    isActive
                      ? 'text-brand-700 dark:text-brand-300 shadow-sm bg-brand-50 dark:bg-brand-500/10'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 rounded-r-full" />
                )}
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              v1.0.0
            </p>
            <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
          </div>
        </div>
      </aside>
    </>
  );
}
