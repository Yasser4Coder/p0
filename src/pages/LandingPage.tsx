import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import BrandedPanel from "../components/BrandedPanel";

const ELEC_CLUB_URL =
  import.meta.env.VITE_ELEC_CLUB_URL ?? "https://elec-os0l.onrender.com/";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const DOMAINS = [
  { label: "GRAPHIC DESIGN", color: "text-[#E1D69E]" },
  { label: "UI / UX", color: "text-[#D8B4FE]" },
  { label: "PROBLEM SOLVING", color: "text-[#E85D5D]" },
  { label: "ARTIFICIAL INTELLIGENCE", color: "text-[#4ECBFF]" },
  { label: "CYBER SECURITY", color: "text-[#76AF72]" },
] as const;

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden font-Shuriken uppercase tracking-wide text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(181,43,43,0.2),transparent_50%),radial-gradient(ellipse_at_80%_20%,rgba(19,143,0,0.12),transparent_45%),radial-gradient(ellipse_at_50%_100%,rgba(197,160,89,0.15),transparent_55%)]"
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -left-24 top-32 h-72 w-72 rounded-full bg-[#39FF14]/10 blur-3xl animate-float-slow"
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -right-16 bottom-24 h-80 w-80 rounded-full bg-[#B52B2B]/15 blur-3xl animate-float-slow"
        style={{ animationDelay: "2s" }}
        aria-hidden
      />

      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-4 py-6 md:px-8">
        <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <img src="/Logo.svg" alt="P0" className="h-11 w-11 md:h-12 md:w-12" />
          <span className="hidden text-xs font-black tracking-[0.35em] text-white/90 sm:inline md:text-sm">
            PROJECT ZERO
          </span>
        </Link>
        <nav className="flex items-center gap-3">
          <a
            href={ELEC_CLUB_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-sm border border-white/15 bg-black/40 px-3 py-2 text-[0.6rem] font-bold tracking-[0.2em] text-white/90 transition-colors hover:border-[#39FF14]/50 sm:flex"
          >
            ELEC CLUB
            <ExternalLink className="h-3.5 w-3.5 opacity-80" />
          </a>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-sm border border-[#C5A059]/70 bg-linear-to-b from-[#E1D69E]/25 to-[#B52B2B]/20 px-4 py-2.5 text-[0.65rem] font-black tracking-[0.28em] text-white shadow-[0_0_24px_rgba(197,160,89,0.25)] transition-transform hover:scale-[1.02] md:text-xs"
          >
            REGISTER
            <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-4 md:px-8">
        <motion.section
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-12"
        >
          <motion.div variants={item} className="relative w-full max-w-xl flex-1">
            <div className="animate-pulse-glow relative overflow-hidden rounded-lg border border-[#B52B2B]/40 bg-black/40 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-sm md:p-4">
              <motion.img
                src="/PROJECTxZERO.png"
                alt="Project Zero — Hunter x Hacker"
                className="mx-auto h-auto w-full max-w-md object-contain md:max-w-lg"
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
            </div>
          </motion.div>

          <motion.div variants={item} className="flex-1 text-center lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[0.55rem] font-bold tracking-[0.35em] text-white/80">
              <Sparkles className="h-3.5 w-3.5 text-[#E1D69E]" />
              THIRD EDITION · 36H HACKATHON
            </div>
            <h1 className="text-balance font-Shuriken text-2xl font-black leading-tight tracking-[0.12em] text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.12)] md:text-3xl lg:text-4xl">
              TURN IDEAS INTO IMPACT
            </h1>
            <p className="mt-4 text-pretty text-[0.7rem] font-bold leading-relaxed tracking-[0.14em] text-white/88 normal-case md:text-sm md:tracking-[0.16em]">
              PROJECT ZERO IS A 36-HOUR HACKATHON ORGANIZED BY ELEC CLUB AT THE FACULTY OF
              SCIENCE &amp; TECHNOLOGY, WHERE TEAMS COMPETE TO TURN IDEAS INTO IMPACTFUL
              PROJECTS. PARTICIPANTS WILL GO HEAD-TO-HEAD IN GRAPHIC DESIGN, UI/UX, PROBLEM
              SOLVING, ARTIFICIAL INTELLIGENCE, AND CYBER SECURITY — PUSHING CREATIVITY,
              TEAMWORK, AND INNOVATION TO THE LIMIT.
            </p>

            <ul className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
              {DOMAINS.map((d) => (
                <li
                  key={d.label}
                  className={`rounded-sm border border-white/10 bg-black/50 px-2.5 py-1 text-[0.55rem] font-black tracking-[0.18em] md:text-[0.6rem] ${d.color}`}
                >
                  {d.label}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
              <a
                href={ELEC_CLUB_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-[#39FF14]/45 bg-black/55 px-6 py-3 text-xs font-black tracking-[0.3em] text-white transition-all hover:border-[#39FF14]/80 hover:shadow-[0_0_24px_rgba(57,255,20,0.2)]"
              >
                PREVIOUS EDITIONS &amp; ELEC
                <ExternalLink className="h-4 w-4" />
              </a>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-[#C5A059] bg-[#C5A059] px-6 py-3 text-xs font-black tracking-[0.3em] text-black transition-transform hover:scale-[1.02] hover:bg-[#b8924f]"
              >
                REGISTER FOR P0
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 md:mt-24"
        >
          <BrandedPanel className="relative overflow-hidden border-[#43574C] bg-linear-to-br from-white/[0.07] via-black/50 to-black/70 backdrop-blur-md">
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(255,255,255,0.03) 8px, rgba(255,255,255,0.03) 10px)",
              }}
            />
            <div className="relative z-10">
              <h2 className="text-center font-Shuriken text-lg font-black tracking-[0.28em] text-[#E1D69E] md:text-xl">
                WHY PROJECT ZERO?
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-center text-[0.7rem] font-bold leading-relaxed tracking-[0.12em] text-white/90 normal-case md:text-sm">
                BUILT IN THE SPIRIT OF HUNTER × HACKER, PROJECT ZERO IS WHERE TEAMS PROVE
                THEIR NEN — YOUR SKILL DOMAIN — ACROSS DESIGN, UX, LOGIC, AI, AND SECURITY.
                EXPECT INTENSE SPRINTS, MENTOR FEEDBACK, AND A FINALE WORTHY OF THE HUNTER
                LICENSE.
              </p>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  { k: "36", u: "HOURS", d: "NON-STOP BUILD" },
                  { k: "5", u: "DOMAINS", d: "ONE TEAM, MULTIPLE PATHS" },
                  { k: "∞", u: "IDEAS", d: "SHIP WHAT MATTERS" },
                ].map((x, i) => (
                  <motion.div
                    key={x.u}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.45 }}
                    className="rounded-md border border-white/10 bg-black/40 px-4 py-5 text-center"
                  >
                    <p className="font-Shuriken text-3xl font-black text-[#C5A059] md:text-4xl">
                      {x.k}
                    </p>
                    <p className="mt-1 text-[0.65rem] font-black tracking-[0.25em] text-white">
                      {x.u}
                    </p>
                    <p className="mt-2 text-[0.55rem] font-bold tracking-[0.15em] text-white/55 normal-case">
                      {x.d}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </BrandedPanel>
        </motion.section>

        <footer className="mt-16 border-t border-white/10 pt-8 text-center text-[0.55rem] font-bold tracking-[0.2em] text-white/45">
          © ELEC CLUB · FSTM · PROJECT ZERO THIRD EDITION
        </footer>
      </main>
    </div>
  );
}
