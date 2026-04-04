import { useState } from 'react';
import { type StepActionPanelProps } from '../StepActionPanel';
import { submitVendorDates, type VendorDateSlot } from '@/src/visaApi';
import { CalendarDays, Plus, Trash2, Loader2 } from 'lucide-react';

export default function Step5VendorDates({ request, currentUser, onActionComplete }: StepActionPanelProps) {
  const [slots, setSlots] = useState<Omit<VendorDateSlot, 'slotId'>[]>([
    { date: '', time: 'MORNING', location: '' },
  ]);
  const [vendorComments, setVendorComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const alreadySubmitted = !!request.vendorDatesReceivedAt;

  const addSlot = () => {
    setSlots(prev => [...prev, { date: '', time: 'MORNING', location: '' }]);
  };

  const removeSlot = (index: number) => {
    setSlots(prev => prev.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: keyof Omit<VendorDateSlot, 'slotId'>, value: string) => {
    setSlots(prev => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const isValid = slots.length > 0 && slots.every(s => s.date && s.time && s.location.trim());

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    setError('');
    try {
      const dated: VendorDateSlot[] = slots.map((s, i) => ({
        ...s,
        slotId: `slot-${Date.now()}-${i}`,
      }));
      await submitVendorDates(request.id, dated, vendorComments || undefined);
      onActionComplete();
    } catch (e: any) {
      setError(e.message || 'Failed to submit dates');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = 'w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary';

  if (alreadySubmitted) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center">
            <CalendarDays size={20} className="text-on-tertiary-container" />
          </div>
          <div>
            <h3 className="text-on-surface font-semibold text-base">Dates Submitted</h3>
            <p className="text-on-surface-variant text-xs">
              Submitted on {new Date(request.vendorDatesReceivedAt!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          {request.vendorAvailableDates?.map((slot, i) => (
            <div key={slot.slotId || i} className="bg-surface-container rounded-xl p-3 flex justify-between items-center text-sm">
              <span className="text-on-surface font-medium">{new Date(slot.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span className="text-on-surface-variant">{slot.time}</span>
              <span className="text-on-surface-variant">{slot.location}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
          <CalendarDays size={20} className="text-on-primary-container" />
        </div>
        <div>
          <h3 className="text-on-surface font-semibold text-base">Submit Available Dates</h3>
          <p className="text-on-surface-variant text-xs">Add one or more appointment date slots</p>
        </div>
      </div>

      <div className="space-y-3">
        {slots.map((slot, index) => (
          <div key={index} className="bg-surface-container rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Slot {index + 1}</span>
              {slots.length > 1 && (
                <button onClick={() => removeSlot(index)} className="text-error hover:text-error/80 transition-colors">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-on-surface-variant text-xs font-medium mb-1 block">Date</label>
                <input type="date" value={slot.date} onChange={e => updateSlot(index, 'date', e.target.value)} className={fieldClass} />
              </div>
              <div>
                <label className="text-on-surface-variant text-xs font-medium mb-1 block">Time Slot</label>
                <select value={slot.time} onChange={e => updateSlot(index, 'time', e.target.value)} className={fieldClass}>
                  <option value="MORNING">Morning</option>
                  <option value="AFTERNOON">Afternoon</option>
                </select>
              </div>
              <div>
                <label className="text-on-surface-variant text-xs font-medium mb-1 block">Location</label>
                <input type="text" value={slot.location} onChange={e => updateSlot(index, 'location', e.target.value)} placeholder="Embassy / VFS Centre" className={fieldClass} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addSlot}
        className="w-full border-2 border-dashed border-outline-variant rounded-xl py-2.5 text-on-surface-variant text-sm font-medium hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={16} /> Add Another Slot
      </button>

      <div>
        <label className="text-on-surface-variant text-xs font-medium mb-1 block">Comments (optional)</label>
        <textarea
          value={vendorComments}
          onChange={e => setVendorComments(e.target.value)}
          rows={2}
          placeholder="Any notes about availability..."
          className={`${fieldClass} resize-none`}
        />
      </div>

      {error && <p className="text-error text-sm">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={submitting || !isValid}
        className="w-full bg-primary text-on-primary font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting && <Loader2 size={18} className="animate-spin" />}
        {submitting ? 'Submitting...' : 'Submit Available Dates'}
      </button>
    </div>
  );
}
