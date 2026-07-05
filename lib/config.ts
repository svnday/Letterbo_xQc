/** Deployment switches, all read from environment variables. */

/** Set SIGNUPS_OPEN=false to close public viewer sign-ups entirely. */
export function signupsOpen(): boolean {
  return process.env.SIGNUPS_OPEN !== "false";
}

/**
 * Set ALLOW_OWNER_CLAIM=true only during initial setup so the first account
 * created becomes the site owner; remove it afterwards.
 */
export function ownerClaimOpen(): boolean {
  return process.env.ALLOW_OWNER_CLAIM === "true";
}
