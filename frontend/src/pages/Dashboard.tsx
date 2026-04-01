import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Clock,
  MapPin,
  Building2,
  MoreVertical,
  Lightbulb,
  Loader2
} from 'lucide-react';
import { StatCard } from '@/src/components/StatCard';
import { StatusBadge } from '@/src/components/StatusBadge';
import { Link } from 'react-router-dom';
import { fetchRequests, fetchStats, type DashboardStats } from '@/src/api';
import { TravelRequest } from '@/src/types';

export default function Dashboard() {
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchRequests(), fetchStats()])
      .then(([reqs, s]) => {
        setRequests(reqs);
        setStats(s);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-10 space-y-8 max-w-[1400px] mx-auto">
      {/* Hero Metrics */}
      <section className="grid grid-cols-12 gap-6">
        <StatCard
          title="Monthly Travel Spent"
          value={stats?.monthlySpent || '$0.00'}
          trend={{ value: "Live from data", isPositive: true, icon: TrendingUp }}
          className="col-span-12 lg:col-span-4"
        />
        <StatCard
          title="Pending Requests"
          value={String(stats?.pendingRequests || 0)}
          footer={{ label: `${stats?.totalRequests || 0} total requests`, icon: Clock }}
          className="col-span-12 lg:col-span-3"
        />
        <StatCard
          title="Active Travelers"
          value={String(stats?.totalTravelers || 0)}
          footer={{ label: "From local data", icon: MapPin }}
          className="col-span-12 lg:col-span-3"
        />
        <StatCard
          title="Approved"
          value={String(stats?.approvedRequests || 0)}
          variant="primary"
          className="col-span-12 lg:col-span-2"
        />
      </section>

      <div className="grid grid-cols-12 gap-8">
        {/* Recent Requests */}
        <section className="col-span-12 xl:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-headline">Recent Travel Requests</h3>
            <Link to="/requests" className="text-sm font-semibold text-primary hover:underline">View all records</Link>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm">
            {requests.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-on-surface-variant text-sm mb-2">No travel requests yet.</p>
                <Link to="/requests/new" className="text-primary font-semibold text-sm hover:underline">Create your first request</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low border-none">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Traveler</th>
                      <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Destination</th>
                      <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Dates</th>
                      <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {requests.slice(0, 5).map((req) => (
                      <tr key={req.id} className="group hover:bg-surface-container-low transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <img className="w-9 h-9 rounded-full object-cover" src={req.avatar} alt={req.employeeName} />
                            <div>
                              <p className="text-sm font-semibold text-on-surface">{req.employeeName}</p>
                              <p className="text-[11px] text-on-surface-variant">{req.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <Building2 size={18} className="text-primary" />
                            <span className="text-sm font-medium">{req.destination}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm text-on-surface-variant">{req.dates}</p>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="px-6 py-5 text-right">
                          <Link to={`/requests/${req.id}`} className="text-outline-variant hover:text-primary transition-colors">
                            <MoreVertical size={20} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Contextual Insight */}
          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 flex items-start space-x-4">
            <div className="bg-primary-container p-3 rounded-full text-on-primary-container">
              <Lightbulb size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold font-headline text-primary mb-1">Data Storage Active</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed max-w-xl">
                All data is now stored locally in txt files. Travel requests are saved in input/requests.txt and travelers in input/travelers.txt.
              </p>
            </div>
          </div>
        </section>

        {/* Sidebar Trends */}
        <aside className="col-span-12 xl:col-span-4 space-y-8">
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold font-headline mb-6">Request Summary</h3>
            <div className="space-y-6">
              {[
                { label: 'Pending', value: String(stats?.pendingRequests || 0), progress: stats ? (stats.pendingRequests / Math.max(stats.totalRequests, 1)) * 100 : 0 },
                { label: 'Approved', value: String(stats?.approvedRequests || 0), progress: stats ? (stats.approvedRequests / Math.max(stats.totalRequests, 1)) * 100 : 0 },
                { label: 'Total', value: String(stats?.totalRequests || 0), progress: 100 },
              ].map((trend) => (
                <div key={trend.label} className="relative pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-on-surface uppercase tracking-tighter">{trend.label}</span>
                    <span className="text-xs font-bold text-on-surface">{trend.value}</span>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-surface-container">
                    <div
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"
                      style={{ width: `${trend.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-headline">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <Link to="/requests/new" className="block p-4 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors">
                <p className="text-sm font-bold">New Travel Request</p>
                <p className="text-xs text-on-surface-variant">Submit a new authorization</p>
              </Link>
              <Link to="/travelers" className="block p-4 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors">
                <p className="text-sm font-bold">View Travelers</p>
                <p className="text-xs text-on-surface-variant">Manage traveler profiles</p>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
