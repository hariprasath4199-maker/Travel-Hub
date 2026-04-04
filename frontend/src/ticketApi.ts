import { isBackendAvailable } from './demoData';
import { type VisaRequestStatus, type UserRole } from './visaApi';
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
  applicantName: string;
  applicantEmail: string;
  managerName: string;
  managerEmail: string;
  destination: string;
  travelStartDate: string;
  travelEndDate: string;
  purpose: string;
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

// Demo data with 3 sample bookings at different stages
const generateId = () => 'TB-' + Math.random().toString(36).substr(2, 9).toUpperCase();

const DEMO_TICKET_BOOKINGS: TicketBooking[] = [
  {
    id: 'TB-DEMO-001',
    visaRequestId: 'VISA-DEMO-1',
    applicantName: 'Ravi Shankar',
    applicantEmail: 'ravi.shankar@zalaris.com',
    managerName: 'Gopinath Subramani',
    managerEmail: 'gopinath@zalaris.com',
    destination: 'Germany',
    travelStartDate: '2026-04-20',
    travelEndDate: '2026-06-05',
    purpose: 'Work visa assignment to Berlin office',
    status: 'ITINERARY_PROVIDED',
    currentStep: 3,
    itineraryOptions: [
      {
        id: 'opt-1',
        airline: 'Lufthansa',
        flightNumber: 'LH123',
        departureTime: '2026-04-20T08:00:00Z',
        arrivalTime: '2026-04-20T11:30:00Z',
        price: 450,
        currency: 'EUR',
        class: 'Economy',
        stops: 0,
      },
      {
        id: 'opt-2',
        airline: 'Air France',
        flightNumber: 'AF456',
        departureTime: '2026-04-20T10:00:00Z',
        arrivalTime: '2026-04-20T13:15:00Z',
        price: 520,
        currency: 'EUR',
        class: 'Economy',
        stops: 1,
      },
      {
        id: 'opt-3',
        airline: 'Lufthansa',
        flightNumber: 'LH200',
        departureTime: '2026-04-20T14:00:00Z',
        arrivalTime: '2026-04-20T17:30:00Z',
        price: 380,
        currency: 'EUR',
        class: 'Economy',
        stops: 0,
      },
    ],
    workflowHistory: [
      {
        id: 'evt-1',
        step: 1,
        action: 'Ticket booking request submitted',
        fromStatus: null,
        toStatus: 'TICKET_REQUESTED',
        performedBy: 'Gopinath Subramani',
        performedByRole: 'MANAGER',
        timestamp: '2026-04-01T09:00:00Z',
      },
      {
        id: 'evt-2',
        step: 2,
        action: 'Itinerary requested from vendor',
        fromStatus: 'TICKET_REQUESTED',
        toStatus: 'ITINERARY_REQUESTED',
        performedBy: 'Hari Kumar',
        performedByRole: 'HR_ADMIN',
        timestamp: '2026-04-01T10:30:00Z',
      },
      {
        id: 'evt-3',
        step: 3,
        action: 'Vendor provided itinerary options',
        fromStatus: 'ITINERARY_REQUESTED',
        toStatus: 'ITINERARY_PROVIDED',
        performedBy: 'VFS Global',
        performedByRole: 'VENDOR',
        timestamp: '2026-04-02T14:00:00Z',
      },
    ],
    emailLog: [
      {
        id: 'email-1',
        to: ['hari.kumar@zalaris.com'],
        subject: 'Ticket Booking Request',
        sentAt: '2026-04-01T09:00:00Z',
        fromRole: 'MANAGER',
      },
      {
        id: 'email-2',
        to: ['appointments@vfsglobal.com'],
        subject: 'Itinerary Request',
        sentAt: '2026-04-01T10:30:00Z',
        fromRole: 'HR_ADMIN',
      },
      {
        id: 'email-3',
        to: ['hari.kumar@zalaris.com'],
        subject: 'Itinerary Options Available',
        sentAt: '2026-04-02T14:00:00Z',
        fromRole: 'VENDOR',
      },
    ],
    createdAt: '2026-04-01T09:00:00Z',
    updatedAt: '2026-04-02T14:00:00Z',
  },
  {
    id: 'TB-DEMO-002',
    visaRequestId: 'VISA-DEMO-2',
    applicantName: 'Marcus Weber',
    applicantEmail: 'marcus.weber@zalaris.com',
    managerName: 'Gopinath Subramani',
    managerEmail: 'gopinath@zalaris.com',
    destination: 'Finland',
    travelStartDate: '2026-05-10',
    travelEndDate: '2026-05-24',
    purpose: 'Business visa for partner meetings',
    status: 'EVP_APPROVED',
    currentStep: 5,
    itineraryOptions: [
      {
        id: 'opt-4',
        airline: 'Finnair',
        flightNumber: 'AY789',
        departureTime: '2026-05-10T09:00:00Z',
        arrivalTime: '2026-05-10T12:30:00Z',
        price: 380,
        currency: 'EUR',
        class: 'Economy',
        stops: 0,
      },
    ],
    selectedItinerary: {
      id: 'opt-4',
      airline: 'Finnair',
      flightNumber: 'AY789',
      departureTime: '2026-05-10T09:00:00Z',
      arrivalTime: '2026-05-10T12:30:00Z',
      price: 380,
      currency: 'EUR',
      class: 'Economy',
      stops: 0,
    },
    evpDecision: 'approve',
    evpComments: 'Approved for business travel',
    evpName: 'Marcus Weber',
    evpEmail: 'marcus.weber@zalaris.com',
    workflowHistory: [
      {
        id: 'evt-4',
        step: 1,
        action: 'Ticket booking request submitted',
        fromStatus: null,
        toStatus: 'TICKET_REQUESTED',
        performedBy: 'Gopinath Subramani',
        performedByRole: 'MANAGER',
        timestamp: '2026-04-05T08:00:00Z',
      },
      {
        id: 'evt-5',
        step: 2,
        action: 'Itinerary requested from vendor',
        fromStatus: 'TICKET_REQUESTED',
        toStatus: 'ITINERARY_REQUESTED',
        performedBy: 'Hari Kumar',
        performedByRole: 'HR_ADMIN',
        timestamp: '2026-04-05T10:00:00Z',
      },
      {
        id: 'evt-6',
        step: 3,
        action: 'Vendor provided itinerary options',
        fromStatus: 'ITINERARY_REQUESTED',
        toStatus: 'ITINERARY_PROVIDED',
        performedBy: 'VFS Global',
        performedByRole: 'VENDOR',
        timestamp: '2026-04-06T11:00:00Z',
      },
      {
        id: 'evt-7',
        step: 4,
        action: 'Itinerary shared with EVP for approval',
        fromStatus: 'ITINERARY_PROVIDED',
        toStatus: 'EVP_APPROVAL_PENDING',
        performedBy: 'Hari Kumar',
        performedByRole: 'HR_ADMIN',
        timestamp: '2026-04-06T15:00:00Z',
      },
      {
        id: 'evt-8',
        step: 5,
        action: 'EVP approved the itinerary',
        fromStatus: 'EVP_APPROVAL_PENDING',
        toStatus: 'EVP_APPROVED',
        performedBy: 'Marcus Weber',
        performedByRole: 'EVP',
        timestamp: '2026-04-07T09:00:00Z',
      },
    ],
    emailLog: [
      {
        id: 'email-4',
        to: ['hari.kumar@zalaris.com'],
        subject: 'Ticket Booking Request',
        sentAt: '2026-04-05T08:00:00Z',
        fromRole: 'MANAGER',
      },
      {
        id: 'email-5',
        to: ['appointments@vfsglobal.com'],
        subject: 'Itinerary Request',
        sentAt: '2026-04-05T10:00:00Z',
        fromRole: 'HR_ADMIN',
      },
      {
        id: 'email-6',
        to: ['hari.kumar@zalaris.com'],
        subject: 'Itinerary Options Available',
        sentAt: '2026-04-06T11:00:00Z',
        fromRole: 'VENDOR',
      },
      {
        id: 'email-7',
        to: ['marcus.weber@zalaris.com'],
        subject: 'Travel Itinerary for Review',
        sentAt: '2026-04-06T15:00:00Z',
        fromRole: 'HR_ADMIN',
      },
      {
        id: 'email-8',
        to: ['hari.kumar@zalaris.com'],
        subject: 'EVP Approval Decision',
        sentAt: '2026-04-07T09:00:00Z',
        fromRole: 'EVP',
      },
    ],
    createdAt: '2026-04-05T08:00:00Z',
    updatedAt: '2026-04-07T09:00:00Z',
  },
  {
    id: 'TB-DEMO-003',
    visaRequestId: 'VISA-DEMO-1',
    applicantName: 'Anna Fischer',
    applicantEmail: 'anna.fischer@zalaris.com',
    managerName: 'Gopinath Subramani',
    managerEmail: 'gopinath@zalaris.com',
    destination: 'Norway',
    travelStartDate: '2026-06-10',
    travelEndDate: '2026-06-20',
    purpose: 'Quarterly audit and compliance review',
    status: 'TICKET_SHARED',
    currentStep: 6,
    itineraryOptions: [
      {
        id: 'opt-5',
        airline: 'SAS',
        flightNumber: 'SK456',
        departureTime: '2026-06-10T07:00:00Z',
        arrivalTime: '2026-06-10T10:00:00Z',
        price: 420,
        currency: 'EUR',
        class: 'Economy',
        stops: 0,
      },
    ],
    selectedItinerary: {
      id: 'opt-5',
      airline: 'SAS',
      flightNumber: 'SK456',
      departureTime: '2026-06-10T07:00:00Z',
      arrivalTime: '2026-06-10T10:00:00Z',
      price: 420,
      currency: 'EUR',
      class: 'Economy',
      stops: 0,
    },
    evpDecision: 'approve',
    evpName: 'Marcus Weber',
    evpEmail: 'marcus.weber@zalaris.com',
    bookedTicket: {
      airline: 'SAS',
      flightNumber: 'SK456',
      departure: '2026-06-10T07:00:00Z',
      arrival: '2026-06-10T10:00:00Z',
      bookingRef: 'SAS-REF-123456',
      ticketUrl: 'https://booking.sas.se/ticket/123456',
      bookedAt: '2026-04-10T14:00:00Z',
    },
    workflowHistory: [
      {
        id: 'evt-9',
        step: 1,
        action: 'Ticket booking request submitted',
        fromStatus: null,
        toStatus: 'TICKET_REQUESTED',
        performedBy: 'Gopinath Subramani',
        performedByRole: 'MANAGER',
        timestamp: '2026-04-08T08:00:00Z',
      },
      {
        id: 'evt-10',
        step: 2,
        action: 'Itinerary requested from vendor',
        fromStatus: 'TICKET_REQUESTED',
        toStatus: 'ITINERARY_REQUESTED',
        performedBy: 'Hari Kumar',
        performedByRole: 'HR_ADMIN',
        timestamp: '2026-04-08T10:00:00Z',
      },
      {
        id: 'evt-11',
        step: 3,
        action: 'Vendor provided itinerary options',
        fromStatus: 'ITINERARY_REQUESTED',
        toStatus: 'ITINERARY_PROVIDED',
        performedBy: 'VFS Global',
        performedByRole: 'VENDOR',
        timestamp: '2026-04-09T11:00:00Z',
      },
      {
        id: 'evt-12',
        step: 4,
        action: 'Itinerary shared with EVP for approval',
        fromStatus: 'ITINERARY_PROVIDED',
        toStatus: 'EVP_APPROVAL_PENDING',
        performedBy: 'Hari Kumar',
        performedByRole: 'HR_ADMIN',
        timestamp: '2026-04-09T15:00:00Z',
      },
      {
        id: 'evt-13',
        step: 5,
        action: 'EVP approved and booking requested',
        fromStatus: 'EVP_APPROVAL_PENDING',
        toStatus: 'BOOKING_REQUESTED',
        performedBy: 'Hari Kumar',
        performedByRole: 'HR_ADMIN',
        timestamp: '2026-04-10T09:00:00Z',
      },
      {
        id: 'evt-14',
        step: 6,
        action: 'Ticket booked by vendor',
        fromStatus: 'BOOKING_REQUESTED',
        toStatus: 'TICKET_BOOKED',
        performedBy: 'VFS Global',
        performedByRole: 'VENDOR',
        timestamp: '2026-04-10T14:00:00Z',
      },
      {
        id: 'evt-15',
        step: 6,
        action: 'Ticket shared with manager and applicant',
        fromStatus: 'TICKET_BOOKED',
        toStatus: 'TICKET_SHARED',
        performedBy: 'Hari Kumar',
        performedByRole: 'HR_ADMIN',
        timestamp: '2026-04-10T15:30:00Z',
      },
    ],
    emailLog: [
      {
        id: 'email-9',
        to: ['hari.kumar@zalaris.com'],
        subject: 'Ticket Booking Request',
        sentAt: '2026-04-08T08:00:00Z',
        fromRole: 'MANAGER',
      },
      {
        id: 'email-10',
        to: ['appointments@vfsglobal.com'],
        subject: 'Itinerary Request',
        sentAt: '2026-04-08T10:00:00Z',
        fromRole: 'HR_ADMIN',
      },
      {
        id: 'email-11',
        to: ['hari.kumar@zalaris.com'],
        subject: 'Itinerary Options Available',
        sentAt: '2026-04-09T11:00:00Z',
        fromRole: 'VENDOR',
      },
      {
        id: 'email-12',
        to: ['anna.fischer@zalaris.com', 'gopinath@zalaris.com'],
        subject: 'Travel Itinerary for Review',
        sentAt: '2026-04-09T15:00:00Z',
        fromRole: 'HR_ADMIN',
      },
      {
        id: 'email-13',
        to: ['hari.kumar@zalaris.com'],
        subject: 'Booking Confirmed',
        sentAt: '2026-04-10T14:00:00Z',
        fromRole: 'VENDOR',
      },
      {
        id: 'email-14',
        to: ['anna.fischer@zalaris.com', 'gopinath@zalaris.com'],
        subject: 'Your Travel Ticket',
        sentAt: '2026-04-10T15:30:00Z',
        fromRole: 'HR_ADMIN',
      },
    ],
    createdAt: '2026-04-08T08:00:00Z',
    updatedAt: '2026-04-10T15:30:00Z',
  },
];

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
  if (!(await isBackendAvailable())) {
    const stored = localStorage.getItem('zalaris_ticket_bookings');
    return stored ? JSON.parse(stored) : DEMO_TICKET_BOOKINGS;
  }
  return fetch(`${API}/ticket-bookings`).then(r => json(r));
};

