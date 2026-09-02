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

const documentCanvas = document.querySelector('.document-canvas');
const page2Template = document.querySelector('.page.page-2');

const autoGrow = (textarea) => {
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
};

const renderArabicTextWithNormalNumbers = (node, value) => {
  node.replaceChildren();
  const parts = value.split(/([0-9]+)/g);
  parts.forEach((part) => {
    if (!part) return;
    if (/^[0-9]+$/.test(part)) {
      const number = document.createElement('span');
      number.className = 'normal-numbers';
      number.textContent = part;
      node.appendChild(number);
      return;
    }
    node.appendChild(document.createTextNode(part));
  });
};

const setFieldContent = (node, key, value) => {
  const nextValue = value && value.trim() ? value : '';
  if (['legalDescription', 'decisionText', 'activityChangeText'].includes(key)) {
    renderArabicTextWithNormalNumbers(node, nextValue);
  } else {
    node.textContent = nextValue;
  }
};

function updateValue(key, value) {
  state[key] = value;
  const nodes = document.querySelectorAll(`[data-field="${key}"]`);
  nodes.forEach((node) => setFieldContent(node, key, value));
  paginatePage2();
}

function setDocumentStatus(message, isError = false) {
  if (!documentStatus) return;
  documentStatus.textContent = message;
  documentStatus.classList.toggle('pdf-status-error', isError);
}

async function saveDocument() {
  if (!saveDocumentBtn || saveDocumentBtn.disabled) return;
  saveDocumentBtn.disabled = true;
  setDocumentStatus('Saving document...');
  try {
    const response = await fetch('/api/documents/current', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(getCurrentDocumentData())
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(`${payload.message || 'Document save failed'} (HTTP ${response.status})`);
    setDocumentStatus('Document saved successfully.');
  } catch (error) {
    console.error('Document save failed in the browser', error);
    setDocumentStatus(error.message || 'Document save failed.', true);
  } finally {
    saveDocumentBtn.disabled = false;
  }
}

async function loadSavedDocument() {
  try {
    const response = await fetch('/api/documents/current');
    if (response.status === 404) return;
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || `Document load failed (HTTP ${response.status})`);
    Object.entries(payload.data).forEach(([key, value]) => {
      const input = fields[key];
      if (!input) return;
      input.value = value;
      if (input instanceof HTMLTextAreaElement) autoGrow(input);
      updateValue(key, value);
    });
    setDocumentStatus('Saved document reopened.');
  } catch (error) {
    console.error('Document load failed in the browser', error);
    setDocumentStatus(error.message || 'Document load failed.', true);
  }
}

const CONTENT_BLOCKS = [
  { key: 'companyName', wrapper: 'company-name', splittable: false },
  { key: 'legalDescription', wrapper: 'editable-company-info', parent: 'company-details rtl', splittable: true, arabic: true },
  { key: 'activityTitle', wrapper: 'editable-activity-title change-title', parent: 'company-change rtl', splittable: true, arabic: false },
  { key: 'decisionText', wrapper: 'editable-decision-text', parent: 'company-change rtl', splittable: true, arabic: true },
  { key: 'activityChangeText', wrapper: 'editable-activity-text', parent: 'company-change rtl', splittable: true, arabic: true }
];

let measureRoot = null;

function ensureMeasureRoot() {
  if (measureRoot) return measureRoot;

  measureRoot = document.createElement('div');
  measureRoot.id = 'pagination-measure-root';
  measureRoot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(measureRoot);
  return measureRoot;
}

function createMeasurePage(isFirstPage) {
  const page = document.createElement('div');
  page.className = isFirstPage ? 'page page-2 page-measure' : 'page page-continuation page-measure';

  if (isFirstPage) {
    page.innerHTML = `
      <div class="notice-box">
        <div class="notice-title">سينشر هذا الإعلان بالجريدة الرسمية</div>
        <div class="notice-meta">عدد: <span class="gold-text">0000</span></div>
        <div class="notice-meta">بتاريخ: <span class="gold-text">00/00/0000</span></div>
      </div>
      <div class="stamp-right-top" aria-hidden="true"></div>
      <div class="page-2-flow"></div>
    `;
  } else {
    page.innerHTML = '<div class="page-2-flow page-continuation-flow"></div>';
  }

  return page;
}

function createFlowBlock(blockDef, value, key) {
  if (!value) return null;

  if (blockDef.parent) {
    const parent = document.createElement('div');
    parent.className = blockDef.parent;
    const child = document.createElement('div');
    child.className = blockDef.wrapper;
    child.dataset.field = key;
    setFieldContent(child, key, value);
    parent.appendChild(child);
    return parent;
  }

  const el = document.createElement('div');
  el.className = blockDef.wrapper;
  el.dataset.field = key;
  setFieldContent(el, key, value);
  return el;
}

