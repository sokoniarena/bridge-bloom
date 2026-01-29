import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFunCircleSettings } from "@/contexts/FunCircleSettingsContext";

export function ThemeToggle() {
  const { settings, updateTheme } = useFunCircleSettings();
  
  const isDark = settings.theme.mode === "dark" || 
    (settings.theme.mode === "system" && 
     window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleTheme = () => {
    updateTheme({ mode: isDark ? "light" : "dark" });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-full"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-primary" />
      ) : (
        <Moon className="h-4 w-4 text-muted-foreground" />
      )}
    </Button>
  );
}
