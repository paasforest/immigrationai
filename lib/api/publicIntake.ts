// Public Intake API - No authentication required

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://api.immigrationai.co.za'
    : 'http://localhost:4000');

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  caseType: string;
  icon?: string;
  estimatedTimeline?: string;
  startingPrice?: string;
  sortOrder: number;
}

export interface StatusResult {
  status: string;
  referenceNumber: string;
  serviceName: string;
  submittedAt: string;
  caseReference?: string;
  expiresAt?: string;
}

/**
 * Get all active services
 */
export async function getServices(): Promise<Service[]> {
  const response = await fetch(`${API_URL}/api/intake/services`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch services');
  }

  const data = await response.json();
  if (data.success && data.data) {
    return data.data;
  }
  throw new Error(data.error || 'Failed to fetch services');
}

/**
 * Submit intake form
 */
export async function submitIntake(data: {
  serviceId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  applicantCountry: string;
  destinationCountry: string;
  urgencyLevel: string;
  description: string;
  additionalData?: any;
}): Promise<{ referenceNumber: string }> {
  const response = await fetch(`${API_URL}/api/intake/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || result.message || 'Failed to submit intake');
  }

  return result.data;
}

/**
 * Check intake status
 */
export async function checkIntakeStatus(
  referenceNumber: string,
  email: string
): Promise<StatusResult> {
  const response = await fetch(
    `${API_URL}/api/intake/status/${referenceNumber}?email=${encodeURIComponent(email)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || result.message || 'Failed to check status');
  }

  return result.data;
}

/**
 * Get public directory
 */
export async function getDirectory(filters?: {
  service?: string;
  originCountry?: string;
  destinationCountry?: string;
  page?: number;
}): Promise<{
  profiles: any[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const params = new URLSearchParams();
  if (filters?.service) params.append('service', filters.service);
  if (filters?.originCountry) params.append('originCountry', filters.originCountry);
  if (filters?.destinationCountry) params.append('destinationCountry', filters.destinationCountry);
  if (filters?.page) params.append('page', filters.page.toString());
  params.append('limit', '12');

  const response = await fetch(`${API_URL}/api/intake/directory?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || result.message || 'Failed to get directory');
  }

  return result.data;
}

/**
 * Get public profile by userId
 */
export async function getPublicProfile(userId: string): Promise<any> {
  const response = await fetch(`${API_URL}/api/intake/directory/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || result.message || 'Failed to get profile');
  }

  return result.data;
}
