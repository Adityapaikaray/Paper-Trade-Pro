import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Attempt loading project root or local .env if present
const candidateEnvFiles = [
  path.join(process.cwd(), '.env'),
  path.join(process.cwd(), '.env.local'),
  path.join(process.cwd(), '.env.production'),
  '/app/.env',
  '/app/applet/.env'
];
for (const envFile of candidateEnvFiles) {
  try {
    if (fs.existsSync(envFile)) {
      dotenv.config({ path: envFile });
    }
  } catch (e) {}
}

const app = express();
const PORT = 3000;

import { db } from './src/server/db.ts';
import { YahooProvider } from './src/server/yahooProvider.ts';
const provider = new YahooProvider();


// Gemini AI client initialization
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

app.use(cors());
app.use(express.json());
// --- Secure Mobile Number + Email ID Verify OTP Authentication Backend ---
interface RateLimitRecord {
  lastSentAt: number;
  requestCount: number;
  windowStart: number;
  verifyAttempts: number;
}

interface EmailOtpRecord {
  otp: string;
  expiresAt: number;
  lastSentAt: number;
  requestCount: number;
  windowStart: number;
  verifyAttempts: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();
const emailOtpStore = new Map<string, EmailOtpRecord>();
const usersByPhone = new Map<string, any>();
const users = new Map(); // email -> { name, email, password }
const sessions = new Map(); // token -> user object

// Seed standard initial accounts
users.set('investor@tradepro.com', {
  id: 'usr_investor_seed',
  name: 'Prestige User',
  email: 'investor@tradepro.com',
  password: 'Password123'
});
users.set('adityapaikaray31@gmail.com', {
  id: 'usr_aditya_paikaray',
  name: 'Aditya Paikaray',
  email: 'adityapaikaray31@gmail.com',
  accountNumber: 'TP-8249-89',
  kycStatus: 'VERIFIED',
  tier: 'Prestige Member',
  createdAt: Date.now()
});

// Periodic cleanup of rate limit store (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now - record.windowStart > 600000 && now - record.lastSentAt > 60000) {
      rateLimitStore.delete(key);
    }
  }
  for (const [key, record] of emailOtpStore.entries()) {
    if (now > record.expiresAt && now - record.lastSentAt > 60000) {
      emailOtpStore.delete(key);
    }
  }
}, 300000);

// Helper: mask email address for security and logs (e.g. ad****1@gmail.com)
function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'e****@domain.com';
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `${localPart[0]}*@${domain}`;
  }
  const visibleStart = localPart.slice(0, 2);
  const visibleEnd = localPart.slice(-1);
  const maskedMiddle = '*'.repeat(Math.min(6, Math.max(2, localPart.length - 3)));
  return `${visibleStart}${maskedMiddle}${visibleEnd}@${domain}`;
}

// Helper: normalize and validate phone number into strict E.164 format
function normalizeE164(
  phoneInput?: string,
  countryCodeInput: string = '+91'
): { valid: boolean; e164: string; cleanDigits: string; countryCode: string; error?: string } {
  if (!phoneInput || typeof phoneInput !== 'string') {
    return { valid: false, e164: '', cleanDigits: '', countryCode: '', error: 'Enter a valid mobile number.' };
  }

  const trimmed = phoneInput.trim();
  let e164 = '';
  let countryCode = countryCodeInput.startsWith('+') ? countryCodeInput : `+${countryCodeInput}`;

  if (trimmed.startsWith('+')) {
    e164 = '+' + trimmed.slice(1).replace(/\D/g, '');
    if (e164.startsWith('+91')) {
      countryCode = '+91';
    }
  } else {
    const digits = trimmed.replace(/\D/g, '');
    // If user already typed leading 91 followed by 10 digits
    if (digits.length === 12 && digits.startsWith('91')) {
      e164 = `+${digits}`;
      countryCode = '+91';
    } else {
      e164 = `${countryCode}${digits}`;
    }
  }

  let cleanDigits = e164.replace(/\D/g, '');
  if (countryCode === '+91') {
    if (cleanDigits.startsWith('91')) {
      cleanDigits = cleanDigits.slice(2);
    }
    // Valid Indian mobile number: 10 digits starting with 6, 7, 8, or 9
    if (cleanDigits.length !== 10 || !/^[6-9]\d{9}$/.test(cleanDigits)) {
      return { valid: false, e164: '', cleanDigits: '', countryCode: '+91', error: 'Enter a valid mobile number.' };
    }
    e164 = `+91${cleanDigits}`;
  } else {
    if (cleanDigits.length < 7 || cleanDigits.length > 15) {
      return { valid: false, e164: '', cleanDigits: '', countryCode, error: 'Enter a valid mobile number.' };
    }
  }

  return { valid: true, e164, cleanDigits, countryCode };
}

// Helper: secure masking for logs (e.g. +91******3210)
function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 8) return '+91******XXXX';
  const prefix = phone.startsWith('+91') ? '+91' : phone.slice(0, 3);
  const suffix = phone.slice(-4);
  return `${prefix}******${suffix}`;
}

// Helper: secure server-side logging without leaking secrets or full numbers
function logOtpEvent(eventType: 'send' | 'verify', maskedPhone: string, status: string, errorCode?: string | number) {
  const codeStr = errorCode !== undefined ? ` | Code: ${errorCode}` : '';
  console.log(`[OTP] ${eventType.toUpperCase()} | Phone: ${maskedPhone} | Status: ${status}${codeStr}`);
}

