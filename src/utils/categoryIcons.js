import React from "react";
import {
  Opacity as OpacityIcon,
  Delete as DeleteIcon,
  Nature as NatureIcon,
  Construction as ConstructionIcon,
  AltRoute as AltRouteIcon,
  Bolt as BoltIcon,
  Domain as DomainIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

/**
 * Normalize category names to a consistent key
 */
export function toKey(name) {
  return (name || "")
    .replace(/[\s&]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

/**
 * Core mapping of normalized category keys to icon and theme colors.
 * bg: soft card background tint
 * color: primary icon color
 */
export const CATEGORY_ICON_MAP = {
  watersupply: {
    Icon: OpacityIcon,
    bg: "#E9F3FF",
    color: "#2F80ED",
  },
  water: {
    Icon: OpacityIcon,
    bg: "#E9F3FF",
    color: "#2F80ED",
  },
  sanitation: {
    Icon: DeleteIcon,
    bg: "#E9F7EF",
    color: "#2D9D65",
  },
  garbage: {
    Icon: DeleteIcon,
    bg: "#E9F7EF",
    color: "#2D9D65",
  },
  environment: {
    Icon: NatureIcon,
    bg: "#ECF8F1",
    color: "#27AE60",
  },
  treeandgreencover: {
    Icon: NatureIcon,
    bg: "#ECF8F1",
    color: "#27AE60",
  },
  construction: {
    Icon: ConstructionIcon,
    bg: "#FFF5E6",
    color: "#F2994A",
  },
  manholerepairing: {
    Icon: ConstructionIcon,
    bg: "#FFF5E6",
    color: "#F2994A",
  },
  roads: {
    Icon: AltRouteIcon,
    bg: "#F1F2F4",
    color: "#4F4F4F",
  },
  roadsandtraffic: {
    Icon: AltRouteIcon,
    bg: "#F1F2F4",
    color: "#4F4F4F",
  },
  electricity: {
    Icon: BoltIcon,
    bg: "#FFF9E6",
    color: "#F2C94C",
  },
  powersupply: {
    Icon: BoltIcon,
    bg: "#FFF9E6",
    color: "#F2C94C",
  },
  other: {
    Icon: DomainIcon,
    bg: "#EEF1F5",
    color: "#7E8A9A",
  },
  others: {
    Icon: DomainIcon,
    bg: "#EEF1F5",
    color: "#7E8A9A",
  },
  default: {
    Icon: DomainIcon,
    bg: "#EEF1F5",
    color: "#7E8A9A",
  },
};

/**
 * Returns { icon: ReactElement, bg, color, classSuffix }
 * icon is pre-colored via sx for easy drop-in.
 */
export function getCategoryVisual(name) {
  const key = toKey(name);
  const entry = CATEGORY_ICON_MAP[key] || CATEGORY_ICON_MAP.default;
  const { Icon, bg, color } = entry;
  return {
    icon: <Icon sx={{ color }} />,
    bg,
    color,
    classSuffix: key,
  };
}

/**
 * Badge icon mapping for Others/Admin/User-added categories.
 * Returns { icon: ReactElement, color } or null
 */
export function getCategoryBadgeIcon(category) {
  if (category && category.isAdminAdded) {
    return { icon: <AdminPanelSettingsIcon sx={{ color: "#F7C948" }} />, color: "#F7C948" };
  }
  if (category && category.isUserAdded) {
    return { icon: <PersonIcon sx={{ color: "#2D9CDB" }} />, color: "#2D9CDB" };
  }
  return null;
}
