/**
 * UTM Parameter Tracking System
 * 
 * Tracks traffic sources, campaigns, and conversions from ProConnectSA
 * and other marketing channels.
 */

export interface UTMParameters {
  utm_source?: string;      // e.g., "proconnectsa"
  utm_medium?: string;      // e.g., "website", "email", "social"
  utm_campaign?: string;    // e.g., "immigration_integration"
  utm_content?: string;     // e.g., "hero_banner", "pricing_page"
  utm_term?: string;        // e.g., "visa_assistance"
}

export interface TrackingData extends UTMParameters {
  referrer?: string;
  landingPage?: string;
  timestamp: string;
  sessionId?: string;
}

const STORAGE_KEY = 'immigration_ai_tracking';
const SESSION_KEY = 'immigration_ai_session';

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

/**
 * Capture UTM parameters from current URL
 */
export function captureUTMParameters(): UTMParameters {
  if (typeof window === 'undefined') return {};

  const urlParams = new URLSearchParams(window.location.search);
  
  const utmParams: UTMParameters = {};
  
  const source = urlParams.get('utm_source');
  const medium = urlParams.get('utm_medium');
  const campaign = urlParams.get('utm_campaign');
  const content = urlParams.get('utm_content');
  const term = urlParams.get('utm_term');
  
  if (source) utmParams.utm_source = source;
  if (medium) utmParams.utm_medium = medium;
  if (campaign) utmParams.utm_campaign = campaign;
  if (content) utmParams.utm_content = content;
  if (term) utmParams.utm_term = term;
  
  return utmParams;
}

/**
 * Capture complete tracking data including UTM, referrer, and landing page
 */
export function captureTrackingData(): TrackingData {
  if (typeof window === 'undefined') {
    return { timestamp: new Date().toISOString() };
  }

  const utmParams = captureUTMParameters();
  
  const trackingData: TrackingData = {
    ...utmParams,
    referrer: document.referrer || undefined,
    landingPage: window.location.pathname + window.location.search,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
  };
  
  return trackingData;
}

/**
 * Save tracking data to localStorage (persists across sessions)
 */
export function saveTrackingData(data: TrackingData): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Only save if we have UTM parameters or referrer
    if (Object.keys(data).length > 2) { // More than just timestamp and sessionId
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('📊 Tracking data saved:', data);
    }
  } catch (error) {
    console.error('Failed to save tracking data:', error);
  }
}

/**
 * Get saved tracking data from localStorage
 */
export function getTrackingData(): TrackingData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to retrieve tracking data:', error);
    return null;
  }
}

/**
 * Clear tracking data (e.g., after conversion)
 */
export function clearTrackingData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear tracking data:', error);
  }
}

/**
 * Check if current visitor is from ProConnectSA
 */
export function isFromProConnectSA(): boolean {
  const data = getTrackingData();
  return data?.utm_source?.toLowerCase() === 'proconnectsa' || 
         data?.referrer?.toLowerCase().includes('proconnectsa') || 
         false;
}

/**
 * Initialize tracking on page load
 * Call this in your app's entry point or layout
 */
export function initializeTracking(): void {
  if (typeof window === 'undefined') return;

  // Check if there are new UTM parameters
  const currentUtmParams = captureUTMParameters();
  
  // If we have UTM parameters, capture and save full tracking data
  if (Object.keys(currentUtmParams).length > 0) {
    const trackingData = captureTrackingData();
    saveTrackingData(trackingData);
    
    // Log for debugging
    console.log('🎯 New visitor tracked:', trackingData);
  } else {
    // Check if we have existing tracking data
    const existingData = getTrackingData();
    if (existingData) {
      console.log('📊 Returning visitor - tracking data:', existingData);
    }
  }
}

/**
 * Get tracking data for signup/conversion
 * Returns the stored tracking data to be sent to the backend
 */
export function getTrackingDataForConversion(): UTMParameters & { 
  referrer?: string;
  landingPage?: string;
  sessionId?: string;
} {
  const data = getTrackingData();
  
  if (!data) {
    return {};
  }
  
  return {
    utm_source: data.utm_source,
    utm_medium: data.utm_medium,
    utm_campaign: data.utm_campaign,
    utm_content: data.utm_content,
    utm_term: data.utm_term,
    referrer: data.referrer,
    landingPage: data.landingPage,
    sessionId: data.sessionId,
  };
}

/**
 * Track a custom event with UTM attribution
 */
export function trackEvent(eventName: string, eventData?: any): void {
  const trackingData = getTrackingData();
  
  console.log(`📈 Event: ${eventName}`, {
    ...eventData,
    tracking: trackingData,
  });
  
  // Here you can send to analytics service (Google Analytics, Mixpanel, etc.)
  // Example: gtag('event', eventName, { ...eventData, ...trackingData });
}

/**
 * Helper: Build tracking URL for ProConnectSA
 * Use this to generate properly tracked links on ProConnectSA website
 */
export function buildTrackingURL(
  baseUrl: string,
  source: string,
  medium: string,
  campaign: string,
  content?: string
): string {
  const url = new URL(baseUrl);
  url.searchParams.set('utm_source', source);
  url.searchParams.set('utm_medium', medium);
  url.searchParams.set('utm_campaign', campaign);
  if (content) url.searchParams.set('utm_content', content);
  return url.toString();
}

// Example usage for ProConnectSA:
// buildTrackingURL(
//   'https://immigrationai.co.za',
//   'proconnectsa',
//   'website',
//   'immigration_integration',
//   'hero_banner'
// )
// Result: https://immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=hero_banner