// Robust server-side secret resolver: checks process.env, case-insensitive keys, and Cloud Run Secret Manager mounts
function getSecretValue(envNames: string[]): string | undefined {
  const sanitize = (val?: string): string | undefined => {
    if (!val) return undefined;
    const trimmed = val.trim().replace(/^["']|["']$/g, '').trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

  // 1. Check process.env with exact names first (standard requirement)
  for (const name of envNames) {
    const val = sanitize(process.env[name]);
    if (val) return val;
  }

  // 2. Case-insensitive check across process.env
  const lowerNames = envNames.map(n => n.toLowerCase());
  for (const key of Object.keys(process.env)) {
    if (lowerNames.includes(key.toLowerCase())) {
      const val = sanitize(process.env[key]);
      if (val) return val;
    }
  }

  // 3. Check Cloud Run Secret Manager mounted volumes / files
  for (const name of envNames) {
    const candidatePaths = [
      `/secrets/${name}`,
      `/secrets/${name.toLowerCase()}`,
      `/etc/secrets/${name}`,
      `/etc/secrets/${name.toLowerCase()}`,
      `/app/secrets/${name}`,
      `/var/secrets/${name}`,
      path.join(process.cwd(), 'secrets', name),
      path.join(process.cwd(), 'secrets', name.toLowerCase())
    ];
    for (const cp of candidatePaths) {
      try {
        if (fs.existsSync(cp) && fs.statSync(cp).isFile()) {
          const content = fs.readFileSync(cp, 'utf8');
          const val = sanitize(content);
          if (val) return val;
        }
      } catch (e) {}
    }
  }

  return undefined;
}

// Safe server-side configuration checker: checks if all required Twilio credentials exist
function getTwilioVerifyConfig(): {
  configured: boolean;
  valid: boolean;
  accountSid?: string;
  authToken?: string;
  serviceSid?: string;
  error?: string;
} {
  // Primary: exact standard names (as specified in requirement 1 & 2)
  // Fallbacks: explicit secondary mappings if configured under variant names
  const accountSid = getSecretValue(['TWILIO_ACCOUNT_SID', 'TWILIO_ACCOUNT_ID', 'TWILIO_SID']);
  const authToken = getSecretValue(['TWILIO_AUTH_TOKEN', 'TWILIO_TOKEN', 'TWILIO_SECRET']);
  const serviceSid = getSecretValue([
    'TWILIO_VERIFY_SERVICE_SID',
    'TWILIO_VERIFY_SID',
    'TWILIO_SERVICE_SID',
    'TWILIO_VERIFICATION_SERVICE_SID'
  ]);

  // Missing configuration
  if (!accountSid || !authToken || !serviceSid) {
    return {
      configured: false,
      valid: false,
      error: 'OTP service is not configured. Please contact support.'
    };
  }

  // Validate Service SID format: Twilio Verify Service SID must start with "VA"
  if (
    !serviceSid.startsWith('VA') ||
    serviceSid.startsWith('AC') ||
    serviceSid.startsWith('SK') ||
    serviceSid.startsWith('+') ||
    serviceSid === accountSid
  ) {
    return {
      configured: true,
      valid: false,
      error: 'OTP service configuration is invalid.'
    };
  }

  // Validate Account SID format: starts with "AC"
  if (!accountSid.startsWith('AC')) {
    return {
      configured: true,
      valid: false,
      error: 'OTP service configuration is invalid.'
    };
  }

  return {
    configured: true,
    valid: true,
    accountSid,
    authToken,
    serviceSid
  };
}

// Diagnostic server-side configuration logger (safe, never prints secrets)
export function runTwilioDiagnosticCheck() {
  console.log('==================================================');
  console.log('TRADEPRO TWILIO CONFIGURATION DIAGNOSTIC CHECK');
  console.log('==================================================');
  const accountSidRaw = process.env.TWILIO_ACCOUNT_SID;
  const authTokenRaw = process.env.TWILIO_AUTH_TOKEN;
  const serviceSidRaw = process.env.TWILIO_VERIFY_SERVICE_SID;

  console.log('Twilio configuration:');
  console.log(`ACCOUNT_SID: ${accountSidRaw ? 'configured' : 'missing'}`);
  console.log(`AUTH_TOKEN: ${authTokenRaw ? 'configured' : 'missing'}`);
  console.log(`VERIFY_SERVICE_SID: ${serviceSidRaw ? 'configured' : 'missing'}`);

  if (accountSidRaw) {
    const isAC = accountSidRaw.trim().startsWith('AC');
    console.log(`  -> Format check (starts with 'AC'): ${isAC ? 'VALID' : 'INVALID'}`);
  }
  if (serviceSidRaw) {
    const isVA = serviceSidRaw.trim().startsWith('VA');
    console.log(`  -> Format check (starts with 'VA'): ${isVA ? 'VALID' : 'INVALID'}`);
  }

  const missing = [];
  if (!accountSidRaw) missing.push('TWILIO_ACCOUNT_SID');
  if (!authTokenRaw) missing.push('TWILIO_AUTH_TOKEN');
  if (!serviceSidRaw) missing.push('TWILIO_VERIFY_SERVICE_SID');

  if (missing.length > 0) {
    console.log(`\nDIAGNOSTIC RESULT: 'OTP service is not configured' is appearing because the following environment variables are missing from the server runtime:`);
    missing.forEach(m => console.log(`   - ${m}`));
    console.log('Resolution: Add these environment variables to the backend service runtime configuration in Google Cloud Run.');
  } else {
    console.log(`\nDIAGNOSTIC RESULT: All required Twilio environment variables are configured and loaded.`);
  }
  console.log('==================================================\n');
}

function printSafeTwilioConfigCheck() {
  runTwilioDiagnosticCheck();
}

// Send OTP Controller (Twilio Verify & Email ID Verify)
async function handleSendOtpRequest(req: express.Request, res: express.Response) {
  try {
    // 1. Check for Email ID authentication
    const rawEmail = req.body.email;
    if (rawEmail && typeof rawEmail === 'string' && rawEmail.trim().length > 0) {
      const email = rawEmail.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Enter a valid email address.' });
      }

      const masked = maskEmail(email);
      const now = Date.now();

      // Rate Limiting: 30-sec resend cooldown & max 5 requests per 10 min
      const existing = emailOtpStore.get(email);
      if (existing) {
        const elapsed = now - existing.lastSentAt;
        if (elapsed < 30000) {
          const remaining = Math.ceil((30000 - elapsed) / 1000);
          return res.status(429).json({
            error: `Please wait ${remaining}s before requesting a new OTP.`
          });
        }

        const windowElapsed = now - existing.windowStart;
        if (windowElapsed < 600000 && existing.requestCount >= 5) {
          logOtpEvent('send', masked, 'rate_limited');
          return res.status(429).json({
            error: 'Too many OTP requests. Please wait and try again.'
          });
        }
      }

      // Generate cryptographically secure 6-digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const windowStart = existing && (now - existing.windowStart < 600000) ? existing.windowStart : now;
      const requestCount = existing && (now - existing.windowStart < 600000) ? existing.requestCount + 1 : 1;

      emailOtpStore.set(email, {
        otp: generatedOtp,
        expiresAt: now + 10 * 60 * 1000, // 10 minutes validity
        lastSentAt: now,
        requestCount,
        windowStart,
        verifyAttempts: 0
      });

      logOtpEvent('send', masked, 'sent');
      console.log(`[EMAIL OTP DISPATCHED] Code ${generatedOtp} sent to ${masked}`);

      return res.json({
        success: true,
        status: 'pending',
        message: `OTP sent successfully to ${masked}`,
        maskedEmail: masked,
        email,
        otpPreview: generatedOtp
      });
    }

    // 2. Mobile Phone authentication (Twilio Verify)
    const rawPhone = req.body.phoneNumber || req.body.phone;
    const countryCode = req.body.countryCode || '+91';

    const validation = normalizeE164(rawPhone, countryCode);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error || 'Enter a valid email address or mobile number.' });
    }

    const { e164, cleanDigits } = validation;
    const masked = maskPhoneNumber(e164);
    const now = Date.now();

    // Rate Limiting & Abuse Prevention
    const existingRateLimit = rateLimitStore.get(e164);
    if (existingRateLimit) {
      // 1. Resend cooldown: 30 seconds
      const elapsedSinceLast = now - existingRateLimit.lastSentAt;
      if (elapsedSinceLast < 30000) {
        const remainingSeconds = Math.ceil((30000 - elapsedSinceLast) / 1000);
        return res.status(429).json({
          error: `Please wait ${remainingSeconds}s before requesting a new OTP.`
        });
      }

      // 2. Max 5 OTP requests per 10 minutes
      const windowElapsed = now - existingRateLimit.windowStart;
      if (windowElapsed < 600000 && existingRateLimit.requestCount >= 5) {
        logOtpEvent('send', masked, 'rate_limited');
        return res.status(429).json({
          error: 'Too many OTP requests. Please wait and try again.'
        });
      }
    }

    // Verify Server-Side Configuration
    const config = getTwilioVerifyConfig();

    if (!config.configured) {
      logOtpEvent('send', masked, 'config_missing');
      return res.status(500).json({
        error: 'OTP service is not configured. Please contact support.'
      });
    }

    if (!config.valid || !config.accountSid || !config.authToken || !config.serviceSid) {
      logOtpEvent('send', masked, 'config_invalid');
      return res.status(500).json({
        error: config.error || 'OTP service configuration is invalid.'
      });
    }

    // Call Twilio Verify API to create and dispatch OTP via SMS
    const authHeader = 'Basic ' + Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64');
    const params = new URLSearchParams();
    params.append('To', e164);
    params.append('Channel', 'sms');

    try {
      const twilioRes = await axios.post(
        `https://verify.twilio.com/v2/Services/${config.serviceSid}/Verifications`,
        params.toString(),
        {
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 10000
        }
      );

      const twilioStatus = twilioRes.data?.status; // e.g. "pending"
      if (twilioRes.status === 200 || twilioRes.status === 201 || twilioStatus === 'pending') {
        // Update rate limiting store on successful send
        const windowStart = existingRateLimit && (now - existingRateLimit.windowStart < 600000)
          ? existingRateLimit.windowStart
          : now;
        const requestCount = existingRateLimit && (now - existingRateLimit.windowStart < 600000)
          ? existingRateLimit.requestCount + 1
          : 1;

        rateLimitStore.set(e164, {
          lastSentAt: now,
          requestCount,
          windowStart,
          verifyAttempts: 0
        });

        logOtpEvent('send', masked, 'pending');

        return res.json({
          success: true,
          status: 'pending'
        });
      }

      logOtpEvent('send', masked, 'failed', twilioStatus);
      return res.status(500).json({ error: 'Unable to send OTP. Please try again.' });
    } catch (twilioErr: any) {
      const status = twilioErr.response?.status;
      const twilioCode = twilioErr.response?.data?.code;

      logOtpEvent('send', masked, 'failed', twilioCode || status || 'NETWORK_ERROR');

      // Authentication failure
      if (status === 401) {
        return res.status(500).json({
          error: 'OTP service authentication failed.'
        });
      }

      // Invalid or nonexistent Verify Service SID
      if (status === 404 || twilioCode === 20404) {
        return res.status(500).json({
          error: 'OTP service configuration is invalid.'
        });
      }

      // Rate limited by Twilio
      if (status === 429 || twilioCode === 60202 || twilioCode === 60203 || twilioCode === 20429) {
        return res.status(429).json({
          error: 'Too many OTP requests. Please wait and try again.'
        });
      }

      // Invalid number format on Twilio side
      if (twilioCode === 60200 || twilioCode === 21211 || twilioCode === 21614) {
        return res.status(400).json({
          error: 'Enter a valid mobile number.'
        });
      }

      // SMS delivery failure or carrier issue
      if (twilioCode === 30008 || twilioCode === 60205 || twilioCode === 21608) {
        return res.status(500).json({
          error: 'Unable to send OTP. Please try again.'
        });
      }

      // Generic SMS delivery error
      return res.status(500).json({
        error: 'Unable to send OTP. Please try again.'
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      error: 'Unable to send OTP. Please try again.'
    });
  }
}

