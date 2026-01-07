import React, { useState, useEffect } from 'react';
import { DAILY_QUESTIONS } from '../constants';
import { DailyLog, QuestionType } from '../types';
import { calculateDisciplineScore, calculateTimeIntegrityScore, calculateCreationRatio, calculatePressureLevel, getTodayString } from '../utils/calculations';
import { Save, CheckCircle2, Camera, Fingerprint, Gavel, CheckCircle, Zap, DollarSign, Power } from 'lucide-react';

interface DailyLogFormProps {
  existingLog?: DailyLog;
  onSave: (log: DailyLog) => void;
}

const DailyLogForm: React.FC<DailyLogFormProps> = ({ existingLog, onSave }) => {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (existingLog) {
      setAnswers(existingLog.answers);
      setPhoto(existingLog.photoUrl || null);
    }
  }, [existingLog]);

  const handleChange = (id: string, value: any) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
    setIsSaved(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const disciplineScore = calculateDisciplineScore(answers);
    const timeIntegrityScore = calculateTimeIntegrityScore(answers);
    const creationRatio = calculateCreationRatio(answers);
    const pressureLevel = calculatePressureLevel(answers);
    
    // Check if shutdown is complete (all shutdown fields answered)
    const shutdownFields = DAILY_QUESTIONS.filter(q => q.category === 'shutdown').map(q => q.id);
    const shutdownComplete = shutdownFields.every(id => answers[id] !== undefined && answers[id] !== '');

    const log: DailyLog = {
      date: existingLog?.date || getTodayString(),
      answers,
      disciplineScore,
      timeIntegrityScore,
      creationRatio,
      pressureLevel,
      shutdownComplete,
      synced: false,
      photoUrl: photo || undefined,
      aiAnalysis: existingLog?.aiAnalysis,
      dailyDirection: existingLog?.dailyDirection,
      realityCheck: existingLog?.realityCheck,
      thinkingQuality: existingLog?.thinkingQuality
    };
    onSave(log);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const renderGroup = (title: string, icon: any, categoryFilter: string) => {
    const questions = DAILY_QUESTIONS.filter(q => q.category === categoryFilter);
    if (questions.length === 0) return null;

    return (
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 mb-6">
        <h3 className="text-indigo-400 uppercase text-xs font-bold tracking-wider mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
          {icon} {title}
        </h3>
        <div className="space-y-4">
          {questions.map(q => (
            <div key={q.id} className="space-y-1">
              <label className="block text-sm font-medium text-slate-300">
                {q.label}
              </label>
              
              {q.type === QuestionType.NUMBER && (
                <input
                  type="number"
                  value={answers[q.id] || ''}
                  onChange={(e) => handleChange(q.id, Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="0"
                />
              )}

              {q.type === QuestionType.BOOLEAN && (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleChange(q.id, true)}
                    className={`flex-1 py-2 rounded-lg border ${answers[q.id] === true ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-700 text-slate-400'}`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleChange(q.id, false)}
                    className={`flex-1 py-2 rounded-lg border ${answers[q.id] === false ? 'bg-red-900/50 border-red-800 text-white' : 'bg-slate-950 border-slate-700 text-slate-400'}`}
                  >
                    No
                  </button>
                </div>
              )}

              {q.type === QuestionType.SCALE && (
                <div className="flex justify-between gap-1">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      onClick={() => handleChange(q.id, num)}
                      className={`w-full py-2 rounded-md text-sm font-bold transition-all ${
                        answers[q.id] === num 
                        ? 'bg-indigo-500 text-white scale-110' 
                        : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              )}

              {q.type === QuestionType.SELECT && (
                <select
                  value={answers[q.id] || ''}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Select...</option>
                  {q.options?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}

              {q.type === QuestionType.TEXT && (
                <textarea
                  value={answers[q.id] || ''}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none"
                  placeholder="Type here..."
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Daily Protocol</h2>
        <div className="text-sm px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
          {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 mb-6">
        <h3 className="text-indigo-400 uppercase text-xs font-bold tracking-wider mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
           <Camera size={16} /> Identity Proof
        </h3>
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 rounded-lg hover:border-indigo-500 transition-colors bg-slate-950">
          {photo ? (
            <div className="relative w-full">
              <img src={photo} alt="Daily Check" className="w-full h-64 object-cover rounded-lg" />
              <button 
                onClick={() => setPhoto(null)}
                className="absolute top-2 right-2 bg-red-600 p-2 rounded-full text-white shadow-lg"
              >
                X
              </button>
            </div>
          ) : (
            <>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="daily-photo" />
              <label htmlFor="daily-photo" className="cursor-pointer flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-2">
                  <Camera className="text-slate-400" />
                </div>
                <span className="text-sm text-slate-300 font-bold">Upload Daily Face Check</span>
              </label>
            </>
          )}
        </div>
        <div className="mt-6">
           {renderGroup('Self Analysis', <Fingerprint size={16} />, 'identity')}
        </div>
      </div>

      {renderGroup('Work & Creation', <Zap size={16} />, 'work')}
      {renderGroup('Decision Log', <Gavel size={16} />, 'decisions')}
      {renderGroup('Energy & Health', <CheckCircle size={16} />, 'energy')}
      {renderGroup('Discipline', <CheckCircle2 size={16} />, 'discipline')}
      {renderGroup('Money Awareness', <DollarSign size={16} />, 'money')}
      
      {/* Shutdown Ritual - Visually Distinct */}
      <div className="border border-indigo-900/50 rounded-xl overflow-hidden">
        <div className="bg-indigo-900/20 p-4 border-b border-indigo-900/50">
           <h3 className="text-indigo-400 uppercase text-xs font-bold tracking-wider flex items-center gap-2">
             <Power size={16} /> Daily Shutdown Ritual
           </h3>
           <p className="text-xs text-indigo-300 mt-1">Mandatory for dashboard access tomorrow.</p>
        </div>
        <div className="p-4 bg-slate-950">
           {DAILY_QUESTIONS.filter(q => q.category === 'shutdown').map(q => (
             <div key={q.id} className="mb-4">
                 <label className="block text-sm font-medium text-slate-300 mb-1">{q.label}</label>
                 {q.type === QuestionType.BOOLEAN && (
                    <div className="flex gap-2">
                        <button onClick={() => handleChange(q.id, true)} className={`flex-1 py-2 rounded border ${answers[q.id] ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>Yes</button>
                        <button onClick={() => handleChange(q.id, false)} className={`flex-1 py-2 rounded border ${answers[q.id] === false ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>No</button>
                    </div>
                 )}
                 {q.type === QuestionType.TEXT && (
                     <input type="text" value={answers[q.id] || ''} onChange={(e) => handleChange(q.id, e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
                 )}
             </div>
           ))}
        </div>
      </div>

      <div className="sticky bottom-4 z-20 mt-6">
        <button
          onClick={handleSave}
          disabled={!photo} 
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all ${
            isSaved 
            ? 'bg-green-600 text-white' 
            : !photo 
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
              : 'bg-indigo-600 text-white hover:bg-indigo-500'
          }`}
        >
          {!photo ? "Upload Photo to Submit" : isSaved ? <><CheckCircle2 /> Saved!</> : <><Save /> Submit Log</>}
        </button>
      </div>
    </div>
  );
};

export default DailyLogForm;
