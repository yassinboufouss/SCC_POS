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

  const currentTheme = theme || 'light';

  const toggleTheme = () => {
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };
  
  const getIcon = (current: string) => {
      switch (current) {
          case 'dark':
              return <Sun className="h-4 w-4 mr-2" />;
          case 'blue':
              return <Palette className="h-4 w-4 mr-2" />;
          case 'light':
          default:
              return <Moon className="h-4 w-4 mr-2" />;
      }
  };
  
  const getNextThemeName = (current: string) => {
      const currentIndex = themes.indexOf(current);
      const nextIndex = (currentIndex + 1) % themes.length;
      return themes[nextIndex];
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={toggleTheme}
      className="w-full justify-start bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
    >
      {getIcon(currentTheme)}
      {t("switch_to_theme", { theme: t(getNextThemeName(currentTheme) + '_mode') })}
    </Button>
  );
};

export default ThemeToggle;