"use client";

import { useSyncExternalStore } from "react";
import { MonitorIcon, MoonIcon, SunIcon } from "@/components/Icons";
import { THEME_STORAGE_KEY } from "@/lib/preferences";

type Theme = "system" | "light" | "dark";

const options: { value: Theme; label: string; Icon: typeof SunIcon }[] = [
    { value: "system", label: "System theme", Icon: MonitorIcon },
    { value: "light", label: "Light theme", Icon: SunIcon },
    { value: "dark", label: "Dark theme", Icon: MoonIcon },
];

// <html data-theme> is the source of truth: the inline script in the layout sets
// it before paint and choose() updates it, so the toggle just mirrors it.
function subscribe(onChange: () => void) {
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
}

function getTheme(): Theme {
    const attr = document.documentElement.getAttribute("data-theme");
    return attr === "light" || attr === "dark" ? attr : "system";
}

export default function ThemeToggle() {
    const theme = useSyncExternalStore(subscribe, getTheme, () => "system" as Theme);

    const choose = (next: Theme) => {
        const root = document.documentElement;
        if (next === "system") root.removeAttribute("data-theme");
        else root.setAttribute("data-theme", next);
        try {
            if (next === "system") localStorage.removeItem(THEME_STORAGE_KEY);
            else localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch {
            // Not persisted, still applied for this visit.
        }
    };

    return (
        <div role="group" aria-label="Theme" className="inline-flex rounded-lg border border-line bg-surface p-0.5">
            {options.map(({ value, label, Icon }) => (
                <button
                    key={value}
                    type="button"
                    onClick={() => choose(value)}
                    aria-label={label}
                    aria-pressed={theme === value}
                    title={label}
                    className={`rounded-md p-1.5 transition-colors ${
                        theme === value ? "bg-surface-2 text-fg" : "text-muted hover:text-fg"
                    }`}
                >
                    <Icon width={16} height={16} />
                </button>
            ))}
        </div>
    );
}
