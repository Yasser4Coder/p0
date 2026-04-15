import { collection, doc, getDocs, orderBy, query, serverTimestamp, updateDoc, type Timestamp } from "firebase/firestore";
import { ArrowLeft, Download, Loader2, LogOut, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BrandedPanel from "../components/BrandedPanel";
import { adminSignOut } from "../lib/adminAuth";
import { db } from "../lib/firebase";
import * as XLSX from "xlsx";

type RegistrationRow = {
  id: string;
  createdAt?: Timestamp;
  contacted?: boolean;
  contactedAt?: Timestamp;
  firstName?: string;
  familyName?: string;
  phone?: string;
  wilaya?: string;
  email?: string;
  teamName?: string;
  nenSkill?: string;
  hackathonBefore?: string;
  shirtSize?: string;
  matricule?: string;
};

type SortKey = "createdAt" | "teamName";
type SortDir = "asc" | "desc";

function fmtDate(ts?: Timestamp): string {
  if (!ts) return "";
  const d = ts.toDate();
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

function norm(s: unknown): string {
  return String(s ?? "").trim().toLowerCase();
}

function uniqNonEmpty(values: (string | undefined)[]): string[] {
  const set = new Set<string>();
  for (const v of values) {
    const t = String(v ?? "").trim();
    if (t) set.add(t);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<RegistrationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [wilayaFilter, setWilayaFilter] = useState("");
  const [hackathonFilter, setHackathonFilter] = useState<"" | "yes" | "no">("");
  const [shirtFilter, setShirtFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const columns = useMemo(
    () => [
      {
        key: "contacted",
        label: "Contacted",
        render: (r: RegistrationRow) => (
          <button
            type="button"
            disabled={loading || savingId === r.id}
            onClick={() => void toggleContacted(r)}
            className={[
              "inline-flex items-center rounded-sm border px-2 py-1 text-xs font-semibold transition-colors disabled:opacity-60",
              r.contacted
                ? "border-[#76AF72]/55 bg-[#76AF72]/20 text-[#baf2b6] hover:bg-[#76AF72]/25"
                : "border-white/15 bg-black/40 text-white/80 hover:border-[#C5A059]/60",
            ].join(" ")}
            title="Toggle contacted"
          >
            {savingId === r.id ? "Saving…" : r.contacted ? "Yes" : "No"}
          </button>
        ),
      },
      { key: "createdAt", label: "Created", render: (r: RegistrationRow) => fmtDate(r.createdAt) },
      { key: "firstName", label: "First", render: (r: RegistrationRow) => r.firstName ?? "" },
      { key: "familyName", label: "Family", render: (r: RegistrationRow) => r.familyName ?? "" },
      { key: "email", label: "Email", render: (r: RegistrationRow) => r.email ?? "" },
      { key: "phone", label: "Phone", render: (r: RegistrationRow) => r.phone ?? "" },
      { key: "wilaya", label: "Wilaya", render: (r: RegistrationRow) => r.wilaya ?? "" },
      { key: "teamName", label: "Team", render: (r: RegistrationRow) => r.teamName ?? "" },
      { key: "shirtSize", label: "Shirt", render: (r: RegistrationRow) => r.shirtSize ?? "" },
      { key: "hackathonBefore", label: "Hackathon?", render: (r: RegistrationRow) => r.hackathonBefore ?? "" },
      { key: "matricule", label: "Matricule", render: (r: RegistrationRow) => r.matricule ?? "" },
      { key: "nenSkill", label: "Nen/Skill", render: (r: RegistrationRow) => r.nenSkill ?? "" },
    ],
    [loading, savingId],
  );

  const wilayaOptions = useMemo(() => uniqNonEmpty(rows.map((r) => r.wilaya)), [rows]);
  const shirtOptions = useMemo(() => uniqNonEmpty(rows.map((r) => r.shirtSize)), [rows]);

  const filteredRows = useMemo(() => {
    const q = norm(search);
    const next = rows.filter((r) => {
      if (wilayaFilter && (r.wilaya ?? "") !== wilayaFilter) return false;
      if (hackathonFilter && (r.hackathonBefore ?? "") !== hackathonFilter) return false;
      if (shirtFilter && (r.shirtSize ?? "") !== shirtFilter) return false;
      if (!q) return true;
      const hay = [
        r.firstName,
        r.familyName,
        r.email,
        r.phone,
        r.teamName,
        r.matricule,
        r.wilaya,
        r.shirtSize,
        r.hackathonBefore,
        r.nenSkill,
      ]
        .map(norm)
        .join(" ");
      return hay.includes(q);
    });

    const sorted = [...next].sort((a, b) => {
      if (sortKey === "teamName") {
        const av = norm(a.teamName);
        const bv = norm(b.teamName);
        const cmp = av.localeCompare(bv);
        return sortDir === "asc" ? cmp : -cmp;
      }

      // createdAt
      const at = a.createdAt?.toMillis?.() ?? 0;
      const bt = b.createdAt?.toMillis?.() ?? 0;
      const cmp = at - bt;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [rows, wilayaFilter, hackathonFilter, shirtFilter, search, sortKey, sortDir]);

  const stats = useMemo(() => {
    const total = rows.length;
    const shown = filteredRows.length;
    const teams = new Set(filteredRows.map((r) => norm(r.teamName)).filter(Boolean));
    const yes = filteredRows.filter((r) => r.hackathonBefore === "yes").length;
    const no = filteredRows.filter((r) => r.hackathonBefore === "no").length;
    return {
      total,
      shown,
      teams: teams.size,
      yes,
      no,
    };
  }, [rows.length, filteredRows]);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      if (!db) throw new Error("FIREBASE_NOT_CONFIGURED");
      const q = query(collection(db, "p0_registrations"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const next: RegistrationRow[] = snap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          id: d.id,
          createdAt: data.createdAt as Timestamp | undefined,
          contacted: data.contacted as boolean | undefined,
          contactedAt: data.contactedAt as Timestamp | undefined,
          firstName: data.firstName as string | undefined,
          familyName: data.familyName as string | undefined,
          phone: data.phone as string | undefined,
          wilaya: data.wilaya as string | undefined,
          email: data.email as string | undefined,
          teamName: data.teamName as string | undefined,
          nenSkill: data.nenSkill as string | undefined,
          hackathonBefore: data.hackathonBefore as string | undefined,
          shirtSize: data.shirtSize as string | undefined,
          matricule: data.matricule as string | undefined,
        };
      });
      setRows(next);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  async function toggleContacted(r: RegistrationRow) {
    try {
      if (!db) throw new Error("FIREBASE_NOT_CONFIGURED");
      setSavingId(r.id);
      const next = !Boolean(r.contacted);
      await updateDoc(doc(db, "p0_registrations", r.id), {
        contacted: next,
        contactedAt: next ? serverTimestamp() : null,
      });
      setRows((prev) =>
        prev.map((x) => (x.id === r.id ? { ...x, contacted: next } : x)),
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
    } finally {
      setSavingId(null);
    }
  }

  useEffect(() => {
    void load();
  }, [load]);

  function exportExcel() {
    const data = filteredRows.map((r) => ({
      Contacted: r.contacted ? "Yes" : "No",
      Created: fmtDate(r.createdAt),
      First: r.firstName ?? "",
      Family: r.familyName ?? "",
      Email: r.email ?? "",
      Phone: r.phone ?? "",
      Wilaya: r.wilaya ?? "",
      Team: r.teamName ?? "",
      Shirt: r.shirtSize ?? "",
      Hackathon: r.hackathonBefore ?? "",
      Matricule: r.matricule ?? "",
      "Nen/Skill": r.nenSkill ?? "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registrations");

    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    XLSX.writeFile(wb, `registrations-${stamp}.xlsx`);
  }

  async function onLogout() {
    await adminSignOut();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(181,43,43,0.18),transparent_50%),radial-gradient(ellipse_at_70%_100%,rgba(19,143,0,0.1),transparent_50%)]"
        aria-hidden
      />

      <header className="relative z-10 mx-auto flex w-full max-w-none items-center gap-4 px-4 py-6 md:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-sm border border-white/15 bg-black/40 px-3 py-2 text-[0.75rem] font-semibold text-white/90 transition-colors hover:border-[#39FF14]/45"
        >
          <ArrowLeft className="h-4 w-4" />
          HOME
        </Link>

        <div className="flex flex-1 items-center justify-end gap-2">
          <button
            type="button"
            onClick={exportExcel}
            className="inline-flex items-center gap-2 rounded-sm border border-white/15 bg-black/40 px-3 py-2 text-[0.75rem] font-semibold text-white/90 transition-colors hover:border-[#C5A059]/60 disabled:opacity-60"
            disabled={loading || filteredRows.length === 0}
            title="Export current table to Excel"
          >
            <Download className="h-4 w-4" />
            EXPORT
          </button>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-sm border border-white/15 bg-black/40 px-3 py-2 text-[0.75rem] font-semibold text-white/90 transition-colors hover:border-[#76AF72]/55 disabled:opacity-60"
            disabled={loading}
          >
            <RefreshCcw className="h-4 w-4" />
            REFRESH
          </button>
          <button
            type="button"
            onClick={() => void onLogout()}
            className="inline-flex items-center gap-2 rounded-sm border border-white/15 bg-black/40 px-3 py-2 text-[0.75rem] font-semibold text-white/90 transition-colors hover:border-red-400/55"
          >
            <LogOut className="h-4 w-4" />
            LOGOUT
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-none px-4 pb-20 md:px-8">
        <BrandedPanel className="border-[#43574C] bg-linear-to-br from-white/6 via-black/55 to-black/75 backdrop-blur-md">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-[#E1D69E] md:text-2xl">
                REGISTRATIONS
              </h1>
              <p className="mt-1 text-sm text-white/65">
                {loading ? "Loading…" : `${rows.length} total`}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border border-white/10 bg-black/35 px-4 py-3">
              <p className="text-xs font-semibold text-white/60">Shown</p>
              <p className="mt-1 text-2xl font-semibold text-white">{stats.shown}</p>
            </div>
            <div className="rounded-md border border-white/10 bg-black/35 px-4 py-3">
              <p className="text-xs font-semibold text-white/60">Unique teams</p>
              <p className="mt-1 text-2xl font-semibold text-white">{stats.teams}</p>
            </div>
            <div className="rounded-md border border-white/10 bg-black/35 px-4 py-3">
              <p className="text-xs font-semibold text-white/60">Hackathon: Yes</p>
              <p className="mt-1 text-2xl font-semibold text-white">{stats.yes}</p>
            </div>
            <div className="rounded-md border border-white/10 bg-black/35 px-4 py-3">
              <p className="text-xs font-semibold text-white/60">Hackathon: No</p>
              <p className="mt-1 text-2xl font-semibold text-white">{stats.no}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <label className="mb-1 block text-xs font-semibold text-white/70">Search</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                placeholder="Search name, email, phone, matricule, team…"
                className="w-full rounded-sm border border-white/15 bg-black/55 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#76AF72]/55 focus:ring-2 focus:ring-[#76AF72]/20"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-white/70">Wilaya</label>
              <select
                value={wilayaFilter}
                onChange={(e) => setWilayaFilter(e.currentTarget.value)}
                className="w-full rounded-sm border border-white/15 bg-black/55 px-3 py-2.5 text-sm text-white outline-none focus:border-[#76AF72]/55 focus:ring-2 focus:ring-[#76AF72]/20"
              >
                <option value="">All</option>
                {wilayaOptions.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-white/70">Hackathon</label>
              <select
                value={hackathonFilter}
                onChange={(e) => setHackathonFilter(e.currentTarget.value as "" | "yes" | "no")}
                className="w-full rounded-sm border border-white/15 bg-black/55 px-3 py-2.5 text-sm text-white outline-none focus:border-[#76AF72]/55 focus:ring-2 focus:ring-[#76AF72]/20"
              >
                <option value="">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-white/70">Shirt</label>
              <select
                value={shirtFilter}
                onChange={(e) => setShirtFilter(e.currentTarget.value)}
                className="w-full rounded-sm border border-white/15 bg-black/55 px-3 py-2.5 text-sm text-white outline-none focus:border-[#76AF72]/55 focus:ring-2 focus:ring-[#76AF72]/20"
              >
                <option value="">All</option>
                {shirtOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-1">
              <label className="mb-1 block text-xs font-semibold text-white/70">Sort</label>
              <select
                value={`${sortKey}:${sortDir}`}
                onChange={(e) => {
                  const [k, d] = e.currentTarget.value.split(":") as [SortKey, SortDir];
                  setSortKey(k);
                  setSortDir(d);
                }}
                className="w-full rounded-sm border border-white/15 bg-black/55 px-3 py-2.5 text-sm text-white outline-none focus:border-[#76AF72]/55 focus:ring-2 focus:ring-[#76AF72]/20"
              >
                <option value="createdAt:desc">Created ↓</option>
                <option value="createdAt:asc">Created ↑</option>
                <option value="teamName:asc">Team A→Z</option>
                <option value="teamName:desc">Team Z→A</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="mt-6 rounded-md border border-red-500/50 bg-red-950/40 px-3 py-3 text-sm text-red-100/95">
              {error}
            </p>
          )}

          <div className="mt-6 overflow-auto rounded-md border border-white/10">
            <table className="min-w-[1100px] w-full border-separate border-spacing-0 font-sans">
              <thead className="sticky top-0 bg-black/70 backdrop-blur">
                <tr>
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      className="border-b border-white/10 px-3 py-3 text-left text-xs font-semibold text-white/80"
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length} className="px-3 py-10">
                      <div className="flex items-center gap-3 text-sm text-white/70">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading registrations…
                      </div>
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-3 py-10 text-sm text-white/70"
                    >
                      No matching registrations.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((r) => (
                    <tr
                      key={r.id}
                      className={[
                        "odd:bg-white/3",
                        r.contacted ? "bg-[#76AF72]/10" : "",
                      ].join(" ")}
                    >
                      {columns.map((c) => (
                        <td
                          key={c.key}
                          className="border-b border-white/5 px-3 py-3 align-top text-sm text-white/85"
                        >
                          {c.render(r)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </BrandedPanel>
      </main>
    </div>
  );
}

