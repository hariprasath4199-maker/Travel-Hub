import { useState, useEffect, useMemo } from 'react';
import {
  Filter,
  Share2,
  PlaneTakeoff,
  Eye,
  Check,
  X,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { fetchRequests, updateRequestStatus } from '@/src/api';
import { StatusBadge } from '@/src/components/StatusBadge';
import { Link } from 'react-router-dom';
import { TravelRequest } from '@/src/types';
import { useUserRole } from '@/src/context/UserRoleContext';
import { ROLE_LABELS } from '@/src/visaApi';
import { filterTravelRequests, ROLE_VIEW_INFO } from '@/src/utils/roleFilter';

export default function Requests() {
  const { currentUser } = useUserRole();
  const [allRequests, setAllRequests] = useState<TravelRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = () => {
    setLoading(true);
    fetchRequests()
      .then(setAllRequests)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRequests(); }, []);

  /* ── Role-based filtering ── */
  const requests = useMemo(
    () => filterTravelRequests(allRequests, currentUser),
    [allRequests, currentUser]
  );

  const handleStatusChange = async (id: string, status: 'APPROVED' | 'DENIED') => {
    try {
      await updateRequestStatus(id, status);
      loadRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const pending = requests.filter(r => r.status === 'PENDING').length;
  const approved = requests.filter(r => r.status === 'APPROVED').length;

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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

      <div className="grid grid-cols-12 gap-6 items-end">
        <div className="col-span-12 lg:col-span-8">
          <h2 className="text-4xl font-extrabold tracking-tight font-headline text-on-surface mb-2">Request Queue</h2>
          <p className="text-on-surface-variant font-body">{requests.length} request{requests.length !== 1 ? 's' : ''} visible to you</p>
        </div>
        <div className="col-span-12 lg:col-span-4 flex justify-end space-x-4">
          <div className="bg-surface-container-lowest p-4 rounded-xl flex items-center space-x-4 shadow-sm">
            <div className="bg-secondary-container p-2 rounded-lg text-on-secondary-container"><Clock size={20} /></div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Pending</p>
              <p className="text-xl font-bold font-headline">{String(pending).padStart(2, '0')}</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-xl flex items-center space-x-4 shadow-sm">
            <div className="bg-tertiary-container p-2 rounded-lg text-on-tertiary-container"><CheckCircle size={20} /></div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Approved</p>
              <p className="text-xl font-bold font-headline">{String(approved).padStart(2, '0')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low p-4 rounded-xl flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2 bg-surface-container-lowest px-3 py-2 rounded-lg shadow-sm">
          <Filter size={14} className="text-outline" />
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-tighter">Filter By:</span>
        </div>
        <select className="bg-surface-container-lowest border-none text-sm rounded-lg py-2 pl-4 pr-10 focus:ring-1 focus:ring-primary font-medium shadow-sm">
          <option>All Statuses</option><option>Pending</option><option>Approved</option><option>Denied</option>
        </select>
        <button className="ml-auto text-primary text-sm font-bold flex items-center space-x-1 hover:underline">
          <span>Export Data</span><Share2 size={14} />
        </button>
      </div>

      <div className="bg-surface-container rounded-2xl overflow-hidden shadow-sm">
        {requests.length === 0 ? (
          <div className="p-12 text-center">
            <PlaneTakeoff size={40} className="mx-auto text-on-surface-variant/30 mb-4" />
            <p className="text-on-surface-variant text-sm mb-2">No travel requests found.</p>
            <Link to="/requests/new" className="text-primary font-semibold text-sm hover:underline">Create your first request</Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-surface-container-high">
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Employee</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Destination</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Dates</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Purpose</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Cost</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} className="group hover:bg-surface-container-low transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-3">
                          <img className="w-10 h-10 rounded-full object-cover" src={req.avatar} alt={req.employeeName} />
                          <div>
                            <p className="text-sm font-bold font-headline leading-none">{req.employeeName}</p>
                            <p className="text-[11px] text-on-surface-variant">{req.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-2">
                          <PlaneTakeoff size={18} className="text-primary" />
                          <span className="text-sm font-medium">{req.destination}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium">{req.dates}</p>
                        <p className="text-[11px] text-on-surface-variant">{req.nights}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-medium px-3 py-1 bg-surface-container-highest rounded-full">{req.purpose}</span>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold font-headline">{req.cost}</td>
                      <td className="px-6 py-5"><StatusBadge status={req.status} /></td>
                      <td className="px-6 py-5 text-right space-x-2">
                        <Link to={`/requests/${req.id}`} className="inline-flex p-2 text-on-surface-variant hover:text-primary hover:bg-white rounded-lg transition-all active:scale-90 shadow-sm">
                          <Eye size={18} />
                        </Link>
                        {req.status === 'PENDING' && (
                          <>
                            <button onClick={() => handleStatusChange(req.id, 'APPROVED')} className="p-2 text-tertiary hover:bg-tertiary-container/30 rounded-lg transition-all active:scale-90"><Check size={18} /></button>
                            <button onClick={() => handleStatusChange(req.id, 'DENIED')} className="p-2 text-error hover:bg-error-container/20 rounded-lg transition-all active:scale-90"><X size={18} /></button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-surface-container-high px-6 py-4">
              <p className="text-xs text-on-surface-variant font-medium">Showing {requests.length} request{requests.length !== 1 ? 's' : ''}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
