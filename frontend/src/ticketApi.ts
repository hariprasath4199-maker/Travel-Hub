import { type UserRole } from './visaApi';
export type { UserRole };

const API = '/api';

// Ticket Booking Statuses
export type TicketBookingStatus =
  | 'TICKET_REQUESTED'           // Step 1: Applicant/Manager requested ticket
  | 'ITINERARY_REQUESTED'        // Step 2: HR Admin requested vendor for itinerary
  | 'ITINERARY_PROVIDED'         // Step 3: Vendor provided itinerary options
  | 'ITINERARY_SHARED'           // Step 4a: HR Admin shared with applicant/manager
  | 'EVP_APPROVAL_PENDING'       // Step 4b: Waiting for EVP approval
  | 'EVP_APPROVED'               // Step 5a: EVP approved
  | 'EVP_REJECTED'               // Step 5b: EVP rejected
  | 'BOOKING_REQUESTED'          // Step 5c: HR Admin requested vendor to book
  | 'TICKET_BOOKED'              // Step 6a: Vendor booked ticket
  | 'TICKET_SHARED'              // Step 6b: HR Admin shared ticket with all
  | 'COMPLETED';                 // Done

export interface ItineraryOption {
  id: string;
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  currency: string;
  class: string;
  stops: number;
}

export interface BookedTicket {
  airline: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  bookingRef: string;
  ticketUrl: string;
  bookedAt: string;
}

export interface WorkflowEvent {
  id: string;
  step: number;
  action: string;
  fromStatus: TicketBookingStatus | null;
  toStatus: TicketBookingStatus;
  performedBy: string;
  performedByRole: UserRole;
  timestamp: string;
  comments?: string;
}

export interface EmailLogEntry {
  id: string;
  to: string[];
  subject: string;
  sentAt: string;
  fromRole: UserRole;
}

export interface TicketBooking {
  id: string;
  visaRequestId: string;
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  applicantName: string;
  applicantEmail: string;
  applicantMobile?: string;
  managerName: string;
  managerEmail: string;
  destination: string;
  travelStartDate: string;
  travelEndDate: string;
  purpose: string;
  referenceNumber?: string;
  attachments?: string[];
  status: TicketBookingStatus;
  currentStep: number;
  itineraryOptions: ItineraryOption[];
  selectedItinerary?: ItineraryOption;
  evpDecision?: 'approve' | 'reject';
  evpComments?: string;
  evpName?: string;
  evpEmail?: string;
  bookedTicket?: BookedTicket;
  workflowHistory: WorkflowEvent[];
  emailLog: EmailLogEntry[];
  createdAt: string;
  updatedAt: string;
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Step labels (6 steps for ticket booking)
export const STEP_LABELS: Record<number, string> = {
  1: 'Ticket Request',
  2: 'Itinerary Request',
  3: 'Itinerary Provided',
  4: 'Share & EVP Approval',
  5: 'Booking Requested',
  6: 'Ticket Shared',
};

export const STATUS_LABELS: Record<TicketBookingStatus, string> = {
  TICKET_REQUESTED: 'Ticket Requested',
  ITINERARY_REQUESTED: 'Itinerary Requested',
  ITINERARY_PROVIDED: 'Itinerary Provided',
  ITINERARY_SHARED: 'Itinerary Shared',
  EVP_APPROVAL_PENDING: 'EVP Approval Pending',
  EVP_APPROVED: 'EVP Approved',
  EVP_REJECTED: 'EVP Rejected',
  BOOKING_REQUESTED: 'Booking Requested',
  TICKET_BOOKED: 'Ticket Booked',
  TICKET_SHARED: 'Ticket Shared',
  COMPLETED: 'Completed',
};

export const STATUS_TO_STEP: Record<TicketBookingStatus, number> = {
  TICKET_REQUESTED: 1,
  ITINERARY_REQUESTED: 2,
  ITINERARY_PROVIDED: 3,
  ITINERARY_SHARED: 4,
  EVP_APPROVAL_PENDING: 4,
  EVP_APPROVED: 5,
  EVP_REJECTED: 5,
  BOOKING_REQUESTED: 5,
  TICKET_BOOKED: 6,
  TICKET_SHARED: 6,
  COMPLETED: 6,
};

// API Functions
export const fetchTicketBookings = async (): Promise<TicketBooking[]> => {
  return fetch(`${API}/ticket-bookings`).then(r => json(r));
};

export const fetchTicketBookingById = async (id: string): Promise<TicketBooking> => {
  return fetch(`${API}/ticket-bookings/${id}`).then(r => json(r));
};

export const createTicketBooking = async (data: Partial<TicketBooking>): Promise<TicketBooking> => {
  return fetch(`${API}/ticket-bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => json(r));
};

export const requestItinerary = async (id: string, comments?: string): Promise<TicketBooking> => {
  return fetch(`${API}/ticket-bookings/${id}/request-itinerary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comments, performedBy: 'Hari Kumar' }),
  }).then(r => json(r));
};

export const submitItinerary = async (id: string, itineraryOptions: ItineraryOption[]): Promise<TicketBooking> => {
  return fetch(`${API}/ticket-bookings/${id}/submit-itinerary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itineraryOptions, performedBy: 'VFS Global' }),
  }).then(r => json(r));
};

export const shareItinerary = async (id: string, selectedItinerary: ItineraryOption): Promise<TicketBooking> => {
  return fetch(`${API}/ticket-bookings/${id}/share-itinerary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selectedItinerary, performedBy: 'Hari Kumar' }),
  }).then(r => json(r));
};

export const submitEvpDecision = async (id: string, approved: boolean, comments?: string): Promise<TicketBooking> => {
  return fetch(`${API}/ticket-bookings/${id}/evp-decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approved, comments, performedBy: 'Marcus Weber' }),
  }).then(r => json(r));
};

export const requestBooking = async (id: string, selectedItineraryId: string): Promise<TicketBooking> => {
  return fetch(`${API}/ticket-bookings/${id}/request-booking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selectedItineraryId, performedBy: 'Hari Kumar' }),
  }).then(r => json(r));
};

export const submitBookedTicket = async (id: string, ticketDetails: BookedTicket): Promise<TicketBooking> => {
  return fetch(`${API}/ticket-bookings/${id}/submit-booked-ticket`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticketDetails, performedBy: 'VFS Global' }),
  }).then(r => json(r));
};

export const shareTicket = async (id: string): Promise<TicketBooking> => {
  return fetch(`${API}/ticket-bookings/${id}/share-ticket`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ performedBy: 'Hari Kumar' }),
  }).then(r => json(r));
};

export const fetchTicketEmails = async (id: string): Promise<EmailLogEntry[]> => {
  return fetch(`${API}/ticket-bookings/${id}/emails`).then(r => json(r));
};
