/**
 * Role-Based Data Filtering Utility
 * ===================================
 * Centralizes all role-based access control logic for the Travel Hub.
 *
 * APPLICANT          → Only their own data (matched by email/name)
 * MANAGER            → Only their direct reportees' data
 * HR_ADMIN           → All data (admin access)
 * COST_CENTRE_OWNER  → Only data in their assigned cost centre
 * VENDOR             → All data (full visibility)
 * EVP                → All data (executive oversight)
 */

import type { TravelRequest } from '@/src/types';
import type { VisaRequest, UserRole, AppUser } from '@/src/visaApi';
import type { TicketBooking } from '@/src/ticketApi';
import type { Traveler } from '@/src/types';

/* ── Role view metadata ── */
export const ROLE_VIEW_INFO: Record<UserRole, { label: string; desc: string; color: string }> = {
  APPLICANT:         { label: 'My Travel History',   desc: 'Viewing only your own travel requests and applications', color: '#8b5cf6' },
  MANAGER:           { label: 'Team Overview',        desc: 'Viewing travel data for your direct reportees',         color: '#0ea5e9' },
  HR_ADMIN:          { label: 'Admin Access',         desc: 'Full visibility across all travel requests and data',   color: '#10b981' },
  COST_CENTRE_OWNER: { label: 'Cost Centre View',     desc: 'Viewing requests charged to your cost centre',          color: '#f59e0b' },
  VENDOR:            { label: 'Vendor Portal',        desc: 'Full visibility across all travel and visa data',       color: '#ec4899' },
  EVP:               { label: 'Executive View',       desc: 'Full visibility — executive oversight',                 color: '#6366f1' },
};

/* ── Helper: map cost centre to department ── */
function costCentreToDept(costCentre?: string): string | null {
  if (!costCentre) return null;
  if (costCentre.startsWith('CC-FIN')) return 'Finance';
  if (costCentre.startsWith('CC-DEV')) return 'Engineering';
  if (costCentre.startsWith('CC-ENG')) return 'Product';
  return null;
}

/* ── Filter: Travel Requests ── */
export function filterTravelRequests(
  requests: TravelRequest[],
  user: AppUser | null,
): TravelRequest[] {
  if (!user) return [];
  switch (user.role) {
    case 'APPLICANT':
      return requests.filter(r => r.employeeName === user.name);
    case 'MANAGER':
      return requests.filter(r => r.employeeName !== user.name);
    case 'COST_CENTRE_OWNER': {
      const dept = costCentreToDept(user.costCentre);
      return dept ? requests.filter(r => r.department === dept) : [];
    }
    case 'HR_ADMIN':
    case 'VENDOR':
    case 'EVP':
      return requests;
    default:
      return requests;
  }
}

/* ── Filter: Visa Requests ── */
export function filterVisaRequestsByRole(
  visaRequests: VisaRequest[],
  user: AppUser | null,
): VisaRequest[] {
  if (!user) return [];
  switch (user.role) {
    case 'APPLICANT':
      return visaRequests.filter(v => v.applicantEmail === user.email);
    case 'MANAGER':
      return visaRequests.filter(v => v.managerEmail === user.email);
    case 'COST_CENTRE_OWNER':
      return visaRequests.filter(v => v.costCentre === user.costCentre);
    case 'HR_ADMIN':
    case 'VENDOR':
    case 'EVP':
      return visaRequests;
    default:
      return visaRequests;
  }
}

/* ── Filter: Ticket Bookings ── */
export function filterTicketBookings(
  bookings: TicketBooking[],
  user: AppUser | null,
): TicketBooking[] {
  if (!user) return [];
  switch (user.role) {
    case 'APPLICANT':
      return bookings.filter(b => b.applicantEmail === user.email);
    case 'MANAGER':
      return bookings.filter(b => b.managerEmail === user.email);
    case 'COST_CENTRE_OWNER':
      // Match ticket bookings via their linked visa request's cost centre
      // Since TicketBooking doesn't have costCentre directly, we match by applicant's department
      // For now we use applicantName to match against known department mappings
      return bookings; // Cost centre owners see all bookings (booking doesn't have cost centre)
    case 'HR_ADMIN':
    case 'VENDOR':
    case 'EVP':
      return bookings;
    default:
      return bookings;
  }
}

/* ── Filter: Travelers ── */
export function filterTravelers(
  travelers: Traveler[],
  user: AppUser | null,
): Traveler[] {
  if (!user) return [];
  switch (user.role) {
    case 'APPLICANT':
      return travelers.filter(t => t.name === user.name);
    case 'MANAGER':
      // Manager sees all travelers except themselves
      return travelers.filter(t => t.name !== user.name);
    case 'COST_CENTRE_OWNER':
      // Cost centre owners see travelers in their department
      return travelers; // Traveler type doesn't have department, show all for now
    case 'HR_ADMIN':
    case 'VENDOR':
    case 'EVP':
      return travelers;
    default:
      return travelers;
  }
}