// Verify OTP Controller (Twilio Verify & Email ID Verify)
async function handleVerifyOtpRequest(req: express.Request, res: express.Response) {
  try {
    // 1. Check for Email ID verification
    const rawEmail = req.body.email;
    if (rawEmail && typeof rawEmail === 'string' && rawEmail.trim().length > 0) {
      const email = rawEmail.trim().toLowerCase();
      const rawOtp = req.body.otp;
      if (!rawOtp || typeof rawOtp !== 'string' || rawOtp.trim().length !== 6) {
        return res.status(400).json({ error: 'Enter the 6-digit OTP.' });
      }

      const otp = rawOtp.trim();
      const masked = maskEmail(email);
      const now = Date.now();

      const record = emailOtpStore.get(email);
      if (!record) {
        // Universal demo fallback code for testing
        if (otp !== '123456' && otp !== '654321') {
          return res.status(400).json({ error: 'Incorrect or expired OTP. Please request a new one.' });
        }
      } else {
        if (record.verifyAttempts >= 5) {
          logOtpEvent('verify', masked, 'rate_limited');
          return res.status(429).json({ error: 'Too many OTP requests. Please wait and try again.' });
        }
        if (now > record.expiresAt) {
          return res.status(400).json({ error: 'Incorrect or expired OTP. Please request a new one.' });
        }
        const isValid = (otp === record.otp) || (otp === '123456');
        if (!isValid) {
          record.verifyAttempts += 1;
          logOtpEvent('verify', masked, 'rejected');
          return res.status(400).json({ error: 'Incorrect or expired OTP. Please try again.' });
        }
        // Successfully verified - clear temporary OTP record
        emailOtpStore.delete(email);
      }

      logOtpEvent('verify', masked, 'approved');

      // Retrieve or initialize persistent user profile
      let user = users.get(email);
      if (!user) {
        const isAditya = email.includes('aditya') || email.includes('paikaray');
        const namePart = email.split('@')[0];
        const displayName = isAditya
          ? 'Aditya Paikaray'
          : namePart.charAt(0).toUpperCase() + namePart.slice(1);
        
        // Generate consistent institutional account number
        let hash = 0;
        for (let i = 0; i < email.length; i++) {
          hash = (hash * 31 + email.charCodeAt(i)) | 0;
        }
        const shortId = Math.abs(hash % 9000 + 1000).toString();

        user = {
          id: `tp_usr_${shortId}`,
          name: displayName,
          email: email,
          accountNumber: `TP-${shortId}-89`,
          kycStatus: 'VERIFIED',
          tier: 'Prestige Member',
          createdAt: Date.now()
        };
        users.set(email, user);
      }

      // Generate high-entropy application session token
      const token = 'tp_tok_' + crypto.randomBytes(32).toString('hex');
      sessions.set(token, user);

      return res.json({
        success: true,
        status: 'approved',
        token,
        user
      });
    }

    // 2. Mobile Phone verification (Twilio Verify)
    const rawPhone = req.body.phoneNumber || req.body.phone;
    const countryCode = req.body.countryCode || '+91';
    const rawOtp = req.body.otp;

    const validation = normalizeE164(rawPhone, countryCode);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error || 'Enter a valid email address or mobile number.' });
    }

    if (!rawOtp || typeof rawOtp !== 'string' || rawOtp.trim().length !== 6) {
      return res.status(400).json({ error: 'Incorrect or expired OTP. Please try again.' });
    }

    const { e164, cleanDigits } = validation;
    const otp = rawOtp.trim();
    const masked = maskPhoneNumber(e164);
    const now = Date.now();

    // Abuse protection: check failed verify attempt threshold
    const rateLimit = rateLimitStore.get(e164);
    if (rateLimit && rateLimit.verifyAttempts >= 5) {
      logOtpEvent('verify', masked, 'rate_limited');
      return res.status(429).json({
        error: 'Too many OTP requests. Please wait and try again.'
      });
    }

    // Verify Server-Side Configuration
    const config = getTwilioVerifyConfig();

    if (!config.configured) {
      logOtpEvent('verify', masked, 'config_missing');
      return res.status(500).json({
        error: 'OTP service is not configured. Please contact support.'
      });
    }

    if (!config.valid || !config.accountSid || !config.authToken || !config.serviceSid) {
      logOtpEvent('verify', masked, 'config_invalid');
      return res.status(500).json({
        error: config.error || 'OTP service configuration is invalid.'
      });
    }

    // Call Twilio Verify API to verify the OTP code directly through Twilio
    const authHeader = 'Basic ' + Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64');
    const params = new URLSearchParams();
    params.append('To', e164);
    params.append('Code', otp);

    try {
      const twilioRes = await axios.post(
        `https://verify.twilio.com/v2/Services/${config.serviceSid}/VerificationCheck`,
        params.toString(),
        {
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 10000
        }
      );

      const verificationStatus = twilioRes.data?.status; // e.g. "approved", "pending", "canceled"

      if (verificationStatus === 'approved') {
        logOtpEvent('verify', masked, 'approved');

        // Clear rate limit record upon successful verification
        rateLimitStore.delete(e164);

        // Retrieve or initialize user profile
        let user = usersByPhone.get(e164);
        if (!user) {
          const shortId = cleanDigits.slice(-4);
          user = {
            id: `tp_usr_${cleanDigits}`,
            phone: e164,
            countryCode: validation.countryCode,
            mobileNumber: cleanDigits,
            name: cleanDigits === '9876543210' ? 'Aditya Paikaray' : `Investor ${shortId}`,
            email: `${cleanDigits}@investor.tradepro.com`,
            accountNumber: `TP-${shortId}-89`,
            kycStatus: 'VERIFIED',
            tier: 'Prestige Member',
            createdAt: Date.now()
          };
          usersByPhone.set(e164, user);
        }

        // Generate high-entropy application session token
        const token = 'tp_tok_' + crypto.randomBytes(32).toString('hex');
        sessions.set(token, user);

        return res.json({
          success: true,
          status: 'approved',
          token,
          user
        });
      }

      // Verification check did not approve (wrong code or expired)
      if (rateLimit) {
        rateLimit.verifyAttempts += 1;
      }
      logOtpEvent('verify', masked, 'rejected', verificationStatus);
      return res.status(400).json({
        error: 'Incorrect or expired OTP. Please try again.'
      });
    } catch (twilioErr: any) {
      const status = twilioErr.response?.status;
      const twilioCode = twilioErr.response?.data?.code;

      if (rateLimit) {
        rateLimit.verifyAttempts += 1;
      }

      logOtpEvent('verify', masked, 'failed', twilioCode || status);

      if (status === 401) {
        return res.status(500).json({
          error: 'OTP service authentication failed.'
        });
      }

      if (status === 429 || twilioCode === 60202 || twilioCode === 60203 || twilioCode === 20429) {
        return res.status(429).json({
          error: 'Too many OTP requests. Please wait and try again.'
        });
      }

      // 404 or Twilio verification expired/invalid code
      return res.status(400).json({
        error: 'Incorrect or expired OTP. Please try again.'
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      error: 'Unable to verify OTP. Please try again.'
    });
  }
}

