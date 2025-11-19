import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Check, Save, X } from "lucide-react";
import { useState } from "react";

type Permission = {
  name: string;
  description: string;
  user: boolean;
  moderator: boolean;
  admin: boolean;
};

const defaultPermissions: Permission[] = [
  {
    name: "View Own Portfolio",
    description: "Access and view own portfolio dashboard",
    user: true,
    moderator: true,
    admin: true,
  },
  {
    name: "Edit Own Portfolio",
    description: "Modify own portfolio settings and content",
    user: true,
    moderator: true,
    admin: true,
  },
  {
    name: "Sync GitHub Repos",
    description: "Connect and sync GitHub repositories",
    user: true,
    moderator: true,
    admin: true,
  },
  {
    name: "Publish Portfolio",
    description: "Make portfolio public and accessible via custom URL",
    user: true,
    moderator: true,
    admin: true,
  },
  {
    name: "Custom Domain (Pro)",
    description: "Use custom domain for portfolio",
    user: false,
    moderator: false,
    admin: true,
  },
  {
    name: "View Other Users",
    description: "View other users' profiles and portfolios",
    user: false,
    moderator: true,
    admin: true,
  },
  {
    name: "Moderate Content",
    description: "Flag inappropriate content and portfolios",
    user: false,
    moderator: true,
    admin: true,
  },
  {
    name: "Suspend Users",
    description: "Temporarily suspend user accounts",
    user: false,
    moderator: false,
    admin: true,
  },
  {
    name: "Delete Users",
    description: "Permanently delete user accounts",
    user: false,
    moderator: false,
    admin: true,
  },
  {
    name: "Manage Roles",
    description: "Assign and modify user roles",
    user: false,
    moderator: false,
    admin: true,
  },
  {
    name: "Manage Plans",
    description: "Update user subscription plans",
    user: false,
    moderator: false,
    admin: true,
  },
  {
    name: "View Admin Dashboard",
    description: "Access admin panel and statistics",
    user: false,
    moderator: false,
    admin: true,
  },
  {
    name: "View Activity Logs",
    description: "View audit logs of admin actions",
    user: false,
    moderator: false,
    admin: true,
  },
  {
    name: "System Configuration",
    description: "Modify system settings and configurations",
    user: false,
    moderator: false,
    admin: true,
  },
];

const PermissionIcon = ({ granted }: { granted: boolean }) => {
  return granted ? (
    <div className="flex items-center justify-center">
      <Check className="h-5 w-5 text-green-500" />
    </div>
  ) : (
    <div className="flex items-center justify-center">
      <X className="h-5 w-5 text-muted-foreground/30" />
    </div>
  );
};

export function PermissionsMatrixTab() {
  const [permissions, setPermissions] =
    useState<Permission[]>(defaultPermissions);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const handlePermissionToggle = (
    permissionName: string,
    role: "user" | "moderator" | "admin"
  ) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.name === permissionName ? { ...p, [role]: !p[role] } : p
      )
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    // TODO: Save to backend API
    // For now, just show success message
    toast({
      title: "Permissions Updated",
      description: "Role permissions have been saved successfully.",
    });
    setHasChanges(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setPermissions(defaultPermissions);
    setHasChanges(false);
    setIsEditing(false);
  };
  return (
    <div className="space-y-6">
      {/* Role Descriptions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="secondary">User</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Standard user with access to their own portfolio and basic
              features. Can manage personal content and sync repositories.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="default">Moderator</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Trusted user with content moderation capabilities. Can view other
              users and flag inappropriate content.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="destructive">Admin</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Full system access with user management, role assignment, and
              platform configuration capabilities.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Permissions Matrix */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Permissions Matrix</CardTitle>
              <p className="text-sm text-muted-foreground">
                {isEditing
                  ? "Toggle switches to modify role permissions"
                  : "Overview of permissions granted to each role"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={!hasChanges}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Permissions
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Permission</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">
                    <Badge variant="secondary">User</Badge>
                  </TableHead>
                  <TableHead className="text-center">
                    <Badge variant="default">Moderator</Badge>
                  </TableHead>
                  <TableHead className="text-center">
                    <Badge variant="destructive">Admin</Badge>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((permission) => (
                  <TableRow key={permission.name}>
                    <TableCell className="font-medium">
                      {permission.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {permission.description}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex items-center justify-center">
                          <Switch
                            checked={permission.user}
                            onCheckedChange={() =>
                              handlePermissionToggle(permission.name, "user")
                            }
                          />
                        </div>
                      ) : (
                        <PermissionIcon granted={permission.user} />
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex items-center justify-center">
                          <Switch
                            checked={permission.moderator}
                            onCheckedChange={() =>
                              handlePermissionToggle(
                                permission.name,
                                "moderator"
                              )
                            }
                          />
                        </div>
                      ) : (
                        <PermissionIcon granted={permission.moderator} />
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex items-center justify-center">
                          <Switch
                            checked={permission.admin}
                            onCheckedChange={() =>
                              handlePermissionToggle(permission.name, "admin")
                            }
                          />
                        </div>
                      ) : (
                        <PermissionIcon granted={permission.admin} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            {isEditing ? (
              <>
                <div className="flex items-center gap-2">
                  <Switch checked={true} disabled />
                  <span className="text-sm">Permission Enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={false} disabled />
                  <span className="text-sm">Permission Disabled</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Permission Granted</span>
                </div>
                <div className="flex items-center gap-2">
                  <X className="h-5 w-5 text-muted-foreground/30" />
                  <span className="text-sm">Permission Denied</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
