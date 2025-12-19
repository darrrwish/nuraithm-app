
import React, { useState, useEffect, useMemo } from 'react';
import { Patient, Language, Alert, Todo, ShiftNote } from './types.ts';
import Header from './components/Header.tsx';
import StatsGrid from './components/StatsGrid.tsx';
import PatientModal from './components/PatientModal.tsx';
import PatientCard from './components/PatientCard.tsx';
import AlertsPage from './components/AlertsPage.tsx';
import GlobalTodoList from './components/GlobalTodoList.tsx';
import { analyzeClinicalRisks, generateNurseCarePlan, generateShiftSummary, generateSmartMedTableData } from './geminiService.ts';
import { exportHandoverPDF } from './utils/pdfExport.ts';

const App: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('nuraithm_lang') as Language) || 'ar');
  const [aiLang, setAiLang] = useState<Language>(() => (localStorage.getItem('nuraithm_ai_lang') as Language) || 'ar');
  const [signature, setSignature] = useState(() => localStorage.getItem('nuraithm_sig') || 'Nurse. Ahmed Khaled');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('nuraithm_theme') === 'dark');
  const [activeTab, setActiveTab] = useState<'active' | 'discharged'>('active');
  const [currentView, setCurrentView] = useState<'dashboard' | 'alerts'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPid, setSelectedPid] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('patients_nuraithm');
    const savedAlerts = localStorage.getItem('alerts_nuraithm');
    if (saved) setPatients(JSON.parse(saved));
    if (savedAlerts) setAlerts(JSON.parse(savedAlerts));
    if (darkMode) document.documentElement.classList.add('dark');
    
    // Set document direction and language
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('patients_nuraithm', JSON.stringify(patients));
    localStorage.setItem('alerts_nuraithm', JSON.stringify(alerts));
    localStorage.setItem('nuraithm_sig', signature);
    localStorage.setItem('nuraithm_theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('nuraithm_lang', lang);
    localStorage.setItem('nuraithm_ai_lang', aiLang);
    
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [patients, alerts, signature, darkMode, lang, aiLang]);

  const t = (ar: string, en: string) => lang === 'ar' ? ar : en;

  const filtered = useMemo(() => {
    return patients.filter(p => {
      const matchStatus = p.status === activeTab;
      const q = searchQuery.toLowerCase();
      return matchStatus && (
        (p.name?.toLowerCase() || '').includes(q) || 
        (p.fileNumber || '').includes(q)
      );
    });
  }, [patients, activeTab, searchQuery]);

  const stats = useMemo(() => ({
    total: patients.length,
    active: patients.filter(p => p.status === 'active').length,
    isbar: patients.filter(p => p.isbar && p.isbar.background.chief_complaint).length,
    alerts: alerts.filter(a => !a.read).length
  }), [patients, alerts]);

  const handleSave = async (p: Patient) => {
    let updatedPatients: Patient[];
    const now = new Date().toISOString();
    
    const index = patients.findIndex(pt => pt.id === p.id);
    if (index !== -1) {
      updatedPatients = patients.map(pt => pt.id === p.id ? { ...p, updatedAt: now } : pt);
    } else {
      updatedPatients = [...patients, { ...p, id: Date.now(), createdAt: now, updatedAt: now }];
    }
    
    setPatients(updatedPatients);
    setIsModalOpen(false);

    analyzeClinicalRisks(p, aiLang).then(newRisks => {
      if (newRisks && Array.isArray(newRisks) && newRisks.length > 0) {
        const newAlerts: Alert[] = newRisks.map(r => ({
          id: Math.random().toString(36).substr(2, 9),
          title: r.title || 'Safety Alert',
          message: r.message || '',
          category: (r.category as any) || 'warning',
          timestamp: new Date().toISOString(),
          read: false,
          patientName: p.name,
          patientId: p.id
        }));
        setAlerts(prev => [...newAlerts, ...prev]);
      }
    });
  };

  const handleQuickAddTodo = () => {
    const activePatients = patients.filter(p => p.status === 'active');
    if (activePatients.length === 0) return alert(t('لا يوجد مرضى نشطين', 'No active patients'));
    
    const pName = prompt(t('اسم المريض للمهمة:', 'Select Patient for task:'), activePatients[0].name);
    const target = activePatients.find(p => p.name.includes(pName || ''));
    if (!target) return alert(t('المريض غير موجود', 'Patient not found'));
    
    const taskText = prompt(t('المهمة المطلوبة:', 'What is the task?'));
    if (!taskText) return;

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: taskText,
      completed: false,
      createdAt: new Date().toISOString(),
      patientId: target.id,
      patientName: target.name
    };

    setPatients(prev => prev.map(p => p.id === target.id ? { ...p, todos: [...p.todos, newTodo] } : p));
  };

  const handleQuickAddEvent = () => {
    const activePatients = patients.filter(p => p.status === 'active');
    if (activePatients.length === 0) return alert(t('لا يوجد مرضى نشطين', 'No active patients'));
    
    const pName = prompt(t('اسم المريض للحدث:', 'Select Patient for event:'), activePatients[0].name);
    const target = activePatients.find(p => p.name.includes(pName || ''));
    if (!target) return alert(t('المريض غير موجود', 'Patient not found'));
    
    const eventText = prompt(t('ما هو الحدث السريري؟', 'What happened?'));
    if (!eventText) return;

    const newNote: ShiftNote = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      event: eventText,
      category: 'clinical'
    };

    setPatients(prev => prev.map(p => p.id === target.id ? { ...p, isbar: { ...p.isbar, shift_notes: [newNote, ...p.isbar.shift_notes] } } : p));
  };

  const handleBackup = () => {
    const data = {
      patients,
      alerts,
      signature,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nuraithm_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event: any) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (imported.patients) setPatients(imported.patients);
          if (imported.alerts) setAlerts(imported.alerts);
          if (imported.signature) setSignature(imported.signature);
          alert(t('تم استيراد البيانات بنجاح', 'Data imported successfully'));
        } catch (err) {
          alert(t('خطأ في قراءة الملف', 'Error reading file'));
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300 ${lang === 'ar' ? 'font-cairo text-right' : 'font-inter text-left'}`}>
      <Header 
        lang={lang} setLang={setLang} 
        aiLang={aiLang} setAiLang={setAiLang}
        unreadAlerts={stats.alerts} 
        onAlertsClick={() => setCurrentView('alerts')} 
        darkMode={darkMode} setDarkMode={setDarkMode}
        signature={signature} setSignature={setSignature}
        onBackup={handleBackup} onImport={handleImport} onAnalytics={() => {}}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {currentView === 'alerts' ? (
          <AlertsPage 
            alerts={alerts} lang={lang} 
            onBack={() => setCurrentView('dashboard')} 
            onMarkRead={(id) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a))} 
            onClearAll={() => setAlerts([])}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <StatsGrid stats={stats} lang={lang} />
              <div className="flex bg-slate-200 dark:bg-slate-900 p-1.5 rounded-2xl w-full max-w-md">
                <button onClick={() => setActiveTab('active')} className={`flex-1 py-3 text-xs font-black transition-all rounded-xl ${activeTab === 'active' ? 'bg-primary text-white shadow-lg' : 'text-slate-500'}`}>
                  {t('المرضى الحاليين', 'ACTIVE PATIENTS')}
                </button>
                <button onClick={() => setActiveTab('discharged')} className={`flex-1 py-3 text-xs font-black transition-all rounded-xl ${activeTab === 'discharged' ? 'bg-primary text-white shadow-lg' : 'text-slate-500'}`}>
                  {t('الأرشيف', 'ARCHIVE')}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[300px]">
                  <span className={`material-symbols-outlined absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`}>search</span>
                  <input 
                    type="text" placeholder={t('بحث...', 'Search...')} 
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full ${lang === 'ar' ? 'pr-12 pl-6' : 'pl-12 pr-6'} py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 ring-primary/20 text-slate-950 dark:text-white font-bold`}
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleQuickAddTodo} title={t('إضافة مهمة', 'Add Task')} className="bg-orange-500 text-white w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 transition-all">
                    <span className="material-symbols-outlined">add_task</span>
                  </button>
                  <button onClick={handleQuickAddEvent} title={t('تسجيل حدث', 'Log Event')} className="bg-blue-500 text-white w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 transition-all">
                    <span className="material-symbols-outlined">event_note</span>
                  </button>
                  <button onClick={() => { setSelectedPid(null); setIsModalOpen(true); }} className="bg-primary text-white px-8 h-14 rounded-2xl shadow-xl flex items-center gap-2 hover:scale-105 transition-all">
                    <span className="material-symbols-outlined">person_add</span>
                    <span className="font-black text-xs uppercase">{t('إضافة مريض', 'ADD PATIENT')}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map(p => (
                  <PatientCard 
                    key={p.id} patient={p} lang={lang} 
                    onEdit={() => { setSelectedPid(p.id); setIsModalOpen(true); }} 
                    onHandover={() => {
                        const receiver = prompt(t('اسم الممرض المستلم:', 'Receiving Nurse:'));
                        if (receiver) {
                            handleSave({
                                ...p,
                                status: 'discharged',
                                isbar: {
                                    ...p.isbar,
                                    nursing: {
                                        ...p.isbar.nursing,
                                        receiving_nurse: receiver,
                                        handover_date: new Date().toISOString().split('T')[0],
                                        handover_time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                    }
                                }
                            });
                        }
                    }}
                    hasAlerts={alerts.some(a => a.patientId === p.id && !a.read)}
                    onAction={async (type) => {
                      if (type === 'handover') exportHandoverPDF(p, signature);
                      if (type === 'careplan') {
                        const plan = await generateNurseCarePlan(p, aiLang);
                        if (plan) handleSave({ ...p, reports: [{ id: Date.now().toString(), title: t('خطة التمريض', 'Care Plan'), type: 'AI', content: '', createdAt: new Date().toISOString(), isTable: true, tableData: plan }, ...p.reports] });
                      }
                      if (type === 'shift') {
                        const sum = await generateShiftSummary(p, aiLang);
                        if (sum) handleSave({ ...p, reports: [{ id: Date.now().toString(), title: t('ملخص الشفت', 'Shift Summary'), type: 'AI', content: sum, createdAt: new Date().toISOString() }, ...p.reports] });
                      }
                      if (type === 'medtable') {
                        const table = await generateSmartMedTableData(p, aiLang);
                        if (table) handleSave({ ...p, reports: [{ id: Date.now().toString(), title: t('تحليل الأدوية', 'Med Table'), type: 'AI', content: '', createdAt: new Date().toISOString(), isTable: true, tableData: table }, ...p.reports] });
                      }
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="lg:col-span-1">
              <GlobalTodoList patients={patients} lang={lang} onToggle={(pid, tid) => {
                setPatients(prev => prev.map(p => p.id === pid ? { ...p, todos: p.todos.map(t => t.id === tid ? { ...t, completed: !t.completed } : t) } : p));
              }} />
            </div>
          </div>
        )}
      </main>

      {isModalOpen && (
        <PatientModal 
          isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} 
          lang={lang} aiLang={aiLang} patient={patients.find(p => p.id === selectedPid)}
          onSave={handleSave} signature={signature}
        />
      )}
    </div>
  );
};

export default App;
