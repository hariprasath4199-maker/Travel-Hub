// ==================== VISA WORKFLOW TYPES ====================

export type VisaRequestStatus =
  | 'SUBMITTED_TO_HR'
  | 'COST_PROPOSAL_SHARED'
  | 'PENDING_COST_CENTRE_APPROVAL'
  | 'COST_CENTRE_APPROVED'
  | 'COST_CENTRE_REJECTED'
  | 'AWAITING_VENDOR_AVAILABILITY'
  | 'VENDOR_DATES_RECEIVED'
  | 'AWAITING_APPLICANT_DATE_SELECTION'
  | 'APPLICANT_DATES_SUBMITTED'
  | 'PENDING_EVP_APPROVAL'
  | 'EVP_APPROVED'
  | 'EVP_REJECTED'
  | 'DATE_BLOCKING_REQUESTED'
  | 'APPOINTMENT_CONFIRMED';

export type UserRole = 'MANAGER' | 'HR_ADMIN' | 'COST_CENTRE_OWNER' | 'VENDOR' | 'APPLICANT' | 'EVP';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface CostProposal {
  visaFees: number;
  serviceFees: number;
  travelCost: number;
  accommodationCost: number;
  otherCosts: number;
  totalCost: number;
  currency: string; // Always 'EUR'
  notes?: string;
}

export interface VendorDateSlot {
  date: string;
  time: string;
  location: string;
  slotId: string;
}

export interface WorkflowEvent {
  id: string;
  step: number;
  action: string;
  fromStatus: VisaRequestStatus | null;
  toStatus: VisaRequestStatus;
  performedBy: string;
  performedByRole: UserRole;
  timestamp: string;
  comments?: string;
}

export interface VisaRequest {
  id: string;
  currentStep: number;
  status: VisaRequestStatus;
  createdAt: string;
  updatedAt: string;

  // Step 1: Manager submits
  employeeId: string;
  firstName?: string;
  lastName?: string;
  employeeName: string;
  employeeRole: string;
  employeeAvatar: string;
  applicantEmail: string;
  applicantMobile?: string;
  managerName: string;
  managerEmail: string;
  destination: string;
  travelLocation: string;
  numberOfDays: number;
  costCentre: string;
  managerComments: string;
  referenceNumber: string;
  recommendationLetterFile?: string;
  attachments?: string[];

  // Step 2: HR cost proposal
  costProposal?: CostProposal;
  costProposalSharedAt?: string;

  // Step 3: Cost centre approval
  costCentreOwnerName?: string;
  costCentreOwnerEmail?: string;
  costCentreApprovalToken?: string;
  costCentreApprovedAt?: string;
  costCentreRejectedAt?: string;
  costCentreRejectionReason?: string;

  // Step 4: Vendor request
  vendorName?: string;
  vendorEmail?: string;
  vendorRequestedAt?: string;

  // Step 5: Vendor dates
  vendorAvailableDates?: VendorDateSlot[];
  vendorDatesReceivedAt?: string;
  vendorComments?: string;

  // Step 6: Share dates
  datesSharedToApplicantAt?: string;

  // Step 7: Applicant selection
  applicantSelectedDates?: VendorDateSlot[];
  applicantRemarks?: string;
  applicantDatesSubmittedAt?: string;

  // Step 8: EVP approval
  evpName?: string;
  evpEmail?: string;
  evpApprovalToken?: string;
  evpApprovedAt?: string;
  evpRejectedAt?: string;
  evpRejectionReason?: string;

  // Step 9: Confirm booking
  confirmedDate?: VendorDateSlot;
  vendorConfirmationReference?: string;
  appointmentConfirmedAt?: string;

  // Workflow history
  workflowHistory: WorkflowEvent[];
}

export interface EmailLog {
  id: string;
  requestId: string;
  to: string;
  subject: string;
  sentAt: string;
  templateName: string;
  status: 'SENT' | 'FAILED' | 'DEV_LOGGED';
  error?: string;
}
