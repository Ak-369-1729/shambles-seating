/**
 * SHAMBLES SEATING: AUTHENTICATION ERROR MAPPING & LOGGING
 * Maps raw Supabase technical errors to polished nautical / Grand Line messages.
 * Preserves raw technical details in server logs for debugging.
 */

export function logTechnicalAuthError(
  context: "signup" | "login" | "signout" | "profile_sync",
  rawError: unknown,
  metadata?: Record<string, any>
) {
  const errorMessage =
    rawError instanceof Error
      ? rawError.message
      : typeof rawError === "object" && rawError !== null && "message" in rawError
      ? String((rawError as any).message)
      : String(rawError);

  const status = (rawError as any)?.status || (rawError as any)?.code || "UNKNOWN";

  console.error(`[AUTH ${context.toUpperCase()} TECHNICAL ERROR]`, {
    timestamp: new Date().toISOString(),
    context,
    status,
    technicalMessage: errorMessage,
    errorDetails: rawError,
    metadata,
  });
}

export function mapAuthError(
  rawMessage: string,
  context: "signup" | "login" | "general" = "general"
): string {
  if (!rawMessage) {
    return context === "signup"
      ? "Charter registration could not be completed. Please review your enlistment details and try again."
      : "Fleet authentication failed. Please verify your charter credentials and try again.";
  }

  const lower = rawMessage.toLowerCase();

  // 1. Rate limits (Supabase cloud SMTP limit or auth rate limiting)
  if (
    lower.includes("rate limit") ||
    lower.includes("over_email_send_rate_limit") ||
    lower.includes("too many requests") ||
    lower.includes("429")
  ) {
    return "Admiralty dispatch lines are momentarily congested. Please wait a moment before re-submitting your charter.";
  }

  // 2. Duplicate accounts / existing user
  if (
    lower.includes("already registered") ||
    lower.includes("user already exists") ||
    lower.includes("user_already_exists") ||
    lower.includes("unique constraint") ||
    lower.includes("duplicate key")
  ) {
    return "A voyager charter is already registered under this email. Please sign in to your existing charter or use another email.";
  }

  // 3. Invalid credentials
  if (
    lower.includes("invalid login credentials") ||
    lower.includes("invalid credentials") ||
    lower.includes("invalid_grant") ||
    lower.includes("wrong password")
  ) {
    return "Invalid voyager credentials. Please verify your email and voyage cipher.";
  }

  // 4. Weak password
  if (
    lower.includes("password") &&
    (lower.includes("least 6") ||
      lower.includes("weak") ||
      lower.includes("short") ||
      lower.includes("fragile"))
  ) {
    return "Your voyage cipher is too fragile. Password must contain at least 6 characters.";
  }

  // 5. Invalid email address
  if (
    lower.includes("invalid email") ||
    lower.includes("email address is invalid") ||
    lower.includes("unable to validate email")
  ) {
    return "Invalid communication address. Please provide a valid voyager email format.";
  }

  // 6. Signups disabled
  if (
    lower.includes("signup is disabled") ||
    lower.includes("signups not allowed") ||
    lower.includes("signup_disabled")
  ) {
    return "Fleet enlistment is temporarily restricted by the Admiralty. Please contact event officers.";
  }

  // 7. Network / connection
  if (
    lower.includes("network") ||
    lower.includes("fetch") ||
    lower.includes("failed to fetch") ||
    lower.includes("timeout") ||
    lower.includes("connection")
  ) {
    return "Fleet communications lost in the fog. Please check your network connection and retry.";
  }

  // 8. Context-sensitive fallback
  if (context === "signup") {
    return "Charter registration could not be completed at this time. Please verify your enlistment details and try again.";
  }

  if (context === "login") {
    return "Fleet authentication failed. Please verify your charter credentials and try again.";
  }

  return "An unexpected squall disrupted fleet operations. Please try again shortly.";
}
