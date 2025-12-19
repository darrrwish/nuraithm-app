
import React from 'react';
import { Alert, Language } from '../src/types';

interface AlertsModalProps {
  alerts: Alert[];
  lang: Language;
  onClose: () => void;
  onMarkRead: (id: string) => void;
}

const AlertsModal: React.FC<AlertsModalProps> = ({ alerts, lang, onClose, onMarkRead }) => {
  const t = (ar: string, en: string) => lang === 'ar' ? ar : en;
  const sortedAlerts = [...alerts].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
             <span className="material-symbols-outlined text-primary text-3xl">notifications_active</span>
             <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                {t('التنبيهات السريرية', 'Clinical Alerts')}
             </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all">
            <span className="material-symbols-outlined dark:text-white">close</span>
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {sortedAlerts.length === 0 ? (
            <div className="text-center py-20 text-slate-300">
              <span className="material-symbols-outlined text-7xl mb-4">check_circle</span>
              <p className="font-black text-lg">{t('لا توجد تنبيهات حالياً', 'No active alerts')}</p>
            </div>
          ) : (
            sortedAlerts.map(alert => (
              <div 
                key={alert.id} 
                className={`p-6 rounded-[2rem] border-2 flex gap-4 transition-all ${alert.read ? 'bg-slate-50 dark:bg-slate-800/30 border-transparent opacity-60' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-xl'}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${alert.type === 'danger' ? 'bg-red-500 text-white' : alert.type === 'warning' ? 'bg-orange-500 text-white' : 'bg-primary text-white'}`}>
                  <span className="material-symbols-outlined">
                    {alert.type === 'danger' ? 'error' : alert.type === 'warning' ? 'warning' : 'info'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-black text-slate-800 dark:text-white leading-tight">{alert.title}</h4>
                    {!alert.read && (
                      <button onClick={() => onMarkRead(alert.id)} className="text-[10px] font-black text-primary hover:underline">{t('تم', 'DONE')}</button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{alert.message}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-700 text-slate-500 px-3 py-1 rounded-lg uppercase tracking-widest">{alert.patientName}</span>
                    <span className="text-[10px] font-bold text-slate-400">{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-800 text-center">
          <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em] font-black">AK-ENDOR CLINICAL ENGINE v2.0</p>
        </div>
      </div>
    </div>
  );
};

export default AlertsModal;
