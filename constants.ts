import { Question, QuestionType, DailyLog } from './types';

export const DAILY_QUESTIONS: Question[] = [
  // 1. IDENTITY & VISUAL PROOF (Mandatory)
  { id: 'faceMatch', label: 'Did your face today match the man you want to become?', type: QuestionType.BOOLEAN, category: 'identity' },
  { id: 'identityCheck', label: 'Did actions match identity? (Yes/No/Partial)', type: QuestionType.SELECT, options: ['Yes', 'Partial', 'No'], category: 'identity' },
  { id: 'visibleWeakness', label: 'What visible weakness do you notice today?', type: QuestionType.TEXT, category: 'identity' },

  // 2. WORK & CREATION (The 1% Standard)
  { id: 'businessWork', label: 'Deep Work / Business (Yes/No)', type: QuestionType.BOOLEAN, category: 'work' },
  { id: 'creationMinutes', label: 'Minutes Created (Building, Writing, Coding)', type: QuestionType.NUMBER, category: 'work' },
  { id: 'consumptionMinutes', label: 'Minutes Consumed (Social, Videos, Reading)', type: QuestionType.NUMBER, category: 'work' },
  { id: 'skillInvested', label: 'Primary Skill: Minutes Invested', type: QuestionType.NUMBER, category: 'work' },

  // 3. DECISIONS & INTELLIGENCE
  { id: 'goodDecision', label: 'One GOOD decision made today', type: QuestionType.TEXT, category: 'decisions' },
  { id: 'badDecision', label: 'One BAD decision made today', type: QuestionType.TEXT, category: 'decisions' },
  { id: 'decisionEmotion', label: 'Emotion during bad decision', type: QuestionType.SELECT, options: ['Calm', 'Rushed', 'Emotional', 'Bored'], category: 'decisions' },
  { id: 'thinkingContent', label: 'What did you think deeply about?', type: QuestionType.TEXT, category: 'decisions' },
  { id: 'excuseType', label: 'What excuse tried to appear today?', type: QuestionType.SELECT, options: ['None', 'Tired', 'Bored', 'Distracted', 'Emotional'], category: 'decisions' },

  // 4. ENERGY & HEALTH
  { id: 'energyMorning', label: 'Morning Energy (1-5)', type: QuestionType.SCALE, category: 'energy' },
  { id: 'energyAfternoon', label: 'Afternoon Energy (1-5)', type: QuestionType.SCALE, category: 'energy' },
  { id: 'energyNight', label: 'Night Energy (1-5)', type: QuestionType.SCALE, category: 'energy' },
  { id: 'namaz', label: 'Namaz Prayed (0-5)', type: QuestionType.NUMBER, category: 'discipline' },
  { id: 'exercise', label: 'Exercise Done?', type: QuestionType.BOOLEAN, category: 'health' },
  { id: 'water', label: 'Water Intake (Liters)', type: QuestionType.NUMBER, category: 'health' },

  // 5. MONEY AWARENESS
  { id: 'moneySpent', label: 'Money Spent Today (Estimate)', type: QuestionType.NUMBER, category: 'money' },
  { id: 'spendingCategory', label: 'Primary Spending Category', type: QuestionType.SELECT, options: ['None', 'Food', 'Transport', 'Investment', 'Useless'], category: 'money' },

  // 6. SHUTDOWN RITUAL (Mandatory for next day access)
  { id: 'shutdownRespect', label: 'Did I respect my time today?', type: QuestionType.BOOLEAN, category: 'shutdown' },
  { id: 'shutdownStupidity', label: 'Did I avoid obvious stupidity?', type: QuestionType.BOOLEAN, category: 'shutdown' },
  { id: 'shutdownRepeat', label: 'What must not repeat tomorrow?', type: QuestionType.TEXT, category: 'shutdown' },
];

export const MOCK_INITIAL_DATA: DailyLog[] = [
  { 
    date: '2023-10-25', 
    disciplineScore: 75, 
    timeIntegrityScore: 80,
    creationRatio: 0.4,
    pressureLevel: 'MEDIUM',
    shutdownComplete: true,
    answers: { creationMinutes: 120, consumptionMinutes: 180, namaz: 5 }, 
    synced: true,
    dailyDirection: "Stop consuming. Build for 2 hours before opening email.",
    realityCheck: "You are in the top 40% of creators, but the top 1% work 4x harder."
  },
  { 
    date: '2023-10-26', 
    disciplineScore: 82, 
    timeIntegrityScore: 90,
    creationRatio: 0.6,
    pressureLevel: 'HIGH',
    shutdownComplete: true,
    answers: { creationMinutes: 150, consumptionMinutes: 100, namaz: 5 }, 
    synced: true 
  },
];
