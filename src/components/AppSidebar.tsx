import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  Home, Building2, Users, FileText, Settings, ChevronDown, ChevronRight,
  Shield, AlertTriangle, Database, Banknote, Upload, BookOpen, UserPlus,
  Eye, Search, RefreshCw, Skull, BarChart3, FileBarChart, Key, LogOut,
  UserCog, ClipboardList, User, Map, GraduationCap, Activity, Globe,
} from "lucide-react";
import busiaLogo from "@/assets/busia-county-logo.png";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

type NavItem = { title: string; url: string; icon: React.ElementType };
type NavSection = { key: string; title: string; icon: React.ElementType; items: NavItem[] };

/** County Chief of Education — oversight, county-wide */
function buildSuperAdminNav(): NavSection[] {
  return [
    {
      key: "institutions",
      title: "Institutions",
      icon: Building2,
      items: [
        { title: "All Institutions", url: "/institutions", icon: Globe },
      ],
    },
    {
      key: "learners",
      title: "County Learners",
      icon: GraduationCap,
      items: [
        { title: "Search All Learners", url: "/learners/search", icon: Search },
        { title: "Deceased Register", url: "/learners/deceased", icon: Skull },
        { title: "Transfers Log", url: "/learners/transfer", icon: RefreshCw },
      ],
    },
    {
      key: "reports",
      title: "Reports & Analytics",
      icon: BarChart3,
      items: [
        { title: "Admission Report", url: "/reports/admission", icon: FileBarChart },
        { title: "UPI Register", url: "/reports/upi", icon: FileText },
        { title: "Institution Statistics", url: "/reports/statistics", icon: BarChart3 },
      ],
    },
    {
      key: "admin",
      title: "Administration",
      icon: Shield,
      items: [
        { title: "Manage Users", url: "/admin/users", icon: UserCog },
        { title: "Audit Log", url: "/admin/audit", icon: ClipboardList },
      ],
    },
    {
      key: "utility",
      title: "Utility",
      icon: Settings,
      items: [
        { title: "Profile", url: "/utility/profile", icon: User },
        { title: "Change Password", url: "/utility/password", icon: Key },
      ],
    },
  ];
}

