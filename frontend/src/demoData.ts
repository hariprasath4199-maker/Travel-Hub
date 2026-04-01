import { TravelRequest } from './types';
import { type DashboardStats } from './api';
import { type VisaRequest, type AppUser, type VisaRequestStatus } from './visaApi';

// Detect if backend is available
let _backendAvailable: boolean | null = null;
export async function isBackendAvailable(): Promise<boolean> {
  if (_backendAvailable !== null) return _backendAvailable;
  try {
    const res = await fetch('/api/stats', { signal: AbortSignal.timeout(2000) });
    _backendAvailable = res.ok;
  } catch {
    _backendAvailable = false;
  }
  return _backendAvailable;
}

// Demo travel requests
export const DEMO_REQUESTS: TravelRequest[] = [
  {
    id: 'REQ-001', employeeName: 'Gopinath Subramani', role: 'Manager',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=GS',
    destination: 'Berlin, Germany', dates: 'May 15 - Jun 30', nights: '46',
    purpose: 'Work visa processing for Berlin office', cost: '€3,200',
    status: 'APPROVED', department: 'Engineering',
  },
  {
    id: 'REQ-002', employeeName: 'Ravi Shankar', role: 'Developer',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=RS',
    destination: 'Helsinki, Finland', dates: 'Jun 01 - Jun 15', nights: '14',
    purpose: 'Client meetings and sprint planning', cost: '€1,800',
    status: 'PENDING', department: 'Product',
  },
  {
    id: 'REQ-003', employeeName: 'Anna Fischer', role: 'Finance Lead',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AF',
    destination: 'Oslo, Norway', dates: 'Jul 10 - Jul 20', nights: '10',
    purpose: 'Quarterly audit and compliance review', cost: '€2,100',
    status: 'PENDING', department: 'Finance',
  },
];

export const DEMO_STATS: DashboardStats = {
  totalRequests: 3, pendingRequests: 2, approvedRequests: 1,
  totalTravelers: 6, monthlySpent: '€7,100.00',
};

export const DEMO_USERS: AppUser[] = [
  { id: 'u1', name: 'Gopinath Subramani', email: 'gopinath@zalaris.com', role: 'MANAGER' },
  { id: 'u2', name: 'Hari Kumar', email: 'hari.kumar@zalaris.com', role: 'HR_ADMIN' },
  { id: 'u3', name: 'Anna Fischer', email: 'anna.fischer@zalaris.com', role: 'COST_CENTRE_OWNER' },
  { id: 'u4', name: 'VFS Global', email: 'appointments@vfsglobal.com', role: 'VENDOR' },
  { id: 'u5', name: 'Ravi Shankar', email: 'ravi.shankar@zalaris.com', role: 'APPLICANT' },
  { id: 'u6', name: 'Marcus Weber', email: 'marcus.weber@zalaris.com', role: 'EVP' },
];

const now = new Date().toISOString();