export const fetchTicketBookingById = async (id: string): Promise<TicketBooking> => {
  if (!(await isBackendAvailable())) {
    const stored = localStorage.getItem('zalaris_ticket_bookings');
    const bookings = stored ? JSON.parse(stored) : DEMO_TICKET_BOOKINGS;
    const found = bookings.find((b: TicketBooking) => b.id === id);
    if (found) return found;
    throw new Error('Not found');
  }
  return fetch(`${API}/ticket-bookings/${id}`).then(r => json(r));
};

export const createTicketBooking = async (data: Partial<TicketBooking>): Promise<TicketBooking> => {
  const backend = await isBackendAvailable();

  const booking: TicketBooking = {
    id: generateId(),
    visaRequestId: data.visaRequestId || '',
    applicantName: data.applicantName || '',
    applicantEmail: data.applicantEmail || '',
    managerName: data.managerName || '',
    managerEmail: data.managerEmail || '',
    destination: data.destination || '',
    travelStartDate: data.travelStartDate || '',
    travelEndDate: data.travelEndDate || '',
    purpose: data.purpose || '',
    status: 'TICKET_REQUESTED',
    currentStep: 1,
    itineraryOptions: [],
    workflowHistory: [
      {
        id: `evt-${Date.now()}`,
        step: 1,
        action: 'Ticket booking request submitted',
        fromStatus: null,
        toStatus: 'TICKET_REQUESTED',
        performedBy: data.managerName || 'Unknown',
        performedByRole: 'MANAGER',
        timestamp: new Date().toISOString(),
      },
    ],
    emailLog: [
      {
        id: `email-${Date.now()}`,
        to: ['hari.kumar@zalaris.com'],
        subject: 'Ticket Booking Request',
        sentAt: new Date().toISOString(),
        fromRole: 'MANAGER',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (backend) {
    return fetch(`${API}/ticket-bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
    }).then(r => json(r));
  }

  const stored = localStorage.getItem('zalaris_ticket_bookings');
  const bookings = stored ? JSON.parse(stored) : DEMO_TICKET_BOOKINGS;
  bookings.push(booking);
  localStorage.setItem('zalaris_ticket_bookings', JSON.stringify(bookings));
  return booking;
};

export const requestItinerary = async (id: string, comments?: string): Promise<TicketBooking> => {
  const backend = await isBackendAvailable();
  const payload = { comments, performedBy: 'Hari Kumar' };

  if (backend) {
    return fetch(`${API}/ticket-bookings/${id}/request-itinerary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(r => json(r));
  }

  const stored = localStorage.getItem('zalaris_ticket_bookings');
  const bookings = stored ? JSON.parse(stored) : DEMO_TICKET_BOOKINGS;
  const booking = bookings.find((b: TicketBooking) => b.id === id);
  if (!booking) throw new Error('Not found');

  booking.status = 'ITINERARY_REQUESTED';
  booking.currentStep = 2;
  booking.updatedAt = new Date().toISOString();
  booking.workflowHistory.push({
    id: `evt-${Date.now()}`,
    step: 2,
    action: 'Itinerary requested from vendor',
    fromStatus: 'TICKET_REQUESTED',
    toStatus: 'ITINERARY_REQUESTED',
    performedBy: 'Hari Kumar',
    performedByRole: 'HR_ADMIN',
    timestamp: new Date().toISOString(),
    comments,
  });

  localStorage.setItem('zalaris_ticket_bookings', JSON.stringify(bookings));
  return booking;
};

export const submitItinerary = async (id: string, itineraryOptions: ItineraryOption[]): Promise<TicketBooking> => {
  const backend = await isBackendAvailable();
  const payload = { itineraryOptions, performedBy: 'VFS Global' };

  if (backend) {
    return fetch(`${API}/ticket-bookings/${id}/submit-itinerary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(r => json(r));
  }

  const stored = localStorage.getItem('zalaris_ticket_bookings');
  const bookings = stored ? JSON.parse(stored) : DEMO_TICKET_BOOKINGS;
  const booking = bookings.find((b: TicketBooking) => b.id === id);
  if (!booking) throw new Error('Not found');

  booking.itineraryOptions = itineraryOptions;
  booking.status = 'ITINERARY_PROVIDED';
  booking.currentStep = 3;
  booking.updatedAt = new Date().toISOString();
  booking.workflowHistory.push({
    id: `evt-${Date.now()}`,
    step: 3,
    action: 'Vendor provided itinerary options',
    fromStatus: 'ITINERARY_REQUESTED',
    toStatus: 'ITINERARY_PROVIDED',
    performedBy: 'VFS Global',
    performedByRole: 'VENDOR',
    timestamp: new Date().toISOString(),
  });

  localStorage.setItem('zalaris_ticket_bookings', JSON.stringify(bookings));
  return booking;
};

export const shareItinerary = async (id: string, selectedItinerary: ItineraryOption): Promise<TicketBooking> => {
  const backend = await isBackendAvailable();
  const payload = { selectedItinerary, performedBy: 'Hari Kumar' };

  if (backend) {
    return fetch(`${API}/ticket-bookings/${id}/share-itinerary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(r => json(r));
  }

  const stored = localStorage.getItem('zalaris_ticket_bookings');
  const bookings = stored ? JSON.parse(stored) : DEMO_TICKET_BOOKINGS;
  const booking = bookings.find((b: TicketBooking) => b.id === id);
  if (!booking) throw new Error('Not found');

  booking.selectedItinerary = selectedItinerary;
  booking.status = 'EVP_APPROVAL_PENDING';
  booking.currentStep = 4;
  booking.updatedAt = new Date().toISOString();
  booking.workflowHistory.push({
    id: `evt-${Date.now()}`,
    step: 4,
    action: 'Itinerary shared with EVP for approval',
    fromStatus: 'ITINERARY_PROVIDED',
    toStatus: 'EVP_APPROVAL_PENDING',
    performedBy: 'Hari Kumar',
    performedByRole: 'HR_ADMIN',
    timestamp: new Date().toISOString(),
  });

  localStorage.setItem('zalaris_ticket_bookings', JSON.stringify(bookings));
  return booking;
};

export const submitEvpDecision = async (id: string, approved: boolean, comments?: string): Promise<TicketBooking> => {
  const backend = await isBackendAvailable();
  const payload = { approved, comments, performedBy: 'Marcus Weber' };

  if (backend) {
    return fetch(`${API}/ticket-bookings/${id}/evp-decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(r => json(r));
  }

  const stored = localStorage.getItem('zalaris_ticket_bookings');
  const bookings = stored ? JSON.parse(stored) : DEMO_TICKET_BOOKINGS;
  const booking = bookings.find((b: TicketBooking) => b.id === id);
  if (!booking) throw new Error('Not found');

  const newStatus: TicketBookingStatus = approved ? 'EVP_APPROVED' : 'EVP_REJECTED';
  booking.evpDecision = approved ? 'approve' : 'reject';
  booking.evpComments = comments;
  booking.evpName = 'Marcus Weber';
  booking.evpEmail = 'marcus.weber@zalaris.com';
  booking.status = newStatus;
  booking.currentStep = 5;
  booking.updatedAt = new Date().toISOString();
  booking.workflowHistory.push({
    id: `evt-${Date.now()}`,
    step: 5,
    action: approved ? 'EVP approved the itinerary' : 'EVP rejected the itinerary',
    fromStatus: 'EVP_APPROVAL_PENDING',
    toStatus: newStatus,
    performedBy: 'Marcus Weber',
    performedByRole: 'EVP',
    timestamp: new Date().toISOString(),
    comments,
  });

  localStorage.setItem('zalaris_ticket_bookings', JSON.stringify(bookings));
  return booking;
};

export const requestBooking = async (id: string, selectedItineraryId: string): Promise<TicketBooking> => {
  const backend = await isBackendAvailable();
  const payload = { selectedItineraryId, performedBy: 'Hari Kumar' };

  if (backend) {
    return fetch(`${API}/ticket-bookings/${id}/request-booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(r => json(r));
  }

  const stored = localStorage.getItem('zalaris_ticket_bookings');
  const bookings = stored ? JSON.parse(stored) : DEMO_TICKET_BOOKINGS;
  const booking = bookings.find((b: TicketBooking) => b.id === id);
  if (!booking) throw new Error('Not found');

  booking.status = 'BOOKING_REQUESTED';
  booking.currentStep = 5;
  booking.updatedAt = new Date().toISOString();
  booking.workflowHistory.push({
    id: `evt-${Date.now()}`,
    step: 5,
    action: 'HR Admin requested vendor to book ticket',
    fromStatus: 'EVP_APPROVED',
    toStatus: 'BOOKING_REQUESTED',
    performedBy: 'Hari Kumar',
    performedByRole: 'HR_ADMIN',
    timestamp: new Date().toISOString(),
  });

  localStorage.setItem('zalaris_ticket_bookings', JSON.stringify(bookings));
  return booking;
};

export const submitBookedTicket = async (id: string, ticketDetails: BookedTicket): Promise<TicketBooking> => {
  const backend = await isBackendAvailable();
  const payload = { ticketDetails, performedBy: 'VFS Global' };

  if (backend) {
    return fetch(`${API}/ticket-bookings/${id}/submit-booked-ticket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(r => json(r));
  }

  const stored = localStorage.getItem('zalaris_ticket_bookings');
  const bookings = stored ? JSON.parse(stored) : DEMO_TICKET_BOOKINGS;
  const booking = bookings.find((b: TicketBooking) => b.id === id);
  if (!booking) throw new Error('Not found');

  booking.bookedTicket = ticketDetails;
  booking.status = 'TICKET_BOOKED';
  booking.currentStep = 6;
  booking.updatedAt = new Date().toISOString();
  booking.workflowHistory.push({
    id: `evt-${Date.now()}`,
    step: 6,
    action: 'Vendor booked the ticket',
    fromStatus: 'BOOKING_REQUESTED',
    toStatus: 'TICKET_BOOKED',
    performedBy: 'VFS Global',
    performedByRole: 'VENDOR',
    timestamp: new Date().toISOString(),
  });

  localStorage.setItem('zalaris_ticket_bookings', JSON.stringify(bookings));
  return booking;
};

export const shareTicket = async (id: string): Promise<TicketBooking> => {
  const backend = await isBackendAvailable();
  const payload = { performedBy: 'Hari Kumar' };

  if (backend) {
    return fetch(`${API}/ticket-bookings/${id}/share-ticket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(r => json(r));
  }

  const stored = localStorage.getItem('zalaris_ticket_bookings');
  const bookings = stored ? JSON.parse(stored) : DEMO_TICKET_BOOKINGS;
  const booking = bookings.find((b: TicketBooking) => b.id === id);
  if (!booking) throw new Error('Not found');

  booking.status = 'TICKET_SHARED';
  booking.currentStep = 6;
  booking.updatedAt = new Date().toISOString();
  booking.workflowHistory.push({
    id: `evt-${Date.now()}`,
    step: 6,
    action: 'Ticket shared with manager and applicant',
    fromStatus: 'TICKET_BOOKED',
    toStatus: 'TICKET_SHARED',
    performedBy: 'Hari Kumar',
    performedByRole: 'HR_ADMIN',
    timestamp: new Date().toISOString(),
  });

  booking.emailLog.push({
    id: `email-${Date.now()}`,
    to: [booking.managerEmail, booking.applicantEmail],
    subject: 'Your Travel Ticket',
    sentAt: new Date().toISOString(),
    fromRole: 'HR_ADMIN',
  });

  localStorage.setItem('zalaris_ticket_bookings', JSON.stringify(bookings));
  return booking;
};

export const fetchTicketEmails = async (id: string): Promise<EmailLogEntry[]> => {
  if (!(await isBackendAvailable())) {
    const stored = localStorage.getItem('zalaris_ticket_bookings');
    const bookings = stored ? JSON.parse(stored) : DEMO_TICKET_BOOKINGS;
    const booking = bookings.find((b: TicketBooking) => b.id === id);
    return booking?.emailLog || [];
  }
  return fetch(`${API}/ticket-bookings/${id}/emails`).then(r => json(r));
};
