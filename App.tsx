import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import DailyLogForm from './components/DailyLogForm';
import Dashboard from './components/Dashboard';
import Assistant from './components/Assistant';
import Settings from './components/Settings';
import { DailyLog } from './types';
import { DAILY_QUESTIONS, MOCK_INITIAL_DATA } from './constants';
import { getTodayString, checkShutdownLock } from './utils/calculations';
import { Power } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'log' | 'ai' | 'settings'>('dashboard');
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [silentMode, setSilentMode] = useState(false);
  const [shutdownLocked, setShutdownLocked] = useState(false);

  // Load data on mount
  useEffect(() => {
    const savedLogs = localStorage.getItem('lifeos_logs');
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    } else {
      setLogs(MOCK_INITIAL_DATA as DailyLog[]);
    }
    
    const savedSilent = localStorage.getItem('lifeos_silent');
    if (savedSilent === 'true') setSilentMode(true);
  }, []);

  // Check locks whenever logs change
  useEffect(() => {
    if (logs.length > 0) {
      const isShutdownLocked = checkShutdownLock(logs);
      setShutdownLocked(isShutdownLocked);
    }
  }, [logs]);

  // Update todayLog whenever logs change
  useEffect(() => {
    const todayStr = getTodayString();
    const existing = logs.find(l => l.date === todayStr);
    
    if (existing) {
      setTodayLog(existing);
    } else {
      setTodayLog({
        date: todayStr,
        answers: {},
        disciplineScore: 0,
        timeIntegrityScore: 100,
        creationRatio: 0,
        pressureLevel: 'LOW',
        shutdownComplete: false,
        synced: false
      });
    }
  }, [logs]);

  const handleSaveLog = (log: DailyLog) => {
    const todayStr = getTodayString();
    
    // Check if updating or creating
    const updatedLogs = logs.filter(l => l.date !== todayStr);
    updatedLogs.push(log);
    
    // Sort
    updatedLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setLogs(updatedLogs);
    localStorage.setItem('lifeos_logs', JSON.stringify(updatedLogs));
    setTodayLog(log);
  };

  const toggleSilentMode = () => {
      const newVal = !silentMode;
      setSilentMode(newVal);
      localStorage.setItem('lifeos_silent', String(newVal));
  };

  // SHUTDOWN LOCK SCREEN
  if (shutdownLocked) {
    return (
        <div className="h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
            <Power className="w-24 h-24 text-indigo-500 mb-6" />
            <h1 className="text-3xl font-bold mb-2">Shutdown Incomplete</h1>
            <p className="text-slate-400 max-w-md mb-8">
                You failed to complete the shutdown ritual yesterday. 
                <br/>
                Complete yesterday's log to unlock today.
            </p>
            {/* 
               In a real app, this would redirect to a specific "Yesterday's Log" view. 
               For this demo, we allow them to go to the log view to fix it, or we could auto-load yesterday.
               Simplification: Just tell them to go to Log.
            */}
            <button 
                onClick={() => setCurrentView('log')}
                className="bg-indigo-600 px-6 py-3 rounded-xl font-bold"
            >
                Fix Log
            </button>
        </div>
    )
  }

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView}>
      {currentView === 'dashboard' && (
        <Dashboard 
            logs={logs} 
            silentMode={silentMode}
            setCurrentView={setCurrentView} // Needed for unlock button
        />
      )}

      {currentView === 'log' && (
        <DailyLogForm 
          existingLog={todayLog || undefined} 
          onSave={handleSaveLog} 
        />
      )}

      {currentView === 'ai' && todayLog && (
        <Assistant 
          todayLog={todayLog} 
          questions={DAILY_QUESTIONS} 
          onUpdateLog={handleSaveLog}
          silentMode={silentMode}
        />
      )}

      {currentView === 'settings' && (
        <Settings 
            logs={logs} 
            silentMode={silentMode}
            toggleSilentMode={toggleSilentMode}
        />
      )}
    </Layout>
  );
};

export default App;
