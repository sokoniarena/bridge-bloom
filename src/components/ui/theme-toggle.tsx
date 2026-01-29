import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { isDark, toggle } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={`h-9 w-9 rounded-full ${className || ""}`}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Sun className={`h-4 w-4 transition-all ${isDark ? "rotate-0 scale-100" : "rotate-90 scale-0"} absolute`} />
      <Moon className={`h-4 w-4 transition-all ${isDark ? "-rotate-90 scale-0" : "rotate-0 scale-100"}`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
