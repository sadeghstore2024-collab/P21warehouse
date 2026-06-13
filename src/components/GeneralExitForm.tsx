/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { PackagePlus, Plus, X, PenTool, Camera, Trophy, History, Edit3, Trash2, Check } from 'lucide-react';
import { Product, Recipient, ExitRecord, User } from '../types';

interface GeneralExitFormProps {
  products: Product[];
  generalHistory: ExitRecord[];
  recipients: Recipient[];
  currentUser: User;
  onSave: (record: any) => void;
  onRecordClick: (record: ExitRecord) => void;
  onEdit: (record: ExitRecord) => void;
  onDelete: (id: string, type: string) => void;
  onSignOpen: () => void;
  onCamOpen: () => void;
  signature: string;
  photo: string | null;
}

export const GeneralExitForm: React.FC<GeneralExitFormProps> = ({ 
  products, generalHistory, recipients, currentUser, onSave, onRecordClick,
  onEdit, onDelete, onSignOpen, onCamOpen, signature, photo
}) => {
  const [basket, setBasket] = useState<any[]>([]);
  const [recipient, setRecipient] = useState('');
  const [recipientUnit, setRecipientUnit] = useState('');
  const [docNum, setDocNum] = useState(`EXIT-${Date.now().toString().slice(-4)}`);
  const [manualDate, setManualDate] = useState(new Date().toLocaleDateString('fa-IR'));
  const [tempCode, setTempCode] = useState('');
  const [tempQty, setTempQty] = useState(1);
  const [isLoan, setIsLoan] = useState(false);
  const [noCode, setNoCode] = useState(false);
  const [manualDescription, setManualDescription] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const p = recipients.find((r) => r.fullName === recipient);
    if (p) setRecipientUnit(p.orgUnit);
    else setRecipientUnit('');
  }, [recipient, recipients]);

  const top10 = useMemo(() => {
    const counts: Record<string, number> = {};
    generalHistory
      .filter((h) => h.recipientName === recipient)
      .forEach((h) => {
        h.items.forEach((it) => counts[it.productDescription] = (counts[it.productDescription] || 0) + it.quantity);
      });
    return Object.entries(counts).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 10);
  }, [generalHistory, recipient]);

  const personHistory = useMemo(() => generalHistory.filter(h => h.recipientName === recipient), [generalHistory, recipient]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-enter no-print">
      <div className="lg:col-span-8 diamond-neon p-6 rounded-[2rem] border-indigo-500/20 space-y-5 shadow-xl">
        <h2 className="text-xl font-black flex items-center gap-3 ultra-glow-text uppercase tracking-widest text-indigo-300">
          <PackagePlus className="text-cyan-400" size={28}/> صدور حواله خروج کالا
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1 relative">
            <label className="text-[10px] opacity-40 font-black uppercase">تحویل‌گیرنده</label>
            <div className="relative">
              <input list="recs-gen" placeholder="جستجوی پرسنل..." value={recipient} onChange={e=>setRecipient(e.target.value)} className="w-full input-glass p-3 font-black shadow-inner pl-10" />
              {recipient && (
                <button 
                  onClick={() => setRecipient('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-red-500 transition-all"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <datalist id="recs-gen">{recipients.map((r)=><option key={r.fullName} value={r.fullName}/>)}</datalist>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] opacity-40 font-black uppercase">واحد عملیاتی</label>
            <input value={recipientUnit} readOnly className="w-full input-glass p-3 font-black opacity-60 shadow-inner" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] opacity-40 font-black uppercase">شماره سند</label>
            <input value={docNum} onChange={e=>setDocNum(e.target.value)} className="w-full input-glass p-3 font-black shadow-inner" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] opacity-40 font-black uppercase">تاریخ خروج</label>
            <input value={manualDate} onChange={e=>setManualDate(e.target.value)} className="w-full input-glass p-3 font-black text-center shadow-inner" />
          </div>
          <div className="flex items-end gap-3">
            <button onClick={() => setIsLoan(!isLoan)} className={`flex-1 py-3 rounded-xl font-black text-[11px] border-2 transition-all shadow-lg uppercase tracking-widest ${isLoan ? 'neon-active-orange' : 'neon-active-emerald'}`}>
              {isLoan ? 'امانی (Loan)' : 'قطعی (Sale)'}
            </button>
          </div>
        </div>
        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-4 shadow-inner">
          <div className="flex items-center gap-4 mb-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${noCode ? 'bg-orange-500 border-orange-500' : 'border-white/20 group-hover:border-orange-500/50'}`}>
                <input type="checkbox" checked={noCode} onChange={e => setNoCode(e.target.checked)} className="hidden" />
                {noCode && <Check size={14} className="text-white" />}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">بدون کد (ثبت دستی)</span>
            </label>
          </div>
          <div className="flex gap-2">
            {noCode ? (
              <input 
                placeholder="شرح کالای بدون کد..." 
                value={manualDescription} 
                onChange={e => setManualDescription(e.target.value)} 
                className="flex-1 input-glass p-3 font-black shadow-inner border-orange-500/30" 
              />
            ) : (
              <>
                <input list="prods-gen" placeholder="شرح کالا یا کد..." value={tempCode} onChange={e=>setTempCode(e.target.value)} className="flex-1 input-glass p-3 font-black shadow-inner" />
                <datalist id="prods-gen">
                  {products.map((p) => (
                    <option key={p.code} value={p.description}>
                      {p.code}
                    </option>
                  ))}
                </datalist>
              </>
            )}
            <input type="number" step="0.5" placeholder="تعداد" value={tempQty} onChange={e=>setTempQty(parseFloat(e.target.value))} className="w-20 input-glass p-3 text-center font-black text-lg text-cyan-400 shadow-inner" />
            <button onClick={()=>{ 
              if (noCode) {
                if (!manualDescription.trim()) return alert('لطفاً شرح کالا را وارد کنید');
                setBasket([{productCode: 'بدون کد', productDescription: manualDescription, category: 'تعریف نشده', quantity: tempQty, unit: 'عدد', isLoan, id: Date.now()}, ...basket]);
                setManualDescription('');
              } else {
                const p = products.find((x)=>x.description===tempCode || x.code===tempCode); 
                if(p){ 
                  setBasket([{productCode: p.code, productDescription:p.description, category: p.category, quantity:tempQty, unit:p.unit, isLoan, id:Date.now()}, ...basket]); 
                } else if (tempCode.trim()) {
                  setBasket([{productCode: 'NEW', productDescription: tempCode, category: 'تعریف نشده', quantity: tempQty, unit: 'عدد', isLoan, id: Date.now()}, ...basket]);
                }
                setTempCode(''); 
              }
              setTempQty(1); 
            }} className={`p-3 rounded-xl text-white shadow-xl transition-all active:scale-90 ${noCode ? 'bg-orange-600 hover:bg-orange-500' : 'bg-cyan-600 hover:bg-cyan-500'}`}>
              <Plus size={24}/>
            </button>
          </div>
        </div>
        <div className="bg-black/50 rounded-2xl overflow-hidden min-h-[80px] text-[11px] font-black border border-white/5 shadow-inner">
          <table className="w-full text-right">
            <tbody>
              {basket.map((it) => (
                <tr key={it.id} className="border-b border-white/5 hover:bg-white/10 transition-all">
                  <td className="p-3">{it.productDescription}</td>
                  <td className="p-3 text-center text-cyan-400">{it.quantity} {it.unit}</td>
                  <td className="p-3 text-center">
                    <button onClick={()=>setBasket(basket.filter(x=>x.id!==it.id))} className="text-red-500 hover:scale-125 transition-all">
                      <X size={18}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] opacity-40 font-black uppercase">توضیحات حواله</label>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="دلیل خروج، مرکز هزینه یا جزییات فنی..." className="w-full input-glass p-3 h-20 font-medium text-[11px] leading-relaxed shadow-inner" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={onSignOpen} className={`py-2.5 rounded-xl border border-dashed transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-lg ${signature ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' : 'border-white/20 text-white/40 hover:bg-white/5'}`}>
            <PenTool size={15}/> {signature ? 'امضاء ثبت شد' : 'ثبت امضای دیجیتال'}
          </button>
          <button onClick={onCamOpen} className={`py-2.5 rounded-xl border border-dashed transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-lg ${photo ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10' : 'border-white/20 text-white/40 hover:bg-white/5'}`}>
            <Camera size={15}/> {photo ? 'تصویر ثبت شد' : 'تصویربرداری ضمیمه'}
          </button>
        </div>
        <button onClick={()=>{ 
          if(!recipient || !basket.length) return alert('اطلاعات ناقص'); 
          onSave({ id: Date.now().toString(), docNumber: docNum, items: basket, recipientName: recipient, orgUnit: recipientUnit, delivererName: currentUser.fullName, date: manualDate, timestamp: Date.now(), type:'EXIT', signature, photo, notes }); 
          setBasket([]); 
          setNotes(''); 
          setNoCode(false);
          setManualDescription('');
          alert('سند با موفقیت ثبت و آرشیو شد.'); 
        }} className="w-full bg-indigo-600 py-3.5 rounded-2xl font-black text-lg shadow-2xl transition-all active:scale-95 uppercase tracking-widest border-t border-white/20 hover:bg-indigo-500">
          تایید و بایگانی نهایی حواله خروج
        </button>
      </div>
      <div className="lg:col-span-4 space-y-6">
        <div className="diamond-neon p-5 rounded-2xl bg-indigo-950/20 shadow-lg border-indigo-500/10">
          <h4 className="text-[10px] font-black text-cyan-400 mb-4 uppercase flex items-center gap-2 tracking-widest"><Trophy size={14}/> اقلام پرمصرف فرد</h4>
          <div className="flex flex-wrap gap-1.5">{top10.map(([n,c])=>(<div key={n} className="bg-white/5 px-2 py-1 rounded-lg text-[10px] font-black border border-white/5 hover:border-cyan-500/30 transition-all">{n} | <span className="text-cyan-400">{c}</span></div>))}</div>
        </div>
        <div className="diamond-neon p-5 rounded-2xl h-[500px] overflow-y-auto custom-scrollbar shadow-lg border-indigo-500/10" dir="rtl">
          <h4 className="text-[10px] font-black text-indigo-400 mb-4 uppercase flex items-center gap-2 tracking-widest"><History size={14}/> سوابق اخیر خروجی</h4>
          <div className="space-y-3">
            {personHistory.map(h=>(
              <div key={h.id} className="bg-black/40 p-4 rounded-xl border border-white/5 group hover:border-indigo-500 transition-all shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <div onClick={()=>onRecordClick(h)} className="cursor-pointer">
                    <span className="text-indigo-300 font-mono text-[11px] font-black"># {h.docNumber}</span>
                    <span className="opacity-40 text-[10px] mr-2">{h.date}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => onEdit(h)} className="text-orange-400 p-1 hover:bg-orange-400/10 rounded-lg"><Edit3 size={14}/></button>
                    <button onClick={() => onDelete(h.id, h.type)} className="text-red-500 p-1 hover:bg-red-500/10 rounded-lg"><Trash2 size={14}/></button>
                  </div>
                </div>
                <div onClick={()=>onRecordClick(h)} className="space-y-1 mt-2 border-t border-white/5 pt-2 cursor-pointer">
                  {h.items.map((it:any, idx:number) => (
                    <div key={idx} className="flex justify-between text-[10px] text-white/80"><span>• {it.productDescription}</span><span className="text-cyan-400 font-black">{it.quantity} {it.unit}</span></div>
                  ))}
                </div>
              </div>
            ))}
            {personHistory.length === 0 && <div className="text-center py-10 text-[10px] opacity-20 uppercase font-black tracking-widest">تراکنشی یافت نشد</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
