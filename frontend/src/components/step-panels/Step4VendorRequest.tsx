import { useState } from 'react';
import { type StepActionPanelProps } from '../StepActionPanel';
import { sendVendorRequest } from '@/src/visaApi';
import { Truck, Loader2 } from 'lucide-react';

export default function Step4VendorRequest({ request, currentUser, onActionComplete }: StepActionPanelProps) {
  const [vendorName, setVendorName] = useState(request.vendorName ?? 'VFS Global');
  const [vendorEmail, setVendorEmail] = useState(request.vendorEmail ?? '');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const alreadySent = !!request.vendorRequestedAt;

  const handleSubmit = async () => {
    if (!vendorName.trim() || !vendorEmail.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await sendVendorRequest(request.id, {
        vendorName,
        vendorEmail,
        performedBy: currentUser.id,
      });
      onActionComplete();
    } catch (e: any) {
      setError(e.message || 'Failed to send vendor request');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = 'w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
          <Truck size={20} className="text-on-primary-container" />
        </div>
        <div>
          <h3 className="text-on-surface font-semibold text-base">Request Vendor Availability</h3>
          <p className="text-on-surface-variant text-xs">
            {alreadySent
              ? `Requested on ${new Date(request.vendorRequestedAt!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
              : 'Send request to visa vendor'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-on-surface-variant text-xs font-medium mb-1 block">Vendor Name</label>
          <input
            type="text"
            value={vendorName}
            onChange={e => setVendorName(e.target.value)}
            readOnly={alreadySent}
            className={`${fieldClass} ${alreadySent ? 'opacity-70 cursor-not-allowed' : ''}`}
          />
        </div>
        <div>
          <label className="text-on-surface-variant text-xs font-medium mb-1 block">Vendor Email</label>
          <input
            type="email"
            value={vendorEmail}
            onChange={e => setVendorEmail(e.target.value)}
            readOnly={alreadySent}
            placeholder="vendor@vfsglobal.com"
            className={`${fieldClass} ${alreadySent ? 'opacity-70 cursor-not-allowed' : ''}`}
          />
        </div>
        {!alreadySent && (
          <div>
            <label className="text-on-surface-variant text-xs font-medium mb-1 block">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Any special requirements..."
              className={`${fieldClass} resize-none`}
            />
          </div>
        )}
      </div>

      {error && <p className="text-error text-sm">{error}</p>}

      {!alreadySent && (
        <button
          onClick={handleSubmit}
          disabled={submitting || !vendorName.trim() || !vendorEmail.trim()}
          className="w-full bg-primary text-on-primary font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 size={18} className="animate-spin" />}
          {submitting ? 'Sending...' : 'Request Vendor Availability'}
        </button>
      )}

      {alreadySent && (
        <div className="bg-secondary-container/30 rounded-xl p-4 text-center">
          <p className="text-on-surface-variant text-sm">Vendor request sent. Waiting for vendor to submit dates.</p>
        </div>
      )}
    </div>
  );
}
