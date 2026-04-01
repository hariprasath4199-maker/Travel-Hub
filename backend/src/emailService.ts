import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { EmailLog } from './types.js';

const ROOT_DIR = path.resolve(import.meta.dirname, '..', '..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'output');

function readJsonFile<T>(filePath: string): T {
  try {
    const content = fs.readFileSync(filePath, 'utf-8').trim();
    return content ? JSON.parse(content) : [];
  } catch { return [] as unknown as T; }
}

function writeJsonFile(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

const smtpHost = process.env.SMTP_HOST;
const isDevMode = !smtpHost;

let transporter: nodemailer.Transporter | null = null;
if (!isDevMode) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  requestId: string;
  templateName: string;
}): Promise<void> {
  const logEntry: EmailLog = {
    id: uuidv4(),
    requestId: opts.requestId,
    to: opts.to,
    subject: opts.subject,
    sentAt: new Date().toISOString(),
    templateName: opts.templateName,
    status: 'DEV_LOGGED',
  };

  if (isDevMode) {
    console.log(`\n📧 [DEV EMAIL] To: ${opts.to}`);
    console.log(`   Subject: ${opts.subject}`);
    console.log(`   Template: ${opts.templateName}`);
    console.log(`   Request: ${opts.requestId}\n`);
    logEntry.status = 'DEV_LOGGED';
  } else {
    try {
      await transporter!.sendMail({
        from: process.env.SMTP_FROM || 'Zalaris Travel <noreply@zalaris.com>',
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      });
      logEntry.status = 'SENT';
    } catch (err: any) {
      logEntry.status = 'FAILED';
      logEntry.error = err.message;
      console.error(`Email send failed: ${err.message}`);
    }
  }

  // Log to email_log.txt
  const logPath = path.join(OUTPUT_DIR, 'email_log.txt');
  const logs = readJsonFile<EmailLog[]>(logPath);
  logs.push(logEntry);
  writeJsonFile(logPath, logs);
}
