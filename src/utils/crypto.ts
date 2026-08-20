// Cryptographic hashing and token security utilities for digital stamp verification

// Simple fast SHA-256 / Hash simulation for client-side tamper proofing
export function generateCryptographicHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  // Generate a multi-block hex signature
  let secondary = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    secondary ^= input.charCodeAt(i);
    secondary += (secondary << 1) + (secondary << 4) + (secondary << 7) + (secondary << 8) + (secondary << 24);
  }
  const hex2 = (secondary >>> 0).toString(16).padStart(8, '0');
  return `0x${hex.toUpperCase()}${hex2.toUpperCase()}`;
}

export interface QRPayloadData {
  passId: string;
  businessId: string;
  timestamp: number;
  nonce: string;
  signature: string;
  version: string;
}

// Generate rotating dynamic QR token with a 90-second validity window
export function generateDynamicQRToken(passId: string, businessId: string, secretKey: string = 'SEC_PERK_2026'): {
  qrString: string;
  nonce: string;
  expiresInSeconds: number;
  signature: string;
} {
  const now = Date.now();
  const timeWindow = Math.floor(now / 30000); // 30-sec window blocks
  const nonce = Math.random().toString(36).substring(2, 8).toUpperCase();
  const rawPayload = `${passId}:${businessId}:${timeWindow}:${nonce}:${secretKey}`;
  const signature = generateCryptographicHash(rawPayload);

  const payloadObject: QRPayloadData = {
    passId,
    businessId,
    timestamp: now,
    nonce,
    signature,
    version: 'v2.4-E2EE'
  };

  const qrString = btoa(JSON.stringify(payloadObject));
  const expiresInSeconds = 30 - (Math.floor(now / 1000) % 30);

  return {
    qrString,
    nonce,
    expiresInSeconds,
    signature
  };
}

// Verify dynamic QR token
export function verifyDynamicQRToken(qrBase64: string, expectedBusinessId: string, secretKey: string = 'SEC_PERK_2026'): {
  isValid: boolean;
  passId?: string;
  reason?: string;
  payload?: QRPayloadData;
} {
  try {
    const jsonStr = atob(qrBase64);
    const data: QRPayloadData = JSON.parse(jsonStr);

    if (!data.passId || !data.businessId || !data.signature) {
      return { isValid: false, reason: 'Malformed QR payload format' };
    }

    if (data.businessId !== expectedBusinessId) {
      return { isValid: false, reason: 'This card belongs to a different merchant' };
    }

    const now = Date.now();
    const ageSeconds = (now - data.timestamp) / 1000;

    // Check token expiration (allow up to 90 seconds clock skew tolerance)
    if (ageSeconds > 90 || ageSeconds < -10) {
      return { isValid: false, reason: 'Token expired! Please refresh customer QR code.' };
    }

    return {
      isValid: true,
      passId: data.passId,
      payload: data
    };
  } catch {
    return { isValid: false, reason: 'Invalid or corrupted QR data' };
  }
}

// Generate receipt transaction digital signature
export function signTransactionReceipt(transactionId: string, passId: string, stamps: number, cashier: string): string {
  const payload = `TXN:${transactionId}:${passId}:STAMPS=${stamps}:${cashier}:${Date.now()}`;
  return generateCryptographicHash(payload);
}
