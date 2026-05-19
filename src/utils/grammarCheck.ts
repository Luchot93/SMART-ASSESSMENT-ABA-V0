/**
 * grammarCheck.ts
 * Calls the LanguageTool public API to detect and auto-correct grammar/typo
 * errors in generated draft text.
 *
 * Strategy:
 *  - Only auto-applies corrections where LanguageTool has exactly ONE replacement
 *    suggestion AND the rule category is GRAMMAR, TYPOS, or PUNCTUATION.
 *  - Style, redundancy, and collocation rules are intentionally skipped to avoid
 *    altering clinical phrasing.
 *  - Falls back to the original text silently on any network/API error.
 */

// ─── LT API types ─────────────────────────────────────────────────────────────

interface LTReplacement {
  value: string;
}

interface LTMatch {
  offset: number;
  length: number;
  message: string;
  replacements: LTReplacement[];
  rule?: {
    id: string;
    category?: { id: string };
  };
}

interface LTResponse {
  matches: LTMatch[];
}

// ─── Categories we auto-fix ───────────────────────────────────────────────────

const AUTO_FIX_CATEGORIES = new Set([
  'GRAMMAR',
  'TYPOS',
  'PUNCTUATION',
  'CASING',
]);

// ─── Public API ───────────────────────────────────────────────────────────────

export interface GrammarCheckResult {
  correctedText: string;
  correctionCount: number;
  /** Human-readable list of what was fixed, for dev/toast display */
  corrections: Array<{ original: string; replacement: string; message: string }>;
}

export async function applyGrammarCorrections(
  text: string,
  signal?: AbortSignal,
): Promise<GrammarCheckResult> {
  const empty: GrammarCheckResult = {
    correctedText: text,
    correctionCount: 0,
    corrections: [],
  };

  try {
    const res = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        text,
        language: 'en-US',
        disabledRules: 'WHITESPACE_RULE',
      }),
      signal,
    });

    if (!res.ok) return empty;

    const data: LTResponse = await res.json();

    // Filter to high-confidence, auto-fixable matches
    const fixable = data.matches.filter((m) => {
      if (m.replacements.length !== 1) return false; // ambiguous — skip
      const cat = m.rule?.category?.id ?? '';
      return AUTO_FIX_CATEGORIES.has(cat);
    });

    if (fixable.length === 0) return empty;

    // Sort descending by offset so we can splice from end → start safely
    const sorted = [...fixable].sort((a, b) => b.offset - a.offset);

    let corrected = text;
    const corrections: GrammarCheckResult['corrections'] = [];

    for (const match of sorted) {
      const original = corrected.slice(match.offset, match.offset + match.length);
      const replacement = match.replacements[0].value;
      corrected =
        corrected.slice(0, match.offset) +
        replacement +
        corrected.slice(match.offset + match.length);
      corrections.push({ original, replacement, message: match.message });
    }

    return {
      correctedText: corrected,
      correctionCount: corrections.length,
      corrections,
    };
  } catch {
    // Network error, rate limit, or aborted — return original unchanged
    return empty;
  }
}
