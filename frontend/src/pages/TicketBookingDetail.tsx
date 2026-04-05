import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Loader2, ArrowLeft, User, Mail, Globe, Calendar, Building2, CreditCard,
  FileText, MessageSquare, Send, CheckCircle, XCircle, AlertTriangle, MapPin, DollarSign,
} from 'lucide-react';
import {
  fetchTicketBookingById, fetchTicketEmails, requestItinerary, submitItinerary,
  shareItinerary, submitEvpDecision, requestBooking, submitBookedTicket, shareTicket,
  STEP_LABELS, STATUS_LABELS,
  type TicketBooking, type UserRole, type ItineraryOption, type BookedTicket,
} from '@/src/ticketApi';
import { StatusBadge } from '@/src/components/StatusBadge';
import { BoardingPassTracker } from '@/src/components/BoardingPassTracker';
import { useUserRole } from '@/src/context/UserRoleContext';

export default function TicketBookingDetail() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useUserRole();
  const [booking, setBooking] = useState<TicketBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetchTicketBookingById(id),
      fetchTicketEmails(id),
    ])
      .then(([b]) => setBooking(b))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRequestItinerary = useCallback(async () => {
    if (!booking || !id) return;
    setSubmitting(true);
    try {
      const updated = await requestItinerary(id);
      setBooking(updated);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }, [booking, id]);

  const handleSubmitItinerary = useCallback(async (options: ItineraryOption[]) => {
    if (!booking || !id) return;
    setSubmitting(true);
    try {
      const updated = await submitItinerary(id, options);
      setBooking(updated);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }, [booking, id]);

  const handleShareItinerary = useCallback(async (selected: ItineraryOption) => {
    if (!booking || !id) return;
    setSubmitting(true);
    try {
      const updated = await shareItinerary(id, selected);
      setBooking(updated);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }, [booking, id]);

  const handleEvpDecision = useCallback(async (approved: boolean, comments: string) => {
    if (!booking || !id) return;
    setSubmitting(true);
    try {
      const updated = await submitEvpDecision(id, approved, comments);
      setBooking(updated);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }, [booking, id]);

  const handleRequestBooking = useCallback(async (itineraryId: string) => {
    if (!booking || !id) return;
    setSubmitting(true);
    try {
      const updated = await requestBooking(id, itineraryId);
      setBooking(updated);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }, [booking, id]);

  const handleSubmitBookedTicket = useCallback(async (ticket: BookedTicket) => {
    if (!booking || !id) return;
    setSubmitting(true);
    try {
      const updated = await submitBookedTicket(id, ticket);
      setBooking(updated);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }, [booking, id]);

  const handleShareTicket = useCallback(async () => {
    if (!booking || !id) return;
    setSubmitting(true);
    try {
      const updated = await shareTicket(id);
      setBooking(updated);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }, [booking, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="p-10 max-w-[1400px] mx-auto">
        <Link to="/ticket-bookings" className="flex items-center gap-2 text-primary hover:text-primary-dim mb-6 transition-colors">
          <ArrowLeft size={18} />
          <span className="font-bold">Back to Ticket Bookings</span>
        </Link>
        <div className="bg-error-container/20 text-on-error-container p-6 rounded-xl">
          <p className="font-bold">Failed to load booking</p>
          <p className="text-sm mt-1">{error || 'Not found'}</p>
        </div>
      </div>
    );
  }

  const role = currentUser?.role as UserRole;

  return (
    <div className="p-10 space-y-6 max-w-[1400px] mx-auto">
      {/* Back Button */}
      <Link to="/ticket-bookings" className="flex items-center gap-2 text-primary hover:text-primary-dim transition-colors w-fit">
        <ArrowLeft size={18} />
        <span className="font-bold">Back to Ticket Bookings</span>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">{booking.destination} Ticket</h1>
          <p className="text-on-surface-variant text-sm mt-2">Request ID: {booking.id}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Progress Tracker — Flight Ticket Style */}
      <BoardingPassTracker currentStep={booking.currentStep} status={booking.status} booking={booking} />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Request Details & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Details Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-on-surface">Request Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Employee ID</p>
                <p className="text-on-surface mt-1">{booking.employeeId || '--'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Applicant</p>
                <p className="text-on-surface mt-1">{booking.applicantName}</p>
                <p className="text-sm text-on-surface-variant">{booking.applicantEmail}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Manager</p>
                <p className="text-on-surface mt-1">{booking.managerName}</p>
                <p className="text-sm text-on-surface-variant">{booking.managerEmail}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Destination</p>
                <p className="text-on-surface mt-1 flex items-center gap-2">
                  <Globe size={16} />
                  {booking.destination}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Travel Dates</p>
                <p className="text-on-surface mt-1 flex items-center gap-2">
                  <Calendar size={16} />
                  {new Date(booking.travelStartDate).toLocaleDateString()} - {new Date(booking.travelEndDate).toLocaleDateString()}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Purpose</p>
                <p className="text-on-surface mt-1">{booking.purpose}</p>
              </div>
            </div>
          </div>

          {/* Step 1: Ticket Request — Info only for Manager/Applicant */}
          {booking.currentStep === 1 && (role === 'APPLICANT' || role === 'MANAGER') && booking.status === 'TICKET_REQUESTED' && (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-on-surface mb-4">Step 1: Ticket Requested</h2>
              <p className="text-on-surface-variant text-sm">Your ticket request has been submitted. Waiting for HR Admin to request itinerary from the vendor.</p>
            </div>
          )}

          {/* Step 2: Request Itinerary */}
          {booking.currentStep >= 1 && role === 'HR_ADMIN' && booking.status === 'TICKET_REQUESTED' && (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-on-surface mb-4">Step 2: Request Itinerary from Vendor</h2>
              <p className="text-on-surface-variant text-sm mb-4">Send itinerary request to the travel vendor</p>
              <button
                onClick={handleRequestItinerary}
                disabled={submitting}
                className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                Request Itinerary
              </button>
            </div>
          )}

          {/* Step 3: Vendor Provides Itinerary */}
          {booking.currentStep >= 2 && role === 'VENDOR' && booking.status === 'ITINERARY_REQUESTED' && (
            <VendorItineraryPanel
              booking={booking}
              submitting={submitting}
              onSubmit={handleSubmitItinerary}
            />
          )}

          {/* Step 4: Share Itinerary & EVP Approval */}
          {booking.currentStep >= 3 && booking.status === 'ITINERARY_PROVIDED' && role === 'HR_ADMIN' && (
            <ShareItineraryPanel
              booking={booking}
              submitting={submitting}
              onShare={handleShareItinerary}
            />
          )}

          {/* Step 4B: EVP Approval */}
          {booking.currentStep >= 4 && booking.status === 'EVP_APPROVAL_PENDING' && role === 'EVP' && (
            <EvpApprovalPanel
              booking={booking}
              submitting={submitting}
              onDecision={handleEvpDecision}
            />
          )}

          {/* Step 5: Request Booking */}
          {booking.currentStep >= 5 && role === 'HR_ADMIN' && booking.status === 'EVP_APPROVED' && (
            <RequestBookingPanel
              booking={booking}
              submitting={submitting}
              onRequestBooking={handleRequestBooking}
            />
          )}

          {/* Step 6: Vendor Submits Booked Ticket */}
          {booking.currentStep >= 5 && role === 'VENDOR' && booking.status === 'BOOKING_REQUESTED' && (
            <VendorBookTicketPanel
              booking={booking}
              submitting={submitting}
              onSubmitTicket={handleSubmitBookedTicket}
            />
          )}

          {/* Step 6B: HR Shares Ticket */}
          {booking.currentStep >= 6 && role === 'HR_ADMIN' && booking.status === 'TICKET_BOOKED' && (
            <ShareTicketPanel
              booking={booking}
              submitting={submitting}
              onShare={handleShareTicket}
            />
          )}

          {/* Display Booked Ticket */}
          {booking.bookedTicket && (
            <TicketDisplayPanel ticket={booking.bookedTicket} />
          )}
        </div>

        {/* Right Column - Itineraries & Email Log */}
        <div className="space-y-6">
          {/* Itinerary Options */}
          {booking.itineraryOptions.length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-on-surface mb-4">Available Itineraries</h3>
              <div className="space-y-3">
                {booking.itineraryOptions.map((option) => (
                  <div key={option.id} className="bg-surface-container rounded-lg p-4 border border-outline-variant/20">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-bold text-on-surface">{option.airline}</p>
                      <p className="text-xs font-bold text-primary">{option.price} {option.currency}</p>
                    </div>
                    <p className="text-xs text-on-surface-variant">Flight {option.flightNumber}</p>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {new Date(option.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(option.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-on-surface-variant">{option.class} • {option.stops === 0 ? 'Direct' : `${option.stops} stop(s)`}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email Log */}
          {booking.emailLog.length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-on-surface mb-4">Email Log</h3>
              <div className="space-y-2">
                {booking.emailLog.map((email) => (
                  <div key={email.id} className="text-xs border-l-2 border-primary pl-3 py-2">
                    <p className="font-bold text-on-surface">{email.subject}</p>
                    <p className="text-on-surface-variant text-[11px] mt-1">{email.to.join(', ')}</p>
                    <p className="text-on-surface-variant/60 text-[10px] mt-1">{new Date(email.sentAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workflow History */}
          {booking.workflowHistory.length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-on-surface mb-4">Timeline</h3>
              <div className="space-y-3">
                {booking.workflowHistory.map((event) => (
                  <div key={event.id} className="border-l-2 border-primary pl-3 py-2">
                    <p className="text-xs font-bold text-on-surface">{event.action}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{event.performedBy} ({event.performedByRole})</p>
                    <p className="text-[11px] text-on-surface-variant/60 mt-1">{new Date(event.timestamp).toLocaleString()}</p>
                    {event.comments && <p className="text-xs text-on-surface-variant mt-1 italic">"{event.comments}"</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================ */
/* STEP PANELS */
/* ============================================================================ */

function VendorItineraryPanel({
  booking, submitting, onSubmit,
}: {
  booking: TicketBooking; submitting: boolean; onSubmit: (opts: ItineraryOption[]) => Promise<void>;
}) {
  const [options, setOptions] = useState<ItineraryOption[]>([
    { id: `opt-${Date.now()}`, airline: '', flightNumber: '', departureTime: '', arrivalTime: '', price: 0, currency: 'EUR', class: 'Economy', stops: 0 },
  ]);

  const updateOption = (i: number, field: string, val: any) => {
    setOptions((opts) => opts.map((opt, idx) => (idx === i ? { ...opt, [field]: val } : opt)));
  };

  const addOption = () => {
    setOptions((opts) => [...opts, { id: `opt-${Date.now()}`, airline: '', flightNumber: '', departureTime: '', arrivalTime: '', price: 0, currency: 'EUR', class: 'Economy', stops: 0 }]);
  };

  const handleSubmit = async () => {
    await onSubmit(options);
  };

  const inputCls = 'w-full bg-surface-container-low border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all';

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-bold text-on-surface mb-4">Step 3: Provide Itinerary Options</h2>
      <div className="space-y-4 mb-4">
        {options.map((opt, idx) => (
          <div key={opt.id} className="bg-surface-container rounded-lg p-4 space-y-3">
            <p className="text-xs font-bold text-on-surface-variant">Option {idx + 1}</p>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Airline" value={opt.airline} onChange={(e) => updateOption(idx, 'airline', e.target.value)} className={inputCls} />
              <input type="text" placeholder="Flight #" value={opt.flightNumber} onChange={(e) => updateOption(idx, 'flightNumber', e.target.value)} className={inputCls} />
              <input type="datetime-local" placeholder="Departure" value={opt.departureTime} onChange={(e) => updateOption(idx, 'departureTime', e.target.value)} className={inputCls} />
              <input type="datetime-local" placeholder="Arrival" value={opt.arrivalTime} onChange={(e) => updateOption(idx, 'arrivalTime', e.target.value)} className={inputCls} />
              <input type="number" placeholder="Price" value={opt.price} onChange={(e) => updateOption(idx, 'price', parseFloat(e.target.value))} className={inputCls} />
              <select value={opt.class} onChange={(e) => updateOption(idx, 'class', e.target.value)} className={inputCls}>
                <option>Economy</option>
                <option>Business</option>
                <option>First</option>
              </select>
              <input type="number" placeholder="Stops" value={opt.stops} onChange={(e) => updateOption(idx, 'stops', parseInt(e.target.value))} className={inputCls} />
            </div>
          </div>
        ))}
      </div>
      <button onClick={addOption} className="text-primary font-bold text-sm mb-4 hover:text-primary-dim transition-colors">+ Add Another Option</button>
      <button onClick={handleSubmit} disabled={submitting} className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary-dim transition-all disabled:opacity-70 flex items-center gap-2">
        {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        Submit Itineraries
      </button>
    </div>
  );
}

function ShareItineraryPanel({
  booking, submitting, onShare,
}: {
  booking: TicketBooking; submitting: boolean; onShare: (opt: ItineraryOption) => Promise<void>;
}) {
  const [selectedId, setSelectedId] = useState(booking.itineraryOptions[0]?.id || '');

  const handleShare = async () => {
    const selected = booking.itineraryOptions.find((opt) => opt.id === selectedId);
    if (selected) await onShare(selected);
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-bold text-on-surface mb-4">Step 4: Select & Share Itinerary</h2>
      <div className="space-y-3 mb-4">
        {booking.itineraryOptions.map((opt) => (
          <label key={opt.id} className="flex items-start gap-3 cursor-pointer">
            <input type="radio" name="itinerary" value={opt.id} checked={selectedId === opt.id} onChange={(e) => setSelectedId(e.target.value)} className="mt-1" />
            <div className="flex-1">
              <p className="font-bold">{opt.airline} - {opt.flightNumber}</p>
              <p className="text-sm text-on-surface-variant">{new Date(opt.departureTime).toLocaleString()} → {new Date(opt.arrivalTime).toLocaleString()}</p>
              <p className="text-sm font-bold text-primary">{opt.price} {opt.currency}</p>
            </div>
          </label>
        ))}
      </div>
      <button onClick={handleShare} disabled={submitting} className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary-dim transition-all disabled:opacity-70 flex items-center gap-2">
        {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        Share with EVP
      </button>
    </div>
  );
}

function EvpApprovalPanel({
  booking, submitting, onDecision,
}: {
  booking: TicketBooking; submitting: boolean; onDecision: (approved: boolean, comments: string) => Promise<void>;
}) {
  const [comments, setComments] = useState('');

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-bold text-on-surface mb-4">Step 4: EVP Approval Required</h2>
      {booking.selectedItinerary && (
        <div className="bg-surface-container rounded-lg p-4 mb-4">
          <p className="font-bold">{booking.selectedItinerary.airline} - {booking.selectedItinerary.flightNumber}</p>
          <p className="text-sm text-on-surface-variant mt-1">{booking.selectedItinerary.class} • {booking.selectedItinerary.price} {booking.selectedItinerary.currency}</p>
        </div>
      )}
      <textarea placeholder="Comments..." value={comments} onChange={(e) => setComments(e.target.value)} rows={3} className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none mb-4 transition-all" />
      <div className="flex gap-3">
        <button onClick={() => onDecision(true, comments)} disabled={submitting} className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
          Approve
        </button>
        <button onClick={() => onDecision(false, comments)} disabled={submitting} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
          Reject
        </button>
      </div>
    </div>
  );
}

function RequestBookingPanel({
  booking, submitting, onRequestBooking,
}: {
  booking: TicketBooking; submitting: boolean; onRequestBooking: (itineraryId: string) => Promise<void>;
}) {
  const itineraryId = booking.selectedItinerary?.id || '';

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-bold text-on-surface mb-4">Step 5: Request Booking from Vendor</h2>
      {booking.selectedItinerary && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
          <p className="font-bold text-emerald-900">{booking.selectedItinerary.airline} - {booking.selectedItinerary.flightNumber}</p>
          <p className="text-sm text-emerald-800 mt-1">EVP Approved</p>
        </div>
      )}
      <button onClick={() => onRequestBooking(itineraryId)} disabled={submitting} className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary-dim transition-all disabled:opacity-70 flex items-center gap-2">
        {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        Request Booking
      </button>
    </div>
  );
}

function VendorBookTicketPanel({
  booking, submitting, onSubmitTicket,
}: {
  booking: TicketBooking; submitting: boolean; onSubmitTicket: (ticket: BookedTicket) => Promise<void>;
}) {
  const [ticket, setTicket] = useState<BookedTicket>({
    airline: booking.selectedItinerary?.airline || '',
    flightNumber: booking.selectedItinerary?.flightNumber || '',
    departure: booking.selectedItinerary?.departureTime || '',
    arrival: booking.selectedItinerary?.arrivalTime || '',
    bookingRef: '',
    ticketUrl: '',
    bookedAt: new Date().toISOString(),
  });

  const inputCls = 'w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all';

  const handleSubmit = async () => {
    await onSubmitTicket(ticket);
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-bold text-on-surface mb-4">Step 6: Submit Booked Ticket</h2>
      <div className="space-y-4 mb-4">
        <input type="text" placeholder="Booking Reference" value={ticket.bookingRef} onChange={(e) => setTicket({ ...ticket, bookingRef: e.target.value })} className={inputCls} />
        <input type="url" placeholder="Ticket URL" value={ticket.ticketUrl} onChange={(e) => setTicket({ ...ticket, ticketUrl: e.target.value })} className={inputCls} />
      </div>
      <button onClick={handleSubmit} disabled={submitting} className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary-dim transition-all disabled:opacity-70 flex items-center gap-2">
        {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        Submit Ticket
      </button>
    </div>
  );
}

function ShareTicketPanel({
  booking, submitting, onShare,
}: {
  booking: TicketBooking; submitting: boolean; onShare: () => Promise<void>;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-bold text-on-surface mb-4">Step 6: Share Ticket with Manager & Applicant</h2>
      <p className="text-on-surface-variant text-sm mb-4">The ticket has been booked. Share it with the manager and applicant.</p>
      <button onClick={onShare} disabled={submitting} className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary-dim transition-all disabled:opacity-70 flex items-center gap-2">
        {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        Share Ticket
      </button>
    </div>
  );
}

function TicketDisplayPanel({ ticket }: { ticket: BookedTicket }) {
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl shadow-sm p-6 border border-emerald-200">
      <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
        <CheckCircle size={20} />
        Booked Ticket
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-emerald-800 font-bold">{ticket.airline}</span>
          <span className="text-emerald-600 font-mono text-sm">{ticket.flightNumber}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-emerald-800">
          <span>{new Date(ticket.departure).toLocaleString()}</span>
          <span>→</span>
          <span>{new Date(ticket.arrival).toLocaleString()}</span>
        </div>
        <div className="pt-2 border-t border-emerald-200">
          <p className="text-xs font-bold text-emerald-700">Booking Reference</p>
          <p className="font-mono text-sm text-emerald-900">{ticket.bookingRef}</p>
        </div>
      </div>
    </div>
  );
}
