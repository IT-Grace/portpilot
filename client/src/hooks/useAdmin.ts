import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

interface AdminAction {
  id: string;
  adminId: string;
  targetUserId: string | null;
  action: string;
  details: Record<string, any> | null;
  ipAddress: string | null;
  createdAt: string;
}

// Fetch all users
export function useAdminUsers(limit = 50, offset = 0) {
  return useQuery<{ users: User[] }>({
    queryKey: ["admin", "users", limit, offset],
    queryFn: async () => {
      const response = await fetch(
        `/api/admin/users?limit=${limit}&offset=${offset}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      return response.json();
    },
  });
}

// Fetch users by role
export function useAdminUsersByRole(role: "user" | "moderator" | "admin") {
  return useQuery<{ users: User[] }>({
    queryKey: ["admin", "users", "role", role],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users/role/${role}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users by role");
      }

      return response.json();
    },
  });
}

// Update user role
export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: "user" | "moderator" | "admin";
    }) => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update user role");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({
        title: "Role updated",
        description: "User role has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Update user plan
export function useUpdateUserPlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      plan,
    }: {
      userId: string;
      plan: "FREE" | "PRO";
    }) => {
      const response = await fetch(`/api/admin/users/${userId}/plan`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update user plan");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({
        title: "Plan updated",
        description: "User plan has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Toggle user active status
export function useToggleUserActive() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}/toggle-active`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to toggle user status");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({
        title: data.user.isActive ? "User activated" : "User suspended",
        description: data.user.isActive
          ? "User account has been activated"
          : "User account has been suspended",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Delete user
export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete user");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({
        title: "User deleted",
        description: "User has been permanently deleted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Fetch admin action logs
export function useAdminActions(limit = 50, offset = 0) {
  return useQuery<{ actions: AdminAction[] }>({
    queryKey: ["admin", "actions", limit, offset],
    queryFn: async () => {
      const response = await fetch(
        `/api/admin/actions?limit=${limit}&offset=${offset}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch admin actions");
      }

      return response.json();
    },
  });
}