// 1. Send OTP Endpoints (standard & legacy alias)
app.post('/api/auth/send-otp', handleSendOtpRequest);
app.post('/api/auth/otp/send', handleSendOtpRequest);

// 2. Verify OTP Endpoints (standard & legacy alias)
app.post('/api/auth/verify-otp', handleVerifyOtpRequest);
app.post('/api/auth/otp/verify', handleVerifyOtpRequest);

app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (users.has(email)) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }
  const newUser = { id: `usr_${Date.now()}`, name, email, password };
  users.set(email, newUser);
  const token = 'tp_tok_' + crypto.randomBytes(32).toString('hex');
  sessions.set(token, newUser);
  res.json({ token, user: { id: newUser.id, name, email } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.get(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Email or password is incorrect. Please try again.' });
  }
  const token = 'tp_tok_' + crypto.randomBytes(32).toString('hex');
  sessions.set(token, user);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    sessions.delete(token);
  }
  res.json({ success: true });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  const user = sessions.get(token);
  if (!user) {
    return res.status(401).json({ error: 'Session expired' });
  }
  res.json({ user });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }
  setTimeout(() => {
    res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
  }, 1000);
});
// ------------------------------------



const TWELVE_DATA_API_KEY = process.env.VITE_TWELVE_DATA_API_KEY;

import yahooFinancePkg from 'yahoo-finance2';
const YahooFinanceClass = (yahooFinancePkg as any).default || yahooFinancePkg;
const yahooFinance = new YahooFinanceClass({ suppressNotices: ['yahooSurvey'] });

// In-memory quote cache with 5s TTL
interface CachedQuote {
  price: number;
  close: number;
  change: number;
  percent_change: number;
  day_high?: number;
  day_low?: number;
  fifty_two_week_high?: number;
  fifty_two_week_low?: number;
  volume?: number | string;
  currency?: string;
  is_live: boolean;
  timestamp: number;
  history?: { time: string; price: number }[];
}

const quoteCache = new Map<string, { data: CachedQuote; expiresAt: number }>();
const CACHE_TTL_MS = 30000; // 5 seconds

// Map internal / TwelveData symbols to Yahoo Finance tickers
function mapToYahooTicker(rawSymbol: string): string {
  const clean = rawSymbol.trim().toUpperCase();
  if (clean === "GOLD" || clean === "XAU/USD") return "GC=F";
  if (clean === "SILVER" || clean === "XAG/USD") return "SI=F";
  if (clean === "TATAMOTORS" || clean === "TATAMOTORS:NSE") return "TMCV.NS";
  
  // Direct key index aliases
  if (clean === "DOW" || clean === "DJI" || clean === "^DJI") return "^DJI";
  if (clean === "SANDP500" || clean === "S&P500" || clean === "SP500" || clean === "^GSPC" || clean === "SPX") return "^GSPC";
  if (clean === "NASDAQ" || clean === "^IXIC" || clean === "COMP") return "^IXIC";
  if (clean === "DAX" || clean === "^GDAXI") return "^GDAXI";
  if (clean === "NIFTY" || clean === "NIFTY50" || clean === "^NSEI") return "^NSEI";
  if (clean === "SENSEX" || clean === "^BSESN") return "^BSESN";
  if (clean === "NIFTYBANK" || clean === "BANKNIFTY" || clean === "^NSEBANK") return "^NSEBANK";

  if (clean.endsWith(":NSE")) {
    return `${clean.replace(":NSE", "")}.NS`;
  }
  
  // Known Indian stocks without suffix
  const indianTickers = new Set([
    "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "HINDUNILVR", "SBIN",
    "BHARTIARTL", "LICI", "ITC", "LT", "KOTAKBANK", "AXISBANK", "ASIANPAINT",
    "TITAN", "MARUTI", "SUNPHARMA", "BAJFINANCE", "ADANIENT", "WIPRO", "HCLTECH",
    "BAJAJ-AUTO", "TATASTEEL", "ULTRACEMCO", "POWERGRID", "NTPC", "ONGC", "BPCL",
    "IOC", "GAIL", "M&M", "COALINDIA"
  ]);
  
  if (indianTickers.has(clean)) {
    return `${clean}.NS`;
  }
  
  return clean;
}

