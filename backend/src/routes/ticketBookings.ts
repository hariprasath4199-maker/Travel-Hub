import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
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
function getBookings(): any[] { return readJsonFile(path.join(INPUT_DIR, 'ticket_bookings.txt')); }
function saveBookings(data: any[]): void { writeJsonFile(path.join(INPUT_DIR, 'ticket_bookings.txt'), data); }

function appendAudit(action: string, requestId: string, details: string) {
  const logPath = path.join(OUTPUT_DIR, 'audit_log.txt');
  const logs = readJsonFile<any[]>(logPath);
  logs.push({ action, requestId, timestamp: new Date().toISOString(), details });
  writeJsonFile(logPath, logs);
}

// GET all ticket bookings
router.get('/', (_req, res) => {
  res.json(getBookings());
});

// GET single ticket booking
router.get('/:id', (req, res) => {
  const bookings = getBookings();
  const booking = bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Ticket booking not found' });
  res.json(booking);
});

// GET emails for a booking
router.get('/:id/emails', (req, res) => {
  const bookings = getBookings();
  const booking = bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Ticket booking not found' });
  res.json(booking.emailLog || []);
});

// POST create new ticket booking
router.post('/', async (req, res) => {
  const { applicantName, applicantEmail, destination, travelStartDate, travelEndDate } = req.body;
  const missing = [];
  if (!applicantName?.trim()) missing.push('applicantName');
  if (!applicantEmail?.trim()) missing.push('applicantEmail');
  if (!destination?.trim()) missing.push('destination');
  if (!travelStartDate?.trim()) missing.push('travelStartDate');
  if (!travelEndDate?.trim()) missing.push('travelEndDate');
  if (missing.length > 0) return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });

  const bookings = getBookings();
  const nextNum = bookings.length > 0
    ? Math.max(...bookings.map((b: any) => parseInt(b.id.replace('TB-', '')) || 0)) + 1
    : 5001;

  const now = new Date().toISOString();
  const newBooking = {
    id: `TB-${nextNum}`,
    ...req.body,
    status: req.body.status || 'TICKET_REQUESTED',
    currentStep: req.body.currentStep || 1,
    itineraryOptions: req.body.itineraryOptions || [],
    workflowHistory: req.body.workflowHistory || [{
      id: uuidv4(),
      step: 1,
      action: 'Ticket booking request submitted',
      fromStatus: null,
      toStatus: 'TICKET_REQUESTED',
      performedBy: req.body.managerName || 'Unknown',
      performedByRole: 'MANAGER',
      timestamp: now,
    }],
    emailLog: req.body.emailLog || [],
    createdAt: now,
    updatedAt: now,
  };

  bookings.push(newBooking);
  saveBookings(bookings);
  appendAudit('TICKET_BOOKING_CREATED', newBooking.id, `Ticket booking for ${newBooking.applicantName} to ${newBooking.destination}`);

  // Email HR Admin about new booking request
  const hrEmail = req.body.hrAdminEmail || 'hr@zalaris.com';
  const email1 = tpl.tbRequestSubmitted(newBooking);
  await sendEmail({ to: hrEmail, ...email1, requestId: newBooking.id, templateName: 'tb-request-submitted' });

  res.status(201).json(newBooking);
});

// Helper to update a booking by id
function updateBooking(id: string, updater: (booking: any) => void, res: any) {
  const bookings = getBookings();
  const idx = bookings.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Ticket booking not found' });
  updater(bookings[idx]);
  bookings[idx].updatedAt = new Date().toISOString();
  saveBookings(bookings);
  return bookings[idx];
}

// Step 2: Request itinerary from vendor
router.post('/:id/request-itinerary', async (req, res) => {
  const result = updateBooking(req.params.id, (b) => {
    b.status = 'ITINERARY_REQUESTED';
    b.currentStep = 2;
    b.workflowHistory.push({
      id: uuidv4(), step: 2, action: 'Itinerary requested from vendor',
      fromStatus: 'TICKET_REQUESTED', toStatus: 'ITINERARY_REQUESTED',
      performedBy: req.body.performedBy || 'HR Admin', performedByRole: 'HR_ADMIN',
      timestamp: new Date().toISOString(), comments: req.body.comments,
    });
  }, res);
  if (result) {
    appendAudit('ITINERARY_REQUESTED', req.params.id, 'Itinerary requested from vendor');
    const vendorEmail = req.body.vendorEmail || 'vendor@vfsglobal.com';
    const email = tpl.tbItineraryRequested(result);
    await sendEmail({ to: vendorEmail, ...email, requestId: result.id, templateName: 'tb-itinerary-requested' });
    res.json(result);
  }
});

