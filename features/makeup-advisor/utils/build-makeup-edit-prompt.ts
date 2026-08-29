import makeupPrompts from "../data/makeup_prompts.json";
import type {
  MakeupCategory,
  MakeupPrompts,
  MakeupSelection,
} from "../types";

const prompts = makeupPrompts as MakeupPrompts;

/** Identity-preserving postfix — avoid "facial feature / lips / eyes" wording (Gemini tripwire). */
export const MAKEUP_EDIT_POSTFIX =
  "Keep the face, identity, clothing, and background the same.";

const FALLBACK_BY_CATEGORY: Record<MakeupCategory, (shade: string) => string> =
  {
    lipstick: (shade) => `Apply ${shade} lipstick on her lips`,
    blush: (shade) => `Apply ${shade} blush on her cheeks`,
    eyeshadow: (shade) => `Apply ${shade} eyeshadow on her eyelids`,
  };

/**
 * Resolve a short, imperative catalog edit prompt for a shade.
 * Prefer this over LLM-generated prompts for Fal / Gemini Nano Banana.
 */
export const resolveCatalogMakeupPrompt = (
  category: MakeupCategory,
  shadeName: string
): string => {
  const entry = prompts[category]?.[shadeName];
  if (entry?.prompt?.trim()) return entry.prompt.trim();
  return FALLBACK_BY_CATEGORY[category](shadeName);
};

/**
 * Build one image-edit prompt from selected shades.
 * Imperative, no first person, no fashion fluff, no facial-feature negation.
 */
export const buildMakeupEditPrompt = (
  selections: MakeupSelection[]
): string => {
  if (!selections.length) return MAKEUP_EDIT_POSTFIX;

  const parts = selections.map((selection) =>
    resolveCatalogMakeupPrompt(selection.category, selection.shadeName)
  );

  return `${parts.join(". ")}. ${MAKEUP_EDIT_POSTFIX}`;
};
