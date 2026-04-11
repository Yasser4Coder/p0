import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Loader2, Send } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import BrandedPanel from "../components/BrandedPanel";
import { isFirebaseConfigured } from "../lib/firebase";
import { registrationSchema, SHIRT_SIZES } from "../lib/registrationSchema";
import { getFirebaseErrorCode } from "../lib/firebaseErrors";
import {
  DuplicateEmailError,
  saveRegistration,
} from "../lib/saveRegistration";

const baseInput =
  "w-full rounded-sm border bg-black/55 px-3 py-2.5 font-Shuriken text-xs font-bold tracking-[0.12em] text-white normal-case outline-none placeholder:text-white/35 md:text-sm";

const labelClass =
  "mb-1.5 block font-Shuriken text-[0.6rem] font-black tracking-[0.22em] text-white/85";

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const firebaseReady = isFirebaseConfigured();

  function inputClass(name: string) {
    const err = fieldErrors[name];
    return [
      baseInput,
      err
        ? "border-red-500/70 focus:border-red-500/80 focus:ring-2 focus:ring-red-500/25"
        : "border-white/15 focus:border-[#76AF72]/55 focus:ring-2 focus:ring-[#76AF72]/20",
    ].join(" ");
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (!firebaseReady) {
      setFormError("Registration is unavailable right now. Please try again later.");
      return;
    }

    const form = e.currentTarget;
    const fd = new FormData(form);
    const raw = {
      firstName: String(fd.get("firstName") ?? ""),
      familyName: String(fd.get("familyName") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      teamName: String(fd.get("teamName") ?? ""),
      nenSkill: String(fd.get("nenSkill") ?? ""),
      hackathonBefore: String(fd.get("hackathonBefore") ?? ""),
      shirtSize: String(fd.get("shirtSize") ?? ""),
      matricule: String(fd.get("matricule") ?? ""),
    };

    const parsed = registrationSchema.safeParse(raw);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      const next: Record<string, string> = {};
      for (const [k, v] of Object.entries(flat)) {
        if (v?.[0]) next[k] = v[0];
      }
      setFieldErrors(next);
      setFormError("Please fix the highlighted fields.");
      return;
    }

    setLoading(true);
    try {
      await saveRegistration(parsed.data);
      setSubmitted(true);
      form.reset();
    } catch (err) {
      if (err instanceof DuplicateEmailError) {
        setFormError(
          "This email is already registered. Use a different email or contact the organizers if you need help.",
        );
        setFieldErrors((prev) => ({
          ...prev,
          email: "This email is already registered.",
        }));
      } else if (err instanceof Error && err.message === "FIREBASE_NOT_CONFIGURED") {
        setFormError("Registration is unavailable right now. Please try again later.");
      } else {
        const code = getFirebaseErrorCode(err);
        setFormError(
          "Could not save your registration. Check your connection and try again.",
        );
        console.error("Registration save failed:", code ?? "(no code)", err);
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-center font-Shuriken text-xl font-black tracking-[0.22em] text-[#E1D69E] md:text-2xl">
            HUNTER REGISTRATION
          </h1>
          <p className="mt-2 text-center text-[0.65rem] font-bold tracking-[0.18em] text-white/65 normal-case">
            Project Zero — Third Edition · tell us who you are and claim your nen path.
          </p>
        </motion.div>

        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <BrandedPanel className="border-[#43574C] bg-linear-to-br from-white/6 via-black/55 to-black/75 backdrop-blur-md">
            {submitted ? (
              <div className="py-10 text-center">
                <p className="font-Shuriken text-sm font-black tracking-[0.2em] text-[#76AF72]">
                  SUBMISSION RECEIVED — SEE YOU AT P0.
                </p>
                <Link
                  to="/"
                  className="mt-6 inline-block text-[0.65rem] font-bold tracking-[0.2em] text-[#C5A059] underline-offset-4 hover:underline"
                >
                  BACK TO LANDING
                </Link>
              </div>
            ) : (
              <form noValidate onSubmit={onSubmit} className="space-y-5">
                {formError && (
                  <div
                    className="flex gap-3 rounded-md border border-red-500/50 bg-red-950/40 px-3 py-3 text-[0.65rem] font-bold normal-case tracking-normal text-red-100/95"
                    role="alert"
                  >
                    <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
                    <p>{formError}</p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="firstName">
                      FIRST NAME
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      autoComplete="given-name"
                      className={inputClass("firstName")}
                      placeholder="FIRST NAME"
                      aria-invalid={Boolean(fieldErrors.firstName)}
                      aria-describedby={fieldErrors.firstName ? "err-firstName" : undefined}
                    />
                    {fieldErrors.firstName && (
                      <p id="err-firstName" className="mt-1 text-[0.6rem] font-bold normal-case text-red-400">
                        {fieldErrors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="familyName">
                      FAMILY NAME
                    </label>
                    <input
                      id="familyName"
                      name="familyName"
                      autoComplete="family-name"
                      className={inputClass("familyName")}
                      placeholder="FAMILY NAME"
                      aria-invalid={Boolean(fieldErrors.familyName)}
                    />
                    {fieldErrors.familyName && (
                      <p className="mt-1 text-[0.6rem] font-bold normal-case text-red-400">
                        {fieldErrors.familyName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelClass} htmlFor="phone">
                    PHONE NUMBER
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    className={inputClass("phone")}
                    placeholder="+216 …"
                    aria-invalid={Boolean(fieldErrors.phone)}
                  />
                  {fieldErrors.phone && (
                    <p className="mt-1 text-[0.6rem] font-bold normal-case text-red-400">{fieldErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass} htmlFor="email">
                    E-MAIL
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className={inputClass("email")}
                    placeholder="YOU@DOMAIN.COM"
                    aria-invalid={Boolean(fieldErrors.email)}
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-[0.6rem] font-bold normal-case text-red-400">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass} htmlFor="teamName">
                    TEAM NAME
                  </label>
                  <input
                    id="teamName"
                    name="teamName"
                    className={inputClass("teamName")}
                    placeholder="YOUR SQUAD"
                    aria-invalid={Boolean(fieldErrors.teamName)}
                  />
                  {fieldErrors.teamName && (
                    <p className="mt-1 text-[0.6rem] font-bold normal-case text-red-400">{fieldErrors.teamName}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass} htmlFor="nenSkill">
                    YOUR NEN (SKILL)
                  </label>
                  <input
                    id="nenSkill"
                    name="nenSkill"
                    className={inputClass("nenSkill")}
                    placeholder="E.G. UI/UX, AI, CYBER SECURITY, DESIGN, PS"
                    aria-invalid={Boolean(fieldErrors.nenSkill)}
                  />
                  {fieldErrors.nenSkill && (
                    <p className="mt-1 text-[0.6rem] font-bold normal-case text-red-400">{fieldErrors.nenSkill}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass} htmlFor="hackathonBefore">
                    HAVE YOU EVER PARTICIPATED IN A HACKATHON?
                  </label>
                  <select
                    id="hackathonBefore"
                    name="hackathonBefore"
                    className={inputClass("hackathonBefore")}
                    defaultValue=""
                    aria-invalid={Boolean(fieldErrors.hackathonBefore)}
                  >
                    <option value="" disabled>
                      SELECT
                    </option>
                    <option value="yes">YES</option>
                    <option value="no">NO</option>
                  </select>
                  {fieldErrors.hackathonBefore && (
                    <p className="mt-1 text-[0.6rem] font-bold normal-case text-red-400">
                      {fieldErrors.hackathonBefore}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass} htmlFor="shirtSize">
                    T-SHIRT SIZE
                  </label>
                  <select
                    id="shirtSize"
                    name="shirtSize"
                    className={inputClass("shirtSize")}
                    defaultValue=""
                    aria-invalid={Boolean(fieldErrors.shirtSize)}
                  >
                    <option value="" disabled>
                      SELECT SIZE
                    </option>
                    {SHIRT_SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.shirtSize && (
                    <p className="mt-1 text-[0.6rem] font-bold normal-case text-red-400">{fieldErrors.shirtSize}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass} htmlFor="matricule">
                    MATRICULE
                  </label>
                  <input
                    id="matricule"
                    name="matricule"
                    className={inputClass("matricule")}
                    placeholder="STUDENT ID"
                    aria-invalid={Boolean(fieldErrors.matricule)}
                  />
                  {fieldErrors.matricule && (
                    <p className="mt-1 text-[0.6rem] font-bold normal-case text-red-400">{fieldErrors.matricule}</p>
                  )}
                </div>

                <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[0.55rem] font-bold tracking-[0.14em] text-white/45 normal-case">
                    By registering you agree to follow event rules &amp; code of conduct.
                  </p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-sm border border-[#C5A059] bg-[#C5A059] px-8 py-3 text-xs font-black tracking-[0.28em] text-black transition-transform hover:scale-[1.02] hover:bg-[#b8924f] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        SAVING…
                      </>
                    ) : (
                      <>
                        SUBMIT
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </BrandedPanel>
        </motion.div>
      </main>
    </div>
  );
}
