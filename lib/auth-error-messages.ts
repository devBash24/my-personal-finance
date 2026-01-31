/**
 * Maps auth API error messages to user-friendly feedback.
 */
export function getLoginErrorMessage(message: string | undefined): string {
  if (!message) return "Something went wrong. Please try again.";

  const lower = message.toLowerCase();

  if (
    lower.includes("invalid") &&
    (lower.includes("credential") || lower.includes("password"))
  )
    return "Incorrect email or password. Please check your credentials.";
  if (lower.includes("user not found") || lower.includes("no user"))
    return "No account found with this email. Sign up to create an account.";
  if (lower.includes("email") && lower.includes("verify"))
    return "Please verify your email before signing in.";
  if (lower.includes("banned") || lower.includes("suspended"))
    return "This account has been suspended. Contact support for help.";
  if (lower.includes("rate limit") || lower.includes("too many"))
    return "Too many attempts. Please wait a moment and try again.";
  if (lower.includes("network") || lower.includes("fetch") || lower.includes("connection"))
    return "Network error. Check your connection and try again.";

  return message;
}

export function getSignupErrorMessage(message: string | undefined): string {
  if (!message) return "Something went wrong. Please try again.";

  const lower = message.toLowerCase();

  if (lower.includes("already") && (lower.includes("exist") || lower.includes("use")))
    return "An account with this email already exists. Try logging in instead.";
  if (lower.includes("email") && lower.includes("invalid"))
    return "Please enter a valid email address.";
  if (lower.includes("password") && lower.includes("short"))
    return "Password is too short. Use at least 8 characters.";
  if (lower.includes("password") && lower.includes("weak"))
    return "Password is too weak. Use a mix of letters, numbers, and symbols.";
  if (lower.includes("rate limit") || lower.includes("too many"))
    return "Too many attempts. Please wait a moment and try again.";
  if (lower.includes("network") || lower.includes("fetch") || lower.includes("connection"))
    return "Network error. Check your connection and try again.";

  return message;
}
