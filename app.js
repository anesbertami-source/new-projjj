const state = {
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

const fields = {
  companyName: document.getElementById('companyName'),
  journalNumber: document.getElementById('journalNumber'),
  journalDate: document.getElementById('journalDate'),
  legalDescription: document.getElementById('legalDescription'),
  activityTitle: document.getElementById('activityTitle'),
  decisionText: document.getElementById('decisionText'),
  activityChangeText: document.getElementById('activityChangeText'),
  directorName: document.getElementById('directorName'),
  directorTitle: document.getElementById('directorTitle')
};

function updateValue(key, value) {
  state[key] = value;
  const nodes = document.querySelectorAll(`[data-field="${key}"]`);
  nodes.forEach((node) => {
    const nextValue = value && value.trim() ? value : '';
    node.textContent = nextValue;
  });
}

Object.entries(fields).forEach(([key, input]) => {
  input.addEventListener('input', (event) => {
    updateValue(key, event.target.value);
  });
});

Object.entries(state).forEach(([key, value]) => updateValue(key, value));
