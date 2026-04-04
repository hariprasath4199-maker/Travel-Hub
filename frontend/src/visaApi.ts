import { isBackendAvailable, DEMO_VISA_REQUESTS, DEMO_USERS } from './demoData';

const API = '/api';

export type VisaRequestStatus =
  | 'SUBMITTED_TO_HR' | 'COST_PROPOSAL_SHARED' | 'PENDING_COST_CENTRE_APPROVAL'
  | 'COST_CENTRE_APPROVED' | 'COST_CENTRE_REJECTED' | 'AWAITING_VENDOR_AVAILABILITY'
  | 'VENDOR_DATES_RECEIVED' | 'AWAITING_APPLICANT_DATE_SELECTION' | 'APPLICANT_DATES_SUBMITTED'
  | 'PENDING_EVP_APPROVAL' | 'EVP_APPROVED' | 'EVP_REJECTED'
  | 'DATE_BLOCKING_REQUESTED' | 'APPOINTMENT_CONFIRMED';

export type UserRole = 'MANAGER' | 'HR_ADMIN' | 'COST_CENTRE_OWNER' | 'VENDOR' | 'APPLICANT' | 'EVP';

export interface AppUser { id: string; name: string; email: string; role: UserRole; avatar?: string; costCentre?: string; }
export interface VendorDateSlot { date: string; time: string; location: string; slotId: string; }
export interface CostProposal { visaFees: number; serviceFees: number; travelCost: number; accommodationCost: number; otherCosts: number; totalCost: number; currency: string; notes?: string; }
export interface WorkflowEvent { id: string; step: number; action: string; fromStatus: VisaRequestStatus | null; toStatus: VisaRequestStatus; performedBy: string; performedByRole: UserRole; timestamp: string; comments?: string; }

export interface VisaRequest {
  id: string; currentStep: number; status: VisaRequestStatus; createdAt: string; updatedAt: string;
  employeeName: string; employeeRole: string; employeeAvatar: string;
  applicantEmail: string; managerName: string; managerEmail: string;
  destination: string; travelLocation: string; numberOfDays: number;
  costCentre: string; managerComments: string; recommendationLetterFile?: string;
  costProposal?: CostProposal; costProposalSharedAt?: string;
  costCentreOwnerName?: string; costCentreOwnerEmail?: string; costCentreApprovedAt?: string; costCentreRejectedAt?: string; costCentreRejectionReason?: string;
  vendorName?: string; vendorEmail?: string; vendorRequestedAt?: string;
  vendorAvailableDates?: VendorDateSlot[]; vendorDatesReceivedAt?: string; vendorComments?: string;
  datesSharedToApplicantAt?: string;
  applicantSelectedDates?: VendorDateSlot[]; applicantRemarks?: string; applicantDatesSubmittedAt?: string;
  evpName?: string; evpEmail?: string; evpApprovedAt?: string; evpRejectedAt?: string; evpRejectionReason?: string;
  confirmedDate?: VendorDateSlot; vendorConfirmationReference?: string; appointmentConfirmedAt?: string;
  workflowHistory: WorkflowEvent[];
}

async function json<T>(res: Response): Promise<T> { if (!res.ok) throw new Error(await res.text()); return res.json(); }

// ─── Demo mode helpers ──────────────────────────────────────────────
const STORAGE_KEY = 'zalaris_visa_requests';

const getDemoVisaRequests = (): VisaRequest[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as VisaRequest[];
  } catch { /* ignore parse errors */ }
  return [...DEMO_VISA_REQUESTS];
};

