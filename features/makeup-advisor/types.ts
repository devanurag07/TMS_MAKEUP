export type MakeupCategory = "lipstick" | "blush" | "eyeshadow";

export type MakeupShadeEntry = {
  name: string;
  prompt: string;
  rgb: number[];
};

export type MakeupPrompts = Record<
  MakeupCategory,
  Record<string, MakeupShadeEntry[]>
>;

/** One effect + shade chosen on Custom Look before Proceed */
export type MakeupSelection = {
  category: MakeupCategory;
  shadeName: string;
  prompt: string;
};

/** A single product inside a Look Advisor combo (from backend analysis) */
export type LookComboItem = {
  category: MakeupCategory;
  shadeName: string;
  prompt: string;
  hex: string;
};

/** A complete, coordinated look suggested by the Look Advisor */
export type LookCombo = {
  name: string;
  description: string;
  items: LookComboItem[];
};

export type DesiredMakeupLook =
  | "Natural"
  | "Soft Glam"
  | "Full Glam"
  | "Office"
  | "Party"
  | "Bridal";

export type OutfitColor =
  | "Neutral (Black, White, Grey, Cream)"
  | "Beige (Beige, Tan, Camel, Brown)"
  | "Red (Red, Burgundy, Maroon, Wine)"
  | "Pink (Pink, Rose, Fuchsia)"
  | "Purple (Lavender, Purple, Plum)"
  | "Blue (Sky Blue, Navy, Royal Blue)"
  | "Green (Olive, Emerald, Teal)"
  | "Warm (Yellow, Orange, Gold, Mustard)"
  | "Multicolored";

export type LookAdvisorPreferences = {
  desiredLook: DesiredMakeupLook;
  outfitColor: OutfitColor;
};
