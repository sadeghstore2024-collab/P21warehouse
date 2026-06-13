/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { AlertTriangle, TrendingDown, Zap, ShieldAlert, Package, Clock } from 'lucide-react';
import { Product, ExitRecord } from '../types';

interface PredictiveInventoryViewProps {
  products: Product[];
  exits: ExitRecord[];
}

export const PredictiveInventoryView: React.FC<PredictiveInventoryViewProps> = ({ products, exits }) => {
  
  const criticalStock = useMemo(() => {
    return products.filter(p => (p.stock || 0) <= (p.minStock || 5));
  }, [products]);

  const highDemandItems = useMemo(() => {
    const counts: Record<string, number> = {};
    exits.forEach(e => {
      e.items.forEach(it => {
        counts[it.productDescription] = (counts[it.productDescription] || 0) + it.quantity;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [exits]);

  return (
    <div className="space-y-8 animate-enter pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="diamond-neon p-8 rounded-[3rem] bg-red-500/5 border-red-500/20 shadow-2xl space-y-6">
          <div className="flex items-center gap-4 border-b border-red-500/10 pb-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-400 shadow-inner">
              <ShieldAlert size={28}/>
            </div>
            <div>
              <h3 className="text-xl font-black ultra-glow-text text-red-400 uppercase tracking-tighter">هشدار موجودی بحرانی</h3>
              <p className="text-[10px] opacity-40 font-black uppercase tracking-widest">اقلامی که به نقطه سفارش مجدد رسیده‌اند</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {criticalStock.map(p => (
              <div key={p.code} className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-red-500/10 group hover:border-red-500/40 transition-all">
                <div className="flex items-center gap-4">
                  <AlertTriangle size={16} className="text-red-500 animate-pulse"/>
                  <div>
                    <span className="font-black text-sm block">{p.description}</span>
                    <span className="text-[9px] opacity-40 font-mono">CODE: {p.code}</span>
                  </div>
                </div>
                <div className="text-left">
                  <span className="text-lg font-black text-red-400">{p.stock || 0}</span>
                  <span className="text-[9px] opacity-40 block uppercase">موجودی فعلی</span>
                </div>
              </div>
            ))}
            {criticalStock.length === 0 && (
              <div className="py-10 text-center opacity-20 font-black uppercase tracking-widest">موجودی تمامی اقلام در وضعیت سبز است</div>
            )}
          </div>
        </div>

        <div className="diamond-neon p-8 rounded-[3rem] bg-cyan-500/5 border-cyan-500/20 shadow-2xl space-y-6">
          <div className="flex items-center gap-4 border-b border-cyan-500/10 pb-4">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 shadow-inner">
              <Zap size={28}/>
            </div>
            <div>
              <h3 className="text-xl font-black ultra-glow-text text-cyan-400 uppercase tracking-tighter">تحلیل تقاضای هوشمند</h3>
              <p className="text-[10px] opacity-40 font-black uppercase tracking-widest">پرمصرف‌ترین اقلام در بازه زمانی اخیر</p>
            </div>
          </div>

          <div className="space-y-3">
            {highDemandItems.map(([name, qty], idx) => (
              <div key={name} className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-cyan-500/10 group hover:border-cyan-500/40 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-400 font-black text-xs">0{idx + 1}</div>
                  <span className="font-black text-sm">{name}</span>
                </div>
                <div className="text-left">
                  <span className="text-lg font-black text-cyan-400">{qty}</span>
                  <span className="text-[9px] opacity-40 block uppercase">تعداد خروجی</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="diamond-neon p-10 rounded-[4rem] bg-indigo-900/10 border-indigo-500/20 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-cyan-500/5 animate-pulse"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="w-32 h-32 bg-indigo-500/10 rounded-[2.5rem] flex items-center justify-center text-indigo-400 shadow-2xl border border-indigo-500/20 shrink-0">
            <TrendingDown size={64} className="animate-bounce"/>
          </div>
          <div className="space-y-4 text-center md:text-right">
            <h3 className="text-3xl font-black ultra-glow-text text-white uppercase tracking-tighter">برنامه‌ریز تامین و نگهداری پیشگیرانه</h3>
            <p className="text-sm opacity-60 font-medium leading-relaxed max-w-2xl">
              سیستم P21 ULTRA با تحلیل نرخ خروج کالا، زمان تقریبی اتمام موجودی را پیش‌بینی کرده و به صورت خودکار لیست سفارش خرید را برای واحد بازرگانی آماده می‌کند. این فرآیند از توقف عملیات به دلیل کمبود قطعات استراتژیک جلوگیری می‌نماید.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-4 pt-4">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                <Package size={14} className="text-indigo-400"/>
                <span className="text-[10px] font-black uppercase tracking-widest">بهینه‌سازی انبار</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                <Clock size={14} className="text-cyan-400"/>
                <span className="text-[10px] font-black uppercase tracking-widest">کاهش زمان انتظار</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
