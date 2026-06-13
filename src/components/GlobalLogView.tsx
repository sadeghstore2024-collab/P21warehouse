/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { BookOpen, Search, Edit3, Trash2 } from 'lucide-react';
import { ExitRecord } from '../types';

interface GlobalLogViewProps {
  exits: ExitRecord[];
  onRowClick: (record: ExitRecord) => void;
  onEdit: (record: ExitRecord) => void;
  onDelete: (id: string, type: string) => void;
  isAdmin: boolean;
}

export const GlobalLogView: React.FC<GlobalLogViewProps> = ({ exits, onRowClick, onEdit, onDelete, isAdmin }) => {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => exits.filter((r) => {
    const query = q.toLowerCase();
    const matchesDoc = r.docNumber.toLowerCase().includes(query);
    const matchesRecipient = r.recipientName.toLowerCase().includes(query);
    const matchesItems = r.items.some((it) => 
      it.productDescription.toLowerCase().includes(query) || 
      it.quantity.toString().includes(query)
    );
    return (matchesDoc || matchesRecipient || matchesItems);
  }), [exits, q]);

  return (
    <div className="animate-enter">
      <div className="diamond-neon p-6 rounded-2xl border-indigo-500/20 shadow-xl bg-[#010409]/90">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h3 className="text-xl font-black text-indigo-400 ultra-glow-text flex items-center gap-3 tracking-widest uppercase">
            <BookOpen size={28}/> دفتر کل دیجیتال
          </h3>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <input 
                type="text" 
                placeholder="جستجو کالا یا پرسنل..." 
                value={q} 
                onChange={e=>setQ(e.target.value)} 
                className="w-full h-10 input-glass rounded-xl text-xs pr-10 shadow-inner" 
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400" size={16}/>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/40">
          <table className="w-full text-right">
            <thead className="bg-indigo-900/40 text-[10px] font-black uppercase tracking-widest text-indigo-300 h-10">
              <tr>
                <th className="px-6">شماره سند</th>
                <th className="px-6">تحویل‌گیرنده</th>
                <th className="px-6 text-center">اقلام</th>
                <th className="px-6 text-center">تاریخ</th>
                <th className="px-6 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[12px] font-black">
              {filtered.sort((a, b) => b.timestamp - a.timestamp).map((rec)=>(
                <tr key={rec.id} className="hover:bg-indigo-600/5 transition-all group">
                  <td className="px-6 py-3 font-mono text-indigo-300 cursor-pointer" onClick={()=>onRowClick(rec)}>{rec.docNumber}</td>
                  <td className="px-6 py-3 font-bold cursor-pointer" onClick={()=>onRowClick(rec)}>{rec.recipientName}</td>
                  <td className="px-6 py-3 text-center text-cyan-400 cursor-pointer" onClick={()=>onRowClick(rec)}>{rec.items.length} کالا</td>
                  <td className="px-6 py-3 text-center opacity-50 cursor-pointer" onClick={()=>onRowClick(rec)}>{rec.date}</td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={(e) => { e.stopPropagation(); onEdit(rec); }} className="text-orange-400 p-2 hover:bg-orange-400/10 rounded-lg transition-all" title="ویرایش"><Edit3 size={16}/></button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete(rec.id, rec.type); }} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-all" title="حذف"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
