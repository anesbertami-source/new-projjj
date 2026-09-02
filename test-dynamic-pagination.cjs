const { chromium } = require('playwright');
const fs = require('fs');

const testCases = [
  {
    name: 'short-content',
    description: 'Short default content',
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
    name: 'medium-content',
    description: 'Medium length content (~500 words)',
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

معلومات إضافية:
النشاط السابق: التصميم والتخطيط
النشاط الجديد: تنظيم الفعاليات
تاريخ التغيير: 26/08/2026
رقم القرار: 001
المصادقة: موافق
الشروط: لا توجد شروط إضافية
التوقيع: تم`,
      activityTitle: 'تغيير نشاط الشركة',
      decisionText: `بمقتضى قرار الشريك الوحيد المؤرخ في 26/08/2026
وبعد الموافقة من جميع الجهات المعنية`,
      activityChangeText: `تم تغيير نشاط الشركة من «التصميم والتخطيط » إلى «تنظيم الفعاليات والمناسبات»
مع الحفاظ على جميع الحقوق والالتزامات السابقة`,
      directorName: 'محمد الدوسي',
      directorTitle: 'مدير المطبعة الرسمية'
    }
  },
  {
    name: 'long-content',
    description: 'Long content (~1000 words, should exceed 2 pages)',
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

معلومات الشركة الكاملة:
تاريخ التأسيس: 01/01/2020
رقم التسجيل الضريبي: 123456789
رقم السجل التجاري: 987654321
النشاط السابق: التصميم والتخطيط والاستشارات الهندسية
النشاط الجديد: تنظيم الفعاليات والمناسبات والمؤتمرات
المقر الرئيسي: الدار البيضاء
عدد الموظفين: 15
رأس المال: 500,000 درهم
حالة الشركة: نشطة
آخر تحديث: 26/08/2026

التفاصيل الإضافية:
تم تأسيس الشركة بناءً على قرار من الشريك الوحيد
تتمتع الشركة بجميع الحقوق والالتزامات المترتبة على هذا التغيير
يتم الالتزام بجميع القوانين واللوائح المعمول بها
تم إخطار جميع الجهات المسؤولة بهذا التغيير`,
      activityTitle: 'تغيير نشاط الشركة وتحديث البيانات الأساسية',
      decisionText: `بمقتضى قرار الشريك الوحيد المؤرخ في 26/08/2026
وبعد الموافقة من جميع الجهات المعنية والجهات الحكومية
وتصديق الجهات المختصة على هذا التغيير
والالتزام بجميع الإجراءات القانونية المطلوبة`,
      activityChangeText: `تم تغيير نشاط الشركة من «التصميم والتخطيط والاستشارات الهندسية» إلى «تنظيم الفعاليات والمناسبات والمؤتمرات والندوات»
مع الحفاظ على جميع الحقوق والالتزامات السابقة والعقود المبرمة مع العملاء والموردين
يتم الاحتفاظ بجميع الأصول والخصوم الحالية للشركة
سيتم تحديث السجلات الحكومية والضريبية وفقاً لهذا التغيير
جميع الموظفين الحاليين سيتم الاحتفاظ بهم مع نفس الشروط والمزايا`,
      directorName: 'محمد الدوسي',
      directorTitle: 'مدير المطبعة الرسمية'
    }
  },
  {
    name: 'very-long-content',
    description: 'Very long content (~2000 words, should create 4+ pages)',
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
الحالة الضريبية: ملتزمة بجميع الالتزامات

التفاصيل القانونية والإجراءات:
تم تأسيس الشركة بناءً على قرار من الشريك الوحيد وفقاً للقانون المعمول به
تتمتع الشركة بجميع الحقوق والالتزامات المترتبة على هذا التغيير
يتم الالتزام الكامل بجميع القوانين واللوائح المعمول بها في المملكة المغربية
تم إخطار جميع الجهات المسؤولة بهذا التغيير بشكل رسمي
تم استيفاء جميع الشروط والمتطلبات الإدارية والقانونية
الشركة مسؤولة عن جميع الالتزامات المترتبة على التغيير
تم توثيق جميع الإجراءات بشكل رسمي وفقاً للأحكام القانونية

الحقوق والالتزامات:
الحفاظ على جميع الحقوق والالتزامات السابقة والعقود المبرمة مع العملاء والموردين
استمرار جميع الخطوط الائتمانية والاتفاقيات المصرفية
الالتزام بسداد جميع الالتزامات المالية والضريبية
الاحتفاظ بجميع الأصول والخصوم الحالية للشركة
تحديث السجلات الحكومية والضريبية وفقاً لهذا التغيير
الاحتفاظ بجميع الموظفين الحاليين مع نفس الشروط والمزايا
ضمان استمرارية العمل بدون انقطاع`,
      activityTitle: 'تغيير نشاط الشركة وتحديث شامل للبيانات الأساسية والعمليات',
      decisionText: `بمقتضى قرار الشريك الوحيد المؤرخ في 26/08/2026 والساعة 10:30 صباحاً
وبعد الموافقة من جميع الجهات المعنية والجهات الحكومية والبلديات المحلية
وتصديق الجهات المختصة على هذا التغيير من وزارة الصناعة والتجارة
والالتزام بجميع الإجراءات القانونية المطلوبة وفقاً للقوانين الجديدة
والحصول على جميع التصاريح والموافقات اللازمة من الجهات المختصة`,
      activityChangeText: `تم تغيير نشاط الشركة من «التصميم والتخطيط والاستشارات الهندسية والمعمارية والدراسات الفنية» إلى «تنظيم الفعاليات والمناسبات والمؤتمرات والندوات والحفلات والإنتاج الإعلامي والتصوير الفوتوغرافي والفيديو»
مع الحفاظ الكامل على جميع الحقوق والالتزامات السابقة والعقود المبرمة مع العملاء والموردين والمتعاقدين من الباطن
يتم الاحتفاظ بجميع الأصول والخصوم الحالية للشركة دون أي تغيير أو تأثر
سيتم تحديث السجلات الحكومية والضريبية والتجارية وفقاً لهذا التغيير في المدة المحددة
جميع الموظفين الحاليين سيتم الاحتفاظ بهم مع نفس الشروط والمزايا والعقود الموقعة
توظيف موظفين إضافيين من ذوي الاختصاص في مجالات الفعاليات والإنتاج الإعلامي
تحديث البنية التحتية والمعدات المستخدمة للتكيف مع النشاط الجديد
ضمان الجودة والالتزام بمعايير الخدمة العالمية`,
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

    const outputPath = `output/test-${testCase.name}.pdf`;
    
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
  console.log('🧪 Testing PDF Pagination with Dynamic Content\n');
  console.log('This test generates PDFs with different content lengths');
  console.log('and verifies that page count increases automatically.\n');

  try {
    for (const testCase of testCases) {
      await generateTestPDF(testCase);
    }

    console.log('\n✅ All PDFs generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Open each PDF in Adobe Reader or browser');
    console.log('2. Check the page count for each:');
    console.log('   - test-short-content.pdf (should be 2 pages)');
    console.log('   - test-medium-content.pdf (should be 3-4 pages)');
    console.log('   - test-long-content.pdf (should be 4-5 pages)');
    console.log('   - test-very-long-content.pdf (should be 5-8 pages)');
    console.log('3. If page counts increase with content, pagination is working!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
})();