const saveDemoVisaRequests = (requests: VisaRequest[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
};

/** Find a demo request by ID, apply updates, persist, and return the updated request */
const updateDemoRequest = (
  id: string,
  updater: (req: VisaRequest) => Partial<VisaRequest>,
  event: Omit<WorkflowEvent, 'id' | 'timestamp'>
): VisaRequest => {
  const all = getDemoVisaRequests();
  const idx = all.findIndex(r => r.id === id);
  if (idx === -1) throw new Error(`Visa request ${id} not found`);
  const now = new Date().toISOString();
  const updates = updater(all[idx]);
  const newEvent: WorkflowEvent = { ...event, id: `evt-${Date.now()}`, timestamp: now };
  const updated: VisaRequest = {
    ...all[idx],
    ...updates,
    updatedAt: now,
    workflowHistory: [...all[idx].workflowHistory, newEvent],
  };
  all[idx] = updated;
  saveDemoVisaRequests(all);
  return updated;
};

// ─── Fetch functions (already have demo mode) ───────────────────────
export const fetchVisaRequests = async (): Promise<VisaRequest[]> => {
  if (!(await isBackendAvailable())) return getDemoVisaRequests();
  return fetch(`${API}/visa-requests`).then(r => json(r));
};
export const fetchVisaRequest = async (id: string): Promise<VisaRequest> => {
  if (!(await isBackendAvailable())) {
    const found = getDemoVisaRequests().find(r => r.id === id);
    if (found) return found;
    throw new Error('Not found');
  }
  return fetch(`${API}/visa-requests/${id}`).then(r => json(r));
};

export const createVisaRequest = async (data: any): Promise<VisaRequest> => {
  if (!(await isBackendAvailable())) {
    const now = new Date().toISOString();
    const stored = localStorage.getItem(STORAGE_KEY);
    const existing: VisaRequest[] = stored ? JSON.parse(stored) : [...DEMO_VISA_REQUESTS];
    const nextNum = existing.length > 0 ? Math.max(...existing.map(r => parseInt(r.id.replace('VISA-', '').replace('DEMO-', '')) || 0)) + 1 : 100;
    const newRequest: VisaRequest = {
      id: `VISA-${nextNum}`,
      currentStep: 1,
      status: 'SUBMITTED_TO_HR',
      createdAt: now,
      updatedAt: now,
      employeeName: data.employeeName || '',
      employeeRole: data.employeeRole || '',
      employeeAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.employeeName || 'U')}`,
      applicantEmail: data.applicantEmail || '',
      managerName: data.managerName || '',
      managerEmail: data.managerEmail || '',
      destination: data.destination || '',
      travelLocation: data.travelLocation || '',
      numberOfDays: data.numberOfDays || 0,
      costCentre: data.costCentre || '',
      managerComments: data.managerComments || '',
      recommendationLetterFile: data.recommendationLetterFile,
      workflowHistory: [{
        id: `evt-${Date.now()}`,
        step: 1,
        action: 'Request submitted to HR Admin',
        fromStatus: null,
        toStatus: 'SUBMITTED_TO_HR' as VisaRequestStatus,
        performedBy: data.managerName || 'System',
        performedByRole: 'MANAGER' as UserRole,
        timestamp: now,
        comments: data.managerComments,
      }],
    };
    existing.push(newRequest);
    saveDemoVisaRequests(existing);
    return newRequest;
  }
  return fetch(`${API}/visa-requests`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => json(r));
};

// ─── Step 2: HR Admin submits cost proposal ─────────────────────────
export const submitCostProposal = async (id: string, costProposal: any, performedBy: string): Promise<VisaRequest> => {
  if (!(await isBackendAvailable())) {
    return updateDemoRequest(id, (req) => ({
      currentStep: 2,
      status: 'COST_PROPOSAL_SHARED' as VisaRequestStatus,
      costProposal,
      costProposalSharedAt: new Date().toISOString(),
    }), {
      step: 2,
      action: 'Cost proposal shared with manager',
      fromStatus: 'SUBMITTED_TO_HR',
      toStatus: 'COST_PROPOSAL_SHARED',
      performedBy,
      performedByRole: 'HR_ADMIN',
    });
  }
  return fetch(`${API}/visa-requests/${id}/cost-proposal`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ costProposal, performedBy }) }).then(r => json(r));
};

// ─── Step 3: Send for cost centre approval ──────────────────────────
export const sendCostCentreApproval = async (id: string, data: { costCentreOwnerName: string; costCentreOwnerEmail: string; performedBy: string }): Promise<VisaRequest> => {
  if (!(await isBackendAvailable())) {
    return updateDemoRequest(id, () => ({
      currentStep: 3,
      status: 'PENDING_COST_CENTRE_APPROVAL' as VisaRequestStatus,
      costCentreOwnerName: data.costCentreOwnerName,
      costCentreOwnerEmail: data.costCentreOwnerEmail,
    }), {
      step: 3,
      action: 'Sent for cost centre approval',
      fromStatus: 'COST_PROPOSAL_SHARED',
      toStatus: 'PENDING_COST_CENTRE_APPROVAL',
      performedBy: data.performedBy,
      performedByRole: 'HR_ADMIN',
    });
  }
  return fetch(`${API}/visa-requests/${id}/send-cost-centre-approval`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => json(r));
};

// ─── Step 3: Cost centre owner approves/rejects ─────────────────────
export const submitCostCentreDecision = async (id: string, decision: 'approve' | 'reject', reason?: string, comments?: string): Promise<VisaRequest> => {
  if (!(await isBackendAvailable())) {
    const isApprove = decision === 'approve';
    return updateDemoRequest(id, () => ({
      currentStep: 3,
      status: (isApprove ? 'COST_CENTRE_APPROVED' : 'COST_CENTRE_REJECTED') as VisaRequestStatus,
      ...(isApprove ? { costCentreApprovedAt: new Date().toISOString() } : { costCentreRejectedAt: new Date().toISOString(), costCentreRejectionReason: reason }),
    }), {
      step: 3,
      action: isApprove ? 'Cost centre approved' : 'Cost centre rejected',
      fromStatus: 'PENDING_COST_CENTRE_APPROVAL',
      toStatus: (isApprove ? 'COST_CENTRE_APPROVED' : 'COST_CENTRE_REJECTED') as VisaRequestStatus,
      performedBy: 'Cost Centre Owner',
      performedByRole: 'COST_CENTRE_OWNER',
      comments,
    });
  }
  return fetch(`${API}/visa-requests/${id}/cost-centre-decision`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ decision, reason, comments }) }).then(r => json(r));
};

// ─── Step 4: HR Admin sends vendor request ──────────────────────────
export const sendVendorRequest = async (id: string, data: { vendorName: string; vendorEmail: string; performedBy: string }): Promise<VisaRequest> => {
  if (!(await isBackendAvailable())) {
    return updateDemoRequest(id, () => ({
      currentStep: 4,
      status: 'AWAITING_VENDOR_AVAILABILITY' as VisaRequestStatus,
      vendorName: data.vendorName,
      vendorEmail: data.vendorEmail,
      vendorRequestedAt: new Date().toISOString(),
    }), {
      step: 4,
      action: 'Vendor availability requested',
      fromStatus: 'COST_CENTRE_APPROVED',
      toStatus: 'AWAITING_VENDOR_AVAILABILITY',
      performedBy: data.performedBy,
      performedByRole: 'HR_ADMIN',
    });
  }
  return fetch(`${API}/visa-requests/${id}/vendor-request`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => json(r));
};

// ─── Step 5: Vendor submits available dates ─────────────────────────
export const submitVendorDates = async (id: string, dates: VendorDateSlot[], comments?: string): Promise<VisaRequest> => {
  if (!(await isBackendAvailable())) {
    return updateDemoRequest(id, () => ({
      currentStep: 5,
      status: 'VENDOR_DATES_RECEIVED' as VisaRequestStatus,
      vendorAvailableDates: dates,
      vendorDatesReceivedAt: new Date().toISOString(),
      vendorComments: comments,
    }), {
      step: 5,
      action: 'Vendor submitted available dates',
      fromStatus: 'AWAITING_VENDOR_AVAILABILITY',
      toStatus: 'VENDOR_DATES_RECEIVED',
      performedBy: 'Vendor',
      performedByRole: 'VENDOR',
      comments,
    });
  }
  return fetch(`${API}/visa-requests/${id}/vendor-dates`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dates, comments }) }).then(r => json(r));
};

// ─── Step 6: HR Admin shares dates with applicant ───────────────────
export const shareDatesWithApplicant = async (id: string, performedBy: string): Promise<VisaRequest> => {
  if (!(await isBackendAvailable())) {
    return updateDemoRequest(id, () => ({
      currentStep: 6,
      status: 'AWAITING_APPLICANT_DATE_SELECTION' as VisaRequestStatus,
      datesSharedToApplicantAt: new Date().toISOString(),
    }), {
      step: 6,
      action: 'Dates shared with applicant',
      fromStatus: 'VENDOR_DATES_RECEIVED',
      toStatus: 'AWAITING_APPLICANT_DATE_SELECTION',
      performedBy,
      performedByRole: 'HR_ADMIN',
    });
  }
  return fetch(`${API}/visa-requests/${id}/share-dates`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ performedBy }) }).then(r => json(r));
};

// ─── Step 7: Applicant selects dates ────────────────────────────────
export const submitApplicantDates = async (id: string, selectedDates: VendorDateSlot[], remarks?: string): Promise<VisaRequest> => {
  if (!(await isBackendAvailable())) {
    return updateDemoRequest(id, () => ({
      currentStep: 7,
      status: 'APPLICANT_DATES_SUBMITTED' as VisaRequestStatus,
      applicantSelectedDates: selectedDates,
      applicantRemarks: remarks,
      applicantDatesSubmittedAt: new Date().toISOString(),
    }), {
      step: 7,
      action: 'Applicant selected preferred dates',
      fromStatus: 'AWAITING_APPLICANT_DATE_SELECTION',
      toStatus: 'APPLICANT_DATES_SUBMITTED',
      performedBy: 'Applicant',
      performedByRole: 'APPLICANT',
      comments: remarks,
    });
  }
  return fetch(`${API}/visa-requests/${id}/applicant-dates`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ selectedDates, remarks }) }).then(r => json(r));
};

// ─── Step 8: Send for EVP approval ──────────────────────────────────
export const sendEvpApproval = async (id: string, data: { evpName: string; evpEmail: string; performedBy: string }): Promise<VisaRequest> => {
  if (!(await isBackendAvailable())) {
    return updateDemoRequest(id, () => ({
      currentStep: 8,
      status: 'PENDING_EVP_APPROVAL' as VisaRequestStatus,
      evpName: data.evpName,
      evpEmail: data.evpEmail,
    }), {
      step: 8,
      action: 'Sent for EVP approval',
      fromStatus: 'APPLICANT_DATES_SUBMITTED',
      toStatus: 'PENDING_EVP_APPROVAL',
      performedBy: data.performedBy,
      performedByRole: 'HR_ADMIN',
    });
  }
  return fetch(`${API}/visa-requests/${id}/send-evp-approval`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => json(r));
};

// ─── Step 8: EVP approves/rejects ───────────────────────────────────
export const submitEvpDecision = async (id: string, decision: 'approve' | 'reject', reason?: string, comments?: string): Promise<VisaRequest> => {
  if (!(await isBackendAvailable())) {
    const isApprove = decision === 'approve';
    return updateDemoRequest(id, () => ({
      currentStep: 8,
      status: (isApprove ? 'EVP_APPROVED' : 'EVP_REJECTED') as VisaRequestStatus,
      ...(isApprove ? { evpApprovedAt: new Date().toISOString() } : { evpRejectedAt: new Date().toISOString(), evpRejectionReason: reason }),
    }), {
      step: 8,
      action: isApprove ? 'EVP approved' : 'EVP rejected',
      fromStatus: 'PENDING_EVP_APPROVAL',
      toStatus: (isApprove ? 'EVP_APPROVED' : 'EVP_REJECTED') as VisaRequestStatus,
      performedBy: 'EVP',
      performedByRole: 'EVP',
      comments,
    });
  }
  return fetch(`${API}/visa-requests/${id}/evp-decision`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ decision, reason, comments }) }).then(r => json(r));
};

// ─── Step 9: Confirm booking ────────────────────────────────────────
export const confirmBooking = async (id: string, confirmedDate: VendorDateSlot, performedBy: string): Promise<VisaRequest> => {
  if (!(await isBackendAvailable())) {
    return updateDemoRequest(id, () => ({
      currentStep: 9,
      status: 'DATE_BLOCKING_REQUESTED' as VisaRequestStatus,
      confirmedDate,
    }), {
      step: 9,
      action: 'Date blocking requested with vendor',
      fromStatus: 'EVP_APPROVED',
      toStatus: 'DATE_BLOCKING_REQUESTED',
      performedBy,
      performedByRole: 'HR_ADMIN',
    });
  }
  return fetch(`${API}/visa-requests/${id}/confirm-booking`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirmedDate, performedBy }) }).then(r => json(r));
};

// ─── Step 9: Final appointment confirmed ────────────────────────────
export const confirmAppointment = async (id: string, vendorConfirmationReference: string, performedBy: string, role: UserRole): Promise<VisaRequest> => {
  if (!(await isBackendAvailable())) {
    return updateDemoRequest(id, () => ({
      currentStep: 9,
      status: 'APPOINTMENT_CONFIRMED' as VisaRequestStatus,
      vendorConfirmationReference,
      appointmentConfirmedAt: new Date().toISOString(),
    }), {
      step: 9,
      action: 'Appointment confirmed',
      fromStatus: 'DATE_BLOCKING_REQUESTED',
      toStatus: 'APPOINTMENT_CONFIRMED',
      performedBy,
      performedByRole: role,
      comments: `Ref: ${vendorConfirmationReference}`,
    });
  }
  return fetch(`${API}/visa-requests/${id}/appointment-confirmed`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vendorConfirmationReference, performedBy, role }) }).then(r => json(r));
};

// ─── User functions ─────────────────────────────────────────────────
export const fetchUsers = async (): Promise<AppUser[]> => {
  if (!(await isBackendAvailable())) return DEMO_USERS;
  return fetch(`${API}/users`).then(r => json(r));
};
export const fetchUsersByRole = async (role: UserRole): Promise<AppUser[]> => {
  if (!(await isBackendAvailable())) return DEMO_USERS.filter(u => u.role === role);
  return fetch(`${API}/users/by-role/${role}`).then(r => json(r));
};
export const fetchEmailLog = async (requestId: string): Promise<any[]> => {
  if (!(await isBackendAvailable())) return [];
  return fetch(`${API}/email-log/${requestId}`).then(r => json(r));
};

export const uploadFile = async (file: File): Promise<{ filename: string; originalName: string; size: number }> => {
  if (!(await isBackendAvailable())) {
    return {
      filename: `demo-${Date.now()}-${file.name}`,
      originalName: file.name,
      size: file.size,
    };
  }
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API}/upload`, { method: 'POST', body: form });
  return json(res);
};

