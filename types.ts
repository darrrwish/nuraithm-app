
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route?: string;
  startDate?: string;
  notes?: string;
}

export interface Connection {
  id: string;
  name: string;
  date: string;
}

export interface Infusion {
  id: string;
  name: string;
  rate: string;
}

export interface PhysicianOrder {
  id: string;
  order: string;
  status: 'pending' | 'completed';
}

export interface CultureResult {
  id: string;
  type: string;
  result: string;
}

export interface Consultation {
  id: string;
  name: string;
  status: string;
}

export interface LabResult {
  id: string;
  testName: string;
  date: string;
  value: string;
  unit: string;
}

export interface RadiologyReport {
  id: string;
  type: string;
  date: string;
  findings: string;
}

export interface Report {
  id: string;
  title: string;
  type: string;
  content: string;
  createdAt: string;
  isTable?: boolean;
  tableData?: {
    headers: string[];
    rows: string[][];
  };
}

export interface ShiftNote {
  id: string;
  time: string;
  event: string;
  category?: string;
}

export interface ISBARData {
  identification: {
    room_no: string;
    patient_name: string;
    mrn: string;
    age: string;
    admission_date: string;
    admitted_from: string;
    consultant: string;
  };
  background: {
    past_medical_history: string;
    chief_complaint: string;
    allergy: string;
    infections_isolation: string;
  };
  current_complaints: {
    complaints: string;
    diagnosis: string;
    connections: Connection[];
    infusions: Infusion[];
    diet: string;
  };
  assessment: {
    gcs: number;
    fall_risk: 'low' | 'moderate' | 'high';
    vitals: string;
    ventilation: string;
    bed_sore: 'yes' | 'no';
    physical_restraint: 'yes' | 'no';
    important_findings: string;
  };
  recommendations: {
    plan_of_care: string;
    physician_orders: PhysicianOrder[];
    cultures: CultureResult[];
    consultations: Consultation[];
    risks: string;
  };
  nursing: {
    outgoing_nurse: string;
    receiving_nurse: string;
    handover_date: string;
    handover_time: string;
  };
  shift_notes: ShiftNote[];
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  category: 'hazard' | 'warning' | 'tip' | 'learning';
  timestamp: string;
  read: boolean;
  patientName: string;
  patientId: number;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  patientId: number;
  patientName: string;
}

export interface Patient {
  id: number;
  name: string;
  fileNumber: string;
  age: string;
  roomNumber: string;
  diagnosis: string;
  status: 'active' | 'discharged';
  createdAt: string;
  updatedAt: string;
  isbar: ISBARData;
  medications: Medication[];
  reports: Report[];
  labs: LabResult[];
  radiology: RadiologyReport[];
  todos: Todo[];
}

export type Language = 'ar' | 'en';
