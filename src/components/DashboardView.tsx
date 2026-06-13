/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { PackagePlus, HardHat, Activity } from 'lucide-react';
import { ExitRecord } from '../types';

interface DashboardViewProps {
  exits: ExitRecord[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ exits }) => {
  const [slideIdx, setSlideIdx] = React.useState(0);
  
  const counts = useMemo(() => ({
    exit: exits.filter((e) => e.type === 'EXIT').length,
    ppe: exits.filter((e) => e.type === 'PPE').length,
    total: exits.length
  }), [exits]);

  const topRecipient = useMemo(() => {
    const personCounts: Record<string, { count: number; items: any[] }> = {};
    exits.forEach(e => {
      if (!personCounts[e.recipientName]) personCounts[e.recipientName] = { count: 0, items: [] };
      personCounts[e.recipientName].count += e.items.length;
      personCounts[e.recipientName].items.push(...e.items);
    });
    const sorted = Object.entries(personCounts).sort((a, b) => b[1].count - a[1].count);
    return sorted.length > 0 ? { name: sorted[0][0], ...sorted[0][1] } : null;
  }, [exits]);

  React.useEffect(() => {
    if (topRecipient && topRecipient.items.length > 1) {
      const timer = setInterval(() => {
        setSlideIdx(prev => (prev + 1) % topRecipient.items.length);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [topRecipient]);

  return (
    <div className="space-y-8 animate-enter">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="diamond-neon p-7 rounded-[2rem] bg-indigo-500/5 text-center transition-all hover:scale-105 shadow-xl border-indigo-500/10 group">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-400 group-hover:scale-110 transition-all shadow-inner">
            <PackagePlus size={24}/>
          </div>
          <p className="text-[11px] font-black opacity-40 uppercase mb-2 tracking-[0.3em]">حواله خروج کل</p>
          <h3 className="text-4xl font-black text-indigo-400 ultra-glow-text tracking-tighter">{counts.exit}</h3>
        </div>
        <div className="diamond-neon p-7 rounded-[2rem] bg-emerald-500/5 text-center transition-all hover:scale-105 shadow-xl border-emerald-500/10 group">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-400 group-hover:scale-110 transition-all shadow-inner">
            <HardHat size={24}/>
          </div>
          <p className="text-[11px] font-black opacity-40 uppercase mb-2 tracking-[0.3em]">تجهیزات ایمنی HSE</p>
          <h3 className="text-4xl font-black text-emerald-400 ultra-glow-text tracking-tighter">{counts.ppe}</h3>
        </div>
        <div className="diamond-neon p-7 rounded-[2rem] bg-cyan-500/5 text-center transition-all hover:scale-105 shadow-xl border-cyan-500/10 group">
          <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-cyan-400 group-hover:scale-110 transition-all shadow-inner">
            <Activity size={24}/>
          </div>
          <p className="text-[11px] font-black opacity-40 uppercase mb-2 tracking-[0.3em]">تراکنش لحظه‌ای نهایی</p>
          <h3 className="text-4xl font-black text-cyan-400 ultra-glow-text tracking-tighter">{counts.total}</h3>
        </div>
      </div>
      
      <div className="diamond-neon p-12 rounded-[4rem] bg-indigo-900/10 border-indigo-500/20 text-center shadow-2xl overflow-hidden relative group min-h-[300px] flex flex-col justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-indigo-500/5 animate-pulse opacity-50"></div>
        <div className="relative z-10 space-y-6">
          {topRecipient ? (
            <>
              <div className="space-y-2">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] block">برترین تحویل‌گیرنده انبار</span>
                <h2 className="text-5xl font-black ultra-glow-text text-white uppercase tracking-tighter">{topRecipient.name}</h2>
              </div>
              
              <div className="max-w-xl mx-auto">
                <div className="bg-black/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
                  <div key={slideIdx} className="animate-enter space-y-4">
                    <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">لیست اقلام تحویلی (اسلاید {slideIdx + 1} از {topRecipient.items.length})</span>
                    <h4 className="text-2xl font-black text-white leading-tight">{topRecipient.items[slideIdx]?.productDescription}</h4>
                    <div className="flex justify-center gap-4">
                      <span className="bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20 text-[11px] font-black text-indigo-300">{topRecipient.items[slideIdx]?.quantity} {topRecipient.items[slideIdx]?.unit}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-[10px] opacity-30 font-black uppercase tracking-[0.3em]">گزارش خودکار واحد مدیریت دارایی P21 ULTRA</p>
            </>
          ) : (
            <div className="py-20 opacity-20 font-black uppercase tracking-[0.5em]">داده‌ای برای تحلیل موجود نیست</div>
          )}
        </div>
      </div>
    </div>
  );
};
