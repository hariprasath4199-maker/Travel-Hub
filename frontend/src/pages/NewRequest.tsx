import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlaneTakeoff, Building2, Calendar, DollarSign, FileText, User, Briefcase, Phone, Hash, MapPin, Globe } from 'lucide-react';
import { createRequest } from '@/src/api';
import { CountryCodePicker } from '@/src/components/CountryCodePicker';
import { fetchLocations, type Location } from '@/src/masterDataApi';

export default function NewRequest() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    fetchLocations().then(setLocations).catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    employeeId: '', employeeName: '', role: '', department: '', mobileNumber: '',
    locationId: '', destination: '',
    purpose: '', departureDate: '', returnDate: '', flightCost: '', hotelCost: '', otherCost: '', notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
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
    try {
      const flight = parseFloat(formData.flightCost) || 0;
      const hotel = parseFloat(formData.hotelCost) || 0;
      const other = parseFloat(formData.otherCost) || 0;
      const totalCost = flight + hotel + other;
      const dep = new Date(formData.departureDate);
      const ret = new Date(formData.returnDate);
      const nightsNum = Math.max(1, Math.ceil((ret.getTime() - dep.getTime()) / (1000 * 60 * 60 * 24)));
      const dates = `${dep.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} - ${ret.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}`;

      await createRequest({
        employeeId: formData.employeeId,
        employeeName: formData.employeeName, role: formData.role, destination: formData.destination,
        dates, nights: `${nightsNum} night${nightsNum !== 1 ? 's' : ''}`,
        purpose: formData.purpose, cost: `\u20AC${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        department: formData.department,
        mobileNumber: formData.mobileNumber || undefined,
      });
      navigate('/requests');
    } catch (err) { console.error(err); setIsSubmitting(false); }
  };

  const inputCls = 'w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all';
  const labelCls = 'text-sm font-bold text-on-surface-variant flex items-center gap-2';

  return (
    <div className="p-10 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-surface-container-lowest rounded-full hover:bg-surface-container-low transition-colors"><ArrowLeft size={20} /></button>
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight font-headline text-on-surface">New Travel Request</h2>
          <p className="text-on-surface-variant font-body mt-1">Data saves to input/requests.txt</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm space-y-6">
          <h3 className="text-xl font-bold font-headline border-b border-surface-container pb-4">Employee Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className={labelCls}><Hash size={16} /> Employee ID *</label>
              <input required name="employeeId" value={formData.employeeId} onChange={handleChange} type="text" className={inputCls} />
            </div>
            <div className="space-y-2">
              <label className={labelCls}><User size={16} /> Full Name *</label>
              <input required name="employeeName" value={formData.employeeName} onChange={handleChange} type="text" className={inputCls} />
            </div>
            <div className="space-y-2">
              <label className={labelCls}><Briefcase size={16} /> Role *</label>
              <input required name="role" value={formData.role} onChange={handleChange} type="text" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={labelCls}><Building2 size={16} /> Department *</label>
              <select required name="department" value={formData.department} onChange={handleChange} className={`${inputCls} appearance-none`}>
                <option value="" disabled>Select department...</option>
                <option value="Engineering">Engineering</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Product Design">Product Design</option>
                <option value="Executive">Executive</option>
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
                <option value="HR">HR</option>
              </select>
            </div>
            <div className="space-y-2 relative">
              <label className={labelCls}><Phone size={16} /> Mobile Number</label>
              <CountryCodePicker
                value={formData.mobileNumber}
                onChange={(phone) => setFormData(prev => ({ ...prev, mobileNumber: phone }))}
              />
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm space-y-6">
          <h3 className="text-xl font-bold font-headline border-b border-surface-container pb-4">Trip Details</h3>
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
              <label className={labelCls}><Globe size={16} /> Destination</label>
              <input name="destination" value={formData.destination} readOnly type="text" className={`${inputCls} opacity-70 cursor-not-allowed`} />
            </div>
            <div className="space-y-2">
              <label className={labelCls}><PlaneTakeoff size={16} /> Purpose *</label>
              <input required name="purpose" value={formData.purpose} onChange={handleChange} type="text" className={inputCls} />
            </div>
            <div />
            <div className="space-y-2">
              <label className={labelCls}><Calendar size={16} /> Departure Date *</label>
              <input required name="departureDate" value={formData.departureDate} onChange={handleChange} type="date" className={inputCls} />
            </div>
            <div className="space-y-2">
              <label className={labelCls}><Calendar size={16} /> Return Date *</label>
              <input required name="returnDate" value={formData.returnDate} onChange={handleChange} type="date" className={inputCls} />
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm space-y-6">
          <h3 className="text-xl font-bold font-headline border-b border-surface-container pb-4">Estimated Budget</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className={labelCls}><DollarSign size={16} /> Flight Cost *</label>
              <input required name="flightCost" value={formData.flightCost} onChange={handleChange} type="number" min="0" step="0.01" placeholder="0.00" className={inputCls} />
            </div>
            <div className="space-y-2">
              <label className={labelCls}><DollarSign size={16} /> Hotel Cost *</label>
              <input required name="hotelCost" value={formData.hotelCost} onChange={handleChange} type="number" min="0" step="0.01" placeholder="0.00" className={inputCls} />
            </div>
            <div className="space-y-2">
              <label className={labelCls}><DollarSign size={16} /> Other</label>
              <input name="otherCost" value={formData.otherCost} onChange={handleChange} type="number" min="0" step="0.01" placeholder="0.00" className={inputCls} />
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm space-y-6">
          <h3 className="text-xl font-bold font-headline border-b border-surface-container pb-4">Additional Notes</h3>
          <div className="space-y-2">
            <label className={labelCls}><FileText size={16} /> Comments</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} placeholder="Provide any additional context..." className={`${inputCls} resize-none`}></textarea>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-primary text-on-primary rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2">
            {isSubmitting ? 'Saving...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
