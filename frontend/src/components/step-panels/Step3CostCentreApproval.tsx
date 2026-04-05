import { useState } from 'react';
import { type StepActionPanelProps } from '../StepActionPanel';
import { sendCostCentreApproval, submitCostCentreDecision } from '@/src/visaApi';
import { ShieldCheck, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function Step3CostCentreApproval({ request, currentUser, onActionComplete }: StepActionPanelProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [comments, setComments] = useState('');
  const [ccOwnerName, setCcOwnerName] = useState(request.costCentreOwnerName ?? '');
  const [ccOwnerEmail, setCcOwnerEmail] = useState(request.costCentreOwnerEmail ?? '');

  const costProposal = request.costProposal;
  const isHrAdmin = currentUser.role === 'HRBP' || currentUser.role === 'ADMIN';
  const isCostCentreOwner = currentUser.role === 'MANAGER' || currentUser.role === 'ADMIN';

  const handleSendForApproval = async () => {
    if (!ccOwnerName.trim() || !ccOwnerEmail.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await sendCostCentreApproval(request.id, {
        costCentreOwnerName: ccOwnerName,
        costCentreOwnerEmail: ccOwnerEmail,
        performedBy: currentUser.id,
      });
      onActionComplete();
    } catch (e: any) {
      setError(e.message || 'Failed to send for approval');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecision = async (decision: 'approve' | 'reject') => {
    setSubmitting(true);
    setError('');
    try {
      await submitCostCentreDecision(
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
          <ShieldCheck size={20} className="text-on-primary-container" />
        </div>
        <div>
          <h3 className="text-on-surface font-semibold text-base">Cost Centre Approval</h3>
          <p className="text-on-surface-variant text-xs">Cost Centre: {request.costCentre}</p>
        </div>
      </div>

      {/* Cost Proposal Summary */}
      {costProposal && (
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
          {costProposal.notes && (
            <p className="text-on-surface-variant text-xs mt-2">Notes: {costProposal.notes}</p>
          )}
        </div>
      )}

      {error && <p className="text-error text-sm">{error}</p>}

      {/* HR Admin: Send for Cost Centre Approval */}
      {isHrAdmin && request.status === 'COST_PROPOSAL_SHARED' && (
        <div className="space-y-3">
          <div>
            <label className="text-on-surface-variant text-xs font-medium mb-1 block">Cost Centre Owner Name</label>
            <input type="text" value={ccOwnerName} onChange={e => setCcOwnerName(e.target.value)} placeholder="Owner name" className={fieldClass} />
          </div>
          <div>
            <label className="text-on-surface-variant text-xs font-medium mb-1 block">Cost Centre Owner Email</label>
            <input type="email" value={ccOwnerEmail} onChange={e => setCcOwnerEmail(e.target.value)} placeholder="owner@company.com" className={fieldClass} />
          </div>
          <button
            onClick={handleSendForApproval}
            disabled={submitting || !ccOwnerName.trim() || !ccOwnerEmail.trim()}
            className="w-full bg-primary text-on-primary font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 size={18} className="animate-spin" />}
            {submitting ? 'Sending...' : 'Send for Cost Centre Approval'}
          </button>
        </div>
      )}

      {/* HR Admin: waiting for CC decision */}
      {isHrAdmin && request.status === 'PENDING_COST_CENTRE_APPROVAL' && (
        <div className="bg-secondary-container/30 rounded-xl p-4 text-center">
          <p className="text-on-surface-variant text-sm">Awaiting Cost Centre Owner decision...</p>
        </div>
      )}

      {/* Cost Centre Owner: Approve / Reject */}
      {isCostCentreOwner && request.status === 'PENDING_COST_CENTRE_APPROVAL' && (
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
      {request.status === 'COST_CENTRE_APPROVED' && (
        <div className="bg-tertiary-container/30 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-tertiary" />
          <div>
            <p className="text-on-surface font-semibold text-sm">Approved</p>
            <p className="text-on-surface-variant text-xs">
              Approved on {request.costCentreApprovedAt ? new Date(request.costCentreApprovedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
            </p>
          </div>
        </div>
      )}
      {request.status === 'COST_CENTRE_REJECTED' && (
        <div className="bg-error-container/20 rounded-xl p-4 flex items-center gap-3">
          <XCircle size={20} className="text-error" />
          <div>
            <p className="text-on-surface font-semibold text-sm">Rejected</p>
            {request.costCentreRejectionReason && (
              <p className="text-on-surface-variant text-xs">Reason: {request.costCentreRejectionReason}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
