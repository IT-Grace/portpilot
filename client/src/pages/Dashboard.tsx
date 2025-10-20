import { ThemeToggle } from "@/components/ThemeToggle";
import { AppearanceTab } from "@/components/dashboard/AppearanceTab";
import { BillingTab } from "@/components/dashboard/BillingTab";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { PublishingTab } from "@/components/dashboard/PublishingTab";
import { ReposTab } from "@/components/dashboard/ReposTab";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";

interface CurrentUser {
  id: string;
  name: string | null;
  handle: string;
  email: string | null;
  avatarUrl: string | null;
  plan: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();

    // Check for tab query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    if (
      tabParam &&
      ["overview", "repos", "appearance", "publishing", "billing"].includes(
        tabParam
      )
    ) {
      setActiveTab(tabParam);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/user/me", {
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else if (response.status === 401) {
        // Not authenticated, redirect to sign in
        window.location.href = "/signin";
      } else {
        console.error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Please sign in to continue</div>
      </div>
    );
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);
    window.history.replaceState({}, "", url);
  };

  const handleSignOut = () => {
    // TODO: Implement sign out
    window.location.href = "/api/auth/signout";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            <span className="font-semibold text-xl">PortPilot</span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="gap-2"
                  data-testid="button-user-menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.avatarUrl || undefined}
                      alt={user.name || "User"}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {user.name?.[0] || user.handle?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-block">
                    {user.name || user.handle}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem data-testid="menuitem-profile">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  data-testid="menuitem-signout"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-8"
        >
          <TabsList className="grid w-full grid-cols-5 max-w-3xl">
            <TabsTrigger value="overview" data-testid="tab-overview">
              Overview
            </TabsTrigger>
            <TabsTrigger value="repos" data-testid="tab-repos">
              Repos
            </TabsTrigger>
            <TabsTrigger value="appearance" data-testid="tab-appearance">
              Appearance
            </TabsTrigger>
            <TabsTrigger value="billing" data-testid="tab-billing">
              Billing
            </TabsTrigger>
            <TabsTrigger value="publishing" data-testid="tab-publishing">
              Publishing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="repos" className="space-y-6">
            <ReposTab />
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <AppearanceTab />
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <BillingTab />
          </TabsContent>

          <TabsContent value="publishing" className="space-y-6">
            <PublishingTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
