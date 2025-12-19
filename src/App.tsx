import React, { useState, useEffect, useMemo } from 'react';
import { Patient, Language, Alert, Todo } from './types';
import Header from '../components/Header';
import StatsGrid from '../components/StatsGrid';
import PatientModal from '../components/PatientModal';
import PatientCard from '../components/PatientCard';
import AlertsPage from '../components/AlertsPage';
import GlobalTodoList from '../components/GlobalTodoList';
import { 
  analyzeClinicalRisks, 
  generateNurseCarePlan, 
  generateShiftSummary, 
  generateSmartMedTableData,
  generateComprehensiveSummary 
} from './geminiService';
import { exportHandoverPDF } from '../utils/pdfExport';

// بيانات المرضى الأولية
const initialPatients: Patient[] = [
  {
    id: 1,
    name: 'أحمد محمد',
    fileNumber: 'MRN-2024-001',
    age: '45',
    roomNumber: 'ICU-101',
    diagnosis: 'ارتفاع ضغط الدم الحاد مع فشل كلوي',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isbar: {
      identification: {
        room_no: 'ICU-101',
        patient_name: 'أحمد محمد',
        mrn: 'MRN-2024-001',
        age: '45',
        admission_date: '2024-03-15',
        admitted_from: 'قسم الطوارئ',
        consultant: 'د. سعيد خالد'
      },
      background: {
        past_medical_history: 'سكري نوع 2، ارتفاع ضغط الدم',
        chief_complaint: 'ضيق تنفس وألم في الصدر',
        allergy: 'البنسلين',
        infections_isolation: 'لا يوجد'
      },
      current_complaints: {
        complaints: 'ضيق تنفس، تعب عام، تورم في الأطراف',
        diagnosis: 'فشل القلب الاحتقاني مع احتباس سوائل',
        connections: [
          { id: '1', name: 'IV Line Right Hand', date: '2024-03-15' },
          { id: '2', name: 'Foley Catheter', date: '2024-03-15' }
        ],
        infusions: [
          { id: '1', name: 'Furosemide', rate: '10 mg/hr' },
          { id: '2', name: 'Normal Saline', rate: '50 ml/hr' }
        ],
        diet: 'حمية قليلة الملح'
      },
      assessment: {
        gcs: 15,
        fall_risk: 'high',
        vitals: 'BP: 150/90, HR: 88, RR: 22, Temp: 37.2',
        ventilation: 'Room Air',
        bed_sore: 'no',
        physical_restraint: 'no',
        important_findings: 'تورم في الأطراف السفلية، أصوات رئوية crepitations'
      },
      recommendations: {
        plan_of_care: 'مراقبة مدخول ومخرجات السوائل، مواصلة مدرات البول، مراقبة الشوارد',
        physician_orders: [
          { id: '1', order: 'متابعة وظائف الكلى يومياً', status: 'pending' },
          { id: '2', order: 'صورة أشعة للصدر', status: 'completed' }
        ],
        cultures: [
          { id: '1', type: 'Blood Culture', result: 'Pending' }
        ],
        consultations: [
          { id: '1', name: 'استشارة قلبية', status: 'تم الطلب' }
        ],
        risks: 'خطر السقوط بسبب الضعف العام، خطر قرح الفراش'
      },
      nursing: {
        outgoing_nurse: 'ممرض. أحمد خالد',
        receiving_nurse: '',
        handover_date: new Date().toISOString().split('T')[0],
        handover_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      shift_notes: [
        { id: '1', time: '08:00', event: 'تناول الدواء بانتظام' },
        { id: '2', time: '12:00', event: 'شكوى من ضيق تنفس متزايد' }
      ]
    },
    medications: [
      { id: '1', name: 'Furosemide 40mg', dosage: '40mg', frequency: 'مرتين يومياً' },
      { id: '2', name: 'Lisinopril 10mg', dosage: '10mg', frequency: 'مرة يومياً' },
      { id: '3', name: 'Metformin 500mg', dosage: '500mg', frequency: 'مرتين يومياً' }
    ],
    reports: [],
    labs: [
      { id: '1', testName: 'Creatinine', value: '2.5', unit: 'mg/dL', date: '2024-03-15' },
      { id: '2', testName: 'Potassium', value: '4.2', unit: 'mmol/L', date: '2024-03-15' }
    ],
    radiology: [
      { id: '1', type: 'Chest X-Ray', findings: 'احتقان رئوي مع زيادة السوائل', date: '2024-03-15' }
    ],
    todos: [
      { id: '1', text: 'قياس ضغط الدم كل 4 ساعات', completed: false, createdAt: new Date().toISOString(), patientId: 1, patientName: 'أحمد محمد' },
      { id: '2', text: 'تسجيل مدخول ومخرجات السوائل', completed: true, createdAt: new Date().toISOString(), patientId: 1, patientName: 'أحمد محمد' }
    ]
  },
  {
    id: 2,
    name: 'فاطمة علي',
    fileNumber: 'MRN-2024-002',
    age: '67',
    roomNumber: 'Ward-205',
    diagnosis: 'التهاب رئوي مجتمعي',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isbar: {
      identification: {
        room_no: 'Ward-205',
        patient_name: 'فاطمة علي',
        mrn: 'MRN-2024-002',
        age: '67',
        admission_date: '2024-03-14',
        admitted_from: 'العيادة الخارجية',
        consultant: 'د. منى حسن'
      },
      background: {
        past_medical_history: 'ربو، هشاشة عظام',
        chief_complaint: 'سعال مع بلغم، حرارة',
        allergy: 'لا يوجد',
        infections_isolation: 'لا يوجد'
      },
      current_complaints: {
        complaints: 'سعال، حرارة، تعب',
        diagnosis: 'التهاب رئوي في الفص الأيمن السفلي',
        connections: [
          { id: '1', name: 'IV Line Left Hand', date: '2024-03-14' }
        ],
        infusions: [
          { id: '1', name: 'Ceftriaxone', rate: '2g IV every 24h' }
        ],
        diet: 'سوائل وفيرة'
      },
      assessment: {
        gcs: 15,
        fall_risk: 'moderate',
        vitals: 'BP: 130/80, HR: 92, RR: 24, Temp: 38.5',
        ventilation: 'Oxygen 2L via nasal cannula',
        bed_sore: 'no',
        physical_restraint: 'no',
        important_findings: 'أصوات رئوية crackles في القاعدة اليمنى'
      },
      recommendations: {
        plan_of_care: 'مضادات حيوية، خافضات حرارة، مراقبة الأكسجة',
        physician_orders: [
          { id: '1', order: 'مزرعة بلغم', status: 'pending' }
        ],
        cultures: [],
        consultations: [],
        risks: 'خطر تدهور التنفس، خطر السقوط'
      },
      nursing: {
        outgoing_nurse: 'ممرض. أحمد خالد',
        receiving_nurse: '',
        handover_date: new Date().toISOString().split('T')[0],
        handover_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      shift_notes: [
        { id: '1', time: '10:00', event: 'تحسن في الأكسجة بعد العلاج' }
      ]
    },
    medications: [
      { id: '1', name: 'Ceftriaxone 2g', dosage: '2g', frequency: 'مرة يومياً' },
      { id: '2', name: 'Paracetamol 500mg', dosage: '500mg', frequency: 'كل 6 ساعات عند الحاجة' }
    ],
    reports: [],
    labs: [
      { id: '1', testName: 'WBC', value: '15.2', unit: 'x10³/µL', date: '2024-03-14' },
      { id: '2', testName: 'CRP', value: '120', unit: 'mg/L', date: '2024-03-14' }
    ],
    radiology: [
      { id: '1', type: 'Chest X-Ray', findings: 'تصلد في الفص الأيمن السفلي', date: '2024-03-14' }
    ],
    todos: [
      { id: '1', text: 'قياس الحرارة كل 6 ساعات', completed: false, createdAt: new Date().toISOString(), patientId: 2, patientName: 'فاطمة علي' },
      { id: '2', text: 'تشجيع السعال والتنفس العميق', completed: false, createdAt: new Date().toISOString(), patientId: 2, patientName: 'فاطمة علي' }
    ]
  }
];

const initialAlerts: Alert[] = [
  {
    id: '1',
    title: 'خطر سقوط عالي',
    message: 'المريض أحمد محمد لديه تقييم خطر سقوط عالي بسبب الضعف العام وتورم الأطراف',
    category: 'hazard',
    timestamp: new Date().toISOString(),
    read: false,
    patientName: 'أحمد محمد',
    patientId: 1
  },
  {
    id: '2',
    title: 'ارتفاع إنزيمات الكلى',
    message: 'مستوى الكرياتينين مرتفع (2.5 mg/dL) - يحتاج مراقبة دقيقة لوظائف الكلى',
    category: 'warning',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    patientName: 'أحمد محمد',
    patientId: 1
  },
  {
    id: '3',
    title: 'نصيحة تمريضية',
    message: 'تأكد من وضع المريضة في وضعية مرتفعة للرأس لتسهيل التنفس',
    category: 'tip',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: true,
    patientName: 'فاطمة علي',
    patientId: 2
  }
];

const App: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('nuraithm_lang');
    return (saved as Language) || 'ar';
  });
  const [aiLang, setAiLang] = useState<Language>(() => {
    const saved = localStorage.getItem('nuraithm_ai_lang');
    return (saved as Language) || 'ar';
  });
  const [signature, setSignature] = useState(() => {
    return localStorage.getItem('nuraithm_sig') || 'ممرض. أحمد خالد';
  });
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('nuraithm_theme') === 'dark';
  });
  const [activeTab, setActiveTab] = useState<'active' | 'discharged'>('active');
  const [currentView, setCurrentView] = useState<'dashboard' | 'alerts'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPid, setSelectedPid] = useState<number | null>(null);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('nuraithm_patients', JSON.stringify(patients));
    localStorage.setItem('nuraithm_alerts', JSON.stringify(alerts));
    localStorage.setItem('nuraithm_sig', signature);
    localStorage.setItem('nuraithm_theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('nuraithm_lang', lang);
    localStorage.setItem('nuraithm_ai_lang', aiLang);
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [patients, alerts, signature, darkMode, lang, aiLang]);

  const t = (ar: string, en: string) => lang === 'ar' ? ar : en;

  const filtered = useMemo(() => {
    return patients.filter(p => {
      const matchStatus = p.status === activeTab;
      const q = searchQuery.toLowerCase();
      return matchStatus && (
        p.name.toLowerCase().includes(q) || 
        p.fileNumber.toLowerCase().includes(q) ||
        p.diagnosis.toLowerCase().includes(q)
      );
    });
  }, [patients, activeTab, searchQuery]);

  const stats = useMemo(() => ({
    total: patients.length,
    active: patients.filter(p => p.status === 'active').length,
    isbar: patients.filter(p => p.isbar && p.isbar.identification.patient_name).length,
    alerts: alerts.filter(a => !a.read).length
  }), [patients, alerts]);

  const handleSavePatient = async (p: Patient) => {
    const now = new Date().toISOString();
    setPatients(prev => {
      const index = prev.findIndex(pt => pt.id === p.id);
      if (index !== -1) {
        return prev.map(pt => pt.id === p.id ? { ...p, updatedAt: now } : pt);
      }
      return [...prev, { ...p, id: Date.now(), createdAt: now, updatedAt: now }];
    });
    setIsModalOpen(false);
  };

  const handleQuickAddTodo = () => {
    const activePatients = patients.filter(p => p.status === 'active');
    if (activePatients.length === 0) {
      alert(t('لا يوجد مرضى نشطين', 'No active patients'));
      return;
    }
    
    const pName = prompt(t('اسم المريض للمهمة:', 'Patient Name:'), activePatients[0].name);
    const target = activePatients.find(p => p.name.includes(pName || ''));
    if (!target) return;
    
    const task = prompt(t('المهمة:', 'Task:'));
    if (!task) return;
    
    setPatients(prev => prev.map(p => p.id === target.id ? {
      ...p,
      todos: [...p.todos, {
        id: Date.now().toString(),
        text: task,
        completed: false,
        createdAt: new Date().toISOString(),
        patientId: target.id,
        patientName: target.name
      }]
    } : p));
  };

  const handleQuickAddEvent = () => {
    const activePatients = patients.filter(p => p.status === 'active');
    if (activePatients.length === 0) {
      alert(t('لا يوجد مرضى نشطين', 'No active patients'));
      return;
    }
    
    const pName = prompt(t('اسم المريض:', 'Patient:'), activePatients[0].name);
    const target = activePatients.find(p => p.name.includes(pName || ''));
    if (!target) return;
    
    const event = prompt(t('الحدث السريري:', 'Event:'));
    if (!event) return;
    
    const note = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      event,
      category: 'clinical'
    };
    
    setPatients(prev => prev.map(p => p.id === target.id ? {
      ...p,
      isbar: {
        ...p.isbar,
        shift_notes: [note, ...p.isbar.shift_notes]
      }
    } : p));
  };

  const handleBackup = () => {
    const data = JSON.stringify({
      patients,
      alerts,
      signature,
      lang,
      aiLang,
      exportedAt: new Date().toISOString()
    }, null, 2);
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nuraithm_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.patients) setPatients(data.patients);
          if (data.alerts) setAlerts(data.alerts);
          if (data.signature) setSignature(data.signature);
          if (data.lang) setLang(data.lang);
          if (data.aiLang) setAiLang(data.aiLang);
          
          alert(t('تم استيراد البيانات بنجاح', 'Data imported successfully'));
        } catch (err) {
          alert(t('خطأ في ملف النسخ الاحتياطي', 'Invalid backup file'));
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };

  const handlePatientAction = async (p: Patient, type: string) => {
    switch(type) {
      case 'summary':
        try {
          const summary = await generateComprehensiveSummary(p, aiLang);
          if (summary) {
            handleSavePatient({
              ...p,
              reports: [{
                id: Date.now().toString(),
                title: t('الملخص السريري الشامل', 'Clinical Summary'),
                type: 'AI PRO',
                content: summary,
                createdAt: new Date().toISOString()
              }, ...p.reports]
            });
            alert(t('تم توليد الملخص بنجاح', 'Summary generated successfully'));
          }
        } catch (error) {
          alert(t('حدث خطأ في توليد الملخص', 'Error generating summary'));
        }
        break;
        
      case 'careplan':
        try {
          const plan = await generateNurseCarePlan(p, aiLang);
          if (plan) {
            handleSavePatient({
              ...p,
              reports: [{
                id: Date.now().toString(),
                title: t('خطة التمريض', 'Care Plan'),
                type: 'AI',
                content: '',
                createdAt: new Date().toISOString(),
                isTable: true,
                tableData: plan
              }, ...p.reports]
            });
            alert(t('تم توليد خطة التمريض', 'Care plan generated'));
          }
        } catch (error) {
          alert(t('حدث خطأ في توليد خطة التمريض', 'Error generating care plan'));
        }
        break;
        
      case 'shift':
        try {
          const summary = await generateShiftSummary(p, aiLang);
          if (summary) {
            handleSavePatient({
              ...p,
              reports: [{
                id: Date.now().toString(),
                title: t('ملخص الشفت', 'Shift Summary'),
                type: 'AI',
                content: summary,
                createdAt: new Date().toISOString()
              }, ...p.reports]
            });
            alert(t('تم توليد ملخص الشفت', 'Shift summary generated'));
          }
        } catch (error) {
          alert(t('حدث خطأ في توليد ملخص الشفت', 'Error generating shift summary'));
        }
        break;
        
      case 'handover':
        try {
          exportHandoverPDF(p, signature);
          alert(t('تم تصدير ملف PDF', 'PDF exported successfully'));
        } catch (error) {
          alert(t('حدث خطأ في التصدير', 'Export error'));
        }
        break;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${lang === 'ar' ? 'font-cairo' : 'font-inter'}`}>
      <Header 
        lang={lang}
        setLang={setLang}
        aiLang={aiLang}
        setAiLang={setAiLang}
        unreadAlerts={stats.alerts}
        onAlertsClick={() => setCurrentView('alerts')}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        signature={signature}
        setSignature={setSignature}
        onBackup={handleBackup}
        onImport={handleImport}
        onAnalytics={() => {}}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {currentView === 'alerts' ? (
          <AlertsPage 
            alerts={alerts}
            lang={lang}
            onBack={() => setCurrentView('dashboard')}
            onMarkRead={(id) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a))}
            onClearAll={() => {
              if (confirm(t('هل تريد مسح جميع التنبيهات؟', 'Clear all alerts?'))) {
                setAlerts([]);
              }
            }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <StatsGrid stats={stats} lang={lang} />
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex bg-slate-200 dark:bg-slate-800 p-1.5 rounded-2xl">
                  <button
                    onClick={() => setActiveTab('active')}
                    className={`px-6 py-2 text-xs font-black transition-all rounded-xl ${
                      activeTab === 'active'
                        ? 'bg-primary text-white shadow-lg'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {t('المرضى النشطين', 'ACTIVE PATIENTS')}
                  </button>
                  <button
                    onClick={() => setActiveTab('discharged')}
                    className={`px-6 py-2 text-xs font-black transition-all rounded-xl ${
                      activeTab === 'discharged'
                        ? 'bg-primary text-white shadow-lg'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {t('المسلمين', 'DISCHARGED')}
                  </button>
                </div>

                <div className="relative flex-1 min-w-[300px]">
                  <span className={`material-symbols-outlined absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`}>
                    search
                  </span>
                  <input
                    type="text"
                    placeholder={t('بحث عن مريض...', 'Search patient...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full ${lang === 'ar' ? 'pr-12 pl-6' : 'pl-12 pr-6'} py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 ring-primary/20 text-slate-950 dark:text-white font-bold`}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleQuickAddTodo}
                    title={t('إضافة مهمة', 'Add Task')}
                    className="bg-orange-500 text-white w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 transition-all"
                  >
                    <span className="material-symbols-outlined">add_task</span>
                  </button>
                  <button
                    onClick={handleQuickAddEvent}
                    title={t('تسجيل حدث', 'Log Event')}
                    className="bg-blue-500 text-white w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 transition-all"
                  >
                    <span className="material-symbols-outlined">event_note</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPid(null);
                      setIsModalOpen(true);
                    }}
                    className="bg-primary text-white px-6 h-12 rounded-2xl shadow-xl flex items-center gap-2 hover:scale-105 transition-all"
                  >
                    <span className="material-symbols-outlined">person_add</span>
                    <span className="font-black text-xs uppercase">
                      {t('إضافة مريض', 'ADD PATIENT')}
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map(p => (
                  <PatientCard
                    key={p.id}
                    patient={p}
                    lang={lang}
                    onEdit={() => {
                      setSelectedPid(p.id);
                      setIsModalOpen(true);
                    }}
                    onHandover={() => exportHandoverPDF(p, signature)}
                    hasAlerts={alerts.some(a => a.patientId === p.id && !a.read)}
                    onAction={(type) => handlePatientAction(p, type)}
                  />
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <GlobalTodoList
                patients={patients}
                lang={lang}
                onToggle={(pid, tid) => {
                  setPatients(prev => prev.map(p => p.id === pid ? {
                    ...p,
                    todos: p.todos.map(t => t.id === tid ? { ...t, completed: !t.completed } : t)
                  } : p));
                }}
              />
            </div>
          </div>
        )}
      </main>

      {isModalOpen && (
        <PatientModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          lang={lang}
          aiLang={aiLang}
          patient={patients.find(p => p.id === selectedPid)}
          onSave={handleSavePatient}
          signature={signature}
        />
      )}
    </div>
  );
};

export default App;