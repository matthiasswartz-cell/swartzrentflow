/** Format checks only. Never logs, returns, or repairs credential values. */
export function authConfigurationIssue(publishable: string | undefined, secret: string | undefined): string | null {
  if (!publishable || !/^pk_(test|live)_[A-Za-z0-9+/=_-]+$/.test(publishable)) return "PUBLISHABLE_KEY_INVALID";
  if (!secret) return "SECRET_KEY_MISSING";
  if (/[\u2022\u25CF\u25E6]/.test(secret)) return "SECRET_KEY_MASKED";
  if (!/^sk_(test|live)_[A-Za-z0-9_-]+$/.test(secret)) return "SECRET_KEY_INVALID";
  if (publishable.split("_")[1] !== secret.split("_")[1]) return "KEY_ENVIRONMENTS_DIFFER";
  return null;
}
