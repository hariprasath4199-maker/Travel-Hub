import { useState } from 'react';
import { type StepActionPanelProps } from '../StepActionPanel';
import { submitApplicantDates } from '@/src/visaApi';
import { CalendarCheck, Loader2, CheckCircle, MapPin, Clock } from 'lucide-react';

export default function Step7ApplicantSelection({ request, currentUser, onActionComplete }: StepActionPanelProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const alreadySelected = !!request.applicantDatesSubmittedAt;
  const availableDates = request.vendorAvailableDates || [];

  const handleSubmit = async () => {
    if (selectedIndex === null) return;
    setSubmitting(true);
    setError('');
    try {
      const selectedDate = availableDates[selectedIndex];
      await submitApplicantDates(request.id, [selectedDate], remarks || undefined);
      onActionComplete();
    } catch (e: any) {
      setError(e.message || 'Failed to submit selection');
    } finally {
      setSubmitting(false);
    }
  };

  if (alreadySelected) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center">
            <CheckCircle size={20} className="text-on-tertiary-container" />
          </div>
          <div>
            <h3 className="text-on-surface font-semibold text-base">Date Selected</h3>
            <p className="text-on-surface-variant text-xs">
              Submitted on {new Date(request.applicantDatesSubmittedAt!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        {request.applicantSelectedDates?.map((slot, i) => (
          <div key={slot.slotId || i} className="bg-tertiary-container/20 rounded-xl p-4 flex items-center gap-4">
            <CalendarCheck size={20} className="text-tertiary" />
            <div>
              <p className="text-on-surface font-semibold text-sm">
                {new Date(slot.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-on-surface-variant text-xs">{slot.time} &middot; {slot.location}</p>
            </div>
          </div>
        ))}
        {request.applicantRemarks && (
          <div className="bg-surface-container rounded-xl p-3">
            <p className="text-on-surface-variant text-xs font-medium mb-1">Remarks</p>
            <p className="text-on-surface text-sm">{request.applicantRemarks}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
          <CalendarCheck size={20} className="text-on-primary-container" />
        </div>
        <div>
          <h3 className="text-on-surface font-semibold text-base">Select Preferred Date</h3>
          <p className="text-on-surface-variant text-xs">Choose your preferred appointment slot</p>
        </div>
      </div>

      <div className="space-y-2">
        {availableDates.map((slot, index) => (
          <button
            key={slot.slotId || index}
            onClick={() => setSelectedIndex(index)}
            className={`w-full text-left rounded-xl p-4 border-2 transition-all ${
              selectedIndex === index
                ? 'border-primary bg-primary-container/20'
                : 'border-outline-variant hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedIndex === index ? 'border-primary' : 'border-outline-variant'
              }`}>
                {selectedIndex === index && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
              <div className="flex-1">
                <p className="text-on-surface font-semibold text-sm">
                  {new Date(slot.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-on-surface-variant text-xs flex items-center gap-1">
                    <Clock size={12} /> {slot.time}
                  </span>
                  <span className="text-on-surface-variant text-xs flex items-center gap-1">
                    <MapPin size={12} /> {slot.location}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div>
        <label className="text-on-surface-variant text-xs font-medium mb-1 block">Remarks (optional)</label>
        <textarea
          value={remarks}
          onChange={e => setRemarks(e.target.value)}
          rows={2}
          placeholder="Any preferences or notes..."
          className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {error && <p className="text-error text-sm">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={submitting || selectedIndex === null}
        className="w-full bg-primary text-on-primary font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting && <Loader2 size={18} className="animate-spin" />}
        {submitting ? 'Submitting...' : 'Confirm Selection'}
      </button>
    </div>
  );
}
