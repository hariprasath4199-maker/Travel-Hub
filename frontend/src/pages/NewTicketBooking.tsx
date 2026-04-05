import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Globe, Calendar, AlertTriangle,
  FileText, MessageSquare, Send, Loader2, Phone, Hash, MapPin,
} from 'lucide-react';
import { createTicketBooking } from '@/src/ticketApi';
import { useUserRole } from '@/src/context/UserRoleContext';
import { CountryCodePicker } from '@/src/components/CountryCodePicker';
import { fetchLocations, fetchEmployees, type Location, type Employee } from '@/src/masterDataApi';
import { FileUpload } from '@/src/components/FileUpload';

export default function NewTicketBooking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useUserRole();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const visaRequestId = searchParams.get('visaRequestId') || '';

  useEffect(() => {
    Promise.all([fetchLocations(), fetchEmployees()])
      .then(([loc, emp]) => { setLocations(loc); setEmployees(emp); })
      .catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    applicantEmail: '',
    applicantMobile: '',
    managerName: currentUser?.name || '',
    managerEmail: currentUser?.email || '',
    locationId: '',
    destination: '',
    travelStartDate: '',
    travelEndDate: '',
    purpose: '',
    attachments: [] as string[],
    visaRequestId,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'employeeId') {
        const emp = employees.find(e => e.employeeId === value);
        if (emp) {
          next.firstName = emp.firstName;
          next.lastName = emp.lastName;
          next.applicantEmail = emp.email;
          next.applicantMobile = emp.mobile || '';
        } else {
          next.firstName = '';
          next.lastName = '';
          next.applicantEmail = '';
          next.applicantMobile = '';
        }
      }
      if (name === 'locationId') {
        const loc = locations.find(l => l.id === value);
        if (loc) next.destination = `${loc.city}, ${loc.country}`;
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const created = await createTicketBooking({
        ...formData,
        applicantName: `${formData.firstName} ${formData.lastName}`.trim(),
      });
      navigate(`/ticket-bookings/${created.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
      setIsSubmitting(false);
    }
  };

  const inputCls = 'w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all';
  const readOnlyCls = `${inputCls} opacity-70 cursor-not-allowed bg-surface-container`;
  const labelCls = 'text-sm font-bold text-on-surface-variant flex items-center gap-2';

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <button onClick={() => navigate('/ticket-bookings')} className="mb-6 flex items-center gap-2 text-primary hover:text-primary-dim transition-colors">
        <ArrowLeft size={18} />
        <span className="font-bold">Back to Ticket Bookings</span>
      </button>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-on-surface mb-2">New Ticket Request</h1>
          <p className="text-on-surface-variant">Fill in the details to request a new ticket booking for your travel.</p>
        </div>

        {error && (
          <div className="mb-6 bg-error-container/20 text-on-error-container p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Applicant Section */}
          <div>
            <h2 className="text-lg font-bold text-on-surface mb-4">Applicant Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className={labelCls}><Hash size={16} /> Employee ID *</label>
                <input required type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} className={inputCls} />
              </div>
              <div className="space-y-2">
                <label className={labelCls}><User size={16} /> First Name</label>
                <input type="text" name="firstName" value={formData.firstName} readOnly className={readOnlyCls} />
              </div>
              <div className="space-y-2">
                <label className={labelCls}><User size={16} /> Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} readOnly className={readOnlyCls} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className={labelCls}><Mail size={16} /> Email</label>
                <input type="email" name="applicantEmail" value={formData.applicantEmail} readOnly className={readOnlyCls} />
              </div>
            </div>
            <div className="mt-4 space-y-2 relative">
              <label className={labelCls}><Phone size={16} /> Mobile Number</label>
              <CountryCodePicker
                value={formData.applicantMobile}
                onChange={(phone) => setFormData(prev => ({ ...prev, applicantMobile: phone }))}
              />
            </div>
          </div>

          {/* Manager Section */}
          <div>
            <h2 className="text-lg font-bold text-on-surface mb-4">Manager Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelCls}><User size={16} /> Manager Name *</label>
                <input type="text" name="managerName" value={formData.managerName} onChange={handleChange} required className={inputCls} />
              </div>
              <div className="space-y-2">
                <label className={labelCls}><Mail size={16} /> Manager Email *</label>
                <input type="email" name="managerEmail" value={formData.managerEmail} onChange={handleChange} required className={inputCls} />
              </div>
            </div>
          </div>

          {/* Travel Details Section */}
          <div>
            <h2 className="text-lg font-bold text-on-surface mb-4">Travel Details</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={labelCls}><MapPin size={16} /> Travel Location *</label>
                  <select required name="locationId" value={formData.locationId} onChange={handleChange} className={`${inputCls} appearance-none`}>
                    <option value="" disabled>Select location...</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.city}, {loc.country} — {loc.office}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={labelCls}><Globe size={16} /> Destination</label>
                  <input type="text" name="destination" value={formData.destination} readOnly className={readOnlyCls} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={labelCls}><Calendar size={16} /> Travel Start Date *</label>
                  <input type="date" name="travelStartDate" value={formData.travelStartDate} onChange={handleChange} required className={inputCls} />
                </div>
                <div className="space-y-2">
                  <label className={labelCls}><Calendar size={16} /> Travel End Date *</label>
                  <input type="date" name="travelEndDate" value={formData.travelEndDate} onChange={handleChange} required className={inputCls} />
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelCls}><MessageSquare size={16} /> Purpose of Travel *</label>
                <textarea name="purpose" value={formData.purpose} onChange={handleChange} placeholder="Describe the purpose of your travel..." rows={3} required className={inputCls} />
              </div>
            </div>
          </div>

          {/* Reference Section */}
          {visaRequestId && (
            <div>
              <h2 className="text-lg font-bold text-on-surface mb-4">Reference</h2>
              <div className="space-y-2">
                <label className={labelCls}><FileText size={16} /> Visa Request Reference</label>
                <input type="text" value={visaRequestId} disabled className={`${inputCls} bg-surface-container opacity-50 cursor-not-allowed`} />
              </div>
            </div>
          )}

          {/* Attachments */}
          <div>
            <h2 className="text-lg font-bold text-on-surface mb-4">Supporting Documents</h2>
            <FileUpload label="Attachments" onUploadComplete={(filenames) => setFormData(prev => ({ ...prev, attachments: filenames }))} />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end pt-6 border-t border-outline-variant/10">
            <button type="button" onClick={() => navigate('/ticket-bookings')} className="px-6 py-3 bg-surface-container-low text-on-surface rounded-xl font-bold hover:bg-surface-container transition-all active:scale-95">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2">
              {isSubmitting ? (<><Loader2 size={18} className="animate-spin" /> Creating...</>) : (<><Send size={18} /> Submit Request</>)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
