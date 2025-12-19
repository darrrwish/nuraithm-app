
import React from 'react';
import { Language } from '../src/types';

interface StatsGridProps {
  stats: {
    total: number;
    active: number;
    isbar: number;
    alerts: number;
  };
  lang: Language;
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats, lang }) => {
  const labels = {
    total: lang === 'ar' ? 'إجمالي المرضى' : 'Total Patients',
    active: lang === 'ar' ? 'نشطين اليوم' : 'Active Today',
    isbar: lang === 'ar' ? 'بيانات ISBAR' : 'ISBAR Data',
    alerts: lang === 'ar' ? 'تنبيهات نشطة' : 'Active Alerts'
  };

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <StatCard title={labels.total} value={stats.total} icon="group" color="bg-blue-500" />
      <StatCard title={labels.active} value={stats.active} icon="clinical_notes" color="bg-orange-500" />
      <StatCard title={labels.isbar} value={stats.isbar} icon="description" color="bg-green-500" />
      <StatCard title={labels.alerts} value={stats.alerts} icon="warning" color="bg-red-500" />
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: number, icon: string, color: string }> = ({ title, value, icon, color }) => (
  <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm flex flex-col justify-between overflow-hidden relative group h-full">
    <div className={`absolute top-0 right-0 w-16 sm:w-24 h-16 sm:h-24 ${color} opacity-10 rounded-full -mr-4 sm:-mr-8 -mt-4 sm:-mt-8 transition-transform group-hover:scale-125`}></div>
    <span className={`material-symbols-outlined ${color.replace('bg-', 'text-')} mb-3 sm:mb-4 text-2xl sm:text-3xl`}>{icon}</span>
    <div>
      <h3 className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">{title}</h3>
      <p className="text-2xl sm:text-3xl font-black dark:text-white mt-1">{value}</p>
    </div>
  </div>
);

export default StatsGrid;
