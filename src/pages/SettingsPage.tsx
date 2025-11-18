import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Sun, Moon, Database, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { showSuccess } from '@/utils/toast';
import { useTranslation } from 'react-i18next';

const SettingsPage = () => {
  const { t } = useTranslation();
  // Placeholder for theme state management (using next-themes is common, but we'll simulate the toggle)
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const handleThemeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    // In a real app, this would update the theme context/storage
    document.documentElement.classList.toggle('dark', checked);
  };
  
  const handleDataReset = () => {
    // In a real application, this would trigger a server-side data wipe/reset.
    console.log("Simulating full application data reset...");
    showSuccess(t("data_reset_success"));
    // Note: Since we are using mock data arrays, a true reset would require reloading the app or re-initializing the mock data.
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Settings className="h-7 w-7" /> {t("application_settings")}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("general_preferences")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-3 border rounded-md">
            <div className="flex items-center gap-3">
              {isDarkMode ? <Moon className="h-5 w-5 text-blue-400" /> : <Sun className="h-5 w-5 text-yellow-500" />}
              <Label htmlFor="dark-mode-toggle" className="text-base">
                {t("dark_mode")}
              </Label>
            </div>
            <Switch
              id="dark-mode-toggle"
              checked={isDarkMode}
              onCheckedChange={handleThemeToggle}
            />
          </div>

          <Separator />

          {/* System Information Placeholder */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{t("system_information")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("app_version")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("last_updated")}
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" /> {t("data_management")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4 p-4 border border-red-300 rounded-md bg-red-50 dark:bg-red-950/50">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-1 shrink-0" />
            <div>
                <p className="font-semibold text-red-600 dark:text-red-400">{t("danger_zone_reset")}</p>
                <p className="text-sm text-muted-foreground mt-1">
                    {t("reset_warning")}
                </p>
            </div>
          </div>
          <Button variant="destructive" onClick={handleDataReset} className="w-full">
            {t("simulate_full_data_reset")}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("user_management")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t("user_management_placeholder")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;