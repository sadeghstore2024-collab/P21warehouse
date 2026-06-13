/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Search, Package, User, Calendar, Hash, ArrowRightLeft } from 'lucide-react';
import { ExitRecord, Product } from '../types';

interface UnregisteredExitsViewProps {
  exits: ExitRecord[];
  products: Product[];
  onAssignCode: (recordId: string, itemIndex: number, newCode: string) => void;
}

export const UnregisteredExitsView: React.FC<UnregisteredExitsViewProps> = ({ exits, products, onAssignCode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [assigningCodes, setAssigningCodes] = useState<Record<string, string>>({});

  // Filter for items with "بدون کد"
  const unregisteredItems = exits.flatMap(record => 
    record.items.map((item, index) => ({
      recordId: record.id,
      itemIndex: index,
      docNumber: record.docNumber,
      recipientName: record.recipientName,
      date: record.date,
      timestamp: record.timestamp,
      ...item
    }))
  ).filter(item => item.productCode === 'بدون کد' || item.productCode === 'NEW');

  const filteredItems = unregisteredItems.filter(item => 
    item.productDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.docNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCodeChange = (key: string, value: string) => {
    setAssigningCodes(prev => ({ ...prev, [key]: value }));
  };

  const handleConfirm = (recordId: string, itemIndex: number, key: string) => {
    const newCode = assigningCodes[key];
    if (!newCode) return alert('لطفاً کد کالا را وارد کنید');
    
    // Check if code exists in products
    const product = products.find(p => p.code === newCode);
    if (!product) {
      if (!window.confirm('این کد در انبار یافت نشد. آیا مطمئن هستید؟')) return;
    }

    onAssignCode(recordId, itemIndex, newCode);
    // Clear the input
    const newAssigningCodes = { ...assigningCodes };
    delete newAssigningCodes[key];
    setAssigningCodes(newAssigningCodes);
  };

  return (
    <div className="space-y-6 animate-enter">
      <div className="diamond-neon p-8 rounded-[3rem] bg-orange-900/10 border-orange-500/20 shadow-2xl space-y-8">
        <div className="flex justify-between items-center border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-400 shadow-inner">
              <AlertCircle size={28} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-black ultra-glow-text uppercase tracking-tighter text-orange-300">خروج کالاهای ثبت نشده</h3>
              <p className="text-[10px] opacity-40 font-black uppercase tracking-widest text-orange-200/60">مدیریت و کدگذاری کالاهایی که بدون کد از انبار خارج شده‌اند</p>
            </div>
          </div>
          <div className="relative w-64">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
              placeholder="جستجو در لیست..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full input-glass p-3 pr-12 rounded-2xl text-xs font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredItems.map((item) => {
            const key = `${item.recordId}-${item.itemIndex}`;
            return (
              <div key={key} className="group relative overflow-hidden bg-black/40 rounded-3xl border border-orange-500/10 hover:border-orange-500/30 transition-all shadow-xl p-6">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-transparent opacity-50"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-400">
                        <Package size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white group-hover:text-orange-300 transition-colors">{item.productDescription}</h4>
                        <div className="flex items-center gap-2 text-[10px] opacity-40 font-bold uppercase tracking-widest">
                          <Hash size={10} /> <span>{item.docNumber}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-3 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[11px] font-black text-white/60">
                      <User size={14} className="text-orange-400/60" />
                      <span>{item.recipientName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-black text-white/60">
                      <Calendar size={14} className="text-orange-400/60" />
                      <span>{item.date}</span>
                    </div>
                  </div>

                  <div className="md:col-span-1 text-center">
                    <span className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full text-xs font-black border border-orange-500/20">
                      {item.quantity} {item.unit}
                    </span>
                  </div>

                  <div className="md:col-span-4 flex items-center gap-3">
                    <div className="relative flex-1">
                      <ArrowRightLeft className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                      <input 
                        list="all-products-codes"
                        placeholder="کد کالای جدید..." 
                        value={assigningCodes[key] || ''}
                        onChange={e => handleCodeChange(key, e.target.value)}
                        className="w-full bg-white/5 border border-white/10 p-3 pr-10 rounded-xl text-xs font-black focus:border-orange-500/50 transition-all outline-none"
                      />
                      <datalist id="all-products-codes">
                        {products.map(p => <option key={p.code} value={p.code}>{p.description}</option>)}
                      </datalist>
                    </div>
                    <button 
                      onClick={() => handleConfirm(item.recordId, item.itemIndex, key)}
                      className="p-3 bg-orange-600 hover:bg-orange-500 rounded-xl text-white shadow-lg transition-all active:scale-90 flex items-center justify-center"
                    >
                      <CheckCircle2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="py-20 text-center space-y-4 opacity-20">
              <CheckCircle2 size={64} className="mx-auto text-emerald-500" />
              <p className="text-xl font-black uppercase tracking-[0.5em]">تمامی کالاها کدگذاری شده‌اند</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
