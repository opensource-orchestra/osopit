"use client";

import { Check, Moon, Palette, Sun } from "lucide-react";
import { getColorThemeOptions } from "@/lib/theme-config";
import { useColorTheme } from "./color-theme-provider";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

const colorThemes = getColorThemeOptions();

export function ThemeSwitcher() {
  const { mode, color, setMode, setColor } = useColorTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex size-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          type="button"
        >
          <Palette className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="space-y-4">
          {/* Mode Toggle */}
          <div>
            <p className="mb-2 font-medium text-md">Mode</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                className={`flex items-center justify-center gap-2 rounded-md border p-2 text-left transition-colors hover:bg-accent ${
                  mode === "light" ? "border-brand bg-accent" : "border-border"
                }`}
                onClick={() => setMode("light")}
                type="button"
              >
                <Sun className="size-4" />
                <span className="text-md">Light</span>
              </button>
              <button
                className={`flex items-center justify-center gap-2 rounded-md border p-2 text-left transition-colors hover:bg-accent ${
                  mode === "dark" ? "border-brand bg-accent" : "border-border"
                }`}
                onClick={() => setMode("dark")}
                type="button"
              >
                <Moon className="size-4" />
                <span className="text-md">Dark</span>
              </button>
            </div>
          </div>

          {/* Color Theme Picker */}
          <div>
            <p className="mb-2 font-medium text-md">Color</p>
            <div className="space-y-1">
              {colorThemes.map((theme) => (
                <button
                  className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-accent"
                  key={theme.color}
                  onClick={() => setColor(theme.color)}
                  type="button"
                >
                  {/* Multi-color preview */}
                  <div
                    className="flex shrink-0 gap-1"
                    data-theme={`${mode}-${theme.color}`}
                  >
                    <div className="size-4 rounded-full bg-brand" />
                    <div className="size-4 rounded-full bg-brand-secondary" />
                    <div className="size-4 rounded-full bg-live" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-md">{theme.label}</div>
                    <div className="text-muted-foreground text-xs">
                      {theme.description}
                    </div>
                  </div>
                  {color === theme.color && (
                    <Check className="size-4 text-brand" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
