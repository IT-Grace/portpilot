import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Globe,
  ExternalLink,
  Copy,
  Check,
  Crown,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function PublishingTab() {
  const [isPublic, setIsPublic] = useState(true);
  const [customDomain, setCustomDomain] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const userHandle = "demo"; // TODO: Get from context
  const userPlan = "FREE"; // TODO: Get from context
  const portfolioUrl = `${window.location.origin}/u/${userHandle}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(portfolioUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Portfolio URL copied to clipboard",
    });
  };

  const handleTogglePublic = (checked: boolean) => {
    setIsPublic(checked);
    // TODO: Call API to update portfolio visibility
  };

  const handleSaveCustomDomain = () => {
    // TODO: Call API to save custom domain
    toast({
      title: "Custom domain saved",
      description: "Follow the DNS configuration steps below",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Publishing</h1>
        <p className="text-muted-foreground text-lg">
          Control your portfolio visibility and custom domain
        </p>
      </div>

      {/* Public Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Visibility</CardTitle>
          <CardDescription>
            Control whether your portfolio is publicly accessible
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="public-toggle" className="text-base font-medium">
                Public Portfolio
              </Label>
              <p className="text-sm text-muted-foreground">
                {isPublic 
                  ? "Your portfolio is live and accessible to anyone"
                  : "Your portfolio is private and only visible to you"
                }
              </p>
            </div>
            <Switch
              id="public-toggle"
              checked={isPublic}
              onCheckedChange={handleTogglePublic}
              data-testid="switch-public-portfolio"
            />
          </div>

          {isPublic && (
            <Alert className="bg-chart-2/10 border-chart-2/20">
              <CheckCircle className="h-4 w-4 text-chart-2" />
              <AlertDescription>
                Your portfolio is now live and can be shared with the world!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Portfolio URL */}
      <Card>
        <CardHeader>
          <CardTitle>Your Portfolio URL</CardTitle>
          <CardDescription>
            Share this link to showcase your projects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={portfolioUrl}
              readOnly
              className="font-mono text-sm"
              data-testid="input-portfolio-url"
            />
            <Button
              variant="outline"
              onClick={handleCopyUrl}
              className="gap-2 shrink-0"
              data-testid="button-copy-url"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
            <Button
              variant="default"
              onClick={() => window.open(portfolioUrl, "_blank")}
              className="gap-2 shrink-0"
              data-testid="button-view-portfolio"
            >
              <ExternalLink className="h-4 w-4" />
              View
            </Button>
          </div>

          {isPublic && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4 mt-0.5 text-chart-2" />
              <span>
                Anyone with this link can view your portfolio. Share it on social media,
                in your resume, or with potential employers.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Domain */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              Custom Domain
              <Crown className="h-5 w-5 text-primary" />
            </CardTitle>
            <CardDescription className="mt-1.5">
              Use your own domain for your portfolio (Pro only)
            </CardDescription>
          </div>
          {userPlan !== "PRO" && (
            <Badge variant="secondary" className="gap-1">
              <Crown className="h-3 w-3" />
              Pro
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {userPlan === "PRO" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="custom-domain">Domain Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="custom-domain"
                    placeholder="portfolio.example.com"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    data-testid="input-custom-domain"
                  />
                  <Button
                    onClick={handleSaveCustomDomain}
                    disabled={!customDomain}
                    data-testid="button-save-domain"
                  >
                    Save
                  </Button>
                </div>
              </div>

              {customDomain && (
                <div className="space-y-4 p-4 rounded-lg bg-muted">
                  <h4 className="font-medium">DNS Configuration</h4>
                  <p className="text-sm text-muted-foreground">
                    Add the following DNS records to your domain provider:
                  </p>
                  <div className="space-y-3">
                    <div className="p-3 bg-background rounded-md border border-border">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <p className="font-mono font-medium">CNAME</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Name:</span>
                          <p className="font-mono font-medium">@</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Value:</span>
                          <p className="font-mono font-medium">portpilot.app</p>
                        </div>
                      </div>
                    </div>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        DNS changes can take up to 48 hours to propagate. We'll notify you once
                        your custom domain is active.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Upgrade to Pro</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Connect a custom domain and remove PortPilot branding
              </p>
              <Button className="gap-2" data-testid="button-upgrade-for-domain">
                <Crown className="h-4 w-4" />
                Upgrade to Pro
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SEO & Sharing */}
      <Card>
        <CardHeader>
          <CardTitle>SEO & Social Sharing</CardTitle>
          <CardDescription>
            Automatically optimized for search engines and social media
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-chart-2 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Dynamic OG Images</p>
                <p className="text-sm text-muted-foreground">
                  Beautiful preview images when sharing on social media
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-chart-2 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">SEO Meta Tags</p>
                <p className="text-sm text-muted-foreground">
                  Optimized titles and descriptions for search engines
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-chart-2 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Sitemap & Robots.txt</p>
                <p className="text-sm text-muted-foreground">
                  Automatically generated for better discoverability
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
