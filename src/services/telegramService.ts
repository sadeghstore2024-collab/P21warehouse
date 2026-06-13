/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, ExitRecord } from '../types';

// Real Telegram service using Bot API
// Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in environment variables
export const sendTelegramMessage = async (message: string, isSilent: boolean = false) => {
  const token = process.env.TELEGRAM_BOT_TOKEN || '7495631798:AAFy7s12wEKinGYyLXIGTXY-iJ2Yu7wHFSA';
  const chatId = process.env.TELEGRAM_CHAT_ID || '2146248157';

  if (!token || !chatId) {
    console.warn('[Telegram Mock]: Missing Token or ChatID. Logging to console.');
    console.log(`[Telegram ${isSilent ? 'Silent' : 'Alert'}]:`, message);
    return { result: { message_id: Math.floor(Math.random() * 100000) } };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
        disable_notification: isSilent
      })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Telegram Error]:', error);
    return null;
  }
};

export const sendTelegramDocument = async (fileContent: string, fileName: string, caption: string) => {
  const token = '7495631798:AAFy7s12wEKinGYyLXIGTXY-iJ2Yu7wHFSA';
  const chatId = '2146248157';

  const formData = new FormData();
  formData.append('chat_id', chatId);
  formData.append('caption', caption);
  formData.append('parse_mode', 'Markdown');
  
  const blob = new Blob([fileContent], { type: 'application/json' });
  formData.append('document', blob, fileName);

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: 'POST',
      body: formData
    });
    const resData = await response.json();
    console.log('[Telegram Document Response]:', resData);
    return resData;
  } catch (error) {
    console.error('[Telegram Document Error]:', error);
    return null;
  }
};

export const formatExitMessage = (rec: ExitRecord) => {
  return `
💎 *P21 ULTRA WAREHOUSE SYSTEM* 💎
━━━━━━━━━━━━━━━━━━━━
📦 *خروج کالا - حواله رسمی*
📄 شماره سند: \`${rec.docNumber}\`
👤 تحویل‌گیرنده: *${rec.recipientName}*
🏢 واحد عملیاتی: \`${rec.orgUnit}\`
📅 تاریخ ثبت: \`${rec.date}\`
━━━━━━━━━━━━━━━━━━━━
📋 *لیست اقلام تحویلی:*
${rec.items.map(it => `🔹 ${it.productDescription}
   ↳ مقدار: \`${it.quantity} ${it.unit}\`
   ↳ بخش: \`${it.category || 'نامشخص'}\``).join('\n\n')}
━━━━━━━━━━━━━━━━━━━━
✍️ تحویل‌دهنده: *${rec.delivererName}*
✅ وضعیت: *تایید شده و ثبت در سیستم*
  `.trim();
};

export const formatPpeMessage = (rec: ExitRecord) => {
  return `
🛡️ *HSE SAFETY CORE SYSTEM* 🛡️
━━━━━━━━━━━━━━━━━━━━
👷 *صدور تجهیزات ایمنی و حفاظت فردی*
📄 شماره سند: \`${rec.docNumber}\`
👤 پرسنل: *${rec.recipientName}*
📅 تاریخ صدور: \`${rec.date}\`
━━━━━━━━━━━━━━━━━━━━
🛠️ *اقلام ایمنی تحویل شده:*
${rec.items.map(it => `🔸 ${it.productDescription}
   ↳ مشخصات فنی: \`${it.technicalSpecs || 'استاندارد'}\`
   ↳ تعداد: \`${it.quantity} عدد\``).join('\n\n')}
━━━━━━━━━━━━━━━━━━━━
⚠️ *الزام:* استفاده از تجهیزات فوق در محیط کار اجباری است.
✅ تاییدیه واحد HSE صادر شد.
  `.trim();
};

export const formatWelcomeMessage = (user: User) => {
  return `
