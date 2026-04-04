import { useState, useEffect, useMemo } from 'react';
import {
  Filter, FileDown, BadgeCheck, History, ChevronRight, UserPlus,
  FileText, CreditCard, Star, Car, AlertCircle, PlaneTakeoff, Loader2
} from 'lucide-react';
import { fetchTravelers } from '@/src/api';
import { StatusBadge } from '@/src/components/StatusBadge';
import { Traveler } from '@/src/types';
import { useUserRole } from '@/src/context/UserRoleContext';
import { ROLE_LABELS } from '@/src/visaApi';
import { filterTravelers, ROLE_VIEW_INFO } from '@/src/utils/roleFilter';

export default function Travelers() {
  const { currentUser } = useUserRole();
  const [allTravelers, setAllTravelers] = useState<Traveler[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTravelers().then(setAllTravelers).catch(console.error).finally(() => setLoading(false));
  }, []);

  /* ── Role-based filtering ── */
  const travelers = useMemo(
    () => filterTravelers(allTravelers, currentUser),
    [allTravelers, currentUser]
  );

  if (loading) {
    return <div className="p-10 flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const compliantCount = travelers.filter(t => t.status === 'Compliant').length;
  const compliancePercent = travelers.length > 0 ? Math.round((compliantCount / travelers.length) * 100) : 0;

  return (
    <div className="p-10 space-y-8 max-w-[1400px] mx-auto">
      {/* Role-based access banner */}
      {currentUser && (
        <div className="rounded-xl px-5 py-3 flex items-center gap-4"
             style={{
               background: `${ROLE_VIEW_INFO[currentUser.role].color}08`,
               border: `1px solid ${ROLE_VIEW_INFO[currentUser.role].color}20`,
             }}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">{ROLE_VIEW_INFO[currentUser.role].label}</span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold"
                    style={{ background: `${ROLE_VIEW_INFO[currentUser.role].color}15`, color: ROLE_VIEW_INFO[currentUser.role].color }}>
                {ROLE_LABELS[currentUser.role]}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{ROLE_VIEW_INFO[currentUser.role].desc}</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mb-1">Traveler Profiles</h2>
          <p className="text-on-surface-variant font-medium">{travelers.length} traveler{travelers.length !== 1 ? 's' : ''} visible to you</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-surface-container-high text-on-secondary-container rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-surface-container transition-colors"><Filter size={16} />Filters</button>
          <button className="px-4 py-2 bg-surface-container-high text-on-secondary-container rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-surface-container transition-colors"><FileDown size={16} />Export</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
        {travelers.map((traveler) => (
          <div key={traveler.id} className="bg-surface-container-low rounded-2xl p-6 group transition-all duration-300 hover:bg-surface-container border border-transparent hover:border-outline-variant/10 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4">
                <img className="w-14 h-14 rounded-2xl object-cover" src={traveler.avatar} alt={traveler.name} />
                <div>
                  <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">{traveler.name}</h3>
                  <p className="text-sm font-medium text-on-surface-variant">{traveler.role}</p>
                  <p className="text-[11px] text-on-surface-variant/70 uppercase tracking-widest mt-1">ID: {traveler.id}</p>
                </div>
              </div>
              <StatusBadge status={traveler.status} />
            </div>
            <div className="space-y-4">
              <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm">
                <h4 className="text-[10px] font-bold text-outline uppercase tracking-widest mb-3">Travel Preferences</h4>
                <div className="flex flex-wrap gap-2">
                  {(traveler.preferences || []).map(pref => (
                    <span key={pref} className="bg-secondary-container text-on-secondary-container px-2 py-1 rounded text-[11px] font-semibold">{pref}</span>
                  ))}
                  {(!traveler.preferences || traveler.preferences.length === 0) && <span className="text-[11px] text-on-surface-variant">No preferences set</span>}
                </div>
              </div>
              <div className="flex items-center justify-between px-2">
                <div className="flex gap-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-outline uppercase">Passport</span>
                    <span className={`text-xs font-semibold flex items-center gap-1 ${traveler.passportStatus === 'Valid' ? 'text-tertiary' : 'text-error'}`}>
                      {traveler.passportStatus === 'Valid' ? <BadgeCheck size={14} /> : <AlertCircle size={14} />}{traveler.passportStatus}
                    </span>
                  </div>
                  {traveler.visaStatus !== 'None' && traveler.visaRegion && (
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-outline uppercase">Visa ({traveler.visaRegion})</span>
                      <span className="text-xs font-semibold text-tertiary flex items-center gap-1"><BadgeCheck size={14} /> {traveler.visaStatus}</span>
                    </div>
                  )}
                </div>
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest border-2 border-surface-container-low flex items-center justify-center"><FileText size={14} /></div>
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest border-2 border-surface-container-low flex items-center justify-center"><CreditCard size={14} /></div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-outline-variant/10 flex justify-between items-center">
              <button className="text-primary font-bold text-xs flex items-center gap-1 hover:underline"><History size={14} />View History</button>
              <button className="p-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-primary hover:text-on-primary transition-all"><ChevronRight size={18} /></button>
            </div>
          </div>
        ))}
        <div className="border-2 border-dashed border-outline-variant/30 rounded-2xl p-6 flex flex-col items-center justify-center text-on-surface-variant hover:border-primary/50 transition-all group cursor-pointer shadow-sm">
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-on-primary transition-all"><UserPlus size={24} /></div>
          <span className="font-bold text-sm">Add New Traveler</span>
          <p className="text-[11px] text-center mt-1 px-8">Add traveler data to input/travelers.txt</p>
        </div>
      </div>

      {travelers.length > 0 && (
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-surface-container-lowest p-8 rounded-3xl shadow-sm flex flex-col md:flex-row gap-10 items-center">
            <div className="flex-1">
              <h4 className="text-[11px] font-bold text-primary uppercase tracking-widest mb-2">Compliance Health</h4>
              <h3 className="text-2xl font-extrabold text-on-surface mb-4">{compliancePercent}% Directory Compliance</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed max-w-md">{compliantCount} of {travelers.length} travelers are compliant. Data stored in input/travelers.txt.</p>
            </div>
            <div className="w-full md:w-64 h-48 bg-surface-container-low rounded-2xl relative overflow-hidden flex items-center justify-center">
              <div className="relative flex flex-col items-center">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-surface-container-high" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="12"></circle>
                    <circle className="text-primary" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364.4" strokeDashoffset={364.4 * (1 - compliancePercent / 100)} strokeWidth="12"></circle>
                  </svg>
                  <span className="absolute text-2xl font-black text-on-surface">{compliancePercent}%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary to-primary-dim p-8 rounded-3xl text-on-primary flex flex-col justify-between shadow-lg shadow-primary/20">
            <div><PlaneTakeoff size={40} className="opacity-50 mb-4" /><h4 className="text-4xl font-black mb-1">{travelers.length}</h4><p className="text-xs font-medium opacity-80">Total travelers</p></div>
          </div>
        </div>
      )}
    </div>
  );
}
