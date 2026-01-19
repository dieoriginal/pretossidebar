/**
 * Icon Helper
 * Maps icon names to icon components for serialization
 */

import {
  Music,
  CalendarClock,
  ShoppingBag,
  MapPin,
  HandCoins,
  Clapperboard,
  BookOpenText,
  Store,
  Settings,
  LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  Music,
  CalendarClock,
  ShoppingBag,
  MapPin,
  HandCoins,
  Clapperboard,
  BookOpenText,
  Store,
  Settings,
};

/**
 * Get icon component by name
 */
export function getIconByName(name: string): LucideIcon {
  return ICON_MAP[name] || Settings;
}

/**
 * Get icon name by component
 */
export function getIconName(icon: LucideIcon): string {
  for (const [name, IconComponent] of Object.entries(ICON_MAP)) {
    if (icon === IconComponent) {
      return name;
    }
  }
  return "Settings";
}

