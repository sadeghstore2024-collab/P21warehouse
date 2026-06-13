/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, PackagePlus, HardHat, Box, Users, RotateCcw, BookOpen, BarChart3, Settings, LogOut, Cpu, Zap, Award, Truck, AlertCircle
} from 'lucide-react';
import { 
  sendTelegramMessage, 
  formatExitMessage, 
  formatPpeMessage, 
  formatWelcomeMessage, 
  formatLogoutMessage, 
  formatReturnLoanMessage, 
  formatEditRecordMessage, 
  formatDeleteRequestMessage,
  formatProductActionMessage,
  formatPersonnelActionMessage,
  formatUserActionMessage,
  formatRestoreMessage,
  sendTelegramBackup
} from './services/telegramService';
import { AuthScreen } from './components/AuthScreen';
import { DashboardView } from './components/DashboardView';
import { GeneralExitForm } from './components/GeneralExitForm';
import { SafetyIssuanceForm } from './components/SafetyIssuanceForm';
import { WarehouseManager } from './components/WarehouseManager';
import { PersonnelManager } from './components/PersonnelManager';
import { LoanManager } from './components/LoanManager';
import { GlobalLogView } from './components/GlobalLogView';
import { ReportingView } from './components/ReportingView';
import { SystemSettings } from './components/SystemSettings';
import { UnregisteredExitsView } from './components/UnregisteredExitsView';
import { WaybillManager } from './components/WaybillManager';
import { AIAssistantOverlay } from './components/AIAssistantOverlay';
import { RecordOverlay } from './components/RecordOverlay';
import { EditOverlay } from './components/EditOverlay';
import { ModificationAuthModal } from './components/ModificationAuthModal';
import { SignatureModal } from './components/SignatureModal';
import { CameraModal } from './components/CameraModal';
import { User, UserRole, Product, ExitRecord, Recipient, Waybill } from './types';

