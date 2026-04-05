import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

// Route modules
import visaRequestsRouter from './routes/visaRequests.js';
import uploadRouter from './routes/upload.js';
import usersRouter from './routes/users.js';
import actionsRouter from './routes/actions.js';
import ticketBookingsRouter from './routes/ticketBookings.js';
import { sendEmail } from './emailService.js';
import * as tpl from './emailTemplates.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Resolve paths relative to project root (one level up from backend/)
const ROOT_DIR = path.resolve(import.meta.dirname, '..', '..');
const INPUT_DIR = path.join(ROOT_DIR, 'input');
const OUTPUT_DIR = path.join(ROOT_DIR, 'output');
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');

// Ensure directories exist
[INPUT_DIR, OUTPUT_DIR, UPLOADS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Helper: read JSON from txt file
function readJsonFile<T>(filePath: string): T {
  try {
    const content = fs.readFileSync(filePath, 'utf-8').trim();
    return content ? JSON.parse(content) : [];
  } catch {
    return [] as unknown as T;
  }
}

// Helper: write JSON to txt file
function writeJsonFile(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Helper: append to audit log
function appendAuditLog(entry: { action: string; requestId?: string; timestamp: string; details?: string }) {
  const logPath = path.join(OUTPUT_DIR, 'audit_log.txt');
  const logs = readJsonFile<any[]>(logPath);
  logs.push(entry);
  writeJsonFile(logPath, logs);
}

// ==================== VISA WORKFLOW ROUTES ====================
app.use('/api/visa-requests', visaRequestsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/uploads', uploadRouter); // serve uploaded files
app.use('/api/users', usersRouter);
app.use('/api/action', actionsRouter);
app.use('/api/ticket-bookings', ticketBookingsRouter);

// ==================== LEGACY REQUESTS API ====================

app.get('/api/requests', (_req, res) => {
  const requests = readJsonFile(path.join(INPUT_DIR, 'requests.txt'));
  res.json(requests);
});

app.get('/api/requests/:id', (req, res) => {
  const requests = readJsonFile<any[]>(path.join(INPUT_DIR, 'requests.txt'));
  const request = requests.find(r => r.id === req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });
  res.json(request);
});

app.post('/api/requests', (req, res) => {
  const { employeeName, destination, purpose, dates, department } = req.body;
  const missing = [];
  if (!employeeName?.trim()) missing.push('employeeName');
  if (!destination?.trim()) missing.push('destination');
  if (!purpose?.trim()) missing.push('purpose');
  if (!dates?.trim()) missing.push('dates');
  if (!department?.trim()) missing.push('department');
  if (missing.length > 0) return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });

  const requests = readJsonFile<any[]>(path.join(INPUT_DIR, 'requests.txt'));
  const nextNum = requests.length > 0
    ? Math.max(...requests.map(r => parseInt(r.id.replace('REQ-', '')) || 0)) + 1
    : 5001;

  const newRequest = {
    id: `REQ-${nextNum}`,
    ...req.body,
    status: 'PENDING',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(req.body.employeeName || 'New User')}&background=255dad&color=fff&size=128`,
  };

  requests.push(newRequest);
  writeJsonFile(path.join(INPUT_DIR, 'requests.txt'), requests);
  appendAuditLog({ action: 'REQUEST_CREATED', requestId: newRequest.id, timestamp: new Date().toISOString(), details: `New request by ${newRequest.employeeName} to ${newRequest.destination}` });
  res.status(201).json(newRequest);
});

app.put('/api/requests/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['APPROVED', 'DENIED', 'PENDING'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

  // Mandatory denial comment
  if (status === 'DENIED' && (!req.body.reason || !req.body.reason.trim())) {
    return res.status(400).json({ error: 'A reason is required when denying a travel request' });
  }

  const requestsPath = path.join(INPUT_DIR, 'requests.txt');
  const requests = readJsonFile<any[]>(requestsPath);
  const index = requests.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Request not found' });

  // State machine: only allow transitions from PENDING
  const currentStatus = requests[index].status;
  const ALLOWED_TRANSITIONS: Record<string, string[]> = {
    PENDING: ['APPROVED', 'DENIED'],
    APPROVED: [],
    DENIED: [],
  };
  if (!(ALLOWED_TRANSITIONS[currentStatus] || []).includes(status)) {
    return res.status(400).json({ error: `Cannot transition from ${currentStatus} to ${status}` });
  }

  requests[index].status = status;
  if (status === 'DENIED') requests[index].denialReason = req.body.reason;
  writeJsonFile(requestsPath, requests);

  if (status === 'APPROVED') {
    const approved = readJsonFile<any[]>(path.join(OUTPUT_DIR, 'approved_requests.txt'));
    approved.push({ ...requests[index], approvedAt: new Date().toISOString() });
    writeJsonFile(path.join(OUTPUT_DIR, 'approved_requests.txt'), approved);
  } else if (status === 'DENIED') {
    const denied = readJsonFile<any[]>(path.join(OUTPUT_DIR, 'denied_requests.txt'));
    denied.push({ ...requests[index], deniedAt: new Date().toISOString() });
    writeJsonFile(path.join(OUTPUT_DIR, 'denied_requests.txt'), denied);
  }

  appendAuditLog({ action: `REQUEST_${status}`, requestId: req.params.id, timestamp: new Date().toISOString(), details: `Request ${req.params.id} marked as ${status}` });

  // Send email notifications
  const r = requests[index];
  // Travel requests may not have applicantEmail — send to HR admin as primary recipient
  const recipients = [r.applicantEmail, r.managerEmail, 'hr@zalaris.com'].filter(Boolean);
  if (status === 'APPROVED') {
    const email = tpl.travelRequestApproved(r);
    for (const to of recipients) {
      await sendEmail({ to, ...email, requestId: r.id, templateName: 'travel-request-approved' });
    }
  } else if (status === 'DENIED') {
    const email = tpl.travelRequestDenied(r);
    for (const to of recipients) {
      await sendEmail({ to, ...email, requestId: r.id, templateName: 'travel-request-denied' });
    }
  }

  res.json(requests[index]);
});

app.delete('/api/requests/:id', (req, res) => {
  const requestsPath = path.join(INPUT_DIR, 'requests.txt');
  const requests = readJsonFile<any[]>(requestsPath);
  const filtered = requests.filter(r => r.id !== req.params.id);
  if (filtered.length === requests.length) return res.status(404).json({ error: 'Request not found' });
  writeJsonFile(requestsPath, filtered);
  appendAuditLog({ action: 'REQUEST_DELETED', requestId: req.params.id, timestamp: new Date().toISOString() });
  res.json({ success: true });
});

// ==================== TRAVELERS API ====================

app.get('/api/travelers', (_req, res) => { res.json(readJsonFile(path.join(INPUT_DIR, 'travelers.txt'))); });

app.post('/api/travelers', (req, res) => {
  const travelers = readJsonFile<any[]>(path.join(INPUT_DIR, 'travelers.txt'));
  const nextNum = travelers.length > 0 ? Math.max(...travelers.map(t => parseInt(t.id.replace('ST-', '')) || 0)) + 1 : 10001;
  const newTraveler = { id: `ST-${nextNum}`, ...req.body, avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(req.body.name || 'New Traveler')}&background=006d4a&color=fff&size=128` };
  travelers.push(newTraveler);
  writeJsonFile(path.join(INPUT_DIR, 'travelers.txt'), travelers);
  res.status(201).json(newTraveler);
});

