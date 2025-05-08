/**
 * Get or create a device ID for tracking user progress
 * This will be stored in localStorage to identify the device/browser
 */
export function getDeviceId(): string {
  const storageKey = 'realestate_exam_device_id';
  
  // Check if we have a device ID already
  let deviceId = localStorage.getItem(storageKey);
  
  // If no device ID exists, create one
  if (!deviceId) {
    try {
      // Use browser crypto API if available
      if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        deviceId = window.crypto.randomUUID();
      } else {
        throw new Error('Crypto API not available');
      }
    } catch (e) {
      // Fallback for environments where crypto is not available
      deviceId = Math.random().toString(36).substring(2, 15) + 
                 Math.random().toString(36).substring(2, 15);
    }
    
    // Store the device ID in localStorage
    localStorage.setItem(storageKey, deviceId);
  }
  
  return deviceId;
}

/**
 * Attach the device ID to the headers of an API request
 */
export function attachDeviceId(headers: HeadersInit = {}): HeadersInit {
  const deviceId = getDeviceId();
  return {
    ...headers,
    'X-Device-ID': deviceId
  };
}