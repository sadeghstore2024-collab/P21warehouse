/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { HardHat, Briefcase, Zap, ShieldCheck, Eye, Wind, PenTool, Camera, Trophy, History, FileText, X, Edit3, Trash2 } from 'lucide-react';
import { Recipient, ExitRecord, User } from '../types';

interface SafetyIssuanceFormProps {
  recipients: Recipient[];
  currentUser: User;
  history: ExitRecord[];
  onRecordClick: (record: ExitRecord) => void;
  onEdit: (record: ExitRecord) => void;
  onDelete: (id: string, type: string) => void;
  onSave: (record: any) => void;
  onSignOpen: () => void;
  onCamOpen: () => void;
  signature: string;
  photo: string | null;
}

const CLOTHING_SIZES = ['44', '46', '48', '50', '52', '54', '56', '58', '60', '62'];
const JACKET_SIZES = ['M', 'L', 'XL', 'XXL', '3XL', '4XL'];
const SHOE_SIZES = ['38', '39', '40', '41', '42', '43', '44', '45', '46'];
const HELMET_COLORS = [
  { id: 'white', label: 'سفید', class: 'bg-white' },
  { id: 'red', label: 'قرمز', class: 'bg-red-500' },
  { id: 'yellow', label: 'زرد', class: 'bg-yellow-400' },
  { id: 'green', label: 'سبز', class: 'bg-green-500' }
];

