/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import { ExitRecord } from '../types';

interface LoanManagerProps {
  exits: ExitRecord[];
  onRecordClick: (record: ExitRecord) => void;
  onReturn: (recordId: string, itemIdx: number, condition: string, rating: number) => void;
}

export const LoanManager: React.FC<LoanManagerProps> = ({ exits, onRecordClick, onReturn }) => {
  const activeLoans = useMemo(() => {
    return exits.flatMap((e) => 
      e.items.map((it, idx) => ({ 
        ...it, 
        recordId: e.id, 
        recipientName: e.recipientName, 
        date: e.date, 
        itemIdx: idx, 
        docNumber: e.docNumber 
      }))
    ).filter((it) => it.isLoan && !it.isReturned);
  }, [exits]);

  return (
    <div className="space-y-6 animate-enter">
      <div className="diamond-neon p-6 rounded-2xl border-orange-500/20 bg-orange-900/5 shadow-lg">
        <h3 className="text-xl font-black text-orange-400 flex items-center gap-3 uppercase tracking-widest"><RotateCcw size={28}/> مدیریت امانات و کالاهای استردادی</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeLoans.map((loan, i) => (
          <div key={i} className="diamond-neon p-5 rounded-2xl border border-white/5 bg-black/40 space-y-4">
            <div className="flex justify-between items-start">
              <div onClick={() => onRecordClick(exits.find(e => e.id === loan.recordId)!)} className="cursor-pointer">
                <span className="text-[10px] text-orange-400 font-black uppercase tracking-widest">{loan.docNumber}</span>
                <h4 className="font-black text-sm">{loan.productDescription}</h4>
              </div>
              <div className="text-right">
                <span className="text-[9px] opacity-40 block">{loan.date}</span>
                <span className="text-xs font-bold text-cyan-400">{loan.recipientName}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onReturn(loan.recordId, loan.itemIdx, 'EXCELLENT', 5)} className="flex-1 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-black hover:bg-emerald-600 hover:text-white transition-all">بازگشت (سالم)</button>
              <button onClick={() => onReturn(loan.recordId, loan.itemIdx, 'NEEDS_REPAIR', 2)} className="flex-1 py-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg text-[10px] font-black hover:bg-red-600 hover:text-white transition-all">بازگشت (معیوب)</button>
            </div>
          </div>
        ))}
        {activeLoans.length === 0 && <div className="col-span-full py-20 text-center opacity-20 font-black uppercase tracking-[0.5em]">هیچ امانتی در جریان نیست</div>}
      </div>
    </div>
  );
};
