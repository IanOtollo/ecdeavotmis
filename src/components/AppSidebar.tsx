import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Building2,
  Users,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Shield,
  AlertTriangle,
  Database,
  Banknote,
  Upload,
  BookOpen,
  UserPlus,
  Eye,
  Search,
  RefreshCw,
  Skull,
  BarChart3,
  FileBarChart,
  Key,
  LogOut,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const navigationItems = {
  main: [
    {
      title: "Home",
      url: "/dashboard",
      icon: Home,
    },
  ],
  institution: [
    {
      title: "Institution",
      icon: Building2,
      items: [
        { title: "Infrastructure", url: "/institution/infrastructure", icon: Database },
        { title: "Emergency Reporting", url: "/institution/emergency", icon: AlertTriangle },
        { title: "My Institution", url: "/institution/profile", icon: Building2 },
        { title: "Institution Bio-data", url: "/institution/bio-data", icon: FileText },
        { title: "Bank Account", url: "/institution/bank", icon: Banknote },
        { title: "Upload Capitation Receipts", url: "/institution/capitation", icon: Upload },
        { title: "School Books", url: "/institution/books", icon: BookOpen },
      ],
    },
  ],
  learners: [
    {
      title: "Learners (ECDE / Vocational)",
      icon: Users,
      items: [
        { title: "Capture Learners", url: "/learners/capture", icon: UserPlus },
        { title: "Capture Students", url: "/learners/capture-students", icon: UserPlus },
        { title: "View Learners / Students", url: "/learners/view", icon: Eye },
        { title: "Search Learners", url: "/learners/search", icon: Search },
        { title: "Receive / Release Learners", url: "/learners/transfer", icon: RefreshCw },
        { title: "Capture Deceased Learner", url: "/learners/deceased", icon: Skull },
      ],
    },
  ],
  reports: [
    {
      title: "Learner Reports",
      icon: FileText,
      items: [
        { title: "School Admission Report", url: "/reports/admission", icon: BarChart3 },
        { title: "My Learners", url: "/reports/my-learners", icon: FileBarChart },
        { title: "Student UPI Report", url: "/reports/upi", icon: FileBarChart },
      ],
    },
  ],
  utility: [
    {
      title: "Utility",
      icon: Settings,
      items: [
        { title: "Change Password", url: "/utility/password", icon: Key },
        { title: "Logout", url: "/logout", icon: LogOut },
      ],
    },
  ],
};

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    institution: true,
    learners: true,
    reports: true,
    utility: false,
  });

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (path: string) => currentPath === path;
  const isGroupActive = (items: { url: string }[]) => 
    items.some((item) => currentPath === item.url);

  const getNavClassName = (active: boolean) =>
    active
      ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-sidebar">
        {/* Logo/Header */}
        <div className="p-4 border-b border-sidebar-border">
          {!collapsed ? (
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-sidebar-primary" />
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">ECDEAVOTMIS</h1>
                <p className="text-xs text-sidebar-foreground/70">Education Management</p>
              </div>
            </div>
          ) : (
            <Shield className="h-8 w-8 text-sidebar-primary mx-auto" />
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarMenu>
            {navigationItems.main.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink to={item.url} className={getNavClassName(isActive(item.url))}>
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span>{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Institution Section */}
        <SidebarGroup>
          <SidebarMenu>
            {navigationItems.institution.map((section) => (
              <SidebarMenuItem key={section.title}>
                <Collapsible
                  open={openGroups.institution}
                  onOpenChange={() => toggleGroup("institution")}
                >
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={`${getNavClassName(
                        isGroupActive(section.items)
                      )} w-full justify-between`}
                    >
                      <div className="flex items-center">
                        <section.icon className="h-4 w-4" />
                        {!collapsed && <span>{section.title}</span>}
                      </div>
                      {!collapsed && (
                        openGroups.institution ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {!collapsed && (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {section.items.map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton asChild>
                              <NavLink
                                to={item.url}
                                className={getNavClassName(isActive(item.url))}
                              >
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  )}
                </Collapsible>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Learners Section */}
        <SidebarGroup>
          <SidebarMenu>
            {navigationItems.learners.map((section) => (
              <SidebarMenuItem key={section.title}>
                <Collapsible
                  open={openGroups.learners}
                  onOpenChange={() => toggleGroup("learners")}
                >
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={`${getNavClassName(
                        isGroupActive(section.items)
                      )} w-full justify-between`}
                    >
                      <div className="flex items-center">
                        <section.icon className="h-4 w-4" />
                        {!collapsed && <span>{section.title}</span>}
                      </div>
                      {!collapsed && (
                        openGroups.learners ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {!collapsed && (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {section.items.map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton asChild>
                              <NavLink
                                to={item.url}
                                className={getNavClassName(isActive(item.url))}
                              >
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  )}
                </Collapsible>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Reports Section */}
        <SidebarGroup>
          <SidebarMenu>
            {navigationItems.reports.map((section) => (
              <SidebarMenuItem key={section.title}>
                <Collapsible
                  open={openGroups.reports}
                  onOpenChange={() => toggleGroup("reports")}
                >
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={`${getNavClassName(
                        isGroupActive(section.items)
                      )} w-full justify-between`}
                    >
                      <div className="flex items-center">
                        <section.icon className="h-4 w-4" />
                        {!collapsed && <span>{section.title}</span>}
                      </div>
                      {!collapsed && (
                        openGroups.reports ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {!collapsed && (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {section.items.map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton asChild>
                              <NavLink
                                to={item.url}
                                className={getNavClassName(isActive(item.url))}
                              >
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  )}
                </Collapsible>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Utility Section */}
        <SidebarGroup>
          <SidebarMenu>
            {navigationItems.utility.map((section) => (
              <SidebarMenuItem key={section.title}>
                <Collapsible
                  open={openGroups.utility}
                  onOpenChange={() => toggleGroup("utility")}
                >
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={`${getNavClassName(
                        isGroupActive(section.items)
                      )} w-full justify-between`}
                    >
                      <div className="flex items-center">
                        <section.icon className="h-4 w-4" />
                        {!collapsed && <span>{section.title}</span>}
                      </div>
                      {!collapsed && (
                        openGroups.utility ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {!collapsed && (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {section.items.map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton asChild>
                              <NavLink
                                to={item.url}
                                className={getNavClassName(isActive(item.url))}
                              >
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  )}
                </Collapsible>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}