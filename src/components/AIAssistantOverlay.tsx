/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Zap, X, Sparkles, ArrowRightLeft } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Product, ExitRecord, Recipient } from '../types';

interface AIAssistantOverlayProps {
  onClose: () => void;
  products: Product[];
  exits: ExitRecord[];
  recipients: Recipient[];
}

export const AIAssistantOverlay: React.FC<AIAssistantOverlayProps> = ({ onClose, products, exits, recipients }) => {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const context = `
        Current Warehouse State:
        - Products Count: ${products.length}
        - Recent Exits Count: ${exits.length}
        - Personnel Count: ${recipients.length}
        
        Data Samples:
        Products: ${JSON.stringify(products.slice(0, 10).map(p => ({ code: p.code, desc: p.description })))}
        Recent Activity: ${JSON.stringify(exits.slice(0, 10).map((e:any) => ({ doc: e.docNumber, recipient: e.recipientName, date: e.date, items: e.items.length })))}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `${context}\n\nUser Question: ${userMsg}`,
        config: {
          systemInstruction: "You are the P21 DIAMOND AI. You are a professional warehouse management expert. Answer questions about inventory, personnel, and safety in Persian. Be helpful, precise, and professional.",
        }
      });

      if (response && response.text) {
        setChat(prev => [...prev, { role: 'ai', text: response.text }]);
      } else {
        throw new Error("Empty response");
      }
    } catch (error) {
      console.error("AI Error:", error);
      setChat(prev => [...prev, { role: 'ai', text: 'متاسفانه در حال حاضر قادر به پاسخگویی نیستم. لطفا دوباره تلاش کنید یا تنظیمات API را بررسی نمایید.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#0d1117] rounded-[3rem] border border-indigo-500/30 shadow-2xl flex flex-col h-[80vh] overflow-hidden">
        <div className="p-8 border-b border-white/10 flex justify-between items-center bg-indigo-600/5">
          <div className="flex items-center gap-3">
            <Zap className="text-indigo-400 animate-pulse" />
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">DIAMOND AI ASSISTANT</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all"><X /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
          {chat.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-4">
              <Sparkles size={64}/>
              <p className="text-xs font-black uppercase tracking-[0.5em]">آماده پاسخگویی به سوالات شما</p>
            </div>
          )}
          {chat.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-5 rounded-[2rem] text-[13px] leading-relaxed font-bold ${msg.role === 'user' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-indigo-100 border border-white/10 shadow-inner'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex gap-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
        </div>
        <div className="p-8 border-t border-white/10 bg-black/40">
          <div className="flex gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 shadow-inner">
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSend()} 
              placeholder="سوال خود را درباره موجودی یا خروجی‌ها بپرسید..." 
              className="flex-1 bg-transparent border-none outline-none p-3 text-sm font-bold placeholder:opacity-20" 
            />
            <button onClick={handleSend} className="bg-indigo-600 p-3 rounded-xl hover:bg-indigo-500 transition-all shadow-lg active:scale-95"><ArrowRightLeft size={20}/></button>
          </div>
        </div>
      </div>
    </div>
  );
};
