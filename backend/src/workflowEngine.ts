import { VisaRequestStatus, UserRole } from './types.js';

// Valid transitions: from → [allowed targets]
export const VALID_TRANSITIONS: Record<VisaRequestStatus, VisaRequestStatus[]> = {
  'SUBMITTED_TO_HR': ['COST_PROPOSAL_SHARED'],
  'COST_PROPOSAL_SHARED': ['PENDING_COST_CENTRE_APPROVAL'],
  'PENDING_COST_CENTRE_APPROVAL': ['COST_CENTRE_APPROVED', 'COST_CENTRE_REJECTED'],
  'COST_CENTRE_APPROVED': ['AWAITING_VENDOR_AVAILABILITY'],
  'COST_CENTRE_REJECTED': ['COST_PROPOSAL_SHARED'],
  'AWAITING_VENDOR_AVAILABILITY': ['VENDOR_DATES_RECEIVED'],
  'VENDOR_DATES_RECEIVED': ['AWAITING_APPLICANT_DATE_SELECTION'],
  'AWAITING_APPLICANT_DATE_SELECTION': ['APPLICANT_DATES_SUBMITTED'],
  'APPLICANT_DATES_SUBMITTED': ['PENDING_EVP_APPROVAL'],
  'PENDING_EVP_APPROVAL': ['EVP_APPROVED', 'EVP_REJECTED'],
  'EVP_APPROVED': ['DATE_BLOCKING_REQUESTED'],
  'EVP_REJECTED': ['APPLICANT_DATES_SUBMITTED'],
  'DATE_BLOCKING_REQUESTED': ['APPOINTMENT_CONFIRMED'],
  'APPOINTMENT_CONFIRMED': [],
};

// Which roles can trigger each target status
export const TRANSITION_PERMISSIONS: Record<VisaRequestStatus, string[]> = {
  'SUBMITTED_TO_HR': ['MANAGER', 'EMPLOYEE', 'ADMIN'],
  'COST_PROPOSAL_SHARED': ['HRBP', 'ADMIN'],
  'PENDING_COST_CENTRE_APPROVAL': ['HRBP', 'ADMIN'],
  'COST_CENTRE_APPROVED': ['MANAGER', 'ADMIN', 'COST_CENTRE_OWNER'],
  'COST_CENTRE_REJECTED': ['MANAGER', 'ADMIN', 'COST_CENTRE_OWNER'],
  'AWAITING_VENDOR_AVAILABILITY': ['HRBP', 'ADMIN'],
  'VENDOR_DATES_RECEIVED': ['VENDOR'],
  'AWAITING_APPLICANT_DATE_SELECTION': ['HRBP', 'ADMIN'],
  'APPLICANT_DATES_SUBMITTED': ['EMPLOYEE', 'ADMIN', 'APPLICANT'],
  'PENDING_EVP_APPROVAL': ['HRBP', 'ADMIN'],
  'EVP_APPROVED': ['EXECUTIVE', 'ADMIN', 'EVP'],
  'EVP_REJECTED': ['EXECUTIVE', 'ADMIN', 'EVP'],
  'DATE_BLOCKING_REQUESTED': ['HRBP', 'ADMIN'],
  'APPOINTMENT_CONFIRMED': ['HRBP', 'VENDOR', 'ADMIN'],
};

// Map status to step number
export const STATUS_TO_STEP: Record<VisaRequestStatus, number> = {
  'SUBMITTED_TO_HR': 1,
  'COST_PROPOSAL_SHARED': 2,
  'PENDING_COST_CENTRE_APPROVAL': 3,
  'COST_CENTRE_APPROVED': 3,
  'COST_CENTRE_REJECTED': 3,
  'AWAITING_VENDOR_AVAILABILITY': 4,
  'VENDOR_DATES_RECEIVED': 5,
  'AWAITING_APPLICANT_DATE_SELECTION': 6,
  'APPLICANT_DATES_SUBMITTED': 7,
  'PENDING_EVP_APPROVAL': 8,
  'EVP_APPROVED': 8,
  'EVP_REJECTED': 8,
  'DATE_BLOCKING_REQUESTED': 9,
  'APPOINTMENT_CONFIRMED': 9,
};

// Step labels
export const STEP_LABELS: Record<number, string> = {
  1: 'Submit to HR',
  2: 'Cost Proposal',
  3: 'Cost Centre Approval',
  4: 'Vendor Request',
  5: 'Vendor Dates',
  6: 'Share Dates',
  7: 'Applicant Selection',
  8: 'EVP Approval',
  9: 'Booking Confirmed',
};

export function validateTransition(
  currentStatus: VisaRequestStatus,
  targetStatus: VisaRequestStatus,
  userRole: string
): { valid: boolean; error?: string } {
  const allowed = VALID_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(targetStatus)) {
    return { valid: false, error: `Cannot transition from ${currentStatus} to ${targetStatus}` };
  }

  const allowedRoles = TRANSITION_PERMISSIONS[targetStatus];
  if (!allowedRoles.includes(userRole)) {
    return { valid: false, error: `Role ${userRole} cannot perform this transition. Required: ${allowedRoles.join(', ')}` };
  }

  return { valid: true };
}

export function getStepForStatus(status: VisaRequestStatus): number {
  return STATUS_TO_STEP[status] || 1;
}

export function getAvailableActions(status: VisaRequestStatus, role: string): VisaRequestStatus[] {
  const nextStatuses = VALID_TRANSITIONS[status] || [];
  return nextStatuses.filter(s => TRANSITION_PERMISSIONS[s]?.includes(role));
}