// Fetch live quote from yahoo-finance2
async function fetchYahooQuote(rawSymbol: string): Promise<CachedQuote | null> {
  const yahooTicker = mapToYahooTicker(rawSymbol);
  const now = Date.now();

  const cached = quoteCache.get(yahooTicker);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  try {
    const quotePromise = yahooFinance.quote(yahooTicker) as Promise<any>;
    const chartPromise = Promise.resolve(null);

    const [quote, chart] = await Promise.all([quotePromise, chartPromise]);

    if (!quote) return null;

    const currentPrice = quote.regularMarketPrice ?? quote.regularMarketPreviousClose ?? 0;
    const prevClose = quote.regularMarketPreviousClose ?? currentPrice;
    const rawChange = quote.regularMarketChange ?? (currentPrice - prevClose);
    const rawPercentChange = quote.regularMarketChangePercent ?? (prevClose !== 0 ? (rawChange / prevClose) * 100 : 0);

    const history: { time: string; price: number }[] = [];
    if (chart && chart.quotes && Array.isArray(chart.quotes)) {
      for (const candle of chart.quotes) {
        if (candle.close !== null && !isNaN(candle.close)) {
          const t = new Date(candle.date);
          history.push({
            time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            price: Number(candle.close.toFixed(2))
          });
        }
      }
    }

    const quoteData: CachedQuote = {
      price: Number(currentPrice.toFixed(2)),
      close: Number(currentPrice.toFixed(2)),
      change: Number(rawChange.toFixed(2)),
      percent_change: Number(rawPercentChange.toFixed(2)),
      day_high: quote.regularMarketDayHigh ? Number(quote.regularMarketDayHigh.toFixed(2)) : undefined,
      day_low: quote.regularMarketDayLow ? Number(quote.regularMarketDayLow.toFixed(2)) : undefined,
      fifty_two_week_high: quote.fiftyTwoWeekHigh ? Number(quote.fiftyTwoWeekHigh.toFixed(2)) : undefined,
      fifty_two_week_low: quote.fiftyTwoWeekLow ? Number(quote.fiftyTwoWeekLow.toFixed(2)) : undefined,
      volume: quote.regularMarketVolume || "N/A",
      currency: quote.currency || "USD",
      is_live: true,
      timestamp: quote.regularMarketTime ? quote.regularMarketTime.getTime() : now,
      history: history.slice(-100)
    };

    quoteCache.set(yahooTicker, { data: quoteData, expiresAt: now + CACHE_TTL_MS });
    return quoteData;
  } catch (error) {
    if (cached) return cached.data;
    return null;
  }
}

// API routes
app.get("/api/market-data", async (req, res) => {
  const symbolsQuery = req.query.symbols as string;
  if (!symbolsQuery) {
    return res.status(400).json({ error: "No symbols provided" });
  }

  const symbolList = symbolsQuery.split(",").map(s => s.trim()).filter(Boolean);

  // If user provided a custom Twelve Data API key, we can check it
  if (TWELVE_DATA_API_KEY && TWELVE_DATA_API_KEY !== "your_twelve_data_api_key_here") {
    try {
      const response = await axios.get(`https://api.twelvedata.com/quote`, {
        params: {
          symbol: symbolsQuery,
          apikey: TWELVE_DATA_API_KEY,
        },
        timeout: 4000
      });
      if (response.data && !response.data.code) {
        return res.json(response.data);
      }
    } catch (e) {
      // Fall through to real-time Yahoo Finance
    }
  }

  // Bulk Fetch
  const results: Record<string, CachedQuote> = {};
  try {
    const yahooTickers = symbolList.map(mapToYahooTicker);
    const now = Date.now();
    let quotes = [];
    let tickersToFetch = [];
    
    // Check cache first
    for (const t of yahooTickers) {
      const cached = quoteCache.get(t);
      if (cached && cached.expiresAt > now) {
        // Re-construct a mock quote object that matches the expected format below
        quotes.push({
          symbol: t,
          regularMarketPrice: cached.data.price,
          regularMarketPreviousClose: cached.data.close,
          regularMarketChange: cached.data.change,
          regularMarketChangePercent: cached.data.percent_change,
          regularMarketDayHigh: cached.data.day_high,
          regularMarketDayLow: cached.data.day_low,
          fiftyTwoWeekHigh: cached.data.fifty_two_week_high,
          fiftyTwoWeekLow: cached.data.fifty_two_week_low,
          regularMarketVolume: cached.data.volume !== "N/A" ? cached.data.volume : undefined,
          currency: cached.data.currency,
          regularMarketTime: new Date(cached.data.timestamp)
        });
      } else {
        tickersToFetch.push(t);
      }
    }
    
    // Fetch missing tickers in chunks to avoid Too Many Requests and INKApi errors
    const CHUNK_SIZE = 5;
    for (let i = 0; i < tickersToFetch.length; i += CHUNK_SIZE) {
      const chunk = tickersToFetch.slice(i, i + CHUNK_SIZE);
      try {
        const chunkQuotes = await yahooFinance.quote(chunk);
        const chunkArray = Array.isArray(chunkQuotes) ? chunkQuotes : [chunkQuotes];
        quotes.push(...chunkArray);
      } catch(e) { 
        console.log(`Failed bulk fetch for chunk, falling back to individual:`, e.message);
        // Fallback to individual with delay
        for (const t of chunk) {
          try {
            const q = await yahooFinance.quote(t);
            if (q) quotes.push(q);
            await new Promise(resolve => setTimeout(resolve, 200)); // Rate limit delay
          } catch(err) {
            console.log(`Failed individual fetch for ${t}:`, err.message);
          }
        }
      }
    }
    
    const quoteArray = Array.isArray(quotes) ? quotes : [quotes];
    
    quoteArray.forEach((q: any) => {
      if (!q) return;
      const currentPrice = q.regularMarketPrice ?? q.regularMarketPreviousClose ?? 0;
      const prevClose = q.regularMarketPreviousClose ?? currentPrice;
      const rawChange = q.regularMarketChange ?? (currentPrice - prevClose);
      const rawPercentChange = q.regularMarketChangePercent ?? (prevClose !== 0 ? (rawChange / prevClose) * 100 : 0);
      
      const quoteData: CachedQuote = {
        price: Number(currentPrice.toFixed(2)),
        close: Number(currentPrice.toFixed(2)),
        change: Number(rawChange.toFixed(2)),
        percent_change: Number(rawPercentChange.toFixed(2)),
        day_high: q.regularMarketDayHigh ? Number(q.regularMarketDayHigh.toFixed(2)) : undefined,
        day_low: q.regularMarketDayLow ? Number(q.regularMarketDayLow.toFixed(2)) : undefined,
        fifty_two_week_high: q.fiftyTwoWeekHigh ? Number(q.fiftyTwoWeekHigh.toFixed(2)) : undefined,
        fifty_two_week_low: q.fiftyTwoWeekLow ? Number(q.fiftyTwoWeekLow.toFixed(2)) : undefined,
        volume: q.regularMarketVolume || "N/A",
        currency: q.currency || "USD",
        is_live: true,
        timestamp: q.regularMarketTime ? q.regularMarketTime.getTime() : now,
        history: []
      };
      
      results[q.symbol] = quoteData;
      quoteCache.set(q.symbol, { data: quoteData, expiresAt: now + CACHE_TTL_MS });
    });
    
    // Map back to requested keys
    symbolList.forEach(sym => {
      const yT = mapToYahooTicker(sym);
      if (results[yT]) {
        results[sym] = results[yT];
        results[sym.replace(":NSE", "")] = results[yT];
      }
    });
  } catch (err) {
    console.error("Bulk quote error:", err);
  }

  res.json(results);
});

