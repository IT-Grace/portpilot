import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Crown,
  Shield,
  TrendingUp,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";

interface User {
  id: string;
  plan: "FREE" | "PRO";
  role: "user" | "moderator" | "admin";
  isActive: boolean;
  createdAt: string;
}

interface StatisticsTabProps {
  users: User[];
  isLoading?: boolean;
}

export function StatisticsTab({
  users,
  isLoading = false,
}: StatisticsTabProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading statistics...</p>
      </div>
    );
  }

  // Calculate statistics
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const suspendedUsers = users.filter((u) => !u.isActive).length;
  const freeUsers = users.filter((u) => u.plan === "FREE").length;
  const proUsers = users.filter((u) => u.plan === "PRO").length;
  const adminUsers = users.filter((u) => u.role === "admin").length;
  const moderatorUsers = users.filter((u) => u.role === "moderator").length;
  const regularUsers = users.filter((u) => u.role === "user").length;

  // Calculate growth (last 7 days vs all time)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentUsers = users.filter(
    (u) => new Date(u.createdAt) >= sevenDaysAgo
  ).length;

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Active Users",
      value: activeUsers,
      icon: UserCheck,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Suspended Users",
      value: suspendedUsers,
      icon: UserX,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: "New This Week",
      value: recentUsers,
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  const planStats = [
    {
      title: "Free Plan",
      value: freeUsers,
      percentage: ((freeUsers / totalUsers) * 100).toFixed(1),
      color: "bg-slate-500",
    },
    {
      title: "Pro Plan",
      value: proUsers,
      percentage: ((proUsers / totalUsers) * 100).toFixed(1),
      color: "bg-primary",
    },
  ];

  const roleStats = [
    {
      title: "Regular Users",
      value: regularUsers,
      icon: Shield,
      percentage: ((regularUsers / totalUsers) * 100).toFixed(1),
    },
    {
      title: "Moderators",
      value: moderatorUsers,
      icon: UserCheck,
      percentage: ((moderatorUsers / totalUsers) * 100).toFixed(1),
    },
    {
      title: "Administrators",
      value: adminUsers,
      icon: Crown,
      percentage: ((adminUsers / totalUsers) * 100).toFixed(1),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.title === "New This Week" && (
                  <p className="text-xs text-muted-foreground">Last 7 days</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Plan Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Plan Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {planStats.map((plan) => (
            <div key={plan.title} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{plan.title}</span>
                <span className="text-sm text-muted-foreground">
                  {plan.value} ({plan.percentage}%)
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full ${plan.color}`}
                  style={{ width: `${plan.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Role Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {roleStats.map((role) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.title}
                  className="flex flex-col items-center text-center p-4 border rounded-lg"
                >
                  <Icon className="h-8 w-8 mb-2 text-primary" />
                  <div className="text-2xl font-bold">{role.value}</div>
                  <div className="text-sm text-muted-foreground">
                    {role.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {role.percentage}% of total
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* User Activity Status */}
      <Card>
        <CardHeader>
          <CardTitle>User Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-green-500/5">
              <div className="flex items-center gap-3">
                <UserCheck className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium">Active</div>
                  <div className="text-sm text-muted-foreground">
                    Currently active users
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold">{activeUsers}</div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-red-500/5">
              <div className="flex items-center gap-3">
                <UserX className="h-5 w-5 text-red-500" />
                <div>
                  <div className="font-medium">Suspended</div>
                  <div className="text-sm text-muted-foreground">
                    Suspended accounts
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold">{suspendedUsers}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
