export const MINUTE_IN_MS = 1000 * 60;
export const HOUR_IN_MS = MINUTE_IN_MS * 60;
export const DAY_IN_MS = HOUR_IN_MS * 24;

export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 32;
export const VALID_USERNAME_REGEX = /^[a-z0-9_-]+$/;

// https://thecopenhagenbook.com/password-authentication
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 256;

export const VERIFICATION_CODE_LENGTH = 8;
