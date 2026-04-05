import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, CreditCard, Globe, Calendar, AlertTriangle,
  FileText, Building2, MessageSquare, Send, Loader2, Phone, Hash, MapPin,
} from 'lucide-react';
import { createVisaRequest } from '@/src/visaApi';
import { FileUpload } from '@/src/components/FileUpload';
import { useUserRole } from '@/src/context/UserRoleContext';
import { CountryCodePicker } from '@/src/components/CountryCodePicker';
import { fetchCostCentres, fetchLocations, fetchEmployees, type CostCentre, type Location, type Employee } from '@/src/masterDataApi';

const VISA_TYPES = ['WORK', 'BUSINESS', 'TRANSIT'] as const;
const URGENCY_LEVELS = ['NORMAL', 'URGENT', 'CRITICAL'] as const;

export default function NewVisaRequest() {
  const navigate = useNavigate();
  const { currentUser } = useUserRole();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [costCentres, setCostCentres] = useState<CostCentre[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    Promise.all([fetchCostCentres(), fetchLocations(), fetchEmployees()])
      .then(([cc, loc, emp]) => { setCostCentres(cc); setLocations(loc); setEmployees(emp); })
      .catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    applicantEmail: '',
    applicantMobile: '',
    passportNumber: '',
    visaType: '' as string,
    locationId: '',
    destinationCountry: '',
    travelDateFrom: '',
    travelDateTo: '',
    urgency: 'NORMAL' as string,
    purpose: '',
    costCentre: '',
    managerComments: '',
    recommendationLetterFile: '',
    attachments: [] as string[],
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
          next.costCentre = emp.costCentre || '';
        } else {
          next.firstName = '';
          next.lastName = '';
          next.applicantEmail = '';
          next.applicantMobile = '';
        }
      }
      if (name === 'locationId') {
        const loc = locations.find(l => l.id === value);
        if (loc) next.destinationCountry = loc.country;
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const from = new Date(formData.travelDateFrom);
      const to = new Date(formData.travelDateTo);
      const numberOfDays = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)));
      const selectedLocation = locations.find(l => l.id === formData.locationId);

      const payload = {
        employeeId: formData.employeeId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        employeeName: `${formData.firstName} ${formData.lastName}`.trim(),
        applicantEmail: formData.applicantEmail,
        applicantMobile: formData.applicantMobile || undefined,
        passportNumber: formData.passportNumber,
        employeeRole: formData.visaType,
        destination: formData.destinationCountry,
        travelLocation: selectedLocation ? `${selectedLocation.city}, ${selectedLocation.country}` : formData.destinationCountry,
        travelDateFrom: formData.travelDateFrom,
        travelDateTo: formData.travelDateTo,
        numberOfDays,
        urgency: formData.urgency,
        purpose: formData.purpose,
        costCentre: formData.costCentre,
        managerName: currentUser?.name || '',
        managerEmail: currentUser?.email || '',
        managerComments: formData.managerComments,
        recommendationLetterFile: formData.recommendationLetterFile || undefined,
        attachments: formData.attachments,
        performedBy: currentUser?.name || 'Manager',
        performedByRole: currentUser?.role || 'MANAGER',
      };

      const created = await createVisaRequest(payload);
      navigate(`/visa-requests/${created.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create request');
      setIsSubmitting(false);
    }
  };

  const inputCls = 'w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all';
  const readOnlyCls = `${inputCls} opacity-70 cursor-not-allowed bg-surface-container`;
  const labelCls = 'text-sm font-bold text-on-surface-variant flex items-center gap-2';

  return (
    <div className="p-10 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-surface-container-lowest rounded-full hover:bg-surface-container-low transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight font-headline text-on-surface">New Visa Request</h2>
          <p className="text-on-surface-variant font-body mt-1">Submit a visa request to HR for processing</p>
        </div>
      </div>

      {error && (
        <div className="bg-error-container/20 text-on-error-container p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle size={18} />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Applicant Information */}
        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm space-y-6">
          <h3 className="text-xl font-bold font-headline border-b border-surface-container pb-4">Applicant Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={labelCls}><Hash size={16} /> Employee ID *</label>
              <input required name="employeeId" value={formData.employeeId} onChange={handleChange} type="text" className={inputCls} />
            </div>
            <div className="space-y-2">
              <label className={labelCls}><User size={16} /> First Name</label>
              <input name="firstName" value={formData.firstName} readOnly type="text" className={readOnlyCls} />
            </div>
            <div className="space-y-2">
              <label className={labelCls}><User size={16} /> Last Name</label>
              <input name="lastName" value={formData.lastName} readOnly type="text" className={readOnlyCls} />
            </div>
            <div className="space-y-2">
              <label className={labelCls}><Mail size={16} /> Email</label>
              <input name="applicantEmail" value={formData.applicantEmail} readOnly type="email" className={readOnlyCls} />
            </div>
            <div className="space-y-2 relative">
              <label className={labelCls}><Phone size={16} /> Mobile Number</label>
              <CountryCodePicker
                value={formData.applicantMobile}
                onChange={(phone) => setFormData(prev => ({ ...prev, applicantMobile: phone }))}
              />
            </div>
            <div className="space-y-2">
              <label className={labelCls}><CreditCard size={16} /> Passport Number *</label>
              <input required name="passportNumber" value={formData.passportNumber} onChange={handleChange} type="text" className={inputCls} />
            </div>
            <div className="space-y-2">
              <label className={labelCls}><FileText size={16} /> Visa Type *</label>
              <select required name="visaType" value={formData.visaType} onChange={handleChange} className={`${inputCls} appearance-none`}>
                <option value="" disabled>Select visa type...</option>
                {VISA_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Travel Details */}
        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm space-y-6">
          <h3 className="text-xl font-bold font-headline border-b border-surface-container pb-4">Travel Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <label className={labelCls}><Globe size={16} /> Destination Country</label>
              <input name="destinationCountry" value={formData.destinationCountry} readOnly type="text" className={readOnlyCls} />
            </div>
            <div className="space-y-2">
              <label className={labelCls}><AlertTriangle size={16} /> Urgency</label>
              <select name="urgency" value={formData.urgency} onChange={handleChange} className={`${inputCls} appearance-none`}>
                {URGENCY_LEVELS.map((u) => (
                  <option key={u} value={u}>{u.charAt(0) + u.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
            <div />
            <div className="space-y-2">
              <label className={labelCls}><Calendar size={16} /> Travel From *</label>
              <input required name="travelDateFrom" value={formData.travelDateFrom} onChange={handleChange} type="date" className={inputCls} />
            </div>
            <div className="space-y-2">
              <label className={labelCls}><Calendar size={16} /> Travel To *</label>
              <input required name="travelDateTo" value={formData.travelDateTo} onChange={handleChange} type="date" className={inputCls} />
            </div>
          </div>
          <div className="space-y-2">
            <label className={labelCls}><MessageSquare size={16} /> Purpose of Travel *</label>
            <textarea required name="purpose" value={formData.purpose} onChange={handleChange} rows={3} placeholder="Describe the purpose of this visa request..." className={`${inputCls} resize-none`} />
          </div>
        </div>

        {/* Cost Centre & Manager Info */}
        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm space-y-6">
          <h3 className="text-xl font-bold font-headline border-b border-surface-container pb-4">Cost Centre & Manager Notes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={labelCls}><Building2 size={16} /> Cost Centre *</label>
              <select required name="costCentre" value={formData.costCentre} onChange={handleChange} className={`${inputCls} appearance-none`}>
                <option value="" disabled>Select cost centre...</option>
                {costCentres.map((cc) => (
                  <option key={cc.id} value={cc.id}>{cc.id} — {cc.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className={labelCls}><User size={16} /> Submitting Manager</label>
              <input type="text" readOnly value={currentUser ? `${currentUser.name} (${currentUser.email})` : 'Loading...'} className={readOnlyCls} />
            </div>
          </div>
          <div className="space-y-2">
            <label className={labelCls}><MessageSquare size={16} /> Manager Comments</label>
            <textarea name="managerComments" value={formData.managerComments} onChange={handleChange} rows={3} placeholder="Optional comments or special instructions..." className={`${inputCls} resize-none`} />
          </div>
          <FileUpload label="Attachments (Recommendation Letter, Supporting Documents)" onUploadComplete={(filenames) => setFormData((prev) => ({ ...prev, attachments: filenames, recommendationLetterFile: filenames[0] || '' }))} />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-primary text-on-primary rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2">
            {isSubmitting ? (<><Loader2 size={18} className="animate-spin" /> Submitting...</>) : (<><Send size={18} /> Submit to HR</>)}
          </button>
        </div>
      </form>
    </div>
  );
}
