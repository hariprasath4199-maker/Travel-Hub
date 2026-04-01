export type RequestStatus = 'PENDING' | 'APPROVED' | 'DENIED';

export interface TravelRequest {
  id: string;
  employeeName: string;
  role: string;
  avatar: string;
  destination: string;
  dates: string;
  nights: string;
  purpose: string;
  cost: string;
  status: RequestStatus;
  department: string;
}

export interface Traveler {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'Compliant' | 'Pending Update';
  preferences: string[];
  passportStatus: 'Valid' | 'Expiring soon';
  visaStatus: 'Valid' | 'Active' | 'None';
  visaRegion?: string;
}
