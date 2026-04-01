import { 
  TrendingUp, 
  Clock, 
  MapPin, 
  Building2, 
  MoreVertical, 
  ArrowRight,
  Lightbulb
} from 'lucide-react';
import { StatCard } from '@/src/components/StatCard';
import { MOCK_REQUESTS } from '@/src/constants';
import { StatusBadge } from '@/src/components/StatusBadge';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="p-10 space-y-8 max-w-[1400px] mx-auto">
      {/* Hero Metrics */}
      <section className="grid grid-cols-12 gap-6">
        <StatCard 
          title="Monthly Travel Spent"
          value="$142,580"
          trend={{ value: "12.5% vs last month", isPositive: true, icon: TrendingUp }}
          className="col-span-12 lg:col-span-4"
        />
        <StatCard 
          title="Pending Requests"
          value="24"
          footer={{ label: "8 priority reviews", icon: Clock }}
          className="col-span-12 lg:col-span-3"
        />
        <StatCard 
          title="Active Travelers"
          value="118"
          footer={{ label: "Across 14 countries", icon: MapPin }}
          className="col-span-12 lg:col-span-3"
        />
        <StatCard 
          title="Policy Status"
          value="94%"
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
                  {MOCK_REQUESTS.slice(0, 3).map((req) => (
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
                        <button className="text-outline-variant hover:text-primary transition-colors">
                          <MoreVertical size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Contextual Insight */}
          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 flex items-start space-x-4">
            <div className="bg-primary-container p-3 rounded-full text-on-primary-container">
              <Lightbulb size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold font-headline text-primary mb-1">Queue Intelligence</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed max-w-xl">
                A high volume of requests for Zurich is currently pending. Consider reviewing travel policies for the upcoming Tech Summit to streamline approval workflows for Engineering departments.
              </p>
            </div>
          </div>
        </section>

        {/* Sidebar Trends */}
        <aside className="col-span-12 xl:col-span-4 space-y-8">
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold font-headline mb-6">Spend Trends</h3>
            <div className="space-y-6">
              {[
                { label: 'Marketing', value: '$42k', progress: 75 },
                { label: 'Engineering', value: '$28k', progress: 45 },
                { label: 'Operations', value: '$12k', progress: 25 },
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
              <h3 className="text-lg font-bold font-headline">Top Destination</h3>
              <span className="px-2 py-1 bg-tertiary-container text-on-tertiary-fixed text-[10px] font-bold rounded">HOT</span>
            </div>
            <div className="h-40 rounded-xl bg-surface-container mb-4 overflow-hidden">
              <img 
                alt="Tokyo skyline" 
                className="w-full h-full object-cover grayscale-[20%]" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSc8SSJWqPJnHzyd-hb8dUGR5TDYWGUceZFl2-Fcb8G8J3qfQNsociyxLeZaZRvCqsmYEq2jAfzg2Hm903nEY8ziIkGR3RjktW0C30bWh7IgTp1xxeQpOcxW8S_zNIVBNTANncij-nm-UwWcPRzqd9jjIlQjgUwpwkGOLB_gdT06Y1dnugoJAkvBVYfTnmTvZk67vHzWGa19iOl9myD43RpFUbC2WtHGYOG5suOcqIcKv7TqX-h279VRooQozavJJaXNd7T8wHRs7U"
              />
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm font-bold">Tokyo, Japan</p>
                <p className="text-xs text-on-surface-variant">18 trips requested this week</p>
              </div>
              <ArrowRight size={20} className="text-primary" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
