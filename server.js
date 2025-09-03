import express from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Multer for handling multiple files (Excel + Resume)
const upload = multer({ dest: 'uploads/' });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('views'));

// ---------- UI ----------
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// ---------- Gmail Transporter ----------
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'abhibharti365@gmail.com',
    pass: 'iftr glgt qxyd ykbj', // App password
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 500,
});

transporter.verify()
  .then(() => console.log('✅ SMTP ready'))
  .catch(err => console.error('❌ SMTP error:', err.message));

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function applyTemplate(str, data) {
  if (!str) return '';
  return str.replace(/{{\s*(\w+)\s*}}/g, (_, k) => (data[k] ?? ''));
}

// ---------- Bulk Sender ----------
app.post(
  '/send-bulk',
  upload.fields([{ name: 'file', maxCount: 1 }, { name: 'resume', maxCount: 1 }]),
  async (req, res) => {
    const { subject, body, delayMs = 200 } = req.body;
    const excelFile = req.files?.file?.[0];
    const resumeFile = req.files?.resume?.[0];

    if (!excelFile) return res.status(400).json({ ok: false, error: 'No Excel file uploaded' });

    try {
      const wb = xlsx.readFile(excelFile.path);
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: true });

      // Remove temp excel file
      fs.unlink(excelFile.path, () => {});

      const dataRows = rows.slice(1); // Skip header row
      const results = [];
      let successCount = 0;
      let errorCount = 0;

      console.log(`🚀 Starting bulk send: ${dataRows.length} emails to send...`);

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        if (row.length < 3) continue;

        const company = row[0] || '';
        const email = row[1] || '';

        if (!email || !email.includes('@')) {
          console.log(`❌ Skipped row ${i + 2}: Invalid email`);
          results.push({ row: i + 2, status: 'error', message: 'Invalid email' });
          errorCount++;
          continue;
        }

        try {
          const personalizedSubject = applyTemplate(subject, { company });
          const personalizedBody = applyTemplate(body, { company });
          const htmlBody = personalizedBody.replace(/\n/g, '<br/>');

          const mailOptions = {
            from: 'Abhishek Bharti <abhibharti365@gmail.com>',
            to: email,
            subject: personalizedSubject,
            html: htmlBody,
          };

          // Attach resume if uploaded
          if (resumeFile) {
            mailOptions.attachments = [
              {
                filename: resumeFile.originalname || 'resume.pdf',
                path: resumeFile.path,
              },
            ];
          }

          await transporter.sendMail(mailOptions);

          console.log(`✅ Sent email ${i + 1}/${dataRows.length} → ${email}`);
          results.push({ row: i + 2, status: 'success', email, company });
          successCount++;
        } catch (err) {
          console.log(`❌ Failed email ${i + 1}/${dataRows.length} → ${email} | Error: ${err.message}`);
          results.push({ row: i + 2, status: 'error', message: err.message, email });
          errorCount++;
        }

        if (i < dataRows.length - 1 && delayMs > 0) {
          await sleep(parseInt(delayMs));
        }
      }

      // Clean resume temp file if uploaded
      if (resumeFile) fs.unlink(resumeFile.path, () => {});

      console.log(`\n📊 Summary → Total: ${dataRows.length}, Success: ${successCount}, Failed: ${errorCount}`);

      res.json({
        ok: true,
        total: dataRows.length,
        success: successCount,
        errors: errorCount,
        results,
      });
    } catch (err) {
      console.error('❌ Bulk send error:', err);
      res.status(500).json({ ok: false, error: err.message });
    }
  }
);

// Start server
app.listen(PORT, () => console.log(`Server running → http://localhost:${PORT}`));
