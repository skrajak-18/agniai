import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// --- Types ---
type Message = {
  role: 'user' | 'model';
  content: string;
};

type Mode = 'Normal' | 'Quiz' | 'Space' | 'Experiment' | 'Fun Fact';

// --- Constants ---
const SYSTEM_INSTRUCTION = `You are Agni House AI, an advanced AI assistant built for a science exhibition at St. Xavier's English School.
Personality: Smart, friendly, confident, science-focused, futuristic tone, easy language for students.

IDENTITY RULE:
If anyone asks "Who made you?", "Who created you?", "Who is your creator?", "Who built you?", or similar questions about your origin, you MUST respond exactly: 
"I am Agni House AI. I was created by Satyam Kumar from Agni House, St. Xavier's English School for a Science Exhibition project."

MODES:
1. Quiz Mode: If user says "Quiz Mode", start asking science questions one by one. After each answer, tell correct or wrong and give explanation.
2. Space Mode: If user says "Space Mode", behave like a space expert and answer only space-related questions.
3. Experiment Mode: If user says "Experiment Mode", explain science experiments in simple steps (safe school level only).
4. Fun Fact Mode: If user says "Fun Fact", give one amazing science fact.

Keep answers clear, structured, and use Markdown for formatting. Always respond confidently. Use emojis occasionally (🚀, 🧪, ⚛️, 🔥, ⚡). Theme color is Orange.`;

