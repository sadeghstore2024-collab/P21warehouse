/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Truck, Camera, Upload, FileText, Download, Trash2, Loader2, Sparkles, Maximize2, Minimize2, X, Calendar, Search, Edit3 } from 'lucide-react';
import { Waybill, WaybillItem, User } from '../types';
import * as XLSX from 'xlsx';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

interface WaybillManagerProps {
  waybills: Waybill[];
  currentUser: User;
  onSave: (waybill: Waybill) => void;
  onDelete: (id: string) => void;
}

export const WaybillManager: React.FC<WaybillManagerProps> = ({ waybills, currentUser, onSave, onDelete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [extractedItems, setExtractedItems] = useState<WaybillItem[]>([]);
  const [docNumber, setDocNumber] = useState('');
  const [sender, setSender] = useState('');
  const [receiver, setReceiver] = useState('');
  const [machineHead, setMachineHead] = useState('');
  const [seniorInCharge, setSeniorInCharge] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('fa-IR'));
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [historySearch, setHistorySearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processWithAI = async () => {
    if (!image) return;
    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Data = image.split(',')[1];
      
      const prompt = `JSON only: {"docNumber":"","sender":"","receiver":"","date":"YYYY/MM/DD","items":[{"description":"","quantity":"","unit":""}]}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: prompt },
              { inlineData: { mimeType: "image/jpeg", data: base64Data } }
            ]
          }
        ],
        config: { 
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          temperature: 0.1
        }
      });

      const result = JSON.parse(response.text || '{}');
      if (result.items) setExtractedItems(result.items);
      if (result.docNumber) setDocNumber(result.docNumber);
      if (result.sender) setSender(result.sender);
      if (result.receiver) setReceiver(result.receiver);
      if (result.date) setDate(result.date);
      
    } catch (error) {
      console.error('AI Processing Error:', error);
      alert('خطا در پردازش تصویر توسط هوش مصنوعی');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    if (!docNumber || extractedItems.length === 0) {
      alert('لطفاً شماره بارنامه و حداقل یک قلم کالا را وارد کنید.');
      return;
    }
    const newWaybill: Waybill = {
      id: editingId || Date.now().toString(),
      docNumber,
      sender,
      receiver,
      machineHead,
      seniorInCharge,
      registrar: currentUser.fullName,
      items: extractedItems,
      date,
      timestamp: editingId ? (waybills.find(w => w.id === editingId)?.timestamp || Date.now()) : Date.now(),
      image: image || undefined
    };
    onSave(newWaybill);
    // Reset form
    setImage(null);
    setExtractedItems([]);
    setDocNumber('');
    setSender('');
    setReceiver('');
    setMachineHead('');
    setSeniorInCharge('');
    setEditingId(null);
    alert(editingId ? 'تغییرات با موفقیت ذخیره شد.' : 'بارنامه با موفقیت ثبت شد.');
  };

  const handleEdit = (wb: Waybill) => {
    setEditingId(wb.id);
    setDocNumber(wb.docNumber);
    setSender(wb.sender);
    setReceiver(wb.receiver);
    setMachineHead(wb.machineHead || '');
    setSeniorInCharge(wb.seniorInCharge || '');
    setDate(wb.date);
    setExtractedItems(wb.items);
    setImage(wb.image || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const exportFilteredToExcel = () => {
    const data = filteredWaybills.flatMap(wb => 
      wb.items.map(it => ({
        'شماره بارنامه': wb.docNumber,
        'تاریخ': wb.date,
        'فرستنده': wb.sender,
        'گیرنده': wb.receiver,
        'رئیس دستگاه': wb.machineHead || '-',
        'ارشد مربوطه': wb.seniorInCharge || '-',
        'ثبت‌کننده': wb.registrar,
        'شرح کالا': it.description,
        'مقدار': it.quantity,
        'واحد': it.unit
      }))
    );
    const ws = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws, "Filtered Waybills");
    XLSX.writeFile(workbook, `Waybills_Report_${new Date().toLocaleDateString('fa-IR')}.xlsx`);
  };

  const toEnglishDigits = (str: string) => {
    return str.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());
  };

  const filteredWaybills = waybills
    .sort((a, b) => b.timestamp - a.timestamp)
    .filter(wb => {
      const searchLower = toEnglishDigits(historySearch.toLowerCase());
      const matchesSearch = !historySearch || 
                           toEnglishDigits(wb.docNumber.toLowerCase()).includes(searchLower) || 
                           toEnglishDigits(wb.sender.toLowerCase()).includes(searchLower) || 
                           toEnglishDigits(wb.receiver.toLowerCase()).includes(searchLower) ||
                           toEnglishDigits(wb.date).includes(searchLower);
      
      let matchesDate = true;
      if (startDate || endDate) {
        const wbTime = wb.timestamp;
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (start) {
          start.setHours(0, 0, 0, 0);
          matchesDate = matchesDate && wbTime >= start.getTime();
        }
        if (end) {
          end.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && wbTime <= end.getTime();
        }
      }
      
      return matchesSearch && matchesDate;
    });

  return (
    <div className="space-y-6 animate-enter">
      {fullScreenImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-enter">
          <button 
            onClick={() => setFullScreenImage(null)}
            className="absolute top-8 right-8 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
          >
            <Minimize2 size={32} />
          </button>
          <img src={fullScreenImage} alt="Full Screen Waybill" className="max-w-full max-h-full object-contain shadow-2xl" />
        </div>
      )}

      <div className="diamond-neon p-8 rounded-[3rem] bg-indigo-900/10 border-indigo-500/20 shadow-2xl space-y-8">
        <div className="flex justify-between items-center border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 shadow-inner">
              <Truck size={28}/>
            </div>
            <div>
              <h3 className="text-2xl font-black ultra-glow-text uppercase tracking-tighter">
                {editingId ? 'ویرایش بارنامه' : 'مدیریت هوشمند بارنامه‌ها'}
              </h3>
              <p className="text-[10px] opacity-40 font-black uppercase tracking-widest">
                {editingId ? `در حال ویرایش سند شماره ${docNumber}` : 'ثبت، استخراج متن با هوش مصنوعی و آرشیو بارنامه‌های ورودی'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`aspect-video rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${image ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/10 hover:border-indigo-500/50 bg-white/5'}`}
            >
              {image ? (
                <div className="relative w-full h-full group">
                  <img src={image} alt="Waybill" className="w-full h-full object-contain bg-black/20 transition-all" />
                  <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/40 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setFullScreenImage(image); }}
                      className="p-3 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all"
                    >
                      <Maximize2 size={20} />
                    </button>
                    <p className="text-white font-black text-xs uppercase tracking-widest">تغییر تصویر</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload size={48} className="text-indigo-400 mb-4 animate-bounce" />
                  <p className="text-sm font-black opacity-60">تصویر بارنامه را اینجا آپلود کنید</p>
                  <p className="text-[10px] opacity-30 mt-2 uppercase tracking-widest">JPG, PNG (Max 5MB)</p>
                </>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            </div>

            {image && (
              <button 
                onClick={processWithAI}
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 font-black text-sm shadow-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={20}/> : <Sparkles size={20}/>}
                {isProcessing ? 'در حال پردازش هوشمند...' : 'استخراج اطلاعات'}
              </button>
            )}
          </div>

          {/* Form Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] opacity-40 font-black uppercase pr-2">شماره بارنامه</label>
                <input value={docNumber} onChange={e=>setDocNumber(e.target.value)} className="w-full input-glass p-4 rounded-2xl font-black shadow-inner" placeholder="مثلاً 12345/الف" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] opacity-40 font-black uppercase pr-2">تاریخ</label>
                <input value={date} onChange={e=>setDate(e.target.value)} className="w-full input-glass p-4 rounded-2xl font-black shadow-inner text-center" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] opacity-40 font-black uppercase pr-2">رئیس دستگاه</label>
                <input value={machineHead} onChange={e=>setMachineHead(e.target.value)} className="w-full input-glass p-4 rounded-2xl font-black shadow-inner" placeholder="نام رئیس دستگاه" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] opacity-40 font-black uppercase pr-2">ارشد مربوطه</label>
                <input value={seniorInCharge} onChange={e=>setSeniorInCharge(e.target.value)} className="w-full input-glass p-4 rounded-2xl font-black shadow-inner" placeholder="نام ارشد مربوطه" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] opacity-40 font-black uppercase pr-2">فرستنده</label>
                <input value={sender} onChange={e=>setSender(e.target.value)} className="w-full input-glass p-4 rounded-2xl font-black shadow-inner" placeholder="نام شرکت یا شخص" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] opacity-40 font-black uppercase pr-2">گیرنده</label>
                <input value={receiver} onChange={e=>setReceiver(e.target.value)} className="w-full input-glass p-4 rounded-2xl font-black shadow-inner" placeholder="نام شرکت یا شخص" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] opacity-40 font-black uppercase pr-2">ثبت‌کننده</label>
              <input value={currentUser.fullName} readOnly className="w-full input-glass p-4 rounded-2xl font-black opacity-60 shadow-inner bg-white/5" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] opacity-40 font-black uppercase pr-2 flex justify-between items-center">
                <span>اقلام استخراج شده</span>
                <span className="text-indigo-400">{extractedItems.length} قلم</span>
              </label>
              <div className="bg-black/40 rounded-2xl border border-white/5 min-h-[150px] max-h-[250px] overflow-y-auto p-4 space-y-2 no-scrollbar">
                {extractedItems.map((it, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-white/5 p-3 rounded-xl border border-white/5 group">
                    <input 
                      value={it.description} 
                      onChange={e => {
                        const newItems = [...extractedItems];
                        newItems[idx].description = e.target.value;
                        setExtractedItems(newItems);
                      }}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-xs font-bold" 
                    />
                    <input 
                      value={it.quantity} 
                      onChange={e => {
                        const newItems = [...extractedItems];
                        newItems[idx].quantity = e.target.value;
                        setExtractedItems(newItems);
                      }}
                      className="w-16 bg-transparent border-none focus:ring-0 text-xs font-black text-cyan-400 text-center" 
                    />
                    <input 
                      value={it.unit} 
                      onChange={e => {
                        const newItems = [...extractedItems];
                        newItems[idx].unit = e.target.value;
                        setExtractedItems(newItems);
                      }}
                      className="w-16 bg-transparent border-none focus:ring-0 text-xs opacity-60 text-center" 
                    />
                    <button onClick={() => setExtractedItems(extractedItems.filter((_, i) => i !== idx))} className="text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                ))}
                {extractedItems.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                    <FileText size={32} className="mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">لیست اقلام خالی است</p>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setExtractedItems([...extractedItems, { description: 'کالای جدید', quantity: '1', unit: 'عدد' }])}
                className="w-full py-2 rounded-xl border border-dashed border-white/20 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
              >
                + افزودن دستی ردیف
              </button>
            </div>

            <button 
              onClick={handleSave}
              className={`w-full py-4 rounded-2xl font-black text-sm shadow-2xl transition-all active:scale-95 border-t border-white/20 ${editingId ? 'bg-orange-600 hover:bg-orange-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}
            >
              {editingId ? 'ذخیره تغییرات بارنامه' : 'تایید و ثبت نهایی بارنامه در سیستم'}
            </button>
            {editingId && (
              <button 
                onClick={() => {
                  setEditingId(null);
                  setImage(null);
                  setExtractedItems([]);
                  setDocNumber('');
                  setSender('');
                  setReceiver('');
                  setMachineHead('');
                  setSeniorInCharge('');
                }}
                className="w-full py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all mt-2"
              >
                انصراف از ویرایش
              </button>
            )}
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="diamond-neon rounded-[2.5rem] bg-black/40 border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400">تاریخچه بارنامه‌های ثبت شده</h4>
            <div className="flex gap-2">
              <button 
                onClick={exportFilteredToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-all text-[10px] font-black uppercase"
              >
                <Download size={14} /> خروجی اکسل فیلتر شده
              </button>
              <span className="text-[10px] opacity-40 font-black flex items-center">{filteredWaybills.length} مورد یافت شد</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
              <input 
                placeholder="جستجو در تاریخچه..." 
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                className="w-full input-glass p-3 pr-10 rounded-xl text-[10px] font-bold"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 z-10" size={14} />
              <DatePicker
                value={startDate}
                onChange={(date: any) => setStartDate(date ? date.toDate() : null)}
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
                inputClass="w-full input-glass p-3 pr-10 rounded-xl text-[10px] font-bold"
                containerClassName="w-full"
                portal
              />
              <span className="absolute -top-2 right-4 bg-black px-2 text-[8px] text-indigo-400 font-black uppercase z-10">از تاریخ</span>
            </div>
            <div className="relative">
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 z-10" size={14} />
              <DatePicker
                value={endDate}
                onChange={(date: any) => setEndDate(date ? date.toDate() : null)}
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
                inputClass="w-full input-glass p-3 pr-10 rounded-xl text-[10px] font-bold"
                containerClassName="w-full"
                portal
              />
              <span className="absolute -top-2 right-4 bg-black px-2 text-[8px] text-indigo-400 font-black uppercase z-10">تا تاریخ</span>
            </div>
            <div className="flex items-end">
              <button 
                onClick={() => {
                  setHistorySearch('');
                  setStartDate(null);
                  setEndDate(null);
                }}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <X size={14} /> پاکسازی فیلتر
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-indigo-400 border-b border-white/5">
                <th className="p-5">شماره بارنامه</th>
                <th className="p-5">تاریخ</th>
                <th className="p-5">فرستنده / گیرنده</th>
                <th className="p-5">مسئولین / ثبت‌کننده</th>
                <th className="p-5">تعداد اقلام</th>
                <th className="p-5">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredWaybills.map(wb => (
                <tr key={wb.id} className="hover:bg-white/5 transition-all group">
                  <td className="p-5 font-mono text-xs font-black text-indigo-300">#{wb.docNumber}</td>
                  <td className="p-5 text-[11px] opacity-60">{wb.date}</td>
                  <td className="p-5">
                    <div className="text-xs font-bold">{wb.sender}</div>
                    <div className="text-[10px] opacity-40">به: {wb.receiver}</div>
                  </td>
                  <td className="p-5">
                    <div className="text-[10px] font-bold text-indigo-200">رئیس: {wb.machineHead || '-'} | ارشد: {wb.seniorInCharge || '-'}</div>
                    <div className="text-[10px] opacity-40">ثبت: {wb.registrar}</div>
                  </td>
                  <td className="p-5">
                    <span className="bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-full text-[10px] font-black border border-indigo-500/20">
                      {wb.items.length} قلم
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(wb)} className="p-2 bg-orange-500/10 text-orange-400 rounded-lg border border-orange-500/20 hover:bg-orange-500 hover:text-white transition-all">
                        <Edit3 size={16}/>
                      </button>
                      {wb.image && (
                        <button onClick={() => setFullScreenImage(wb.image!)} className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all">
                          <Maximize2 size={16}/>
                        </button>
                      )}
                      <button onClick={() => onDelete(wb.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredWaybills.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-20 text-center opacity-20 font-black uppercase tracking-[0.5em]">موردی یافت نشد</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