export const SafetyIssuanceForm: React.FC<SafetyIssuanceFormProps> = ({ 
  recipients, currentUser, history, onRecordClick, onEdit, onDelete, onSave,
  onSignOpen, onCamOpen, signature, photo
}) => {
  const [recipient, setRecipient] = useState('');
  const [manualDocNum, setManualDocNum] = useState('');
  const [basket, setBasket] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toLocaleDateString('fa-IR', { calendar: 'persian' }));
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState('50');
  const [selectedJacketSize, setSelectedJacketSize] = useState('XL');
  const [selectedWarmClothSize, setSelectedWarmClothSize] = useState('XL');
  const [selectedShoeSize, setSelectedShoeSize] = useState('42');
  const [selectedHelmetColor, setSelectedHelmetColor] = useState('white');
  const [visionType, setVisionType] = useState('DAY');
  const [notes, setNotes] = useState('');

  const top10 = useMemo(() => {
    const counts: Record<string, number> = {};
    history.filter((h) => h.recipientName === recipient).forEach((h) => {
      h.items.forEach((it) => counts[it.productDescription] = (counts[it.productDescription] || 0) + it.quantity);
    });
    return Object.entries(counts).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 10);
  }, [history, recipient]);

  const personHistory = useMemo(() => history.filter(h => h.recipientName === recipient), [history, recipient]);

  const ITEMS = [
    { n: 'لباس کار', type: 'CLOTH', icon: Briefcase },
    { n: 'کفش ایمنی', type: 'SHOE', icon: HardHat },
    { n: 'کلاه ایمنی', type: 'HELMET', icon: ShieldCheck },
    { n: 'کاپشن', type: 'JACKET', icon: Zap },
    { n: 'لباس گرم', type: 'WARM_CLOTH', icon: Wind },
    { n: 'عینک', type: 'VISION', icon: Eye },
    { n: 'ماسک فیلتر دار', type: 'MASK', icon: Wind }
  ];

  const addToBasket = (it: any) => {
    let specs = '';
    if (it.type === 'CLOTH') specs = `سایز لباس کار: ${selectedSize}`;
    if (it.type === 'SHOE') specs = `سایز کفش ایمنی: ${selectedShoeSize}`;
    if (it.type === 'JACKET') specs = `سایز کاپشن: ${selectedJacketSize}`;
    if (it.type === 'WARM_CLOTH') specs = `سایز لباس گرم: ${selectedWarmClothSize}`;
    if (it.type === 'HELMET') specs = `رنگ کلاه ایمنی: ${HELMET_COLORS.find(c => c.id === selectedHelmetColor)?.label}`;
    if (it.type === 'VISION') specs = `مدل عینک: ${visionType === 'DAY' ? 'دید در روز' : 'دید در شب'}`;
    if (it.type === 'MASK') specs = `استاندارد ماسک فیلتر دار`;

    setBasket([{ productDescription: it.n, quantity: qty, unit: 'عدد', technicalSpecs: specs, id: Date.now() }, ...basket]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-enter">
      <div className="lg:col-span-8 diamond-neon p-6 rounded-[2rem] border-emerald-500/20 space-y-5 shadow-xl">
        <h2 className="text-xl font-black text-emerald-400 ultra-glow-text flex items-center gap-3 uppercase tracking-widest"><HardHat size={28}/> تجهیزات ایمنی (S.M HSE Core)</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1 relative">
            <label className="text-[10px] opacity-40 font-black uppercase">تحویل‌گیرنده</label>
            <div className="relative">
              <input list="recs-ppe-2" placeholder="نام پرسنل..." value={recipient} onChange={e=>setRecipient(e.target.value)} className="w-full input-glass p-3 font-black shadow-inner pl-10" />
              {recipient && (
                <button 
                  onClick={() => setRecipient('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-red-500 transition-all"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <datalist id="recs-ppe-2">{recipients.map((r)=><option key={r.fullName} value={r.fullName}/>)}</datalist>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] opacity-40 font-black uppercase">شماره سند</label>
            <input placeholder="PPE-XXXX..." value={manualDocNum} onChange={e=>setManualDocNum(e.target.value)} className="w-full input-glass p-3 font-black shadow-inner" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] opacity-40 font-black uppercase">تعداد</label>
            <input type="number" value={qty} onChange={e=>setQty(parseInt(e.target.value))} className="w-full input-glass p-3 text-center font-black text-emerald-400 shadow-inner" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] opacity-40 font-black uppercase">تاریخ ثبت</label>
            <input type="text" value={date} onChange={e=>setDate(e.target.value)} className="w-full input-glass p-3 text-sm text-center font-black shadow-inner" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/40 p-6 rounded-2xl border border-white/5 shadow-inner">
          <div className="space-y-5">
            <div className="space-y-2 pb-4 border-b border-white/5">
              <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest block mb-2 flex items-center gap-2"><Briefcase size={12}/> انتخاب سایز لباس کار:</span>
              <div className="flex flex-wrap gap-2">
                {CLOTHING_SIZES.map(s=>(<button key={s} onClick={()=>setSelectedSize(s)} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black border transition-all ${selectedSize===s?'neon-active-emerald scale-105':'opacity-30 border-white/10 hover:opacity-100'}`}>{s}</button>))}
              </div>
            </div>
            <div className="space-y-2 pb-4 border-b border-white/5">
              <span className="text-[9px] text-cyan-400 font-black uppercase tracking-widest block mb-2 flex items-center gap-2"><Zap size={12}/> انتخاب سایز کاپشن:</span>
              <div className="flex flex-wrap gap-2">
                {JACKET_SIZES.map(s=>(<button key={s} onClick={()=>setSelectedJacketSize(s)} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black border transition-all ${selectedJacketSize===s?'neon-active-cyan scale-105':'opacity-30 border-white/10 hover:opacity-100'}`}>{s}</button>))}
              </div>
            </div>
            <div className="space-y-2 pb-4 border-b border-white/5">
              <span className="text-[9px] text-blue-400 font-black uppercase tracking-widest block mb-2 flex items-center gap-2"><Wind size={12}/> انتخاب سایز لباس گرم:</span>
              <div className="flex flex-wrap gap-2">
                {JACKET_SIZES.map(s=>(<button key={s} onClick={()=>setSelectedWarmClothSize(s)} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black border transition-all ${selectedWarmClothSize===s?'neon-active-indigo scale-105':'opacity-30 border-white/10 hover:opacity-100'}`}>{s}</button>))}
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <div className="space-y-2 pb-4 border-b border-white/5">
              <span className="text-[9px] text-orange-400 font-black uppercase tracking-widest block mb-2 flex items-center gap-2"><HardHat size={12}/> انتخاب سایز کفش ایمنی:</span>
              <div className="flex flex-wrap gap-2">
                {SHOE_SIZES.map(s=>(<button key={s} onClick={()=>setSelectedShoeSize(s)} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black border transition-all ${selectedShoeSize===s?'neon-active-orange scale-105':'opacity-30 border-white/10 hover:opacity-100'}`}>{s}</button>))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 items-center">
                <span className="text-[9px] opacity-40 font-black uppercase">کلاه:</span>
                <div className="flex gap-3">{HELMET_COLORS.map(c=><button key={c.id} onClick={()=>setSelectedHelmetColor(c.id)} className={`w-8 h-8 rounded-full border-2 transition-all ${c.class} ${selectedHelmetColor===c.id?'border-white shadow-xl scale-125 ring-2 ring-emerald-500/20':'border-transparent opacity-20 hover:opacity-50'}`}></button>)}</div>
              </div>
              <div className="flex gap-3 items-center">
                <span className="text-[9px] opacity-40 font-black uppercase">عینک:</span>
                <button onClick={()=>setVisionType('DAY')} className={`px-4 py-2 rounded-xl text-[10px] font-black border flex items-center gap-2 transition-all ${visionType==='DAY'?'neon-active-cyan scale-105':'opacity-30 border-white/10 hover:opacity-100'}`}><Sun size={14}/> روز</button>
                <button onClick={()=>setVisionType('NIGHT')} className={`px-4 py-2 rounded-xl text-[10px] font-black border flex items-center gap-2 transition-all ${visionType==='NIGHT'?'neon-active-indigo scale-105':'opacity-30 border-white/10 hover:opacity-100'}`}><Moon size={14}/> شب</button>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">{ITEMS.map(it=>(<button key={it.n} onClick={()=>addToBasket(it)} className="diamond-neon p-4 rounded-2xl font-black border border-white/5 hover:border-emerald-500 hover:scale-105 transition-all text-[11px] flex flex-col items-center gap-3 shadow-lg group"><div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-all"><it.icon size={22}/></div> {it.n}</button>))}</div>
        
        <div className="space-y-1"><label className="text-[10px] opacity-40 font-black uppercase">توضیحات تکمیلی HSE</label><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="ملاحظات ایمنی، وضعیت ظاهری یا دلایل تعویض..." className="w-full input-glass p-4 h-24 font-medium text-[12px] leading-relaxed shadow-inner" /></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={onSignOpen} className={`py-3.5 rounded-2xl border border-dashed transition-all flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-widest shadow-lg ${signature ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-white/20 text-white/40 hover:bg-white/5'}`}><PenTool size={18}/> {signature ? 'امضاء ثبت شد' : 'ثبت امضای دیجیتال'}</button>
          <button onClick={onCamOpen} className={`py-3.5 rounded-2xl border border-dashed transition-all flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-widest shadow-lg ${photo ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10' : 'border-white/20 text-white/40 hover:bg-white/5'}`}><Camera size={18}/> {photo ? 'تصویر ثبت شد' : 'تصویربرداری ضمیمه'}</button>
        </div>
        <div className="bg-black/40 p-5 rounded-2xl space-y-3 min-h-[80px] border border-white/5 shadow-inner">{basket.map(it=>(<div key={it.id} className="flex justify-between items-center bg-white/5 p-3 px-5 rounded-2xl border border-white/5 transition-all hover:bg-white/10 shadow-sm"><div className="flex flex-col"><span className="text-[13px] font-black text-emerald-400">{it.productDescription}</span><span className="text-[10px] opacity-50 font-black">{it.technicalSpecs}</span></div><button onClick={()=>setBasket(basket.filter(x=>x.id!==it.id))} className="text-red-500 hover:scale-125 transition-all p-2"><X size={20}/></button></div>))}</div>
        <button onClick={()=>{ if(!recipient || !basket.length) return alert('اطلاعات ناقص'); onSave({ id: Date.now().toString(), docNumber: manualDocNum || `PPE-${Date.now().toString().slice(-4)}`, items: basket, recipientName: recipient, orgUnit: '', delivererName: currentUser.fullName, date: date, timestamp: Date.now(), type:'PPE', signature, photo, notes }); setBasket([]); setNotes(''); setManualDocNum(''); alert('پرونده ایمنی با موفقیت بایگانی شد.'); }} className="w-full bg-emerald-600 py-4 rounded-[1.5rem] font-black text-xl shadow-2xl shadow-emerald-600/20 active:scale-95 transition-all border-t border-white/20 uppercase tracking-[0.2em]">تایید و بایگانی نهایی HSE</button>
      </div>
      <div className="lg:col-span-4 space-y-6">
        <div className="diamond-neon p-6 rounded-3xl bg-emerald-950/20 border-emerald-500/10 shadow-xl"><h4 className="text-[11px] font-black text-emerald-400 mb-5 uppercase tracking-widest flex items-center gap-3 border-b border-white/5 pb-3"><Trophy size={16}/> اقلام مصرفی فرد</h4><div className="flex flex-wrap gap-2">{top10.map(([n,c])=>(<div key={n} className="bg-white/5 px-3 py-1.5 rounded-xl text-[11px] font-black border border-white/5 hover:border-emerald-500/30 transition-all shadow-sm">{n} | <span className="text-emerald-400 font-bold">{c}</span></div>))}</div></div>
        <div className="diamond-neon p-6 rounded-3xl h-[500px] overflow-y-auto custom-scrollbar border-emerald-500/10 shadow-xl" dir="rtl">
          <h4 className="text-[11px] font-black text-emerald-400 mb-5 uppercase tracking-widest flex items-center gap-3 border-b border-white/5 pb-3"><History size={16}/> سوابق آرشیو HSE</h4>
          <div className="space-y-4">
            {personHistory.map(h=>(
              <div key={h.id} className="bg-black/50 p-5 rounded-2xl border border-white/5 group hover:border-emerald-500 hover:bg-emerald-500/5 transition-all shadow-md">
                <div className="flex justify-between items-center mb-3">
                  <div onClick={()=>onRecordClick(h)} className="cursor-pointer">
                    <span className="text-emerald-300 font-mono tracking-tighter text-[12px] font-black"># {h.docNumber}</span>
                    <span className="opacity-40 text-[10px] mr-2">{h.date}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => onEdit(h)} className="text-orange-400 p-1.5 hover:bg-orange-400/10 rounded-lg"><Edit3 size={14}/></button>
                    <button onClick={() => onDelete(h.id, h.type)} className="text-red-500 p-1.5 hover:bg-red-500/10 rounded-lg"><Trash2 size={14}/></button>
                  </div>
                </div>
                <div onClick={()=>onRecordClick(h)} className="space-y-2 border-t border-white/5 pt-3 cursor-pointer">
                  {h.items.map((it:any, idx:number) => (
                    <div key={idx} className="flex justify-between text-[11px] bg-white/5 p-2 rounded-lg">
                      <span className="font-bold opacity-80">{it.productDescription}</span>
                      <span className="text-emerald-400 font-black">{it.quantity} عدد</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {personHistory.length === 0 && <div className="text-center py-16 opacity-10 flex flex-col items-center gap-4"><FileText size={48}/><span className="text-[11px] font-black uppercase tracking-[0.3em]">داده‌ای یافت نشد</span></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

const Sun: React.FC<any> = ({size}) => <div style={{width:size, height:size}} className="bg-yellow-400 rounded-full shadow-[0_0_10px_#facc15]"></div>;
const Moon: React.FC<any> = ({size}) => <div style={{width:size, height:size}} className="bg-indigo-400 rounded-full shadow-[0_0_10px_#818cf8]"></div>;
