import { Badge } from "@/components/ui/badge";
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
import { Search } from "lucide-react";
import { useState } from "react";

interface AdminAction {
  id: string;
  adminId: string;
  targetUserId: string | null;
  action: string;
  details: Record<string, any> | null;
  ipAddress: string | null;
  createdAt: string;
}

interface ActivityLogTabProps {
  actions: AdminAction[];
  isLoading?: boolean;
}

export function ActivityLogTab({
  actions,
  isLoading = false,
}: ActivityLogTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");

  // Filter actions
  const filteredActions = actions.filter((action) => {
    const matchesSearch =
      action.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.adminId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (action.targetUserId &&
        action.targetUserId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAction =
      actionFilter === "all" || action.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    const actionTypes: Record<string, { label: string; variant: any }> = {
      update_role: { label: "Role Update", variant: "default" },
      update_plan: { label: "Plan Update", variant: "default" },
      suspend_user: { label: "Suspended", variant: "destructive" },
      unsuspend_user: { label: "Unsuspended", variant: "secondary" },
      delete_user: { label: "Deleted", variant: "destructive" },
    };

    const config = actionTypes[action] || {
      label: action,
      variant: "outline",
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatDetails = (details: Record<string, any> | null) => {
    if (!details) return "-";
    return Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by action, admin ID, or target user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Action Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="update_role">Role Update</SelectItem>
            <SelectItem value="update_plan">Plan Update</SelectItem>
            <SelectItem value="suspend_user">Suspend</SelectItem>
            <SelectItem value="unsuspend_user">Unsuspend</SelectItem>
            <SelectItem value="delete_user">Delete</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activity Log Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Admin ID</TableHead>
              <TableHead>Target User</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading activity log...
                </TableCell>
              </TableRow>
            ) : filteredActions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No activity logs found
                </TableCell>
              </TableRow>
            ) : (
              filteredActions.map((action) => (
                <TableRow key={action.id}>
                  <TableCell className="text-sm">
                    {formatDate(action.createdAt)}
                  </TableCell>
                  <TableCell>{getActionBadge(action.action)}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {action.adminId.substring(0, 8)}...
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {action.targetUserId
                      ? `${action.targetUserId.substring(0, 8)}...`
                      : "-"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDetails(action.details)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {action.ipAddress || "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
