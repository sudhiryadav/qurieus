import UAParser from 'ua-parser-js';

export async function getDeviceInfo() {
  if (typeof window === 'undefined') {
    return {
      type: 'unknown',
      browser: 'unknown',
      os: 'unknown',
    };
  }

  const parser = new UAParser();
  const result = parser.getResult();

  return {
    type: result.device.type || 'desktop',
    browser: result.browser.name || 'unknown',
    os: result.os.name || 'unknown',
    browserVersion: result.browser.version,
    osVersion: result.os.version,
    deviceModel: result.device.model,
    deviceVendor: result.device.vendor,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    userAgent: navigator.userAgent,
  };
} 