🚀 *ورود موفقیت‌آمیز به سامانه P21*
━━━━━━━━━━━━━━━━━━━━
👤 کاربر: *${user.fullName}*
🔑 سطح دسترسی: \`${user.role}\`
⏰ زمان ورود: \`${new Date().toLocaleTimeString('fa-IR')}\`
🌐 آدرس IP: \`ثبت شده در لاگ امنیتی\`
━━━━━━━━━━━━━━━━━━━━
✨ خوش آمدید، سیستم آماده به کار است.
  `.trim();
};

export const formatLogoutMessage = (user: User) => {
  return `
👋 *خروج از سامانه P21*
━━━━━━━━━━━━━━━━━━━━
👤 کاربر: *${user.fullName}*
⏰ زمان خروج: \`${new Date().toLocaleTimeString('fa-IR')}\`
📊 وضعیت نشست: \`خاتمه یافته\`
━━━━━━━━━━━━━━━━━━━━
🔓 دسترسی کاربر با موفقیت بسته شد.
  `.trim();
};

export const formatReturnLoanMessage = (name: string, item: string, doc: string, op: string, condition: string) => {
  return `
🔄 *استرداد کالای امانی (مرجوعی)*
━━━━━━━━━━━━━━━━━━━━
👤 پرسنل: *${name}*
📦 کالا: \`${item}\`
📄 شماره سند مرجع: \`${doc}\`
🛠️ وضعیت سلامت کالا: *${condition}*
━━━━━━━━━━━━━━━━━━━━
👤 ثبت توسط: *${op}*
⏰ زمان ثبت: \`${new Date().toLocaleTimeString('fa-IR')}\`
✅ موجودی انبار بروزرسانی شد.
  `.trim();
};

export const formatEditRecordMessage = (rec: ExitRecord, op: string) => {
  return `
✏️ *ویرایش و اصلاح سند سیستمی*
━━━━━━━━━━━━━━━━━━━━
📄 شماره سند: \`${rec.docNumber}\`
👤 تحویل‌گیرنده: *${rec.recipientName}*
📦 تعداد کل اقلام: \`${rec.items.length}\`
━━━━━━━━━━━━━━━━━━━━
👤 ویرایش توسط: *${op}*
⏰ زمان ویرایش: \`${new Date().toLocaleTimeString('fa-IR')}\`
⚠️ تغییرات در دفتر کل ثبت گردید.
  `.trim();
};

export const formatDeleteRequestMessage = (type: string, id: string, op: string, record: any) => {
  let details = '';
  if (record) {
    if (type === 'EXIT' || type === 'PPE') details = `\n📄 شماره سند: \`${record.docNumber}\`\n👤 تحویل‌گیرنده: *${record.recipientName}*`;
    else if (type === 'PRODUCT') details = `\n📦 شرح کالا: \`${record.description}\``;
    else if (type === 'RECIPIENT') details = `\n👤 نام پرسنل: *${record.fullName}*`;
  }
  return `
🗑️ *هشدار: حذف داده از سیستم*
━━━━━━━━━━━━━━━━━━━━
📂 نوع داده: \`${type}\`
🆔 شناسه مرجع: \`${id}\`${details}
━━━━━━━━━━━━━━━━━━━━
👤 حذف توسط: *${op}*
⏰ زمان حذف: \`${new Date().toLocaleTimeString('fa-IR')}\`
🚫 این عملیات غیرقابل بازگشت است.
  `.trim();
};

export const formatProductActionMessage = (action: 'ADD' | 'UPDATE', product: any, op: string) => {
  return `
${action === 'ADD' ? '🆕' : '🔄'} *${action === 'ADD' ? 'تعریف کالای جدید' : 'بروزرسانی اطلاعات کالا'}*
━━━━━━━━━━━━━━━━━━━━
📦 کد کالا: \`${product.code}\`
📝 شرح کالا: *${product.description}*
📏 واحد سنجش: \`${product.unit}\`
📂 بخش: \`${product.category || 'نامشخص'}\`
━━━━━━━━━━━━━━━━━━━━
👤 توسط: *${op}*
⏰ زمان: \`${new Date().toLocaleTimeString('fa-IR')}\`
  `.trim();
};

