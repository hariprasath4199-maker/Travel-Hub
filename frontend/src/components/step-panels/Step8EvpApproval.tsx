import { useState } from 'react';
import { type StepActionPanelProps } from '../StepActionPanel';
import { sendEvpApproval, submitEvpDecision } from '@/src/visaApi';
import { Award, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function Step8EvpApproval({ request, currentUser, onActionComplete }: StepActionPanelProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [comments, setComments] = useState('');
  const [evpName, setEvpName] = useState(request.evpName ?? '');
  const [evpEmail, setEvpEmail] = useState(request.evpEmail ?? '');

  const isHrAdmin = currentUser.role === 'HR_ADMIN';
  const isEvp = currentUser.role === 'EVP';
  const costProposal = request.costProposal;

  const handleSendForApproval = async () => {
    if (!evpName.trim() || !evpEmail.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await sendEvpApproval(request.id, {
        evpName,
        evpEmail,
        performedBy: currentUser.id,
      });
      onActionComplete();
    } catch (e: any) {
      setError(e.message || 'Failed to send for EVP approval');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecision = async (decision: 'approve' | 'reject') => {
    setSubmitting(true);
    setError('');
    try {
      await submitEvpDecision(
        request.id,
        decision,
        decision === 'reject' ? comments : undefined,
        comments || undefined,
      );
      onActionComplete();
    } catch (e: any) {
      setError(e.message || 'Failed to submit decision');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = 'w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
          <Award size={20} className="text-on-primary-container" />
        </div>
        <div>
          <h3 className="text-on-surface font-semibold text-base">EVP Approval</h3>
          <p className="text-on-surface-variant text-xs">Executive Vice President sign-off</p>
        </div>
      </div>

      {/* Cost Summary for EVP */}
      {(isEvp || request.status === 'PENDING_EVP_APPROVAL') && costProposal && (
        <div className="bg-surface-container rounded-xl p-4 space-y-2">
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">Cost Summary</p>
          <div className="grid grid-cols-2 gap-y-1.5 text-sm">
            <span className="text-on-surface-variant">Embassy / Visa Fee</span>
            <span className="text-on-surface text-right font-medium">&euro;{costProposal.visaFees.toFixed(2)}</span>
            <span className="text-on-surface-variant">Service Fee</span>
            <span className="text-on-surface text-right font-medium">&euro;{costProposal.serviceFees.toFixed(2)}</span>
            <span className="text-on-surface-variant">Travel Cost</span>
            <span className="text-on-surface text-right font-medium">&euro;{costProposal.travelCost.toFixed(2)}</span>
            <span className="text-on-surface-variant">Accommodation</span>
            <span className="text-on-surface text-right font-medium">&euro;{costProposal.accommodationCost.toFixed(2)}</span>
            <span className="text-on-surface-variant">Other Costs</span>
            <span className="text-on-surface text-right font-medium">&euro;{costProposal.otherCosts.toFixed(2)}</span>
            <span className="text-on-surface font-bold pt-2 border-t border-outline-variant">Total</span>
            <span className="text-on-surface font-bold text-right pt-2 border-t border-outline-variant">&euro;{costProposal.totalCost.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Selected dates summary */}
      {request.applicantSelectedDates && request.applicantSelectedDates.length > 0 && (
        <div className="bg-surface-container rounded-xl p-4">
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">Selected Date</p>
          {request.applicantSelectedDates.map((slot, i) => (
            <div key={slot.slotId || i} className="text-sm">
              <p className="text-on-surface font-medium">
                {new Date(slot.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-on-surface-variant text-xs">{slot.time} &middot; {slot.location}</p>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-error text-sm">{error}</p>}

      {/* HR Admin: Send for EVP Approval */}
      {isHrAdmin && request.status === 'APPLICANT_DATES_SUBMITTED' && (
        <div className="space-y-3">
          <div>
            <label className="text-on-surface-variant text-xs font-medium mb-1 block">EVP Name</label>
            <input type="text" value={evpName} onChange={e => setEvpName(e.target.value)} placeholder="EVP name" className={fieldClass} />
          </div>
          <div>
            <label className="text-on-surface-variant text-xs font-medium mb-1 block">EVP Email</label>
            <input type="email" value={evpEmail} onChange={e => setEvpEmail(e.target.value)} placeholder="evp@company.com" className={fieldClass} />
          </div>
          <button
            onClick={handleSendForApproval}
            disabled={submitting || !evpName.trim() || !evpEmail.trim()}
            className="w-full bg-primary text-on-primary font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 size={18} className="animate-spin" />}
            {submitting ? 'Sending...' : 'Send for EVP Approval'}
          </button>
        </div>
      )}

      {/* HR Admin: waiting for EVP */}
      {isHrAdmin && request.status === 'PENDING_EVP_APPROVAL' && (
        <div className="bg-secondary-container/30 rounded-xl p-4 text-center">
          <p className="text-on-surface-variant text-sm">Awaiting EVP decision...</p>
        </div>
      )}

      {/* EVP: Approve / Reject */}
      {isEvp && request.status === 'PENDING_EVP_APPROVAL' && (
        <div className="space-y-3">
          <div>
            <label className="text-on-surface-variant text-xs font-medium mb-1 block">Comments</label>
            <textarea
              value={comments}
              onChange={e => setComments(e.target.value)}
              rows={3}
              placeholder="Add comments (required for rejection)..."
              className={`${fieldClass} resize-none`}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleDecision('approve')}
              disabled={submitting}
              className="flex-1 bg-tertiary text-on-tertiary font-semibold py-3 rounded-xl hover:bg-tertiary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
              Approve
            </button>
            <button
              onClick={() => handleDecision('reject')}
              disabled={submitting || !comments.trim()}
              className="flex-1 bg-error text-on-error font-semibold py-3 rounded-xl hover:bg-error/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
              Reject
            </button>
          </div>
          {!comments.trim() && (
            <p className="text-on-surface-variant text-xs text-center">Comments are required for rejection</p>
          )}
        </div>
      )}

      {/* Approved / Rejected status */}
      {request.status === 'EVP_APPROVED' && (
        <div className="bg-tertiary-container/30 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-tertiary" />
          <div>
            <p className="text-on-surface font-semibold text-sm">EVP Approved</p>
            <p className="text-on-surface-variant text-xs">
              Approved on {request.evpApprovedAt ? new Date(request.evpApprovedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
            </p>
          </div>
        </div>
      )}
      {request.status === 'EVP_REJECTED' && (
        <div className="bg-error-container/20 rounded-xl p-4 flex items-center gap-3">
          <XCircle size={20} className="text-error" />
          <div>
            <p className="text-on-surface font-semibold text-sm">EVP Rejected</p>
            {request.evpRejectionReason && (
              <p className="text-on-surface-variant text-xs">Reason: {request.evpRejectionReason}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
