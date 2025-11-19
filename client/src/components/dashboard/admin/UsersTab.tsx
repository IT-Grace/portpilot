import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Crown, Search, Shield, UserCog, UserX } from "lucide-react";
import { useState } from "react";

interface User {
  id: string;
  handle: string;
  name: string;
  email: string;
  plan: "FREE" | "PRO";
  role: "user" | "moderator" | "admin";
  isActive: boolean;
  createdAt: string;
}

interface UsersTabProps {
  users: User[];
  onUpdateRole: (userId: string, role: "user" | "moderator" | "admin") => void;
  onUpdatePlan: (userId: string, plan: "FREE" | "PRO") => void;
  onToggleActive: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  isLoading?: boolean;
}

export function UsersTab({
  users,
  onUpdateRole,
  onUpdatePlan,
  onToggleActive,
  onDeleteUser,
  isLoading = false,
}: UsersTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionDialog, setActionDialog] = useState<
    "role" | "plan" | "delete" | null
  >(null);
  const [pendingRole, setPendingRole] = useState<
    "user" | "moderator" | "admin" | ""
  >("");
  const [pendingPlan, setPendingPlan] = useState<"FREE" | "PRO" | "">("");

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesPlan = planFilter === "all" || user.plan === planFilter;

    return matchesSearch && matchesRole && matchesPlan;
  });

  const handleRoleUpdate = () => {
    if (selectedUser && pendingRole) {
      onUpdateRole(selectedUser.id, pendingRole);
      setActionDialog(null);
      setSelectedUser(null);
      setPendingRole("");
    }
  };

  const handlePlanUpdate = () => {
    if (selectedUser && pendingPlan) {
      onUpdatePlan(selectedUser.id, pendingPlan);
      setActionDialog(null);
      setSelectedUser(null);
      setPendingPlan("");
    }
  };

  const handleDelete = () => {
    if (selectedUser) {
      onDeleteUser(selectedUser.id);
      setActionDialog(null);
      setSelectedUser(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { icon: any; variant: any }> = {
      admin: { icon: Crown, variant: "destructive" as const },
      moderator: { icon: UserCog, variant: "default" as const },
      user: { icon: Shield, variant: "secondary" as const },
    };

    const config = variants[role] || variants.user;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {role}
      </Badge>
    );
  };

  const getPlanBadge = (plan: string) => {
    return (
      <Badge variant={plan === "PRO" ? "default" : "outline"}>
        {plan === "PRO" ? "PRO" : "FREE"}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by handle, name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="FREE">Free</SelectItem>
            <SelectItem value="PRO">Pro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        @{user.handle}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getPlanBadge(user.plan)}</TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge variant="outline" className="bg-green-500/10">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-500/10">
                        Suspended
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setPendingRole(user.role);
                          setActionDialog("role");
                        }}
                      >
                        Edit Role
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setPendingPlan(user.plan);
                          setActionDialog("plan");
                        }}
                      >
                        Edit Plan
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleActive(user.id)}
                      >
                        {user.isActive ? "Suspend" : "Activate"}
                      </Button>
                      {user.role !== "admin" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setActionDialog("delete");
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Role Dialog */}
      <Dialog
        open={actionDialog === "role"}
        onOpenChange={() => setActionDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update User Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUser?.name} (@{selectedUser?.handle})
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={pendingRole}
              onValueChange={(value: "user" | "moderator" | "admin") =>
                setPendingRole(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleRoleUpdate}>Update Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog
        open={actionDialog === "plan"}
        onOpenChange={() => setActionDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update User Plan</DialogTitle>
            <DialogDescription>
              Change the subscription plan for {selectedUser?.name} (@
              {selectedUser?.handle})
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={pendingPlan}
              onValueChange={(value: "FREE" | "PRO") => setPendingPlan(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FREE">Free Plan</SelectItem>
                <SelectItem value="PRO">Pro Plan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handlePlanUpdate}>Update Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog
        open={actionDialog === "delete"}
        onOpenChange={() => setActionDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.name} (@
              {selectedUser?.handle})? This action cannot be undone and will
              permanently delete their portfolio and all projects.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
