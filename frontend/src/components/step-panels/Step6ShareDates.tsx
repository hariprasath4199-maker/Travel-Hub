import { useState } from 'react';
import { type StepActionPanelProps } from '../StepActionPanel';
import { shareDatesWithApplicant } from '@/src/visaApi';
import { Share2, Loader2, CheckCircle } from 'lucide-react';

export default function Step6ShareDates({ request, currentUser, onActionComplete }: StepActionPanelProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const alreadyShared = !!request.datesSharedToApplicantAt;
  const vendorDates = request.vendorAvailableDates || [];

  const handleShare = async () => {
    setSubmitting(true);
    setError('');
    try {
      await shareDatesWithApplicant(request.id, currentUser.id);
      onActionComplete();
    } catch (e: any) {
      setError(e.message || 'Failed to share dates');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
          {alreadyShared ? <CheckCircle size={20} className="text-on-primary-container" /> : <Share2 size={20} className="text-on-primary-container" />}
        </div>
        <div>
          <h3 className="text-on-surface font-semibold text-base">
            {alreadyShared ? 'Dates Shared with Applicant' : 'Share Dates with Applicant'}
          </h3>
          <p className="text-on-surface-variant text-xs">
            {alreadyShared
              ? `Shared on ${new Date(request.datesSharedToApplicantAt!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
              : `${vendorDates.length} date slot(s) from vendor`}
          </p>
        </div>
      </div>

      {/* Vendor Dates Table */}
      {vendorDates.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-outline-variant">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-container">
                <th className="text-left px-4 py-2.5 text-on-surface-variant font-medium text-xs uppercase tracking-wider">#</th>
                <th className="text-left px-4 py-2.5 text-on-surface-variant font-medium text-xs uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-2.5 text-on-surface-variant font-medium text-xs uppercase tracking-wider">Time</th>
                <th className="text-left px-4 py-2.5 text-on-surface-variant font-medium text-xs uppercase tracking-wider">Location</th>
              </tr>
            </thead>
            <tbody>
              {vendorDates.map((slot, i) => (
                <tr key={slot.slotId || i} className="border-t border-outline-variant">
                  <td className="px-4 py-2.5 text-on-surface-variant">{i + 1}</td>
                  <td className="px-4 py-2.5 text-on-surface font-medium">
                    {new Date(slot.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-2.5 text-on-surface-variant">{slot.time}</td>
                  <td className="px-4 py-2.5 text-on-surface-variant">{slot.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && <p className="text-error text-sm">{error}</p>}

      {!alreadyShared && (
        <button
          onClick={handleShare}
          disabled={submitting || vendorDates.length === 0}
          className="w-full bg-primary text-on-primary font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 size={18} className="animate-spin" />}
          {submitting ? 'Sharing...' : 'Share Dates with Applicant'}
        </button>
      )}
    </div>
  );
}
