import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ChatSettings {
  bubbleColor: string;
  bubbleOpacity: number;
}

interface StoryStyle {
  backgroundColor: string;
  fontFamily: string;
  textColor: string;
}

interface FunCircleSettings {
  chat: ChatSettings;
  storyStyle: StoryStyle;
}

interface FunCircleSettingsContextType {
  settings: FunCircleSettings;
  updateChatSettings: (chat: Partial<ChatSettings>) => void;
  updateStoryStyle: (style: Partial<StoryStyle>) => void;
  resetSettings: () => void;
}

const defaultSettings: FunCircleSettings = {
  chat: {
    bubbleColor: "hsl(var(--primary))",
    bubbleOpacity: 100,
  },
  storyStyle: {
    backgroundColor: "transparent",
    fontFamily: "Inter",
    textColor: "inherit",
  },
};

const FunCircleSettingsContext = createContext<FunCircleSettingsContextType | null>(null);

export function FunCircleSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<FunCircleSettings>(() => {
    const stored = localStorage.getItem("fun-circle-settings-v2");
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem("fun-circle-settings-v2", JSON.stringify(settings));
  }, [settings]);

  const updateChatSettings = (chat: Partial<ChatSettings>) => {
    setSettings((prev) => ({
      ...prev,
      chat: { ...prev.chat, ...chat },
    }));
  };

  const updateStoryStyle = (style: Partial<StoryStyle>) => {
    setSettings((prev) => ({
      ...prev,
      storyStyle: { ...prev.storyStyle, ...style },
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <FunCircleSettingsContext.Provider
      value={{ settings, updateChatSettings, updateStoryStyle, resetSettings }}
    >
      {children}
    </FunCircleSettingsContext.Provider>
  );
}

export function useFunCircleSettings() {
  const context = useContext(FunCircleSettingsContext);
  if (!context) {
    throw new Error("useFunCircleSettings must be used within FunCircleSettingsProvider");
  }
  return context;
}

// Color and font options
export const CHAT_BUBBLE_COLORS = [
  { name: "Primary", value: "hsl(var(--primary))" },
  { name: "Green", value: "hsl(142, 76%, 36%)" },
  { name: "Blue", value: "hsl(217, 91%, 60%)" },
  { name: "Purple", value: "hsl(262, 83%, 58%)" },
  { name: "Pink", value: "hsl(330, 81%, 60%)" },
  { name: "Orange", value: "hsl(25, 95%, 53%)" },
  { name: "Teal", value: "hsl(173, 80%, 40%)" },
];

export const STORY_BACKGROUND_COLORS = [
  { name: "None", value: "transparent" },
  { name: "White", value: "hsl(0, 0%, 100%)" },
  { name: "Light Gray", value: "hsl(0, 0%, 96%)" },
  { name: "Soft Pink", value: "hsl(330, 100%, 96%)" },
  { name: "Soft Blue", value: "hsl(210, 100%, 96%)" },
  { name: "Soft Green", value: "hsl(142, 76%, 96%)" },
  { name: "Soft Purple", value: "hsl(262, 100%, 96%)" },
  { name: "Soft Yellow", value: "hsl(48, 100%, 96%)" },
  { name: "Dark", value: "hsl(240, 10%, 10%)" },
  { name: "Navy", value: "hsl(220, 50%, 20%)" },
  { name: "Forest", value: "hsl(150, 40%, 20%)" },
  { name: "Wine", value: "hsl(340, 50%, 25%)" },
  { name: "Gradient Pink", value: "linear-gradient(135deg, hsl(330, 80%, 85%), hsl(280, 80%, 85%))" },
  { name: "Gradient Blue", value: "linear-gradient(135deg, hsl(200, 80%, 85%), hsl(240, 80%, 85%))" },
  { name: "Gradient Sunset", value: "linear-gradient(135deg, hsl(30, 100%, 70%), hsl(350, 100%, 70%))" },
  { name: "Gradient Ocean", value: "linear-gradient(135deg, hsl(180, 80%, 60%), hsl(220, 80%, 50%))" },
];

export const STORY_FONTS = [
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Serif", value: "Georgia, serif" },
  { name: "Mono", value: "ui-monospace, monospace" },
  { name: "Comic", value: "'Comic Sans MS', cursive" },
  { name: "Rounded", value: "'Nunito', sans-serif" },
  { name: "Bold", value: "'Oswald', sans-serif" },
  { name: "Elegant", value: "'Playfair Display', serif" },
  { name: "Modern", value: "'Poppins', sans-serif" },
];

export const STORY_TEXT_COLORS = [
  { name: "Default", value: "inherit" },
  { name: "Black", value: "hsl(0, 0%, 0%)" },
  { name: "White", value: "hsl(0, 0%, 100%)" },
  { name: "Gray", value: "hsl(0, 0%, 50%)" },
  { name: "Primary", value: "hsl(var(--primary))" },
  { name: "Blue", value: "hsl(217, 91%, 40%)" },
  { name: "Red", value: "hsl(0, 84%, 50%)" },
  { name: "Green", value: "hsl(142, 76%, 30%)" },
  { name: "Purple", value: "hsl(262, 83%, 50%)" },
];
