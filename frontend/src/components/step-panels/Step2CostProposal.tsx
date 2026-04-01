import { useState } from 'react';
import { type StepActionPanelProps } from '../StepActionPanel';
import { submitCostProposal } from '@/src/visaApi';
import { Receipt, Loader2, CheckCircle } from 'lucide-react';

export default function Step2CostProposal({ request, currentUser, onActionComplete }: StepActionPanelProps) {
  const existing = request.costProposal;
  const isReadOnly = !!existing;

  const [visaFees, setVisaFees] = useState(existing?.visaFees ?? 0);
  const [serviceFees, setServiceFees] = useState(existing?.serviceFees ?? 0);
  const [travelCost, setTravelCost] = useState(existing?.travelCost ?? 0);
  const [accommodationCost, setAccommodationCost] = useState(existing?.accommodationCost ?? 0);
  const [otherCosts, setOtherCosts] = useState(existing?.otherCosts ?? 0);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const total = visaFees + serviceFees + travelCost + accommodationCost + otherCosts;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      await submitCostProposal(request.id, {
        visaFees,
        serviceFees,
        travelCost,
        accommodationCost,
        otherCosts,
        totalCost: total,
        currency: 'EUR',
        notes: notes || undefined,
      }, currentUser.id);
      onActionComplete();
    } catch (e: any) {
      setError(e.message || 'Failed to submit cost proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (readOnly: boolean) =>
    `w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}`;

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
          {isReadOnly ? <CheckCircle size={20} className="text-on-primary-container" /> : <Receipt size={20} className="text-on-primary-container" />}
        </div>
        <div>
          <h3 className="text-on-surface font-semibold text-base">
            {isReadOnly ? 'Cost Proposal Submitted' : 'Enter Cost Proposal'}
          </h3>
          <p className="text-on-surface-variant text-xs">
            {isReadOnly ? `Submitted on ${new Date(request.costProposalSharedAt || '').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'All amounts in EUR'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-on-surface-variant text-xs font-medium mb-1 block">Embassy / Visa Fee</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">&#8364;</span>
            <input type="number" min={0} step={0.01} value={visaFees} onChange={e => setVisaFees(+e.target.value)} readOnly={isReadOnly} className={`${fieldClass(isReadOnly)} pl-8`} />
          </div>
        </div>
        <div>
          <label className="text-on-surface-variant text-xs font-medium mb-1 block">Service Fee</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">&#8364;</span>
            <input type="number" min={0} step={0.01} value={serviceFees} onChange={e => setServiceFees(+e.target.value)} readOnly={isReadOnly} className={`${fieldClass(isReadOnly)} pl-8`} />
          </div>
        </div>
        <div>
          <label className="text-on-surface-variant text-xs font-medium mb-1 block">Travel Cost</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">&#8364;</span>
            <input type="number" min={0} step={0.01} value={travelCost} onChange={e => setTravelCost(+e.target.value)} readOnly={isReadOnly} className={`${fieldClass(isReadOnly)} pl-8`} />
          </div>
        </div>
        <div>
          <label className="text-on-surface-variant text-xs font-medium mb-1 block">Accommodation Cost</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">&#8364;</span>
            <input type="number" min={0} step={0.01} value={accommodationCost} onChange={e => setAccommodationCost(+e.target.value)} readOnly={isReadOnly} className={`${fieldClass(isReadOnly)} pl-8`} />
          </div>
        </div>
        <div>
          <label className="text-on-surface-variant text-xs font-medium mb-1 block">Other Costs</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">&#8364;</span>
            <input type="number" min={0} step={0.01} value={otherCosts} onChange={e => setOtherCosts(+e.target.value)} readOnly={isReadOnly} className={`${fieldClass(isReadOnly)} pl-8`} />
          </div>
        </div>
        <div>
          <label className="text-on-surface-variant text-xs font-medium mb-1 block">Total</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">&#8364;</span>
            <input type="number" value={total.toFixed(2)} readOnly className={`${fieldClass(true)} pl-8 font-bold`} />
          </div>
        </div>
      </div>

      <div>
        <label className="text-on-surface-variant text-xs font-medium mb-1 block">Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          readOnly={isReadOnly}
          rows={3}
          placeholder="Optional notes about the cost proposal..."
          className={`${fieldClass(isReadOnly)} resize-none`}
        />
      </div>

      {error && <p className="text-error text-sm">{error}</p>}

      {!isReadOnly && (
        <button
          onClick={handleSubmit}
          disabled={submitting || total <= 0}
          className="w-full bg-primary text-on-primary font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 size={18} className="animate-spin" />}
          {submitting ? 'Submitting...' : 'Submit Cost Proposal'}
        </button>
      )}
    </div>
  );
}