/** Institution staff — operational, single institution */
function buildInstitutionNav(role: string | null | undefined, institutionType: string | null | undefined, institutionName?: string | null): NavSection[] {
  const isAdmin = role === "institution_admin";
  const isEcde  = institutionType !== "Vocational Training";
  const isVt    = institutionType === "Vocational Training";

  const captureItems: NavItem[] = [
    ...(isEcde ? [{ title: "Capture ECDE Learner",       url: "/learners/capture/ecde",       icon: UserPlus }] : []),
    ...(isVt   ? [{ title: "Capture Vocational Learner",  url: "/learners/capture/vocational",  icon: UserPlus }] : []),
  ];

  return [
    {
      key: "institution",
      title: institutionName ? (institutionName.length > 22 ? institutionName.slice(0, 22) + "…" : institutionName) : "My Institution",
      icon: Building2,
      items: [
        { title: "Profile",           url: "/institution/profile",        icon: Building2 },
        { title: "Bio-data",          url: "/institution/bio-data",       icon: FileText },
        { title: "Infrastructure",    url: "/institution/infrastructure",  icon: Database },
        ...(isAdmin ? [
          { title: "Bank Accounts",       url: "/institution/bank",        icon: Banknote },
          { title: "Capitation Receipts", url: "/institution/capitation",  icon: Upload },
          { title: "School Books",        url: "/institution/books",       icon: BookOpen },
        ] : []),
        { title: "Emergency Reporting", url: "/institution/emergency",    icon: AlertTriangle },
      ],
    },
    {
      key: "staff",
      title: "Teaching Staff",
      icon: Users,
      items: [
        { title: "All Staff", url: "/institution/teachers", icon: UserCog },
      ],
    },
    {
      key: "learners",
      title: "Learners",
      icon: GraduationCap,
      items: [
        ...captureItems,
        { title: "View Learners",      url: "/learners/view",      icon: Eye },
        { title: "Search",             url: "/learners/search",    icon: Search },
        { title: "Transfer / Release", url: "/learners/transfer",  icon: RefreshCw },
        { title: "Deceased Learners",  url: "/learners/deceased",  icon: Skull },
      ],
    },
    {
      key: "reports",
      title: "Reports",
      icon: FileText,
      items: [
        { title: "Admission Report", url: "/reports/admission",   icon: FileBarChart },
        { title: "My Learners",      url: "/reports/my-learners", icon: Users },
        { title: "UPI List",         url: "/reports/upi",         icon: FileText },
        { title: "Statistics",       url: "/reports/statistics",  icon: BarChart3 },
      ],
    },
    {
      key: "utility",
      title: "Utility",
      icon: Settings,
      items: [
        { title: "Profile",          url: "/utility/profile",   icon: User },
        { title: "Change Password",  url: "/utility/password",  icon: Key },
      ],
    },
  ];
}

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuthActions();
  const { user } = useCurrentUser();
  const collapsed = state === "collapsed";

  const isSuperAdmin = user?.role === "super_admin";
  const institution  = useQuery(
    api.institutions.getById,
    !isSuperAdmin && user?.institutionId
      ? { institutionId: user.institutionId as Id<"institutions"> }
      : "skip"
  );
  const institutionLogoUrl = useQuery(
    api.institutions.getLogoUrl,
    !isSuperAdmin && user?.institutionId
      ? { institutionId: user.institutionId as Id<"institutions"> }
      : "skip"
  );
  const sections = isSuperAdmin
    ? buildSuperAdminNav()
    : buildInstitutionNav(user?.role, institution?.type, institution?.name);

  const defaultOpen = isSuperAdmin
    ? { institutions: true, learners: false, reports: false, admin: false, utility: false }
    : { institution: true, staff: false, learners: true, reports: false, utility: false };

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(defaultOpen);
  const toggle = (key: string) =>
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  const currentPath = location.pathname;
  const isPathActive = (path: string) =>
    currentPath === path || currentPath.startsWith(path + "/");
  const isGroupActive = (items: NavItem[]) => items.some((i) => isPathActive(i.url));

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="flex flex-col h-full" style={{ background: "hsl(218 55% 14%)" }}>

        {/* Brand */}
        <div className="px-4 py-4 border-b" style={{ borderColor: "hsl(218 45% 20%)" }}>
          {collapsed ? (
            <img
              src={institutionLogoUrl ?? busiaLogo}
              alt={institution?.name ?? "Busia County"}
              className="h-8 w-8 mx-auto object-contain rounded"
            />
          ) : (
            <div className="flex items-center gap-2.5">
              <img
                src={institutionLogoUrl ?? busiaLogo}
                alt={institution?.name ?? "Busia County"}
                className="h-9 w-9 shrink-0 object-contain rounded"
              />
              <p className="font-bold text-sm text-white tracking-wide">ECDEAVOTMIS</p>
            </div>
          )}
        </div>

        {/* Dashboard */}
        <SidebarGroup className="pt-3 pb-1 px-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/dashboard"
                  className={({ isActive: a }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors w-full ${
                      a
                        ? "text-white font-medium"
                        : "hover:bg-white/5"
                    }`
                  }
                  style={({ isActive: a }) =>
                    a ? { background: "hsl(215 84% 45% / 0.3)", color: "hsl(215 84% 80%)" } : { color: "hsl(220 20% 70%)" }
                  }
                >
                  <Home className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{isSuperAdmin ? "County Overview" : "My Dashboard"}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Dynamic sections */}
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-2">
          {sections.map((section) => (
            <Collapsible
              key={section.key}
              open={collapsed ? false : Boolean(openGroups[section.key])}
              onOpenChange={() => !collapsed && toggle(section.key)}
            >
              <CollapsibleTrigger asChild>
                <button
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs transition-colors mt-1 ${
                    isGroupActive(section.items) ? "bg-white/[0.06]" : "hover:bg-white/[0.04]"
                  }`}
                  style={{ color: isGroupActive(section.items) ? "hsl(220 20% 90%)" : "hsl(220 20% 55%)" }}
                >
                  <section.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left font-semibold uppercase tracking-widest text-[10px]">
                        {section.title}
                      </span>
                      {openGroups[section.key]
                        ? <ChevronDown className="h-3 w-3 opacity-40" />
                        : <ChevronRight className="h-3 w-3 opacity-40" />}
                    </>
                  )}
                </button>
              </CollapsibleTrigger>
              {!collapsed && (
                <CollapsibleContent>
                  <div className="pl-3 mt-0.5 space-y-0.5">
                    {section.items.map((item) => (
                      <NavLink
                        key={item.url}
                        to={item.url}
                        className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs transition-colors"
                        style={({ isActive: a }) =>
                          a
                            ? { background: "hsl(215 84% 45% / 0.25)", color: "hsl(215 84% 80%)", fontWeight: 500 }
                            : { color: "hsl(220 20% 55%)" }
                        }
                        onMouseEnter={(e) => {
                          if (!isPathActive(item.url)) {
                            (e.currentTarget as HTMLElement).style.color = "hsl(220 20% 80%)";
                            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isPathActive(item.url)) {
                            (e.currentTarget as HTMLElement).style.color = "hsl(220 20% 55%)";
                            (e.currentTarget as HTMLElement).style.background = "";
                          }
                        }}
                      >
                        <item.icon className="h-3.5 w-3.5 shrink-0" />
                        <span>{item.title}</span>
                      </NavLink>
                    ))}
                  </div>
                </CollapsibleContent>
              )}
            </Collapsible>
          ))}
        </div>

        {/* User info + sign out */}
        <div className="border-t p-3 space-y-1" style={{ borderColor: "hsl(218 45% 20%)" }}>
          {!collapsed && user && (
            <div className="px-3 py-1.5 mb-1">
              <p className="text-xs font-medium text-white/70 truncate">{user.fullName ?? user.email ?? "User"}</p>
              <p className="text-[10px] capitalize" style={{ color: "hsl(215 84% 65%)" }}>
                {user.role?.replace(/_/g, " ")}
              </p>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs transition-colors hover:bg-red-500/10 hover:text-red-400"
            style={{ color: "hsl(220 20% 45%)" }}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
