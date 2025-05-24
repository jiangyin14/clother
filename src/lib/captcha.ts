
'use server';

interface HCaptchaVerificationResponse {
  success: boolean;
  challenge_ts?: string; // Timestamp of the challenge load (ISO8601)
  hostname?: string;     // The hostname of the site where the challenge was solved
  credit?: boolean;      // Optional: whether the response will be credited
  'error-codes'?: string[]; // Optional: any error codes
  score?: number;        // Optional: Enterprise users only, risk score
  score_reason?: string[]; // Optional: Enterprise users only, reason(s) for score
}

export async function verifyCaptchaToken(token: string | undefined | null, remoteIp?: string): Promise<boolean> {
  if (!token) {
    console.warn('hCaptcha token is missing.');
    return false;
  }

  const secretKey = process.env.HCAPTCHA_SECRET_KEY;

  if (!secretKey || secretKey === "0x0000000000000000000000000000000000000000") { // Check for placeholder
    console.error('hCaptcha Secret Key is not configured or is a placeholder on the server.');
    if (process.env.NODE_ENV === 'production') {
      return false;
    }
    console.warn('DEVELOPMENT: hCaptcha Secret Key not set, verification skipped (failing open). Set HCAPTCHA_SECRET_KEY in .env');
    return true; // Fail open in non-production if secret is missing, for easier development
  }

  const params = new URLSearchParams();
  params.append('secret', secretKey);
  params.append('response', token);
  if (remoteIp) { // Optional, but recommended by hCaptcha
    params.append('remoteip', remoteIp);
  }
  // You can also append `sitekey` if you want to verify it matches, but it's not strictly required by the API
  // params.append('sitekey', process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '');


  try {
    const response = await fetch('https://api.hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data: HCaptchaVerificationResponse = await response.json();

    if (!data.success) {
      console.warn('hCaptcha verification failed:', data['error-codes']?.join(', '));
    }
    return data.success;
  } catch (error) {
    console.error('Error verifying hCaptcha token:', error);
    return false;
  }
}
