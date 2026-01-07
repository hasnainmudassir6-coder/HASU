import React from 'react';
import { LayoutDashboard, PenLine, Bot, Settings, Activity } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: 'dashboard' | 'log' | 'ai' | 'settings';
  setCurrentView: (view: 'dashboard' | 'log' | 'ai' | 'settings') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setCurrentView }) => {
  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header */}
      <header className="flex-none p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md z-10">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-500" />
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              LifeOS
            </h1>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <div className="max-w-5xl mx-auto p-4 pb-24">
          {children}
        </div>
      </main>

      {/* Bottom Navigation (Mobile Friendly) */}
      <nav className="flex-none bg-slate-900 border-t border-slate-800 pb-safe">
        <div className="flex justify-around items-center max-w-5xl mx-auto h-16">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              currentView === 'dashboard' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="text-[10px] font-medium">Dash</span>
          </button>
          
          <button
            onClick={() => setCurrentView('log')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              currentView === 'log' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <PenLine size={20} />
            <span className="text-[10px] font-medium">Log</span>
          </button>

          <button
            onClick={() => setCurrentView('ai')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              currentView === 'ai' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Bot size={20} />
            <span className="text-[10px] font-medium">AI Agent</span>
          </button>

          <button
            onClick={() => setCurrentView('settings')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              currentView === 'settings' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Settings size={20} />
            <span className="text-[10px] font-medium">Config</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
