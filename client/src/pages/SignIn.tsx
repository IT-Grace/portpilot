import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Globe, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function SignIn() {
  const handleGitHubSignIn = () => {
    // TODO: Implement NextAuth GitHub OAuth flow in backend
    window.location.href = "/api/auth/signin/github";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <Link href="/">
            <Button variant="ghost" className="gap-2" data-testid="button-back-home">
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
              Connect your GitHub account to automatically generate your developer portfolio
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
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
