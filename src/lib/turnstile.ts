
'use server';

interface TurnstileVerificationResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

export async function verifyTurnstileToken(token: string | undefined | null, remoteIp?: string): Promise<boolean> {
  if (!token) {
    console.warn('Turnstile token is missing.');
    return false;
  }

  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error('Cloudflare Turnstile secret key is not configured on the server.');
    // In a real app, you might want to throw an error or handle this more gracefully
    // For now, fail open in dev if not set, but log an error. In prod, this should strictly be false.
    if (process.env.NODE_ENV === 'production') {
        return false;
    }
    console.warn('DEVELOPMENT: Turnstile secret key not set, verification skipped (failing open).');
    return true; // Fail open in non-production if secret is missing, for easier development
  }

  const body = new URLSearchParams();
  body.append('secret', secretKey);
  body.append('response', token);
  if (remoteIp) {
    body.append('remoteip', remoteIp);
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: body,
    });

    const data: TurnstileVerificationResponse = await response.json();

    if (!data.success) {
      console.warn('Turnstile verification failed:', data['error-codes']?.join(', '));
    }
    return data.success;
  } catch (error) {
    console.error('Error verifying Turnstile token:', error);
    return false;
  }
}
