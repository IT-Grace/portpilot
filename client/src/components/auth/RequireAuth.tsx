import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

interface User {
  id: string;
  handle: string;
  name: string | null;
  email: string | null;
  role: string;
  plan: string;
}

interface RequireAuthProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function RequireAuth({
  children,
  requireAdmin = false,
}: RequireAuthProps) {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!response.ok) {
        setLocation("/admin/login");
        return;
      }

      const data = await response.json();

      // Check if admin is required
      if (requireAdmin && data.role !== "admin") {
        setLocation("/");
        return;
      }

      setUser(data);
      setLoading(false);
    } catch (error) {
      setLocation("/admin/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
