
import React from 'react';
import { Patient, Language } from '../src/types';

interface PatientCardProps {
  patient: Patient;
  lang: Language;
  onEdit: () => void;
  onHandover: () => void;
  hasAlerts?: boolean;
  onAction?: (type: 'handover' | 'careplan' | 'shift' | 'medtable') => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, lang, onEdit, onHandover, hasAlerts, onAction }) => {
  const isActive = patient.status === 'active';
  const t = (ar: string, en: string) => lang === 'ar' ? ar : en;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
      {/* Risk Indicators */}
      <div className="absolute top-4 right-4 flex gap-2">
        {patient.isbar.background.allergy && patient.isbar.background.allergy.toLowerCase() !== 'none' && (
          <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center" title="Allergy">
            <span className="material-symbols-outlined text-sm">warning</span>
          </div>
        )}
        {patient.isbar.background.infections_isolation && patient.isbar.background.infections_isolation.toLowerCase() !== 'none' && (
          <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center" title="Isolation">
            <span className="material-symbols-outlined text-sm">masks</span>
          </div>
        )}
        {hasAlerts && (
          <div className="w-8 h-8 bg-red-600 text-white rounded-lg flex items-center justify-center animate-pulse" title="Clinical Hazard">
            <span className="material-symbols-outlined text-sm">priority_high</span>
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black mb-4 ${isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
          {isActive ? t('نشط', 'ACTIVE') : t('مسلم / مخرج', 'DISCHARGED')}
        </div>
        <h3 className="text-2xl font-black text-slate-950 dark:text-white mb-1 hover:text-primary cursor-pointer" onClick={onEdit}>{patient.name}</h3>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">MRN: {patient.fileNumber} • ROOM: {patient.roomNumber}</p>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl mb-6 border dark:border-slate-800">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 line-clamp-2">
          {patient.diagnosis || t('لا يوجد تشخيص مسجل', 'No diagnosis recorded')}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-6">
        <ActionButton icon="analytics" onClick={() => onAction?.('careplan')} title={t('كير بلان', 'Care Plan')} />
        <ActionButton icon="history_edu" onClick={() => onAction?.('shift')} title={t('تقرير الأحداث', 'Shift Report')} />
        <ActionButton icon="medication" onClick={() => onAction?.('medtable')} title={t('جدول الأدوية', 'Med Table')} />
        <ActionButton icon="picture_as_pdf" onClick={() => onAction?.('handover')} title={t('هاند أوفر', 'Handover')} color="bg-primary text-white" />
      </div>

      <div className="flex justify-between items-center pt-6 border-t dark:border-slate-800">
        <button onClick={onEdit} className="text-xs font-black text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">folder_open</span>
          {t('فتح الملف', 'OPEN CHART')}
        </button>
        {isActive && (
          <button onClick={onHandover} className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all">
            <span className="material-symbols-outlined">transfer_within_a_station</span>
          </button>
        )}
      </div>
    </div>
  );
};

const ActionButton = ({ icon, onClick, title, color = "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" }: any) => (
  <button onClick={onClick} className={`${color} p-3 rounded-xl flex flex-col items-center gap-1 hover:scale-105 transition-all shadow-sm`} title={title}>
    <span className="material-symbols-outlined text-lg">{icon}</span>
    <span className="text-[8px] font-black uppercase">{title}</span>
  </button>
);

export default PatientCard;