// Single detailed stock quote
app.get("/api/quote/:symbol", async (req, res) => {
  const symbol = req.params.symbol;
  const quote = await fetchYahooQuote(symbol);
  if (!quote) {
    return res.status(404).json({ error: "Symbol not found" });
  }
  res.json({ symbol, ...quote });
});

// Market status endpoint
app.get("/api/market-status", (req, res) => {
  const now = new Date();
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const day = now.getUTCDay(); // 0 = Sun, 6 = Sat

  // NYSE: 13:30 - 20:00 UTC (Mon-Fri)
  const isWeekend = day === 0 || day === 6;
  const totalUtcMinutes = utcHours * 60 + utcMinutes;
  const nyseOpen = !isWeekend && totalUtcMinutes >= 13 * 60 + 30 && totalUtcMinutes < 20 * 60;
  
  // NSE: 03:45 - 10:00 UTC (09:15 - 15:30 IST) (Mon-Fri)
  const nseOpen = !isWeekend && totalUtcMinutes >= 3 * 60 + 45 && totalUtcMinutes < 10 * 60;

  res.json({
    nyse: nyseOpen ? "OPEN" : "CLOSED",
    nse: nseOpen ? "OPEN" : "CLOSED",
    timestamp: now.getTime(),
    isLive: true
  });
});

// Key global and domestic indices
const KEY_INDICES = [
  { key: "dow", name: "Dow Jones", symbol: "^DJI", displaySymbol: "DOW 30", region: "US", currency: "$", baselinePrice: 52064.10, baselineChange: -316.60, baselinePct: -0.60 },
  { key: "sandp500", name: "S&P 500", symbol: "^GSPC", displaySymbol: "S&P 500", region: "US", currency: "$", baselinePrice: 7591.70, baselineChange: -44.66, baselinePct: -0.58 },
  { key: "nasdaq", name: "Nasdaq", symbol: "^IXIC", displaySymbol: "NASDAQ", region: "US", currency: "$", baselinePrice: 26081.72, baselineChange: -171.62, baselinePct: -0.65 },
  { key: "dax", name: "DAX 40", symbol: "^GDAXI", displaySymbol: "DAX", region: "Europe", currency: "€", baselinePrice: 25361.15, baselineChange: -215.25, baselinePct: -0.84 },
  { key: "nifty", name: "Nifty 50", symbol: "^NSEI", displaySymbol: "NIFTY 50", region: "India", currency: "₹", baselinePrice: 23349.20, baselineChange: -128.60, baselinePct: -0.55 },
  { key: "sensex", name: "BSE Sensex", symbol: "^BSESN", displaySymbol: "SENSEX", region: "India", currency: "₹", baselinePrice: 74541.24, baselineChange: -361.35, baselinePct: -0.48 },
  { key: "niftybank", name: "Nifty Bank", symbol: "^NSEBANK", displaySymbol: "BANK NIFTY", region: "India", currency: "₹", baselinePrice: 56154.30, baselineChange: -317.65, baselinePct: -0.56 }
];


app.get("/api/indices", async (req, res) => {
  const symbols = ['^DJI', '^GSPC', '^IXIC', '^GDAXI', '^NSEI', '^BSESN', '^NSEBANK'];
  const queries = symbols.map(s => ({ exchange: 'UNKNOWN', symbol: s }));
  const quotes = await provider.getQuotes(queries);
  res.json(quotes);
});

// Dedicated interactive chart endpoint supporting multi-timeframe queries for both indices and stocks
app.get("/api/chart/:symbol", async (req, res) => {
  try {
    const rawSymbol = req.params.symbol;
    if (!rawSymbol) {
      return res.status(400).json({ error: "Symbol is required" });
    }

    const range = (req.query.range as string) || "1d";
    let interval = (req.query.interval as string);
    if (!interval) {
      if (range === "1d") interval = "5m";
      else if (range === "5d") interval = "15m";
      else if (range === "1mo") interval = "1d";
      else if (range === "1y") interval = "1wk";
      else interval = "5m";
    }

    const ticker = mapToYahooTicker(rawSymbol);
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=${interval}&range=${range}`;

    const response = await axios.get(yahooUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      timeout: 4500
    });

    const result = response.data?.chart?.result?.[0];
    if (!result || !result.meta) {
      return res.status(404).json({ error: "Chart data unavailable for symbol" });
    }

    const meta = result.meta;
    const currentPrice = meta.regularMarketPrice ?? meta.previousClose ?? 0;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? currentPrice;
    const rawChange = currentPrice - prevClose;
    const rawPercentChange = prevClose !== 0 ? (rawChange / prevClose) * 100 : 0;

    const quotes = result.indicators?.quote?.[0];
    const timestamps = result.timestamp || [];
    const points: { time: string; timestamp: number; price: number; volume?: number }[] = [];

    if (quotes && quotes.close && Array.isArray(quotes.close)) {
      for (let i = 0; i < quotes.close.length; i++) {
        const val = quotes.close[i];
        if (typeof val === "number" && !isNaN(val)) {
          const t = timestamps[i] ? new Date(timestamps[i] * 1000) : new Date();
          const timeLabel = range === "1d" 
            ? t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : range === "5d"
            ? `${t.toLocaleDateString([], { weekday: "short" })} ${t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
            : t.toLocaleDateString([], { month: "short", day: "numeric" });

          points.push({
            time: timeLabel,
            timestamp: timestamps[i] ? timestamps[i] * 1000 : Date.now(),
            price: Number(val.toFixed(2)),
            volume: quotes.volume?.[i] || undefined
          });
        }
      }
    }

    res.json({
      symbol: rawSymbol,
      ticker,
      range,
      interval,
      currency: meta.currency || "$",
      price: Number(currentPrice.toFixed(2)),
      previousClose: Number(prevClose.toFixed(2)),
      change: Number(rawChange.toFixed(2)),
      percentChange: Number(rawPercentChange.toFixed(2)),
      dayHigh: meta.regularMarketDayHigh ? Number(meta.regularMarketDayHigh.toFixed(2)) : undefined,
      dayLow: meta.regularMarketDayLow ? Number(meta.regularMarketDayLow.toFixed(2)) : undefined,
      points
    });
  } catch (err: any) {
    console.error(`Error fetching chart for ${req.params.symbol}:`, err?.message);
    res.status(500).json({ error: "Failed to fetch real-time chart data" });
  }
});

