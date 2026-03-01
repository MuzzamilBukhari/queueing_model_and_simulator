"use client";

import { Settings, BarChart3 } from 'lucide-react';

interface SidebarProps {
  activeTab: 'models' | 'simulator';
  onTabChange: (tab: 'models' | 'simulator') => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: 'models' as const, label: 'Queueing Models', icon: BarChart3 },
    { id: 'simulator' as const, label: 'Simulator', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-62.5 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
      {/* App Title */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
          Queueing Model and Simulator
        </h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200 font-medium text-sm
                ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          v1.0.0
        </p>
      </div>
    </aside>
  );
}
