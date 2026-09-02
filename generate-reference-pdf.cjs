const { generatePdfFile } = require('./lib/generate-pdf.cjs');

const defaultValues = {
  companyName: 'DELIRIUM',
  journalNumber: '5939',
  journalDate: '26/08/2026',
  legalDescription: `شركة ذات مسؤولية محدودة ذات
الشريك الوحيد

شارع 46 وعنوان مقرها الاجتماعي: casablanca 55

الزرقطوني، الطابق الثالث، شقة رقم

20250-6 الدار البيضاء المغرب

رقم التقييد في السجل التجاري

900000`,
  activityTitle: 'تغيير نشاط الشركة',
  decisionText: `بمقتضى قرار الشريك الوحيد المؤرخ
في 26/08/2026`,
  activityChangeText: `تم تغيير نشاط الشركة من «التصميم والتخطيط « إلى «تنظيم
تغيير النشاط`,
  directorName: 'محمد الدوسي',
  directorTitle: 'مدير المطبعة الرسمية'
};

(async () => {
  const result = await generatePdfFile(defaultValues, null, 'output/reference-test.pdf');
  console.log(result.path);
  console.log(result.filename);
  console.log(`${result.buffer.length} bytes`);
})();