// ==================== MASTER DATA API ====================

app.get('/api/master/cost-centres', (_req, res) => { res.json(readJsonFile(path.join(INPUT_DIR, 'cost_centres.txt'))); });
app.get('/api/master/locations', (_req, res) => { res.json(readJsonFile(path.join(INPUT_DIR, 'locations.txt'))); });
app.get('/api/master/employees', (_req, res) => { res.json(readJsonFile(path.join(INPUT_DIR, 'employees.txt'))); });

// ==================== AUDIT & STATS ====================

app.get('/api/audit-log', (_req, res) => { res.json(readJsonFile(path.join(OUTPUT_DIR, 'audit_log.txt'))); });

app.get('/api/email-log', (_req, res) => { res.json(readJsonFile(path.join(OUTPUT_DIR, 'email_log.txt'))); });

app.get('/api/email-log/:requestId', (req, res) => {
  const logs = readJsonFile<any[]>(path.join(OUTPUT_DIR, 'email_log.txt'));
  res.json(logs.filter(l => l.requestId === req.params.requestId));
});

app.get('/api/stats', (_req, res) => {
  const requests = readJsonFile<any[]>(path.join(INPUT_DIR, 'requests.txt'));
  const travelers = readJsonFile<any[]>(path.join(INPUT_DIR, 'travelers.txt'));
  const visaRequests = readJsonFile<any[]>(path.join(INPUT_DIR, 'visa_requests.txt'));
  const ticketBookings = readJsonFile<any[]>(path.join(INPUT_DIR, 'ticket_bookings.txt'));

  const pending = requests.filter(r => r.status === 'PENDING').length;
  const approved = requests.filter(r => r.status === 'APPROVED').length;
  const totalCost = requests.reduce((sum, r) => {
    const cost = parseFloat((r.cost || '0').replace(/[€$,]/g, ''));
    return sum + (isNaN(cost) ? 0 : cost);
  }, 0);

  res.json({
    totalRequests: requests.length,
    pendingRequests: pending,
    approvedRequests: approved,
    totalTravelers: travelers.length,
    monthlySpent: `€${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    visaRequests: {
      total: visaRequests.length,
      active: visaRequests.filter(r => r.status !== 'APPOINTMENT_CONFIRMED').length,
      confirmed: visaRequests.filter(r => r.status === 'APPOINTMENT_CONFIRMED').length,
    },
    ticketBookings: {
      total: ticketBookings.length,
      active: ticketBookings.filter((b: any) => b.status !== 'COMPLETED' && b.status !== 'TICKET_SHARED').length,
      completed: ticketBookings.filter((b: any) => b.status === 'COMPLETED' || b.status === 'TICKET_SHARED').length,
    },
  });
});

// ==================== ADMIN API ====================

app.get('/api/admin/audit-logs', (_req, res) => { res.json(readJsonFile(path.join(OUTPUT_DIR, 'audit_log.txt'))); });
app.get('/api/admin/email-logs', (_req, res) => { res.json(readJsonFile(path.join(OUTPUT_DIR, 'email_log.txt'))); });

// JSON 404 handler for unknown API routes
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found', message: `Route not found` });
});

app.listen(PORT, () => {
  console.log(`Zalaris Travel Backend running on http://localhost:${PORT}`);
  console.log(`Input dir: ${INPUT_DIR}`);
  console.log(`Output dir: ${OUTPUT_DIR}`);
});
