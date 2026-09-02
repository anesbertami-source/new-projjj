const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'output');

const DOCUMENT_FIELDS = [
  'companyName',
  'journalNumber',
  'journalDate',
  'legalDescription',
  'activityTitle',
  'decisionText',
  'activityChangeText',
  'directorName',
  'directorTitle'
];

const REQUIRED_FIELDS = ['companyName', 'journalNumber', 'journalDate', 'legalDescription'];

const MAX_FIELD_LENGTH = 50000;

function sanitizeDocumentData(raw = {}) {
  const data = {};

  for (const key of DOCUMENT_FIELDS) {
    const value = raw[key];
    if (value === undefined || value === null) {
      data[key] = '';
      continue;
    }
    if (typeof value !== 'string') {
      throw new Error(`Invalid field type for ${key}`);
    }
    if (value.length > MAX_FIELD_LENGTH) {
      throw new Error(`Field ${key} exceeds maximum length`);
    }
    data[key] = value;
  }

  for (const key of REQUIRED_FIELDS) {
    if (!data[key].trim()) {
      throw new Error(`Missing required field: ${key}`);
    }
  }

  return data;
}

function buildSafeFilename(data) {
  const journal = String(data.journalNumber || 'document').replace(/[^a-zA-Z0-9_-]/g, '');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `annonce-${journal || 'document'}-${timestamp}.pdf`;
}

async function waitForDocumentReady(page) {
  const resourceStatus = await page.evaluate(async () => {
    await document.fonts.ready;

    const images = Array.from(document.images);
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        });
      })
    );

    return {
      fontsReady: document.fonts.status === 'loaded'
        && document.fonts.check('16px "AlArabiyaLocal"'),
      brokenImages: images
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.currentSrc || img.src)
    };
  });

  if (!resourceStatus.fontsReady) {
    throw new Error('Required document font AlArabiyaLocal is not available');
  }
  if (resourceStatus.brokenImages.length > 0) {
    throw new Error(`Required document image failed to load: ${resourceStatus.brokenImages.join(', ')}`);
  }

  await page.waitForFunction(() => {
    const pages = document.querySelectorAll('.document-canvas .page');
    return pages.length >= 2;
  });

  await page.waitForTimeout(400);
}

async function applyDocumentValues(page, data) {
  await page.evaluate(({ values }) => {
    Object.entries(values).forEach(([id, value]) => {
      const input = document.getElementById(id);
      if (!input) return;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }, { values: data });
}

async function generatePdfBuffer(data, baseUrl) {
  const documentData = sanitizeDocumentData(data);
  const pageUrl = baseUrl
    ? `${baseUrl}/index.html`
    : `file:///${path.join(PROJECT_ROOT, 'index.html').replace(/\\/g, '/')}`;
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(pageUrl, { waitUntil: 'networkidle' });
    await applyDocumentValues(page, documentData);
    await waitForDocumentReady(page);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    return {
      buffer: pdfBuffer,
      filename: buildSafeFilename(documentData),
      documentData
    };
  } finally {
    await browser.close();
  }
}

async function generatePdfFile(data, baseUrl, outputPath) {
  const result = await generatePdfBuffer(data, baseUrl);
  const targetPath = outputPath || path.join(OUTPUT_DIR, result.filename);

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, result.buffer);

  return {
    ...result,
    path: targetPath
  };
}

module.exports = {
  DOCUMENT_FIELDS,
  REQUIRED_FIELDS,
  PROJECT_ROOT,
  OUTPUT_DIR,
  sanitizeDocumentData,
  buildSafeFilename,
  generatePdfBuffer,
  generatePdfFile
};
