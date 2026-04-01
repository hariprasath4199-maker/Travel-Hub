import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Loader2, ArrowLeft, User, Mail, Globe, Calendar, Building2, CreditCard,
  FileText, MessageSquare, ChevronDown, ChevronUp, Send, CheckCircle, XCircle,
  Clock, MapPin, Euro, RefreshCw,
} from 'lucide-react';
import {
  fetchVisaRequest, fetchEmailLog, submitCostProposal, sendCostCentreApproval,
  submitCostCentreDecision, sendVendorRequest, submitVendorDates, shareDatesWithApplicant,
  submitApplicantDates, sendEvpApproval, submitEvpDecision, confirmBooking, confirmAppointment,
  STEP_LABELS, STATUS_LABELS, ROLE_LABELS,
  type VisaRequest, type VendorDateSlot, type CostProposal, type UserRole,
} from '@/src/visaApi';
import { StatusBadge } from '@/src/components/StatusBadge';
import { WorkflowProgressTracker } from '@/src/components/WorkflowProgressTracker';
import { WorkflowTimeline } from '@/src/components/WorkflowTimeline';
import { useUserRole } from '@/src/context/UserRoleContext';

/* ------------------------------------------------------------------ */
/* Step Action Panel                                                   */
/* ------------------------------------------------------------------ */
function StepActionPanel({
  request, role, userName, onActionComplete,
}: {
  request: VisaRequest; role: UserRole; userName: string; onActionComplete: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrap = async (fn: () => Promise<any>) => {
    setSubmitting(true); setError(null);
    try { await fn(); onActionComplete(); }
    catch (e: any) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  /* ---------- COST PROPOSAL (HR_ADMIN, step 1->2) ---------- */
  const [costProposal, setCostProposal] = useState<CostProposal>({
    visaFees: 0, serviceFees: 0, travelCost: 0, accommodationCost: 0, otherCosts: 0, totalCost: 0, currency: 'EUR',
  });
  const updateCost = (field: keyof CostProposal, val: string) => {
    const num = parseFloat(val) || 0;
    setCostProposal((p) => {
      const next = { ...p, [field]: num };
      next.totalCost = next.visaFees + next.serviceFees + next.travelCost + next.accommodationCost + next.otherCosts;
      return next;
    });
  };

  /* ---------- COST CENTRE (HR sends email) ---------- */
  const [ccOwnerName, setCcOwnerName] = useState('');
  const [ccOwnerEmail, setCcOwnerEmail] = useState('');

  /* ---------- COST CENTRE DECISION ---------- */
  const [ccDecision, setCcDecision] = useState<'approve' | 'reject'>('approve');
  const [ccReason, setCcReason] = useState('');

  /* ---------- VENDOR REQUEST (HR) ---------- */
  const [vendorName, setVendorName] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');

  /* ---------- VENDOR DATES ---------- */
  const [vendorSlots, setVendorSlots] = useState<VendorDateSlot[]>([
    { date: '', time: '', location: '', slotId: `slot-${Date.now()}` },
  ]);
  const [vendorComments, setVendorComments] = useState('');
  const addSlot = () => setVendorSlots((s) => [...s, { date: '', time: '', location: '', slotId: `slot-${Date.now()}` }]);
  const updateSlot = (i: number, field: keyof VendorDateSlot, val: string) =>
    setVendorSlots((s) => s.map((slot, idx) => (idx === i ? { ...slot, [field]: val } : slot)));

  /* ---------- APPLICANT SELECTION ---------- */
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [applicantRemarks, setApplicantRemarks] = useState('');

  /* ---------- EVP ---------- */
  const [evpName, setEvpName] = useState('');
  const [evpEmail, setEvpEmail] = useState('');
  const [evpDecision, setEvpDecision] = useState<'approve' | 'reject'>('approve');
  const [evpReason, setEvpReason] = useState('');

  /* ---------- BOOKING ---------- */
  const [confirmRef, setConfirmRef] = useState('');

  const inputCls = 'w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all';
  const btnPrimary = 'px-6 py-3 bg-primary text-on-primary rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2';
  const btnDanger = 'px-6 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2';

  const { status } = request;

  /* ---------- Render per status + role ---------- */
  let panel: React.ReactNode = null;

  // Step 1: HR receives submission -> creates cost proposal
  if (status === 'SUBMITTED_TO_HR' && role === 'HR_ADMIN') {
    panel = (
      <div className="space-y-4">
        <h4 className="text-lg font-bold">Create Cost Proposal</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {(['visaFees', 'serviceFees', 'travelCost', 'accommodationCost', 'otherCosts'] as const).map((f) => (
            <div key={f} className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant uppercase">{f.replace(/([A-Z])/g, ' $1')}</label>
              <input type="number" min="0" step="0.01" className={inputCls} value={costProposal[f] || ''} onChange={(e) => updateCost(f, e.target.value)} />
            </div>
          ))}
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant uppercase">Total (EUR)</label>
            <div className="px-4 py-3 bg-primary/10 rounded-xl text-primary font-bold text-lg">{'\u20AC'}{costProposal.totalCost.toFixed(2)}</div>
          </div>
        </div>
        <button disabled={submitting} className={btnPrimary} onClick={() => wrap(() => submitCostProposal(request.id, costProposal, userName))}>
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Submit Cost Proposal
        </button>
      </div>
    );
  }

  // Step 2: HR sends cost proposal to cost centre owner
  if (status === 'COST_PROPOSAL_SHARED' && role === 'HR_ADMIN') {
    panel = (
      <div className="space-y-4">
        <h4 className="text-lg font-bold">Send for Cost Centre Approval</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant uppercase">CC Owner Name</label>
            <input className={inputCls} value={ccOwnerName} onChange={(e) => setCcOwnerName(e.target.value)} placeholder="Cost Centre Owner" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant uppercase">CC Owner Email</label>
            <input className={inputCls} type="email" value={ccOwnerEmail} onChange={(e) => setCcOwnerEmail(e.target.value)} placeholder="owner@company.fi" />
          </div>
        </div>
        <button disabled={submitting || !ccOwnerName || !ccOwnerEmail} className={btnPrimary} onClick={() => wrap(() => sendCostCentreApproval(request.id, { costCentreOwnerName: ccOwnerName, costCentreOwnerEmail: ccOwnerEmail, performedBy: userName }))}>
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />} Send Approval Email
        </button>
      </div>
    );
  }

  // Step 3: Cost Centre Owner decides
  if (status === 'PENDING_COST_CENTRE_APPROVAL' && role === 'COST_CENTRE_OWNER') {
    panel = (
      <div className="space-y-4">
        <h4 className="text-lg font-bold">Cost Centre Decision</h4>
        {request.costProposal && (
          <div className="bg-surface-container-low p-4 rounded-xl">
            <p className="text-sm font-bold mb-2">Cost Proposal Summary</p>
            <p className="text-2xl font-bold text-primary">{'\u20AC'}{request.costProposal.totalCost.toFixed(2)}</p>
          </div>
        )}
        <div className="flex gap-4">
          <button disabled={submitting} className={btnPrimary} onClick={() => wrap(() => submitCostCentreDecision(request.id, 'approve'))}>
            <CheckCircle size={16} /> Approve
          </button>
          <button disabled={submitting} className={btnDanger} onClick={() => {
            const reason = prompt('Rejection reason:');
            if (reason) wrap(() => submitCostCentreDecision(request.id, 'reject', reason));
          }}>
            <XCircle size={16} /> Reject
          </button>
        </div>
      </div>
    );
  }

  // Step 4: HR sends vendor request
  if (status === 'COST_CENTRE_APPROVED' && role === 'HR_ADMIN') {
    panel = (
      <div className="space-y-4">
        <h4 className="text-lg font-bold">Request Vendor Availability</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant uppercase">Vendor Name</label>
            <input className={inputCls} value={vendorName} onChange={(e) => setVendorName(e.target.value)} placeholder="VFS Global" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant uppercase">Vendor Email</label>
            <input className={inputCls} type="email" value={vendorEmail} onChange={(e) => setVendorEmail(e.target.value)} placeholder="vendor@vfs.com" />
          </div>
        </div>
        <button disabled={submitting || !vendorName || !vendorEmail} className={btnPrimary} onClick={() => wrap(() => sendVendorRequest(request.id, { vendorName, vendorEmail, performedBy: userName }))}>
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Send Vendor Request
        </button>
      </div>
    );
  }

  // Step 5: Vendor submits dates
  if (status === 'AWAITING_VENDOR_AVAILABILITY' && role === 'VENDOR') {
    panel = (
      <div className="space-y-4">
        <h4 className="text-lg font-bold">Submit Available Date Slots</h4>
        {vendorSlots.map((slot, i) => (
          <div key={i} className="grid grid-cols-3 gap-3">
            <input type="date" className={inputCls} value={slot.date} onChange={(e) => updateSlot(i, 'date', e.target.value)} />
            <input type="time" className={inputCls} value={slot.time} onChange={(e) => updateSlot(i, 'time', e.target.value)} />
            <input className={inputCls} placeholder="Location" value={slot.location} onChange={(e) => updateSlot(i, 'location', e.target.value)} />
          </div>
        ))}
        <button type="button" onClick={addSlot} className="text-primary text-sm font-bold hover:underline">+ Add another slot</button>
        <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Comments (optional)" value={vendorComments} onChange={(e) => setVendorComments(e.target.value)} />
        <button disabled={submitting} className={btnPrimary} onClick={() => wrap(() => submitVendorDates(request.id, vendorSlots, vendorComments))}>
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Submit Dates
        </button>
      </div>
    );
  }

  // Step 6: HR shares dates with applicant
  if (status === 'VENDOR_DATES_RECEIVED' && role === 'HR_ADMIN') {
    panel = (
      <div className="space-y-4">
        <h4 className="text-lg font-bold">Share Dates with Applicant</h4>
        {request.vendorAvailableDates && (
          <div className="space-y-2">
            {request.vendorAvailableDates.map((d, i) => (
              <div key={i} className="bg-surface-container-low p-3 rounded-xl flex items-center gap-4 text-sm">
                <Calendar size={16} className="text-primary" />
                <span className="font-bold">{d.date}</span>
                <span>{d.time}</span>
                <span className="text-on-surface-variant">{d.location}</span>
              </div>
            ))}
          </div>
        )}
        <button disabled={submitting} className={btnPrimary} onClick={() => wrap(() => shareDatesWithApplicant(request.id, userName))}>
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />} Share with Applicant
        </button>
      </div>
    );
  }

  // Step 7: Applicant selects dates
  if (status === 'AWAITING_APPLICANT_DATE_SELECTION' && role === 'APPLICANT') {
    const available = request.vendorAvailableDates || [];
    panel = (
      <div className="space-y-4">
        <h4 className="text-lg font-bold">Select Preferred Date(s)</h4>
        <div className="space-y-2">
          {available.map((d) => (
            <label key={d.slotId} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${selectedSlotIds.includes(d.slotId) ? 'bg-primary/10 ring-2 ring-primary' : 'bg-surface-container-low hover:bg-surface-container'}`}>
              <input type="checkbox" checked={selectedSlotIds.includes(d.slotId)} onChange={() => setSelectedSlotIds((prev) => prev.includes(d.slotId) ? prev.filter((s) => s !== d.slotId) : [...prev, d.slotId])} className="accent-primary w-4 h-4" />
              <Calendar size={16} className="text-primary" />
              <span className="font-bold text-sm">{d.date}</span>
              <span className="text-sm">{d.time}</span>
              <span className="text-sm text-on-surface-variant">{d.location}</span>
            </label>
          ))}
        </div>
        <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Remarks (optional)" value={applicantRemarks} onChange={(e) => setApplicantRemarks(e.target.value)} />
        <button disabled={submitting || selectedSlotIds.length === 0} className={btnPrimary} onClick={() => {
          const selected = available.filter((d) => selectedSlotIds.includes(d.slotId));
          wrap(() => submitApplicantDates(request.id, selected, applicantRemarks));
        }}>
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} Confirm Selection
        </button>
      </div>
    );
  }

  // Step 8: HR sends EVP approval, or EVP decides
  if (status === 'APPLICANT_DATES_SUBMITTED' && role === 'HR_ADMIN') {
    panel = (
      <div className="space-y-4">
        <h4 className="text-lg font-bold">Send for EVP Approval</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant uppercase">EVP Name</label>
            <input className={inputCls} value={evpName} onChange={(e) => setEvpName(e.target.value)} placeholder="EVP Name" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant uppercase">EVP Email</label>
            <input className={inputCls} type="email" value={evpEmail} onChange={(e) => setEvpEmail(e.target.value)} placeholder="evp@company.fi" />
          </div>
        </div>
        <button disabled={submitting || !evpName || !evpEmail} className={btnPrimary} onClick={() => wrap(() => sendEvpApproval(request.id, { evpName, evpEmail, performedBy: userName }))}>
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Send EVP Approval
        </button>
      </div>
    );
  }

  if (status === 'PENDING_EVP_APPROVAL' && role === 'EVP') {
    panel = (
      <div className="space-y-4">
        <h4 className="text-lg font-bold">EVP Decision</h4>
        <div className="flex gap-4">
          <button disabled={submitting} className={btnPrimary} onClick={() => wrap(() => submitEvpDecision(request.id, 'approve'))}>
            <CheckCircle size={16} /> Approve
          </button>
          <button disabled={submitting} className={btnDanger} onClick={() => {
            const reason = prompt('Rejection reason:');
            if (reason) wrap(() => submitEvpDecision(request.id, 'reject', reason));
          }}>
            <XCircle size={16} /> Reject
          </button>
        </div>
      </div>
    );
  }

  // Step 9: Confirm booking / appointment
  if (status === 'EVP_APPROVED' && role === 'HR_ADMIN') {
    const selectedDates = request.applicantSelectedDates || [];
    panel = (
      <div className="space-y-4">
        <h4 className="text-lg font-bold">Confirm Booking</h4>
        {selectedDates.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-on-surface-variant">Select a date to confirm:</p>
            {selectedDates.map((d) => (
              <button key={d.slotId} className="w-full text-left p-3 bg-surface-container-low rounded-xl hover:bg-primary/10 transition-colors flex items-center gap-3"
                onClick={() => wrap(() => confirmBooking(request.id, d, userName))}>
                <Calendar size={16} className="text-primary" />
                <span className="font-bold text-sm">{d.date}</span>
                <span className="text-sm">{d.time}</span>
                <span className="text-sm text-on-surface-variant">{d.location}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (status === 'DATE_BLOCKING_REQUESTED' && (role === 'VENDOR' || role === 'HR_ADMIN')) {
    panel = (
      <div className="space-y-4">
        <h4 className="text-lg font-bold">Confirm Appointment</h4>
        <div className="space-y-1">
          <label className="text-xs font-bold text-on-surface-variant uppercase">Confirmation Reference</label>
          <input className={inputCls} value={confirmRef} onChange={(e) => setConfirmRef(e.target.value)} placeholder="e.g. VFS-2026-12345" />
        </div>
        <button disabled={submitting || !confirmRef} className={btnPrimary} onClick={() => wrap(() => confirmAppointment(request.id, confirmRef, userName, role))}>
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} Confirm Appointment
        </button>
      </div>
    );
  }

  if (!panel) {
    return (
      <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
        <p className="text-sm text-on-surface-variant">
          {status === 'APPOINTMENT_CONFIRMED'
            ? 'This visa request has been fully confirmed.'
            : status.includes('REJECTED')
              ? 'This visa request has been rejected.'
              : `No action available for your role (${ROLE_LABELS[role]}) at this step.`}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm space-y-4">
      {error && (
        <div className="bg-error-container/20 text-on-error-container p-3 rounded-xl text-sm font-bold">{error}</div>
      )}
      {panel}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Email Log Panel                                                     */
/* ------------------------------------------------------------------ */
function EmailLogPanel({ requestId }: { requestId: string }) {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && emails.length === 0) {
      setLoading(true);
      fetchEmailLog(requestId)
        .then(setEmails)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [open, requestId]);

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-container-low/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Mail size={18} className="text-primary" />
          <span className="font-bold text-on-surface">Email Log</span>
          {emails.length > 0 && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{emails.length}</span>
          )}
        </div>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && (
        <div className="px-6 pb-6 space-y-3">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <Loader2 size={14} className="animate-spin" /> Loading emails...
            </div>
          ) : emails.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No emails sent yet.</p>
          ) : (
            emails.map((email, i) => (
              <div key={i} className="bg-surface-container-low p-4 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-on-surface">{email.subject || 'Email'}</p>
                  <span className="text-xs text-on-surface-variant">{email.sentAt ? new Date(email.sentAt).toLocaleString() : ''}</span>
                </div>
                <p className="text-xs text-on-surface-variant">To: {email.to}</p>
                {email.status && (
                  <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${email.status === 'sent' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {email.status}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Detail Page                                                    */
/* ------------------------------------------------------------------ */
export default function VisaRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useUserRole();
  const [request, setRequest] = useState<VisaRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    fetchVisaRequest(id)
      .then(setRequest)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="p-10 max-w-[1200px] mx-auto">
        <div className="bg-error-container/20 text-on-error-container p-6 rounded-xl">
          <p className="font-bold">Failed to load visa request</p>
          <p className="text-sm mt-1">{error || 'Request not found'}</p>
        </div>
      </div>
    );
  }

  const role = currentUser?.role || 'MANAGER';
  const userName = currentUser?.name || 'Unknown';

  return (
    <div className="p-10 max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/visa-requests" className="p-2 bg-surface-container-lowest rounded-full hover:bg-surface-container-low transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Visa Request</h1>
            <p className="text-sm text-on-surface-variant font-mono">{request.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={request.status} />
          <button onClick={load} className="p-2 rounded-full hover:bg-surface-container-low transition-colors" title="Refresh">
            <RefreshCw size={18} className="text-on-surface-variant" />
          </button>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-4">
        <WorkflowProgressTracker status={request.status} currentStep={request.currentStep} />
      </div>

      {/* Request Details Card */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
        <h3 className="text-lg font-bold font-headline mb-4 border-b border-surface-container pb-3">Request Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoItem icon={User} label="Applicant" value={request.employeeName} />
          <InfoItem icon={Mail} label="Email" value={request.applicantEmail} />
          <InfoItem icon={FileText} label="Visa Type" value={request.employeeRole || '--'} />
          <InfoItem icon={Globe} label="Destination" value={request.destination} />
          <InfoItem icon={MapPin} label="Travel Location" value={request.travelLocation || request.destination} />
          <InfoItem icon={Calendar} label="Duration" value={`${request.numberOfDays} day(s)`} />
          <InfoItem icon={Building2} label="Cost Centre" value={request.costCentre} />
          <InfoItem icon={User} label="Manager" value={`${request.managerName} (${request.managerEmail})`} />
          <InfoItem icon={Clock} label="Created" value={new Date(request.createdAt).toLocaleString()} />
        </div>
        {request.managerComments && (
          <div className="mt-4 p-4 bg-surface-container-low rounded-xl">
            <p className="text-xs font-bold text-on-surface-variant uppercase mb-1">Manager Comments</p>
            <p className="text-sm text-on-surface">{request.managerComments}</p>
          </div>
        )}
        {request.costProposal && (
          <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
            <p className="text-xs font-bold text-on-surface-variant uppercase mb-2">Cost Proposal</p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-center">
              {(['visaFees', 'serviceFees', 'travelCost', 'accommodationCost', 'otherCosts', 'totalCost'] as const).map((f) => (
                <div key={f}>
                  <p className="text-[10px] text-on-surface-variant uppercase">{f.replace(/([A-Z])/g, ' $1')}</p>
                  <p className={`text-sm font-bold ${f === 'totalCost' ? 'text-primary text-lg' : 'text-on-surface'}`}>
                    {'\u20AC'}{(request.costProposal![f] || 0).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Step Action Panel */}
      <StepActionPanel request={request} role={role} userName={userName} onActionComplete={load} />

      {/* Workflow Timeline */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
        <h3 className="text-lg font-bold font-headline mb-4 border-b border-surface-container pb-3">Workflow History</h3>
        <WorkflowTimeline events={request.workflowHistory} />
      </div>

      {/* Email Log */}
      <EmailLogPanel requestId={request.id} />
    </div>
  );
}

/* Small helper */
function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-primary"><Icon size={16} /></div>
      <div>
        <p className="text-xs font-bold text-on-surface-variant uppercase">{label}</p>
        <p className="text-sm text-on-surface">{value}</p>
      </div>
    </div>
  );
}
