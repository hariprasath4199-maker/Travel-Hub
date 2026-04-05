const API = '/api';

export interface CostCentre {
  id: string;
  name: string;
  department: string;
  description: string;
}

export interface Location {
  id: string;
  city: string;
  country: string;
  office: string;
  region: string;
}

export const fetchCostCentres = async (): Promise<CostCentre[]> => {
  const res = await fetch(`${API}/master/cost-centres`);
  if (!res.ok) throw new Error('Failed to fetch cost centres');
  return res.json();
};

export const fetchLocations = async (): Promise<Location[]> => {
  const res = await fetch(`${API}/master/locations`);
  if (!res.ok) throw new Error('Failed to fetch locations');
  return res.json();
};

export interface Employee {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  role: string;
  department: string;
  costCentre: string;
  location: string;
}

export const fetchEmployees = async (): Promise<Employee[]> => {
  const res = await fetch(`${API}/master/employees`);
  if (!res.ok) throw new Error('Failed to fetch employees');
  return res.json();
};
