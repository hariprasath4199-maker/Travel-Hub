import { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp, Clock, MapPin, Building2, MoreVertical, Loader2,
  Plane, Shield, Ticket, Globe, Users, ChevronRight, ArrowUpRight,
  Eye, Lock, UserCheck, Building, Briefcase,
} from 'lucide-react';
import { StatusBadge } from '@/src/components/StatusBadge';
import { Link } from 'react-router-dom';
import { fetchRequests, fetchStats, type DashboardStats } from '@/src/api';
import { TravelRequest } from '@/src/types';
import { useUserRole } from '@/src/context/UserRoleContext';
import { fetchVisaRequests, type VisaRequest, type UserRole, ROLE_LABELS } from '@/src/visaApi';
import { canCreateRequest, canAccessNav } from '@/src/utils/roleFilter';

/* ═══════════════════════════════════════════
   ROLE-BASED FILTERING LOGIC
   ═══════════════════════════════════════════ */

/* ── Role description shown in the banner ── */
const ROLE_VIEW_INFO: Record<UserRole, { icon: typeof Eye; label: string; desc: string; color: string }> = {
  ADMIN:      { icon: Shield,    label: 'Admin Access',      desc: 'Full access to all data, settings, and administration',          color: '#dc2626' },
  EMPLOYEE:   { icon: UserCheck, label: 'My Requests',       desc: 'Viewing only your own travel requests and applications',         color: '#0ea5e9' },
  MANAGER:    { icon: Users,     label: 'Team Overview',      desc: 'Viewing travel data for yourself and your direct reportees',     color: '#7c3aed' },
  HRBP:       { icon: Shield,    label: 'HR Access',          desc: 'Full visibility across all travel requests and data',            color: '#059669' },
  EXECUTIVE:  { icon: Briefcase, label: 'Executive View',     desc: 'Full visibility — executive oversight across all data',          color: '#6366f1' },
  FINANCE:    { icon: Building,  label: 'Finance View',       desc: 'Read-only access to all travel and cost data',                   color: '#d97706' },
  VENDOR:     { icon: Globe,     label: 'Vendor Portal',      desc: 'Access to vendor-related workflow areas only',                   color: '#ec4899' },
};

/* ── Filter travel requests based on role ── */
function filterRequests(requests: TravelRequest[], role: UserRole, userEmail: string, userName: string, userCostCentre?: string): TravelRequest[] {
  switch (role) {
    case 'EMPLOYEE':
      return requests.filter(r => r.employeeName === userName);
    case 'MANAGER':
      return requests;
    case 'VENDOR':
      return [];
    case 'ADMIN':
    case 'HRBP':
    case 'EXECUTIVE':
    case 'FINANCE':
      return requests;
    default:
      return [];
  }
}

/* ── Filter visa requests based on role ── */
function filterVisaRequests(visaRequests: VisaRequest[], role: UserRole, userEmail: string, userName: string, userCostCentre?: string): VisaRequest[] {
  switch (role) {
    case 'EMPLOYEE':
      return visaRequests.filter(v => v.applicantEmail === userEmail);
    case 'MANAGER':
      return visaRequests.filter(v => v.managerEmail === userEmail || v.applicantEmail === userEmail);
    case 'VENDOR':
      return visaRequests.filter(v => ['AWAITING_VENDOR_AVAILABILITY', 'VENDOR_DATES_RECEIVED', 'DATE_BLOCKING_REQUESTED', 'APPOINTMENT_CONFIRMED'].includes(v.status));
    case 'ADMIN':
    case 'HRBP':
    case 'EXECUTIVE':
    case 'FINANCE':
      return visaRequests;
    default:
      return [];
  }
}

