import dotenv from "dotenv";
import fs from "fs";
import path from "path";

/**
 * Server-Side Environment & MSG91 Configuration Module
 * 
 * CRITICAL SECURITY CONSTRAINTS:
 * - Credentials are read exclusively on the server / backend runtime.
 * - Never exposed to import.meta.env, VITE_*, NEXT_PUBLIC_*, client bundles,
 *   HTML tags, browser console, logs, or API responses.
 * - Trims leading/trailing whitespace and surrounding quotes from all values.
 * - Safe diagnostics only return boolean presence flags, never secret strings.
 */

function cleanValue(val: unknown): string | undefined {
  if (typeof val !== "string") return undefined;
  const trimmed = val.trim().replace(/^["']|["']$/g, "").trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Loads environment variables from multiple runtime sources:
 * 1. process.env (Standard Cloud Run / Container env vars)
 * 2. .env and .env.local files via dotenv
 * 3. /app/.dev.env.json (AI Studio container dev environment store)
 * 4. Cloud Run Secret Manager mounted volume paths (/secrets, /etc/secrets)
 */
export function reloadEnvironment(): void {
  // 1. Candidate dotenv files
  const candidateEnvFiles = [
    path.join(process.cwd(), ".env"),
    path.join(process.cwd(), ".env.local"),
    path.join(process.cwd(), ".env.production"),
    "/app/.env",
    "/app/applet/.env"
  ];

  for (const envFile of candidateEnvFiles) {
    try {
      if (fs.existsSync(envFile) && fs.statSync(envFile).isFile()) {
        dotenv.config({ path: envFile, override: false });
      }
    } catch {
      // Non-blocking
    }
  }

  // 2. AI Studio container internal environment cache (/app/.dev.env.json)
  const candidateJsonFiles = [
    "/app/.dev.env.json",
    path.join(process.cwd(), ".dev.env.json")
  ];

  for (const jsonFile of candidateJsonFiles) {
    try {
      if (fs.existsSync(jsonFile) && fs.statSync(jsonFile).isFile()) {
        const raw = fs.readFileSync(jsonFile, "utf8");
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          for (const [k, v] of Object.entries(parsed)) {
            if (v && typeof v === "string" && !process.env[k]) {
              process.env[k] = v;
            }
          }
        }
      }
    } catch {
      // Non-blocking
    }
  }

  // 3. Secret Manager mount paths in Cloud Run / Kubernetes
  const secretKeys = ["MSG91_AUTH_KEY", "MSG91_OTP_TEMPLATE_ID"];
  for (const key of secretKeys) {
    if (process.env[key]) continue;

    const secretPaths = [
      `/secrets/${key}`,
      `/secrets/${key.toLowerCase()}`,
      `/etc/secrets/${key}`,
      `/etc/secrets/${key.toLowerCase()}`,
      `/app/secrets/${key}`,
      path.join(process.cwd(), "secrets", key),
      path.join(process.cwd(), "secrets", key.toLowerCase())
    ];

    for (const sp of secretPaths) {
      try {
        if (fs.existsSync(sp) && fs.statSync(sp).isFile()) {
          const secretContent = fs.readFileSync(sp, "utf8");
          const cleaned = cleanValue(secretContent);
          if (cleaned) {
            process.env[key] = cleaned;
            break;
          }
        }
      } catch {
        // Non-blocking
      }
    }
  }
}

// Initial environment synchronization on module load
reloadEnvironment();

/**
 * Returns the sanitized MSG91 Auth Key, or undefined if missing.
 * Re-checks process.env on every invocation to prevent stale caching.
 */
export function getMsg91AuthKey(): string | undefined {
  let val = cleanValue(process.env.MSG91_AUTH_KEY);
  if (!val) {
    reloadEnvironment();
    val = cleanValue(process.env.MSG91_AUTH_KEY);
  }
  return val;
}

/**
 * Returns the sanitized MSG91 OTP Template ID, or undefined if missing.
 * Re-checks process.env on every invocation to prevent stale caching.
 */
export function getMsg91OtpTemplateId(): string | undefined {
  let val = cleanValue(process.env.MSG91_OTP_TEMPLATE_ID);
  if (!val) {
    reloadEnvironment();
    val = cleanValue(process.env.MSG91_OTP_TEMPLATE_ID);
  }
  return val;
}

/**
 * Returns true ONLY when BOTH MSG91_AUTH_KEY and MSG91_OTP_TEMPLATE_ID
 * are present, non-empty, and valid strings.
 */
export function isMsg91Configured(): boolean {
  const authKey = getMsg91AuthKey();
  const templateId = getMsg91OtpTemplateId();
  return Boolean(authKey && templateId);
}

/**
 * Returns safe boolean presence flags for diagnostic verification.
 * NEVER returns or exposes actual credentials.
 */
export function getMsg91Diagnostic(): {
  msg91Configured: boolean;
  authKeyPresent: boolean;
  templateIdPresent: boolean;
} {
  const authKey = getMsg91AuthKey();
  const templateId = getMsg91OtpTemplateId();
  const configured = Boolean(authKey && templateId);

  return {
    msg91Configured: configured,
    authKeyPresent: Boolean(authKey),
    templateIdPresent: Boolean(templateId)
  };
}

/**
 * Safe server-side logger that outputs configuration state without credentials.
 */
export function logMsg91ConfigurationStatus(): void {
  const configured = isMsg91Configured();
  console.log(`[MSG91] Configuration loaded: ${configured}`);
}
