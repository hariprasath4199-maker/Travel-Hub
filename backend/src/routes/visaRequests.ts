import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { VisaRequest, WorkflowEvent, VisaRequestStatus, UserRole } from '../types.js';
import { validateTransition, getStepForStatus } from '../workflowEngine.js';
import { sendEmail } from '../emailService.js';
import * as tpl from '../emailTemplates.js';

const router = Router();
const ROOT_DIR = path.resolve(import.meta.dirname, '..', '..', '..');
const INPUT_DIR = path.join(ROOT_DIR, 'input');
const OUTPUT_DIR = path.join(ROOT_DIR, 'output');

function readJsonFile<T>(filePath: string): T {
  try { const c = fs.readFileSync(filePath, 'utf-8').trim(); return c ? JSON.parse(c) : []; }
  catch { return [] as unknown as T; }
}
function writeJsonFile(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
function getRequests(): VisaRequest[] { return readJsonFile(path.join(INPUT_DIR, 'visa_requests.txt')); }
function saveRequests(data: VisaRequest[]): void { writeJsonFile(path.join(INPUT_DIR, 'visa_requests.txt'), data); }

function appendAudit(action: string, requestId: string, details: string) {
  const logPath = path.join(OUTPUT_DIR, 'audit_log.txt');
  const logs = readJsonFile<any[]>(logPath);
  logs.push({ action, requestId, timestamp: new Date().toISOString(), details });
  writeJsonFile(logPath, logs);
}

function addEvent(req: VisaRequest, action: string, from: VisaRequestStatus | null, to: VisaRequestStatus, by: string, role: UserRole, comments?: string): WorkflowEvent {
  const evt: WorkflowEvent = { id: uuidv4(), step: getStepForStatus(to), action, fromStatus: from, toStatus: to, performedBy: by, performedByRole: role, timestamp: new Date().toISOString(), comments };
  req.workflowHistory.push(evt);
  return evt;
}

// GET /api/visa-requests
router.get('/', (_req, res) => { res.json(getRequests()); });

// GET /api/visa-requests/:id
router.get('/:id', (req, res) => {
  const r = getRequests().find(r => r.id === req.params.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  res.json(r);
});

// POST /api/visa-requests — Step 1: Manager submits
router.post('/', async (req, res) => {
  const { employeeName, applicantEmail, destination } = req.body;
  const missing = [];
  if (!employeeName?.trim()) missing.push('employeeName');
  if (!applicantEmail?.trim()) missing.push('applicantEmail');
  if (!destination?.trim()) missing.push('destination');
  if (missing.length > 0) return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });

  const reqs = getRequests();
  const nextNum = reqs.length > 0 ? Math.max(...reqs.map(r => parseInt(r.id.replace('VISA-', '')) || 0)) + 1 : 5001;
  const now = new Date().toISOString();
  const refNum = `VS-${String(nextNum).padStart(5, '0')}`;

  const nr: VisaRequest = {
    id: `VISA-${nextNum}`,
    currentStep: 1,
    status: 'SUBMITTED_TO_HR',
    createdAt: now,
    updatedAt: now,
    employeeId: req.body.employeeId || '',
    employeeName: req.body.employeeName,
    employeeRole: req.body.employeeRole || '',
    employeeAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(req.body.employeeName || 'User')}&background=255dad&color=fff&size=128`,
    applicantEmail: req.body.applicantEmail || '',
    applicantMobile: req.body.applicantMobile || undefined,
    managerName: req.body.managerName || '',
    managerEmail: req.body.managerEmail || '',
    destination: req.body.destination || '',
    travelLocation: req.body.travelLocation || '',
    numberOfDays: req.body.numberOfDays || 0,
    costCentre: req.body.costCentre || '',
    managerComments: req.body.managerComments || '',
    referenceNumber: refNum,
    recommendationLetterFile: req.body.recommendationLetterFile || undefined,
    attachments: req.body.attachments || [],
    workflowHistory: [],
  };

  addEvent(nr, 'Request submitted to HR Admin', null, 'SUBMITTED_TO_HR', nr.managerName, 'MANAGER', nr.managerComments);
  reqs.push(nr);
  saveRequests(reqs);
  appendAudit('VISA_REQUEST_CREATED', nr.id, `Visa request by ${nr.employeeName} to ${nr.destination}`);

  // Send emails
  const hrEmail = tpl.visaSubmittedHR(nr);
  const ackEmail = tpl.visaSubmittedAck(nr);
  // In real use, HR admin email from users.txt; for now use body or fallback
  const hrAdminEmail = req.body.hrAdminEmail || 'hr@zalaris.com';
  await sendEmail({ to: hrAdminEmail, ...hrEmail, requestId: nr.id, templateName: 'visa-submitted-hr' });
  if (nr.managerEmail) await sendEmail({ to: nr.managerEmail, ...ackEmail, requestId: nr.id, templateName: 'visa-submitted-ack' });

  res.status(201).json(nr);
});

// POST /api/visa-requests/:id/cost-proposal — Step 2
router.post('/:id/cost-proposal', async (req, res) => {
  const reqs = getRequests();
  const idx = reqs.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const r = reqs[idx];
  const v = validateTransition(r.status, 'COST_PROPOSAL_SHARED', 'HR_ADMIN');
  if (!v.valid) return res.status(400).json({ error: v.error });

  const cp = req.body.costProposal;
  r.costProposal = { ...cp, currency: 'EUR', totalCost: (cp.visaFees || 0) + (cp.serviceFees || 0) + (cp.travelCost || 0) + (cp.accommodationCost || 0) + (cp.otherCosts || 0) };
  r.costProposalSharedAt = new Date().toISOString();

  addEvent(r, 'Cost proposal shared with Manager', r.status, 'COST_PROPOSAL_SHARED', req.body.performedBy || 'HR Admin', 'HR_ADMIN');
  r.status = 'COST_PROPOSAL_SHARED';
  r.currentStep = 2;
  r.updatedAt = new Date().toISOString();
  saveRequests(reqs);
  appendAudit('COST_PROPOSAL_SHARED', r.id, `Cost proposal €${r.costProposal.totalCost.toFixed(2)} shared`);

  const email = tpl.costProposalToManager(r);
  if (r.managerEmail) await sendEmail({ to: r.managerEmail, ...email, requestId: r.id, templateName: 'cost-proposal-to-manager' });

  res.json(r);
});

// POST /api/visa-requests/:id/send-cost-centre-approval — Step 3 trigger
router.post('/:id/send-cost-centre-approval', async (req, res) => {
  const reqs = getRequests();
  const idx = reqs.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const r = reqs[idx];
  const v = validateTransition(r.status, 'PENDING_COST_CENTRE_APPROVAL', 'HR_ADMIN');
  if (!v.valid) return res.status(400).json({ error: v.error });

  r.costCentreOwnerName = req.body.costCentreOwnerName || '';
  r.costCentreOwnerEmail = req.body.costCentreOwnerEmail || '';
  r.costCentreApprovalToken = uuidv4();

  addEvent(r, 'Sent for cost centre approval', r.status, 'PENDING_COST_CENTRE_APPROVAL', req.body.performedBy || 'HR Admin', 'HR_ADMIN');
  r.status = 'PENDING_COST_CENTRE_APPROVAL';
  r.currentStep = 3;
  r.updatedAt = new Date().toISOString();
  saveRequests(reqs);

  const email = tpl.costCentreApprovalRequest(r);
  if (r.costCentreOwnerEmail) await sendEmail({ to: r.costCentreOwnerEmail, ...email, requestId: r.id, templateName: 'cost-centre-approval-request' });

  res.json(r);
});

// POST /api/visa-requests/:id/cost-centre-decision — Step 3 decision
router.post('/:id/cost-centre-decision', async (req, res) => {
  const reqs = getRequests();
  const idx = reqs.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const r = reqs[idx];
  const decision = req.body.decision; // 'approve' | 'reject'

  // Rejection requires a reason/comment
  if (decision === 'reject' && (!req.body.reason || !req.body.reason.trim())) {
    return res.status(400).json({ error: 'A reason is required when rejecting the cost centre approval' });
  }

  const targetStatus: VisaRequestStatus = decision === 'approve' ? 'COST_CENTRE_APPROVED' : 'COST_CENTRE_REJECTED';
  const v = validateTransition(r.status, targetStatus, 'COST_CENTRE_OWNER');
  if (!v.valid) return res.status(400).json({ error: v.error });

  if (decision === 'approve') {
    r.costCentreApprovedAt = new Date().toISOString();
    addEvent(r, 'Cost centre approved', r.status, 'COST_CENTRE_APPROVED', r.costCentreOwnerName || 'Cost Centre Owner', 'COST_CENTRE_OWNER', req.body.comments);
    r.status = 'COST_CENTRE_APPROVED';
    const email = tpl.costCentreApprovedNotif(r);
    if (r.managerEmail) await sendEmail({ to: r.managerEmail, ...email, requestId: r.id, templateName: 'cost-centre-approved' });
  } else {
    r.costCentreRejectedAt = new Date().toISOString();
    r.costCentreRejectionReason = req.body.reason;
    addEvent(r, 'Cost centre rejected', r.status, 'COST_CENTRE_REJECTED', r.costCentreOwnerName || 'Cost Centre Owner', 'COST_CENTRE_OWNER', req.body.reason);
    r.status = 'COST_CENTRE_REJECTED';
    const email = tpl.costCentreRejectedNotif(r);
    if (r.managerEmail) await sendEmail({ to: r.managerEmail, ...email, requestId: r.id, templateName: 'cost-centre-rejected' });
  }

  r.currentStep = 3;
  r.updatedAt = new Date().toISOString();
  saveRequests(reqs);
  res.json(r);
});

// POST /api/visa-requests/:id/vendor-request — Step 4
router.post('/:id/vendor-request', async (req, res) => {
  const reqs = getRequests();
  const idx = reqs.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const r = reqs[idx];
  const v = validateTransition(r.status, 'AWAITING_VENDOR_AVAILABILITY', 'HR_ADMIN');
  if (!v.valid) return res.status(400).json({ error: v.error });

  r.vendorName = req.body.vendorName || '';
  r.vendorEmail = req.body.vendorEmail || '';
  r.vendorRequestedAt = new Date().toISOString();

  addEvent(r, 'Vendor requested for availability', r.status, 'AWAITING_VENDOR_AVAILABILITY', req.body.performedBy || 'HR Admin', 'HR_ADMIN');
  r.status = 'AWAITING_VENDOR_AVAILABILITY';
  r.currentStep = 4;
  r.updatedAt = new Date().toISOString();
  saveRequests(reqs);

  const email = tpl.vendorAvailabilityRequest(r);
  if (r.vendorEmail) await sendEmail({ to: r.vendorEmail, ...email, requestId: r.id, templateName: 'vendor-availability-request' });

  res.json(r);
});

// POST /api/visa-requests/:id/vendor-dates — Step 5
router.post('/:id/vendor-dates', async (req, res) => {
  const reqs = getRequests();
  const idx = reqs.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const r = reqs[idx];
  const v = validateTransition(r.status, 'VENDOR_DATES_RECEIVED', 'VENDOR');
  if (!v.valid) return res.status(400).json({ error: v.error });

  r.vendorAvailableDates = (req.body.dates || []).map((d: any) => ({ ...d, slotId: d.slotId || uuidv4() }));
  r.vendorComments = req.body.comments || '';
  r.vendorDatesReceivedAt = new Date().toISOString();

  addEvent(r, 'Vendor submitted available dates', r.status, 'VENDOR_DATES_RECEIVED', r.vendorName || 'Vendor', 'VENDOR', r.vendorComments);
  r.status = 'VENDOR_DATES_RECEIVED';
  r.currentStep = 5;
  r.updatedAt = new Date().toISOString();
  saveRequests(reqs);

  const email = tpl.vendorDatesReceived(r);
  await sendEmail({ to: 'hr@zalaris.com', ...email, requestId: r.id, templateName: 'vendor-dates-received' });

  res.json(r);
});

// POST /api/visa-requests/:id/share-dates — Step 6
router.post('/:id/share-dates', async (req, res) => {
  const reqs = getRequests();
  const idx = reqs.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const r = reqs[idx];
  const v = validateTransition(r.status, 'AWAITING_APPLICANT_DATE_SELECTION', 'HR_ADMIN');
  if (!v.valid) return res.status(400).json({ error: v.error });

  r.datesSharedToApplicantAt = new Date().toISOString();
  addEvent(r, 'Dates shared with applicant', r.status, 'AWAITING_APPLICANT_DATE_SELECTION', req.body.performedBy || 'HR Admin', 'HR_ADMIN');
  r.status = 'AWAITING_APPLICANT_DATE_SELECTION';
  r.currentStep = 6;
  r.updatedAt = new Date().toISOString();
  saveRequests(reqs);

  const email = tpl.datesToApplicant(r);
  if (r.applicantEmail) await sendEmail({ to: r.applicantEmail, ...email, requestId: r.id, templateName: 'dates-to-applicant' });

  res.json(r);
});

// POST /api/visa-requests/:id/applicant-dates — Step 7
router.post('/:id/applicant-dates', async (req, res) => {
  const reqs = getRequests();
  const idx = reqs.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const r = reqs[idx];
  const v = validateTransition(r.status, 'APPLICANT_DATES_SUBMITTED', 'APPLICANT');
  if (!v.valid) return res.status(400).json({ error: v.error });

  r.applicantSelectedDates = req.body.selectedDates || [];
  r.applicantRemarks = req.body.remarks || '';
  r.applicantDatesSubmittedAt = new Date().toISOString();

  addEvent(r, 'Applicant submitted preferred dates', r.status, 'APPLICANT_DATES_SUBMITTED', r.employeeName, 'APPLICANT', r.applicantRemarks);
  r.status = 'APPLICANT_DATES_SUBMITTED';
  r.currentStep = 7;
  r.updatedAt = new Date().toISOString();
  saveRequests(reqs);

  const email = tpl.applicantDatesSubmitted(r);
  await sendEmail({ to: 'hr@zalaris.com', ...email, requestId: r.id, templateName: 'applicant-dates-submitted' });

  res.json(r);
});

// POST /api/visa-requests/:id/send-evp-approval — Step 8 trigger
router.post('/:id/send-evp-approval', async (req, res) => {
  const reqs = getRequests();
  const idx = reqs.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const r = reqs[idx];
  const v = validateTransition(r.status, 'PENDING_EVP_APPROVAL', 'HR_ADMIN');
  if (!v.valid) return res.status(400).json({ error: v.error });

  r.evpName = req.body.evpName || '';
  r.evpEmail = req.body.evpEmail || '';
  r.evpApprovalToken = uuidv4();

  addEvent(r, 'Sent for EVP approval', r.status, 'PENDING_EVP_APPROVAL', req.body.performedBy || 'HR Admin', 'HR_ADMIN');
  r.status = 'PENDING_EVP_APPROVAL';
  r.currentStep = 8;
  r.updatedAt = new Date().toISOString();
  saveRequests(reqs);

  const email = tpl.evpApprovalRequest(r);
  if (r.evpEmail) await sendEmail({ to: r.evpEmail, ...email, requestId: r.id, templateName: 'evp-approval-request' });

  res.json(r);
});

// POST /api/visa-requests/:id/evp-decision — Step 8 decision
router.post('/:id/evp-decision', async (req, res) => {
  const reqs = getRequests();
  const idx = reqs.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const r = reqs[idx];
  const decision = req.body.decision;

  // Rejection requires a reason/comment
  if (decision === 'reject' && (!req.body.reason || !req.body.reason.trim())) {
    return res.status(400).json({ error: 'A reason is required when rejecting the EVP approval' });
  }

  const targetStatus: VisaRequestStatus = decision === 'approve' ? 'EVP_APPROVED' : 'EVP_REJECTED';
  const v = validateTransition(r.status, targetStatus, 'EVP');
  if (!v.valid) return res.status(400).json({ error: v.error });

  if (decision === 'approve') {
    r.evpApprovedAt = new Date().toISOString();
    addEvent(r, 'EVP approved', r.status, 'EVP_APPROVED', r.evpName || 'EVP', 'EVP', req.body.comments);
    r.status = 'EVP_APPROVED';
    const email = tpl.evpApprovedNotif(r);
    if (r.managerEmail) await sendEmail({ to: r.managerEmail, ...email, requestId: r.id, templateName: 'evp-approved' });
  } else {
    r.evpRejectedAt = new Date().toISOString();
    r.evpRejectionReason = req.body.reason;
    addEvent(r, 'EVP rejected', r.status, 'EVP_REJECTED', r.evpName || 'EVP', 'EVP', req.body.reason);
    r.status = 'EVP_REJECTED';
    const email = tpl.evpRejectedNotif(r);
    if (r.managerEmail) await sendEmail({ to: r.managerEmail, ...email, requestId: r.id, templateName: 'evp-rejected' });
  }

  r.currentStep = 8;
  r.updatedAt = new Date().toISOString();
  saveRequests(reqs);
  res.json(r);
});

// POST /api/visa-requests/:id/confirm-booking — Step 9 start
router.post('/:id/confirm-booking', async (req, res) => {
  const reqs = getRequests();
  const idx = reqs.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const r = reqs[idx];
  const v = validateTransition(r.status, 'DATE_BLOCKING_REQUESTED', 'HR_ADMIN');
  if (!v.valid) return res.status(400).json({ error: v.error });

  r.confirmedDate = req.body.confirmedDate;
  addEvent(r, 'Date blocking requested with vendor', r.status, 'DATE_BLOCKING_REQUESTED', req.body.performedBy || 'HR Admin', 'HR_ADMIN');
  r.status = 'DATE_BLOCKING_REQUESTED';
  r.currentStep = 9;
  r.updatedAt = new Date().toISOString();
  saveRequests(reqs);

  // Email vendor to block date
  if (r.vendorEmail) {
    await sendEmail({ to: r.vendorEmail, subject: `[${r.id}] Please Block Appointment - ${r.confirmedDate?.date}`, html: `<p>Please confirm blocking of appointment on ${r.confirmedDate?.date} at ${r.confirmedDate?.time} for ${r.employeeName}.</p>`, requestId: r.id, templateName: 'date-blocking-request' });
  }

  res.json(r);
});

// POST /api/visa-requests/:id/appointment-confirmed — Step 9 final
router.post('/:id/appointment-confirmed', async (req, res) => {
  const reqs = getRequests();
  const idx = reqs.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const r = reqs[idx];
  const v = validateTransition(r.status, 'APPOINTMENT_CONFIRMED', req.body.role || 'HR_ADMIN');
  if (!v.valid) return res.status(400).json({ error: v.error });

  r.vendorConfirmationReference = req.body.vendorConfirmationReference || '';
  r.appointmentConfirmedAt = new Date().toISOString();

  addEvent(r, 'Appointment confirmed', r.status, 'APPOINTMENT_CONFIRMED', req.body.performedBy || 'HR Admin', req.body.role || 'HR_ADMIN');
  r.status = 'APPOINTMENT_CONFIRMED';
  r.currentStep = 9;
  r.updatedAt = new Date().toISOString();
  saveRequests(reqs);
  appendAudit('APPOINTMENT_CONFIRMED', r.id, `Visa appointment confirmed. Ref: ${r.vendorConfirmationReference}`);

  // Send final confirmation to all parties
  const email = tpl.bookingConfirmedAll(r);
  const recipients = [r.managerEmail, r.applicantEmail, r.vendorEmail].filter(Boolean);
  for (const to of recipients) {
    await sendEmail({ to: to!, ...email, requestId: r.id, templateName: 'booking-confirmed-all' });
  }

  res.json(r);
});

export default router;