function createLegalDeposit(show) {
  if (!show) return null;
  const el = document.createElement('div');
  el.className = 'legal-deposit rtl';
  el.innerHTML = `
    تم الإيداع القانوني بالمحكمة التجارية
    <div>بالدار البيضاء بتاريخ <span class="normal-number">29</span> يوليوز</div>
    <div><span class="normal-number">2026</span> تحت رقم <span data-field="commercialRegistryNumber">1035954</span></div>
  `;
  return el;
}

function pageContentOverflows(pageEl) {
  const pageRect = pageEl.getBoundingClientRect();
  const limit = pageRect.bottom - 8;
  const flow = pageEl.querySelector('.page-2-flow');
  if (!flow) return false;

  const nodes = flow.querySelectorAll('.company-name, .company-details, .company-change, .legal-deposit');
  for (const node of nodes) {
    const rect = node.getBoundingClientRect();
    if (rect.height > 0 && rect.bottom > limit) return true;
  }
  return false;
}

function clearMeasureRoot() {
  ensureMeasureRoot().replaceChildren();
}

function splitTextToFit(text, fitsFn) {
  if (!text || fitsFn(text)) {
    return { fit: text || '', remainder: '' };
  }

  let low = 0;
  let high = text.length;
  let best = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const candidate = text.slice(0, mid);
    if (fitsFn(candidate)) {
      best = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (best === 0) {
    return { fit: '', remainder: text };
  }

  let splitAt = best;
  const lastNewline = text.lastIndexOf('\n', splitAt);
  if (lastNewline > 0) splitAt = lastNewline + 1;

  const lastSpace = text.lastIndexOf(' ', splitAt);
  if (lastSpace > splitAt * 0.6) splitAt = lastSpace + 1;

  return {
    fit: text.slice(0, splitAt).trimEnd(),
    remainder: text.slice(splitAt).trimStart()
  };
}

function buildPagePlan() {
  const pending = CONTENT_BLOCKS.map((blockDef) => ({
    blockDef,
    value: state[blockDef.key] || ''
  })).filter((item) => item.value.trim());

  const pages = [];
  let pageIndex = 0;

  while (pending.length > 0) {
    const isFirstPage = pageIndex === 0;
    const pagePlan = { isFirstPage, segments: [], showLegalDeposit: false };
    const measurePage = createMeasurePage(isFirstPage);
    ensureMeasureRoot().appendChild(measurePage);
    const flow = measurePage.querySelector('.page-2-flow');

    while (pending.length > 0) {
      const current = pending[0];
      const { blockDef, value } = current;

      const testNode = createFlowBlock(blockDef, value, blockDef.key);
      if (!testNode) {
        pending.shift();
        continue;
      }

      flow.appendChild(testNode);

      if (!pageContentOverflows(measurePage)) {
        pagePlan.segments.push({ blockDef, value });
        pending.shift();
        continue;
      }

      flow.removeChild(testNode);

      if (!blockDef.splittable) {
        break;
      }

      const fitsWithText = (text) => {
        if (!text) return true;
        const node = createFlowBlock(blockDef, text, blockDef.key);
        flow.appendChild(node);
        const fits = !pageContentOverflows(measurePage);
        flow.removeChild(node);
        return fits;
      };

      const { fit, remainder } = splitTextToFit(value, fitsWithText);

      if (fit) {
        pagePlan.segments.push({ blockDef, value: fit });
        pending[0].value = remainder;
        if (!remainder) pending.shift();
      }

      break;
    }

    if (pagePlan.segments.length === 0 && pending.length > 0) {
      pagePlan.segments.push({
        blockDef: pending[0].blockDef,
        value: pending[0].value.slice(0, Math.max(1, pending[0].value.length))
      });
      pending[0].value = pending[0].value.slice(pagePlan.segments[0].value.length).trimStart();
      if (!pending[0].value) pending.shift();
    }

    pages.push(pagePlan);
    pageIndex += 1;

    if (pagePlan.segments.length === 0) break;
  }

  if (pages.length === 0) {
    pages.push({ isFirstPage: true, segments: [], showLegalDeposit: true });
  }

  pages[pages.length - 1].showLegalDeposit = true;
  clearMeasureRoot();
  return pages;
}

function renderFlowSegments(flow, segments, showLegalDeposit) {
  flow.replaceChildren();

  const companyChangeKeys = new Set(['activityTitle', 'decisionText', 'activityChangeText']);
  let companyChangeContainer = null;

  segments.forEach(({ blockDef, value }) => {
    if (companyChangeKeys.has(blockDef.key)) {
      if (!companyChangeContainer) {
        companyChangeContainer = document.createElement('div');
        companyChangeContainer.className = 'company-change rtl';
        flow.appendChild(companyChangeContainer);
      }
      const child = document.createElement('div');
      child.className = blockDef.wrapper;
      child.dataset.field = blockDef.key;
      setFieldContent(child, blockDef.key, value);
      companyChangeContainer.appendChild(child);
      return;
    }

    if (blockDef.parent) {
      const parent = document.createElement('div');
      parent.className = blockDef.parent;
      const child = document.createElement('div');
      child.className = blockDef.wrapper;
      child.dataset.field = blockDef.key;
      setFieldContent(child, blockDef.key, value);
      parent.appendChild(child);
      flow.appendChild(parent);
      return;
    }

    const el = document.createElement('div');
    el.className = blockDef.wrapper;
    el.dataset.field = blockDef.key;
    setFieldContent(el, blockDef.key, value);
    flow.appendChild(el);
  });

  const legalDeposit = createLegalDeposit(showLegalDeposit);
  if (legalDeposit) flow.appendChild(legalDeposit);
}

function renderContinuationPage(plan) {
  const page = document.createElement('div');
  page.className = 'page page-continuation';
  const flow = document.createElement('div');
  flow.className = 'page-2-flow page-continuation-flow';
  renderFlowSegments(flow, plan.segments, plan.showLegalDeposit);
  page.appendChild(flow);
  return page;
}

function paginatePage2() {
  if (!page2Template || !documentCanvas) return;

  documentCanvas.querySelectorAll('.page-continuation').forEach((page) => page.remove());

  const pages = buildPagePlan();
  const firstPlan = pages[0];
  const flow = page2Template.querySelector('.page-2-flow');

  if (flow) {
    renderFlowSegments(flow, firstPlan.segments, firstPlan.showLegalDeposit && pages.length === 1);
  }

  for (let i = 1; i < pages.length; i += 1) {
    documentCanvas.appendChild(renderContinuationPage(pages[i]));
  }
}

Object.entries(fields).forEach(([key, input]) => {
  if (input instanceof HTMLTextAreaElement) {
    autoGrow(input);
  }
  input.addEventListener('input', (event) => {
    if (event.target instanceof HTMLTextAreaElement) {
      autoGrow(event.target);
    }
    updateValue(key, event.target.value);
  });
});

Object.entries(state).forEach(([key, value]) => updateValue(key, value));
loadSavedDocument();

const pdfStatus = document.getElementById('pdfStatus');
const generatePdfBtn = document.getElementById('generatePdfBtn');
const saveDocumentBtn = document.getElementById('saveDocumentBtn');
const documentStatus = document.getElementById('documentStatus');
const pdfResult = document.getElementById('pdfResult');
let generatedPdfUrl = null;

const REQUIRED_PDF_FIELDS = ['companyName', 'journalNumber', 'journalDate', 'legalDescription'];

function setPdfStatus(message, isError = false) {
  if (!pdfStatus) return;
  pdfStatus.textContent = message;
  pdfStatus.classList.toggle('pdf-status-error', isError);
}

function clearPdfResult() {
  if (generatedPdfUrl) {
    URL.revokeObjectURL(generatedPdfUrl);
    generatedPdfUrl = null;
  }
  if (pdfResult) {
    pdfResult.replaceChildren();
    pdfResult.hidden = true;
  }
}

function getCurrentDocumentData() {
  return Object.fromEntries(
    Object.entries(fields).map(([key, input]) => [key, input.value])
  );
}

function validatePdfData() {
  const missing = REQUIRED_PDF_FIELDS.filter((key) => !state[key]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing required field(s): ${missing.join(', ')}`);
  }
}

async function generatePdf() {
  if (!generatePdfBtn || generatePdfBtn.disabled) return;

  try {
    validatePdfData();
  } catch (error) {
    setPdfStatus(error.message, true);
    return;
  }

  generatePdfBtn.disabled = true;
  clearPdfResult();
  setPdfStatus('Generating PDF...');

  try {
    const currentData = getCurrentDocumentData();
    Object.assign(state, currentData);
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentData)
    });

    if (!response.ok) {
      let message = 'PDF generation failed';
      try {
        const payload = await response.json();
        message = payload.message || message;
      } catch (parseError) {
        console.error('PDF request returned a non-JSON error response', {
          status: response.status,
          statusText: response.statusText,
          parseError
        });
      }
      const error = new Error(`${message} (HTTP ${response.status})`);
      console.error('PDF request failed', error);
      throw error;
    }

    const blob = await response.blob();
    const disposition = response.headers.get('Content-Disposition') || '';
    const persistedPdfUrl = response.headers.get('X-PDF-URL');
    const filenameMatch = disposition.match(/filename="([^"]+)"/);
    const filename = filenameMatch ? filenameMatch[1] : 'annonce.pdf';

    generatedPdfUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = generatedPdfUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    if (pdfResult) {
      const viewLink = document.createElement('a');
      viewLink.href = persistedPdfUrl || generatedPdfUrl;
      viewLink.target = '_blank';
      viewLink.rel = 'noopener';
      viewLink.textContent = 'Open / view PDF';
      pdfResult.appendChild(viewLink);
      pdfResult.hidden = false;
    }

    setPdfStatus('PDF generated successfully.');
  } catch (error) {
    console.error('PDF generation failed in the browser', error);
    setPdfStatus(error.message || 'PDF generation failed.', true);
  } finally {
    generatePdfBtn.disabled = false;
  }
}

if (generatePdfBtn) {
  generatePdfBtn.addEventListener('click', generatePdf);
}

if (saveDocumentBtn) {
  saveDocumentBtn.addEventListener('click', saveDocument);
}
