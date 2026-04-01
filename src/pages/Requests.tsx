import { 
  Filter, 
  Calendar, 
  Share2, 
  PlaneTakeoff, 
  Eye, 
  Check, 
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock
} from 'lucide-react';
import { MOCK_REQUESTS } from '@/src/constants';
import { StatusBadge } from '@/src/components/StatusBadge';
import { Link } from 'react-router-dom';

export default function Requests() {
  return (
    <div className="p-10 space-y-8 max-w-[1400px] mx-auto">
      {/* Page Header & Key Metrics */}
      <div className="grid grid-cols-12 gap-6 items-end">
        <div className="col-span-12 lg:col-span-8">
          <h2 className="text-4xl font-extrabold tracking-tight font-headline text-on-surface mb-2">Request Queue</h2>
          <p className="text-on-surface-variant font-body">Manage and monitor enterprise-wide travel authorizations.</p>
        </div>
        <div className="col-span-12 lg:col-span-4 flex justify-end space-x-4">
          <div className="bg-surface-container-lowest p-4 rounded-xl flex items-center space-x-4 shadow-sm">
            <div className="bg-secondary-container p-2 rounded-lg text-on-secondary-container">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Pending Approval</p>
              <p className="text-xl font-bold font-headline">14</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-xl flex items-center space-x-4 shadow-sm">
            <div className="bg-tertiary-container p-2 rounded-lg text-on-tertiary-container">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Approved Today</p>
              <p className="text-xl font-bold font-headline">08</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface-container-low p-4 rounded-xl flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2 bg-surface-container-lowest px-3 py-2 rounded-lg shadow-sm">
          <Filter size={14} className="text-outline" />
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-tighter">Filter By:</span>
        </div>
        
        <select className="bg-surface-container-lowest border-none text-sm rounded-lg py-2 pl-4 pr-10 focus:ring-1 focus:ring-primary font-medium shadow-sm">
          <option>All Statuses</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Denied</option>
        </select>

        <select className="bg-surface-container-lowest border-none text-sm rounded-lg py-2 pl-4 pr-10 focus:ring-1 focus:ring-primary font-medium shadow-sm">
          <option>All Departments</option>
          <option>Engineering</option>
          <option>Sales & Marketing</option>
          <option>Product Design</option>
          <option>Executive</option>
        </select>

        <div className="flex items-center bg-surface-container-lowest rounded-lg py-2 px-4 space-x-3 shadow-sm">
          <Calendar size={14} className="text-outline" />
          <span className="text-sm font-medium">Oct 01, 2023 - Oct 31, 2023</span>
        </div>

        <button className="ml-auto text-primary text-sm font-bold flex items-center space-x-1 hover:underline">
          <span>Export Data</span>
          <Share2 size={14} />
        </button>
      </div>

      {/* Requests Table Section */}
      <div className="bg-surface-container rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-container-high">
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Employee Name</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Destination</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Dates</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Purpose</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Cost</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-0">
              {MOCK_REQUESTS.map((req) => (
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
                  <td className="px-6 py-5">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-6 py-5 text-right space-x-2">
                    <Link 
                      to={`/requests/${req.id}`}
                      className="inline-flex p-2 text-on-surface-variant hover:text-primary hover:bg-white rounded-lg transition-all active:scale-90 shadow-sm"
                    >
                      <Eye size={18} />
                    </Link>
                    <button className="p-2 text-tertiary hover:bg-tertiary-container/30 rounded-lg transition-all active:scale-90">
                      <Check size={18} />
                    </button>
                    <button className="p-2 text-error hover:bg-error-container/20 rounded-lg transition-all active:scale-90">
                      <X size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-surface-container-high px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-on-surface-variant font-medium">Showing 1 to 4 of 24 requests</p>
          <div className="flex items-center space-x-1">
            <button className="p-2 bg-surface-container-lowest rounded hover:bg-white transition-colors disabled:opacity-50" disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="px-3 py-1 bg-primary text-on-primary text-xs font-bold rounded">1</button>
            <button className="px-3 py-1 bg-surface-container-lowest text-on-surface-variant text-xs font-bold rounded hover:bg-white transition-colors">2</button>
            <button className="px-3 py-1 bg-surface-container-lowest text-on-surface-variant text-xs font-bold rounded hover:bg-white transition-colors">3</button>
            <button className="p-2 bg-surface-container-lowest rounded hover:bg-white transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
