const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const pypdf = require('pypdf');

const PROJECT_ROOT = __dirname;
const PORT = process.env.PORT || 3000;
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'output');

const testCases = [
  {
    name: 'normal',
    description: 'Normal document (2 pages expected)',
    data: {
      companyName: 'DELIRIUM',
      journalNumber: '5939',
      journalDate: '26/08/2026',
      legalDescription: 'شركة ذات مسؤولية محدودة ذات الشريك الوحيد',
      activityTitle: 'تغيير نشاط الشركة',
      decisionText: 'بمقتضى قرار الشريك الوحيد المؤرخ في 26/08/2026',
      activityChangeText: 'تم تغيير نشاط الشركة',
      directorName: 'محمد الدوسي',
      directorTitle: 'مدير المطبعة الرسمية'
    },
    minPages: 2
  },
  {
    name: 'long-page-2',
    description: 'Long Page 2 content (3+ pages expected)',
    data: {
      companyName: 'DELIRIUM',
      journalNumber: '5939',
      journalDate: '26/08/2026',
      legalDescription: Array(40).fill('سطر طويل من النص العربي للاختبار 12345').join('\n'),
      activityTitle: 'تغيير نشاط الشركة',
      decisionText: 'بمقتضى قرار الشريك الوحيد',
      activityChangeText: 'تم تغيير نشاط الشركة',
      directorName: 'محمد الدوسي',
      directorTitle: 'مدير المطبعة الرسمية'
    },
    minPages: 3
  },
  {
    name: 'very-long',
    description: 'Very long content (4+ pages expected)',
    data: {
      companyName: 'DELIRIUM',
      journalNumber: '5939',
      journalDate: '26/08/2026',
      legalDescription: Array(100).fill('نص عربي طويل جدا للاختبار 999').join('\n'),
      activityTitle: 'تغيير نشاط الشركة',
      decisionText: Array(20).fill('قرار الشريك الوحيد').join('\n'),
      activityChangeText: Array(30).fill('تغيير النشاط').join('\n'),
      directorName: 'محمد الدوسي',
      directorTitle: 'مدير المطبعة الرسمية'
    },
    minPages: 4
  }
];

function waitForServer(maxAttempts = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const check = () => {
      attempts += 1;
      const req = http.get(`http://127.0.0.1:${PORT}/api/health`, (res) => {
        res.resume();
        if (res.statusCode === 200) resolve();
        else if (attempts >= maxAttempts) reject(new Error('Server health check failed'));
        else setTimeout(check, 500);
      });

      req.on('error', () => {
        if (attempts >= maxAttempts) reject(new Error('Server did not start'));
        else setTimeout(check, 500);
      });
    };

    check();
  });
}

function postGeneratePdf(data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/generate-pdf',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const body = Buffer.concat(chunks);
          resolve({ statusCode: res.statusCode, body, headers: res.headers });
        });
      }
    );

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function getPdfPageCount(filePath) {
  const reader = new pypdf.PdfReader(filePath);
  return reader.pages.length;
}

function getPdfPageSize(filePath) {
  const reader = new pypdf.PdfReader(filePath);
  const page = reader.pages[0];
  const box = page.mediabox;
  return {
    widthPt: Number(box.width),
    heightPt: Number(box.height)
  };
}

(async () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const server = spawn(process.execPath, ['server.js'], {
    cwd: PROJECT_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: String(PORT) }
  });

  server.stdout.on('data', (chunk) => process.stdout.write(chunk));
  server.stderr.on('data', (chunk) => process.stderr.write(chunk));

  try {
    await waitForServer();
    console.log('API PDF generation tests\n');

    let passed = 0;

    for (const testCase of testCases) {
      const response = await postGeneratePdf(testCase.data);
      const outputPath = path.join(OUTPUT_DIR, `api-test-${testCase.name}.pdf`);

      if (response.statusCode !== 200) {
        console.log(`FAIL ${testCase.name}: HTTP ${response.statusCode}`);
        console.log(response.body.toString('utf8'));
        continue;
      }

      fs.writeFileSync(outputPath, response.body);
      const pageCount = getPdfPageCount(outputPath);
      const pageSize = getPdfPageSize(outputPath);
      const ok = pageCount >= testCase.minPages;

      console.log(`${ok ? 'PASS' : 'FAIL'} ${testCase.name}`);
      console.log(`  ${testCase.description}`);
      console.log(`  Pages: ${pageCount} (min ${testCase.minPages})`);
      console.log(`  Size: ${pageSize.widthPt.toFixed(1)} x ${pageSize.heightPt.toFixed(1)} pt`);
      console.log(`  File: ${outputPath}`);

      if (ok) passed += 1;
    }

    console.log(`\n${passed}/${testCases.length} API tests passed`);
    process.exitCode = passed === testCases.length ? 0 : 1;
  } finally {
    server.kill();
  }
})();