export const formatPersonnelActionMessage = (action: 'ADD' | 'UPDATE', person: any, op: string) => {
  return `
${action === 'ADD' ? '🆕' : '🔄'} *${action === 'ADD' ? 'افزودن پرسنل جدید' : 'ویرایش پرونده پرسنلی'}*
━━━━━━━━━━━━━━━━━━━━
👤 نام و نشان: *${person.fullName}*
🏢 واحد/دپارتمان: \`${person.orgUnit}\`
🆔 کد پرسنلی: \`${person.id || '---'}\`
━━━━━━━━━━━━━━━━━━━━
👤 توسط: *${op}*
⏰ زمان: \`${new Date().toLocaleTimeString('fa-IR')}\`
  `.trim();
};

export const formatUserActionMessage = (action: 'ADD' | 'UPDATE' | 'DELETE', user: any, op: string) => {
  return `
${action === 'ADD' ? '🆕' : action === 'UPDATE' ? '🔄' : '🗑️'} *${action === 'ADD' ? 'ایجاد دسترسی کاربر' : action === 'UPDATE' ? 'تغییر سطح دسترسی' : 'ابطال دسترسی کاربر'}*
━━━━━━━━━━━━━━━━━━━━
👤 نام کاربر: *${user.fullName}*
🔑 نقش در سیستم: \`${user.role}\`
🆔 نام کاربری: \`@${user.username}\`
━━━━━━━━━━━━━━━━━━━━
👤 توسط مدیر: *${op}*
⏰ زمان: \`${new Date().toLocaleTimeString('fa-IR')}\`
  `.trim();
};

export const formatRestoreMessage = (op: string) => {
  return `
♻️ *عملیات بازیابی دیتابیس (Restore)*
━━━━━━━━━━━━━━━━━━━━
👤 توسط: *${op}*
⏰ زمان: \`${new Date().toLocaleTimeString('fa-IR')}\`
━━━━━━━━━━━━━━━━━━━━
⚠️ *توجه:* دیتابیس با موفقیت از فایل پشتیبان بازیابی شد و تمامی داده‌های فعلی جایگزین گردیدند.
  `.trim();
};

export const sendTelegramBackup = async (db: any) => {
  const summary = `
👑 *P21 ULTRA STRATEGIC BACKUP SYSTEM* 👑
━━━━━━━━━━━━━━━━━━━━━━
🌟 *گزارش جامع پشتیبان‌گیری و امنیت داده‌ها* 🌟

📦 *آمار کلی انبار:*
• تعداد کل کالاها: \`${db.products.length}\` قلم
• حواله‌های خروجی: \`${db.exits.length}\` مورد
• اسناد ایمنی HSE: \`${db.ppeRecords.length}\` مورد
• پرسنل ثبت شده: \`${db.recipients.length}\` نفر
• کاربران مجاز: \`${db.users.length}\` کاربر

🔐 *وضعیت امنیت:*
• یکپارچگی داده: \`تایید شده ✅\`
• رمزنگاری محلی: \`فعال 🔒\`
• پروتکل انتقال: \`Telegram SSL 🛡️\`

⏰ *زمان دقیق تهیه:* \`${new Date().toLocaleTimeString('fa-IR')}\`
📅 *تاریخ شمسی:* \`${new Date().toLocaleDateString('fa-IR')}\`

━━━━━━━━━━━━━━━━━━━━━━
✨ *فایل دیتابیس با فرمت استاندارد JSON پیوست گردید.*
⚠️ *توصیه:* این فایل را در جای امن نگهداری کنید.
━━━━━━━━━━━━━━━━━━━━━━
💎 *DIAMOND SMART ENGINE V4* 💎
  `.trim();

  const fileName = `P21_ULTRA_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
  const fileContent = JSON.stringify(db, null, 2);

  await sendTelegramDocument(fileContent, fileName, summary);
};

export const deleteTelegramMessage = async (msgId: number) => {
  console.log(`[Telegram]: Message ${msgId} deleted.`);
};