const STABLE_KEYS = {
  PRODUCTS: 'P21_ULTRA_STABLE_PRODUCTS',
  EXITS: 'P21_ULTRA_STABLE_EXITS',
  RECIPIENTS: 'P21_ULTRA_STABLE_RECIPIENTS',
  USERS: 'P21_ULTRA_STABLE_USERS',
  SESSION: 'P21_ULTRA_STABLE_SESSION',
  PPE: 'P21_ULTRA_STABLE_PPE',
  WAYBILLS: 'P21_ULTRA_STABLE_WAYBILLS'
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedRecord, setSelectedRecord] = useState<ExitRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<ExitRecord | null>(null);
  const [securityContext, setSecurityContext] = useState<{ isOpen: boolean; action: () => void; description: string } | null>(null);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [isSignOpen, setSignOpen] = useState(false);
  const [isCamOpen, setCamOpen] = useState(false);
  const [tempSignature, setTempSignature] = useState('');
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([
    { id: '1', username: 'sadegh', password: 'p21admin', fullName: 'صادق محمدی', role: UserRole.ADMIN, modPassword: '21' },
    { id: '2', username: 'مهران', password: '123', fullName: 'مهران رستگاری', role: UserRole.OPERATOR, modPassword: '123' }
  ]);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const data = localStorage.getItem(STABLE_KEYS.SESSION);
    return data ? JSON.parse(data) : null;
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [exits, setExits] = useState<ExitRecord[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [ppeRecords, setPpeRecords] = useState<ExitRecord[]>([]);
  const [waybills, setWaybills] = useState<Waybill[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const productsRef = React.useRef(products);
  const exitsRef = React.useRef(exits);
  const recipientsRef = React.useRef(recipients);
  const usersRef = React.useRef(users);
  const ppeRef = React.useRef(ppeRecords);
  const waybillsRef = React.useRef(waybills);
  useEffect(() => { productsRef.current = products; }, [products]);
  useEffect(() => { exitsRef.current = exits; }, [exits]);
  useEffect(() => { recipientsRef.current = recipients; }, [recipients]);
  useEffect(() => { usersRef.current = users; }, [users]);
  useEffect(() => { ppeRef.current = ppeRecords; }, [ppeRecords]);
  useEffect(() => { waybillsRef.current = waybills; }, [waybills]);

  // True while there is a local change that hasn't been confirmed-saved to the server yet.
  // While true, incoming poll results must NOT overwrite local state (prevents the
  // "data disappears right after I add it" bug caused by a race with the 5s poll).
  const pendingSaveRef = React.useRef(false);
  const saveSeqRef = React.useRef(0);

  // Load shared data from server on first mount, then poll periodically
  useEffect(() => {
    // Only replace local data with server data if the server actually has data,
    // or if we don't have any local data yet — this prevents a temporarily-empty
    // server response (e.g. right after a restart) from wiping local data.
    const safeSet = (serverArr: any, localArr: any[], setter: (v: any[]) => void) => {
      if (Array.isArray(serverArr) && (serverArr.length > 0 || localArr.length === 0)) {
        setter(serverArr);
      }
    };
    const load = () => {
      // If the user just made a local change that hasn't been saved+confirmed yet,
      // skip this poll entirely so we don't overwrite the new local data with
      // stale server data.
      if (pendingSaveRef.current) return;
      fetch('/api/state')
        .then(res => res.json())
        .then(data => {
          if (pendingSaveRef.current) return; // re-check after the request resolves
          safeSet(data.products, productsRef.current, setProducts);
          safeSet(data.exits, exitsRef.current, setExits);
          safeSet(data.recipients, recipientsRef.current, setRecipients);
          safeSet(data.users, usersRef.current, setUsers);
          safeSet(data.ppeRecords, ppeRef.current, setPpeRecords);
          safeSet(data.waybills, waybillsRef.current, setWaybills);
        })
        .catch(() => {})
        .finally(() => setDataLoaded(true));
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  // Save shared data to server whenever it changes
  useEffect(() => {
    if (!dataLoaded) return;
    pendingSaveRef.current = true;
    const mySeq = ++saveSeqRef.current;
    const timeout = setTimeout(() => {
      fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products, exits, recipients, users, ppeRecords, waybills })
      })
        .catch(() => {})
        .finally(() => {
          // Only clear the flag if no newer change has started in the meantime
          if (saveSeqRef.current === mySeq) pendingSaveRef.current = false;
        });
    }, 500);
    return () => clearTimeout(timeout);
  }, [products, exits, recipients, ppeRecords, waybills, users, dataLoaded]);

  useEffect(() => {
    if(currentUser) localStorage.setItem(STABLE_KEYS.SESSION, JSON.stringify(currentUser));
  }, [currentUser]);

  const handleLogout = () => {
    if (currentUser) sendTelegramMessage(formatLogoutMessage(currentUser), true);
    setCurrentUser(null);
    localStorage.removeItem(STABLE_KEYS.SESSION);
    setActiveTab('dashboard');
  };

  const handleSecurityCheck = (action: () => void, description: string) => {
    setSecurityContext({ isOpen: true, action, description });
  };

  const requestDelete = (type: string, id: string) => {
    const op = currentUser?.fullName || 'System';
    let targetRecord: any = null;
    if (type === 'EXIT') targetRecord = exits.find(e => e.id === id);
    else if (type === 'PPE') targetRecord = ppeRecords.find(p => p.id === id);
    else if (type === 'PRODUCT') targetRecord = products.find(p => p.code === id);
    else if (type === 'RECIPIENT') targetRecord = recipients.find(r => r.fullName === id);
    
    // Permission check for records
    if (currentUser?.role !== UserRole.ADMIN) {
      if (type === 'EXIT' || type === 'PPE') {
        if (targetRecord && targetRecord.delivererName !== currentUser?.fullName) {
          alert('شما فقط مجاز به حذف اسناد ثبت شده توسط خودتان هستید.');
          return;
        }
      }
    }

    handleSecurityCheck(() => {
        if (type === 'EXIT') setExits(prev => prev.filter(e => e.id !== id));
        if (type === 'PPE') setPpeRecords(prev => prev.filter(p => p.id !== id));
        if (type === 'PRODUCT') setProducts(prev => prev.filter(p => p.code !== id));
        if (type === 'RECIPIENT') setRecipients(prev => prev.filter(r => r.fullName !== id));
        sendTelegramMessage(formatDeleteRequestMessage(type, id, op, targetRecord), true);
    }, `تایید نهایی حذف ${type === 'EXIT' || type === 'PPE' ? 'سند' : 'داده'}: ${id}`);
  };

  const requestEdit = (record: ExitRecord) => {
    if (currentUser?.role !== UserRole.ADMIN) {
      if (record.delivererName !== currentUser?.fullName) {
        alert('شما فقط مجاز به ویرایش اسناد ثبت شده توسط خودتان هستید.');
        return;
      }
    }
    setEditingRecord(record);
  };

  if (!currentUser) return <AuthScreen users={users} onLogin={u => { setCurrentUser(u); sendTelegramMessage(formatWelcomeMessage(u), true); }} />;

  return (
    <div className="min-h-screen text-white pb-10">
      <nav className="glass-panel sticky top-0 z-50 px-8 py-2.5 flex flex-col md:flex-row justify-between items-center mb-6 no-print border-b border-white/10 shadow-[0_0_50px_rgba(99,102,241,0.15)]">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-cyan-500 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative w-12 h-12 bg-black rounded-2xl flex items-center justify-center border border-white/20 shadow-inner"><Cpu size={28} className="text-indigo-400"/></div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black ultra-glow-text tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-cyan-100 uppercase">P21 WAREHOUSE</h1>
            <div className="flex items-center gap-2 text-[9px] opacity-70 font-black tracking-widest text-cyan-400"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div><span>DIAMOND SMART ENGINE V4</span></div>
          </div>
        </div>

        <div className="flex items-center gap-1 py-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'dashboard', label: 'میز کار', icon: LayoutDashboard },
            { id: 'exit', label: 'خروج کالا', icon: PackagePlus },
            { id: 'ppe', label: 'ایمنی', icon: HardHat },
            { id: 'unregistered', label: 'خروج کالاهای ثبت نشده', icon: AlertCircle },
            { id: 'warehouse', label: 'انبار کالا', icon: Box },
            { id: 'personnel', label: 'پرسنل', icon: Users },
            { id: 'loans', label: 'امانات', icon: RotateCcw },
            { id: 'waybills', label: 'بارنامه‌ها', icon: Truck },
            { id: 'log', label: 'دفتر کل', icon: BookOpen },
            { id: 'reports', label: 'گزارش‌گیری اکسل', icon: BarChart3 },
            { id: 'system', label: 'سیستم', icon: Settings }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-black text-[10px] whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600/90 shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-105 neon-active-indigo text-white border-t border-white/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
              <tab.icon size={13}/>{tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
            <div className="rotating-border-box">
                <div className="border-glow-ring"></div>
                <div className="inner-content shadow-2xl">
                    <div className="flex flex-col items-start border-l border-white/10 pl-5">
                        <div className="flex items-center gap-3">
                           <span className="text-[14px] font-black text-white ultra-glow-text leading-none tracking-tight">{currentUser.fullName}</span>
                           <div className="bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                             <span className="text-[9px] text-indigo-400 font-mono font-bold tracking-tighter">@{currentUser.username}</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${currentUser.role === UserRole.ADMIN ? 'bg-cyan-500' : 'bg-emerald-500'} animate-pulse shadow-[0_0_5px_currentColor]`}></div>
                          <span className="text-[9px] text-white/40 font-black uppercase tracking-[0.15em]">{currentUser.role === 'ADMIN' ? 'ادمین و سازنده پلتفرم' : 'اپراتور ارشد سیستم'}</span>
                        </div>
                    </div>
                </div>
            </div>
            <button onClick={() => setAiAssistantOpen(true)} className="p-3 bg-indigo-600/10 rounded-2xl text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition-all shadow-lg"><Zap size={18}/></button>
            <button onClick={handleLogout} className="p-3 bg-red-600/10 rounded-2xl text-red-500 hover:bg-red-600 hover:text-white transition-all border border-red-500/20 shadow-lg"><LogOut size={18}/></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6">
        {activeTab === 'dashboard' && <DashboardView exits={[...exits, ...ppeRecords]} />}
        {activeTab === 'exit' && (
          <GeneralExitForm 
            products={products} 
            generalHistory={exits} 
            recipients={recipients} 
            currentUser={currentUser} 
            onSave={async (rec:any) => { 
              const res = await sendTelegramMessage(formatExitMessage(rec), false); 
              setExits([{ ...rec, telegramMsgId: res?.result?.message_id }, ...exits]); 
              setTempSignature('');
              setTempPhoto(null);
            }} 
            onRecordClick={setSelectedRecord}
            onEdit={requestEdit}
            onDelete={(id, type) => requestDelete(type, id)}
            onSignOpen={() => setSignOpen(true)}
            onCamOpen={() => setCamOpen(true)}
            signature={tempSignature}
            photo={tempPhoto}
          />
        )}
        {activeTab === 'ppe' && (
          <SafetyIssuanceForm 
            recipients={recipients} 
            currentUser={currentUser} 
            history={ppeRecords} 
            onRecordClick={setSelectedRecord} 
            onEdit={requestEdit}
            onDelete={(id, type) => requestDelete(type, id)}
            onSave={async (rec:any) => { 
              await sendTelegramMessage(formatPpeMessage(rec), true); 
              setPpeRecords([rec, ...ppeRecords]); 
              setTempSignature('');
              setTempPhoto(null);
            }}
            onSignOpen={() => setSignOpen(true)}
            onCamOpen={() => setCamOpen(true)}
            signature={tempSignature}
            photo={tempPhoto}
          />
        )}
        {activeTab === 'unregistered' && (
          <UnregisteredExitsView 
            exits={exits}
            products={products}
            onAssignCode={(recordId, itemIndex, newCode) => {
              const product = products.find(p => p.code === newCode);
              const updateRecord = (prev: ExitRecord[]) => prev.map(rec => {
                if (rec.id === recordId) {
                  const newItems = [...rec.items];
                  newItems[itemIndex] = { 
                    ...newItems[itemIndex], 
                    productCode: newCode,
                    productDescription: product ? product.description : newItems[itemIndex].productDescription,
                    category: product ? product.category : newItems[itemIndex].category
                  };
                  return { ...rec, items: newItems };
                }
                return rec;
              });
              setExits(updateRecord);
              alert('کد کالا با موفقیت تخصیص یافت و از لیست ثبت نشده‌ها خارج شد.');
            }}
          />
        )}
        {activeTab === 'warehouse' && (
          <WarehouseManager 
            products={products} 
            onAdd={(p:any)=>{
              setProducts([...products, p]);
              sendTelegramMessage(formatProductActionMessage('ADD', p, currentUser.fullName), false);
            }} 
            onUpdate={(p:any)=>handleSecurityCheck(() => {
              setProducts(products.map(x=>x.code===p.code?p:x));
              sendTelegramMessage(formatProductActionMessage('UPDATE', p, currentUser.fullName), false);
            }, `ویرایش کالای: ${p.description}`)} 
            onDelete={(id:any)=>requestDelete('PRODUCT', id)} 
            isAdmin={currentUser.role === UserRole.ADMIN} 
          />
        )}
        {activeTab === 'personnel' && (
          <PersonnelManager 
            recipients={recipients} 
            onAdd={(r:any)=>{
              setRecipients([...recipients, r]);
              sendTelegramMessage(formatPersonnelActionMessage('ADD', r, currentUser.fullName), false);
            }} 
            onUpdate={(r:any)=>handleSecurityCheck(() => {
              setRecipients(recipients.map(x=>x.fullName===r.fullName?r:x));
              sendTelegramMessage(formatPersonnelActionMessage('UPDATE', r, currentUser.fullName), false);
            }, `ویرایش اطلاعات پرسنل: ${r.fullName}`)}
            onDelete={(id:any)=>requestDelete('RECIPIENT', id)} 
            isAdmin={currentUser.role === UserRole.ADMIN} 
          />
        )}
        {activeTab === 'loans' && (
          <LoanManager 
            exits={[...exits, ...ppeRecords]} 
            onRecordClick={setSelectedRecord} 
            onReturn={(rid:any, idx:any, condition: string, rating: number)=>{
              const list = exits.some(e=>e.id===rid) ? exits : ppeRecords;
              const setter = exits.some(e=>e.id===rid) ? setExits : setPpeRecords;
              const rec = list.find(r=>r.id===rid);
              if(rec){
                  const updatedItems = rec.items.filter((_, i) => i !== idx);
                  if (updatedItems.length === 0) {
                    setter(prev => prev.filter(r => r.id !== rid));
                  } else {
                    setter(prev => prev.map(r => r.id === rid ? { ...rec, items: updatedItems } : r));
                  }
                  sendTelegramMessage(formatReturnLoanMessage(rec.recipientName, rec.items[idx].productDescription, rec.docNumber, currentUser.fullName, condition), false);
              }
            }} 
          />
        )}
        {activeTab === 'waybills' && (
          <WaybillManager 
            waybills={waybills} 
            currentUser={currentUser}
            onSave={(wb) => {
              if (waybills.some(w => w.id === wb.id)) {
                setWaybills(waybills.map(w => w.id === wb.id ? wb : w));
              } else {
                setWaybills([wb, ...waybills]);
              }
            }} 
            onDelete={(id) => setWaybills(waybills.filter(w => w.id !== id))} 
          />
        )}
        {activeTab === 'log' && (
          <GlobalLogView 
            exits={[...exits, ...ppeRecords]} 
            isAdmin={currentUser.role === UserRole.ADMIN} 
            onRowClick={setSelectedRecord} 
            onEdit={setEditingRecord}
            onDelete={(id, type) => requestDelete(type, id)}
          />
        )}
        {activeTab === 'reports' && (
          <ReportingView 
            exits={[...exits, ...ppeRecords]} 
            products={products} 
            onRowClick={setSelectedRecord} 
          />
        )}
        {activeTab === 'system' && (
          <SystemSettings 
            currentUser={currentUser} 
            users={users} 
            onUpdateUser={(u:any)=>{ 
              setUsers(users.map(x=>x.id===u.id?u:x)); 
              if(u.id===currentUser.id) setCurrentUser(u); 
              sendTelegramMessage(formatUserActionMessage('UPDATE', u, currentUser.fullName), false);
            }} 
            onAddUser={(u:any)=>{
              setUsers([...users, u]);
              sendTelegramMessage(formatUserActionMessage('ADD', u, currentUser.fullName), false);
            }} 
            onDeleteUser={(id:any)=>handleSecurityCheck(() => {
              const u = users.find(x=>x.id===id);
              setUsers(users.filter(x=>x.id!==id));
              if(u) sendTelegramMessage(formatUserActionMessage('DELETE', u, currentUser.fullName), false);
            }, `حذف دسترسی کاربر: ${users.find(x=>x.id===id)?.fullName}`)} 
            db={{ products, exits, recipients, ppeRecords, users, waybills }} 
            onRestore={(d:any) => { 
              setProducts(d.products || []); 
              setExits(d.exits || []); 
              setRecipients(d.recipients || []); 
              setPpeRecords(d.ppeRecords || d.ppe || []); 
              setWaybills(d.waybills || []);
              if(d.users) setUsers(d.users); 
              sendTelegramMessage(formatRestoreMessage(currentUser.fullName), false);
            }} 
            isAdmin={currentUser.role === UserRole.ADMIN} 
          />
        )}
      </main>

      {selectedRecord && <RecordOverlay record={selectedRecord} onClose={() => setSelectedRecord(null)} />}
      {editingRecord && <EditOverlay record={editingRecord} onClose={() => setEditingRecord(null)} onSave={(rec:any)=>{ 
        const setter = rec.type === 'EXIT' ? setExits : setPpeRecords;
        setter(prev => prev.map(r => r.id === rec.id ? rec : r));
        sendTelegramMessage(formatEditRecordMessage(rec, currentUser.fullName), false);
        setEditingRecord(null);
      }} />}
      {securityContext && <ModificationAuthModal onClose={() => setSecurityContext(null)} onSuccess={() => { securityContext.action(); setSecurityContext(null); }} onFail={() => { setSecurityContext(null); handleLogout(); }} correctPass={currentUser.modPassword || ''} description={securityContext.description} />}
      {aiAssistantOpen && <AIAssistantOverlay onClose={() => setAiAssistantOpen(false)} products={products} exits={[...exits, ...ppeRecords]} recipients={recipients} />}
      <SignatureModal isOpen={isSignOpen} onClose={(sig: string | null) => { if(sig) setTempSignature(sig); setSignOpen(false); }} name="پرسنل" />
      <CameraModal isOpen={isCamOpen} onClose={(photo: string | null) => { if(photo) setTempPhoto(photo); setCamOpen(false); }} />
    </div>
  );
}
