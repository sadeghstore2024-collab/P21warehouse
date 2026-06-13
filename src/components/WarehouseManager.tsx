/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Box, Layers, Edit3, Trash2 } from 'lucide-react';
import { Product } from '../types';

interface WarehouseManagerProps {
  products: Product[];
  onAdd: (product: Product) => void;
  onUpdate: (product: Product) => void;
  onDelete: (code: string) => void;
  isAdmin: boolean;
}

export const WarehouseManager: React.FC<WarehouseManagerProps> = ({ products, onAdd, onUpdate, onDelete, isAdmin }) => {
  const [code, setCode] = useState('');
  const [desc, setDesc] = useState('');
  const [unit, setUnit] = useState('عدد');
  const [specs, setSpecs] = useState('');
  const [category, setCategory] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const handleCodeChange = (val: string) => {
    setCode(val);
    const exists = products.some(p => p.code === val && (!editing || editing.code !== val));
    setIsDuplicate(exists);
  };

  return (
    <div className="space-y-6 animate-enter">
      <div className={`diamond-neon p-5 rounded-2xl border-indigo-500/20 bg-indigo-900/5 shadow-lg space-y-3 transition-all duration-500 ${isDuplicate ? 'animate-heartbeat-red-neon' : ''}`}>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-black ultra-glow-text flex items-center gap-3 text-indigo-300 uppercase tracking-widest"><Box size={24}/> مدیریت موجودی کالا</h3>
          {isDuplicate && <span className="text-red-500 text-[10px] font-black animate-pulse">⚠️ کد کالا تکراری است!</span>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input placeholder="کد کالا..." value={code} onChange={e=>handleCodeChange(e.target.value)} className={`input-glass shadow-inner ${isDuplicate ? 'border-red-500/50 text-red-200' : ''}`} />
          <input placeholder="شرح کالا..." value={desc} onChange={e=>setDesc(e.target.value)} className="input-glass shadow-inner" />
          <input placeholder="بخش (پمپ گل، دراوکس...)" value={category} onChange={e=>setCategory(e.target.value)} className="input-glass shadow-inner" />
          <input placeholder="مشخصات فنی..." value={specs} onChange={e=>setSpecs(e.target.value)} className="input-glass shadow-inner" />
          <input placeholder="واحد..." value={unit} onChange={e=>setUnit(e.target.value)} className="input-glass shadow-inner" />
          <button 
            onClick={()=>{ 
              if(!code || !desc || isDuplicate) return; 
              if(editing) { 
                onUpdate({code, description:desc, unit, technicalSpecs: specs, category}); 
                setEditing(null); 
              } else {
                onAdd({code, description:desc, unit, technicalSpecs: specs, category}); 
              }
              setCode(''); setDesc(''); setSpecs(''); setCategory(''); setIsDuplicate(false);
            }} 
            disabled={isDuplicate}
            className="md:col-span-5 bg-indigo-600 py-3 rounded-xl font-black text-sm shadow-xl active:scale-95 transition-all border-t border-white/20 uppercase tracking-widest hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editing ? 'بروزرسانی کالا' : 'افزودن به لیست انبار'}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {products.map((p)=>(
          <div key={p.code} className="diamond-neon p-3 rounded-xl border border-white/5 flex justify-between items-center group transition-all hover:bg-white/5 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 shadow-inner"><Layers size={16}/></div>
              <div>
                <span className="font-black text-[11px] block">{p.description}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] opacity-40 font-mono tracking-tighter truncate max-w-[80px]">{p.technicalSpecs || 'بدون مشخصات'}</span>
                  {p.category && <span className="text-[8px] bg-indigo-500/20 text-indigo-300 px-1.5 rounded-md font-black">{p.category}</span>}
                </div>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <button onClick={()=>{setEditing(p); setCode(p.code); setDesc(p.description); setUnit(p.unit); setSpecs(p.technicalSpecs || ''); setCategory(p.category || '');}} className="text-orange-400 p-1.5 hover:bg-orange-400/10 rounded-lg"><Edit3 size={14}/></button>
              <button onClick={()=>onDelete(p.code)} className="text-red-500 p-1.5 hover:bg-red-500/10 rounded-lg"><Trash2 size={14}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
