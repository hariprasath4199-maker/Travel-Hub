import { TravelRequest, Traveler } from './types';
import { isBackendAvailable, DEMO_REQUESTS, DEMO_STATS } from './demoData';

const API_BASE = '/api';

// ==================== REQUESTS ====================

export async function fetchRequests(): Promise<TravelRequest[]> {
  if (!(await isBackendAvailable())) return DEMO_REQUESTS;
  const res = await fetch(`${API_BASE}/requests`);
  if (!res.ok) throw new Error('Failed to fetch requests');
  return res.json();
}

export async function fetchRequestById(id: string): Promise<TravelRequest | null> {
  const res = await fetch(`${API_BASE}/requests/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch request');
  return res.json();
}

export async function createRequest(data: {
  employeeName: string;
  role: string;
  destination: string;
  dates: string;
  nights: string;
  purpose: string;
  cost: string;
  department: string;
}): Promise<TravelRequest> {
  const res = await fetch(`${API_BASE}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create request');
  return res.json();
}

export async function updateRequestStatus(id: string, status: 'APPROVED' | 'DENIED' | 'PENDING'): Promise<TravelRequest> {
  const res = await fetch(`${API_BASE}/requests/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update request status');
  return res.json();
}

export async function deleteRequest(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/requests/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete request');
}

// ==================== TRAVELERS ====================

export async function fetchTravelers(): Promise<Traveler[]> {
  if (!(await isBackendAvailable())) return [];
  const res = await fetch(`${API_BASE}/travelers`);
  if (!res.ok) throw new Error('Failed to fetch travelers');
  return res.json();
}

export async function createTraveler(data: Omit<Traveler, 'id' | 'avatar'>): Promise<Traveler> {
  const res = await fetch(`${API_BASE}/travelers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create traveler');
  return res.json();
}

// ==================== STATS ====================

export interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  totalTravelers: number;
  monthlySpent: string;
}

export async function fetchStats(): Promise<DashboardStats> {
  if (!(await isBackendAvailable())) return DEMO_STATS;
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

// ==================== AUDIT LOG ====================

export async function fetchAuditLog(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/audit-log`);
  if (!res.ok) throw new Error('Failed to fetch audit log');
  return res.json();
}
