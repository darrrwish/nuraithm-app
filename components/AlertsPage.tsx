
import React from 'react';
import { Alert, Language } from '../src/types';

interface AlertsPageProps {
  alerts: Alert[];
  lang: Language;
  onBack: () => void;
  onMarkRead: (id: string) => void;
  onClearAll?: () => void;
}

const AlertsPage: React.FC<AlertsPageProps> = ({ alerts, lang, onBack, onMarkRead, onClearAll }) => {
  const t = (ar: string, en: string) => lang === 'ar' ? ar : en;

  const hazards = alerts.filter(a => a.category === 'hazard');
  const warnings = alerts.filter(a => a.category === 'warning');
  const tips = alerts.filter(a => a.category === 'tip');
  const learning = alerts.filter(a => a.category === 'learning');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white transition-all hover:bg-slate-200">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">{t('مركز التحليل الذكي', 'Clinical AI Center')}</h1>
        </div>
        {alerts.length > 0 && onClearAll && (
          <button onClick={() => { if(confirm(t('هل تريد مسح جميع التنبيهات؟', 'Clear all alerts?'))) onClearAll(); }} className="px-6 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-black transition-all hover:bg-red-600 hover:text-white">
            {t('مسح الكل', 'CLEAR ALL')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <SectionTitle icon="gpp_maybe" title={t('التحذيرات والمخاطر', 'Critical Hazards')} color="text-red-600" />
          {hazards.length === 0 ? <EmptyState text={t('لا توجد مخاطر حرجة', 'No critical hazards')} /> : 
            hazards.map(a => <AlertItem key={a.id} alert={a} onRead={() => onMarkRead(a.id)} bg="bg-red-50 dark:bg-red-900/20" border="border-red-100 dark:border-red-800" />)}
        </section>

        <section className="space-y-4">
          <SectionTitle icon="notifications_active" title={t('تنبيهات المتابعة', 'Care Warnings')} color="text-orange-500" />
          {warnings.length === 0 ? <EmptyState text={t('لا توجد تنبيهات متابعة', 'No follow-up warnings')} /> : 
            warnings.map(a => <AlertItem key={a.id} alert={a} onRead={() => onMarkRead(a.id)} bg="bg-orange-50 dark:bg-orange-900/20" border="border-orange-100 dark:border-orange-800" />)}
        </section>

        <section className="space-y-4">
          <SectionTitle icon="lightbulb" title={t('نصائح تمريضية', 'Clinical Tips')} color="text-blue-500" />
          {tips.length === 0 ? <EmptyState text={t('لا توجد نصائح حالياً', 'No tips available')} /> : 
            tips.map(a => <AlertItem key={a.id} alert={a} onRead={() => onMarkRead(a.id)} bg="bg-blue-50 dark:bg-blue-900/20" border="border-blue-100 dark:border-blue-800" />)}
        </section>

        <section className="space-y-4">
          <SectionTitle icon="menu_book" title={t('عناوين للبحث والتعلم', 'Learning Resources')} color="text-emerald-500" />
          {learning.length === 0 ? <EmptyState text={t('لا توجد توصيات تعلم', 'No learning topics')} /> : 
            learning.map(a => <AlertItem key={a.id} alert={a} onRead={() => onMarkRead(a.id)} bg="bg-emerald-50 dark:bg-emerald-900/20" border="border-emerald-100 dark:border-emerald-800" />)}
        </section>
      </div>
    </div>
  );
};

const SectionTitle = ({ icon, title, color }: any) => (
  <div className="flex items-center gap-2 mb-4">
    <span className={`material-symbols-outlined ${color}`}>{icon}</span>
    <h3 className={`text-sm font-black uppercase tracking-widest ${color}`}>{title}</h3>
  </div>
);

const AlertItem = ({ alert, onRead, bg, border }: any) => (
  <div className={`${bg} ${border} border p-5 rounded-[1.5rem] relative group animate-in zoom-in-95 duration-300 transition-all hover:shadow-lg`}>
    <div className="flex justify-between items-start mb-2">
      <h4 className="text-[13px] font-black text-slate-900 dark:text-white leading-tight">{alert.title}</h4>
      {!alert.read && <button onClick={onRead} className="text-[9px] font-black text-primary uppercase bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border shadow-sm transition-all hover:scale-105">DONE</button>}
    </div>
    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed mb-3">{alert.message}</p>
    <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">PT: {alert.patientName}</span>
      <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    </div>
  </div>
);

const EmptyState = ({ text }: any) => (
  <div className="py-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] text-center text-slate-300 font-bold text-xs uppercase tracking-widest">
    {text}
  </div>
);

export default AlertsPage;
