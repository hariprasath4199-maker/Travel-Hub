import { useState } from 'react';
import { type StepActionPanelProps } from '../StepActionPanel';
import { confirmBooking, confirmAppointment } from '@/src/visaApi';
import { BadgeCheck, Loader2, CalendarCheck, MapPin, Clock, CheckCircle } from 'lucide-react';

export default function Step9ConfirmBooking({ request, currentUser, onActionComplete }: StepActionPanelProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmationRef, setConfirmationRef] = useState(request.vendorConfirmationReference ?? '');

  const isHrAdmin = currentUser.role === 'HR_ADMIN';
  const isVendor = currentUser.role === 'VENDOR';
  const isAppointmentConfirmed = request.status === 'APPOINTMENT_CONFIRMED';
  const isDateBlocking = request.status === 'DATE_BLOCKING_REQUESTED';

  const selectedDate = request.applicantSelectedDates?.[0] || request.confirmedDate;

  const handleConfirmBooking = async () => {
    if (!selectedDate) return;
    setSubmitting(true);
    setError('');
    try {
      await confirmBooking(request.id, selectedDate, currentUser.id);
      onActionComplete();
    } catch (e: any) {
      setError(e.message || 'Failed to confirm booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmAppointment = async () => {
    if (!confirmationRef.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await confirmAppointment(request.id, confirmationRef, currentUser.id, currentUser.role);
      onActionComplete();
    } catch (e: any) {
      setError(e.message || 'Failed to confirm appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = 'w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isAppointmentConfirmed ? 'bg-tertiary-container' : 'bg-primary-container'}`}>
          {isAppointmentConfirmed ? (
            <CheckCircle size={20} className="text-on-tertiary-container" />
          ) : (
            <BadgeCheck size={20} className="text-on-primary-container" />
          )}
        </div>
        <div>
          <h3 className="text-on-surface font-semibold text-base">
            {isAppointmentConfirmed ? 'Appointment Confirmed' : 'Confirm Booking'}
          </h3>
          <p className="text-on-surface-variant text-xs">
            {isAppointmentConfirmed
              ? `Confirmed on ${request.appointmentConfirmedAt ? new Date(request.appointmentConfirmedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}`
              : 'Final booking confirmation step'}
          </p>
        </div>
      </div>

      {/* Booking Summary */}
      {selectedDate && (
        <div className={`rounded-xl p-4 ${isAppointmentConfirmed ? 'bg-tertiary-container/20' : 'bg-surface-container'}`}>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-3">Booking Details</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <CalendarCheck size={16} className="text-on-surface-variant" />
              <span className="text-on-surface font-semibold text-sm">
                {new Date(selectedDate.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-on-surface-variant" />
              <span className="text-on-surface text-sm">{selectedDate.time}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-on-surface-variant" />
              <span className="text-on-surface text-sm">{selectedDate.location}</span>
            </div>
          </div>
          {request.vendorConfirmationReference && (
            <div className="mt-3 pt-3 border-t border-outline-variant">
              <p className="text-on-surface-variant text-xs">Confirmation Ref: <span className="text-on-surface font-semibold">{request.vendorConfirmationReference}</span></p>
            </div>
          )}
        </div>
      )}

      {/* Cost summary */}
      {request.costProposal && (
        <div className="bg-surface-container rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Total Cost</span>
            <span className="text-on-surface font-bold text-lg">&euro;{request.costProposal.totalCost.toFixed(2)}</span>
          </div>
        </div>
      )}

      {error && <p className="text-error text-sm">{error}</p>}

      {/* HR Admin: Confirm Booking with Vendor (EVP_APPROVED status) */}
      {isHrAdmin && request.status === 'EVP_APPROVED' && (
        <button
          onClick={handleConfirmBooking}
          disabled={submitting || !selectedDate}
          className="w-full bg-primary text-on-primary font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 size={18} className="animate-spin" />}
          {submitting ? 'Confirming...' : 'Confirm Booking with Vendor'}
        </button>
      )}

      {/* Vendor or HR Admin: Confirm Appointment (DATE_BLOCKING_REQUESTED status) */}
      {(isHrAdmin || isVendor) && isDateBlocking && (
        <div className="space-y-3">
          <div>
            <label className="text-on-surface-variant text-xs font-medium mb-1 block">Vendor Confirmation Reference</label>
            <input
              type="text"
              value={confirmationRef}
              onChange={e => setConfirmationRef(e.target.value)}
              placeholder="e.g., VFS-2026-ABC123"
              className={fieldClass}
            />
          </div>
          <button
            onClick={handleConfirmAppointment}
            disabled={submitting || !confirmationRef.trim()}
            className="w-full bg-tertiary text-on-tertiary font-semibold py-3 rounded-xl hover:bg-tertiary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 size={18} className="animate-spin" />}
            {submitting ? 'Confirming...' : 'Confirm Appointment'}
          </button>
        </div>
      )}

      {/* Final confirmed state */}
      {isAppointmentConfirmed && (
        <div className="bg-tertiary-container/30 rounded-xl p-4 text-center">
          <p className="text-tertiary font-semibold text-sm">Visa appointment is confirmed and booked.</p>
        </div>
      )}
    </div>
  );
}
