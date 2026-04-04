import { cn } from '@/src/lib/utils';
import { RequestStatus } from '@/src/types';
import { type VisaRequestStatus } from '@/src/visaApi';
import { type TicketBookingStatus } from '@/src/ticketApi';

interface StatusBadgeProps {
  status: RequestStatus | VisaRequestStatus | TicketBookingStatus | 'Compliant' | 'Pending Update';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    // Legacy
    PENDING: 'bg-secondary-container text-on-secondary-container',
    APPROVED: 'bg-tertiary-container text-on-tertiary-container',
    DENIED: 'bg-error-container/20 text-on-error-container',
    Compliant: 'bg-tertiary-container text-on-tertiary-container',
    'Pending Update': 'bg-secondary-container text-on-secondary-container',
    // Visa workflow
    SUBMITTED_TO_HR: 'bg-blue-100 text-blue-800',
    COST_PROPOSAL_SHARED: 'bg-indigo-100 text-indigo-800',
    PENDING_COST_CENTRE_APPROVAL: 'bg-amber-100 text-amber-800',
    COST_CENTRE_APPROVED: 'bg-emerald-100 text-emerald-800',
    COST_CENTRE_REJECTED: 'bg-red-100 text-red-800',
    AWAITING_VENDOR_AVAILABILITY: 'bg-orange-100 text-orange-800',
    VENDOR_DATES_RECEIVED: 'bg-cyan-100 text-cyan-800',
    AWAITING_APPLICANT_DATE_SELECTION: 'bg-purple-100 text-purple-800',
    APPLICANT_DATES_SUBMITTED: 'bg-violet-100 text-violet-800',
    PENDING_EVP_APPROVAL: 'bg-amber-100 text-amber-800',
    EVP_APPROVED: 'bg-emerald-100 text-emerald-800',
    EVP_REJECTED: 'bg-red-100 text-red-800',
    DATE_BLOCKING_REQUESTED: 'bg-sky-100 text-sky-800',
    APPOINTMENT_CONFIRMED: 'bg-green-100 text-green-800',
    // Ticket booking statuses
    TICKET_REQUESTED: 'bg-blue-100 text-blue-800',
    ITINERARY_REQUESTED: 'bg-indigo-100 text-indigo-800',
    ITINERARY_PROVIDED: 'bg-violet-100 text-violet-800',
    ITINERARY_SHARED: 'bg-purple-100 text-purple-800',
    EVP_APPROVAL_PENDING: 'bg-amber-100 text-amber-800',
    BOOKING_REQUESTED: 'bg-orange-100 text-orange-800',
    TICKET_BOOKED: 'bg-teal-100 text-teal-800',
    TICKET_SHARED: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-green-100 text-green-800',
  };

  const labels: Record<string, string> = {
    SUBMITTED_TO_HR: 'Submitted', COST_PROPOSAL_SHARED: 'Cost Shared',
    PENDING_COST_CENTRE_APPROVAL: 'Pending CC', COST_CENTRE_APPROVED: 'CC Approved', COST_CENTRE_REJECTED: 'CC Rejected',
    AWAITING_VENDOR_AVAILABILITY: 'Await Vendor', VENDOR_DATES_RECEIVED: 'Dates In',
    AWAITING_APPLICANT_DATE_SELECTION: 'Await Selection', APPLICANT_DATES_SUBMITTED: 'Dates Selected',
    PENDING_EVP_APPROVAL: 'Pending EVP', EVP_APPROVED: 'EVP OK', EVP_REJECTED: 'EVP Rejected',
    DATE_BLOCKING_REQUESTED: 'Blocking', APPOINTMENT_CONFIRMED: 'Confirmed',
    TICKET_REQUESTED: 'Requested', ITINERARY_REQUESTED: 'Itinerary Req', ITINERARY_PROVIDED: 'Itinerary In',
    ITINERARY_SHARED: 'Shared', BOOKING_REQUESTED: 'Booking Req', TICKET_BOOKED: 'Booked',
    TICKET_SHARED: 'Shared', COMPLETED: 'Complete',
  };

  return (
    <span className={cn('px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap', styles[status] || 'bg-gray-100 text-gray-800', className)}>
      {labels[status] || status}
    </span>
  );
}
