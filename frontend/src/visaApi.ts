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
  employeeId: string; firstName?: string; lastName?: string; employeeName: string; employeeRole: string; employeeAvatar: string;
  applicantEmail: string; applicantMobile?: string; managerName: string; managerEmail: string;
  destination: string; travelLocation: string; numberOfDays: number;
  costCentre: string; managerComments: string; referenceNumber?: string; recommendationLetterFile?: string; attachments?: string[];
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

// ─── Fetch functions ───────────────────────────────────────────────
export const fetchVisaRequests = async (): Promise<VisaRequest[]> => {
  return fetch(`${API}/visa-requests`).then(r => json(r));
};
export const fetchVisaRequest = async (id: string): Promise<VisaRequest> => {
  return fetch(`${API}/visa-requests/${id}`).then(r => json(r));
};

export const createVisaRequest = async (data: any): Promise<VisaRequest> => {
  return fetch(`${API}/visa-requests`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => json(r));
};

// ─── Step 2: HR Admin submits cost proposal ─────────────────────────
export const submitCostProposal = async (id: string, costProposal: any, performedBy: string): Promise<VisaRequest> => {
  return fetch(`${API}/visa-requests/${id}/cost-proposal`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ costProposal, performedBy }) }).then(r => json(r));
};

// ─── Step 3: Send for cost centre approval ──────────────────────────
export const sendCostCentreApproval = async (id: string, data: { costCentreOwnerName: string; costCentreOwnerEmail: string; performedBy: string }): Promise<VisaRequest> => {
  return fetch(`${API}/visa-requests/${id}/send-cost-centre-approval`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => json(r));
};

// ─── Step 3: Cost centre owner approves/rejects ─────────────────────
export const submitCostCentreDecision = async (id: string, decision: 'approve' | 'reject', reason?: string, comments?: string): Promise<VisaRequest> => {
  return fetch(`${API}/visa-requests/${id}/cost-centre-decision`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ decision, reason, comments }) }).then(r => json(r));
};

// ─── Step 4: HR Admin sends vendor request ──────────────────────────
export const sendVendorRequest = async (id: string, data: { vendorName: string; vendorEmail: string; performedBy: string }): Promise<VisaRequest> => {
  return fetch(`${API}/visa-requests/${id}/vendor-request`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => json(r));
};

// ─── Step 5: Vendor submits available dates ─────────────────────────
export const submitVendorDates = async (id: string, dates: VendorDateSlot[], comments?: string): Promise<VisaRequest> => {
  return fetch(`${API}/visa-requests/${id}/vendor-dates`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dates, comments }) }).then(r => json(r));
};

// ─── Step 6: HR Admin shares dates with applicant ───────────────────
export const shareDatesWithApplicant = async (id: string, performedBy: string): Promise<VisaRequest> => {
  return fetch(`${API}/visa-requests/${id}/share-dates`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ performedBy }) }).then(r => json(r));
};

// ─── Step 7: Applicant selects dates ────────────────────────────────
export const submitApplicantDates = async (id: string, selectedDates: VendorDateSlot[], remarks?: string): Promise<VisaRequest> => {
  return fetch(`${API}/visa-requests/${id}/applicant-dates`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ selectedDates, remarks }) }).then(r => json(r));
};

// ─── Step 8: Send for EVP approval ──────────────────────────────────
export const sendEvpApproval = async (id: string, data: { evpName: string; evpEmail: string; performedBy: string }): Promise<VisaRequest> => {
  return fetch(`${API}/visa-requests/${id}/send-evp-approval`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => json(r));
};

// ─── Step 8: EVP approves/rejects ───────────────────────────────────
export const submitEvpDecision = async (id: string, decision: 'approve' | 'reject', reason?: string, comments?: string): Promise<VisaRequest> => {
  return fetch(`${API}/visa-requests/${id}/evp-decision`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ decision, reason, comments }) }).then(r => json(r));
};

// ─── Step 9: Confirm booking ────────────────────────────────────────
export const confirmBooking = async (id: string, confirmedDate: VendorDateSlot, performedBy: string): Promise<VisaRequest> => {
  return fetch(`${API}/visa-requests/${id}/confirm-booking`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirmedDate, performedBy }) }).then(r => json(r));
};

// ─── Step 9: Final appointment confirmed ────────────────────────────
export const confirmAppointment = async (id: string, vendorConfirmationReference: string, performedBy: string, role: UserRole): Promise<VisaRequest> => {
  return fetch(`${API}/visa-requests/${id}/appointment-confirmed`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vendorConfirmationReference, performedBy, role }) }).then(r => json(r));
};

// ─── User functions ─────────────────────────────────────────────────
export const fetchUsers = async (): Promise<AppUser[]> => {
  return fetch(`${API}/users`).then(r => json(r));
};
export const fetchUsersByRole = async (role: UserRole): Promise<AppUser[]> => {
  return fetch(`${API}/users/by-role/${role}`).then(r => json(r));
};
export const fetchEmailLog = async (requestId: string): Promise<any[]> => {
  return fetch(`${API}/email-log/${requestId}`).then(r => json(r));
};

export const uploadFile = async (file: File): Promise<{ filename: string; originalName: string; size: number }> => {
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
