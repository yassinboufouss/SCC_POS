import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Sun, Moon, Database, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { showSuccess } from '@/utils/toast';

const SettingsPage = () => {
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
    showSuccess("Application data reset simulated successfully.");
    // Note: Since we are using mock data arrays, a true reset would require reloading the app or re-initializing the mock data.
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Settings className="h-7 w-7" /> Application Settings
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>General Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-3 border rounded-md">
            <div className="flex items-center gap-3">
              {isDarkMode ? <Moon className="h-5 w-5 text-blue-400" /> : <Sun className="h-5 w-5 text-yellow-500" />}
              <Label htmlFor="dark-mode-toggle" className="text-base">
                Dark Mode
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
            <h3 className="text-lg font-semibold">System Information</h3>
            <p className="text-sm text-muted-foreground">
              Application Version: 1.0.0 (Mock)
            </p>
            <p className="text-sm text-muted-foreground">
              Last Updated: October 2024
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" /> Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4 p-4 border border-red-300 rounded-md bg-red-50 dark:bg-red-950/50">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-1 shrink-0" />
            <div>
                <p className="font-semibold text-red-600 dark:text-red-400">Danger Zone: Reset All Data</p>
                <p className="text-sm text-muted-foreground mt-1">
                    This action will simulate wiping all mock data (members, inventory, transactions, etc.) and restoring the application to its initial state. This cannot be undone.
                </p>
            </div>
          </div>
          <Button variant="destructive" onClick={handleDataReset} className="w-full">
            Simulate Full Data Reset
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>User Management (Admin Only)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Manage user roles, permissions, and access control. (Feature not yet implemented)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;