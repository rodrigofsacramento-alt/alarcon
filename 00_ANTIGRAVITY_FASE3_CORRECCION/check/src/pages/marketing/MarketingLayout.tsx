import { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import MarketingDashboard from "./MarketingDashboard";
import MarketingAssets from "./MarketingAssets";
import MarketingPosts from "./MarketingPosts";
import MarketingIntegrations from "./MarketingIntegrations";
export default function MarketingLayout() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const tabs = [{
    name: "Dashboard",
    path: "/marketing"
  }, {
    name: "Mídias",
    path: "/marketing/assets"
  }, {
    name: "Postagens",
    path: "/marketing/posts"
  }, {
    name: "Integrações",
    path: "/marketing/integrations"
  }];
  return <div className="min-h-screen bg-background">
      <Sidebar activeModule="marketing" onModuleChange={() => {}} collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
      <MobileSidebar activeModule="marketing" onModuleChange={() => {}} open={mobileOpen} onOpenChange={setMobileOpen} />

      <div className={cn("transition-all duration-300", sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-64")}>
        <Header title="Marketing" breadcrumbs={[{
        label: "Dashboard",
        href: "/"
      }, {
        label: "Marketing"
      }]} onMobileMenuClick={() => setMobileOpen(true)} />

        <main className="p-4 lg:p-6">
          <div className="flex-1 space-y-4 w-full">
            <div className="border-b border-border">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map(tab => {
                const isActive = location.pathname === tab.path || tab.path === '/marketing' && location.pathname === '/marketing/';
                return <Link key={tab.name} to={tab.path} className={cn(isActive ? "border-accent text-accent font-semibold" : "border-transparent text-muted-foreground hover:border-border hover:text-foreground", "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors")}>
                      {tab.name}
                    </Link>;
              })}
              </nav>
            </div>

            <div className="mt-6">
              <Routes>
                <Route path="/" element=<MarketingDashboard /> />
                <Route path="/assets" element=<MarketingAssets /> />
                <Route path="/posts" element=<MarketingPosts /> />
                <Route path="/integrations" element=<MarketingIntegrations /> />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>;
}