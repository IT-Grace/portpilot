import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { themes, type ThemeId } from "@shared/schema";
import { Check, Crown, GripVertical } from "lucide-react";
import dashboardImg from "@assets/generated_images/Developer_dashboard_project_screenshot_971254ae.png";
import ecommerceImg from "@assets/generated_images/E-commerce_mobile_app_screenshot_fcbf7ae1.png";
import terminalImg from "@assets/generated_images/Terminal_CLI_project_screenshot_9b7e9e50.png";

export function AppearanceTab() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>("sleek");
  const [accentColor, setAccentColor] = useState("#3b82f6");
  const [showStats, setShowStats] = useState(true);
  const [saving, setSaving] = useState(false);

  const userPlan = "FREE"; // TODO: Get from context

  const themePreviewImages: Record<ThemeId, string> = {
    sleek: dashboardImg,
    cardgrid: ecommerceImg,
    terminal: terminalImg,
    magazine: dashboardImg,
  };

  const accentColors = [
    { name: "Blue", value: "#3b82f6" },
    { name: "Purple", value: "#a855f7" },
    { name: "Green", value: "#10b981" },
    { name: "Orange", value: "#f97316" },
    { name: "Pink", value: "#ec4899" },
    { name: "Teal", value: "#14b8a6" },
  ];

  const handleSave = async () => {
    setSaving(true);
    // TODO: Call API to save appearance settings
    setTimeout(() => setSaving(false), 1000);
  };

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
              const isLocked = theme.isPro && userPlan !== "PRO";
              const isSelected = selectedTheme === theme.id;

              return (
                <div key={theme.id} className="relative">
                  <button
                    onClick={() => !isLocked && setSelectedTheme(theme.id)}
                    disabled={isLocked}
                    className={`
                      w-full text-left rounded-lg border-2 transition-all
                      ${isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover-elevate"
                      }
                      ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                    `}
                    data-testid={`button-theme-${theme.id}`}
                  >
                    <div className="aspect-video rounded-t-md overflow-hidden bg-muted">
                      <img
                        src={themePreviewImages[theme.id]}
                        alt={theme.name}
                        className="w-full h-full object-cover"
                      />
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
                    ${isSelected ? "border-foreground scale-110" : "border-border"}
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
            {["awesome-react-dashboard", "ecommerce-mobile-app", "cli-tools-collection"].map((project, index) => (
              <div
                key={project}
                className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover-elevate transition-all cursor-move"
                data-testid={`project-order-${index}`}
              >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">{project}</p>
                  <p className="text-sm text-muted-foreground">Position {index + 1}</p>
                </div>
              </div>
            ))}
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
