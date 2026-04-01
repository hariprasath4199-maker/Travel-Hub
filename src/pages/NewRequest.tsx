import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlaneTakeoff, Building2, Calendar, DollarSign, FileText } from 'lucide-react';

export default function NewRequest() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/requests');
    }, 1000);
  };

  return (
    <div className="p-10 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-surface-container-lowest rounded-full hover:bg-surface-container-low transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight font-headline text-on-surface">New Travel Request</h2>
          <p className="text-on-surface-variant font-body mt-1">Submit a new authorization for business travel.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm space-y-6">
          <h3 className="text-xl font-bold font-headline border-b border-surface-container pb-4">Trip Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
                <PlaneTakeoff size={16} /> Destination
              </label>
              <input 
                required
                type="text" 
                placeholder="e.g. Tokyo, Japan"
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
                <Building2 size={16} /> Purpose of Travel
              </label>
              <select 
                required
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
              >
                <option value="" disabled selected>Select purpose...</option>
                <option value="client_meeting">Client Meeting</option>
                <option value="conference">Conference / Event</option>
                <option value="internal">Internal Team Offsite</option>
                <option value="training">Training</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
                <Calendar size={16} /> Departure Date
              </label>
              <input 
                required
                type="date" 
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
                <Calendar size={16} /> Return Date
              </label>
              <input 
                required
                type="date" 
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm space-y-6">
          <h3 className="text-xl font-bold font-headline border-b border-surface-container pb-4">Estimated Budget</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
                <DollarSign size={16} /> Flight Cost
              </label>
              <input 
                required
                type="number" 
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
                <DollarSign size={16} /> Hotel Cost
              </label>
              <input 
                required
                type="number" 
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
                <DollarSign size={16} /> Other Expenses
              </label>
              <input 
                type="number" 
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm space-y-6">
          <h3 className="text-xl font-bold font-headline border-b border-surface-container pb-4">Additional Notes</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
              <FileText size={16} /> Justification / Comments
            </label>
            <textarea 
              rows={4}
              placeholder="Provide any additional context for the approver..."
              className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-primary text-on-primary rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center gap-2"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
