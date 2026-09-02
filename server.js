const express = require('express');
const fs = require('fs');
const path = require('path');
const { generatePdfFile, PROJECT_ROOT, sanitizeDocumentData } = require('./lib/generate-pdf.cjs');

const app = express();
const PORT = process.env.PORT || 3000;
const DOCUMENTS_DIR = path.join(PROJECT_ROOT, 'data');
const DOCUMENTS_FILE = path.join(DOCUMENTS_DIR, 'documents.json');

app.use(express.json({ limit: '1mb' }));
app.use(express.static(PROJECT_ROOT));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

function readDocuments() {
  if (!fs.existsSync(DOCUMENTS_FILE)) return {};
  return JSON.parse(fs.readFileSync(DOCUMENTS_FILE, 'utf8'));
}

function writeDocuments(documents) {
  fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
  fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(documents, null, 2), 'utf8');
}

app.get('/api/documents/current', (_req, res) => {
  const documentData = readDocuments().current;
  if (!documentData) return res.status(404).json({ error: true, message: 'No saved document found' });
  res.json({ id: 'current', data: documentData });
});

app.put('/api/documents/current', (req, res) => {
  try {
    const documentData = sanitizeDocumentData(req.body);
    const documents = readDocuments();
    documents.current = documentData;
    writeDocuments(documents);
    res.json({ id: 'current', data: documentData });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message.startsWith('Missing required field')
      || message.startsWith('Invalid field')
      || message.startsWith('Field ')
      ? 400
      : 500;
    console.error('Document save failed:', error instanceof Error ? error.stack : error);
    res.status(status).json({ error: true, message: message || 'Document save failed' });
  }
});

app.post('/api/generate-pdf', async (req, res) => {
  console.log('PDF ROUTE HIT', req.method, req.path);
  try {
    const documentData = sanitizeDocumentData(req.body);
    const baseUrl = `http://127.0.0.1:${PORT}`;
    const { buffer, filename } = await generatePdfFile(documentData, baseUrl);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('X-PDF-URL', `/output/${encodeURIComponent(filename)}`);
    res.send(buffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message.startsWith('Missing required field')
      || message.startsWith('Invalid field')
      || message.startsWith('Field ')
      ? 400
      : 500;

    console.error('PDF generation failed:', error instanceof Error ? error.stack : error);
    res.status(status).json({
      error: true,
      message: message || 'PDF generation failed'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Document editor running at http://127.0.0.1:${PORT}`);
});
