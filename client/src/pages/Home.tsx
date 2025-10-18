import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Github, Palette, Zap, Globe } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        
        <div className="relative">
          {/* Navigation */}
          <nav className="border-b border-border backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-6 w-6 text-primary" />
                <span className="font-semibold text-xl">PortPilot</span>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" data-testid="link-dashboard">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/signin">
                  <Button data-testid="button-signin">
                    <Github className="h-4 w-4 mr-2" />
                    Sign in with GitHub
                  </Button>
                </Link>
              </div>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
            <div className="text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Auto-generate portfolios from GitHub</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                Transform Your GitHub
                <br />
                <span className="text-primary">Into a Portfolio</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Showcase your best projects with beautiful, customizable themes.
                No coding required—just connect GitHub and publish.
              </p>

              <div className="flex items-center justify-center gap-4 pt-4">
                <Link href="/signin">
                  <Button size="lg" className="gap-2" data-testid="button-get-started">
                    <Github className="h-5 w-5" />
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/u/demo">
                  <Button size="lg" variant="outline" data-testid="link-demo">
                    View Demo Portfolio
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-chart-2" />
                  <span>Free plan: 6 projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-chart-1" />
                  <span>Pro: 30 projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-chart-3" />
                  <span>4 themes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why PortPilot?</h2>
          <p className="text-muted-foreground text-lg">
            Built for developers who want to showcase their work professionally
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="hover-elevate transition-all">
            <CardContent className="p-8">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Github className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Auto-Sync from GitHub</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect your GitHub account and select repositories. We automatically extract
                README content, languages, stars, and images.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all">
            <CardContent className="p-8">
              <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center mb-4">
                <Palette className="h-6 w-6 text-chart-2" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Beautiful Themes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Choose from 4 professionally designed themes: Sleek, CardGrid, Terminal, and
                Magazine. Customize with accent colors.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all">
            <CardContent className="p-8">
              <div className="h-12 w-12 rounded-lg bg-chart-3/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-chart-3" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Publishing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get a public portfolio URL instantly. Pro users can connect custom domains
                with simple DNS configuration.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="bg-gradient-to-br from-primary/10 to-chart-2/10 rounded-2xl p-12 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to showcase your work?</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join developers who trust PortPilot for their portfolios
            </p>
            <Link href="/signin">
              <Button size="lg" className="gap-2" data-testid="button-cta-start">
                <Github className="h-5 w-5" />
                Start Building Your Portfolio
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <span className="font-semibold">PortPilot</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 PortPilot. Auto-generate developer portfolios.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
