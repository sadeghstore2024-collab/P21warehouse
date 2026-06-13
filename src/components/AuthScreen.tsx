/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Database, Cpu } from 'lucide-react';
import { User } from '../types';

interface AuthScreenProps {
  users: User[];
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleAttemptLogin = () => {
    const u = users.find(x => x.username === username && x.password === password);
    if (u) onLogin(u);
    else alert('خطا در احراز هویت شبکه.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-10 bg-[#010409] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10"><Database className="w-full h-full text-indigo-500" /></div>
      <div className="glass-panel w-full max-w-sm p-14 rounded-[5rem] text-center shadow-[0_0_120px_rgba(99,102,241,0.3)] relative z-10">
        <div className="w-28 h-28 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 animate-pulse shadow-2xl shadow-indigo-600/20 ring-4 ring-indigo-500/20">
          <Cpu size={56} className="text-white"/>
        </div>
        <h1 className="text-3xl font-black mb-12 ultra-glow-text uppercase tracking-tighter text-indigo-100">P21 WAREHOUSE</h1>
        <div className="space-y-6">
           <input 
             placeholder="نام کاربری..." 
             value={username} 
             onChange={e => setUsername(e.target.value)} 
             onKeyDown={e => e.key === 'Enter' && handleAttemptLogin()} 
             className="w-full input-glass p-5 rounded-[1.5rem] text-center font-black text-xl shadow-inner outline-none transition-all focus:ring-4 focus:ring-indigo-500/20" 
           />
           <input 
             type="password" 
             placeholder="گذرواژه..." 
             value={password} 
             onChange={e => setPassword(e.target.value)} 
             onKeyDown={e => e.key === 'Enter' && handleAttemptLogin()} 
             className="w-full input-glass p-5 rounded-[1.5rem] text-center font-black text-xl shadow-inner outline-none transition-all focus:ring-4 focus:ring-indigo-500/20" 
           />
           <button 
             onClick={handleAttemptLogin} 
             className="w-full bg-gradient-to-r from-indigo-700 to-indigo-500 py-5 rounded-[1.5rem] font-black text-lg text-white shadow-2xl uppercase tracking-[0.2em] active:scale-95 transition-all border-t border-white/20"
           >
             اتصال به واحد مرکزی
           </button>
        </div>
      </div>
    </div>
  );
};
