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

  // Determine the theme used for cycling logic. 
  // If the current theme is 'system' or not explicitly set, we treat it as 'light' 
  // to ensure the cycle starts correctly (light -> dark -> blue -> light).
  const cycleTheme = themes.includes(theme || '') ? (theme as string) : 'light';

  const toggleTheme = () => {
    const currentIndex = themes.indexOf(cycleTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };
  
  // Get the icon for the CURRENT theme based on the resolved cycleTheme
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
  
  // Get the name of the NEXT theme based on the cycleTheme
  const getNextThemeName = (current: string) => {
      const currentIndex = themes.indexOf(current);
      const nextIndex = (currentIndex + 1) % themes.length;
      return themes[nextIndex];
  };
  
  const nextThemeKey = getNextThemeName(cycleTheme) + '_mode';

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={toggleTheme}
      className="w-full justify-start bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
    >
      {getCurrentIcon(cycleTheme)}
      {t("switch_to_theme", { theme: t(nextThemeKey) })}
    </Button>
  );
};

export default ThemeToggle;