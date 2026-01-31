import { isAddress, isHexString, toChecksumAddress } from 'ethereum-utils';

/**
 * Validates an Ethereum address.
 * @param address The address to validate
 * @returns The checksummed address if valid, otherwise null
 */
export function validateAddress(address: string): string | null {
  if (!isAddress(address)) {
    return null;
  }
  return toChecksumAddress(address);
}

/**
 * Validates a numeric value.
 * @param value The value to validate
 * @param min The minimum allowed value (optional)
 * @param max The maximum allowed value (optional)
 * @returns The validated value if valid, otherwise null
 */
export function validateNumber(value: string, min?: number, max?: number): bigint | null {
  const parsed = BigInt(value);
  if (isNaN(Number(value)) || parsed < BigInt(min || 0) || parsed > BigInt(max || Number.MAX_SAFE_INTEGER)) {
    return null;
  }
  return parsed;
}

/**
 * Validates a hexadecimal string.
 * @param hex The hexadecimal string to validate
 * @returns The validated hex string if valid, otherwise null
 */
export function validateHex(hex: string): string | null {
  if (!isHexString(hex)) {
    return null;
  }
  return hex;
}

/**
 * Sanitizes a string to prevent injection attacks.
 * @param input The input string to sanitize
 * @returns The sanitized string
 */
export function sanitizeInput(input: string): string {
  return input.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&#39;';
      case '"': return '&quot;';
      default: return char;
    }
  });
}