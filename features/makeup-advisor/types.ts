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
