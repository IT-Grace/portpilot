import { ActivityLogTab } from "@/components/dashboard/admin/ActivityLogTab";
import { PermissionsMatrixTab } from "@/components/dashboard/admin/PermissionsMatrixTab";
import { StatisticsTab } from "@/components/dashboard/admin/StatisticsTab";
import { UsersTab } from "@/components/dashboard/admin/UsersTab";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdminActions,
  useAdminUsers,
  useDeleteUser,
  useToggleUserActive,
  useUpdateUserPlan,
  useUpdateUserRole,
} from "@/hooks/useAdmin";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Crown,
  Lock,
  Shield,
  Users,
} from "lucide-react";

export default function Admin() {
  const { data: usersData, isLoading: usersLoading } = useAdminUsers();
  const { data: actionsData, isLoading: actionsLoading } = useAdminActions();

  const updateRoleMutation = useUpdateUserRole();
  const updatePlanMutation = useUpdateUserPlan();
  const toggleActiveMutation = useToggleUserActive();
  const deleteUserMutation = useDeleteUser();

  const handleUpdateRole = (
    userId: string,
    role: "user" | "moderator" | "admin"
  ) => {
    updateRoleMutation.mutate({ userId, role });
  };

  const handleUpdatePlan = (userId: string, plan: "FREE" | "PRO") => {
    updatePlanMutation.mutate({ userId, plan });
  };

  const handleToggleActive = (userId: string) => {
    toggleActiveMutation.mutate(userId);
  };

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="gap-2 mb-4"
            onClick={() => (window.location.href = "/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage users, permissions, and platform settings
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="statistics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-[800px]">
            <TabsTrigger value="statistics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="permissions" className="gap-2">
              <Lock className="h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-2">
              <Crown className="h-4 w-4" />
              Roles & Plans
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="h-4 w-4" />
              Activity Log
            </TabsTrigger>
          </TabsList>

          {/* Statistics Tab */}
          <TabsContent value="statistics">
            <Card>
              <CardHeader>
                <CardTitle>Platform Statistics</CardTitle>
                <CardDescription>
                  Overview of user metrics and platform activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StatisticsTab
                  users={usersData?.users || []}
                  isLoading={usersLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage all users on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UsersTab
                  users={usersData?.users || []}
                  onUpdateRole={handleUpdateRole}
                  onUpdatePlan={handleUpdatePlan}
                  onToggleActive={handleToggleActive}
                  onDeleteUser={handleDeleteUser}
                  isLoading={usersLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Matrix Tab */}
          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>Permissions Matrix</CardTitle>
                <CardDescription>
                  View role-based permissions and access control
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PermissionsMatrixTab />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles & Plans Tab */}
          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle>Roles & Plans</CardTitle>
                <CardDescription>
                  Manage user roles and subscription plans
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Roles & Plans tab content coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>
                  View all admin actions and system events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityLogTab
                  actions={actionsData?.actions || []}
                  isLoading={actionsLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
