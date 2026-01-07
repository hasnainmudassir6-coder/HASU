import React from 'react';
import { DailyLog } from '../types';
import { Download, UploadCloud, Database, Moon } from 'lucide-react';

interface SettingsProps {
  logs: DailyLog[];
  silentMode: boolean;
  toggleSilentMode: () => void;
}

const Settings: React.FC<SettingsProps> = ({ logs, silentMode, toggleSilentMode }) => {
  
  const handleExportCSV = () => {
    const headers = ['Date', 'Discipline Score', 'Time Integrity', ...Object.keys(logs[0]?.answers || {})];
    const rows = logs.map(log => [
      log.date,
      log.disciplineScore,
      log.timeIntegrityScore,
      ...Object.values(log.answers || {})
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "lifeos_master_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSyncMock = () => {
    alert("Sync initiated.");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">System Config</h2>

      {/* Silent Mode */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex items-center justify-between">
         <div>
            <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <Moon size={20} />
                <h3 className="font-bold text-white">Silent Discipline Mode</h3>
            </div>
            <p className="text-slate-400 text-xs max-w-[200px]">
                Disable motivational messages. Only data, penalties, and reports.
            </p>
         </div>
         <button 
            onClick={toggleSilentMode}
            className={`w-14 h-8 rounded-full p-1 transition-colors ${silentMode ? 'bg-indigo-600' : 'bg-slate-700'}`}
         >
            <div className={`w-6 h-6 rounded-full bg-white transition-transform ${silentMode ? 'translate-x-6' : ''}`} />
         </button>
      </div>

      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-3 text-indigo-400 mb-2">
            <Database size={20} />
            <h3 className="font-bold text-white">Data Sovereignty</h3>
        </div>
        <p className="text-slate-400 text-sm">
            Export all data points including decisions and integrity scores.
        </p>

        <button 
          onClick={handleExportCSV}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 border border-slate-700 transition-colors"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-3 text-green-400 mb-2">
            <UploadCloud size={20} />
            <h3 className="font-bold text-white">Google Sheets Sync</h3>
        </div>
        <button 
          onClick={handleSyncMock}
          className="w-full bg-green-900/50 hover:bg-green-900/70 text-green-100 py-3 rounded-lg flex items-center justify-center gap-2 border border-green-800 transition-colors"
        >
          <UploadCloud size={16} /> Sync Now
        </button>
      </div>
    </div>
  );
};

export default Settings;