// Step 3: Vendor submits itinerary
router.post('/:id/submit-itinerary', async (req, res) => {
  const result = updateBooking(req.params.id, (b) => {
    b.itineraryOptions = req.body.itineraryOptions || [];
    b.status = 'ITINERARY_PROVIDED';
    b.currentStep = 3;
    b.workflowHistory.push({
      id: uuidv4(), step: 3, action: 'Vendor provided itinerary options',
      fromStatus: 'ITINERARY_REQUESTED', toStatus: 'ITINERARY_PROVIDED',
      performedBy: req.body.performedBy || 'Vendor', performedByRole: 'VENDOR',
      timestamp: new Date().toISOString(),
    });
  }, res);
  if (result) {
    appendAudit('ITINERARY_PROVIDED', req.params.id, 'Vendor submitted itinerary options');
    const email = tpl.tbItineraryProvided(result);
    await sendEmail({ to: 'hr@zalaris.com', ...email, requestId: result.id, templateName: 'tb-itinerary-provided' });
    res.json(result);
  }
});

// Step 4: Share itinerary with EVP
router.post('/:id/share-itinerary', async (req, res) => {
  const result = updateBooking(req.params.id, (b) => {
    b.selectedItinerary = req.body.selectedItinerary;
    b.evpEmail = req.body.evpEmail;
    b.status = 'EVP_APPROVAL_PENDING';
    b.currentStep = 4;
    b.workflowHistory.push({
      id: uuidv4(), step: 4, action: 'Itinerary shared with EVP for approval',
      fromStatus: 'ITINERARY_PROVIDED', toStatus: 'EVP_APPROVAL_PENDING',
      performedBy: req.body.performedBy || 'HR Admin', performedByRole: 'HR_ADMIN',
      timestamp: new Date().toISOString(),
    });
  }, res);
  if (result) {
    appendAudit('ITINERARY_SHARED', req.params.id, 'Itinerary shared for EVP approval');
    const evpEmail = req.body.evpEmail || result.evpEmail;
    if (evpEmail) {
      const email = tpl.tbEvpApprovalRequest(result);
      await sendEmail({ to: evpEmail, ...email, requestId: result.id, templateName: 'tb-evp-approval-request' });
    }
    res.json(result);
  }
});

// Step 5: EVP decision
router.post('/:id/evp-decision', async (req, res) => {
  const approved = req.body.approved;

  // Rejection requires a comment
  if (!approved && (!req.body.comments || !req.body.comments.trim())) {
    return res.status(400).json({ error: 'A comment is required when rejecting the itinerary' });
  }

  const newStatus = approved ? 'EVP_APPROVED' : 'EVP_REJECTED';
  const result = updateBooking(req.params.id, (b) => {
    b.evpDecision = approved ? 'approve' : 'reject';
    b.evpComments = req.body.comments;
    b.evpName = req.body.performedBy || 'EVP';
    b.evpEmail = req.body.evpEmail;
    b.status = newStatus;
    b.currentStep = 5;
    b.workflowHistory.push({
      id: uuidv4(), step: 5,
      action: approved ? 'EVP approved the itinerary' : 'EVP rejected the itinerary',
      fromStatus: 'EVP_APPROVAL_PENDING', toStatus: newStatus,
      performedBy: req.body.performedBy || 'EVP', performedByRole: 'EVP',
      timestamp: new Date().toISOString(), comments: req.body.comments,
    });
  }, res);
  if (result) {
    appendAudit(`EVP_${approved ? 'APPROVED' : 'REJECTED'}`, req.params.id, `EVP ${approved ? 'approved' : 'rejected'} itinerary`);

    // Send approval/rejection emails to HR Admin + Manager
    const recipients = ['hr@zalaris.com', result.managerEmail].filter(Boolean);
    if (approved) {
      const email = tpl.tbEvpApproved(result);
      for (const to of recipients) {
        await sendEmail({ to, ...email, requestId: result.id, templateName: 'tb-evp-approved' });
      }
    } else {
      const email = tpl.tbEvpRejected({ ...result, rejectionReason: req.body.comments });
      for (const to of recipients) {
        await sendEmail({ to, ...email, requestId: result.id, templateName: 'tb-evp-rejected' });
      }
    }

    res.json(result);
  }
});

