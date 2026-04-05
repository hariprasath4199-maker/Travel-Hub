import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight, Plus, Plane, Search } from 'lucide-react';
import { fetchTicketBookings, STEP_LABELS, STATUS_LABELS, type TicketBooking, type TicketBookingStatus } from '@/src/ticketApi';
import { ROLE_LABELS, fetchVisaRequests, type VisaRequest } from '@/src/visaApi';
import { StatusBadge } from '@/src/components/StatusBadge';
import { useUserRole } from '@/src/context/UserRoleContext';
import { filterTicketBookings, ROLE_VIEW_INFO } from '@/src/utils/roleFilter';

type FilterTab = 'all' | 'active' | 'completed' | 'rejected';

export default function TicketBookings() {
  const { currentUser } = useUserRole();
  const navigate = useNavigate();
  const [allBookings, setAllBookings] = useState<TicketBooking[]>([]);
  const [visaRequests, setVisaRequests] = useState<VisaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  useEffect(() => {
    Promise.all([fetchTicketBookings(), fetchVisaRequests()])
      .then(([bookings, visas]) => { setAllBookings(bookings); setVisaRequests(visas); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  /* ── Role-based filtering ── */
  const bookings = useMemo(
    () => filterTicketBookings(allBookings, currentUser, visaRequests),
    [allBookings, currentUser, visaRequests]
  );

  const isRejected = (s: TicketBookingStatus) => s === 'EVP_REJECTED';
  const isCompleted = (s: TicketBookingStatus) => s === 'COMPLETED' || s === 'TICKET_SHARED';
  const isActive = (s: TicketBookingStatus) => !isRejected(s) && !isCompleted(s);

  const filtered = bookings.filter((b) => {
    if (activeTab === 'active' && !isActive(b.status)) return false;
    if (activeTab === 'completed' && !isCompleted(b.status)) return false;
    if (activeTab === 'rejected' && !isRejected(b.status)) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        b.applicantName.toLowerCase().includes(q) ||
        b.destination.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        STATUS_LABELS[b.status]?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    all: bookings.length,
    active: bookings.filter((b) => isActive(b.status)).length,
    completed: bookings.filter((b) => isCompleted(b.status)).length,
    rejected: bookings.filter((b) => isRejected(b.status)).length,
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'active', label: `Active (${counts.active})` },
    { key: 'completed', label: `Completed (${counts.completed})` },
    { key: 'rejected', label: `Rejected (${counts.rejected})` },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 max-w-[1400px] mx-auto">
        <div className="bg-error-container/20 text-on-error-container p-6 rounded-xl">
          <p className="font-bold">Failed to load ticket bookings</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-6 max-w-[1400px] mx-auto">
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Ticket Bookings</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {filtered.length} booking{filtered.length !== 1 ? 's' : ''} visible to you
          </p>
        </div>
        <Link
          to="/ticket-bookings/new"
          className="bg-primary text-on-primary rounded-xl font-bold px-6 py-3 shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus size={18} />
          New Ticket Request
        </Link>
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-surface-container-lowest rounded-xl p-1 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.key
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
          <input
            type="text"
            placeholder="Search by name, destination, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-lowest border-none rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-surface-container-lowest p-12 rounded-xl shadow-sm text-center">
          <Plane size={48} className="mx-auto text-on-surface-variant/30 mb-4" />
          <p className="text-lg font-bold text-on-surface mb-2">
            {bookings.length === 0 ? 'No ticket bookings yet' : 'No matching bookings'}
          </p>
          <p className="text-sm text-on-surface-variant mb-6">
            {bookings.length === 0
              ? 'Create your first ticket booking request to get started.'
              : 'Try adjusting your search or filter.'}
          </p>
          {bookings.length === 0 && (
            <Link
              to="/ticket-bookings/new"
              className="bg-primary text-on-primary rounded-xl font-bold px-6 py-3 shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all active:scale-95 inline-flex items-center gap-2"
            >
              <Plus size={18} />
              New Request
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  <th className="text-xs font-bold uppercase tracking-widest text-on-surface-variant text-left px-6 py-4">ID</th>
                  <th className="text-xs font-bold uppercase tracking-widest text-on-surface-variant text-left px-6 py-4">Applicant</th>
                  <th className="text-xs font-bold uppercase tracking-widest text-on-surface-variant text-left px-6 py-4">Destination</th>
                  <th className="text-xs font-bold uppercase tracking-widest text-on-surface-variant text-left px-6 py-4">Travel Dates</th>
                  <th className="text-xs font-bold uppercase tracking-widest text-on-surface-variant text-left px-6 py-4">Status</th>
                  <th className="text-xs font-bold uppercase tracking-widest text-on-surface-variant text-left px-6 py-4">Step</th>
                  <th className="text-xs font-bold uppercase tracking-widest text-on-surface-variant text-left px-6 py-4">Created</th>
                  <th className="text-xs font-bold uppercase tracking-widest text-on-surface-variant text-left px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => (
                  <tr key={booking.id} onClick={() => navigate(`/ticket-bookings/${booking.id}`)} className="border-b border-outline-variant/5 hover:bg-surface-container-low/50 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-on-surface-variant whitespace-nowrap">{booking.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-on-surface">{booking.applicantName}</p>
                        <p className="text-xs text-on-surface-variant">{booking.applicantEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface">{booking.destination}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {new Date(booking.travelStartDate).toLocaleDateString()} - {new Date(booking.travelEndDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {STEP_LABELS[booking.currentStep] || `Step ${booking.currentStep}`}
                    </td>
                    <td className="px-6 py-4 text-xs text-on-surface-variant">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/ticket-bookings/${booking.id}`}
                        className="text-primary hover:text-primary-dim font-bold text-sm inline-flex items-center gap-1 transition-colors"
                      >
                        View <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
