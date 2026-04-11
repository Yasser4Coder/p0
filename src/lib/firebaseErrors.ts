/** Firestore often uses `firestore/permission-denied`; Auth uses `auth/...`. */
export function getFirebaseErrorCode(err: unknown): string | undefined {
  if (!err || typeof err !== "object") return undefined;
  const c = (err as { code?: unknown }).code;
  return typeof c === "string" ? c : undefined;
}

export function isPermissionDeniedError(err: unknown): boolean {
  const code = getFirebaseErrorCode(err);
  if (!code) return false;
  if (code === "permission-denied") return true;
  if (code === "firestore/permission-denied") return true;
  return code.endsWith("/permission-denied");
}
