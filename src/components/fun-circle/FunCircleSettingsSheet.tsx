import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Settings, Sun, Moon, Monitor, RotateCcw } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import {
  useFunCircleSettings,
  CHAT_BUBBLE_COLORS,
  STORY_BACKGROUND_COLORS,
  STORY_FONTS,
  STORY_TEXT_COLORS,
} from "@/contexts/FunCircleSettingsContext";

export function FunCircleSettingsSheet() {
  const { mode, setMode } = useTheme();
  const { settings, updateChatSettings, updateStoryStyle, resetSettings } = useFunCircleSettings();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Personalize
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Fun Circle Settings</SheetTitle>
          <SheetDescription>
            Customize your Fun Circle experience
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] pr-4 mt-4">
          <div className="space-y-6">
            {/* Theme Mode */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Appearance</Label>
              <RadioGroup
                value={mode}
                onValueChange={(value) => setMode(value as "light" | "dark" | "system")}
                className="grid grid-cols-3 gap-2"
              >
                <Label
                  htmlFor="light"
                  className="flex flex-col items-center gap-2 rounded-lg border-2 p-3 cursor-pointer hover:bg-accent data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <RadioGroupItem value="light" id="light" className="sr-only" />
                  <Sun className="h-5 w-5" />
                  <span className="text-xs">Light</span>
                </Label>
                <Label
                  htmlFor="dark"
                  className="flex flex-col items-center gap-2 rounded-lg border-2 p-3 cursor-pointer hover:bg-accent data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <RadioGroupItem value="dark" id="dark" className="sr-only" />
                  <Moon className="h-5 w-5" />
                  <span className="text-xs">Dark</span>
                </Label>
                <Label
                  htmlFor="system"
                  className="flex flex-col items-center gap-2 rounded-lg border-2 p-3 cursor-pointer hover:bg-accent data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <RadioGroupItem value="system" id="system" className="sr-only" />
                  <Monitor className="h-5 w-5" />
                  <span className="text-xs">System</span>
                </Label>
              </RadioGroup>
            </div>

            <Separator />

            {/* Chat Bubble Color */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Chat Bubble Color</Label>
              <div className="grid grid-cols-7 gap-2">
                {CHAT_BUBBLE_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => updateChatSettings({ bubbleColor: color.value })}
                    className={`h-8 w-8 rounded-full border-2 transition-all ${
                      settings.chat.bubbleColor === color.value
                        ? "ring-2 ring-offset-2 ring-primary"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Chat Bubble Opacity */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-base font-semibold">Bubble Opacity</Label>
                <span className="text-sm text-muted-foreground">
                  {settings.chat.bubbleOpacity}%
                </span>
              </div>
              <Slider
                value={[settings.chat.bubbleOpacity]}
                onValueChange={([value]) => updateChatSettings({ bubbleOpacity: value })}
                min={50}
                max={100}
                step={5}
              />
            </div>

            <Separator />

            {/* Story Background Colors */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Story Background</Label>
              <div className="grid grid-cols-4 gap-2">
                {STORY_BACKGROUND_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => updateStoryStyle({ backgroundColor: color.value })}
                    className={`h-12 rounded-lg border-2 transition-all text-xs overflow-hidden ${
                      settings.storyStyle.backgroundColor === color.value
                        ? "ring-2 ring-offset-2 ring-primary"
                        : "hover:scale-105"
                    }`}
                    style={{ background: color.value }}
                    title={color.name}
                  >
                    {color.name === "None" && (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Story Font */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Story Font</Label>
              <div className="grid grid-cols-2 gap-2">
                {STORY_FONTS.map((font) => (
                  <button
                    key={font.name}
                    onClick={() => updateStoryStyle({ fontFamily: font.value })}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      settings.storyStyle.fontFamily === font.value
                        ? "border-primary bg-primary/5"
                        : "hover:bg-accent"
                    }`}
                    style={{ fontFamily: font.value }}
                  >
                    <span className="text-sm">{font.name}</span>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      The quick brown fox
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Story Text Color */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Story Text Color</Label>
              <div className="grid grid-cols-5 gap-2">
                {STORY_TEXT_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => updateStoryStyle({ textColor: color.value })}
                    className={`h-10 rounded-lg border-2 flex items-center justify-center transition-all ${
                      settings.storyStyle.textColor === color.value
                        ? "ring-2 ring-offset-2 ring-primary"
                        : "hover:scale-105"
                    }`}
                    title={color.name}
                  >
                    <span
                      className="text-lg font-bold"
                      style={{ color: color.value === "inherit" ? undefined : color.value }}
                    >
                      A
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Reset Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={resetSettings}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
