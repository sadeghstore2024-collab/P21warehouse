/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Edit3, X } from 'lucide-react';
import { ExitRecord } from '../types';

interface EditOverlayProps {
  record: ExitRecord;
  onClose: () => void;
  onSave: (record: ExitRecord) => void;
}

export const EditOverlay: React.FC<EditOverlayProps> = ({ record, onClose, onSave }) => {
    const [f, setF] = useState({ ...record });
    return (
        <div className="fixed inset-0 z-[600] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-12 animate-enter no-print">
          <div className="max-w-4xl w-full diamond-neon p-12 rounded-[4rem] border-orange-500/40 bg-[#010409] space-y-8 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
            <h2 className="text-3xl font-black text-orange-400 ultra-glow-text flex items-center gap-5 uppercase tracking-tighter"><Edit3 size={36}/> اصلاح پارامترهای سند</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1"><label className="text-[10px] opacity-40 font-black uppercase tracking-widest mb-1 pr-2">شماره حواله</label><input value={f.docNumber} onChange={e=>setF({...f, docNumber:e.target.value})} className="w-full input-glass p-5 rounded-2xl font-black text-xl shadow-inner font-mono" /></div>
              <div className="space-y-1"><label className="text-[10px] opacity-40 font-black uppercase tracking-widest mb-1 pr-2">تحویل‌گیرنده</label><input value={f.recipientName} onChange={e=>setF({...f, recipientName:e.target.value})} className="w-full input-glass p-5 rounded-2xl font-black text-xl shadow-inner" /></div>
              <div className="space-y-1"><label className="text-[10px] opacity-40 font-black uppercase tracking-widest mb-1 pr-2">تاریخ ثبت</label><input value={f.date} onChange={e=>setF({...f, date:e.target.value})} className="w-full input-glass p-5 rounded-2xl font-black text-xl shadow-inner" /></div>
              <div className="space-y-1"><label className="text-[10px] opacity-40 font-black uppercase tracking-widest mb-1 pr-2">واحد سازمانی</label><input value={f.orgUnit} onChange={e=>setF({...f, orgUnit:e.target.value})} className="w-full input-glass p-5 rounded-2xl font-black text-xl shadow-inner" /></div>
            </div>
            <div className="space-y-1"><label className="text-[10px] opacity-40 font-black uppercase tracking-widest mb-1 pr-2">توضیحات سند</label><textarea value={f.notes || ''} onChange={e=>setF({...f, notes:e.target.value})} className="w-full input-glass p-5 rounded-2xl font-bold text-sm shadow-inner h-32" /></div>
            
            <div className="space-y-4">
              <h3 className="text-xs font-black text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">لیست اقلام سند</h3>
              <div className="space-y-2">
                {f.items.map((it, idx) => (
                  <div key={idx} className="flex gap-4 items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                    <input value={it.productDescription} onChange={e => {
                      const newItems = [...f.items];
                      newItems[idx] = { ...it, productDescription: e.target.value };
                      setF({ ...f, items: newItems });
                    }} className="flex-1 bg-transparent border-none outline-none font-bold text-sm" />
                    <input type="number" value={it.quantity} onChange={e => {
                      const newItems = [...f.items];
                      newItems[idx] = { ...it, quantity: parseFloat(e.target.value) };
                      setF({ ...f, items: newItems });
                    }} className="w-20 bg-transparent border-none outline-none font-black text-center text-cyan-400" />
                    <button onClick={() => {
                      const newItems = f.items.filter((_, i) => i !== idx);
                      setF({ ...f, items: newItems });
                    }} className="text-red-500 hover:scale-110 transition-all"><X size={20}/></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={onClose} className="flex-1 py-5 bg-white/5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all">انصراف</button>
              <button onClick={()=>onSave(f)} className="flex-[2] py-5 bg-orange-600 rounded-[2rem] font-black text-sm shadow-2xl uppercase tracking-[0.2em] transition-all active:scale-95 border-t border-white/20">اعمال تغییرات نهایی</button>
            </div>
          </div>
        </div>
    );
};
