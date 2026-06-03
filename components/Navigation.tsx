import React from 'react';
import { Sprout, BookOpen, Activity } from 'lucide-react';
import { AppView } from '../types';

interface NavigationProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onChangeView }) => {
  const navItems = [
    { id: AppView.DASHBOARD, label: 'Minha Horta', icon: Sprout },
    { id: AppView.ENCYCLOPEDIA, label: 'Guia do Cultivador', icon: BookOpen },
    { id: AppView.HEALTH, label: 'Saúde', icon: Activity },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] rounded-t-3xl z-50 pb-safe">
      <div className="flex justify-around items-center h-20 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`flex flex-col items-center justify-center w-20 transition-all duration-300 ${
                isActive ? '-mt-6' : ''
              }`}
            >
              <div
                className={`p-3 rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'bg-horta-main text-white shadow-lg scale-110 ring-4 ring-white' 
                    : 'bg-transparent text-gray-400'
                }`}
              >
                <Icon size={28} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span 
                className={`text-xs font-bold mt-1 transition-opacity duration-300 ${
                  isActive ? 'text-horta-dark opacity-100' : 'text-gray-400 opacity-70'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};