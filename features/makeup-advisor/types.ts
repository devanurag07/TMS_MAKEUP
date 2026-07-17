export type MakeupCategory = "lipstick" | "blush" | "eyeshadow";

export type MakeupShadeEntry = {
  prompt: string;
  rgb: number[];
};

export type MakeupPrompts = Record<
  MakeupCategory,
  Record<string, MakeupShadeEntry>
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
