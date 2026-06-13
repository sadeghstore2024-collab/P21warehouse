/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { FileSpreadsheet, Filter, Download, Calendar, Search, Tag } from 'lucide-react';
import { ExitRecord, Product } from '../types';
import * as XLSX from 'xlsx';
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

interface ReportingViewProps {
  exits: ExitRecord[];
  products: Product[];
  onRowClick: (record: ExitRecord) => void;
}

export const ReportingView: React.FC<ReportingViewProps> = ({ exits, products, onRowClick }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => { if (p.category) cats.add(p.category); });
    exits.forEach(e => {
        e.items.forEach(it => { if (it.category) cats.add(it.category); });
    });
    return Array.from(cats);
  }, [products, exits]);

  const toEnglishDigits = (str: string) => {
    return str.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());
  };

  const filteredExits = useMemo(() => {
    return exits
      .sort((a, b) => b.timestamp - a.timestamp)
      .filter(e => {
      const searchLower = toEnglishDigits(searchTerm.toLowerCase());
      const matchesSearch = !searchTerm || 
                           toEnglishDigits(e.recipientName.toLowerCase()).includes(searchLower) || 
                           toEnglishDigits(e.docNumber.toLowerCase()).includes(searchLower) ||
                           toEnglishDigits(e.date).includes(searchLower) ||
                           e.items.some(it => 
                             toEnglishDigits(it.productDescription.toLowerCase()).includes(searchLower) ||
                             (it.productCode && toEnglishDigits(it.productCode.toLowerCase()).includes(searchLower))
                           );
      
      const matchesCategory = !selectedCategory || e.items.some(it => it.category === selectedCategory);
      const matchesType = !selectedType || e.type === selectedType;
      
      let recordDate: Date;
      if (e.timestamp) {
        recordDate = new Date(e.timestamp);
      } else {
        // Fallback for very old records: try to parse the date string
        // We replace Persian digits with English ones for better parsing if needed
        const englishDate = e.date.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
        recordDate = new Date(englishDate);
      }

      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 59, 999);
      
      const matchesDate = (!start || recordDate >= start) && (!end || recordDate <= end);
      
      return matchesSearch && matchesCategory && matchesType && matchesDate;
    });
  }, [exits, searchTerm, selectedCategory, selectedType, startDate, endDate]);

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedCategory('');
    setSelectedType('');
    setSearchTerm('');
  };

  const exportToExcel = () => {
    const data = filteredExits.flatMap(e => 
      e.items.map(it => ({
        'شماره سند': e.docNumber,
        'تاریخ': new Date(e.timestamp).toLocaleDateString('fa-IR-u-ca-persian'),
        'تحویل‌گیرنده': e.recipientName,
        'واحد': e.orgUnit,
        'کد کالا': it.productCode || 'بدون کد',
        'شرح کالا': it.productDescription,
        'بخش/دپارتمان': it.category || 'نامشخص',
        'تعداد': it.quantity,
        'واحد سنجش': it.unit,
        'نوع': e.type === 'EXIT' ? 'خروج کالا' : 'تجهیزات ایمنی',
        'وضعیت': it.isLoan ? (it.isReturned ? 'مرجوع شده' : 'امانی') : 'قطعی'
      }))
    );

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "گزارش خروجی");
    XLSX.writeFile(wb, `P21_Report_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-enter">
      <div className="diamond-neon p-8 rounded-[3rem] bg-indigo-900/10 border-indigo-500/20 shadow-2xl space-y-8 overflow-visible-important">
        <div className="flex justify-between items-center border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 shadow-inner">
              <FileSpreadsheet size={28}/>
            </div>
            <div>
              <h3 className="text-2xl font-black ultra-glow-text uppercase tracking-tighter">مرکز گزارش‌گیری و استخراج داده</h3>
              <p className="text-[10px] opacity-40 font-black uppercase tracking-widest">فیلتر هوشمند و خروجی اکسل از تمامی تراکنش‌های انبار</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={clearFilters}
              className="bg-white/5 px-6 py-4 rounded-2xl font-black text-xs flex items-center gap-3 shadow-xl hover:bg-white/10 transition-all active:scale-95 border border-white/10 uppercase tracking-widest text-white/60"
            >
              پاکسازی فیلترها
            </button>
            <button 
              onClick={exportToExcel}
              className="bg-emerald-600 px-8 py-4 rounded-2xl font-black text-xs flex items-center gap-3 shadow-2xl hover:bg-emerald-500 transition-all active:scale-95 border-t border-white/20 uppercase tracking-widest"
            >
              <Download size={18}/> استخراج فایل اکسل (Excel)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] opacity-40 font-black uppercase pr-2 flex items-center gap-2"><Search size={10}/> جستجوی سریع</label>
            <input 
              placeholder="نام پرسنل یا شماره سند..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full input-glass p-4 rounded-2xl shadow-inner text-sm font-bold"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] opacity-40 font-black uppercase pr-2 flex items-center gap-2"><Tag size={10}/> فیلتر بخش</label>
            <select 
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full input-glass p-4 rounded-2xl shadow-inner text-sm font-black"
            >
              <option value="">همه بخش‌ها</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] opacity-40 font-black uppercase pr-2 flex items-center gap-2"><Filter size={10}/> نوع سند</label>
            <select 
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full input-glass p-4 rounded-2xl shadow-inner text-sm font-black"
            >
              <option value="">همه اسناد</option>
              <option value="EXIT">خروج کالا</option>
              <option value="PPE">تجهیزات ایمنی</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] opacity-40 font-black uppercase pr-2 flex items-center gap-2"><Calendar size={10}/> از تاریخ</label>
            <DatePicker
              value={startDate}
              onChange={(date: DateObject) => setStartDate(date ? date.toDate() : null)}
              calendar={persian}
              locale={persian_fa}
              calendarPosition="bottom-right"
              portal
              inputClass="w-full input-glass p-4 rounded-2xl shadow-inner text-sm font-mono text-right"
              containerClassName="w-full"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] opacity-40 font-black uppercase pr-2 flex items-center gap-2"><Calendar size={10}/> تا تاریخ</label>
            <DatePicker
              value={endDate}
              onChange={(date: DateObject) => setEndDate(date ? date.toDate() : null)}
              calendar={persian}
              locale={persian_fa}
              calendarPosition="bottom-right"
              portal
              inputClass="w-full input-glass p-4 rounded-2xl shadow-inner text-sm font-mono text-right"
              containerClassName="w-full"
            />
          </div>
        </div>
      </div>

      <div className="diamond-neon rounded-[2.5rem] bg-black/40 border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-indigo-400 border-b border-white/5">
                <th className="p-5">شماره سند</th>
                <th className="p-5">تاریخ (شمسی)</th>
                <th className="p-5">تحویل‌گیرنده</th>
                <th className="p-5">کد کالا</th>
                <th className="p-5">اقلام</th>
                <th className="p-5">بخش</th>
                <th className="p-5">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredExits.map(e => (
                <tr 
                  key={e.id} 
                  onClick={() => onRowClick(e)}
                  className="hover:bg-white/5 transition-all cursor-pointer group"
                >
                  <td className="p-5 font-mono text-xs font-black text-indigo-300">#{e.docNumber}</td>
                  <td className="p-5 text-[11px] opacity-60">{new Date(e.timestamp).toLocaleDateString('fa-IR-u-ca-persian')}</td>
                  <td className="p-5 font-black text-sm">{e.recipientName}</td>
                  <td className="p-5">
                    <div className="flex flex-wrap gap-1">
                      {e.items.map((it, i) => (
                        <span key={i} className={`text-[9px] px-2 py-0.5 rounded-md border font-mono ${it.productCode === 'بدون کد' ? 'border-orange-500/30 text-orange-400 bg-orange-500/5' : 'border-white/5 bg-white/5'}`}>
                          {it.productCode || 'بدون کد'}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-wrap gap-1">
                      {e.items.map((it, i) => (
                        <span key={i} className="text-[9px] bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{it.productDescription}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-wrap gap-1">
                      {Array.from(new Set(e.items.map(it => it.category).filter(Boolean))).map((c, i) => (
                        <span key={i} className="text-[9px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-500/20 font-black">{c}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${e.type === 'EXIT' ? 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5' : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'}`}>
                      {e.type === 'EXIT' ? 'خروج کالا' : 'ایمنی'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredExits.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-20 text-center opacity-20 font-black uppercase tracking-[0.5em]">هیچ داده‌ای با این فیلتر یافت نشد</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
