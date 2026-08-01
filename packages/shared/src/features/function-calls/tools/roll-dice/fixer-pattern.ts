// Default pattern used to detect hallucinated dice-roll lines (e.g. from a model that
// ignores the roll_dice tool and writes out a fake result instead) so they can be
// replaced with a real server-side roll. Configurable per chat via
// ChatMetadata.diceRollFixerPattern — this is only the built-in default and fallback.
export const DEFAULT_DICE_ROLL_FIXER_PATTERN = String.raw`([^\n]*?\|\s*Roll:\s*(\d+)\s*\|\s*Result:\s*([A-Z\s]+))`;

/** Whether `source` compiles as a valid RegExp (with the flags the fixer applies). */
export function isValidDiceRollFixerPattern(source: string): boolean {
  try {
    new RegExp(source, "gi");
    return true;
  } catch {
    return false;
  }
}
