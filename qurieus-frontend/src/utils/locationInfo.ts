export async function getLocationInfo() {
  if (typeof window === 'undefined') {
    return {
      country: 'unknown',
      city: 'unknown',
      timezone: 'unknown',
    };
  }

  try {
    // Get timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Get language
    const language = navigator.language;

    // Get geolocation if available
    let coordinates = null;
    if (navigator.geolocation) {
      coordinates = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            reject(error);
          }
        );
      });
    }

    return {
      timezone,
      language,
      coordinates,
    };
  } catch (error) {
    console.error('Error getting location info:', error);
    return {
      timezone: 'unknown',
      language: 'unknown',
      coordinates: null,
    };
  }
} 