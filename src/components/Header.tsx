import { useState, useRef, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Search, X, Building2, GraduationCap } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import busiaLogo from "@/assets/busia-county-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const roleLabel: Record<string, string> = {
  super_admin: "County Administrator",
  institution_admin: "Institution Admin",
  teacher: "Teacher",
  data_clerk: "Data Clerk",
};

function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const isSuperAdmin = user?.role === "super_admin";

  const learnerResults = useQuery(
    api.learners.search,
    query.length >= 2 ? { query } : "skip"
  );

  const allInstitutions = useQuery(
    api.institutions.list,
    isSuperAdmin && query.length >= 2 ? {} : "skip"
  );
  const institutionResults = allInstitutions?.filter((i) =>
    i.name.toLowerCase().includes(query.toLowerCase()) ||
    i.uniqueCode?.toLowerCase().includes(query.toLowerCase()) ||
    i.subcounty?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4) ?? [];

  useEffect(() => { if (!open) setQuery(""); }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function goToSearch() {
    if (query.trim()) {
      navigate(`/learners/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  }

  const hasLearners = (learnerResults?.length ?? 0) > 0;
  const hasInstitutions = institutionResults.length > 0;
  const hasAny = hasLearners || hasInstitutions;
  const isLoading = learnerResults === undefined && query.length >= 2;

  /* ── Mobile: icon-only trigger that expands inline ── */
  return (
    <>
      {/* Desktop search (hidden on mobile) */}
      <div className="relative hidden sm:block flex-1 max-w-sm">
        {!open ? (
          <button
            onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/30 text-muted-foreground text-xs hover:bg-muted/60 hover:border-border/80 transition-colors w-full sm:w-64"
            style={{ boxShadow: "inset 0 1px 3px hsl(220 15% 70% / 0.08)" }}
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1 text-left">
              {isSuperAdmin ? "Search learners, institutions…" : "Search learners…"}
            </span>
            <kbd className="hidden sm:inline-flex items-center rounded border border-border px-1 text-[10px] text-muted-foreground/50">⌘K</kbd>
          </button>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") goToSearch(); }}
              placeholder={isSuperAdmin ? "Name, UPI, institution…" : "Type a name or UPI…"}
              className="w-full sm:w-80 pl-9 pr-8 py-1.5 rounded-md border border-primary/40 bg-card text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
            <button onClick={() => setOpen(false)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Desktop dropdown */}
        {open && query.length >= 2 && (
          <SearchDropdown
            isLoading={isLoading}
            hasAny={hasAny}
            query={query}
            hasInstitutions={hasInstitutions}
            institutionResults={institutionResults}
            hasLearners={hasLearners}
            learnerResults={learnerResults ?? []}
            onClose={() => setOpen(false)}
            onSearch={goToSearch}
            navigate={navigate}
          />
        )}
      </div>

      {/* Mobile: icon button */}
      <button
        className="sm:hidden h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-muted/30 text-muted-foreground hover:bg-muted/60 shrink-0"
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
      >
        <Search className="h-4 w-4" />
      </button>

      {/* Mobile full-screen search overlay */}
      {open && (
        <div className="sm:hidden fixed inset-0 z-50 bg-background flex flex-col">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { goToSearch(); } }}
              placeholder={isSuperAdmin ? "Search learners, institutions…" : "Search learners by name or UPI…"}
              className="flex-1 text-sm text-foreground bg-transparent focus:outline-none placeholder:text-muted-foreground/50"
              autoFocus
            />
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground p-1">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {query.length < 2 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">Type at least 2 characters to search</p>
            ) : (
              <SearchDropdown
                isLoading={isLoading}
                hasAny={hasAny}
                query={query}
                hasInstitutions={hasInstitutions}
                institutionResults={institutionResults}
                hasLearners={hasLearners}
                learnerResults={learnerResults ?? []}
                onClose={() => setOpen(false)}
                onSearch={goToSearch}
                navigate={navigate}
                mobile
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function SearchDropdown({
  isLoading, hasAny, query, hasInstitutions, institutionResults,
  hasLearners, learnerResults, onClose, onSearch, navigate, mobile,
}: {
  isLoading: boolean;
  hasAny: boolean;
  query: string;
  hasInstitutions: boolean;
  institutionResults: any[];
  hasLearners: boolean;
  learnerResults: any[];
  onClose: () => void;
  onSearch: () => void;
  navigate: (path: string) => void;
  mobile?: boolean;
}) {
  const base = mobile
    ? "w-full"
    : "absolute left-0 top-full mt-1.5 w-80 rounded-lg border border-border bg-card shadow-lg z-50 overflow-hidden";

  return (
    <div className={base}>
      {isLoading ? (
        <p className="px-4 py-4 text-sm text-muted-foreground">Searching…</p>
      ) : !hasAny ? (
        <p className="px-4 py-4 text-sm text-muted-foreground">No results found for "{query}"</p>
      ) : (
        <>
          {hasInstitutions && (
            <>
              <div className="px-4 py-2 bg-muted/30 border-b border-border/60">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Institutions</p>
              </div>
              {institutionResults.map((i: any) => (
                <button
                  key={i._id}
                  onClick={() => { navigate(`/institutions/${i._id}`); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/60 text-left transition-colors border-b border-border/30"
                >
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{i.name}</p>
                    <p className="text-xs text-muted-foreground">{i.type} · {i.subcounty}</p>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground/60 shrink-0">{i.uniqueCode}</span>
                </button>
              ))}
            </>
          )}
          {hasLearners && (
            <>
              <div className="px-4 py-2 bg-muted/30 border-b border-border/60">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Learners</p>
              </div>
              {learnerResults.map((l: any) => (
                <button
                  key={l._id}
                  onClick={() => { navigate(`/learners/${l._id}`); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/60 text-left transition-colors border-b border-border/30"
                >
                  <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{l.firstName} {l.lastName}</p>
                    <p className="upi-code text-xs text-primary">{l.upi}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 capitalize">{l.programType}</span>
                </button>
              ))}
              <button
                onClick={onSearch}
                className="w-full px-4 py-3 text-sm text-primary hover:bg-muted/40 text-left border-t border-border transition-colors font-medium"
              >
                See all results for "{query}" →
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

export function Header() {
  const { signOut } = useAuthActions();
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const isSuperAdmin = user?.role === "super_admin";

  const institutionLogoUrl = useQuery(
    api.institutions.getLogoUrl,
    !isSuperAdmin && user?.institutionId
      ? { institutionId: user.institutionId as Id<"institutions"> }
      : "skip"
  );

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const logoSrc = institutionLogoUrl ?? busiaLogo;

  return (
    <header
      className="sticky top-0 z-40 flex h-14 items-center gap-3 px-4 sm:px-6"
      style={{
        background: "hsl(0 0% 100%)",
        borderBottom: "1px solid hsl(220 16% 88%)",
        boxShadow: "0 1px 4px hsl(220 15% 70% / 0.12), 0 2px 12px hsl(220 15% 70% / 0.06)",
      }}
    >
      <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0" />

      {/* Mobile logo — visible only when sidebar is a hidden drawer */}
      <div className="flex sm:hidden items-center gap-2 flex-1 min-w-0">
        <img
          src={logoSrc}
          alt="Logo"
          className="h-8 w-8 object-contain shrink-0"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = busiaLogo; }}
        />
        <span className="font-bold text-sm text-foreground truncate">ECDEAVOTMIS</span>
      </div>

      {/* Desktop search */}
      <GlobalSearch />

      <div className="flex-1 hidden sm:block" />

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile search icon is rendered inside GlobalSearch above */}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 text-sm hover:text-foreground text-foreground/80 transition-colors">
              <div className="h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-bold text-foreground shrink-0">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium leading-none">{user?.fullName ?? user?.name ?? "User"}</p>
                <p className="text-xs text-muted-foreground leading-none mt-0.5">
                  {roleLabel[user?.role ?? ""] ?? ""}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate("/utility/profile")}>
              <User className="h-4 w-4 mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/utility/password")}>
              Change Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
