
import React, { useState, useEffect } from 'react';
import { Patient, Language, Medication, ISBARData, Report, ShiftNote, LabResult, RadiologyReport, Connection, Infusion, PhysicianOrder, CultureResult, Consultation } from '../src/types.ts';
import { exportHandoverPDF } from '../utils/pdfExport.ts';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  aiLang: Language;
  patient?: Patient;
  onSave: (p: Patient) => void;
  signature: string;
}

const PatientModal: React.FC<PatientModalProps> = ({ isOpen, onClose, lang, patient, onSave, signature }) => {
  const [activeTab, setActiveTab] = useState<'id' | 'situation' | 'background' | 'assess' | 'recs' | 'event' | 'meds' | 'labs' | 'rad' | 'reports'>('id');
  const t = (ar: string, en: string) => lang === 'ar' ? ar : en;

  const initialData: Patient = {
    id: Date.now(),
    name: '', fileNumber: '', age: '', roomNumber: '', diagnosis: '', status: 'active',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    isbar: {
      identification: { room_no: '', patient_name: '', mrn: '', age: '', admission_date: '', admitted_from: '', consultant: '' },
      background: { past_medical_history: '', chief_complaint: '', allergy: '', infections_isolation: '' },
      current_complaints: { complaints: '', diagnosis: '', connections: [], infusions: [], diet: '' },
      assessment: { gcs: 15, fall_risk: 'low', vitals: '', ventilation: '', bed_sore: 'no', physical_restraint: 'no', important_findings: '' },
      recommendations: { plan_of_care: '', physician_orders: [], cultures: [], consultations: [], risks: '' },
      nursing: { outgoing_nurse: signature, receiving_nurse: '', handover_date: '', handover_time: '' },
      shift_notes: []
    },
    medications: [], labs: [], reports: [], radiology: [], todos: []
  };

  const [formData, setFormData] = useState<Patient>(initialData);

  useEffect(() => {
    if (patient) setFormData(JSON.parse(JSON.stringify(patient)));
    else setFormData({ ...initialData, id: Date.now() });
  }, [patient, isOpen]);

  const updateSection = (sec: string, field: string, val: any) => {
    setFormData(prev => {
      const isbar = { ...prev.isbar };
      (isbar as any)[sec][field] = val;
      const updated = { ...prev, isbar };
      if (sec === 'identification' && field === 'patient_name') updated.name = val;
      if (sec === 'identification' && field === 'mrn') updated.fileNumber = val;
      if (sec === 'identification' && field === 'room_no') updated.roomNumber = val;
      if (sec === 'identification' && field === 'age') updated.age = val;
      if (sec === 'current_complaints' && field === 'diagnosis') updated.diagnosis = val;
      return updated;
    });
  };

  const addListItem = (sec: string, field: string, item: any) => {
    setFormData(prev => {
      const isbar = { ...prev.isbar };
      const currentList = (isbar as any)[sec][field] || [];
      (isbar as any)[sec][field] = [item, ...currentList];
      return { ...prev, isbar };
    });
  };

  const handleAddMed = () => {
    const name = prompt(t('اسم الدواء:', 'Med Name:'));
    if (!name) return;
    const dose = prompt(t('الجرعة:', 'Dosage:')) || '';
    const freq = prompt(t('التكرار:', 'Frequency:')) || '';
    const newMed: Medication = { id: Date.now().toString(), name, dosage: dose, frequency: freq };
    setFormData(prev => ({ ...prev, medications: [newMed, ...prev.medications] }));
  };

  const handleAddLab = () => {
    const test = prompt(t('اسم التحليل:', 'Test Name:'));
    if (!test) return;
    const val = prompt(t('النتيجة:', 'Result:')) || '';
    const unit = prompt(t('الوحدة:', 'Unit:')) || '';
    const newLab: LabResult = { id: Date.now().toString(), testName: test, value: val, unit: unit, date: new Date().toISOString().split('T')[0] };
    setFormData(prev => ({ ...prev, labs: [newLab, ...prev.labs] }));
  };

  const handleAddRad = () => {
    const type = prompt(t('نوع الأشعة:', 'Radiology Type:'));
    if (!type) return;
    const find = prompt(t('النتائج:', 'Findings:')) || '';
    const newRad: RadiologyReport = { id: Date.now().toString(), type, findings: find, date: new Date().toISOString().split('T')[0] };
    setFormData(prev => ({ ...prev, radiology: [newRad, ...prev.radiology] }));
  };

  const handleAddShiftEvent = () => {
    const event = prompt(t('وصف الحدث السريري:', 'Clinical Event Description:'));
    if (!event) return;
    const newNote: ShiftNote = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      event
    };
    setFormData(prev => ({ ...prev, isbar: { ...prev.isbar, shift_notes: [newNote, ...prev.isbar.shift_notes] } }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-primary p-5 text-white flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all">
            <span className="material-symbols-outlined">close</span>
          </button>
          <div>
            <h2 className="text-lg font-black">{formData.name || t('ملف جديد', 'NEW CHART')}</h2>
            <p className="text-[10px] opacity-70 font-black tracking-widest uppercase">Nuraithm Smart Healthcare</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportHandoverPDF(formData, signature)} className="bg-white/10 px-6 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-white/20 transition-all">
            <span className="material-symbols-outlined text-sm">picture_as_pdf</span> PDF
          </button>
          <button onClick={() => onSave(formData)} className="bg-accent-yellow text-primary px-8 py-2 rounded-xl text-xs font-black shadow-xl hover:scale-105 active:scale-95 transition-all">
            {t('حفظ السجل', 'SAVE RECORD')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white dark:bg-slate-900 border-b dark:border-slate-800 overflow-x-auto no-scrollbar shrink-0 px-4">
        {[
          { id: 'id', label: 'Identity', icon: 'badge' },
          { id: 'situation', label: 'Situation', icon: 'medical_information' },
          { id: 'background', label: 'Background', icon: 'history' },
          { id: 'assess', label: 'Assessment', icon: 'stethoscope' },
          { id: 'recs', label: 'Recommendation', icon: 'pending_actions' },
          { id: 'event', label: 'Events', icon: 'timeline' },
          { id: 'meds', label: 'Meds', icon: 'medication' },
          { id: 'labs', label: 'Labs', icon: 'biotech' },
          { id: 'rad', label: 'Radiology', icon: 'radiology' },
          { id: 'reports', label: 'AI Center', icon: 'auto_awesome' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-shrink-0 px-6 py-4 flex flex-col items-center gap-1 border-b-4 transition-all duration-300 ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}>
            <span className="material-symbols-outlined text-xl">{tab.icon}</span>
            <span className="text-[9px] font-black uppercase tracking-tighter">{t(tab.label, tab.label)}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 pb-24">
        
        {/* IDENTITY */}
        {activeTab === 'id' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <InputGroup label="ROOM NO" value={formData.isbar.identification.room_no} onChange={v => updateSection('identification', 'room_no', v)} />
            <InputGroup label="PT NAME" value={formData.isbar.identification.patient_name} onChange={v => updateSection('identification', 'patient_name', v)} />
            <InputGroup label="MRN" value={formData.isbar.identification.mrn} onChange={v => updateSection('identification', 'mrn', v)} />
            <InputGroup label="AGE" value={formData.isbar.identification.age} onChange={v => updateSection('identification', 'age', v)} />
            <InputGroup label="ADMISSION DATE" type="date" value={formData.isbar.identification.admission_date} onChange={v => updateSection('identification', 'admission_date', v)} />
            <InputGroup label="ADMITTED FROM" value={formData.isbar.identification.admitted_from} onChange={v => updateSection('identification', 'admitted_from', v)} />
            <InputGroup label="CONSULTANT" value={formData.isbar.identification.consultant} onChange={v => updateSection('identification', 'consultant', v)} />
          </div>
        )}

        {/* SITUATION */}
        {activeTab === 'situation' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <InputGroup label="CURRENT COMPLAINTS" value={formData.isbar.current_complaints.complaints} isTextArea onChange={v => updateSection('current_complaints', 'complaints', v)} />
            <InputGroup label="DIAGNOSIS" value={formData.isbar.current_complaints.diagnosis} isTextArea onChange={v => updateSection('current_complaints', 'diagnosis', v)} />
            <InputGroup label="DIET" value={formData.isbar.current_complaints.diet} onChange={v => updateSection('current_complaints', 'diet', v)} />
            
            <ListManager 
              label="CONNECTIONS (NAME | DATE)" 
              items={formData.isbar.current_complaints.connections} 
              onAdd={() => {
                const name = prompt(t('اسم الوصلة/اللاين:', 'Connection Name:'));
                if(name) addListItem('current_complaints', 'connections', { id: Date.now().toString(), name, date: new Date().toISOString().split('T')[0] });
              }}
              renderItem={(c) => `${c.name} - ${c.date}`}
            />

            <ListManager 
              label="INFUSIONS (NAME | RATE)" 
              items={formData.isbar.current_complaints.infusions} 
              onAdd={() => {
                const name = prompt(t('اسم الدواء/المحلول:', 'Infusion Name:'));
                const rate = prompt(t('المعدل (ml/hr):', 'Rate:'));
                if(name) addListItem('current_complaints', 'infusions', { id: Date.now().toString(), name, rate: rate || '' });
              }}
              renderItem={(inf) => `${inf.name} @ ${inf.rate}`}
            />
          </div>
        )}

        {/* BACKGROUND */}
        {activeTab === 'background' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <InputGroup label="Hx (Past Medical History)" value={formData.isbar.background.past_medical_history} isTextArea onChange={v => updateSection('background', 'past_medical_history', v)} />
            <InputGroup label="ADMISSION CHIEF COMPLAINT" value={formData.isbar.background.chief_complaint} isTextArea onChange={v => updateSection('background', 'chief_complaint', v)} />
            <InputGroup label="ALLERGY" value={formData.isbar.background.allergy} onChange={v => updateSection('background', 'allergy', v)} />
            <InputGroup label="ISOLATION" value={formData.isbar.background.infections_isolation} onChange={v => updateSection('background', 'infections_isolation', v)} />
          </div>
        )}

        {/* ASSESSMENT */}
        {activeTab === 'assess' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SelectGroup label="GCS" value={formData.isbar.assessment.gcs} options={[...Array(13).keys()].map(i => i+3)} onChange={v => updateSection('assessment', 'gcs', parseInt(v))} />
              <SelectGroup label="FALL RISK" value={formData.isbar.assessment.fall_risk} options={['low', 'moderate', 'high']} onChange={v => updateSection('assessment', 'fall_risk', v)} />
              <SelectGroup label="BEDSORE" value={formData.isbar.assessment.bed_sore} options={['yes', 'no']} onChange={v => updateSection('assessment', 'bed_sore', v)} />
              <SelectGroup label="PHYSICAL RESTRAINT" value={formData.isbar.assessment.physical_restraint} options={['yes', 'no']} onChange={v => updateSection('assessment', 'physical_restraint', v)} />
            </div>
            <InputGroup label="VITALS" value={formData.isbar.assessment.vitals} onChange={v => updateSection('assessment', 'vitals', v)} />
            <InputGroup label="VENTILATION / O2 SUPPORT" value={formData.isbar.assessment.ventilation} onChange={v => updateSection('assessment', 'ventilation', v)} />
            <InputGroup label="SIGNIFICANT FINDINGS" value={formData.isbar.assessment.important_findings} isTextArea onChange={v => updateSection('assessment', 'important_findings', v)} />
          </div>
        )}

        {/* RECOMMENDATION */}
        {activeTab === 'recs' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <InputGroup label="PLAN OF CARE" value={formData.isbar.recommendations.plan_of_care} isTextArea onChange={v => updateSection('recommendations', 'plan_of_care', v)} />
            
            <ListManager label="PHYSICIAN ORDERS (ORDER | STATUS)" items={formData.isbar.recommendations.physician_orders} 
              onAdd={() => {
                const order = prompt(t('أمر الطبيب:', 'Physician Order:'));
                if(order) addListItem('recommendations', 'physician_orders', { id: Date.now().toString(), order, status: 'pending' });
              }}
              renderItem={(o) => `${o.order} - [${o.status.toUpperCase()}]`}
            />

            <ListManager label="CULTURES (C/S | RESULT)" items={formData.isbar.recommendations.cultures} 
              onAdd={() => {
                const type = prompt(t('نوع المزرعة:', 'Culture Type:'));
                const result = prompt(t('النتيجة:', 'Result:'));
                if(type) addListItem('recommendations', 'cultures', { id: Date.now().toString(), type, result: result || 'Pending' });
              }}
              renderItem={(c) => `${c.type}: ${c.result}`}
            />

            <ListManager label="CONSULTATION (NAME | STATUS)" items={formData.isbar.recommendations.consultations} 
              onAdd={() => {
                const name = prompt(t('اسم الاستشارة:', 'Consult Name:'));
                const status = prompt(t('الحالة:', 'Status:'));
                if(name) addListItem('recommendations', 'consultations', { id: Date.now().toString(), name, status: status || 'Called' });
              }}
              renderItem={(con) => `${con.name}: ${con.status}`}
            />

            <InputGroup label="IDENTIFIED RISKS" value={formData.isbar.recommendations.risks} onChange={v => updateSection('recommendations', 'risks', v)} />
          </div>
        )}

        {/* EVENTS */}
        {activeTab === 'event' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest">{t('سجل أحداث الشفت', 'SHIFT EVENT LOG')}</h3>
              <button onClick={handleAddShiftEvent} className="bg-primary text-white px-6 py-2 rounded-xl text-[10px] font-black hover:scale-105 active:scale-95 transition-all">+ LOG EVENT</button>
            </div>
            <div className="space-y-4">
              {formData.isbar.shift_notes.map(note => (
                <div key={note.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border dark:border-slate-800 flex gap-4 animate-in slide-in-from-top-2">
                  <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-lg h-fit">{note.time}</span>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 flex-1">{note.event}</p>
                  <button onClick={() => setFormData(p => ({ ...p, isbar: { ...p.isbar, shift_notes: p.isbar.shift_notes.filter(n => n.id !== note.id) } }))} className="text-red-300 hover:text-red-500 transition-colors">
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MEDICATIONS */}
        {activeTab === 'meds' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <button onClick={handleAddMed} className="bg-primary text-white px-6 py-3 rounded-xl text-xs font-black shadow-lg hover:scale-105 active:scale-95 transition-all">+ ADD MEDICATION</button>
            <div className="space-y-4">
              {formData.medications.map(m => (
                <div key={m.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border dark:border-slate-800 flex justify-between items-center group transition-all hover:border-primary/30">
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white">{m.name}</h4>
                    <p className="text-xs text-slate-500 font-bold">{m.dosage} • {m.frequency}</p>
                  </div>
                  <button onClick={() => setFormData(p => ({ ...p, medications: p.medications.filter(med => med.id !== m.id) }))} className="text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LABS */}
        {activeTab === 'labs' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <button onClick={handleAddLab} className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-xs font-black shadow-lg hover:scale-105 active:scale-95 transition-all">+ ADD LAB RESULT</button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.labs.map(l => (
                <div key={l.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border dark:border-slate-800 group hover:border-emerald-300 transition-all">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-slate-400">{l.date}</span>
                      <button onClick={() => setFormData(p => ({ ...p, labs: p.labs.filter(lb => lb.id !== l.id) }))} className="text-red-400 opacity-0 group-hover:opacity-100"><span className="material-symbols-outlined text-sm">delete</span></button>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-sm dark:text-white uppercase tracking-tight">{l.testName}</span>
                      <span className="text-primary">{l.value} <span className="text-[10px] text-slate-400 uppercase">{l.unit}</span></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RAD */}
        {activeTab === 'rad' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <button onClick={handleAddRad} className="bg-blue-600 text-white px-6 py-3 rounded-xl text-xs font-black shadow-lg hover:scale-105 active:scale-95 transition-all">+ ADD RADIOLOGY</button>
            <div className="space-y-4">
              {formData.radiology.map(r => (
                <div key={r.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 group relative overflow-hidden transition-all hover:border-blue-300">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-black text-primary uppercase text-sm">{r.type}</h4>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-400">{r.date}</span>
                        <button onClick={() => setFormData(p => ({ ...p, radiology: p.radiology.filter(rad => rad.id !== r.id) }))} className="text-red-400 opacity-0 group-hover:opacity-100 transition-all"><span className="material-symbols-outlined text-lg">delete</span></button>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">{r.findings}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, type = "text", isTextArea = false }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase ml-2">{label}</label>
    {isTextArea ? (
      <textarea value={value || ''} onChange={e => onChange(e.target.value)} className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold h-32 focus:ring-2 ring-primary/20 outline-none transition-all dark:text-white shadow-sm" />
    ) : (
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 ring-primary/20 outline-none transition-all dark:text-white shadow-sm" />
    )}
  </div>
);

const SelectGroup = ({ label, value, options, onChange }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase ml-2">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)} className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none dark:text-white shadow-sm">
      {options.map((opt: any) => <option key={opt} value={opt}>{opt.toString().toUpperCase()}</option>)}
    </select>
  </div>
);

const ListManager = ({ label, items, onAdd, renderItem }: any) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-primary/10">
    <div className="flex justify-between items-center mb-4">
      <h4 className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{label}</h4>
      <button onClick={(e) => { e.preventDefault(); onAdd(); }} className="text-primary text-xs font-black bg-primary/5 px-4 py-1.5 rounded-lg hover:bg-primary/10 transition-all flex items-center gap-1">
        <span className="material-symbols-outlined text-sm">add_circle</span> ADD
      </button>
    </div>
    <div className="space-y-2">
      {(items || []).map((it: any) => (
        <div key={it.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold dark:text-slate-200 border dark:border-slate-700/50 flex justify-between items-center">
          <span>{renderItem(it)}</span>
          <span className="material-symbols-outlined text-slate-300 text-sm">check_circle</span>
        </div>
      ))}
      {(!items || items.length === 0) && <p className="text-center py-4 text-xs text-slate-300 font-bold uppercase tracking-tight">{label} IS EMPTY</p>}
    </div>
  </div>
);

export default PatientModal;
