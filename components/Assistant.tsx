import React, { useState, useRef, useEffect } from 'react';
import { DailyLog, ChatMessage, Question } from '../types';
import { analyzeDailyLog, chatWithAssistant, analyzeImage } from '../services/geminiService';
import { Bot, Sparkles, Send, Image as ImageIcon, BrainCircuit, Loader2 } from 'lucide-react';

interface AssistantProps {
  todayLog: DailyLog;
  questions: Question[];
  onUpdateLog: (log: DailyLog) => void;
  silentMode: boolean;
}

const Assistant: React.FC<AssistantProps> = ({ todayLog, questions, onUpdateLog, silentMode }) => {
  const [activeTab, setActiveTab] = useState<'insight' | 'chat' | 'vision'>('insight');
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [useDeepThink, setUseDeepThink] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Vision State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [visionPrompt, setVisionPrompt] = useState('');
  const [visionResult, setVisionResult] = useState('');
  const [analyzingImage, setAnalyzingImage] = useState(false);

  // Insight State
  const [analyzingLog, setAnalyzingLog] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleGenerateInsight = async () => {
    setAnalyzingLog(true);
    // Pass silentMode to the service
    const result = await analyzeDailyLog(todayLog, questions, silentMode);
    
    const updatedLog = { 
        ...todayLog, 
        aiAnalysis: result.text,
        dailyDirection: result.dailyDirection,
        realityCheck: result.realityCheck,
        thinkingQuality: result.thinkingQuality
    };
    onUpdateLog(updatedLog);
    setAnalyzingLog(false);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    const responseText = await chatWithAssistant(history, userMsg.text, useDeepThink);
    
    const botMsg: ChatMessage = { 
      id: (Date.now() + 1).toString(), 
      role: 'model', 
      text: responseText, 
      timestamp: Date.now(),
      isThinking: useDeepThink 
    };

    setMessages(prev => [...prev, botMsg]);
    setIsThinking(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVisionAnalyze = async () => {
    if (!selectedImage) return;
    setAnalyzingImage(true);
    const result = await analyzeImage(selectedImage, visionPrompt);
    setVisionResult(result);
    setAnalyzingImage(false);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-800 overflow-hidden" style={{ minHeight: '80vh' }}>
      <div className="flex border-b border-slate-800">
        <button 
          onClick={() => setActiveTab('insight')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'insight' ? 'bg-slate-800 text-indigo-400' : 'text-slate-400'}`}
        >
          <Sparkles size={16} /> Insights
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'chat' ? 'bg-slate-800 text-indigo-400' : 'text-slate-400'}`}
        >
          <Bot size={16} /> Chat
        </button>
        <button 
          onClick={() => setActiveTab('vision')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'vision' ? 'bg-slate-800 text-indigo-400' : 'text-slate-400'}`}
        >
          <ImageIcon size={16} /> Vision
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'insight' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Daily Protocol Review</h3>
            <p className="text-slate-400 text-sm">
                {silentMode ? "Generating factual analysis of today's performance data." : "Let Gemini analyze today's logs to find discipline gaps."}
            </p>
            
            {!todayLog.aiAnalysis ? (
              <div className="text-center py-10">
                <Bot className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <button 
                  onClick={handleGenerateInsight}
                  disabled={analyzingLog}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 mx-auto disabled:opacity-50"
                >
                  {analyzingLog ? <Loader2 className="animate-spin" /> : <Sparkles size={16} />}
                  Analyze Data
                </button>
              </div>
            ) : (
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                {todayLog.aiAnalysis}
              </div>
            )}
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2" ref={scrollRef}>
              {messages.length === 0 && (
                <div className="text-center text-slate-500 mt-10 text-sm">
                  {silentMode ? "System Online. Query data." : "Ask me anything about your habits."}
                </div>
              )}
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                    msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'
                  }`}>
                    {msg.isThinking && (
                        <div className="flex items-center gap-1 text-xs text-indigo-300 mb-1 border-b border-slate-600 pb-1">
                            <BrainCircuit size={12} /> Deep Thought
                        </div>
                    )}
                    {msg.text}
                  </div>
                </div>
              ))}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 p-3 rounded-lg flex gap-2 items-center text-slate-400 text-sm">
                    <Loader2 className="animate-spin" size={14} /> Processing...
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={useDeepThink} 
                        onChange={(e) => setUseDeepThink(e.target.checked)}
                        className="rounded bg-slate-800 border-slate-600 text-indigo-500 focus:ring-offset-0 focus:ring-0"
                    />
                    <BrainCircuit size={14} className={useDeepThink ? 'text-indigo-400' : ''} /> 
                    Deep Thinking
                </label>
                <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 text-white focus:outline-none focus:border-indigo-500"
                />
                <button 
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isThinking}
                    className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50"
                >
                    <Send size={18} />
                </button>
                </div>
            </div>
          </div>
        )}

        {/* VISION TAB */}
        {activeTab === 'vision' && (
          <div className="space-y-4">
             <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors">
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden" 
                    id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                    {selectedImage ? (
                        <img src={selectedImage} alt="Selected" className="max-h-48 rounded-lg mb-2" />
                    ) : (
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-2">
                             <ImageIcon className="text-slate-400" />
                        </div>
                    )}
                    <span className="text-sm text-slate-300 font-medium">
                        {selectedImage ? "Change Image" : "Upload Photo"}
                    </span>
                </label>
             </div>

             <div className="space-y-2">
                <input
                    type="text"
                    placeholder="Query this image..."
                    value={visionPrompt}
                    onChange={(e) => setVisionPrompt(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none"
                />
                <button 
                    onClick={handleVisionAnalyze}
                    disabled={!selectedImage || analyzingImage}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {analyzingImage ? <Loader2 className="animate-spin" /> : <BrainCircuit size={16} />}
                    Analyze
                </button>
             </div>

             {visionResult && (
                 <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-slate-300 text-sm mt-4 font-mono">
                     <h4 className="text-indigo-400 font-bold mb-1 text-xs uppercase">Analysis</h4>
                     {visionResult}
                 </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Assistant;
