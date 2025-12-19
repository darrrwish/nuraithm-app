
import React, { useState } from 'react';
import { Language } from '../src/types';

interface HeaderProps {
  lang: Language;
  setLang: (l: Language) => void;
  aiLang: Language;
  setAiLang: (l: Language) => void;
  darkMode: boolean;
  setDarkMode: (d: boolean) => void;
  onAlertsClick: () => void;
  unreadAlerts: number;
  signature: string;
  setSignature: (s: string) => void;
  onBackup: () => void;
  onImport: () => void;
  onAnalytics: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  lang, setLang, aiLang, setAiLang, darkMode, setDarkMode, onAlertsClick, unreadAlerts, 
  signature, setSignature, onBackup, onImport, onAnalytics 
}) => {
  const t = (ar: string, en: string) => lang === 'ar' ? ar : en;
  const [showSettings, setShowSettings] = useState(false);

  const handleOpenKey = async () => {
    if (typeof (window as any).aistudio?.openSelectKey === 'function') {
      await (window as any).aistudio.openSelectKey();
      setShowSettings(false);
    } else {
      alert(t('هذه الميزة متاحة فقط في بيئة الاستوديو المعتمدة', 'This feature is available in the authorized studio environment only.'));
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
           <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 transform transition-transform hover:rotate-6 border-2 border-accent-yellow/50">
             <span className="text-white text-3xl font-black font-inter">N</span>
           </div>
           <div>
             <h1 className="text-xl font-black text-primary dark:text-white tracking-tight leading-none">Nuraithm</h1>
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{t('الذكاء السريري المتقدم', 'ADVANCED CLINICAL INTELLIGENCE')}</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={onAlertsClick} className="relative w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-2xl group transition-all hover:bg-red-50 dark:hover:bg-red-950/20 shadow-sm border dark:border-slate-800">
            <span className={`material-symbols-outlined transition-colors ${unreadAlerts > 0 ? 'text-red-500 animate-pulse' : 'text-slate-600 dark:text-slate-400'}`}>notifications</span>
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-600 border-2 border-white dark:border-slate-900 text-[9px] font-black text-white items-center justify-center shadow-md">
                  {unreadAlerts}
                </span>
              </span>
            )}
          </button>

          <div className="relative">
            <button onClick={() => setShowSettings(!showSettings)} className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-all shadow-sm border dark:border-slate-800">
               <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">tune</span>
            </button>
            
            {showSettings && (
              <div className={`absolute top-14 ${lang === 'ar' ? 'left-0' : 'right-0'} w-72 bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 z-50 animate-in fade-in slide-in-from-top-4 duration-200`}>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{t('توقيعي المعتمد', 'MY SIGNATURE')}</label>
                    <input value={signature} onChange={e => setSignature(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 ring-primary/20" />
                  </div>

                  <button onClick={handleOpenKey} className="w-full py-3 bg-primary text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-2 hover:bg-primary/90 transition-all">
                    <span className="material-symbols-outlined text-lg">key</span>
                    {t('تفعيل مفتاح API مدفوع', 'ACTIVATE PAID API KEY')}
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => { onBackup(); setShowSettings(false); }} className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black flex flex-col items-center gap-1 hover:bg-blue-100 transition-colors">
                      <span className="material-symbols-outlined text-xl">backup</span>
                      BACKUP
                    </button>
                    <button onClick={() => { onImport(); setShowSettings(false); }} className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-black flex flex-col items-center gap-1 hover:bg-emerald-100 transition-colors">
                      <span className="material-symbols-outlined text-xl">publish</span>
                      IMPORT
                    </button>
                  </div>

                  <div className="pt-2 border-t dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
                      <span className="text-[10px] font-black text-slate-500 uppercase">{t('لغة الواجهة', 'UI LANG')}</span>
                      <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="px-3 py-1 bg-white dark:bg-slate-700 rounded-lg text-[10px] font-black shadow-sm">
                        {lang === 'ar' ? 'English' : 'العربية'}
                      </button>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
                      <span className="text-[10px] font-black text-slate-500 uppercase">{t('لغة الذكاء', 'AI LANG')}</span>
                      <button onClick={() => setAiLang(aiLang === 'ar' ? 'en' : 'ar')} className="px-3 py-1 bg-white dark:bg-slate-700 rounded-lg text-[10px] font-black shadow-sm">
                        {aiLang === 'ar' ? 'English' : 'العربية'}
                      </button>
                    </div>
                  </div>

                  <button onClick={() => setDarkMode(!darkMode)} className="w-full py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                    <span className="material-symbols-outlined text-lg">{darkMode ? 'light_mode' : 'dark_mode'}</span>
                    {darkMode ? t('الوضع المضيء', 'LIGHT MODE') : t('الوضع المظلم', 'DARK MODE')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
