"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const ThemeToggle: React.FC = () => {
  const { t } = useTranslation();
  const { setTheme, theme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={toggleTheme}
      className="w-full justify-start bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 mr-2" />
      ) : (
        <Moon className="h-4 w-4 mr-2" />
      )}
      {t(theme === "dark" ? "light_mode" : "dark_mode")}
    </Button>
  );
};

export default ThemeToggle;