/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Layers } from 'lucide-react';
import { ExitRecord } from '../types';

interface RecordOverlayProps {
  record: ExitRecord;
  onClose: () => void;
}

export const RecordOverlay: React.FC<RecordOverlayProps> = ({ record, onClose }) => {
    return (
        <div className="fixed inset-0 z-[1000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6 no-print animate-enter">
            <div className="max-w-4xl w-full diamond-neon p-10 rounded-[3.5rem] border-indigo-500/30 bg-[#010409] shadow-[0_0_150px_rgba(99,102,241,0.2)] relative">
                <button onClick={onClose} className="absolute top-10 left-10 p-3 text-white/20 hover:text-white transition-all hover:scale-125"><X size={36}/></button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] block">ELECTRONIC DOCUMENT ID</span>
                          <h2 className="text-4xl font-black text-white ultra-glow-text tracking-tighter uppercase">{record.docNumber}</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="bg-white/5 p-5 rounded-3xl border border-white/5 shadow-inner group transition-all hover:bg-white/10">
                            <span className="text-[9px] opacity-40 font-black block uppercase mb-2 tracking-widest">Personnel Name</span>
                            <span className="text-base font-black text-cyan-400 block">{record.recipientName}</span>
                          </div>
                          <div className="bg-white/5 p-5 rounded-3xl border border-white/5 shadow-inner group transition-all hover:bg-white/10">
                            <span className="text-[9px] opacity-40 font-black block uppercase mb-2 tracking-widest">Entry Date</span>
                            <span className="text-base font-black text-white block">{record.date}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[9px] opacity-40 font-black block uppercase tracking-widest mb-1">Detailed Notes</span>
                          <p className="text-[12px] leading-relaxed opacity-70 bg-white/5 p-5 rounded-3xl border border-white/5 min-h-[100px] shadow-inner">{record.notes || 'No technical notes recorded for this transaction.'}</p>
                        </div>
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-3">ITEMIZED ASSET LIST <Layers size={14}/></h4>
                          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-3 no-scrollbar">
                            {record.items.map((it, i) => (
                              <div key={i} className="flex justify-between items-center bg-indigo-600/5 p-4 rounded-2xl border border-indigo-500/10 hover:bg-indigo-600/10 transition-all shadow-sm">
                                <div className="flex flex-col">
                                  <span className="text-sm font-black text-white">{it.productDescription}</span>
                                  <span className="text-[9px] opacity-30 font-bold uppercase tracking-tight">{it.technicalSpecs}</span>
                                </div>
                                <span className="text-xl font-black text-cyan-400">{it.quantity} <span className="text-[10px] opacity-40">{it.unit}</span></span>
                              </div>
                            ))}
                          </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6 justify-center">
                        {record.photo && <div className="rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl ring-4 ring-white/5"><img src={record.photo} className="w-full h-auto object-cover" /></div>}
                        {record.signature && <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 text-center shadow-2xl">
                          <span className="text-[9px] opacity-30 font-black block mb-4 uppercase tracking-[0.3em]">DIGITAL VERIFICATION SIGNATURE</span>
                          <img src={record.signature} className="h-24 mx-auto filter invert brightness-200" />
                        </div>}
                    </div>
                </div>
            </div>
        </div>
    );
};