// Step 5: Request booking
router.post('/:id/request-booking', async (req, res) => {
  const result = updateBooking(req.params.id, (b) => {
    b.status = 'BOOKING_REQUESTED';
    b.currentStep = 5;
    b.workflowHistory.push({
      id: uuidv4(), step: 5, action: 'HR Admin requested vendor to book ticket',
      fromStatus: 'EVP_APPROVED', toStatus: 'BOOKING_REQUESTED',
      performedBy: req.body.performedBy || 'HR Admin', performedByRole: 'HR_ADMIN',
      timestamp: new Date().toISOString(),
    });
  }, res);
  if (result) {
    appendAudit('BOOKING_REQUESTED', req.params.id, 'Booking requested from vendor');
    const vendorEmail = req.body.vendorEmail || 'vendor@vfsglobal.com';
    const it = result.selectedItinerary;
    await sendEmail({
      to: vendorEmail,
      subject: `[${result.id}] Please Book Ticket — ${result.applicantName} → ${result.destination}`,
      html: `<p>Please proceed to book the following ticket for ${result.applicantName}.</p>${it ? `<p>${it.airline} ${it.flightNumber}</p>` : ''}`,
      requestId: result.id,
      templateName: 'tb-booking-requested',
    });
    res.json(result);
  }
});

// Step 6: Vendor submits booked ticket
router.post('/:id/submit-booked-ticket', async (req, res) => {
  const result = updateBooking(req.params.id, (b) => {
    b.bookedTicket = req.body.ticketDetails;
    b.status = 'TICKET_BOOKED';
    b.currentStep = 6;
    b.workflowHistory.push({
      id: uuidv4(), step: 6, action: 'Vendor booked the ticket',
      fromStatus: 'BOOKING_REQUESTED', toStatus: 'TICKET_BOOKED',
      performedBy: req.body.performedBy || 'Vendor', performedByRole: 'VENDOR',
      timestamp: new Date().toISOString(),
    });
  }, res);
  if (result) {
    appendAudit('TICKET_BOOKED', req.params.id, 'Ticket booked by vendor');
    const email = tpl.tbTicketBooked(result);
    await sendEmail({ to: 'hr@zalaris.com', ...email, requestId: result.id, templateName: 'tb-ticket-booked' });
    res.json(result);
  }
});

// Step 6: Share ticket
router.post('/:id/share-ticket', async (req, res) => {
  const now = new Date().toISOString();
  const result = updateBooking(req.params.id, (b) => {
    b.status = 'TICKET_SHARED';
    b.currentStep = 6;
    b.workflowHistory.push({
      id: uuidv4(), step: 6, action: 'Ticket shared with manager and applicant',
      fromStatus: 'TICKET_BOOKED', toStatus: 'TICKET_SHARED',
      performedBy: req.body.performedBy || 'HR Admin', performedByRole: 'HR_ADMIN',
      timestamp: now,
    });
    b.emailLog = b.emailLog || [];
    b.emailLog.push({
      id: uuidv4(), to: [b.managerEmail, b.applicantEmail],
      subject: 'Your Travel Ticket', sentAt: now, fromRole: 'HR_ADMIN',
    });
  }, res);
  if (result) {
    appendAudit('TICKET_SHARED', req.params.id, 'Ticket shared with stakeholders');
    const email = tpl.tbTicketShared(result);
    const recipients = [result.managerEmail, result.applicantEmail].filter(Boolean);
    for (const to of recipients) {
      await sendEmail({ to, ...email, requestId: result.id, templateName: 'tb-ticket-shared' });
    }
    res.json(result);
  }
});

export default router;
