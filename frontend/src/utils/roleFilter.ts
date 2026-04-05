/**
 * Role-Based Data Filtering Utility
 * ===================================
 * Centralizes all role-based access control logic for the Travel Hub.
 *
 * ADMIN       → Full access (all data + admin tab)
 * EMPLOYEE    → Only their own data (matched by email)
 * MANAGER     → Their own + their reportees' data (matched by managerEmail)
 * HRBP        → All data (full access except admin tab)
 * EXECUTIVE   → All data (full access except admin tab)
 * FINANCE     → All data (view-only — no create/edit actions)
 * VENDOR      → Only vendor-involved areas
 */

import type { TravelRequest } from '@/src/types';
import type { VisaRequest, UserRole, AppUser } from '@/src/visaApi';
import type { TicketBooking } from '@/src/ticketApi';
import type { Traveler } from '@/src/types';

/* ── Role view metadata ── */
export const ROLE_VIEW_INFO: Record<UserRole, { label: string; desc: string; color: string }> = {
  ADMIN:      { label: 'Admin Access',      desc: 'Full access to all data, settings, and administration',          color: '#dc2626' },
  EMPLOYEE:   { label: 'My Requests',       desc: 'Viewing only your own travel requests and applications',         color: '#0ea5e9' },
  MANAGER:    { label: 'Team Overview',      desc: 'Viewing travel data for yourself and your direct reportees',     color: '#7c3aed' },
  HRBP:       { label: 'HR Access',          desc: 'Full visibility across all travel requests and data',            color: '#059669' },
  EXECUTIVE:  { label: 'Executive View',     desc: 'Full visibility — executive oversight across all data',          color: '#6366f1' },
  FINANCE:    { label: 'Finance View',       desc: 'Read-only access to all travel and cost data',                   color: '#d97706' },
  VENDOR:     { label: 'Vendor Portal',      desc: 'Access to vendor-related workflow areas only',                   color: '#ec4899' },
};

/* ── Navigation access control ── */
export type NavItem = 'dashboard' | 'visa-requests' | 'ticket-bookings' | 'requests' | 'travelers' | 'reports' | 'admin' | 'settings';

const NAV_ACCESS: Record<UserRole, NavItem[]> = {
  ADMIN:     ['dashboard', 'visa-requests', 'ticket-bookings', 'requests', 'travelers', 'reports', 'admin', 'settings'],
  EMPLOYEE:  ['dashboard', 'visa-requests', 'ticket-bookings', 'requests'],
  MANAGER:   ['dashboard', 'visa-requests', 'ticket-bookings', 'requests', 'travelers', 'reports'],
  HRBP:      ['dashboard', 'visa-requests', 'ticket-bookings', 'requests', 'travelers', 'reports', 'settings'],
  EXECUTIVE: ['dashboard', 'visa-requests', 'ticket-bookings', 'requests', 'travelers', 'reports', 'settings'],
  FINANCE:   ['dashboard', 'visa-requests', 'ticket-bookings', 'requests', 'travelers', 'reports'],
  VENDOR:    ['dashboard', 'visa-requests', 'ticket-bookings'],
};

export function canAccessNav(role: UserRole, nav: NavItem): boolean {
  return NAV_ACCESS[role]?.includes(nav) ?? false;
}

/* ── Action permissions ── */
export function canCreateRequest(role: UserRole): boolean {
  return ['ADMIN', 'EMPLOYEE', 'MANAGER', 'HRBP', 'EXECUTIVE'].includes(role);
}

export function canPerformActions(role: UserRole): boolean {
  // Finance is view-only, Vendor can only act in vendor steps
  return role !== 'FINANCE';
}

export function isViewOnly(role: UserRole): boolean {
  return role === 'FINANCE';
}

/* ── Filter: Travel Requests ── */
export function filterTravelRequests(
  requests: TravelRequest[],
  user: AppUser | null,
): TravelRequest[] {
  if (!user) return [];
  switch (user.role) {
    case 'EMPLOYEE':
      return requests.filter(r => r.employeeName === user.name || r.employeeId === user.email);
    case 'MANAGER':
      return requests; // Manager sees reportees — show all for now (refined with org structure)
    case 'VENDOR':
      return []; // Vendor has no access to travel requests
    case 'ADMIN':
    case 'HRBP':
    case 'EXECUTIVE':
    case 'FINANCE':
      return requests;
    default:
      return [];
  }
}

/* ── Filter: Visa Requests ── */
export function filterVisaRequestsByRole(
  visaRequests: VisaRequest[],
  user: AppUser | null,
): VisaRequest[] {
  if (!user) return [];
  switch (user.role) {
    case 'EMPLOYEE':
      return visaRequests.filter(v => v.applicantEmail === user.email);
    case 'MANAGER':
      return visaRequests.filter(v => v.managerEmail === user.email || v.applicantEmail === user.email);
    case 'VENDOR':
      // Vendor sees only requests at vendor-involved steps
      return visaRequests.filter(v =>
        ['AWAITING_VENDOR_AVAILABILITY', 'VENDOR_DATES_RECEIVED', 'DATE_BLOCKING_REQUESTED', 'APPOINTMENT_CONFIRMED'].includes(v.status)
      );
    case 'ADMIN':
    case 'HRBP':
    case 'EXECUTIVE':
    case 'FINANCE':
      return visaRequests;
    default:
      return [];
  }
}

/* ── Filter: Ticket Bookings ── */
export function filterTicketBookings(
  bookings: TicketBooking[],
  user: AppUser | null,
  visaRequests?: VisaRequest[],
): TicketBooking[] {
  if (!user) return [];
  switch (user.role) {
    case 'EMPLOYEE':
      return bookings.filter(b => b.applicantEmail === user.email);
    case 'MANAGER':
      return bookings.filter(b => b.managerEmail === user.email || b.applicantEmail === user.email);
    case 'VENDOR':
      // Vendor sees bookings at vendor-involved steps
      return bookings.filter(b =>
        ['ITINERARY_REQUESTED', 'ITINERARY_PROVIDED', 'BOOKING_REQUESTED', 'TICKET_BOOKED'].includes(b.status)
      );
    case 'ADMIN':
    case 'HRBP':
    case 'EXECUTIVE':
    case 'FINANCE':
      return bookings;
    default:
      return [];
  }
}

/* ── Filter: Travelers ── */
export function filterTravelers(
  travelers: Traveler[],
  user: AppUser | null,
): Traveler[] {
  if (!user) return [];
  switch (user.role) {
    case 'EMPLOYEE':
      return travelers.filter(t => t.name === user.name);
    case 'MANAGER':
      return travelers;
    case 'VENDOR':
      return []; // Vendor has no access to travelers
    case 'ADMIN':
    case 'HRBP':
    case 'EXECUTIVE':
    case 'FINANCE':
      return travelers;
    default:
      return [];
  }
}