// Step labels & colors
export const STEP_LABELS: Record<number, string> = { 1: 'Submit to HR', 2: 'Cost Proposal', 3: 'Cost Centre Approval', 4: 'Vendor Request', 5: 'Vendor Dates', 6: 'Share Dates', 7: 'Applicant Selection', 8: 'EVP Approval', 9: 'Booking Confirmed' };

export const STATUS_LABELS: Record<VisaRequestStatus, string> = {
  SUBMITTED_TO_HR: 'Submitted to HR', COST_PROPOSAL_SHARED: 'Cost Proposal Shared',
  PENDING_COST_CENTRE_APPROVAL: 'Pending Cost Centre', COST_CENTRE_APPROVED: 'Cost Centre Approved', COST_CENTRE_REJECTED: 'Cost Centre Rejected',
  AWAITING_VENDOR_AVAILABILITY: 'Awaiting Vendor', VENDOR_DATES_RECEIVED: 'Vendor Dates Received',
  AWAITING_APPLICANT_DATE_SELECTION: 'Awaiting Applicant', APPLICANT_DATES_SUBMITTED: 'Dates Selected',
  PENDING_EVP_APPROVAL: 'Pending EVP', EVP_APPROVED: 'EVP Approved', EVP_REJECTED: 'EVP Rejected',
  DATE_BLOCKING_REQUESTED: 'Blocking Date', APPOINTMENT_CONFIRMED: 'Confirmed',
};

export const STATUS_TO_STEP: Record<VisaRequestStatus, number> = {
  SUBMITTED_TO_HR: 1, COST_PROPOSAL_SHARED: 2,
  PENDING_COST_CENTRE_APPROVAL: 3, COST_CENTRE_APPROVED: 3, COST_CENTRE_REJECTED: 3,
  AWAITING_VENDOR_AVAILABILITY: 4, VENDOR_DATES_RECEIVED: 5,
  AWAITING_APPLICANT_DATE_SELECTION: 6, APPLICANT_DATES_SUBMITTED: 7,
  PENDING_EVP_APPROVAL: 8, EVP_APPROVED: 8, EVP_REJECTED: 8,
  DATE_BLOCKING_REQUESTED: 9, APPOINTMENT_CONFIRMED: 9,
};

export const ROLE_LABELS: Record<UserRole, string> = {
  MANAGER: 'Manager', HR_ADMIN: 'HR Admin', COST_CENTRE_OWNER: 'Cost Centre Owner',
  VENDOR: 'Vendor', APPLICANT: 'Applicant', EVP: 'EVP',
};
