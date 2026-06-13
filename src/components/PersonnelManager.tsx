/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, Trash2, Edit3 } from 'lucide-react';
import { Recipient } from '../types';

interface PersonnelManagerProps {
  recipients: Recipient[];
  onAdd: (recipient: Recipient) => void;
  onUpdate: (recipient: Recipient) => void;
  onDelete: (fullName: string) => void;
  isAdmin: boolean;
}

export const PersonnelManager: React.FC<PersonnelManagerProps> = ({ recipients, onAdd, onUpdate, onDelete, isAdmin }) => {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [editing, setEditing] = useState<Recipient | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    const exists = recipients.some(r => r.fullName === val && (!editing || editing.fullName !== val));
    setIsDuplicate(exists);
  };

  const handleAction = () => {
    if (!name || isDuplicate) return;
    if (editing) {
      onUpdate({ ...editing, fullName: name, orgUnit: unit });
      setEditing(null);
    } else {
      onAdd({ fullName: name, orgUnit: unit, safetyScore: 100 });
    }
    setName('');
    setUnit('');
    setIsDuplicate(false);
  };

  return (
    <div className="space-y-6 animate-enter">
      <div className={`diamond-neon p-6 rounded-2xl border-indigo-500/20 bg-indigo-900/5 shadow-lg space-y-4 transition-all duration-500 ${isDuplicate ? 'animate-heartbeat-red-neon' : ''}`}>
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-black text-indigo-300 flex items-center gap-3 uppercase tracking-widest">
            <Users size={28}/> {editing ? 'ویرایش اطلاعات پرسنل' : 'مدیریت پرسنل و گروه‌های هدف'}
          </h3>
          {isDuplicate && <span className="text-red-500 text-[10px] font-black animate-pulse">⚠️ نام پرسنل تکراری است!</span>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="نام و نام خانوادگی..." value={name} onChange={e=>handleNameChange(e.target.value)} className={`input-glass shadow-inner ${isDuplicate ? 'border-red-500/50 text-red-200' : ''}`} />
          <input placeholder="واحد سازمانی / پیمانکار..." value={unit} onChange={e=>setUnit(e.target.value)} className="input-glass shadow-inner" />
          <div className="flex gap-2">
            <button onClick={handleAction} disabled={isDuplicate} className="flex-1 bg-indigo-600 rounded-xl font-black text-sm transition-all hover:bg-indigo-500 uppercase tracking-widest shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
              {editing ? 'بروزرسانی' : 'افزودن پرسنل'}
            </button>
            {editing && (
              <button onClick={() => { setEditing(null); setName(''); setUnit(''); setIsDuplicate(false); }} className="px-4 bg-white/10 rounded-xl font-black text-xs hover:bg-white/20 transition-all">انصراف</button>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {recipients.map((r, i) => (
          <div key={i} className="diamond-neon p-5 rounded-2xl border border-white/5 bg-black/40 group hover:bg-indigo-500/5 transition-all">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-black text-sm text-white">{r.fullName}</h4>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => { setEditing(r); setName(r.fullName); setUnit(r.orgUnit || ''); setIsDuplicate(false); }} className="text-orange-400 p-1.5 hover:bg-orange-400/10 rounded-lg"><Edit3 size={14}/></button>
                <button onClick={() => onDelete(r.fullName)} className="text-red-500 p-1.5 hover:bg-red-500/10 rounded-lg"><Trash2 size={14}/></button>
              </div>
            </div>
            <div className="flex justify-between text-[10px] opacity-40 font-bold uppercase tracking-widest">
              <span>{r.orgUnit || 'بدون واحد'}</span>
              <span className="text-emerald-400">{r.safetyScore || 100}% SAFETY</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
