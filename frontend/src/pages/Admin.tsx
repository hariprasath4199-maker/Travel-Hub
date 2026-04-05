import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Users, MapPin, Building2, UserCog, RefreshCw, Loader2,
  FileText, Activity, Mail, Download, Trash2, AlertTriangle,
} from 'lucide-react';
import { useUserRole } from '@/src/context/UserRoleContext';
import { fetchLocations, fetchCostCentres, fetchEmployees, type Location, type CostCentre, type Employee } from '@/src/masterDataApi';

type Tab = 'users' | 'employees' | 'locations' | 'cost-centres' | 'audit' | 'emails';

export default function Admin() {
  const navigate = useNavigate();
  const { currentUser } = useUserRole();
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [costCentres, setCostCentres] = useState<CostCentre[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.role === 'ADMIN') loadAllData();
  }, [currentUser]);

  async function loadAllData() {
    setLoading(true);
    try {
      const [usersRes, emp, loc, cc, auditRes, emailRes] = await Promise.all([
        fetch('/api/users').then(r => r.json()),
        fetchEmployees(),
        fetchLocations(),
        fetchCostCentres(),
        fetch('/api/admin/audit-logs').then(r => r.json()).catch(() => []),
        fetch('/api/admin/email-logs').then(r => r.json()).catch(() => []),
      ]);
      setUsers(usersRes);
      setEmployees(emp);
      setLocations(loc);
      setCostCentres(cc);
      setAuditLogs(auditRes);
      setEmailLogs(emailRes);
    } catch { }
    setLoading(false);
  }

  // Guard: only ADMIN can access
  if (currentUser && currentUser.role !== 'ADMIN') {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <AlertTriangle size={40} className="text-red-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-on-surface mb-2">Access Denied</h2>
        <p className="text-on-surface-variant mb-6">You do not have permission to access the Admin panel.</p>
        <button onClick={() => navigate('/')} className="bg-primary text-on-primary rounded-xl font-bold px-6 py-3 shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all active:scale-95">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: any; count?: number }[] = [
    { key: 'users', label: 'System Users', icon: UserCog, count: users.length },
    { key: 'employees', label: 'Employees', icon: Users, count: employees.length },
    { key: 'locations', label: 'Locations', icon: MapPin, count: locations.length },
    { key: 'cost-centres', label: 'Cost Centres', icon: Building2, count: costCentres.length },
    { key: 'audit', label: 'Audit Log', icon: Activity, count: auditLogs.length },
    { key: 'emails', label: 'Email Log', icon: Mail, count: emailLogs.length },
  ];

  const tableCls = 'w-full text-sm';
  const thCls = 'text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant bg-surface-container-low';
  const tdCls = 'px-4 py-3 border-t border-surface-container';

  return (
    <div className="p-6 md:p-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
            <ShieldCheck size={24} className="text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-on-surface">Administration</h1>
            <p className="text-sm text-on-surface-variant">Manage system users, master data, and view logs</p>
          </div>
        </div>
        <button onClick={loadAllData} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-xl text-sm font-bold hover:bg-surface-container transition-colors disabled:opacity-50">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto bg-surface-container-low rounded-xl p-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-white text-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-white/50'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-surface-container text-[10px] font-bold">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className={tableCls}>
                <thead>
                  <tr>
                    <th className={thCls}>ID</th>
                    <th className={thCls}>Name</th>
                    <th className={thCls}>Email</th>
                    <th className={thCls}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-surface-container-low/50">
                      <td className={tdCls}><span className="font-mono text-xs">{u.id}</span></td>
                      <td className={tdCls}>
                        <div className="flex items-center gap-3">
                          {u.avatar && <img src={u.avatar} className="w-8 h-8 rounded-full" alt="" />}
                          <span className="font-semibold">{u.name}</span>
                        </div>
                      </td>
                      <td className={tdCls}>{u.email}</td>
                      <td className={tdCls}>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          { ADMIN: 'bg-red-100 text-red-800', EMPLOYEE: 'bg-sky-100 text-sky-800', MANAGER: 'bg-purple-100 text-purple-800', HRBP: 'bg-emerald-100 text-emerald-800', EXECUTIVE: 'bg-indigo-100 text-indigo-800', FINANCE: 'bg-amber-100 text-amber-800', VENDOR: 'bg-pink-100 text-pink-800' }[u.role] || 'bg-gray-100 text-gray-800'
                        }`}>{u.role}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'employees' && (
            <div className="overflow-x-auto">
              <table className={tableCls}>
                <thead>
                  <tr>
                    <th className={thCls}>Employee ID</th>
                    <th className={thCls}>Name</th>
                    <th className={thCls}>Email</th>
                    <th className={thCls}>Department</th>
                    <th className={thCls}>Role</th>
                    <th className={thCls}>Cost Centre</th>
                    <th className={thCls}>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(e => (
                    <tr key={e.employeeId} className="hover:bg-surface-container-low/50">
                      <td className={tdCls}><span className="font-mono text-xs">{e.employeeId}</span></td>
                      <td className={tdCls}><span className="font-semibold">{e.firstName} {e.lastName}</span></td>
                      <td className={tdCls}>{e.email}</td>
                      <td className={tdCls}>{e.department}</td>
                      <td className={tdCls}>{e.role}</td>
                      <td className={tdCls}><span className="font-mono text-xs">{e.costCentre}</span></td>
                      <td className={tdCls}><span className="font-mono text-xs">{e.location}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="overflow-x-auto">
              <table className={tableCls}>
                <thead>
                  <tr>
                    <th className={thCls}>ID</th>
                    <th className={thCls}>City</th>
                    <th className={thCls}>Country</th>
                    <th className={thCls}>Office</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map(l => (
                    <tr key={l.id} className="hover:bg-surface-container-low/50">
                      <td className={tdCls}><span className="font-mono text-xs">{l.id}</span></td>
                      <td className={tdCls}><span className="font-semibold">{l.city}</span></td>
                      <td className={tdCls}>{l.country}</td>
                      <td className={tdCls}>{l.office}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'cost-centres' && (
            <div className="overflow-x-auto">
              <table className={tableCls}>
                <thead>
                  <tr>
                    <th className={thCls}>ID</th>
                    <th className={thCls}>Name</th>
                    <th className={thCls}>Owner</th>
                    <th className={thCls}>Owner Email</th>
                  </tr>
                </thead>
                <tbody>
                  {costCentres.map(cc => (
                    <tr key={cc.id} className="hover:bg-surface-container-low/50">
                      <td className={tdCls}><span className="font-mono text-xs">{cc.id}</span></td>
                      <td className={tdCls}><span className="font-semibold">{cc.name}</span></td>
                      <td className={tdCls}>{(cc as any).owner || '—'}</td>
                      <td className={tdCls}>{(cc as any).ownerEmail || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="overflow-x-auto">
              {auditLogs.length === 0 ? (
                <div className="p-10 text-center text-on-surface-variant">
                  <Activity size={32} className="mx-auto mb-3 opacity-40" />
                  <p>No audit logs yet.</p>
                </div>
              ) : (
                <table className={tableCls}>
                  <thead>
                    <tr>
                      <th className={thCls}>Timestamp</th>
                      <th className={thCls}>Action</th>
                      <th className={thCls}>Request ID</th>
                      <th className={thCls}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...auditLogs].reverse().map((log, i) => (
                      <tr key={i} className="hover:bg-surface-container-low/50">
                        <td className={tdCls}><span className="font-mono text-xs whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</span></td>
                        <td className={tdCls}><span className="font-semibold text-xs">{log.action}</span></td>
                        <td className={tdCls}><span className="font-mono text-xs">{log.requestId}</span></td>
                        <td className={tdCls}><span className="text-xs text-on-surface-variant">{log.details}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'emails' && (
            <div className="overflow-x-auto">
              {emailLogs.length === 0 ? (
                <div className="p-10 text-center text-on-surface-variant">
                  <Mail size={32} className="mx-auto mb-3 opacity-40" />
                  <p>No emails sent yet.</p>
                </div>
              ) : (
                <table className={tableCls}>
                  <thead>
                    <tr>
                      <th className={thCls}>Sent At</th>
                      <th className={thCls}>To</th>
                      <th className={thCls}>Subject</th>
                      <th className={thCls}>Request</th>
                      <th className={thCls}>Template</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...emailLogs].reverse().map((log, i) => (
                      <tr key={i} className="hover:bg-surface-container-low/50">
                        <td className={tdCls}><span className="font-mono text-xs whitespace-nowrap">{new Date(log.sentAt).toLocaleString()}</span></td>
                        <td className={tdCls}><span className="text-xs">{log.to}</span></td>
                        <td className={tdCls}><span className="text-xs font-medium">{log.subject}</span></td>
                        <td className={tdCls}><span className="font-mono text-xs">{log.requestId}</span></td>
                        <td className={tdCls}><span className="font-mono text-xs">{log.templateName}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
