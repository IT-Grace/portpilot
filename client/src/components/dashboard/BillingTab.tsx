import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, ExternalLink } from "lucide-react";

export function BillingTab() {
  const currentPlan = "FREE"; // TODO: Get from context
  const isPro = currentPlan === "PRO";

  const features = {
    free: [
      "Up to 6 projects",
      "2 themes (Sleek, CardGrid)",
      "Public portfolio URL",
      "GitHub sync",
      "README parsing",
      "Basic statistics",
    ],
    pro: [
      "Up to 30 projects",
      "All 4 themes",
      "Custom domain",
      "Priority sync",
      "Advanced analytics",
      "Remove PortPilot branding",
      "Priority support",
    ],
  };

  const handleUpgrade = () => {
    // TODO: Redirect to Stripe Checkout
    window.location.href = "/api/billing/checkout";
  };

  const handleManageSubscription = () => {
    // TODO: Redirect to Stripe Customer Portal
    window.location.href = "/api/billing/portal";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Billing & Plans</h1>
        <p className="text-muted-foreground text-lg">
          Choose the plan that fits your needs
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            {isPro 
              ? "You're on the Pro plan with full access to all features"
              : "You're on the Free plan"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                isPro ? "bg-primary/10" : "bg-muted"
              }`}>
                {isPro && <Crown className="h-6 w-6 text-primary" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{currentPlan}</h3>
                  {isPro && (
                    <Badge variant="default" className="gap-1">
                      <Crown className="h-3 w-3" />
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {isPro ? "£9/month • Billed monthly" : "Free forever"}
                </p>
              </div>
            </div>
            {isPro && (
              <Button
                variant="outline"
                onClick={handleManageSubscription}
                data-testid="button-manage-subscription"
                className="gap-2"
              >
                Manage Subscription
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <Card className={!isPro ? "border-2 border-primary" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Free</CardTitle>
              {!isPro && (
                <Badge variant="default">Current</Badge>
              )}
            </div>
            <div className="pt-4">
              <div className="text-4xl font-bold">£0</div>
              <p className="text-muted-foreground mt-1">Forever free</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3">
              {features.free.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-chart-2 shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            {isPro && (
              <Button
                variant="outline"
                className="w-full"
                disabled
              >
                Downgrade to Free
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className={`relative ${isPro ? "border-2 border-primary" : "border-2 border-primary/50"}`}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="gap-1 bg-primary">
              <Crown className="h-3 w-3" />
              Popular
            </Badge>
          </div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Pro
                <Crown className="h-5 w-5 text-primary" />
              </CardTitle>
              {isPro && (
                <Badge variant="default">Current</Badge>
              )}
            </div>
            <div className="pt-4">
              <div className="text-4xl font-bold">£9</div>
              <p className="text-muted-foreground mt-1">Per month</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3">
              {features.pro.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">{feature}</span>
                </li>
              ))}
            </ul>
            {!isPro && (
              <Button
                className="w-full gap-2"
                onClick={handleUpgrade}
                data-testid="button-upgrade-pro"
              >
                <Crown className="h-4 w-4" />
                Upgrade to Pro
              </Button>
            )}
            {isPro && (
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleManageSubscription}
                data-testid="button-manage-pro"
              >
                Manage Subscription
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Can I cancel anytime?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can cancel your Pro subscription at any time. You'll continue to have Pro access
              until the end of your billing period.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">What happens if I downgrade?</h4>
            <p className="text-sm text-muted-foreground">
              If you downgrade to Free, projects beyond the 6-project limit will be hidden from your
              portfolio. You can re-enable them by upgrading again.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">How does custom domain work?</h4>
            <p className="text-sm text-muted-foreground">
              Pro users can connect a custom domain by adding a CNAME record pointing to our servers.
              We provide step-by-step instructions in the Publishing tab.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
