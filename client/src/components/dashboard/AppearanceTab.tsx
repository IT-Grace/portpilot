import { CardGridTheme } from "@/components/themes/CardGridTheme";
import { MagazineTheme } from "@/components/themes/MagazineTheme";
import { SleekTheme } from "@/components/themes/SleekTheme";
import { TerminalTheme } from "@/components/themes/TerminalTheme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { themes, type PortfolioModel, type ThemeId } from "@shared/schema";
import { Check, Crown, Eye, GripVertical } from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardData {
  user: {
    name: string | null;
    handle: string;
    plan: string;
  };
  projects: Array<{
    id: string;
    name: string;
    description: string | null;
    language: string | null;
    stars: number;
    forks: number;
    lastUpdated: Date;
    repoUrl?: string;
    homepage?: string;
    topics?: string[];
    selected?: boolean;
  }>;
}

export function AppearanceTab() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>("sleek");
  const [accentColor, setAccentColor] = useState("#3b82f6");
  const [showStats, setShowStats] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [selectedProjects, setSelectedProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch dashboard data to get projects and user info
      const dashboardResponse = await fetch("/api/dashboard", {
        credentials: "include",
      });

      if (dashboardResponse.ok) {
        const data = await dashboardResponse.json();
        setDashboardData(data);

        // Filter selected projects from server data
        const selected = data.projects.filter((p: any) => p.selected === true);
        console.log("Selected projects with analysis data:", selected);
        setSelectedProjects(selected);
      }

      // Fetch current portfolio settings
      const portfolioResponse = await fetch(
        `/api/portfolio/${dashboardData?.user?.handle || "IT-Grace"}`,
        {
          credentials: "include",
        }
      );

      if (portfolioResponse.ok) {
        const portfolioData = await portfolioResponse.json();
        setSelectedTheme(portfolioData.layout?.themeId || "sleek");
        setAccentColor(portfolioData.layout?.accentColor || "#3b82f6");
        setShowStats(portfolioData.layout?.showStats !== false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const accentColors = [
    { name: "Blue", value: "#3b82f6" },
    { name: "Purple", value: "#a855f7" },
    { name: "Green", value: "#10b981" },
    { name: "Orange", value: "#f97316" },
    { name: "Pink", value: "#ec4899" },
    { name: "Teal", value: "#14b8a6" },
  ];

  // Create theme preview components
  const themeComponents: Record<
    ThemeId,
    React.ComponentType<{ data: PortfolioModel }>
  > = {
    sleek: SleekTheme,
    cardgrid: CardGridTheme,
    terminal: TerminalTheme,
    magazine: MagazineTheme,
  };

  // Create preview data for themes
  const createPreviewData = (): PortfolioModel => {
    if (!dashboardData) {
      return {
        user: {
          name: "Loading...",
          handle: "loading",
          avatarUrl: null,
          bio: null,
          location: null,
          website: null,
        },
        projects: [],
        social: {},
        layout: {
          themeId: selectedTheme,
          accentColor,
          showStats,
        },
      };
    }

    return {
      user: {
        name: dashboardData.user.name,
        handle: dashboardData.user.handle,
        avatarUrl: null, // Will be populated from actual user data
        bio: null,
        location: null,
        website: null,
      },
      projects: selectedProjects.slice(0, 3).map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        summary: p.description || `A ${p.language || "code"} project`,
        features: [],
        images: [],
        languages: p.language ? { [p.language]: 100 } : {},
        topics: p.topics || [],
        stars: p.stars,
        forks: p.forks,
        homepage: p.homepage,
        repoUrl: p.repoUrl,
        lastUpdated: p.lastUpdated,
        stack: {},
      })),
      social: {},
      layout: {
        themeId: selectedTheme,
        accentColor,
        showStats,
      },
    };
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/portfolio/theme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          themeId: selectedTheme,
          accentColor,
          showStats,
        }),
      });

      if (response.ok) {
        console.log("Theme saved successfully");
      } else {
        console.error("Failed to save theme");
      }
    } catch (error) {
      console.error("Error saving theme:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-muted-foreground">
          Loading appearance settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Appearance</h1>
        <p className="text-muted-foreground text-lg">
          Customize your portfolio theme and colors
        </p>
      </div>

      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Choose a theme that best showcases your projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {themes.map((theme) => {
              const isLocked =
                theme.isPro && dashboardData?.user?.plan !== "PRO";
              const isSelected = selectedTheme === theme.id;
              const ThemeComponent = themeComponents[theme.id];
              const previewData = {
                ...createPreviewData(),
                layout: {
                  ...createPreviewData().layout,
                  themeId: theme.id,
                },
              };

              return (
                <div key={theme.id} className="relative">
                  <button
                    onClick={() => !isLocked && setSelectedTheme(theme.id)}
                    disabled={isLocked}
                    className={`
                      w-full text-left rounded-lg border-2 transition-all
                      ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover-elevate"
                      }
                      ${
                        isLocked
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }
                    `}
                    data-testid={`button-theme-${theme.id}`}
                  >
                    <div className="aspect-video rounded-t-md overflow-hidden bg-muted relative">
                      <div className="w-full h-full scale-[0.3] origin-top-left transform-gpu">
                        <div className="w-[333%] h-[333%]">
                          <ThemeComponent data={previewData} />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{theme.name}</h3>
                          {theme.isPro && (
                            <Badge variant="secondary" className="gap-1">
                              <Crown className="h-3 w-3" />
                              Pro
                            </Badge>
                          )}
                        </div>
                        {isSelected && (
                          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {theme.description}
                      </p>
                    </div>
                  </button>
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg backdrop-blur-sm">
                      <div className="text-center p-4">
                        <Crown className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="font-medium mb-1">Pro Feature</p>
                        <Button size="sm" variant="default">
                          Upgrade to Pro
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Accent Color */}
      <Card>
        <CardHeader>
          <CardTitle>Accent Color</CardTitle>
          <CardDescription>
            Choose a color that represents your personal brand
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {accentColors.map((color) => {
              const isSelected = accentColor === color.value;
              return (
                <button
                  key={color.value}
                  onClick={() => setAccentColor(color.value)}
                  className={`
                    aspect-square rounded-lg border-2 transition-all hover-elevate
                    ${
                      isSelected
                        ? "border-foreground scale-110"
                        : "border-border"
                    }
                  `}
                  style={{ backgroundColor: color.value }}
                  data-testid={`button-color-${color.name.toLowerCase()}`}
                  title={color.name}
                >
                  {isSelected && (
                    <Check className="h-6 w-6 text-white mx-auto drop-shadow-lg" />
                  )}
                  <span className="sr-only">{color.name}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Display Options */}
      <Card>
        <CardHeader>
          <CardTitle>Display Options</CardTitle>
          <CardDescription>
            Control what information is shown on your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="show-stats" className="text-base font-medium">
                Show Statistics
              </Label>
              <p className="text-sm text-muted-foreground">
                Display star counts, forks, and language breakdowns
              </p>
            </div>
            <Switch
              id="show-stats"
              checked={showStats}
              onCheckedChange={setShowStats}
              data-testid="switch-show-stats"
            />
          </div>
        </CardContent>
      </Card>

      {/* Project Order */}
      <Card>
        <CardHeader>
          <CardTitle>Project Order</CardTitle>
          <CardDescription>
            Drag to reorder how projects appear on your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {selectedProjects.length > 0 ? (
              selectedProjects.map((project, index) => (
                <div
                  key={project.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover-elevate transition-all cursor-move"
                  data-testid={`project-order-${index}`}
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">{project.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {project.description ||
                        `A ${project.language || "code"} project`}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Position {index + 1}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No projects selected</p>
                <p className="text-sm">
                  Go to the Repos tab to select projects for your portfolio
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Live Preview
          </CardTitle>
          <CardDescription>
            See how your portfolio will look with current settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden bg-background">
            <div className="w-full h-96 overflow-hidden">
              <div className="w-full h-full scale-50 origin-top-left transform-gpu">
                <div className="w-[200%] h-[200%]">
                  {(() => {
                    const SelectedThemeComponent =
                      themeComponents[selectedTheme];
                    const previewData = createPreviewData();
                    return <SelectedThemeComponent data={previewData} />;
                  })()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handleSave}
          disabled={saving}
          data-testid="button-save-appearance"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
