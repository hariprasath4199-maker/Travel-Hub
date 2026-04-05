import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Loader2 } from 'lucide-react';
import { fetchRequestById, updateRequestStatus } from '@/src/api';
import { StatusBadge } from '@/src/components/StatusBadge';
import { TravelRequest } from '@/src/types';

export default function RequestDetail() {
  const { id } = useParams();
  const [request, setRequest] = useState<TravelRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchRequestById(id)
        .then(setRequest)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleStatusChange = async (status: 'APPROVED' | 'DENIED') => {
    if (!request) return;
    try {
      const updated = await updateRequestStatus(request.id, status);
      setRequest(updated);
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return <div className="p-10 flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!request) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold mb-2">Request Not Found</h2>
        <Link to="/requests" className="text-primary font-semibold hover:underline">Back to Requests</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-low">
      <div className="sticky top-16 z-30 flex items-center justify-between px-8 py-4 bg-white/60 backdrop-blur-md border-b border-white/20">
        <div className="flex items-center gap-4">
          <Link to="/requests" className="p-2 rounded-lg hover:bg-surface-container transition-colors"><ArrowLeft size={20} /></Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold tracking-tight">{request.id}: {request.purpose}</h2>
              <StatusBadge status={request.status} />
            </div>
            <p className="text-xs text-on-surface-variant font-medium">Submitted by {request.employeeName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {request.status === 'PENDING' && (
            <>
              <button onClick={() => handleStatusChange('DENIED')} className="px-5 py-2.5 text-sm font-semibold text-error hover:bg-error/5 rounded-lg transition-colors active:scale-95">Deny</button>
              <button onClick={() => handleStatusChange('APPROVED')} className="px-6 py-2.5 text-sm font-bold text-on-primary bg-gradient-to-br from-primary to-primary-dim rounded-lg shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95">Approve</button>
            </>
          )}
        </div>
      </div>

      <div className="p-8 grid grid-cols-12 gap-8 max-w-[1600px] mx-auto">
        <div className="col-span-12 xl:col-span-8 space-y-8">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-surface-container-lowest rounded-xl shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Employee Information</h3>
              <div className="flex items-center gap-4">
                <img alt="Traveler" className="w-14 h-14 rounded-xl object-cover" src={request.avatar} />
                <div>
                  <p className="text-lg font-bold">{request.employeeName}</p>
                  <p className="text-sm text-on-surface-variant">{request.role} • {request.department}</p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-surface-container-lowest rounded-xl shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Trip Details</h3>
              <p className="text-on-surface leading-relaxed text-sm mb-4">{request.purpose}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2"><Calendar size={18} className="text-primary" /><span className="text-sm font-semibold">{request.dates}</span></div>
                <div className="flex items-center gap-2"><MapPin size={18} className="text-primary" /><span className="text-sm font-semibold">{request.destination}</span></div>
              </div>
            </div>
          </section>

          <section className="p-8 bg-surface-container-lowest rounded-xl shadow-sm">
            <h3 className="text-lg font-extrabold tracking-tight mb-6">Budget Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="p-4 bg-surface-container-low rounded-lg">
                <p className="text-xs font-bold text-on-surface-variant uppercase mb-1">Duration</p>
                <p className="text-2xl font-black font-headline text-primary">{request.nights}</p>
              </div>
              <div className="p-4 bg-surface-container-low rounded-lg">
                <p className="text-xs font-bold text-on-surface-variant uppercase mb-1">Department</p>
                <p className="text-xl font-black font-headline text-primary">{request.department}</p>
              </div>
              <div className="p-4 bg-primary text-on-primary rounded-lg shadow-lg">
                <p className="text-xs font-bold opacity-80 uppercase mb-1">Total Cost</p>
                <p className="text-2xl font-black font-headline">{request.cost}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-8">
          <section className="p-6 bg-surface-container-lowest rounded-xl shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Data Source</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-on-surface-variant">Storage</span><span className="font-semibold">input/requests.txt</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Request ID</span><span className="font-semibold">{request.id}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Status</span><StatusBadge status={request.status} /></div>
            </div>
          </section>
          <section className="p-6 bg-surface-container-lowest rounded-xl shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Internal Notes</h3>
            <textarea className="w-full bg-surface-container-low border-none rounded-xl text-sm p-4 h-24 focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50 resize-none" placeholder="Notes are stored locally in this session..."></textarea>
          </section>
        </div>
      </div>
    </div>
  );
}
