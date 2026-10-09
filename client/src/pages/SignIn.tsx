import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Crown, Github, Globe, Shield, UserCog } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function SignIn() {
  useDocumentTitle("Sign in");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isDevLoading, setIsDevLoading] = useState<string | null>(null);
  const [devRole, setDevRole] = useState<"user" | "admin">(
    "user"
  );
  const isDevelopment = import.meta.env.DEV;

  // Set by the GitHub OAuth callback when sign-in fails
  const signInError = new URLSearchParams(window.location.search).get("error");
  const signInErrorMessage =
    signInError === "suspended"
      ? "Your account has been suspended. Please contact support."
      : signInError
      ? "GitHub sign-in didn't complete. Please try again."
      : null;

  const handleGitHubSignIn = () => {
    window.location.href = "/api/auth/signin/github";
  };

  const handleDevLogin = async (userType: "free" | "pro") => {
    setIsDevLoading(userType);
    try {
      const response = await fetch("/api/dev/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userType, role: devRole }),
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        navigate("/dashboard");
      } else {
        console.error("Dev login failed:", response.status, data);
        toast({
          variant: "destructive",
          title: "Development login failed",
          description: data.error || "Please try again.",
        });
      }
    } catch (error) {
      console.error("Dev login error:", error);
      toast({
        variant: "destructive",
        title: "Development login failed",
        description: "Please check the server is running and try again.",
      });
    } finally {
      setIsDevLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <Link href="/">
            <Button
              variant="ghost"
              className="gap-2"
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Sign In Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Globe className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">Welcome to PortPilot</CardTitle>
            <CardDescription className="text-base">
              Connect your GitHub account to automatically generate your
              developer portfolio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {signInErrorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{signInErrorMessage}</AlertDescription>
              </Alert>
            )}

            <Button
              className="w-full gap-2 h-12"
              size="lg"
              onClick={handleGitHubSignIn}
              data-testid="button-github-signin"
            >
              <Github className="h-5 w-5" />
              Continue with GitHub
            </Button>

            {/* Development Login - Only show in development */}
            {isDevelopment && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Development Mode
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">
                    Quick login for testing different plan features
                  </p>

                  {/* Role Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground flex items-center gap-2">
                      <UserCog className="h-3.5 w-3.5" />
                      User Role
                    </label>
                    <Select
                      value={devRole}
                      onValueChange={(value: "user" | "admin") =>
                        setDevRole(value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            <span>User</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4" />
                            <span>Admin</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="gap-2 h-10"
                      onClick={() => handleDevLogin("free")}
                      disabled={isDevLoading !== null}
                      data-testid="button-dev-free-login"
                    >
                      {isDevLoading === "free" ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Shield className="h-4 w-4" />
                      )}
                      Free Plan
                    </Button>

                    <Button
                      variant="outline"
                      className="gap-2 h-10"
                      onClick={() => handleDevLogin("pro")}
                      disabled={isDevLoading !== null}
                      data-testid="button-dev-pro-login"
                    >
                      {isDevLoading === "pro" ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Crown className="h-4 w-4" />
                      )}
                      Pro Plan
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground text-center space-y-1">
                    <p>Free: 6 projects, 2 themes (Sleek, CardGrid)</p>
                    <p>
                      Pro: 30 projects, 4 themes (includes Terminal, Magazine)
                    </p>
                    <p className="pt-1">
                      Role: {devRole} - Admin features:{" "}
                      {devRole === "admin" ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-chart-2" />
                <span>Access to public repositories</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-chart-2" />
                <span>Automatic README parsing</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-chart-2" />
                <span>Free plan with 6 projects</span>
              </div>
            </div>

            <div className="pt-4 text-center">
              <p className="text-xs text-muted-foreground">
                By signing in, you agree to our Terms of Service and Privacy
                Policy
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
