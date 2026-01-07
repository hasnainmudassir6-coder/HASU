import { DailyLog } from "../types";

export const calculateDisciplineScore = (answers: Record<string, any>): number => {
  let score = 50;
  const namaz = Number(answers['namaz'] || 0);
  score += namaz * 4; 
  if (answers['exercise']) score += 10;
  
  // Strict Creation Bonus
  const creation = Number(answers['creationMinutes'] || 0);
  if (creation > 120) score += 15;
  else if (creation > 60) score += 5;

  // Strict Consumption Penalty
  const consumption = Number(answers['consumptionMinutes'] || 0);
  if (consumption > 120) score -= 10;
  if (consumption > 240) score -= 20;

  return Math.min(100, Math.max(0, score));
};

export const calculateTimeIntegrityScore = (answers: Record<string, any>): number => {
  let score = 100;
  const consumption = Number(answers['consumptionMinutes'] || 0);
  const creation = Number(answers['creationMinutes'] || 0);
  
  // Lose 1 point for every 5 mins of consumption
  score -= Math.round(consumption / 5);

  // If consumption > creation, major penalty
  if (consumption > creation) {
    score -= 15;
  }

  return Math.min(100, Math.max(0, score));
};

export const calculateCreationRatio = (answers: Record<string, any>): number => {
  const created = Number(answers['creationMinutes'] || 0);
  const consumed = Number(answers['consumptionMinutes'] || 0);
  const total = created + consumed;
  if (total === 0) return 0;
  return Number((created / total).toFixed(2));
};

export const calculatePressureLevel = (answers: Record<string, any>): 'LOW' | 'MEDIUM' | 'HIGH' => {
  // Logic: 
  // High Pressure = High Consumption OR Low Creation OR Low Namaz
  // Low Pressure = High Creation AND Low Consumption
  
  const consumption = Number(answers['consumptionMinutes'] || 0);
  const creation = Number(answers['creationMinutes'] || 0);
  const namaz = Number(answers['namaz'] || 0);

  if (consumption > 180 || namaz < 5) return 'HIGH'; // Mandatory Discomfort
  if (creation > 120 && consumption < 60) return 'LOW'; // Maintenance
  return 'MEDIUM'; // Stretch
};

export const checkLockout = (logs: DailyLog[]): boolean => {
  if (logs.length === 0) return false;
  
  const sorted = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastLogDate = new Date(sorted[0].date);
  const today = new Date();
  
  lastLogDate.setHours(0,0,0,0);
  today.setHours(0,0,0,0);

  const diffTime = Math.abs(today.getTime() - lastLogDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Anti-Escape Rule: Miss 2 days = Lock
  return diffDays > 2;
};

export const checkShutdownLock = (logs: DailyLog[]): boolean => {
  // Logic: If yesterday exists but shutdown is NOT complete, lock today.
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const yesterdayLog = logs.find(l => l.date === yesterdayStr);
  
  if (yesterdayLog && !yesterdayLog.shutdownComplete) {
    return true; // Locked because yesterday wasn't closed properly
  }
  return false;
};

export const calculateStrictStreak = (logs: DailyLog[]): number => {
  let streak = 0;
  const sorted = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Today or Yesterday must allow streak continuance
  const todayStr = getTodayString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // If no log for today AND no log for yesterday, streak is broken immediately
  if (sorted.length > 0 && sorted[0].date !== todayStr && sorted[0].date !== yesterdayStr) {
      return 0;
  }

  for (let i = 0; i < sorted.length; i++) {
    const log = sorted[i];
    
    // Streak Rules:
    // 1. Namaz = 5 (Assuming 5 is required for strictness, or at least > 0)
    // 2. Creation > 0
    // 3. Photo exists
    const namaz = Number(log.answers['namaz'] || 0);
    const creation = Number(log.answers['creationMinutes'] || 0);
    const hasPhoto = !!log.photoUrl;

    if (namaz < 5 || creation === 0 || !hasPhoto) {
      break; // Streak ends
    }
    streak++;
    
    // Check gap
    if (i < sorted.length - 1) {
       const curr = new Date(log.date);
       const prev = new Date(sorted[i+1].date);
       const diff = (curr.getTime() - prev.getTime()) / (1000 * 3600 * 24);
       if (diff > 1.5) break; // Gap larger than 1 day
    }
  }
  return streak;
};

export const getTodayString = () => new Date().toISOString().split('T')[0];
