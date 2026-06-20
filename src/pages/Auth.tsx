import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function Auth() {
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
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
      navigate("/dashboard");
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

      {/* Right — sign-in form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2">
            <img src="/busia-county-logo.png" alt="Busia County" className="h-8 w-8 object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
            <span className="font-bold text-foreground">ECDEAVOTMIS</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Sign in</h2>
            <p className="mt-1 text-sm text-muted-foreground">Enter your credentials to access the system</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@busia.go.ke"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/40 transition-colors focus:outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10"
                style={{ boxShadow: "inset 0 1px 3px hsl(220 15% 70% / 0.08)" }}
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/40 transition-colors focus:outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10"
                  style={{ boxShadow: "inset 0 1px 3px hsl(220 15% 70% / 0.08)" }}
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

            <p className="text-center text-xs text-muted-foreground whitespace-nowrap">
              Forgot your password? Contact your county chief of education to reset it.
            </p>
          </form>

          <p className="text-center text-xs text-muted-foreground/40 pt-4 border-t border-border">
            Authorised personnel only — Busia County Government property
          </p>
        </div>
      </div>
    </div>
  );
}
