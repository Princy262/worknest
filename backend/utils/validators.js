// True only for a non-empty string (blocks numbers, objects and tricks like {"$ne": ""}).
export const isText = (value) => typeof value === 'string' && value.trim().length > 0;

// True only for a 24-character MongoDB id, e.g. "6ae8a9c3301663f01867b2dc".
export const isId = (value) => typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value);