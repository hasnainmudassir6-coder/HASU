import React, { useState } from 'react';
import { DailyLog } from '../types';
import { generateWeeklyReport } from '../services/geminiService';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Award, Brain, Clock, ShieldAlert, Lock, FileText, Loader2, Gauge, Zap, Skull, Compass } from 'lucide-react';
import { checkLockout, calculateStrictStreak } from '../utils/calculations';

interface DashboardProps {
  logs: DailyLog[];
  silentMode: boolean;
  setCurrentView: (view: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ logs, silentMode, setCurrentView }) => {
  const [report, setReport] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-7);
  const today = logs.find(l => l.date === new Date().toISOString().split('T')[0]);
  const isLocked = checkLockout(logs);
  const streak = calculateStrictStreak(logs);

  if (isLocked) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <Lock className="w-24 h-24 text-red-600 mb-6" />
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tighter">ACCESS DENIED</h1>
        <p className="text-slate-400 max-w-md mb-8">
          You have missed 2 consecutive days. The system has locked your analytics and browsing history.
        </p>
        <button 
          onClick={() => setCurrentView('log')}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-xl tracking-wide uppercase shadow-lg shadow-red-900/20"
        >
          Resume Discipline
        </button>
      </div>
    );
  }

  const handleGenerateReport = async () => {
    setLoadingReport(true);
    const text = await generateWeeklyReport(logs);
    setReport(text);
    setLoadingReport(false);
  };

  const StatCard = ({ icon: Icon, label, value, subtext, alert }: any) => (
    <div className={`p-4 rounded-xl border flex items-start gap-4 ${alert ? 'bg-red-900/20 border-red-800' : 'bg-slate-900 border-slate-800'}`}>
      <div className={`p-3 rounded-lg ${alert ? 'bg-red-900/30 text-red-500' : 'bg-slate-800 text-indigo-400'}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className={`text-xs font-medium uppercase tracking-wider ${alert ? 'text-red-400' : 'text-slate-400'}`}>{label}</p>
        <h4 className="text-2xl font-bold text-white">{value}</h4>
        {subtext && <p className="text-slate-500 text-xs mt-1">{subtext}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Daily Direction Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-6 rounded-xl border-l-4 border-indigo-500 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10"><Compass size={64} /></div>
        <div className="relative z-10">
          <h3 className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1">Today's Direction</h3>
          <p className="text-xl md:text-2xl font-bold text-white leading-tight">
            {today?.dailyDirection || "Log your data to receive your orders."}
          </p>
        </div>
      </div>

      {/* Reality Check */}
      {today?.realityCheck && (
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-slate-400 text-sm italic border-l-2 border-l-red-500">
            <span className="text-red-500 font-bold not-italic">REALITY CHECK: </span> 
            {today.realityCheck}
          </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          icon={TrendingUp} 
          label="Discipline Streak" 
          value={streak}
          subtext="Strict Days" 
          alert={streak === 0}
        />
        <StatCard 
          icon={Gauge} 
          label="Pressure Level" 
          value={today?.pressureLevel || "N/A"} 
          subtext="Based on Output"
          alert={today?.pressureLevel === 'HIGH'}
        />
        <StatCard 
          icon={Zap} 
          label="Creation Ratio" 
          value={today?.creationRatio || 0} 
          subtext="Goal: > 0.5"
          alert={(today?.creationRatio || 1) < 0.3}
        />
        <StatCard 
          icon={Skull} 
          label="Time Integrity" 
          value={today?.timeIntegrityScore || 0} 
          alert={(today?.timeIntegrityScore || 100) < 60}
        />
      </div>

      {/* Warning Banners */}
      {(today?.creationRatio || 1) < 0.3 && (
        <div className="bg-red-900/20 border border-red-800 text-red-200 p-3 rounded-lg flex items-center gap-3 text-sm">
            <ShieldAlert size={16} />
            <span><strong>CONSUMER DAY DETECTED.</strong> Ratio is below 0.3. Create more.</span>
        </div>
      )}

      {/* Weekly Truth Report */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-slate-300 font-bold flex items-center gap-2"><FileText size={18}/> Weekly Truth Report</h3>
            <button 
                onClick={handleGenerateReport} 
                disabled={loadingReport}
                className="text-xs bg-indigo-600 px-3 py-1 rounded text-white hover:bg-indigo-500"
            >
                {loadingReport ? <Loader2 className="animate-spin" size={12}/> : "Generate"}
            </button>
        </div>
        {report ? (
            <div className="bg-slate-950 p-4 rounded border border-slate-800 text-sm text-slate-300 whitespace-pre-wrap font-mono">
                {report}
            </div>
        ) : (
            <p className="text-slate-500 text-sm">Generate a blunt, factual report of your last 7 days.</p>
        )}
      </div>

      {/* Charts */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
        <h3 className="text-slate-300 font-bold mb-4">Creation vs Consumption</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedLogs}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="date" tick={{fontSize: 10, fill: '#94a3b8'}} tickFormatter={(str) => str.slice(5)} />
              <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} />
              <Tooltip cursor={{fill: '#334155', opacity: 0.4}} contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
              <Bar dataKey="answers.creationMinutes" name="Creation" fill="#10b981" stackId="a" />
              <Bar dataKey="answers.consumptionMinutes" name="Consumption" fill="#ef4444" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
