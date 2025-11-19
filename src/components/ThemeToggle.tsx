"use client";

import * as React from "react";
import { Moon, Sun, Palette } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const themes = ['light', 'dark', 'blue'];

const ThemeToggle: React.FC = () => {
  const { t } = useTranslation();
  const { setTheme, theme } = useTheme();

  // Ensure theme is always a string, defaulting to 'light'
  const currentTheme = theme || 'light';

  const toggleTheme = () => {
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };
  
  // Get the icon for the CURRENT theme
  const getCurrentIcon = (current: string) => {
      switch (current) {
          case 'dark':
              return <Moon className="h-4 w-4 mr-2" />;
          case 'blue':
              return <Palette className="h-4 w-4 mr-2" />;
          case 'light':
          default:
              return <Sun className="h-4 w-4 mr-2" />;
      }
  };
  
  // Get the name of the NEXT theme
  const getNextThemeName = (current: string) => {
      const currentIndex = themes.indexOf(current);
      const nextIndex = (currentIndex + 1) % themes.length;
      return themes[nextIndex];
  };
  
  const nextThemeKey = getNextThemeName(currentTheme) + '_mode';

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={toggleTheme}
      className="w-full justify-start bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
    >
      {getCurrentIcon(currentTheme)}
      {t("switch_to_theme", { theme: t(nextThemeKey) })}
    </Button>
  );
};

export default ThemeToggle;