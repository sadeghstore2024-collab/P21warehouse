/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';

interface ModificationAuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
  onFail: () => void;
  correctPass: string;
  description: string;
}

export const ModificationAuthModal: React.FC<ModificationAuthModalProps> = ({ onClose, onSuccess, onFail, correctPass, description }) => {
  const [pass, setPass] = useState('');
  return (
    <div className="fixed inset-0 z-[5000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-10 animate-enter">
      <div className="w-full max-w-md diamond-neon p-12 rounded-[4rem] border-red-500/40 bg-[#010409] text-center space-y-10 shadow-[0_0_100px_rgba(239,68,68,0.2)]">
        <div className="w-24 h-24 bg-red-500/10 rounded-[3rem] flex items-center justify-center mx-auto text-red-500 animate-pulse border border-red-500/30 shadow-inner"><ShieldAlert size={64}/></div>
        <div className="space-y-3">
          <h2 className="text-2xl font-black text-white ultra-glow-text uppercase tracking-tighter">احراز هویت امنیتی</h2>
          <p className="text-[10px] text-white/40 font-black uppercase tracking-widest leading-relaxed">{description}</p>
        </div>
        <input 
          type="password" 
          placeholder="SECURITY KEY..." 
          value={pass} 
          onChange={e => setPass(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && (pass === correctPass ? onSuccess() : onFail())} 
          className="w-full input-glass p-7 rounded-[2.5rem] text-center font-black text-4xl outline-none focus:ring-4 focus:ring-red-500/20 shadow-inner tracking-widest" 
          autoFocus 
        />
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-5 bg-white/5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">لغو عملیات</button>
          <button onClick={() => pass === correctPass ? onSuccess() : onFail()} className="flex-[2] py-5 bg-red-600 rounded-[2rem] font-black text-sm shadow-2xl transition-all active:scale-95 border-t border-white/20 uppercase tracking-[0.2em]">تایید و آزادسازی</button>
        </div>
      </div>
    </div>
  );
};
