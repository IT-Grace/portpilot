import { CardGridTheme } from "@/components/themes/CardGridTheme";
import { MagazineTheme } from "@/components/themes/MagazineTheme";
import { SleekTheme } from "@/components/themes/SleekTheme";
import { TerminalTheme } from "@/components/themes/TerminalTheme";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { PortfolioModel, ThemeId } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Globe, Loader2 } from "lucide-react";
import { useRoute } from "wouter";

export default function Portfolio() {
  const [, params] = useRoute("/u/:handle/:theme?");
  const handle = params?.handle || "demo";
  const themeParam = (params?.theme as ThemeId) || null;

  // Fetch portfolio data from API
  const {
    data: portfolioData,
    isLoading,
    error,
  } = useQuery<PortfolioModel>({
    queryKey: ["/api/portfolio", handle],
    queryFn: async () => {
      const response = await fetch(`/api/portfolio/${handle}`);
      if (!response.ok) {
        throw new Error("Portfolio not found");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error || !portfolioData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Globe className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Portfolio Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The portfolio "@{handle}" doesn't exist or is not published yet.
            </p>
            <Button
              onClick={() => (window.location.href = "/")}
              data-testid="button-go-home"
            >
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render theme
  const themeComponents: Record<
    ThemeId,
    React.ComponentType<{ data: PortfolioModel }>
  > = {
    sleek: SleekTheme,
    cardgrid: CardGridTheme,
    terminal: TerminalTheme,
    magazine: MagazineTheme,
  };

  const themeId = (themeParam || portfolioData.layout.themeId) as ThemeId;
  const ThemeComponent = themeComponents[themeId];

  return <ThemeComponent data={portfolioData} />;
}
