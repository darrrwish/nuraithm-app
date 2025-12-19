import { Patient, Language } from './types';

// دالة محاكاة للـ Gemini API في حالة عدم وجود مفتاح API
const mockAIResponse = {
  risks: [
    {
      title: 'خطر سقوط عالي',
      message: 'المريض لديه تقييم خطر سقوط عالي ويحتاج مراقبة مستمرة',
      category: 'hazard'
    }
  ],
  summary: `
  ### الملخص السريري الشامل
  
  **الحالة الحالية:** 
  المريض يعاني من ارتفاع ضغط الدم الحاد مع فشل كلوي.
  
  **التحاليل المهمة:**
  - الكرياتينين: 2.5 mg/dL (مرتفع)
  - البوتاسيوم: 4.2 mmol/L (طبيعي)
  
  **التوصيات:**
  1. مراقبة وظائف الكلى يومياً
  2. متابعة مدخول ومخرجات السوائل
  3. تقييم خطر السقوط المستمر
  `,
  carePlan: {
    headers: ["التشخيص", "الأهداف", "التدخلات", "التقييم"],
    rows: [
      ["فشل القلب الاحتقاني", "تحسين وظيفة القلب", "مراقبة العلامات الحيوية، إعطاء الأدوية", "تحسن في ضيق التنفس"],
      ["فشل كلوي", "تحسين وظائف الكلى", "مراقبة مدخول ومخرجات السوائل", "انخفاض مستوى الكرياتينين"]
    ]
  },
  shiftSummary: `
  ### ملخص الشفت
  
  **الأحداث الرئيسية:**
  - 08:00: تناول الدواء بانتظام
  - 12:00: شكوى من ضيق تنفس متزايد
  - 14:00: تحسن بعد تعديل الأدوية
  
  **التوصيات للشفت القادم:**
  - متابعة العلامات الحيوية كل 4 ساعات
  - مراقبة مدخول ومخرجات السوائل
  `,
  medTable: {
    headers: ["الدواء", "الاستخدام", "الآثار الجانبية", "احتياطات التمريض"],
    rows: [
      ["Furosemide 40mg", "مدر للبول", "جفاف، اختلال الشوارد", "مراقبة الشوارد والضغط"],
      ["Lisinopril 10mg", "خافض للضغط", "سعال، دوخة", "مراقبة الضغط بانتظام"]
    ]
  }
};

export async function analyzeClinicalRisks(patient: Patient, lang: Language): Promise<any[]> {
  // محاكاة للاستجابة في حالة عدم وجود API
  return new Promise(resolve => {
    setTimeout(() => {
      const risks = mockAIResponse.risks.map(risk => ({
        ...risk,
        patientName: patient.name,
        patientId: patient.id
      }));
      resolve(risks);
    }, 500);
  });
}

export async function generateComprehensiveSummary(patient: Patient, lang: Language): Promise<string> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(lang === 'ar' ? mockAIResponse.summary : mockAIResponse.summary);
    }, 1000);
  });
}

export async function generateNurseCarePlan(patient: Patient, lang: Language): Promise<any> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockAIResponse.carePlan);
    }, 800);
  });
}

export async function generateShiftSummary(patient: Patient, lang: Language): Promise<string> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(lang === 'ar' ? mockAIResponse.shiftSummary : mockAIResponse.shiftSummary);
    }, 600);
  });
}

export async function generateSmartMedTableData(patient: Patient, lang: Language): Promise<any> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockAIResponse.medTable);
    }, 700);
  });
}