/* ── Compute stats from filtered data ── */
function computeFilteredStats(filteredReqs: TravelRequest[], filteredVisa: VisaRequest[]): DashboardStats {
  const pending = filteredReqs.filter(r => r.status === 'PENDING').length;
  const approved = filteredReqs.filter(r => r.status === 'APPROVED').length;
  const totalCost = filteredReqs.reduce((sum, r) => {
    const num = parseFloat(r.cost.replace(/[^0-9.]/g, ''));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  return {
    totalRequests: filteredReqs.length,
    pendingRequests: pending,
    approvedRequests: approved,
    totalTravelers: new Set([...filteredReqs.map(r => r.employeeName), ...filteredVisa.map(v => v.employeeName)]).size,
    monthlySpent: `€${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
  };
}


/* ═══════════════════════════════════════════
   ROLE BANNER — shows current access scope
   ═══════════════════════════════════════════ */
function RoleBanner({ role, userName }: { role: UserRole; userName: string }) {
  const info = ROLE_VIEW_INFO[role];
  const Icon = info.icon;

  return (
    <div className="rounded-xl px-5 py-3 flex items-center gap-4"
         style={{
           background: `linear-gradient(135deg, ${info.color}08, ${info.color}03)`,
           border: `1px solid ${info.color}20`,
         }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
           style={{ background: `${info.color}15`, border: `1px solid ${info.color}25` }}>
        <Icon size={16} style={{ color: info.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800">{info.label}</span>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold"
                style={{ background: `${info.color}15`, color: info.color }}>
            {ROLE_LABELS[role]}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{info.desc}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-[10px] text-slate-400 font-mono">Logged in as</p>
        <p className="text-xs font-bold text-slate-700">{userName}</p>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════
   HERO: Airport Departures Board Banner
   ═══════════════════════════════════════════ */
function HeroBanner({ stats, roleLabel }: { stats: DashboardStats | null; roleLabel: string }) {
  return (
    <div className="relative rounded-2xl overflow-hidden"
         style={{
           background: 'linear-gradient(135deg, #050d1a 0%, #0a1a30 30%, #0f2440 55%, #122d4f 80%, #0a1a30 100%)',
           boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
           minHeight: 220,
         }}>

      {/* ── Night sky ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(40)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
               style={{
                 width: Math.random() * 2 + 0.5, height: Math.random() * 2 + 0.5,
                 top: `${Math.random() * 50}%`, left: `${Math.random() * 100}%`,
                 opacity: Math.random() * 0.4 + 0.1,
                 animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite`,
                 animationDelay: `${Math.random() * 3}s`,
               }} />
        ))}
        {/* Moon */}
        <div className="absolute top-5 right-16 w-7 h-7 rounded-full"
             style={{ background: 'radial-gradient(circle at 35% 35%, #fef9c3, #fcd34d)', boxShadow: '0 0 20px rgba(253,230,138,0.2)' }} />
        {/* Cloud */}
        <svg className="absolute top-10 left-[15%] opacity-[0.04]" width="100" height="35" viewBox="0 0 100 35">
          <ellipse cx="50" cy="24" rx="45" ry="10" fill="#fff"/>
          <ellipse cx="32" cy="18" rx="22" ry="12" fill="#fff"/>
          <ellipse cx="68" cy="16" rx="24" ry="11" fill="#fff"/>
        </svg>

        {/* Animated flying airplane across the banner */}
        <div style={{ animation: 'flyAcross 12s linear infinite' }}>
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none" style={{ filter: 'drop-shadow(0 0 6px rgba(56,189,248,0.6))' }}>
            <ellipse cx="20" cy="20" rx="10" ry="2.5" fill="#38bdf8" opacity="0.8"/>
            <path d="M30 20 L36 19.5 L36 20.5 Z" fill="#38bdf8"/>
            <path d="M16 20 L22 20 L23 12 L19 14 Z" fill="#38bdf8" opacity="0.6"/>
            <path d="M16 20 L22 20 L23 28 L19 26 Z" fill="#38bdf8" opacity="0.6"/>
            <path d="M9 20 L11 15 L12 16 L11 20Z" fill="#38bdf8" opacity="0.7"/>
          </svg>
        </div>

        {/* Skyline */}
        <svg className="absolute bottom-0 left-0 right-0 opacity-[0.04]" height="60" viewBox="0 0 1200 60" preserveAspectRatio="none">
          <path d="M0,60 L0,40 L50,40 L50,30 L60,22 L70,30 L70,38 L130,38 L130,25 L140,18 L150,25 L150,40 L220,40 L220,32 L235,22 L250,32 L250,42 L340,42 L340,30 L360,30 L360,20 L370,12 L380,20 L380,35 L450,35 L450,42 L550,42 L550,28 L570,28 L570,18 L580,10 L590,18 L590,35 L660,35 L660,42 L740,42 L740,30 L760,30 L760,20 L770,12 L780,20 L780,38 L850,38 L850,42 L940,42 L940,32 L960,32 L960,22 L970,15 L980,22 L980,38 L1060,38 L1060,45 L1200,45 L1200,60Z" fill="#fff"/>
        </svg>

        {/* Runway approach lights at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] flex gap-[2px] px-[10%]">
          {[...Array(40)].map((_, i) => (
            <div key={i} className="flex-1 h-[2px] rounded-full"
                 style={{
                   background: i % 3 === 0 ? 'rgba(56,189,248,0.3)' : 'rgba(255,255,255,0.03)',
                   boxShadow: i % 3 === 0 ? '0 0 4px rgba(56,189,248,0.2)' : 'none',
                 }} />
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 px-8 py-7">
        {/* Top line */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.2)' }}>
              <Plane size={18} className="text-sky-400" style={{ transform: 'rotate(-45deg)' }} />
            </div>
            <div>
              <div className="text-[9px] font-mono text-sky-400/60 tracking-[0.3em] uppercase">Zalaris Travel Operations</div>
              <div className="text-white text-lg font-bold tracking-wide">Zalaris Travel Hub</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 rounded-md text-[9px] font-mono tracking-wider uppercase font-bold"
                 style={{ background: 'rgba(56,189,248,0.1)', color: 'rgba(56,189,248,0.7)', border: '1px solid rgba(56,189,248,0.15)' }}>
              {roleLabel}
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-sky-300/50">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </div>
          </div>
        </div>

        {/* ── 4 stat cards: passport / boarding pass style ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Monthly Spent — Passport stamp style */}
          <div className="rounded-xl p-4 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}>
            <div className="absolute top-2 right-2 opacity-[0.04]">
              <svg width="50" height="50" viewBox="0 0 50 50"><circle cx="25" cy="25" r="22" stroke="#fff" strokeWidth="2" strokeDasharray="4 3" fill="none"/><text x="25" y="28" textAnchor="middle" fill="#fff" fontSize="7" fontFamily="monospace">STAMP</text></svg>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md flex items-center justify-center bg-emerald-500/15">
                <TrendingUp size={12} className="text-emerald-400" />
              </div>
              <span className="text-[9px] font-mono text-slate-400 tracking-wider uppercase">Monthly Spent</span>
            </div>
            <div className="text-2xl font-black text-white tracking-tight">{stats?.monthlySpent || '€0'}</div>
            <div className="mt-2 text-[9px] text-emerald-400/70 font-mono flex items-center gap-1">
              <TrendingUp size={10} /> Live from data
            </div>
          </div>

          {/* Pending — Gate counter */}
          <div className="rounded-xl p-4 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}>
            <div className="absolute top-2 right-2 opacity-[0.06]">
              <Clock size={40} className="text-white" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md flex items-center justify-center bg-amber-500/15">
                <Clock size={12} className="text-amber-400" />
              </div>
              <span className="text-[9px] font-mono text-slate-400 tracking-wider uppercase">Pending</span>
            </div>
            <div className="text-2xl font-black text-white">{stats?.pendingRequests || 0}</div>
            <div className="mt-2 text-[9px] text-slate-500 font-mono">{stats?.totalRequests || 0} total requests</div>
          </div>

          {/* Active Travelers — Boarding pass */}
          <div className="rounded-xl p-4 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}>
            <div className="absolute top-2 right-2 opacity-[0.06]">
              <Users size={40} className="text-white" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md flex items-center justify-center bg-violet-500/15">
                <Users size={12} className="text-violet-400" />
              </div>
              <span className="text-[9px] font-mono text-slate-400 tracking-wider uppercase">Travelers</span>
            </div>
            <div className="text-2xl font-black text-white">{stats?.totalTravelers || 0}</div>
            <div className="mt-2 text-[9px] text-slate-500 font-mono flex items-center gap-1">
              <MapPin size={10} /> Active profiles
            </div>
          </div>

          {/* Approved — Radar screen */}
          <div className="rounded-xl p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))', border: '1px solid rgba(16,185,129,0.15)', backdropFilter: 'blur(8px)' }}>
            {/* Radar animation */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full" style={{ border: '1px solid rgba(16,185,129,0.06)' }}>
              <div className="absolute inset-0 rounded-full" style={{ border: '1px solid rgba(16,185,129,0.04)' }}>
                <div className="absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom-left" style={{ animation: 'radarSweep 4s linear infinite' }}>
                  <div className="w-full h-full" style={{ background: 'conic-gradient(from 0deg, transparent, rgba(16,185,129,0.15))' }} />
                </div>
              </div>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md flex items-center justify-center bg-emerald-500/15">
                  <Shield size={12} className="text-emerald-400" />
                </div>
                <span className="text-[9px] font-mono text-emerald-400/70 tracking-wider uppercase">Approved</span>
              </div>
              <div className="text-2xl font-black text-emerald-400">{stats?.approvedRequests || 0}</div>
              <div className="mt-2 text-[9px] text-emerald-500/50 font-mono">Compliance cleared</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DEPARTURES BOARD (Recent Requests)
   ═══════════════════════════════════════════ */
function DeparturesBoard({ requests, emptyMessage }: { requests: TravelRequest[]; emptyMessage: string }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a1628, #0f1f3d)', border: '1px solid rgba(255,255,255,0.04)', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>

      {/* Board header */}
      <div className="px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(0,0,0,0.3)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-sky-400" style={{ boxShadow: '0 0 6px rgba(56,189,248,0.5)' }} />
          <span className="text-[10px] font-mono text-sky-400/80 tracking-[0.2em] uppercase font-bold">Departures Board</span>
        </div>
        <Link to="/requests" className="text-[10px] font-mono text-sky-400/50 hover:text-sky-400 transition-colors flex items-center gap-1">
          View all <ChevronRight size={12} />
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="p-10 text-center">
          <Plane size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 text-sm mb-1">{emptyMessage}</p>
          <p className="text-slate-600 text-xs">No matching travel requests found for your access level</p>
        </div>
      ) : (
        <div>
          {/* Column headers */}
          <div className="grid grid-cols-12 gap-2 px-5 py-2 text-[8px] font-mono text-slate-500 uppercase tracking-wider" style={{ background: 'rgba(0,0,0,0.15)' }}>
            <div className="col-span-3">Passenger</div>
            <div className="col-span-3">Destination</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-2 text-center">Gate</div>
          </div>

          {/* Rows */}
          {requests.slice(0, 5).map((req, idx) => (
            <Link key={req.id} to={`/requests/${req.id}`}
                  className="grid grid-cols-12 gap-2 px-5 py-3 items-center hover:bg-white/[0.02] transition-colors group"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              {/* Passenger */}
              <div className="col-span-3 flex items-center gap-2.5">
                <img className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10" src={req.avatar} alt={req.employeeName} />
                <div>
                  <p className="text-xs font-bold text-white/90">{req.employeeName}</p>
                  <p className="text-[9px] text-slate-500">{req.role}</p>
                </div>
              </div>
              {/* Destination */}
              <div className="col-span-3 flex items-center gap-2">
                <Globe size={13} className="text-sky-400/50" />
                <span className="text-xs font-bold text-sky-300/90">{req.destination}</span>
              </div>
              {/* Date */}
              <div className="col-span-2 text-[10px] text-slate-400 font-mono">{req.dates}</div>
              {/* Status */}
              <div className="col-span-2 text-center">
                <StatusBadge status={req.status} />
              </div>
              {/* Gate */}
              <div className="col-span-2 text-center">
                <span className="text-xs font-black font-mono" style={{ color: req.status === 'APPROVED' ? '#10b981' : req.status === 'DENIED' ? '#ef4444' : '#fbbf24' }}>
                  {req.status === 'APPROVED' ? `G${idx + 1}` : req.status === 'DENIED' ? '--' : `G${idx + 1}`}
                </span>
                <ChevronRight size={14} className="inline ml-1 text-slate-600 group-hover:text-sky-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SIDEBAR: Quick Action Cards
   ═══════════════════════════════════════════ */
function SidebarPanel({ stats, role }: { stats: DashboardStats | null; role: UserRole }) {
  const total = stats?.totalRequests || 0;
  const pending = stats?.pendingRequests || 0;
  const approved = stats?.approvedRequests || 0;
  const denied = Math.max(0, total - pending - approved);
  const safeTotal = Math.max(total, 1);

  // Donut chart segments (SVG arc percentages)
  const segments = [
    { label: 'Approved', value: approved, color: '#10b981', glow: 'rgba(16,185,129,0.4)' },
    { label: 'Pending', value: pending, color: '#f59e0b', glow: 'rgba(245,158,11,0.4)' },
    { label: 'Denied', value: denied, color: '#6366f1', glow: 'rgba(99,102,241,0.4)' },
  ];

  // Build conic-gradient stops
  let cumulative = 0;
  const stops = segments.flatMap(seg => {
    const start = cumulative;
    const pct = (seg.value / safeTotal) * 100;
    cumulative += pct;
    return [`${seg.color} ${start}%`, `${seg.color} ${cumulative}%`];
  });
  // Fill remaining with dark
  if (cumulative < 100) {
    stops.push(`rgba(30,41,59,0.5) ${cumulative}%`, `rgba(30,41,59,0.5) 100%`);
  }
  const conicGradient = `conic-gradient(from -90deg, ${stops.join(', ')})`;

  return (
    <div className="space-y-5">
      {/* Travel Analytics — Premium Panel */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a1628, #0f1f3d)', border: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(0,0,0,0.25)' }}>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400" style={{ boxShadow: '0 0 6px rgba(56,189,248,0.5)' }} />
            <span className="text-[10px] font-mono text-sky-400/80 tracking-[0.15em] uppercase font-bold">Travel Analytics</span>
          </div>
          <span className="text-[9px] font-mono text-slate-500">Live</span>
        </div>

        <div className="p-5">
          {/* Donut chart */}
          <div className="relative w-full flex justify-center py-3">
            <div className="relative w-36 h-36">
              {/* Outer glow ring */}
              <div className="absolute -inset-1 rounded-full opacity-20" style={{ background: conicGradient, filter: 'blur(6px)' }} />
              {/* Main donut */}
              <div className="absolute inset-0 rounded-full" style={{ background: conicGradient }} />
              {/* Inner cutout */}
              <div className="absolute rounded-full flex flex-col items-center justify-center"
                   style={{ inset: '22%', background: 'linear-gradient(180deg, #0c1a2e, #0f1f3d)' }}>
                <span className="text-2xl font-black text-white leading-none">{total}</span>
                <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest mt-1">Requests</span>
              </div>
              {/* Subtle tick marks */}
              {[0, 90, 180, 270].map(deg => (
                <div key={deg} className="absolute top-1/2 left-1/2 w-[1px] h-full origin-center -translate-x-1/2 -translate-y-1/2"
                     style={{ transform: `rotate(${deg}deg)`, background: 'rgba(255,255,255,0.03)' }} />
              ))}
            </div>
          </div>

          {/* Legend + metrics */}
          <div className="mt-5 space-y-3">
            {segments.map(seg => {
              const pct = total > 0 ? Math.round((seg.value / safeTotal) * 100) : 0;
              return (
                <div key={seg.label} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color, boxShadow: `0 0 6px ${seg.glow}` }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wider">{seg.label}</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-black text-white">{seg.value}</span>
                        <span className="text-[9px] font-mono" style={{ color: seg.color }}>{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="h-full rounded-full transition-all duration-1000 ease-out"
                           style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${seg.color}cc, ${seg.color})`, boxShadow: `0 0 8px ${seg.glow}` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="text-lg font-black text-white">{stats?.totalTravelers || 0}</div>
                <div className="text-[8px] font-mono text-slate-500 uppercase tracking-wider mt-0.5">Travelers</div>
              </div>
              <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.08)' }}>
                <div className="text-lg font-black text-emerald-400">{stats?.monthlySpent || '€0'}</div>
                <div className="text-[8px] font-mono text-emerald-500/50 uppercase tracking-wider mt-0.5">Budget Used</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions — Boarding gates */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a1628, #0f1f3d)', border: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="px-4 py-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <span className="text-[10px] font-mono text-sky-400/70 tracking-[0.15em] uppercase font-bold">Quick Actions</span>
        </div>
        <div className="p-3 space-y-2">
          {[
            { to: '/visa-requests', icon: Shield, label: 'Visa Bookings', desc: 'Process visa applications', color: '#8b5cf6', nav: 'visa-requests' as const },
            { to: '/ticket-bookings', icon: Ticket, label: 'Ticket Booking', desc: 'Manage flight bookings', color: '#0ea5e9', nav: 'ticket-bookings' as const },
            ...(canCreateRequest(role) ? [{ to: '/requests/new', icon: Plane, label: 'New Request', desc: 'Submit travel authorization', color: '#10b981', nav: 'requests' as const }] : []),
            ...(canAccessNav(role, 'travelers') ? [{ to: '/travelers', icon: Users, label: 'Travelers', desc: 'Manage profiles', color: '#f59e0b', nav: 'travelers' as const }] : []),
          ].filter(item => canAccessNav(role, item.nav)).map(item => (
            <Link key={item.to} to={item.to}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.03] transition-all group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                   style={{ background: `${item.color}12`, border: `1px solid ${item.color}20` }}>
                <item.icon size={14} style={{ color: item.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">{item.label}</p>
                <p className="text-[9px] text-slate-500">{item.desc}</p>
              </div>
              <ArrowUpRight size={14} className="text-slate-600 group-hover:text-sky-400 transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════ */
export default function Dashboard() {
  const { currentUser } = useUserRole();
  const [allRequests, setAllRequests] = useState<TravelRequest[]>([]);
  const [allVisaRequests, setAllVisaRequests] = useState<VisaRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchRequests(), fetchVisaRequests()])
      .then(([reqs, visaReqs]) => {
        setAllRequests(reqs);
        setAllVisaRequests(visaReqs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* ── Apply role-based filtering ── */
  const role = currentUser?.role || 'EMPLOYEE';
  const userEmail = currentUser?.email || '';
  const userName = currentUser?.name || '';
  const userCostCentre = currentUser?.costCentre;

  const filteredRequests = useMemo(
    () => filterRequests(allRequests, role, userEmail, userName, userCostCentre),
    [allRequests, role, userEmail, userName, userCostCentre]
  );

  const filteredVisaRequests = useMemo(
    () => filterVisaRequests(allVisaRequests, role, userEmail, userName, userCostCentre),
    [allVisaRequests, role, userEmail, userName, userCostCentre]
  );

  const filteredStats = useMemo(
    () => computeFilteredStats(filteredRequests, filteredVisaRequests),
    [filteredRequests, filteredVisaRequests]
  );

  /* ── Empty state messages per role ── */
  const emptyMessages: Record<UserRole, string> = {
    ADMIN:      'No travel requests in the system',
    EMPLOYEE:   'You have no travel requests yet',
    MANAGER:    'No travel requests from your team',
    HRBP:       'No travel requests in the system',
    EXECUTIVE:  'No travel requests in the system',
    FINANCE:    'No travel requests in the system',
    VENDOR:     'No vendor-related requests',
  };

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-[1400px] mx-auto">

      {/* Role-based access banner */}
      {currentUser && <RoleBanner role={role} userName={userName} />}

      {/* Hero Banner */}
      <HeroBanner stats={filteredStats} roleLabel={ROLE_LABELS[role]} />

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Departures Board */}
        <section className="col-span-12 xl:col-span-8">
          <DeparturesBoard requests={filteredRequests} emptyMessage={emptyMessages[role]} />
        </section>

        {/* Sidebar */}
        <aside className="col-span-12 xl:col-span-4">
          <SidebarPanel stats={filteredStats} role={role} />
        </aside>
      </div>

      {/* Global CSS animations */}
      <style>{`
        @keyframes twinkle { 0%,100%{opacity:.15;transform:scale(1)} 50%{opacity:.6;transform:scale(1.2)} }
        @keyframes flyAcross {
          0% { transform: translate(-60px, 30px); opacity: 0; }
          5% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate(calc(100vw + 60px), -20px); opacity: 0; }
        }
        @keyframes radarSweep { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
