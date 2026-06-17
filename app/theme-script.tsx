"use client";

export default function ThemeScript() {
  if (typeof document === "undefined") return null;

  try {
    const stored = localStorage.getItem("himova-theme") as "dark" | "light" | null;
    if (stored === "light") {
      document.documentElement.classList.add("light");
    } else if (stored === "dark") {
      document.documentElement.classList.remove("light");
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      document.documentElement.classList.add("light");
    }
  } catch (e) {
    // Ignore errors
  }

  return null;
}
