import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase";

export function getAdminEmail(): string {
  return String(import.meta.env.VITE_ADMIN_USERNAME ?? import.meta.env.VITE_ADMIN_EMAIL ?? "");
}

export function getAdminPassword(): string {
  return String(import.meta.env.VITE_ADMIN_PASSWORD ?? "");
}

export function getAdminUid(): string {
  return String(import.meta.env.VITE_ADMIN_UID ?? "");
}

export async function adminSignIn(email: string, password: string): Promise<void> {
  if (!auth) throw new Error("FIREBASE_NOT_CONFIGURED");
  await signInWithEmailAndPassword(auth, email, password);
}

export async function adminSignOut(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

export function isSignedInAdmin(): boolean {
  const uid = getAdminUid();
  const current = auth?.currentUser;
  if (!current) return false;
  if (!uid) return true; // fallback: any signed-in user (dev-only)
  return current.uid === uid;
}

