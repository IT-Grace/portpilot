import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Crown, Github, Globe, Shield } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function SignIn() {
  const [, navigate] = useLocation();
  const [isDevLoading, setIsDevLoading] = useState<string | null>(null);
  const isDevelopment = import.meta.env.DEV;

  const handleGitHubSignIn = () => {
    // TODO: Implement NextAuth GitHub OAuth flow in backend
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
        body: JSON.stringify({ userType }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        if (data.success) {
          console.log(`Logged in as ${data.user.plan} user:`, data.user);
          navigate("/dashboard");
        } else {
          console.error("Dev login failed - no success flag:", data);
          alert(`Development login failed: ${data.error || "Unknown error"}`);
        }
      } else {
        console.error("Dev login failed with status:", response.status, data);
        alert(`Development login failed: ${data.error || "Server error"}`);
      }
    } catch (error) {
      console.error("Dev login error:", error);
      alert(
        `Development login error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
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
