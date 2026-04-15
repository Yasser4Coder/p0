import { AlertCircle, ArrowLeft, Loader2, LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BrandedPanel from "../components/BrandedPanel";
import { getFirebaseErrorCode } from "../lib/firebaseErrors";
import { adminSignIn } from "../lib/adminAuth";
import { auth, isFirebaseConfigured } from "../lib/firebase";

const baseInput =
  "w-full rounded-sm border bg-black/55 px-3 py-2.5 font-Shuriken text-xs font-bold tracking-[0.12em] text-white normal-case outline-none placeholder:text-white/35 md:text-sm";

const labelClass =
  "mb-1.5 block font-Shuriken text-[0.6rem] font-black tracking-[0.22em] text-white/85";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const firebaseReady = isFirebaseConfigured();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (auth?.currentUser) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    if (!firebaseReady) {
      setFormError("Firebase is not configured. Admin login is unavailable.");
      return;
    }

    setLoading(true);
    try {
      await adminSignIn(username.trim(), password);
      navigate("/admin", { replace: true });
    } catch (err) {
      const code = getFirebaseErrorCode(err);
      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
      ) {
        setFormError("Invalid username or password.");
      } else if (code === "auth/operation-not-allowed") {
        setFormError(
          "Email/password sign-in is disabled for this Firebase project. Enable it in Firebase Console → Authentication → Sign-in method.",
        );
      } else if (code === "auth/invalid-api-key" || code === "auth/api-key-not-valid.-please-pass-a-valid-api-key.") {
        setFormError("Firebase API key is invalid. Check your VITE_FIREBASE_* env values.");
      } else {
        setFormError(`Login failed (${code ?? "unknown"}). Check your Firebase Auth settings and credentials.`);
        console.error("Admin login failed:", code ?? "(no code)", err);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden font-Shuriken uppercase tracking-wide text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(181,43,43,0.18),transparent_50%),radial-gradient(ellipse_at_70%_100%,rgba(19,143,0,0.1),transparent_50%)]"
        aria-hidden
      />

      <header className="relative z-10 mx-auto flex max-w-3xl items-center gap-4 px-4 py-6 md:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-sm border border-white/15 bg-black/40 px-3 py-2 text-[0.6rem] font-black tracking-[0.25em] text-white/90 transition-colors hover:border-[#39FF14]/45"
        >
          <ArrowLeft className="h-4 w-4" />
          HOME
        </Link>
        <div className="flex flex-1 items-center justify-end gap-3">
          <img src="/Logo.svg" alt="" className="h-10 w-10 opacity-90" />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-4 pb-20 md:px-8">
        <BrandedPanel className="border-[#43574C] bg-linear-to-br from-white/6 via-black/55 to-black/75 backdrop-blur-md">
          <h1 className="text-center font-Shuriken text-xl font-black tracking-[0.22em] text-[#E1D69E] md:text-2xl">
            ADMIN LOGIN
          </h1>
          <p className="mt-2 text-center text-[0.65rem] font-bold tracking-[0.18em] text-white/65 normal-case">
            Sign in to access the registrations dashboard.
          </p>

          <form noValidate onSubmit={onSubmit} className="mt-8 space-y-5">
            {formError && (
              <div
                className="flex gap-3 rounded-md border border-red-500/50 bg-red-950/40 px-3 py-3 text-[0.65rem] font-bold normal-case tracking-normal text-red-100/95"
                role="alert"
              >
                <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
                <p>{formError}</p>
              </div>
            )}

            <div>
              <label className={labelClass} htmlFor="username">
                USERNAME
              </label>
              <input
                id="username"
                name="username"
                className={baseInput + " border-white/15 focus:border-[#76AF72]/55 focus:ring-2 focus:ring-[#76AF72]/20"}
                placeholder="ADMIN USERNAME"
                value={username}
                onChange={(e) => setUsername(e.currentTarget.value)}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="password">
                PASSWORD
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className={baseInput + " border-white/15 focus:border-[#76AF72]/55 focus:ring-2 focus:ring-[#76AF72]/20"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-sm border border-[#C5A059] bg-[#C5A059] px-8 py-3 text-xs font-black tracking-[0.28em] text-black transition-transform hover:scale-[1.02] hover:bg-[#b8924f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  SIGNING IN…
                </>
              ) : (
                <>
                  LOGIN
                  <LogIn className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </BrandedPanel>
      </main>
    </div>
  );
}

