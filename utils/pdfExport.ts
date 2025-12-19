
export const exportHandoverPDF = (patient: any, signature: string = "Nurse. Ahmed Khaled") => {
  const { jsPDF } = (window as any).jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');
  const isbar = patient.isbar;

  const primaryColor = [67, 78, 120];
  const secondaryColor = [96, 123, 143];

  // Header Box
  doc.setFillColor(...primaryColor); 
  doc.rect(0, 0, 210, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("Nuraithm CLINICAL HANDOVER REPORT", 105, 12, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 18, { align: "center" });

  // Identification Section
  doc.autoTable({
    startY: 30,
    head: [['PATIENT IDENTIFICATION', 'DATA']],
    body: [
      ['Full Name', isbar.identification.patient_name || patient.name || 'N/A'],
      ['MRN Number', isbar.identification.mrn || patient.fileNumber || 'N/A'],
      ['Room Number', isbar.identification.room_no || patient.roomNumber || 'N/A'],
      ['Age / Gender', isbar.identification.age || patient.age || 'N/A'],
      ['Admission Date', isbar.identification.admission_date || 'N/A'],
      ['Consultant', isbar.identification.consultant || 'N/A'],
    ],
    theme: 'grid',
    headStyles: { fillColor: primaryColor, fontSize: 10, halign: 'center' },
    styles: { fontSize: 9 }
  });

  // Clinical Situation
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 5,
    head: [['CLINICAL SITUATION', 'DETAILS']],
    body: [
      ['Primary Diagnosis', isbar.current_complaints.diagnosis || patient.diagnosis || 'N/A'],
      ['Medications Count', patient.medications.length.toString()],
      ['Continuous Infusions', isbar.current_complaints.infusions.map((inf:any) => `${inf.drug_name} (${inf.rate})`).join(', ') || 'None'],
      ['Allergy Status', isbar.background.allergy || 'None reported'],
      ['Isolation Needs', isbar.background.infections_isolation || 'No isolation required'],
    ],
    theme: 'grid',
    headStyles: { fillColor: secondaryColor, fontSize: 10, halign: 'center' },
    styles: { fontSize: 9 }
  });

  // Assessment
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 5,
    head: [['ASSESSMENT & FINDINGS', 'OBSERVATION']],
    body: [
      ['GCS Score', isbar.assessment.gcs || '15'],
      ['Vital Signs', isbar.assessment.vitals || 'N/A'],
      ['Resp Support', isbar.assessment.ventilation || 'Room Air'],
      ['Skin/Dressings', isbar.assessment.skin_assessment || 'Intact'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [233, 127, 74], fontSize: 10, halign: 'center' },
    styles: { fontSize: 9 }
  });

  // Recommendation & Plan
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 5,
    head: [['RECOMMENDATIONS & PLAN', 'ORDERS']],
    body: [
      ['Plan of Care', isbar.plan_of_care || 'Continue management'],
      ['Patient Risks', isbar.recommendations.risks || 'N/A'],
      ['Points to Follow', isbar.recommendations.points_to_follow || 'N/A'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [46, 125, 50], fontSize: 10, halign: 'center' },
    styles: { fontSize: 9 }
  });

  // Signatures Footer
  const finalY = doc.lastAutoTable.finalY + 20;
  doc.setDrawColor(200, 200, 200);
  doc.line(15, finalY - 5, 195, finalY - 5);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Handover Date/Time: ${isbar.nursing.handover_date} @ ${isbar.nursing.handover_time}`, 15, finalY);
  doc.text(`Outgoing Nurse: ${isbar.nursing.outgoing_nurse || signature}`, 15, finalY + 10);
  doc.text(`Receiving Nurse: ${isbar.nursing.receiving_nurse || '___________________'}`, 15, finalY + 20);
  
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Nuraithm Smart Medical Systems - AI Certified Record", 105, 285, { align: "center" });

  doc.save(`Handover_${isbar.identification.mrn || patient.fileNumber}_${Date.now()}.pdf`);
};

export const exportReportPDF = (title: string, content: string, fileName: string, signature: string = "Nurse. Ahmed Khaled", tableData?: { headers: string[], rows: string[][] }) => {
  const { jsPDF } = (window as any).jspdf;
  const doc = new jsPDF();
  
  doc.setFillColor(67, 78, 120);
  doc.rect(0, 0, 210, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text(title.toUpperCase(), 105, 14, { align: "center" });
  doc.setFontSize(8);
  doc.text(`Clinical Report Generated: ${new Date().toLocaleString()}`, 105, 20, { align: "center" });
  
  if (tableData) {
    doc.autoTable({
      startY: 30,
      head: [tableData.headers],
      body: tableData.rows,
      theme: 'grid',
      headStyles: { fillColor: [67, 78, 120], fontSize: 9, halign: 'center' },
      styles: { fontSize: 8 },
      margin: { top: 30 },
      pageBreak: 'auto'
    });
  } else {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(content, 180);
    doc.text(splitText, 15, 40);
  }
  
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 100;
  doc.setFontSize(10);
  doc.setTextColor(0,0,0);
  doc.text(`Clinician Signature: ${signature}`, 15, Math.min(finalY, 270));
  
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text("Nuraithm Clinical AI Intelligence - Medical Record.", 105, 290, { align: "center" });

  doc.save(`${fileName}_${Date.now()}.pdf`);
};
