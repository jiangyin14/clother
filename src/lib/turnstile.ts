
'use server';

// This file is no longer used as we switched to hCaptcha.
// It can be safely deleted. For now, keeping it empty or with a note.

// console.log("Cloudflare Turnstile verification logic has been replaced by hCaptcha.");

export async function verifyTurnstileToken(token: string | undefined | null, remoteIp?: string): Promise<boolean> {
  console.warn("verifyTurnstileToken is deprecated. Use verifyCaptchaToken (hCaptcha) instead.");
  // To avoid breaking existing calls if any are missed during refactor,
  // return false or throw an error. For safety, return false.
  return false;
}