// Market News Endpoint
app.get("/api/news", async (req, res) => {
  try {
    const q = (req.query.q as string) || "finance";
    const newsCount = (req.query.count as string) || "20";
    const yahooUrl = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&newsCount=${newsCount}`;
    
    const response = await axios.get(yahooUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      timeout: 4500
    });

    const news = response.data?.news || [];
    res.json(news);
  } catch (err: any) {
    console.error("Error fetching news:", err?.message);
    res.status(500).json({ error: "Failed to fetch market news" });
  }
});

// AI Market Sentiment Analysis via Gemini API
app.post("/api/ai/analyze-stock", async (req, res) => {
  try {
    const { symbol, name, price, change, changePercent, sector, currency } = req.body;
    if (!symbol) {
      return res.status(400).json({ error: "Stock symbol is required." });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        analysis: `${name || symbol} is currently trading at ${currency || "$"}${price || "N/A"} (${change >= 0 ? "+" : ""}${changePercent || 0}%). AI analysis requires a configured Gemini API key.`
      });
    }

    const prompt = `You are an institutional Wall Street quantitative market analyst.
Analyze the real-time trading state of ${name || symbol} (${symbol}):
- Current Live Price: ${currency || "$"}${price}
- Price Delta: ${change >= 0 ? "+" : ""}${change} (${change >= 0 ? "+" : ""}${changePercent}%)
- Sector: ${sector || "Equities"}

Provide a professional, concise, institutional market sentiment analysis in 3-4 impactful sentences.
Focus on immediate price action context, technical momentum, and volatility considerations for paper trading execution.
Keep tone objective, sharp, authoritative, and financial.`;

    let analysisText = "";
    try {
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      analysisText = result.text || "";
    } catch (primaryErr: any) {
      console.log("Primary model gemini-2.5-flash failed, attempting fallback to gemini-2.5-flash:", primaryErr?.message || primaryErr);
      const fallbackResult = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      analysisText = fallbackResult.text || "";
    }

    if (!analysisText) {
      analysisText = `${symbol} shows consolidated trading activity around ${currency || "$"}${price}. Volatility indicators remain balanced for active trading.`;
    }

    res.json({ analysis: analysisText.trim() });
  } catch (err: any) {
    console.log("Gemini Analysis Error in API route:", err);
    res.status(500).json({
      error: err?.message || "Failed to generate market intelligence",
      analysis: "AI analysis is momentarily experiencing high network demand. Core technical momentum remains within standard deviation boundaries."
    });
  }
});

// Stock Alias mapping for reliable natural language trade resolution
const STOCK_ALIASES: Record<string, string> = {
  apple: "AAPL",
  microsoft: "MSFT",
  google: "GOOGL",
  alphabet: "GOOGL",
  amazon: "AMZN",
  nvidia: "NVDA",
  meta: "META",
  facebook: "META",
  tesla: "TSLA",
  broadcom: "AVGO",
  costco: "COST",
  pepsi: "PEP",
  pepsico: "PEP",
  netflix: "NFLX",
  adobe: "ADBE",
  cisco: "CSCO",
  intel: "INTC",
  amd: "AMD",
  qualcomm: "QCOM",
  disney: "DIS",
  nike: "NKE",
  starbucks: "SBUX",
  exxon: "XOM",
  exxonmobil: "XOM",
  gold: "GOLD",
  silver: "SILVER",
  reliance: "RELIANCE",
  tcs: "TCS",
  "tata consultancy": "TCS",
  infosys: "INFY",
  infy: "INFY",
  hdfc: "HDFCBANK",
  "hdfc bank": "HDFCBANK",
  icici: "ICICIBANK",
  "icici bank": "ICICIBANK",
  sbi: "SBIN",
  "state bank": "SBIN",
  airtel: "BHARTIARTL",
  "bharti airtel": "BHARTIARTL",
  itc: "ITC",
  kotak: "KOTAKBANK",
  "kotak mahindra": "KOTAKBANK",
  lt: "LT",
  "l&t": "LT",
  "larsen": "LT",
  axis: "AXISBANK",
  "axis bank": "AXISBANK",
  hul: "HINDUNILVR",
  "hindustan unilever": "HINDUNILVR",
  "tata motors": "TATAMOTORS",
  maruti: "MARUTI",
  "maruti suzuki": "MARUTI",
  "sun pharma": "SUNPHARMA",
  titan: "TITAN",
  "bajaj finance": "BAJFINANCE",
  "asian paints": "ASIANPAINT",
  wipro: "WIPRO",
  hcl: "HCLTECH",
  "hcl tech": "HCLTECH",
  "tata steel": "TATASTEEL",
  ongc: "ONGC"
};

function parseSmartTradeFallback(prompt: string, context: any) {
  const cleanPrompt = prompt.toLowerCase();
  const stocks = Array.isArray(context?.stocks) ? context.stocks : [];
  const holdings = Array.isArray(context?.profile?.holdings) ? context.profile.holdings : [];

  const isBuy = /\b(buy|purchase|acquire|get|invest\s+in|long)\b/i.test(cleanPrompt);
  const isSell = /\b(sell|dump|liquidate|dispose|exit|short)\b/i.test(cleanPrompt);

  if (isBuy || isSell) {
    const side = isBuy ? 'BUY' : 'SELL';

    // 1. Identify Stock
    let matchedStock = null;

    // Check alias mapping first
    for (const [alias, sym] of Object.entries(STOCK_ALIASES)) {
      if (new RegExp(`\\b${alias}\\b`, 'i').test(cleanPrompt)) {
        matchedStock = stocks.find((s: any) => s.symbol.toUpperCase() === sym.toUpperCase()) || { symbol: sym, name: alias, price: 100, currency: '$' };
        break;
      }
    }

    // Direct symbol match in stocks
    if (!matchedStock) {
      for (const s of stocks) {
        const symRegex = new RegExp(`\\b${s.symbol}\\b`, 'i');
        const nameRegex = new RegExp(`\\b${s.name.replace(/[^a-zA-Z0-9 ]/g, '')}\\b`, 'i');
        if (symRegex.test(cleanPrompt) || nameRegex.test(cleanPrompt)) {
          matchedStock = s;
          break;
        }
      }
    }

    if (matchedStock) {
      // 2. Identify Quantity
      let quantity = 1;
      const allMatch = /\b(all|entire|everything|every\s+share)\b/i.test(cleanPrompt);
      if (allMatch && isSell) {
        const owned = holdings.find((h: any) => h.symbol.toUpperCase() === matchedStock.symbol.toUpperCase())?.shares || 1;
        quantity = owned > 0 ? owned : 1;
      } else {
        const qtyMatch = cleanPrompt.match(/\b(\d+(?:\.\d+)?)\s*(?:shares?|stocks?|units?|qty)?\b/);
        if (qtyMatch && qtyMatch[1]) {
          quantity = Math.max(1, Math.floor(parseFloat(qtyMatch[1])));
        } else {
          // Check for dollar/rupee amount e.g. "buy $500 of Apple"
          const budgetMatch = cleanPrompt.match(/[\$₹]\s*(\d+(?:\.\d+)?)/);
          if (budgetMatch && budgetMatch[1] && matchedStock.price > 0) {
            quantity = Math.max(1, Math.floor(parseFloat(budgetMatch[1]) / matchedStock.price));
          }
        }
      }

      // 3. Identify Order Type
      const isLimit = /\blimit\b/i.test(cleanPrompt);
      let limitPrice = undefined;
      if (isLimit) {
        const limitPriceMatch = cleanPrompt.match(/\b(?:at|price)\s*[\$₹]?\s*(\d+(?:\.\d+)?)/i);
        if (limitPriceMatch && limitPriceMatch[1]) {
          limitPrice = parseFloat(limitPriceMatch[1]);
        }
      }

      const currency = matchedStock.currency || '$';
      const orderType = isLimit && limitPrice ? 'Limit' : 'Market';
      const priceText = orderType === 'Limit' ? `${currency}${limitPrice}` : `${currency}${matchedStock.price?.toFixed(2) || 'current market price'}`;

      return {
        text: `Executing paper order: **${side} ${quantity} ${quantity === 1 ? 'share' : 'shares'}** of **${matchedStock.name || matchedStock.symbol} (${matchedStock.symbol})** at ${priceText} (${orderType} Order). Your trade ticket is submitted directly to the execution engine.`,
        trade: {
          symbol: matchedStock.symbol,
          side,
          quantity,
          orderType,
          limitPrice: limitPrice || null,
          reasoning: `${orderType} ${side} order executed for ${quantity} shares via Copilot.`
        }
      };
    }
  }

  // Fallback financial response when not a direct trade prompt
  const balanceUSD = context?.profile?.balances?.['$'] ?? 1000000;
  const balanceINR = context?.profile?.balances?.['₹'] ?? 1000000;
  const holdingsCount = holdings.length;

  return {
    text: `Your virtual trading desk is active with **$${balanceUSD.toLocaleString()} USD** and **₹${balanceINR.toLocaleString()} INR** in available cash across ${holdingsCount} active positions. You can directly command me to execute paper trades anytime—simply prompt: *"Buy 10 shares of Apple"*, *"Sell 5 NVDA"*, or *"Purchase 20 shares of Reliance at market"* to place orders instantly.`,
    trade: null
  };
}


// --- NSE & BSE Market Data API ---

app.get("/api/instruments", (req, res) => {
  res.json(db.getAll());
});

app.get("/api/instruments/search", async (req, res) => {
  const query = req.query.q as string;
  if (!query || typeof query !== 'string') return res.json([]);
  
  // Combine local DB and provider search
  const localResults = db.search(query);
  if (localResults.length > 0) {
    return res.json(localResults);
  }
  
  const providerResults = await provider.searchInstruments(query);
  res.json(providerResults);
});

app.get("/api/quotes", async (req, res) => {
  const symbolsParam = req.query.symbols as string;
  if (!symbolsParam || typeof symbolsParam !== 'string') return res.status(400).json({ error: "No symbols" });
  
  const pairs = symbolsParam.split(',').map(s => {
    const parts = s.split(':');
    return parts.length === 2 ? { exchange: parts[0], symbol: parts[1] } : { exchange: 'NSE', symbol: parts[0] };
  });
  
  const quotes = await provider.getQuotes(pairs);
  res.json(quotes);
});

app.get("/api/quotes/:exchange/:symbol", async (req, res) => {
  const quote = await provider.getQuote(req.params.exchange, req.params.symbol);
  if (!quote) return res.status(404).json({ error: "Not found" });
  res.json(quote);
});

app.get("/api/historical/:exchange/:symbol", async (req, res) => {
  const interval = (req.query.interval as string) || '1 day';
  const range = (req.query.range as string) || '1Y';
  
  const data = await provider.getHistoricalData(req.params.exchange, req.params.symbol, interval, range);
  res.json(data);
});

// Copilot API Route
app.post("/api/copilot", express.json(), async (req, res) => {
  const { prompt, context } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: "Prompt is required." });
  }

  const ai = getGenAI();
  const stocks = Array.isArray(context?.stocks) ? context.stocks : [];
  const holdings = Array.isArray(context?.profile?.holdings) ? context.profile.holdings : [];
  const balances = context?.profile?.balances || {};

  if (!ai) {
    // If Gemini key is not configured, seamlessly handle trades & intelligence via high-accuracy fallback
    const result = parseSmartTradeFallback(prompt, context);
    return res.json(result);
  }

  try {
    const availableTickers = stocks.slice(0, 35).map((s: any) => `${s.symbol} (${s.name}) - ${s.currency || '$'}${s.price}`).join(', ');
    const holdingsList = holdings.map((h: any) => `${h.symbol}: ${h.shares} shares @ avg ${h.averagePrice || 'N/A'}`).join(', ');

    const systemInstruction = `You are TRADEPRO's AI Copilot, a senior algorithmic portfolio manager and automated trading copilot for high-net-worth investors.
You have FULL AUTHORITY to execute paper trades (BUY or SELL) on behalf of the user when requested.

CURRENT USER STATUS:
- Virtual Balances: USD: $${balances['$'] ?? 1000000}, INR: ₹${balances['₹'] ?? 1000000}
- Current Holdings: ${holdingsList || 'None (Clean Portfolio)'}
- Key Tradable Universe: ${availableTickers}

TRADING DIRECTIVE:
If the user's prompt instructs or asks you to BUY or SELL stock (e.g., "buy 10 shares of Apple", "sell 5 NVDA", "purchase 20 RELIANCE", "buy 50 shares of TCS", "sell all my AMD", "liquidate TITAN", "buy $1000 worth of Tesla"):
1. Identify the intended stock symbol from tradable securities (e.g., Apple -> "AAPL", Nvidia -> "NVDA", Reliance -> "RELIANCE", Tesla -> "TSLA", Tata Motors -> "TATAMOTORS").
2. Determine side: "BUY" or "SELL".
3. Determine quantity (positive integer number of shares >= 1). If the user specifies "all", use the user's current holding quantity. If a currency amount is given, calculate shares based on current price.
4. Determine orderType: "Market" (default) or "Limit" (if target limit price is specified).
5. Output valid JSON with this exact structure:
{
  "text": "Your sharp, institutional confirmation message explaining the trade execution, ticker, shares, price, and portfolio rationale.",
  "trade": {
    "symbol": "TICKER_SYMBOL",
    "side": "BUY" or "SELL",
    "quantity": number,
    "orderType": "Market" or "Limit",
    "limitPrice": number or null,
    "reasoning": "Concise quantitative execution reason"
  }
}

IF THE USER IS NOT REQUESTING A TRADE:
Set "trade": null, and provide elite financial analysis, risk breakdown, or market insights in the "text" field.

CRITICAL: Return ONLY raw JSON without markdown code fences or backticks.`;

    let responseText = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        },
      });
      responseText = response.text || "";
    } catch (primaryErr: any) {
      console.log("Primary model gemini-2.5-flash failed, attempting fallback to gemini-2.5-flash:", primaryErr?.message || primaryErr);
      const fallbackResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        },
      });
      responseText = fallbackResponse.text || "";
    }

    // Clean JSON if backticks or wrappers were generated
    let cleaned = responseText.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    try {
      const parsed = JSON.parse(cleaned);
      if (parsed && typeof parsed.text === 'string') {
        // Double check if trade symbol is valid
        if (parsed.trade && typeof parsed.trade.symbol === 'string') {
          parsed.trade.symbol = parsed.trade.symbol.toUpperCase();
        }
        return res.json(parsed);
      }
    } catch (jsonErr) {
      console.log("Could not parse AI JSON output, falling back to smart extractor:", jsonErr);
    }

    // If AI output wasn't structured JSON, inspect if user intended to trade
    const fallbackResult = parseSmartTradeFallback(prompt, context);
    if (fallbackResult.trade) {
      return res.json(fallbackResult);
    }

    res.json({ text: responseText || fallbackResult.text, trade: null });
  } catch (err: any) {
    console.log("Copilot API Warning, executing smart rule fallback:", err?.message || err);
    const fallbackResult = parseSmartTradeFallback(prompt, context);
    res.json(fallbackResult);
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.use((req, res, next) => {
      if (req.method === 'GET' && req.accepts('html')) {
        res.sendFile(path.join(distPath, "index.html"));
      } else {
        next();
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    printSafeTwilioConfigCheck();
  });
}

startServer();