export const DEMO_VISA_REQUESTS: VisaRequest[] = [
  {
    id: 'VISA-DEMO-1', currentStep: 5, status: 'VENDOR_DATES_RECEIVED' as VisaRequestStatus,
    createdAt: '2026-03-20T10:00:00Z', updatedAt: now,
    employeeName: 'Ravi Shankar', employeeRole: 'Developer', employeeAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=RS',
    applicantEmail: 'ravi.shankar@zalaris.com', managerName: 'Gopinath Subramani', managerEmail: 'gopinath@zalaris.com',
    destination: 'Germany', travelLocation: 'Berlin', numberOfDays: 46,
    costCentre: 'CC-DEV-001', managerComments: 'Work visa for Berlin assignment',
    costProposal: { visaFees: 80, serviceFees: 45, travelCost: 650, accommodationCost: 2400, otherCosts: 100, totalCost: 3275, currency: 'EUR', notes: 'Standard processing' },
    costProposalSharedAt: '2026-03-21T09:00:00Z',
    costCentreOwnerName: 'Anna Fischer', costCentreOwnerEmail: 'anna.fischer@zalaris.com',
    costCentreApprovedAt: '2026-03-22T14:00:00Z',
    vendorName: 'VFS Global', vendorEmail: 'appointments@vfsglobal.com', vendorRequestedAt: '2026-03-23T10:00:00Z',
    vendorAvailableDates: [
      { date: '2026-04-15', time: 'MORNING', location: 'VFS Berlin Centre', slotId: 's1' },
      { date: '2026-04-16', time: 'AFTERNOON', location: 'VFS Berlin Centre', slotId: 's2' },
      { date: '2026-04-18', time: 'MORNING', location: 'VFS Munich Centre', slotId: 's3' },
    ],
    vendorDatesReceivedAt: '2026-03-25T11:00:00Z', vendorComments: '3 slots available',
    workflowHistory: [
      { id: 'e1', step: 1, action: 'Request submitted to HR Admin', fromStatus: null, toStatus: 'SUBMITTED_TO_HR', performedBy: 'Gopinath Subramani', performedByRole: 'MANAGER', timestamp: '2026-03-20T10:00:00Z' },
      { id: 'e2', step: 2, action: 'Cost proposal shared with manager', fromStatus: 'SUBMITTED_TO_HR', toStatus: 'COST_PROPOSAL_SHARED', performedBy: 'Hari Kumar', performedByRole: 'HR_ADMIN', timestamp: '2026-03-21T09:00:00Z' },
      { id: 'e3', step: 3, action: 'Sent for cost centre approval', fromStatus: 'COST_PROPOSAL_SHARED', toStatus: 'PENDING_COST_CENTRE_APPROVAL', performedBy: 'Hari Kumar', performedByRole: 'HR_ADMIN', timestamp: '2026-03-21T10:00:00Z' },
      { id: 'e4', step: 3, action: 'Cost centre approved', fromStatus: 'PENDING_COST_CENTRE_APPROVAL', toStatus: 'COST_CENTRE_APPROVED', performedBy: 'Anna Fischer', performedByRole: 'COST_CENTRE_OWNER', timestamp: '2026-03-22T14:00:00Z' },
      { id: 'e5', step: 4, action: 'Vendor availability requested', fromStatus: 'COST_CENTRE_APPROVED', toStatus: 'AWAITING_VENDOR_AVAILABILITY', performedBy: 'Hari Kumar', performedByRole: 'HR_ADMIN', timestamp: '2026-03-23T10:00:00Z' },
      { id: 'e6', step: 5, action: 'Vendor submitted available dates', fromStatus: 'AWAITING_VENDOR_AVAILABILITY', toStatus: 'VENDOR_DATES_RECEIVED', performedBy: 'VFS Global', performedByRole: 'VENDOR', timestamp: '2026-03-25T11:00:00Z' },
    ],
  },
  {
    id: 'VISA-DEMO-2', currentStep: 2, status: 'COST_PROPOSAL_SHARED' as VisaRequestStatus,
    createdAt: '2026-03-28T08:00:00Z', updatedAt: now,
    employeeName: 'Marcus Weber', employeeRole: 'VP Engineering', employeeAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MW',
    applicantEmail: 'marcus.weber@zalaris.com', managerName: 'Gopinath Subramani', managerEmail: 'gopinath@zalaris.com',
    destination: 'Finland', travelLocation: 'Helsinki', numberOfDays: 14,
    costCentre: 'CC-ENG-002', managerComments: 'Business visa for partner meetings',
    costProposal: { visaFees: 60, serviceFees: 35, travelCost: 450, accommodationCost: 1200, otherCosts: 50, totalCost: 1795, currency: 'EUR', notes: 'Express processing requested' },
    costProposalSharedAt: '2026-03-29T10:00:00Z',
    workflowHistory: [
      { id: 'e7', step: 1, action: 'Request submitted to HR Admin', fromStatus: null, toStatus: 'SUBMITTED_TO_HR', performedBy: 'Gopinath Subramani', performedByRole: 'MANAGER', timestamp: '2026-03-28T08:00:00Z' },
      { id: 'e8', step: 2, action: 'Cost proposal shared with manager', fromStatus: 'SUBMITTED_TO_HR', toStatus: 'COST_PROPOSAL_SHARED', performedBy: 'Hari Kumar', performedByRole: 'HR_ADMIN', timestamp: '2026-03-29T10:00:00Z' },
    ],
  },
  {
    id: 'VISA-DEMO-3', currentStep: 9, status: 'APPOINTMENT_CONFIRMED' as VisaRequestStatus,
    createdAt: '2026-02-10T09:00:00Z', updatedAt: '2026-03-15T16:00:00Z',
    employeeName: 'Anna Fischer', employeeRole: 'Finance Lead', employeeAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AF',
    applicantEmail: 'anna.fischer@zalaris.com', managerName: 'Gopinath Subramani', managerEmail: 'gopinath@zalaris.com',
    destination: 'Norway', travelLocation: 'Oslo', numberOfDays: 10,
    costCentre: 'CC-FIN-001', managerComments: 'Audit visit visa',
    costProposal: { visaFees: 70, serviceFees: 40, travelCost: 380, accommodationCost: 900, otherCosts: 30, totalCost: 1420, currency: 'EUR' },
    confirmedDate: { date: '2026-03-10', time: 'MORNING', location: 'VFS Oslo Centre', slotId: 'c1' },
    vendorConfirmationReference: 'VFS-2026-OSL-4821',
    appointmentConfirmedAt: '2026-03-15T16:00:00Z',
    workflowHistory: [
      { id: 'e9', step: 1, action: 'Request submitted to HR Admin', fromStatus: null, toStatus: 'SUBMITTED_TO_HR', performedBy: 'Gopinath Subramani', performedByRole: 'MANAGER', timestamp: '2026-02-10T09:00:00Z' },
      { id: 'e10', step: 9, action: 'Appointment confirmed', fromStatus: 'DATE_BLOCKING_REQUESTED', toStatus: 'APPOINTMENT_CONFIRMED', performedBy: 'VFS Global', performedByRole: 'VENDOR', timestamp: '2026-03-15T16:00:00Z', comments: 'Ref: VFS-2026-OSL-4821' },
    ],
  },
];
