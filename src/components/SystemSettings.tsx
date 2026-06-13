/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Database, Download, RefreshCcw, UserCog, UserPlus, UserMinus, UserCircle2, ShieldCheck, Info } from 'lucide-react';
import { User, UserRole } from '../types';
import { sendTelegramBackup } from '../services/telegramService';

interface SystemSettingsProps {
  currentUser: User;
  users: User[];
  onUpdateUser: (user: User) => void;
  onAddUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  db: any;
  onRestore: (data: any) => void;
  isAdmin: boolean;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({ 
  currentUser, users, onUpdateUser, onAddUser, onDeleteUser, db, onRestore, isAdmin 
}) => {
    const [uName, setUName] = useState(''); 
    const [uPass, setUPass] = useState(''); 
    const [uFull, setUFull] = useState(''); 
    const [uRole, setURole] = useState(UserRole.OPERATOR); 
    const [uMod, setUMod] = useState('');
    const [myNewPass, setMyNewPass] = useState(''); 
    const [myNewMod, setMyNewMod] = useState('');

    const handleFullBackup = async () => { 
      const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' }); 
      const url = URL.createObjectURL(blob); 
      const a = document.createElement('a'); 
      a.href = url; 
      a.download = `P21_Ultra_Backup_${new Date().getTime()}.json`; 
      a.click(); 
      sendTelegramBackup(db); // Start in background
      alert('بک‌آپ صادر و به تلگرام ارسال شد.'); 
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-enter no-print pb-10">
            <div className="lg:col-span-8 space-y-6">
                <div className="diamond-neon p-10 rounded-[3rem] bg-indigo-500/5 text-center shadow-xl border-indigo-500/10">
                    <Database size={48} className="mx-auto mb-4 text-indigo-400 animate-pulse"/>
                    <h3 className="text-xl font-black ultra-glow-text uppercase tracking-widest mb-2">پشتیبان‌گیری و بازیابی</h3>
                    <p className="text-[10px] opacity-40 uppercase font-black tracking-widest mb-8">کنترل کامل پشتیبان‌گیری و بازیابی داده‌های عملیاتی</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button onClick={handleFullBackup} className="bg-indigo-600 py-6 rounded-[2rem] font-black flex items-center justify-center gap-3 shadow-2xl hover:bg-indigo-500 transition-all active:scale-95 border-t border-white/10 uppercase tracking-widest">
                        <Download size={22}/> صدور بک‌آپ کامل
                      </button>
                      <label className="bg-cyan-600 py-6 rounded-[2rem] font-black flex items-center justify-center gap-3 cursor-pointer border-t border-white/20 transition-all shadow-2xl hover:bg-cyan-500 active:scale-95 uppercase tracking-widest">
                        <input type="file" className="hidden" onChange={(e)=>{ 
                          const file=e.target.files?.[0]; 
                          if(file){ 
                            const reader=new FileReader(); 
                            reader.onload=(ev)=>onRestore(JSON.parse(ev.target?.result as string)); 
                            reader.readAsText(file); 
                            alert('بازیابی اطلاعات با موفقیت انجام شد.'); 
                          } 
                        }} />
                        <RefreshCcw size={22}/> بازیابی دیتابیس
                      </label>
                    </div>
                </div>

                {isAdmin ? (
                    <div className="diamond-neon p-8 rounded-[3rem] bg-black/60 border border-indigo-500/10 space-y-8 shadow-2xl">
                        <h3 className="text-xl font-black text-indigo-300 flex items-center gap-4 uppercase tracking-tighter border-b border-white/5 pb-4"><UserCog size={28}/> مدیریت سطح دسترسی کاربران</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1"><label className="text-[10px] opacity-40 font-black uppercase">نام کاربری (ID)</label><input placeholder="Unique ID..." value={uName} onChange={e=>setUName(e.target.value)} className="w-full input-glass p-4 rounded-2xl shadow-inner font-mono" /></div>
                            <div className="space-y-1"><label className="text-[10px] opacity-40 font-black uppercase">نام نمایشی</label><input placeholder="Full Name..." value={uFull} onChange={e=>setUFull(e.target.value)} className="w-full input-glass p-4 rounded-2xl shadow-inner" /></div>
                            <div className="space-y-1"><label className="text-[10px] opacity-40 font-black uppercase">رمز عبور ورود</label><input type="password" placeholder="Entry Password..." value={uPass} onChange={e=>setUPass(e.target.value)} className="w-full input-glass p-4 rounded-2xl shadow-inner font-mono" /></div>
                            <div className="space-y-1"><label className="text-[10px] opacity-40 font-black uppercase">رمز عبور امنیتی (Mod)</label><input type="password" placeholder="Mod Password..." value={uMod} onChange={e=>setUMod(e.target.value)} className="w-full input-glass p-4 rounded-2xl shadow-inner font-mono" /></div>
                            <div className="space-y-1"><label className="text-[10px] opacity-40 font-black uppercase">نقش سیستمی</label><select value={uRole} onChange={e=>setURole(e.target.value as UserRole)} className="w-full input-glass p-4 rounded-2xl shadow-inner font-black"><option value={UserRole.ADMIN}>مدیر ارشد (Administrator)</option><option value={UserRole.OPERATOR}>کاربر حرفه‌ای (Power User)</option></select></div>
                            <div className="flex items-end"><button onClick={()=>{ if(!uName || !uPass) return; onAddUser({id: Date.now().toString(), username: uName, password: uPass, fullName: uFull, role: uRole, modPassword: uMod}); setUName(''); setUPass(''); setUFull(''); setUMod(''); }} className="w-full bg-indigo-600 rounded-2xl font-black text-sm h-[58px] flex items-center justify-center gap-3 transition-all hover:bg-indigo-500 shadow-xl active:scale-95 uppercase tracking-widest"><UserPlus size={20}/> افزودن کاربر جدید</button></div>
                        </div>
                        <div className="space-y-3 mt-8">
                            {users.map((u) => (
                                <div key={u.id} className="flex justify-between items-center bg-white/5 p-5 rounded-3xl border border-white/5 group transition-all hover:border-indigo-500/40 hover:bg-white/10 shadow-lg">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 font-black text-xl shadow-inner ring-1 ring-white/5">{u.fullName.charAt(0)}</div>
                                        <div>
                                            <div className="flex items-center gap-2"><span className="font-black text-sm block">{u.fullName}</span><span className="text-[9px] text-white/20 font-mono">@{u.username}</span></div>
                                            <span className="text-[9px] opacity-40 font-black uppercase tracking-[0.2em]">{u.role}</span>
                                        </div>
                                    </div>
                                    {u.id !== '1' && (
                                      <button onClick={()=>onDeleteUser(u.id)} className="text-red-500 p-3 hover:bg-red-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100 shadow-lg"><UserMinus size={22}/></button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="diamond-neon p-8 rounded-[3rem] bg-black/60 border border-indigo-500/10 space-y-4 shadow-2xl flex flex-col items-center justify-center text-center">
                        <ShieldCheck size={48} className="text-indigo-400 mb-4 opacity-20"/>
                        <h3 className="text-lg font-black text-indigo-300 uppercase tracking-widest">مدیریت کاربران محدود شده است</h3>
                        <p className="text-[10px] opacity-40 font-black uppercase tracking-widest leading-relaxed">فقط مدیران ارشد سیستم مجاز به مدیریت حساب‌های کاربری هستند.<br/>شما می‌توانید پروفایل امنیتی خود را در بخش کناری مدیریت کنید.</p>
                    </div>
                )}
            </div>
            <div className="lg:col-span-4 space-y-6">
                <div className="diamond-neon p-8 rounded-[3rem] bg-indigo-900/10 border-indigo-500/20 text-center shadow-2xl">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                      <div className="absolute inset-0 bg-indigo-500 rounded-3xl blur opacity-20 animate-pulse"></div>
                      <div className="relative w-full h-full bg-black rounded-3xl border border-indigo-500/30 flex items-center justify-center shadow-inner overflow-hidden">
                        <UserCircle2 size={56} className="text-indigo-400"/>
                      </div>
                    </div>
                    <h4 className="font-black text-lg text-white mb-1 ultra-glow-text uppercase tracking-tight">{currentUser.fullName}</h4>
                    <p className="text-[10px] opacity-30 uppercase font-black tracking-[0.4em] mb-8">{currentUser.role}</p>
                    <div className="space-y-4 pt-6 border-t border-white/5">
                        <div className="space-y-1"><label className="text-[9px] opacity-30 uppercase font-black text-right block pr-2">تغییر نام کاربری</label><input placeholder="New Username..." value={uName || currentUser.username} onChange={e=>setUName(e.target.value)} className="w-full input-glass text-center font-mono shadow-inner" /></div>
                        <div className="space-y-1"><label className="text-[9px] opacity-30 uppercase font-black text-right block pr-2">تغییر گذرواژه ورود</label><input type="password" placeholder="New Entry Password..." value={myNewPass} onChange={e=>setMyNewPass(e.target.value)} className="w-full input-glass text-center font-mono shadow-inner" /></div>
                        <div className="space-y-1"><label className="text-[9px] opacity-30 uppercase font-black text-right block pr-2">تغییر کد امنیتی (Mod)</label><input type="password" placeholder="New Mod Password..." value={myNewMod} onChange={e=>setMyNewMod(e.target.value)} className="w-full input-glass text-center font-mono shadow-inner" /></div>
                        <button onClick={() => { 
                          const updated = {...currentUser};
                          if(uName) updated.username = uName;
                          if(myNewPass) updated.password = myNewPass;
                          if(myNewMod) updated.modPassword = myNewMod;
                          onUpdateUser(updated);
                          setMyNewPass(''); setMyNewMod(''); setUName('');
                          alert('پروفایل امنیتی شما با موفقیت بروزرسانی شد.');
                        }} className="w-full py-4 bg-indigo-600 rounded-2xl font-black text-xs shadow-2xl transition-all active:scale-95 border-t border-white/20 uppercase tracking-[0.2em] hover:bg-indigo-500"><ShieldCheck size={16} className="inline-block ml-2"/> ذخیره تغییرات امنیتی</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
