import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Github,
  Eye,
  Star,
  GitFork,
  ExternalLink,
  Palette,
  Globe,
  TrendingUp,
} from "lucide-react";

export function OverviewTab() {
  // TODO: Fetch real data from API
  const stats = {
    totalProjects: 3,
    totalViews: 0,
    totalStars: 42,
    planName: "Free",
    isPro: false,
  };

  const recentActivity = [
    { type: "sync", message: "Synced 3 repositories", time: "2 hours ago" },
    { type: "theme", message: "Changed theme to Sleek", time: "1 day ago" },
    { type: "publish", message: "Published portfolio", time: "2 days ago" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Welcome back!</h1>
        <p className="text-muted-foreground text-lg">
          Here's an overview of your portfolio
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate transition-all">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Projects
            </CardTitle>
            <Github className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.isPro ? "of 30" : "of 6"} used
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Stars
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalStars}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all repos
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Portfolio Views
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground mt-1">
              This month
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Plan
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.planName}</div>
            <Link href="?tab=billing">
              <button className="text-xs text-primary hover:underline mt-1">
                {stats.isPro ? "Manage subscription" : "Upgrade to Pro"}
              </button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with your portfolio</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Link href="?tab=repos">
            <Button variant="outline" className="w-full gap-2 justify-start" data-testid="button-quick-repos">
              <Github className="h-4 w-4" />
              Add Repositories
            </Button>
          </Link>
          <Link href="?tab=appearance">
            <Button variant="outline" className="w-full gap-2 justify-start" data-testid="button-quick-appearance">
              <Palette className="h-4 w-4" />
              Customize Theme
            </Button>
          </Link>
          <Link href="/u/demo">
            <Button variant="outline" className="w-full gap-2 justify-start" data-testid="button-quick-view">
              <Globe className="h-4 w-4" />
              View Portfolio
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest portfolio updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
