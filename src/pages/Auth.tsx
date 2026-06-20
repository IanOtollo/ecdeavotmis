import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function Auth() {
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const navigate = useNavigate();

  // Navigate only after Convex confirms auth is live
  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signIn("password", { email, password, flow: "signIn" });
      // navigation handled by useEffect above once isAuthenticated flips true
    } catch (err: unknown) {
      const msg = (err as Error)?.message ?? "";
      if (msg.includes("Invalid") || msg.includes("credentials") || msg.includes("password")) {
        setError("Incorrect email or password. Please try again.");
      } else if (msg.includes("suspended")) {
        setError("Your account has been suspended. Contact your administrator.");
      } else {
        setError("Sign in failed. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — dark formal brand panel */}
      <div
        className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12"
        style={{ background: "hsl(218 40% 11%)" }}
      >
        <div />

        <div className="space-y-6">
          <div>
            <img
              src="/busia-county-logo.png"
              alt="Busia County"
              className="h-24 w-24 object-contain"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
            <p className="text-xs tracking-[0.2em] uppercase text-white/35 font-light mt-3">Republic of Kenya</p>
            <p className="text-sm font-medium text-white/60">Busia County Government</p>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
            ECDEAVOTMIS
          </h1>
          <p className="text-base text-white/50 leading-relaxed max-w-xs">
            Education &amp; Vocational Training Management Information System — Busia County
          </p>

          <div className="space-y-2.5 text-white/35 text-sm pt-2">
            {[
              "ECDE Centre Registration & Management",
              "Vocational Training Institution Oversight",
              "Learner Enrolment with Unique Identifiers",
              "County-wide Statistics & Reports",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-white/25" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/15 text-xs">
          Department of Education, Busia County — Authorised Personnel Only
        </p>
      </div>

      {/* Right — sign-in area */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-5 py-10 sm:px-8"
        style={{ background: "hsl(220 20% 97%)" }}
      >
        {/* Mobile brand — centered logo + county name */}
        <div className="lg:hidden flex flex-col items-center gap-2 mb-7">
          <img
            src="/busia-county-logo.png"
            alt="Busia County"
            className="h-16 w-16 object-contain"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
          <div className="text-center space-y-0.5">
            <p className="text-[10px] tracking-[0.18em] uppercase text-foreground/35 font-light">Republic of Kenya</p>
            <p className="text-xs font-semibold text-foreground/60">Busia County Government</p>
          </div>
        </div>

        {/* Sign-in card */}
        <div
          className="w-full max-w-sm rounded-2xl bg-white p-7 sm:p-8 space-y-6"
          style={{
            border: "1px solid hsl(220 16% 90%)",
            boxShadow: "0 2px 8px hsl(220 15% 60% / 0.10), 0 10px 36px hsl(220 15% 60% / 0.08)",
          }}
        >
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Sign in</h2>
            <p className="mt-1 text-sm text-muted-foreground">ECDEAVOTMIS — Enter your credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@busia.go.ke"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/40 transition-colors focus:outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10"
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/40 transition-colors focus:outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold bg-foreground text-background transition-opacity disabled:opacity-50 hover:opacity-85 active:opacity-75"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Signing in…" : "Sign In"}
            </button>

            <p className="text-center text-xs text-muted-foreground leading-relaxed">
              Forgot your password?{" "}
              <span className="whitespace-nowrap">Contact your county chief of education to reset it.</span>
            </p>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground/40">
          Authorised personnel only — Busia County Government property
        </p>
      </div>
    </div>
  );
}
