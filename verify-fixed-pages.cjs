const { chromium } = require('playwright');
const fs = require('fs');

const testCases = [
  {
    name: 'fixed-height-short',
    description: 'Short content with fixed page height',
    values: {
      companyName: 'DELIRIUM',
      journalNumber: '5939',
      journalDate: '26/08/2026',
      legalDescription: 'شركة ذات مسؤولية محدودة',
      activityTitle: 'تغيير النشاط',
      decisionText: 'بمقتضى قرار الشريك الوحيد',
      activityChangeText: 'تم التغيير',
      directorName: 'محمد الدوسي',
      directorTitle: 'مدير المطبعة'
    }
  },
  {
    name: 'fixed-height-long',
    description: 'Very long content with fixed A4 page height',
    values: {
      companyName: 'DELIRIUM',
      journalNumber: '5939',
      journalDate: '26/08/2026',
      legalDescription: `شركة ذات مسؤولية محدودة ذات الشريك الوحيد
شارع 46 وعنوان مقرها الاجتماعي: casablanca 55
الزرقطوني، الطابق الثالث، شقة رقم
20250-6 الدار البيضاء المغرب
رقم التقييد في السجل التجاري
900000

معلومات الشركة الشاملة والتفاصيل الكاملة:
تاريخ التأسيس: 01/01/2020
رقم التسجيل الضريبي: 123456789
رقم السجل التجاري: 987654321
النشاط السابق الأساسي: التصميم والتخطيط والاستشارات الهندسية والمعمارية
النشاط الثانوي السابق: الدراسات الفنية والمسوحات الهندسية
النشاط الجديد الأساسي: تنظيم الفعاليات والمناسبات والمؤتمرات والندوات والحفلات
النشاط الثانوي الجديد: الإنتاج الإعلامي والتصوير الفوتوغرافي والفيديو
المقر الرئيسي: الدار البيضاء - حي الريان
المقرات الفرعية: الرباط - فاس - مراكش
عدد الموظفين الحاليين: 15
عدد الموظفين المتوقع بعد التغيير: 25
رأس المال المصرح به: 500,000 درهم
رأس المال المدفوع: 500,000 درهم
حالة الشركة: نشطة وسارية العمل
آخر تحديث: 26/08/2026
الحالة الضريبية: ملتزمة بجميع الالتزامات`,
      activityTitle: 'تغيير نشاط الشركة وتحديث شامل للبيانات',
      decisionText: `بمقتضى قرار الشريك الوحيد المؤرخ في 26/08/2026
وبعد الموافقة من جميع الجهات المعنية والجهات الحكومية
وتصديق الجهات المختصة على هذا التغيير
والالتزام بجميع الإجراءات القانونية المطلوبة`,
      activityChangeText: `تم تغيير نشاط الشركة من «التصميم والتخطيط والاستشارات الهندسية» إلى «تنظيم الفعاليات والمناسبات والمؤتمرات والندوات»
مع الحفاظ على جميع الحقوق والالتزامات السابقة والعقود المبرمة
يتم الاحتفاظ بجميع الأصول والخصوم الحالية للشركة
سيتم تحديث السجلات الحكومية والضريبية وفقاً لهذا التغيير
جميع الموظفين الحاليين سيتم الاحتفاظ بهم مع نفس الشروط والمزايا`,
      directorName: 'محمد الدوسي',
      directorTitle: 'مدير المطبعة الرسمية'
    }
  }
];

async function generateTestPDF(testCase) {
  console.log(`\n📄 Generating PDF for: ${testCase.name}`);
  console.log(`   Description: ${testCase.description}`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  
  try {
    await page.goto('file:///C:/Users/anesb/Documents/new-projjj/index.html');
    await page.evaluate(() => document.fonts.ready);
    
    // Set the test values
    await page.evaluate(({ values }) => {
      Object.entries(values).forEach(([id, value]) => {
        const input = document.getElementById(id);
        if (input) {
          input.value = value;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    }, { values: testCase.values });

    // Wait for content to render
    await page.waitForTimeout(500);

    const outputPath = `output/verify-${testCase.name}.pdf`;
    
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    const stats = fs.statSync(outputPath);
    console.log(`   ✓ PDF generated: ${outputPath}`);
    console.log(`   ✓ File size: ${(stats.size / 1024).toFixed(2)} KB`);

    return outputPath;
  } catch (error) {
    console.error(`   ✗ Error generating PDF:`, error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

(async () => {
  console.log('🧪 Testing Fixed-Height Page Separation\n');
  console.log('Each page must be exactly A4 (210mm × 297mm)');
  console.log('Content exceeding Page 2 should flow to Page 3 (new separate page)\n');

  try {
    for (const testCase of testCases) {
      await generateTestPDF(testCase);
    }

    console.log('\n✅ PDFs generated successfully!');
    console.log('\nVerification checklist:');
    console.log('1. verify-fixed-height-short.pdf');
    console.log('   → Should have Page 1 + Page 2 (exactly 2 pages)');
    console.log('   → Page 1 should be visually separate from Page 2');
    console.log('   → Page 2 should not exceed A4 boundaries');
    console.log('');
    console.log('2. verify-fixed-height-long.pdf');
    console.log('   → Should have Page 1 + Page 2 + Page 3 (and possibly Page 4)');
    console.log('   → Each page must be a separate A4 page');
    console.log('   → No content should be clipped');
    console.log('   → No page should be infinitely tall');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
})();