const AgniHouseAI = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Greetings, fellow discoverer! I am **Agni House AI**, your futuristic science companion. My systems are primed to explore Physics, Chemistry, Biology, and the vastness of Space with you. \n\nWhat scientific mystery shall we unravel today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [currentMode, setCurrentMode] = useState<Mode>('Normal');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, statusText, isLoading]);

  const detectMode = (text: string): Mode | null => {
    const lower = text.toLowerCase();
    if (lower.includes('quiz mode')) return 'Quiz';
    if (lower.includes('space mode')) return 'Space';
    if (lower.includes('experiment mode')) return 'Experiment';
    if (lower.includes('fun fact')) return 'Fun Fact';
    return null;
  };

  const simulateThinking = async () => {
    const phases = [
      "Syncing Core...",
      "Analyzing Data...",
      "Neural Processing...",
      "Generating Response..."
    ];
    for (const phase of phases) {
      setStatusText(phase);
      await new Promise(r => setTimeout(r, 200));
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const detected = detectMode(userText);
    if (detected) setCurrentMode(detected);

    const updatedMessages: Message[] = [...messages, { role: 'user', content: userText }];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Step 1: Thinking phases
      await simulateThinking();

      // Step 2: Gemini Call
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { systemInstruction: SYSTEM_INSTRUCTION },
        history: updatedMessages.map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        }))
      });

      const responseStream = await chat.sendMessageStream({ message: userText });
      
      setStatusText('');
      let fullResponse = '';
      setMessages(prev => [...prev, { role: 'model', content: '' }]);

      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          fullResponse += text;
          setMessages(prev => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: 'model', content: fullResponse };
            return copy;
          });
        }
      }
    } catch (error) {
      console.error("System Error:", error);
      setStatusText('');
      setMessages(prev => [...prev, { role: 'model', content: "Neural link disrupted. Please re-initiate command." }]);
    } finally {
      setIsLoading(false);
      setStatusText('');
    }
  };

  const renderMessage = (content: string) => {
    return content.split(/(\*\*.*?\*\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-orange-400 drop-shadow-[0_0_2px_rgba(251,146,60,0.5)]">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full glass rounded-3xl overflow-hidden orange-glow border border-orange-500/30">
      {/* Header with logo on the LEFT */}
      <header className="p-6 border-b border-orange-500/20 flex items-center justify-between bg-orange-950/40">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.6)] bg-gradient-to-br from-orange-900 to-black group transition-all hover:scale-110 cursor-pointer flex items-center justify-center">
            <img 
              src="https://raw.githubusercontent.com/Satyamkumar369/Agni-House-AI/main/logo.png" 
              alt="Agni House Logo" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback style for "AI in Orange theme like fire"
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  const aiText = document.createElement('span');
                  aiText.className = 'orbitron text-orange-400 font-bold text-xl drop-shadow-[0_0_10px_rgba(249,115,22,0.8)] animate-pulse';
                  aiText.innerText = 'Agni';
                  parent.appendChild(aiText);
                }
              }}
            />
          </div>
          <div>
            <h1 className="orbitron text-2xl font-bold tracking-wider text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.6)] uppercase">Agni House AI</h1>
            <p className="text-[10px] text-orange-500/80 uppercase tracking-[0.2em] font-bold">St. Xavier's English School</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[9px] orbitron tracking-widest font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,1)]"></div>
              ONLINE
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Feed */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-black/20">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-500`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-xl transition-all border ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white border-orange-400 rounded-tr-none' 
                : 'bg-white/5 border-white/10 text-slate-100 rounded-tl-none'
            }`}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {renderMessage(msg.content)}
              </div>
            </div>
          </div>
        ))}

        {/* Thinking Indicator Animation */}
        {isLoading && statusText && (
          <div className="flex justify-start animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="bg-white/5 border border-orange-500/30 p-5 rounded-2xl rounded-tl-none shadow-[0_0_20px_rgba(249,115,22,0.1)] flex flex-col gap-3 min-w-[220px]">
              <div className="flex items-center gap-3">
                <div className="relative w-5 h-5">
                  <div className="absolute inset-0 rounded-full border-2 border-orange-500/20"></div>
                  <div className="absolute inset-0 rounded-full border-t-2 border-orange-500 animate-spin"></div>
                </div>
                <span className="text-[11px] orbitron text-orange-400 font-bold tracking-widest uppercase animate-pulse">
                  {statusText}
                </span>
              </div>
              <div className="flex gap-1.5 items-center pl-8">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0s]"></div>
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      {/* Action Chips */}
      <div className="px-6 py-3 flex gap-2 overflow-x-auto scrollbar-hide bg-black/40 border-t border-orange-500/10">
        {['Quiz Mode', 'Space Mode', 'Experiment Mode', 'Fun Fact'].map((m) => (
          <button
            key={m}
            disabled={isLoading}
            onClick={() => setInput(m)}
            className="whitespace-nowrap px-4 py-2 rounded-full bg-orange-950/30 border border-orange-500/30 text-[10px] text-orange-400 hover:bg-orange-600 hover:text-white hover:border-orange-400 transition-all orbitron font-bold tracking-wider disabled:opacity-50"
          >
            {m}
          </button>
        ))}
      </div>

      {/* Input Section */}
      <footer className="p-6 bg-orange-950/30 border-t border-orange-500/20 shadow-[0_-10px_30px_rgba(0,0,0,0.4)]">
        <form onSubmit={handleSend} className="relative flex items-center gap-3">
          <div className="flex-1 relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="Input your scientific query..."
              className="w-full bg-black/70 border border-orange-500/30 rounded-xl px-5 py-4 text-sm text-orange-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-orange-900/60 font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-orange-600 hover:bg-orange-500 text-white p-4 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all active:scale-95 disabled:opacity-30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </form>
        <div className="mt-5 flex flex-col items-center gap-1">
           <div className="flex gap-3 items-center opacity-70">
              <span className="text-[10px] orbitron text-orange-500/80 uppercase tracking-widest">Powered by Agni House</span>
              <div className="w-1.5 h-1.5 rounded-full bg-orange-900"></div>
              <span className="text-[10px] orbitron text-orange-400 font-bold uppercase tracking-[0.2em] animate-pulse drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]">Made by Satyam Kumar</span>
           </div>
        </div>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<AgniHouseAI />);
